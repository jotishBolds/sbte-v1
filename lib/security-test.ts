// Security Testing and Validation Utilities
// This file helps test and validate security implementations

export const securityTests = {
  // Test input validation
  testInputValidation: () => {
    const testCases = [
      // XSS attempts
      '<script>alert("xss")</script>',
      'javascript:alert("xss")',
      '<img src=x onerror=alert("xss")>',
      'onload=alert("xss")',

      // SQL injection attempts
      "'; DROP TABLE users; --",
      "1' OR '1'='1",
      "admin'--",
      "' UNION SELECT * FROM users --",

      // Command injection
      "; rm -rf /",
      "| cat /etc/passwd",
      "&& whoami",

      // Path traversal
      "../../../etc/passwd",
      "..\\..\\..\\windows\\system32",

      // Long strings to test length limits
      "A".repeat(1001), // Should exceed most length limits
      "A".repeat(10001), // Should exceed all length limits
    ];

    return testCases;
  },

  // Test rate limiting
  testRateLimit: async (url: string, maxRequests: number = 10) => {
    const results = [];

    for (let i = 0; i < maxRequests + 5; i++) {
      try {
        const response = await fetch(url, {
          method: "GET",
          headers: {
            "X-Test-Request": `rate-limit-test-${i}`,
          },
        });

        results.push({
          request: i + 1,
          status: response.status,
          headers: Object.fromEntries(response.headers.entries()),
        });
      } catch (error) {
        results.push({
          request: i + 1,
          error: (error as Error).message,
        });
      }
    }

    return results;
  },

  // Test security headers
  testSecurityHeaders: async (url: string) => {
    try {
      const response = await fetch(url);
      const headers = Object.fromEntries(response.headers.entries());

      const expectedHeaders = [
        "x-frame-options",
        "x-content-type-options",
        "x-xss-protection",
        "referrer-policy",
        "content-security-policy",
        "permissions-policy",
      ];

      const headerStatus = expectedHeaders.map((header) => ({
        header,
        present: header in headers,
        value: headers[header] || "Not set",
      }));

      const vulnerableHeaders = ["x-powered-by", "server"];

      const vulnerableHeaderStatus = vulnerableHeaders.map((header) => ({
        header,
        exposed: header in headers,
        value: headers[header] || "Not exposed (Good)",
      }));

      return {
        securityHeaders: headerStatus,
        vulnerableHeaders: vulnerableHeaderStatus,
        allHeaders: headers,
      };
    } catch (error) {
      return {
        error: (error as Error).message,
      };
    }
  },

  // Test HTTP methods
  testHttpMethods: async (url: string) => {
    const methods = [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "PATCH",
      "HEAD",
      "OPTIONS",
      "TRACE",
    ];
    const results = [];

    for (const method of methods) {
      try {
        const response = await fetch(url, { method });
        results.push({
          method,
          status: response.status,
          allowed: response.status !== 405,
        });
      } catch (error) {
        results.push({
          method,
          error: (error as Error).message,
        });
      }
    }

    return results;
  },

  // Generate security report
  generateSecurityReport: async (baseUrl: string) => {
    const testUrls = [
      `${baseUrl}/`,
      `${baseUrl}/dashboard`,
      `${baseUrl}/api/profile`,
      `${baseUrl}/api/auth/signin`,
    ];

    const report = {
      timestamp: new Date().toISOString(),
      baseUrl,
      tests: {} as any,
    };

    for (const url of testUrls) {
      try {
        report.tests[url] = {
          securityHeaders: await securityTests.testSecurityHeaders(url),
          httpMethods: await securityTests.testHttpMethods(url),
        };
      } catch (error) {
        report.tests[url] = {
          error: (error as Error).message,
        };
      }
    }

    return report;
  },
};

// Security checklist for manual verification
export const securityChecklist = {
  "Concurrent Session": {
    description: "Users limited to single active session",
    implemented: true,
    checkPoints: [
      "Session tokens stored in database",
      "Single session enforcement in auth callbacks",
      "Session validation in middleware",
    ],
  },

  "Information Disclosure": {
    description: "Server information headers removed/obscured",
    implemented: true,
    checkPoints: [
      "X-Powered-By header removed",
      "Server header obscured",
      "No sensitive information in headers",
    ],
  },

  "Duplicate Headers": {
    description: "Redundant headers eliminated",
    implemented: true,
    checkPoints: [
      "Cache-Control headers deduplicated",
      "Set-Cookie headers managed",
      "Content-Type headers unique",
    ],
  },

  "Clickjacking Protection": {
    description: "X-Frame-Options header implemented",
    implemented: true,
    checkPoints: [
      "X-Frame-Options: DENY set",
      "CSP frame-ancestors directive",
      "Applied to all routes",
    ],
  },

  "Input Validation": {
    description: "Strict input validation rules enforced",
    implemented: true,
    checkPoints: [
      "Length restrictions on all inputs",
      "Pattern validation for emails, phones",
      "Sanitization of user inputs",
      "SQL injection prevention",
      "XSS prevention",
    ],
  },

  "Cache Control": {
    description: "Appropriate cache-control headers",
    implemented: true,
    checkPoints: [
      "No-cache for sensitive content",
      "Long cache for static assets",
      "Short cache for API responses",
    ],
  },

  "Password Security": {
    description: "Password history and complexity enforced",
    implemented: true,
    checkPoints: [
      "Password history tracking (5 passwords)",
      "Strong password requirements",
      "Failed attempt tracking",
      "Account lockout mechanism",
    ],
  },

  "HTTP Methods": {
    description: "Unnecessary HTTP methods disabled",
    implemented: true,
    checkPoints: [
      "Only GET, POST, OPTIONS allowed for public routes",
      "Method validation in middleware",
      "405 responses for disallowed methods",
    ],
  },

  "Rate Limiting": {
    description: "Request rate limiting implemented",
    implemented: true,
    checkPoints: [
      "Per-IP rate limiting",
      "Configurable limits per route",
      "429 responses when limit exceeded",
    ],
  },
};

export default {
  securityTests,
  securityChecklist,
};
