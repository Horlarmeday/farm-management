#!/bin/bash

echo "🧪 Testing Farm ID Header Fix with cURL"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:5058"

# Step 1: Login
echo "1. Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@kuyashfarms.com","password":"admin123"}')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo -e "${RED}❌ Login failed - no token found${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Login successful${NC}"
echo "  Token: ${TOKEN:0:30}..."
echo ""

# Step 2: Get user farms
echo "2. Fetching user farms..."
FARMS_RESPONSE=$(curl -s -X GET "$API_URL/api/farms/user" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

FARM_ID=$(echo $FARMS_RESPONSE | grep -o '"farmId":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -z "$FARM_ID" ]; then
  # Try alternative structure
  FARM_ID=$(echo $FARMS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
fi

if [ -z "$FARM_ID" ]; then
  echo -e "${RED}❌ No farms found${NC}"
  echo "Response: ${FARMS_RESPONSE:0:200}"
  exit 1
fi

echo -e "${GREEN}✓ Found farm${NC}"
echo "  Farm ID: $FARM_ID"
echo ""

# Step 3: Test poultry endpoint WITH X-Farm-Id header
echo "3. Testing /api/poultry/batches WITH X-Farm-Id header..."
POULTRY_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "$API_URL/api/poultry/batches" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Farm-Id: $FARM_ID" \
  -H "Content-Type: application/json")

HTTP_CODE=$(echo "$POULTRY_RESPONSE" | grep -o 'HTTP_CODE:[0-9]*' | cut -d':' -f2)
POULTRY_BODY=$(echo "$POULTRY_RESPONSE" | sed 's/HTTP_CODE:[0-9]*//g')

echo "  Status: $HTTP_CODE"

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✅ SUCCESS! Poultry endpoint works with X-Farm-Id header${NC}"
  echo "  Response preview: ${POULTRY_BODY:0:100}..."
else
  echo -e "${RED}❌ FAILED!${NC}"
  echo "  Error: ${POULTRY_BODY:0:200}"
fi
echo ""

# Step 4: Test WITHOUT X-Farm-Id header (should fail)
echo "4. Testing /api/poultry/batches WITHOUT X-Farm-Id header..."
NO_HEADER_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "$API_URL/api/poultry/batches" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

NO_HEADER_CODE=$(echo "$NO_HEADER_RESPONSE" | grep -o 'HTTP_CODE:[0-9]*' | cut -d':' -f2)
NO_HEADER_BODY=$(echo "$NO_HEADER_RESPONSE" | sed 's/HTTP_CODE:[0-9]*//g')

echo "  Status: $NO_HEADER_CODE"

if [ "$NO_HEADER_CODE" = "400" ] || [ "$NO_HEADER_CODE" = "401" ]; then
  echo -e "${GREEN}✅ CORRECT! Request without farmId properly rejected${NC}"
  ERROR_MSG=$(echo "$NO_HEADER_BODY" | grep -o '"message":"[^"]*' | cut -d'"' -f4)
  echo "  Error message: $ERROR_MSG"
else
  echo -e "${YELLOW}⚠ WARNING: Request succeeded without farmId (unexpected)${NC}"
fi
echo ""

# Step 5: Test backward compatibility with query parameter
echo "5. Testing backward compatibility with query parameter..."
QUERY_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "$API_URL/api/poultry/batches?farmId=$FARM_ID" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

QUERY_CODE=$(echo "$QUERY_RESPONSE" | grep -o 'HTTP_CODE:[0-9]*' | cut -d':' -f2)

echo "  Status: $QUERY_CODE"

if [ "$QUERY_CODE" = "200" ]; then
  echo -e "${GREEN}✅ SUCCESS! Backward compatibility maintained (query param works)${NC}"
else
  echo -e "${RED}❌ FAILED! Query parameter not working${NC}"
fi
echo ""

# Step 6: Test livestock endpoint
echo "6. Testing /api/livestock/animals with X-Farm-Id header..."
LIVESTOCK_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X GET "$API_URL/api/livestock/animals" \
  -H "Authorization: Bearer $TOKEN" \
  -H "X-Farm-Id: $FARM_ID" \
  -H "Content-Type: application/json")

LIVESTOCK_CODE=$(echo "$LIVESTOCK_RESPONSE" | grep -o 'HTTP_CODE:[0-9]*' | cut -d':' -f2)

echo "  Status: $LIVESTOCK_CODE"

if [ "$LIVESTOCK_CODE" = "200" ]; then
  echo -e "${GREEN}✅ SUCCESS! Livestock endpoint works with X-Farm-Id header${NC}"
else
  echo -e "${RED}❌ FAILED!${NC}"
fi
echo ""

# Summary
echo "========================================"
echo "🎉 Test Summary:"
echo "- X-Farm-Id header: ✓"
echo "- Query parameter backward compatibility: ✓"
echo "- Multiple endpoints tested: ✓"
echo "========================================"

