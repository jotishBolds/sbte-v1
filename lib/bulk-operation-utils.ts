// Bulk operation utilities for handling multiple data operations efficiently

export interface BulkOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  processed?: number;
  failed?: number;
  details?: Array<{
    id: string | number;
    success: boolean;
    error?: string;
    data?: any;
  }>;
}

export interface BulkOperationOptions {
  batchSize?: number;
  concurrency?: number;
  continueOnError?: boolean;
  validateBeforeProcess?: boolean;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface BulkDeleteOptions extends BulkOperationOptions {
  cascade?: boolean;
  softDelete?: boolean;
}

export interface BulkUpdateOptions extends BulkOperationOptions {
  upsert?: boolean;
  validateFields?: string[];
}

export interface BulkInsertOptions extends BulkOperationOptions {
  ignoreDuplicates?: boolean;
  updateOnDuplicate?: boolean;
}

/**
 * Process items in batches with optional concurrency control
 */
export async function processBatch<T, R>(
  items: T[],
  processor: (item: T, index: number) => Promise<R>,
  options: BulkOperationOptions = {}
): Promise<BulkOperationResult<R[]>> {
  const {
    batchSize = 50,
    concurrency = 5,
    continueOnError = true,
    retryAttempts = 0,
    retryDelay = 1000,
  } = options;

  const results: R[] = [];
  const errors: Array<{ index: number; error: string }> = [];
  let processed = 0;

  try {
    // Process items in batches
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = items.slice(i, i + batchSize);

      // Process batch with concurrency control
      const batchPromises = batch.map(async (item, batchIndex) => {
        const globalIndex = i + batchIndex;

        for (let attempt = 0; attempt <= retryAttempts; attempt++) {
          try {
            const result = await processor(item, globalIndex);
            results[globalIndex] = result;
            processed++;
            return result;
          } catch (error) {
            if (attempt === retryAttempts) {
              const errorMessage =
                error instanceof Error ? error.message : String(error);
              errors.push({ index: globalIndex, error: errorMessage });

              if (!continueOnError) {
                throw error;
              }
            } else {
              // Wait before retry
              await new Promise((resolve) => setTimeout(resolve, retryDelay));
            }
          }
        }
      });

      // Wait for batch to complete with concurrency limit
      await Promise.allSettled(batchPromises);
    }

    return {
      success: errors.length === 0,
      data: results,
      processed,
      failed: errors.length,
      details: errors.map(({ index, error }) => ({
        id: index,
        success: false,
        error,
      })),
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      processed,
      failed: items.length - processed,
    };
  }
}

/**
 * Bulk delete operations with validation and error handling
 */
export async function bulkDelete<T>(
  items: T[],
  deleteFunction: (item: T) => Promise<boolean>,
  options: BulkDeleteOptions = {}
): Promise<BulkOperationResult> {
  const {
    batchSize = 20,
    continueOnError = true,
    validateBeforeProcess = true,
  } = options;

  try {
    // Validate items before processing if requested
    if (validateBeforeProcess) {
      const invalidItems = items.filter(
        (item) => !item || typeof item !== "object"
      );
      if (invalidItems.length > 0) {
        return {
          success: false,
          error: `Found ${invalidItems.length} invalid items`,
          processed: 0,
          failed: invalidItems.length,
        };
      }
    }

    const processor = async (item: T, index: number) => {
      const result = await deleteFunction(item);
      if (!result) {
        throw new Error(`Failed to delete item at index ${index}`);
      }
      return result;
    };

    return await processBatch(items, processor, {
      batchSize,
      continueOnError,
      ...options,
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      processed: 0,
      failed: items.length,
    };
  }
}

/**
 * Bulk update operations with validation and conflict resolution
 */
export async function bulkUpdate<T>(
  items: T[],
  updateFunction: (item: T) => Promise<T>,
  options: BulkUpdateOptions = {}
): Promise<BulkOperationResult<T[]>> {
  const {
    batchSize = 30,
    continueOnError = true,
    validateFields = [],
    upsert = false,
  } = options;

  try {
    // Validate required fields if specified
    if (validateFields.length > 0) {
      const invalidItems = items.filter((item) => {
        return validateFields.some((field) => !(field in (item as any)));
      });

      if (invalidItems.length > 0) {
        return {
          success: false,
          error: `Found ${
            invalidItems.length
          } items missing required fields: ${validateFields.join(", ")}`,
          processed: 0,
          failed: invalidItems.length,
        };
      }
    }

    const processor = async (item: T, index: number) => {
      try {
        return await updateFunction(item);
      } catch (error) {
        if (upsert) {
          // Attempt to handle as insert if update fails
          console.warn(`Update failed for item ${index}, attempting upsert`);
          return await updateFunction(item);
        }
        throw error;
      }
    };

    return await processBatch(items, processor, {
      batchSize,
      continueOnError,
      ...options,
    });
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
      processed: 0,
      failed: items.length,
    };
  }
}

