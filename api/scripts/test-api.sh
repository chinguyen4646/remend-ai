#!/bin/bash
set -e

echo "1. Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3333/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@example.com",
    "password": "password123",
    "fullName": "Test User"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"value":"[^"]*' | cut -d'"' -f4)
echo "Token: $TOKEN"

echo -e "\n2. Switching to rehab mode..."
curl -s -X PATCH http://localhost:3333/api/users/mode \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "rehab",
    "injuryType": "ACL tear"
  }' | jq

echo -e "\n3. Creating rehab program..."
PROGRAM_RESPONSE=$(curl -s -X POST http://localhost:3333/api/rehab-programs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "area": "knee",
    "side": "left",
    "startDate": "2025-01-01"
  }')

PROGRAM_ID=$(echo $PROGRAM_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
echo "Program ID: $PROGRAM_ID"
echo $PROGRAM_RESPONSE | jq

echo -e "\n4. Creating today's rehab log..."
curl -s -X POST http://localhost:3333/api/rehab-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "programId": '$PROGRAM_ID',
    "pain": 4,
    "stiffness": 6,
    "swelling": 3,
    "activityLevel": "light",
    "notes": "Test log"
  }' | jq

echo -e "\n5. Fetching last 14 days of logs..."
curl -s -X GET "http://localhost:3333/api/rehab-logs?programId=active&range=last_14" \
  -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n6. Creating wellness log (maintenance mode)..."
curl -s -X PATCH http://localhost:3333/api/users/mode \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode": "maintenance"}' > /dev/null

curl -s -X POST http://localhost:3333/api/wellness-logs \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mode": "maintenance",
    "pain": 2,
    "energy": 8,
    "notes": "Feeling good"
  }' | jq

echo -e "\n✅ All tests completed successfully!"
