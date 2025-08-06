// Test script for alumni registration API with confirmPassword
const testDataWithConfirmPassword = {
  username: "testuser2",
  email: "test2@example.com",
  password: "TestPassword123!",
  confirmPassword: "TestPassword123!",
  name: "Test User 2",
  phoneNo: "1234567890",
  departmentId: "test-dept",
  programId: "test-program",
  batchYearId: "test-batch",
  admissionYearId: "test-admission",
  graduationYear: 2023,
};

const testDataWithMismatchedPassword = {
  username: "testuser3",
  email: "test3@example.com",
  password: "TestPassword123!",
  confirmPassword: "DifferentPassword123!",
  name: "Test User 3",
  phoneNo: "1234567890",
  departmentId: "test-dept",
  programId: "test-program",
  batchYearId: "test-batch",
  admissionYearId: "test-admission",
  graduationYear: 2023,
};

console.log("Testing alumni registration API with confirmPassword...");

// Test 1: Matching passwords
console.log("\n=== Test 1: Matching passwords ===");
fetch("http://localhost:3000/api/register-alumni", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(testDataWithConfirmPassword),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Response:", JSON.stringify(data, null, 2));
    if (data.error === "Invalid reference data") {
      console.log(
        "✅ SUCCESS: Password validation working (got expected error for invalid IDs)"
      );
    } else if (data.error && data.error.includes("match")) {
      console.log("❌ FAILED: Password mismatch error when passwords match");
    }

    // Test 2: Mismatched passwords
    console.log("\n=== Test 2: Mismatched passwords ===");
    return fetch("http://localhost:3000/api/register-alumni", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(testDataWithMismatchedPassword),
    });
  })
  .then((response) => response.json())
  .then((data) => {
    console.log("Response:", JSON.stringify(data, null, 2));
    if (
      data.error === "Validation failed" &&
      data.details.some((d) => d.message.includes("match"))
    ) {
      console.log("✅ SUCCESS: Password mismatch validation working correctly");
    } else {
      console.log("⚠️  Expected password mismatch validation error");
    }
  })
  .catch((error) => {
    console.error("❌ Error:", error);
  });