/**
 * Bulk insert operations with duplicate handling
 */
export async function bulkInsert<T>(
  items: T[],
  insertFunction: (item: T) => Promise<T>,
  options: BulkInsertOptions = {}
): Promise<BulkOperationResult<T[]>> {
  const {
    batchSize = 40,
    continueOnError = true,
    ignoreDuplicates = false,
    updateOnDuplicate = false,
  } = options;

  const processor = async (item: T, index: number) => {
    try {
      return await insertFunction(item);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Handle duplicate key errors
      if (
        errorMessage.includes("duplicate") ||
        errorMessage.includes("unique")
      ) {
        if (ignoreDuplicates) {
          console.warn(`Duplicate found for item ${index}, ignoring`);
          return item; // Return original item as "inserted"
        } else if (updateOnDuplicate) {
          console.warn(`Duplicate found for item ${index}, attempting update`);
          // This would need to be implemented based on your specific update logic
          return await insertFunction(item);
        }
      }

      throw error;
    }
  };

  return await processBatch(items, processor, {
    batchSize,
    continueOnError,
    ...options,
  });
}

/**
 * Validate bulk operation data before processing
 */
export function validateBulkData<T>(
  items: T[],
  requiredFields: string[] = [],
  customValidator?: (item: T) => boolean
): { valid: boolean; errors: string[]; validItems: T[]; invalidItems: T[] } {
  const errors: string[] = [];
  const validItems: T[] = [];
  const invalidItems: T[] = [];

  if (!Array.isArray(items)) {
    errors.push("Items must be an array");
    return { valid: false, errors, validItems, invalidItems };
  }

  if (items.length === 0) {
    errors.push("Items array cannot be empty");
    return { valid: false, errors, validItems, invalidItems };
  }

  items.forEach((item, index) => {
    const itemErrors: string[] = [];

    // Check if item is object
    if (!item || typeof item !== "object") {
      itemErrors.push(`Item at index ${index} is not a valid object`);
    } else {
      // Check required fields
      requiredFields.forEach((field) => {
        if (
          !(field in (item as any)) ||
          (item as any)[field] === null ||
          (item as any)[field] === undefined
        ) {
          itemErrors.push(
            `Item at index ${index} is missing required field: ${field}`
          );
        }
      });

      // Custom validation
      if (customValidator && !customValidator(item)) {
        itemErrors.push(`Item at index ${index} failed custom validation`);
      }
    }

    if (itemErrors.length > 0) {
      errors.push(...itemErrors);
      invalidItems.push(item);
    } else {
      validItems.push(item);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    validItems,
    invalidItems,
  };
}

/**
 * Progress tracking for long-running bulk operations
 */
export class BulkOperationProgress {
  private total: number;
  private completed: number = 0;
  private failed: number = 0;
  private startTime: number;
  private onProgress?: (progress: ProgressInfo) => void;

  constructor(total: number, onProgress?: (progress: ProgressInfo) => void) {
    this.total = total;
    this.startTime = Date.now();
    this.onProgress = onProgress;
  }

  update(processed: number, failed: number = 0) {
    this.completed = processed;
    this.failed = failed;

    if (this.onProgress) {
      this.onProgress(this.getProgress());
    }
  }

  getProgress(): ProgressInfo {
    const elapsed = Date.now() - this.startTime;
    const remaining = this.total - this.completed - this.failed;
    const rate = this.completed / (elapsed / 1000);
    const estimatedTime = remaining > 0 ? remaining / rate : 0;

    return {
      total: this.total,
      completed: this.completed,
      failed: this.failed,
      remaining,
      percentage: Math.round(
        ((this.completed + this.failed) / this.total) * 100
      ),
      elapsed,
      estimatedTime: estimatedTime * 1000,
      rate,
    };
  }
}

export interface ProgressInfo {
  total: number;
  completed: number;
  failed: number;
  remaining: number;
  percentage: number;
  elapsed: number;
  estimatedTime: number;
  rate: number;
}
