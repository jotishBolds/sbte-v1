# Test Cases for Role-Based Access Control

## Test Matrix for API Routes

### 1. Register Users API

```powershell
# Test ADM Role PUT Method
curl -X PUT http://localhost:3000/api/register-users/cmdzkb8ww0004l0q24bb2y3b8 `
  -H "Content-Type: application/json" `
  -d '{"username": "test", "email": "test@example.com"}'

# Test ADM Role DELETE Method
curl -X DELETE http://localhost:3000/api/register-users/cmdzkb8ww0004l0q24bb2y3b8

# Expected: 200 OK for both (if user authenticated as ADM)
```

### 2. Programs API (HOD Role)

```powershell
# Test HOD Role GET Method
curl -X GET "http://localhost:3000/api/programs?academicYearId=cmdwrqzdw00017knsrxwfqcay"

# Expected: 200 OK with programs data
```

### 3. Batch Students API (FINANCE Role)

```powershell
# Test FINANCE_MANAGER Role GET Method
curl -X GET http://localhost:3000/api/batch/cmdwt1k68000zzfp93fzwrqek/students

# Expected: 200 OK with student data
```

### 4. Batch Subject API (STUDENT Role)

```powershell
# Test STUDENT Role GET Method
curl -X GET http://localhost:3000/api/batch/cmdwt1k68000zzfp93fzwrqek/subject

# Expected: 200 OK with subject data
```

### 5. Student Batch Exam Fee API

```powershell
# Test FINANCE_MANAGER Role GET Method
curl -X GET "http://localhost:3000/api/studentBatchExamFee?batchId=cmdwt1k68000zzfp93fzwrqek"

# Expected: 200 OK or 404 if no data (not 403 Forbidden)
```

## Role Testing Matrix

| Role            | Endpoint                 | Method | Expected Status |
| --------------- | ------------------------ | ------ | --------------- |
| ADM             | /api/register-users/[id] | PUT    | 200             |
| ADM             | /api/register-users/[id] | DELETE | 200             |
| HOD             | /api/programs            | GET    | 200             |
| FINANCE_MANAGER | /api/batch/[id]/students | GET    | 200             |
| STUDENT         | /api/batch/[id]/subject  | GET    | 200             |
| FINANCE_MANAGER | /api/studentBatchExamFee | GET    | 200/404         |

## Loading System Test Cases

### 1. API Client Hook Usage

```javascript
// Component should use useApiClient instead of direct fetch
import { useApiClient } from "@/hooks/use-api-client";

const Component = () => {
  const { apiRequest } = useApiClient();

  const fetchData = async () => {
    try {
      const data = await apiRequest("/api/programs", {
        showLoading: true,
        loadingMessage: "Loading programs...",
      });
      // Handle success
    } catch (error) {
      // Handle error
    }
  };
};
```

### 2. Global Loading Overlay Test

- Navigate to any page
- Trigger an API call
- Verify loading overlay appears with spinner
- Verify loading message is displayed
- Verify overlay disappears when request completes

### 3. Sidebar Navigation Loading Test

- Click on any sidebar menu item
- Verify some form of loading feedback
- Verify smooth transition to new page

## Manual Testing Procedures

### For Each Role:

1. Login with specific role credentials
2. Navigate to relevant pages for that role
3. Perform CRUD operations allowed for that role
4. Verify 403 errors for unauthorized operations
5. Verify loading states during operations

### For Loading System:

1. Open browser dev tools
2. Navigate through application
3. Monitor network requests
4. Verify loading overlay timing
5. Test on slow network connections

## Automated Test Script Template

```powershell
# PowerShell Test Script for Role-Based Access Control

# Test Configuration
$BASE_URL = "http://localhost:3000"
$SESSION_COOKIE = "next-auth.session-token=your-session-token"

# Function to test API endpoint
function Test-ApiEndpoint {
    param(
        [string]$Endpoint,
        [string]$Method = "GET",
        [string]$Body = $null,
        [int]$ExpectedStatus = 200
    )

    $headers = @{
        "Cookie" = $SESSION_COOKIE
        "Content-Type" = "application/json"
    }

    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri "$BASE_URL$Endpoint" -Method $Method -Headers $headers -Body $Body
        } else {
            $response = Invoke-RestMethod -Uri "$BASE_URL$Endpoint" -Method $Method -Headers $headers
        }
        Write-Host "✅ $Method $Endpoint - Status: $($response.StatusCode)" -ForegroundColor Green
        return $true
    }
    catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        if ($statusCode -eq $ExpectedStatus) {
            Write-Host "✅ $Method $Endpoint - Expected Status: $statusCode" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ $METHOD $Endpoint - Status: $statusCode (Expected: $ExpectedStatus)" -ForegroundColor Red
            return $false
        }
    }
}

# Run Tests
Write-Host "Starting Role-Based Access Control Tests..." -ForegroundColor Yellow

# Test ADM Role
Test-ApiEndpoint -Endpoint "/api/register-users/test-id" -Method "PUT" -Body '{"username":"test"}'
Test-ApiEndpoint -Endpoint "/api/register-users/test-id" -Method "DELETE"

# Test HOD Role
Test-ApiEndpoint -Endpoint "/api/programs"

# Test FINANCE_MANAGER Role
Test-ApiEndpoint -Endpoint "/api/batch/test-batch-id/students"

# Test STUDENT Role
Test-ApiEndpoint -Endpoint "/api/batch/test-batch-id/subject"

Write-Host "Tests completed!" -ForegroundColor Yellow
```

## Performance Testing

### Loading Time Benchmarks

- Page load time: < 2 seconds
- API response time: < 1 second
- Loading overlay should appear within 100ms
- Loading overlay should disappear within 100ms of request completion

### Memory Usage

- Monitor for memory leaks during navigation
- Verify loading contexts are properly cleaned up
- Check for excessive re-renders during loading states

## Browser Compatibility Testing

### Required Tests Across:

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Mobile Testing:

- iOS Safari
- Android Chrome
- Responsive design at various breakpoints
