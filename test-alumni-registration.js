// Test script for alumni registration API
const testData = {
  username: "testuser",
  email: "test@example.com",
  password: "TestPassword123!",
  name: "Test User",
  phoneNo: "1234567890",
  departmentId: "test-dept",
  programId: "test-program",
  batchYearId: "test-batch",
  admissionYearId: "test-admission",
  graduationYear: 2023,
};

console.log("Testing alumni registration API...");
console.log("Request data:", JSON.stringify(testData, null, 2));

fetch("http://localhost:3000/api/register-alumni", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
  },
  body: JSON.stringify(testData),
})
  .then((response) => response.json())
  .then((data) => {
    console.log("\nResponse:", JSON.stringify(data, null, 2));

    if (data.error === "Invalid reference data") {
      console.log("\n✅ SUCCESS: confirmPassword validation error is FIXED!");
      console.log(
        "   The API now properly accepts requests without confirmPassword field."
      );
      console.log(
        "   Current error is expected (invalid test IDs for department, program, etc.)"
      );
    } else if (data.error && data.error.includes("confirmPassword")) {
      console.log("\n❌ FAILED: confirmPassword is still required");
    } else if (data.message) {
      console.log("\n✅ SUCCESS: Registration completed successfully!");
    } else {
      console.log("\n⚠️  Unexpected response");
    }
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
  });
