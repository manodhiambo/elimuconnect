#!/bin/bash

BASE_URL="http://localhost:8080/api/v1"

echo "=== Testing ElimuConnect API ==="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Test 1: Health Check
echo "1. Health Check..."
curl -s "$BASE_URL/../actuator/health" | jq '.'
echo ""

# Test 2: Register Admin
echo "2. Registering Admin..."
ADMIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register/admin" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Admin",
    "email": "admin@elimuconnect.ke",
    "password": "Admin@123",
    "adminCode": "OnlyMe@2025",
    "institutionId": "INST001"
  }')

if echo "$ADMIN_RESPONSE" | jq -e '.success' > /dev/null; then
    echo -e "${GREEN}✓ Admin registration successful${NC}"
else
    echo -e "${RED}✗ Admin registration failed${NC}"
fi
echo "$ADMIN_RESPONSE" | jq '.'
echo ""

# Test 3: Login Admin
echo "3. Admin Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@elimuconnect.ke",
    "password": "Admin@123"
  }')

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data')

if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
    echo -e "${GREEN}✓ Login successful${NC}"
    echo "Token: ${TOKEN:0:50}..."
else
    echo -e "${RED}✗ Login failed${NC}"
fi
echo ""

# Test 4: Register Teacher
echo "4. Registering Teacher..."
TEACHER_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register/teacher" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mary Teacher",
    "email": "teacher@elimuconnect.ke",
    "password": "Teacher@123",
    "phoneNumber": "+254712345678",
    "tscNumber": "TSC123456",
    "schoolId": "SCH001",
    "subjectsTaught": ["Mathematics", "Physics"],
    "classesAssigned": ["Form 1A", "Form 2B"],
    "qualification": "Bachelor of Education"
  }')

if echo "$TEACHER_RESPONSE" | jq -e '.success' > /dev/null; then
    echo -e "${GREEN}✓ Teacher registration successful${NC}"
else
    echo -e "${RED}✗ Teacher registration failed${NC}"
fi
echo "$TEACHER_RESPONSE" | jq '.'
echo ""

# Test 5: Get Pending Approvals (Admin only)
echo "5. Getting Pending Approvals..."
PENDING_RESPONSE=$(curl -s -X GET "$BASE_URL/admin/users/pending" \
  -H "Authorization: Bearer $TOKEN")

echo "$PENDING_RESPONSE" | jq '.'
echo ""

echo "=== Tests Complete ==="
