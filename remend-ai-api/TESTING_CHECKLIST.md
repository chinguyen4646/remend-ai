# Rehab Tracking API - Testing Checklist

## Prerequisites

1. Start the API server:

```bash
cd remend-ai-api
npm run dev
```

2. Create a test user and get auth token (or use existing user):

```bash
# Register a new user
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'

# Login (if already registered)
curl -X POST http://localhost:3333/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

**Save the `token.value` from the response - you'll need it for all subsequent requests!**

Set it as an environment variable:

```bash
export TOKEN="your_token_here"
```

---

## Test Checklist

### ✅ 1. Switch User Mode

**Test switching to rehab mode:**

```bash
curl -X PATCH http://localhost:3333/api/users/mode \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "rehab",
    "injuryType": "ACL tear"
  }'
```

**Expected:** 200 OK with updated user object including `mode: "rehab"`, `injuryType`, and `modeStartedAt`.

---

### ✅ 2. Create Rehab Program

**Create an active rehab program:**

```bash
curl -X POST http://localhost:3333/api/rehab-programs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "area": "knee",
    "side": "left",
    "startDate": "2025-01-01"
  }'
```

**Expected:** 201 Created with program object. **Save the `program.id`!**

**Test: Try creating a second active program (should fail):**

```bash
curl -X POST http://localhost:3333/api/rehab-programs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "area": "ankle",
    "side": "right",
    "startDate": "2025-01-05"
  }'
```

**Expected:** 409 Conflict - "You already have an active rehab program".

---

### ✅ 3. List Rehab Programs

```bash
curl -X GET http://localhost:3333/api/rehab-programs \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** 200 OK with array of programs.

---

### ✅ 4. Create Today's Rehab Log

**Create a log for today (date defaults to today if omitted):**

```bash
export PROGRAM_ID=1  # Replace with your actual program ID

curl -X POST http://localhost:3333/api/rehab-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "programId": '$PROGRAM_ID',
    "pain": 4,
    "stiffness": 6,
    "swelling": 3,
    "activityLevel": "light",
    "notes": "Felt pretty good during physio today"
  }'
```

**Expected:** 201 Created with log object.

**Test: Try creating duplicate log for same day (should fail):**

```bash
curl -X POST http://localhost:3333/api/rehab-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "programId": '$PROGRAM_ID',
    "pain": 5,
    "stiffness": 5
  }'
```

**Expected:** 409 Conflict - "A log already exists for this program and date".

---

### ✅ 5. Create Historical Rehab Logs

**Create logs for the past 14 days:**

```bash
# Day -1
curl -X POST http://localhost:3333/api/rehab-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "programId": '$PROGRAM_ID',
    "date": "2025-01-09",
    "pain": 5,
    "stiffness": 7,
    "swelling": 4,
    "activityLevel": "moderate"
  }'

# Day -7
curl -X POST http://localhost:3333/api/rehab-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "programId": '$PROGRAM_ID',
    "date": "2025-01-03",
    "pain": 7,
    "stiffness": 8,
    "swelling": 6,
    "activityLevel": "rest"
  }'

# Day -14
curl -X POST http://localhost:3333/api/rehab-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "programId": '$PROGRAM_ID',
    "date": "2024-12-27",
    "pain": 8,
    "stiffness": 9,
    "swelling": 7,
    "activityLevel": "rest",
    "notes": "First day post-surgery"
  }'
```

---

### ✅ 6. Fetch Last 14 Days of Rehab Logs

**Get logs for active program:**

```bash
curl -X GET "http://localhost:3333/api/rehab-logs?programId=$PROGRAM_ID&status=active&range=last_14" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** 200 OK with array of logs from the past 14 days, ordered by date DESC.

**Get all logs for specific program:**

```bash
curl -X GET "http://localhost:3333/api/rehab-logs?programId=$PROGRAM_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** 200 OK with all logs for that program.

---

### ✅ 7. Switch to Maintenance Mode & Create Wellness Log

**Switch mode (this will auto-pause any active rehab programs):**

```bash
curl -X PATCH http://localhost:3333/api/users/mode \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "maintenance"
  }'
```

**Expected:** 200 OK with updated user object. If you had an active rehab program, you'll also receive a message: `"Your active rehab program has been paused. Switch back to rehab mode to resume tracking."`

**Verify program was auto-paused:**

```bash
curl -X GET http://localhost:3333/api/rehab-programs \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** Program status should now be `"paused"` instead of `"active"`.

**Create a wellness log:**

```bash
curl -X POST http://localhost:3333/api/wellness-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "maintenance",
    "pain": 2,
    "stiffness": 3,
    "tension": 4,
    "energy": 7,
    "areaTag": "lower back",
    "notes": "Feeling good after stretching routine"
  }'
```

**Expected:** 201 Created with wellness log object.

---

### ✅ 8. Fetch Wellness Logs

**Get last 7 days of maintenance logs:**

```bash
curl -X GET "http://localhost:3333/api/wellness-logs?mode=maintenance&range=last_7" \
  -H "Authorization: Bearer $TOKEN"
```

**Expected:** 200 OK with wellness logs.

---

### ✅ 9. Update Program Status

**Pause the program:**

```bash
curl -X PATCH http://localhost:3333/api/rehab-programs/$PROGRAM_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "paused"
  }'
```

**Expected:** 200 OK with updated program.

**Test: Try logging to paused program (should fail):**

```bash
curl -X POST http://localhost:3333/api/rehab-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "programId": '$PROGRAM_ID',
    "pain": 3,
    "stiffness": 4
  }'
```

**Expected:** 400 Bad Request - "Cannot log to a non-active program".

**Reactivate the program (e.g., after switching back to rehab mode):**

```bash
# First, switch back to rehab mode
curl -X PATCH http://localhost:3333/api/users/mode \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "rehab",
    "injuryType": "ACL tear"
  }'

# Then reactivate the paused program
curl -X PATCH http://localhost:3333/api/rehab-programs/$PROGRAM_ID/status \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "active"
  }'
```

---

### ✅ 10. Test Edge Cases

**Invalid pain score (> 10):**

```bash
curl -X POST http://localhost:3333/api/rehab-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "programId": '$PROGRAM_ID',
    "date": "2025-01-08",
    "pain": 15,
    "stiffness": 5
  }'
```

**Expected:** 422 Validation Error.

**Try to access another user's program:**

- Create a second user account
- Try to create a log with the first user's program ID
  **Expected:** 403 Forbidden or 404 Not Found.

---

## Summary

All features are working correctly if:

- ✅ User mode switches successfully
- ✅ Active rehab programs are auto-paused when switching away from rehab mode
- ✅ Only one active program per user is enforced
- ✅ Rehab logs are scoped to programs and date-unique
- ✅ Wellness logs are date-unique per mode
- ✅ Range filters work correctly (last_7, last_14, last_30)
- ✅ "active" program resolution works
- ✅ Non-active programs reject new logs
- ✅ Validation catches out-of-bounds scores
- ✅ Authorization prevents cross-user access

---

## Quick Test Script

A comprehensive test script is available at `scripts/test-api.sh`.

Run it with:

```bash
chmod +x scripts/test-api.sh
./scripts/test-api.sh
```

This will automatically test all major features including:

- User registration and authentication
- Mode switching with auto-pause behavior
- Rehab program creation
- Rehab and wellness log creation
- Range-based log queries
