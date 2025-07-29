# Concurrent Session Test Guide

## Testing Concurrent Session Prevention

The concurrent session prevention has been implemented with enhanced session validation. Here's how to test it:

### Method 1: Browser Testing (Recommended)

1. **Open Browser 1** (e.g., Chrome):

   - Go to: http://localhost:3000/login
   - Login with: admin@sbte.gov.in / SBTE@Admin123!
   - Note: You should be successfully logged in

2. **Open Browser 2** (e.g., Firefox or Chrome Incognito):

   - Go to: http://localhost:3000/login
   - Login with the SAME credentials: admin@sbte.gov.in / SBTE@Admin123!
   - Note: This should log you in successfully

3. **Check Browser 1**:
   - Refresh the page or navigate to any protected route
   - Browser 1 should be automatically logged out
   - You should see an error or be redirected to login

### Method 2: API Testing

If you want to test programmatically, you can use the session validation endpoint:

```powershell
# After logging in from two browsers, test session validation
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/session-validation" -Method GET
Write-Host "Response: $($response.StatusCode)"
```

### What Should Happen:

✅ **Expected Behavior:**

- Only the MOST RECENT login should remain active
- Previous sessions should be terminated automatically
- Users should be forced to re-authenticate when their session is invalidated
- Security events should be logged for concurrent session detection

### How It Works:

1. **Session Creation**: Each login creates a unique session token stored in the database
2. **Session Validation**: Every page load validates the session token against the database
3. **Concurrent Detection**: If tokens don't match, the session is considered invalid
4. **Automatic Logout**: Invalid sessions trigger automatic logout
5. **Security Logging**: All concurrent session attempts are logged as security events

### Troubleshooting:

If concurrent sessions are still allowed:

1. Clear browser cookies/cache
2. Restart the development server
3. Check the database for session tokens
4. Review the console logs for session validation messages

### Database Check:

You can also verify in the database:

```sql
SELECT id, email, sessionToken, isLoggedIn, sessionCreatedAt
FROM User
WHERE email = 'admin@sbte.gov.in';
```

Only one user should have `isLoggedIn = true` and a valid `sessionToken` at any time.

### Console Logs:

Watch the server console for messages like:

- "User [userId] concurrent session detected - tokens don't match"
- "Session validation failed"
- "CONCURRENT_SESSION_DETECTED" security events

This implementation ensures that only one session per user can be active at any given time, effectively preventing concurrent session vulnerabilities.
