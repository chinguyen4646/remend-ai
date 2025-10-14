# Timezone-Aware Date Handling - Testing Guide

## Overview

The API now handles dates in a timezone-aware manner:

- Clients send ISO date strings (`YYYY-MM-DD`)
- Dates are interpreted in the user's local timezone
- Stored as UTC start-of-day in the database
- Serialized back to clients as `YYYY-MM-DD`
- Range queries respect user's local day boundaries

## Setup

1. Start the API:

```bash
cd api
npm run dev
```

2. Register a user and get token:

```bash
# Register
curl -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "fullName": "Test User"
  }'

# Save the token from response
export TOKEN="your_token_here"
```

---

## Test 1: Create Rehab Program with X-Timezone Header

This demonstrates that dates are interpreted in the user's timezone:

```bash
# Create program with Europe/London timezone
curl -X POST http://localhost:3333/api/rehab-programs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Europe/London" \
  -d '{
    "area": "knee",
    "side": "left",
    "startDate": "2025-01-15"
  }'
```

**Expected Response:**

```json
{
  "program": {
    "id": 1,
    "area": "knee",
    "side": "left",
    "startDate": "2025-01-15",  // ← Serialized as ISO date string
    "status": "active",
    ...
  }
}
```

**What happened internally:**

- "2025-01-15" in "Europe/London" → UTC 2025-01-15T00:00:00.000Z
- Stored as Luxon DateTime (UTC)
- Serialized back to client as "2025-01-15"

---

## Test 2: Create Program with Different Timezone

```bash
# Same date, different timezone
curl -X POST http://localhost:3333/api/rehab-programs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Timezone: America/New_York" \
  -d '{
    "area": "ankle",
    "side": "right",
    "startDate": "2025-01-15"
  }'
```

This should fail because you already have an active program, but demonstrates timezone handling.

---

## Test 3: Create Log Without Date (Defaults to Today in User's TZ)

```bash
export PROGRAM_ID=1  # Use the program ID from Test 1

# No date provided - will default to today in Europe/London
curl -X POST http://localhost:3333/api/rehab-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Europe/London" \
  -d '{
    "programId": '$PROGRAM_ID',
    "pain": 4,
    "stiffness": 6,
    "swelling": 3,
    "notes": "Today'\''s log"
  }'
```

**Expected:** Log created with today's date in Europe/London timezone.

---

## Test 4: Create Historical Logs with Specific Dates

```bash
# Log for Jan 10, 2025 (Europe/London)
curl -X POST http://localhost:3333/api/rehab-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Europe/London" \
  -d '{
    "programId": '$PROGRAM_ID',
    "date": "2025-01-10",
    "pain": 5,
    "stiffness": 7,
    "activityLevel": "light"
  }'

# Log for Jan 5, 2025
curl -X POST http://localhost:3333/api/rehab-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Europe/London" \
  -d '{
    "programId": '$PROGRAM_ID',
    "date": "2025-01-05",
    "pain": 7,
    "stiffness": 8,
    "swelling": 6,
    "activityLevel": "rest"
  }'

# Log for Jan 1, 2025
curl -X POST http://localhost:3333/api/rehab-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Europe/London" \
  -d '{
    "programId": '$PROGRAM_ID',
    "date": "2025-01-01",
    "pain": 8,
    "stiffness": 9,
    "notes": "First day post-surgery"
  }'
```

**Expected:** All logs created with dates serialized as YYYY-MM-DD.

---

## Test 5: Query Last 7 Days (Respects User's Timezone)

```bash
# Fetch last 7 days of logs in Europe/London timezone
curl -X GET "http://localhost:3333/api/rehab-logs?programId=active&range=last_7" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Timezone: Europe/London"
```

**Expected:** Returns logs from the last 7 days relative to "today" in Europe/London.

**What's happening:**

- Server calculates "today" in Europe/London
- Computes range: [today - 6 days, today]
- Queries DB with UTC equivalents
- Returns matching logs

---

## Test 6: Different Timezone = Different Results

```bash
# Same query but from New York timezone (5 hours behind London)
curl -X GET "http://localhost:3333/api/rehab-logs?programId=active&range=last_7" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Timezone: America/New_York"
```

