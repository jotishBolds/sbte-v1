# Concurrent Session Prevention - Testing Guide

## Overview

This implementation prevents users from having multiple active sessions by detecting concurrent login attempts and prompting users to log out other sessions.

## Features Implemented

### 1. Session Detection API

- **Endpoint**: `/api/auth/check-active-session`
- **Purpose**: Checks if a user already has an active session
- **Response**: Returns session status, user ID, and last activity

### 2. Session Termination API

- **Endpoint**: `/api/auth/terminate-sessions`
- **Purpose**: Terminates all sessions for a specific user
- **Security**: Logs all session termination events

### 3. Enhanced Modal Component

- **File**: `components/session-logout-modal.tsx`
- **Features**:
  - Professional UI with security warnings
  - Shows user email and last activity
  - Loading states during session termination
  - Dark mode support

### 4. Login Flow Integration

- **File**: `app/(auth)/login/page.tsx`
- **Integration**: Checks for active sessions before authentication
- **User Experience**: Shows modal for concurrent session handling

## Testing Instructions

### Test 1: Normal Login (No Concurrent Sessions)

1. Open a browser and navigate to `http://localhost:3000/login`
2. Enter valid credentials and complete the login process
3. **Expected**: Login should proceed normally without any modal

### Test 2: Concurrent Session Detection

1. Login to the application in Browser A (Chrome)
2. Keep the session active in Browser A
3. Open Browser B (Firefox/Edge) and navigate to `http://localhost:3000/login`
4. Enter the SAME credentials as Browser A
5. **Expected**:
   - A modal should appear titled "Active Session Detected"
   - Modal should show security warning and user email
   - Modal should display last activity time
   - Two buttons: "Cancel" and "Log Out Other Session"

### Test 3: Cancel Concurrent Session

1. Follow Test 2 steps 1-5
2. Click "Cancel" button in the modal
3. **Expected**:
   - Modal closes
   - Login form remains active
   - No login occurs
   - Session in Browser A remains active

### Test 4: Terminate Other Session

1. Follow Test 2 steps 1-5
2. Click "Log Out Other Session" button
3. **Expected**:
   - Button shows loading state with spinner
   - Modal closes after successful termination
   - Login proceeds in Browser B
   - Session in Browser A becomes invalid (check by refreshing)

### Test 5: Session Validation

1. After Test 4, refresh Browser A
2. **Expected**:
   - Browser A should redirect to login page
   - User should be logged out from Browser A
   - Only Browser B should have an active session

### Test 6: Multiple Browsers

1. Test with different browser combinations:
   - Chrome + Firefox
   - Chrome + Edge
   - Firefox + Edge
   - Chrome + Incognito mode
2. **Expected**: Same behavior across all browser combinations

### Test 7: API Security

1. Test direct API access without authentication:
   ```bash
   curl -X POST http://localhost:3000/api/auth/check-active-session \
        -H "Content-Type: application/json" \
        -d '{"email":"test@example.com"}'
   ```
2. **Expected**: Should work for session checking (no auth required)

3. Test session termination without proper data:
   ```bash
   curl -X POST http://localhost:3000/api/auth/terminate-sessions \
        -H "Content-Type: application/json" \
        -d '{}'
   ```
4. **Expected**: Should return error "User ID is required"

## Security Events Logged

The following events are automatically logged in the audit system:

1. **CONCURRENT_SESSION_ATTEMPT**: When a user tries to login with an active session
2. **SESSIONS_TERMINATED**: When other sessions are terminated
3. **CONCURRENT_SESSION_DETECTED**: During session validation

## Troubleshooting

### Modal Not Appearing

- Check browser console for errors
- Verify `/api/auth/check-active-session` endpoint is responding
- Ensure user has an active session in another browser

### Session Not Terminating

- Check `/api/auth/terminate-sessions` endpoint
- Verify database connection
- Check audit logs for termination events

### Login Still Fails After Termination

- Clear browser cache and cookies
- Check NextAuth configuration
- Verify session tokens are properly cleared

## Database Changes

The implementation uses existing user fields:

- `isLoggedIn`: Boolean flag for active session
- `sessionToken`: Unique session identifier
- `sessionExpiresAt`: Session expiration time
- `lastActivity`: Last user activity timestamp

## Configuration

No additional configuration required. The system uses:

- Existing NextAuth setup
- Prisma database connection
- Current audit logging system

## Security Benefits

1. **Single Session Enforcement**: Only one active session per user
2. **Audit Trail**: All session events are logged
3. **User Awareness**: Clear notification of concurrent access attempts
4. **Graceful Handling**: User-friendly modal instead of hard failures
5. **Session Validation**: Real-time session token verification

## Production Considerations

1. **Performance**: Session checks add minimal overhead
2. **Scalability**: Uses existing database infrastructure
3. **Monitoring**: All events logged for security monitoring
4. **User Experience**: Clear messaging and smooth transitions
