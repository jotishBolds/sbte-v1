"use client";
import React from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  FileText,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SideBarLayout from "@/components/sidebar/layout";

enum PaymentStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
}

interface BatchExamFee {
  id: string;
  reason: string;
  examFee: number;
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
  dueDate: string;
  paymentStatus: PaymentStatus;
}

interface BatchFeeDetail {
  batchId: string;
  batchName: string;
  fees: BatchExamFee[];
  totalRemainingFee: number;
}

interface PrefillData {
  name: string;
  email: string;
  contact: string;
}

const BatchExamFees: React.FC = () => {
  const { data: session } = useSession();
  const [batchFees, setBatchFees] = React.useState<BatchFeeDetail[]>([]);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);
  const [error, setError] = React.useState<string | null>(null);
  const [studentId, setStudentId] = React.useState<string | null>(null);
  const [selectedFees, setSelectedFees] = React.useState<string[]>([]);
  const [isPaymentDialogOpen, setIsPaymentDialogOpen] =
    React.useState<boolean>(false);
  const [prefillData, setPrefillData] = React.useState<PrefillData | null>(
    null
  );
  const [isPaymentProcessing, setIsPaymentProcessing] =
    React.useState<boolean>(false);

  // Fetch student ID and prefill data
  React.useEffect(() => {
    const fetchStudentData = async () => {
      try {
        // Fetch student ID
        const studentResponse = await fetch("/api/studentOperations/student");
        if (!studentResponse.ok) {
          const errorData = await studentResponse.json();
          throw new Error(
            errorData.error || "Failed to fetch student information"
          );
        }
        const studentData = await studentResponse.json();
        setStudentId(studentData.id);

        // Fetch prefill data for Razorpay
        const prefillResponse = await fetch("/api/razorpay/studentPrefillData");
        if (!prefillResponse.ok) {
          const errorData = await prefillResponse.json();
          throw new Error(errorData.error || "Failed to fetch prefill data");
        }
        const prefillData = await prefillResponse.json();
        setPrefillData({
          name: prefillData.name,
          email: prefillData.email,
          contact: prefillData.contact,
        });
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch student data"
        );
        setIsLoading(false);
      }
    };

    if (session) {
      fetchStudentData();
    }
  }, [session]);

  // Fetch batch exam fees
  React.useEffect(() => {
    const fetchBatchExamFees = async () => {
      if (!studentId) return;

      try {
        const response = await fetch(
          `/api/studentOperations/${studentId}/batchExamFees`
        );

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch batch exam fees");
        }

        const data = await response.json();
        if (data.fees && Array.isArray(data.fees)) {
          const processedBatchFees = data.fees.map((batch: BatchFeeDetail) => ({
            ...batch,
            totalRemainingFee: batch.fees.reduce(
              (sum: number, fee: BatchExamFee) => {
                const remainingAmount = fee.remainingAmount ?? fee.examFee ?? 0;
                return (
                  sum +
                  (isNaN(Number(remainingAmount)) ? 0 : Number(remainingAmount))
                );
              },
              0
            ),
          }));
          setBatchFees(processedBatchFees);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setIsLoading(false);
      }
    };

    if (studentId) {
      fetchBatchExamFees();
    }
  }, [studentId]);

  const handleFeeSelection = (feeId: string) => {
    setSelectedFees((prev) => {
      // Only allow selection of pending or failed fees
      const selectedFee = batchFees
        .flatMap((batch) => batch.fees)
        .find((fee) => fee.id === feeId);

      if (
        selectedFee &&
        (selectedFee.paymentStatus === PaymentStatus.PENDING ||
          selectedFee.paymentStatus === PaymentStatus.FAILED)
      ) {
        return prev.includes(feeId)
          ? prev.filter((id) => id !== feeId)
          : [...prev, feeId];
      }
      return prev;
    });
  };

  const calculateTotalSelectedFees = (): number => {
    return batchFees
      .flatMap((batch) => batch.fees)
      .filter((fee) => selectedFees.includes(fee.id))
      .reduce((sum, fee) => {
        const amount = fee.remainingAmount ?? fee.examFee ?? 0;
        return sum + (isNaN(Number(amount)) ? 0 : Number(amount));
      }, 0);
  };

  const handlePayment = async () => {
    if (!prefillData) {
      alert("Unable to fetch prefill data. Please try again.");
      return;
    }

    setIsPaymentProcessing(true);
    try {
      // Step 1: Create an order
      const createOrderResponse = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: calculateTotalSelectedFees(),
          currency: "INR",
          studentBatchExamFeeIds: selectedFees,
        }),
      });

      const createOrderData = await createOrderResponse.json();
      if (!createOrderData.success) {
        alert(
          createOrderData.error || "Error creating order. Please try again."
        );
        setIsPaymentProcessing(false);
        return;
      }

      const {
        orderId,
        amount: orderAmount,
        currency,
        paymentId,
      } = createOrderData;

      // Step 2: Open Razorpay Checkout
      const razorpayInstance = new window.Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: orderAmount,
        currency,
        name: "Sikkim Board of Technical Education",
        description: "Exam Fees Payment",
        order_id: orderId,
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          // Step 3: Verify the payment
          const verifyResponse = await fetch("/api/razorpay/verify-payment", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            }),
          });

          const verifyData = await verifyResponse.json();
          if (verifyData.success) {
            // Step 4: Update the payment and status in the database
            const updatePaymentResponse = await fetch(
              "/api/razorpay/update-payment",
              {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  paymentId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  studentBatchExamFeeIds: selectedFees,
                }),
              }
            );

            const updatePaymentData = await updatePaymentResponse.json();
            if (updatePaymentData.success) {
              // Refresh the batch fees data
              const response = await fetch(
                `/api/studentOperations/${studentId}/batchExamFees`
              );
              const data = await response.json();

              const processedBatchFees = data.fees.map(
                (batch: BatchFeeDetail) => ({
                  ...batch,
                  totalRemainingFee: batch.fees.reduce(
                    (sum: number, fee: BatchExamFee) => {
                      const remainingAmount =
                        fee.remainingAmount ?? fee.examFee ?? 0;
                      return (
                        sum +
                        (isNaN(Number(remainingAmount))
                          ? 0
                          : Number(remainingAmount))
                      );
                    },
                    0
                  ),
                })
              );

              setBatchFees(processedBatchFees);
              setSelectedFees([]);
              setIsPaymentDialogOpen(false);
              alert("Payment successful and verified!");
            } else {
              alert("Failed to update payment data.");
            }
          } else {
            alert("Payment verification failed.");
          }
        },
        prefill: {
          name: prefillData.name,
          email: prefillData.email,
          contact: prefillData.contact,
        },
        theme: {
          color: "#262523",
        },
      });

      razorpayInstance.open();
    } catch (error) {
      alert("An error occurred. Please try again.");
    } finally {
      setIsPaymentProcessing(false);
    }
  };

  const handleRetryPayment = async (feeId: string) => {
    setSelectedFees([feeId]);
    setIsPaymentDialogOpen(true);
  };

  // Status color and icon mapping
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.COMPLETED:
        return {
          variant: "outline",
          icon: <CheckCircle2 className="mr-1 h-3 w-3 text-green-500" />,
          text: "Completed",
        };
      case PaymentStatus.FAILED:
        return {
          variant: "destructive",
          icon: <AlertTriangle className="mr-1 h-3 w-3 text-red-500" />,
          text: "Failed",
        };
      default:
        return {
          variant: "secondary",
          icon: null,
          text: "Pending",
        };
    }
  };

  if (error === "Unauthorized" || error === "Forbidden") {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Access Denied</AlertTitle>
        <AlertDescription>
          You don&apos;t have permission to view batch exam fees.
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <SideBarLayout>
      <Card className="w-full max-w-7xl mx-auto mt-2 md:mt-8">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-2xl font-bold">Exam Fees</CardTitle>
          <Button
            variant={selectedFees.length > 0 ? "default" : "outline"}
            disabled={selectedFees.length === 0 || isPaymentProcessing}
            onClick={() => setIsPaymentDialogOpen(true)}
          >
            Pay Selected Fees
            <CreditCard className="ml-2 h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : batchFees.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg text-gray-500">
                No batch exam fees found
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {batchFees.map((batchFee) => (
                <div
                  key={batchFee.batchId}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">
                      {batchFee.batchName}
                    </h3>
                    <Badge variant="secondary">
                      Total Remaining: ₹
                      {(batchFee.totalRemainingFee || 0).toLocaleString()}
                    </Badge>
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[50px]">Select</TableHead>
                          <TableHead>Reason</TableHead>
                          <TableHead className="text-right">
                            Remaining Fee
                          </TableHead>
                          <TableHead className="hidden md:table-cell text-right">
                            Due Date
                          </TableHead>
                          <TableHead className="hidden lg:table-cell text-right">
                            Status
                          </TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {batchFee.fees.map((fee) => {
                          const statusBadge = getStatusBadge(fee.paymentStatus);
                          const isSelectable =
                            fee.paymentStatus === PaymentStatus.PENDING ||
                            fee.paymentStatus === PaymentStatus.FAILED;
                          const isCompleted =
                            fee.paymentStatus === PaymentStatus.COMPLETED;

                          return (
                            <TableRow
                              key={fee.id}
                              className={`
                                ${
                                  isSelectable
                                    ? "cursor-pointer hover:bg-gray-50"
                                    : "opacity-60"
                                }
                              `}
                            >
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={selectedFees.includes(fee.id)}
                                  onChange={() => handleFeeSelection(fee.id)}
                                  disabled={!isSelectable}
                                  className={`
                                    rounded focus:ring-2 
                                    ${
                                      isSelectable
                                        ? "focus:ring-green-500"
                                        : "cursor-not-allowed opacity-50"
                                    }
                                  `}
                                />
                              </TableCell>
                              <TableCell
                                className="font-medium"
                                onClick={() => handleFeeSelection(fee.id)}
                              >
                                {fee.reason}
                                <Badge
                                  variant={statusBadge.variant as any}
                                  className="ml-2"
                                >
                                  {statusBadge.icon}
                                  {statusBadge.text}
                                </Badge>
                              </TableCell>
                              <TableCell
                                className={`text-right 
    ${
      isCompleted
        ? "text-green-500"
        : fee.paymentStatus === PaymentStatus.FAILED
        ? "text-red-500"
        : "text-green-500"
    }
  `}
                                onClick={() => handleFeeSelection(fee.id)}
                              >
                                ₹
                                {(
                                  fee.remainingAmount ??
                                  fee.examFee ??
                                  0
                                ).toLocaleString()}
                              </TableCell>
                              <TableCell
                                className="hidden md:table-cell text-right"
                                onClick={() => handleFeeSelection(fee.id)}
                              >
                                {new Date(fee.dueDate).toLocaleDateString()}
                              </TableCell>
                              <TableCell
                                className="hidden lg:table-cell text-right text-sm"
                                onClick={() => handleFeeSelection(fee.id)}
                              >
                                {fee.paymentStatus}
                              </TableCell>
                              <TableCell className="text-right">
                                {fee.paymentStatus === PaymentStatus.FAILED && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleRetryPayment(fee.id)}
                                  >
                                    <RefreshCw className="mr-1 h-3 w-3" />
                                    Retry
                                  </Button>
                                )}
                                {isCompleted && (
                                  <Badge
                                    variant="outline"
                                    className="text-green-500"
                                  >
                                    Paid
                                  </Badge>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>

        <Dialog
          open={isPaymentDialogOpen}
          onOpenChange={setIsPaymentDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Payment</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <p>
                Total selected remaining fees: ₹
                {(() => {
                  const total = calculateTotalSelectedFees();
                  return isNaN(total) ? "0" : total.toLocaleString();
                })()}
              </p>
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsPaymentDialogOpen(false)}
                  disabled={isPaymentProcessing}
                >
                  Cancel
                </Button>
                <Button onClick={handlePayment} disabled={isPaymentProcessing}>
                  {isPaymentProcessing ? "Processing..." : "Proceed to Payment"}
                  <CreditCard className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </SideBarLayout>
  );
};

export default BatchExamFees;