If it's currently 11 PM on Jan 10 in New York but Jan 11 in London, the results will differ:

- London `last_7` → Jan 5-11
- New York `last_7` → Jan 4-10

---

## Test 7: Wellness Logs (Same Behavior)

```bash
# Switch to maintenance mode first
curl -X PATCH http://localhost:3333/api/users/mode \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode": "maintenance"}'

# Create wellness log for today (defaults to today in TZ)
curl -X POST http://localhost:3333/api/wellness-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Timezone: America/Los_Angeles" \
  -d '{
    "mode": "maintenance",
    "pain": 2,
    "energy": 8,
    "notes": "Feeling good in LA"
  }'

# Create log for specific date
curl -X POST http://localhost:3333/api/wellness-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Timezone: America/Los_Angeles" \
  -d '{
    "mode": "maintenance",
    "date": "2025-01-08",
    "pain": 3,
    "stiffness": 4,
    "tension": 2,
    "energy": 7
  }'

# Query last 7 days
curl -X GET "http://localhost:3333/api/wellness-logs?mode=maintenance&range=last_7" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Timezone: America/Los_Angeles"
```

---

## Test 8: Error Handling - Invalid Date Format

```bash
# Invalid date format (should return 422)
curl -X POST http://localhost:3333/api/rehab-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -H "X-Timezone: Europe/London" \
  -d '{
    "programId": '$PROGRAM_ID',
    "date": "15-01-2025",
    "pain": 4,
    "stiffness": 5
  }'
```

**Expected:** 422 Unprocessable Entity with message "Invalid date format. Use YYYY-MM-DD"

---

## Test 9: No X-Timezone Header (Falls Back to User TZ or UTC)

```bash
# No timezone header - uses user.tz (defaults to UTC)
curl -X POST http://localhost:3333/api/rehab-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "programId": '$PROGRAM_ID',
    "date": "2025-01-12",
    "pain": 3,
    "stiffness": 4
  }'
```

**Expected:** Works, interprets "2025-01-12" in UTC (since user.tz defaults to 'UTC').

---

## Test 10: Update User Timezone in Database

You can update the user's default timezone:

```sql
-- Connect to your database
psql -U your_user -d your_database

-- Update user timezone
UPDATE users SET tz = 'America/New_York' WHERE email = 'test@example.com';
```

Now requests without `X-Timezone` header will use America/New_York.

---

## Acceptance Criteria ✓

✅ Clients send `"startDate": "YYYY-MM-DD"` (string)
✅ Dates interpreted in user's timezone (from X-Timezone header or user.tz)
✅ Stored as UTC start-of-day DateTime
✅ Serialized back as `"YYYY-MM-DD"` string
✅ `range=last_7/14/30` respects local day boundaries
✅ No hard-coded timezones in code
✅ Invalid date format returns 422 with clear message
✅ Duplicate date constraint still works (409 Conflict)

---

## Key Files Modified

1. **Migration:** `database/migrations/*_add_tz_to_users.ts`
2. **Middleware:** `app/middleware/timezone_middleware.ts`
3. **Date Utilities:** `app/utils/dates.ts`
4. **Models:** `rehab_program.ts`, `rehab_log.ts`, `wellness_log.ts` (date serialization)
5. **Validators:** All date fields changed from `vine.date()` to `vine.string().optional()`
6. **Controllers:** Transform date strings to DateTime using `toUtcStartOfLocalDay` and `todayUtcFromLocal`

---

## Debugging Tips

Check what's stored in the database:

```sql
-- View programs
SELECT id, user_id, area, start_date, created_at FROM rehab_programs;

-- View logs
SELECT id, program_id, date, pain, stiffness FROM rehab_logs ORDER BY date DESC;

-- Dates should be stored as YYYY-MM-DD in the date column (Postgres DATE type)
```

Check user timezone:

```sql
SELECT email, tz FROM users;
```

---

## Future Enhancements

- Add timezone validation (ensure it's a valid IANA timezone string)
- Allow users to update their `tz` via PATCH /users/tz
- Add timezone to registration flow (detect from client or let user select)
- Include timezone in JWT claims for faster access
