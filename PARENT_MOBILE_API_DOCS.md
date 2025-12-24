# Parent Mobile App - Accounting & Payment API Documentation

## Base URL
```
http://your-domain.com/api
```

## Authentication
All endpoints require parent authentication via email-only login.

**Headers Required:**
```
Cookie: PHPSESSID=<session_id>
Content-Type: application/json
```

---

## API Endpoints

### 1. Get Child's Outstanding Fees

Get all fees (paid, pending, overdue) for a specific child.

**Endpoint:** `GET /parent/get-fees`

**Query Parameters:**
- `student_id` (required) - Integer

**Request Example:**
```http
GET /api/parent/get-fees?student_id=123
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "student": {
      "id": 123,
      "name": "John Doe",
      "class": "JSS 1A",
      "admission_no": "ADM001",
      "session": "2023/2024",
      "term": "First Term"
    },
    "fees": [
      {
        "id": 45,
        "category": "Tuition Fee",
        "description": "Regular tuition charges",
        "amount_due": 50000.00,
        "amount_paid": 20000.00,
        "balance": 30000.00,
        "due_date": "2024-01-31",
        "status": "partial",
        "session": "2023/2024",
        "term": "First Term",
        "frequency": "per-term",
        "is_overdue": false,
        "notes": null
      },
      {
        "id": 46,
        "category": "Development Levy",
        "description": "School development",
        "amount_due": 10000.00,
        "amount_paid": 0.00,
        "balance": 10000.00,
        "due_date": "2024-01-15",
        "status": "overdue",
        "session": "2023/2024",
        "term": "First Term",
        "frequency": "per-term",
        "is_overdue": true,
        "notes": null
      }
    ],
    "summary": {
      "total_due": 60000.00,
      "total_paid": 20000.00,
      "total_balance": 40000.00,
      "overdue_count": 1,
      "total_fees": 2
    }
  }
}
```

**Error Responses:**
- `400` - student_id required
- `401` - Unauthorized
- `403` - Access denied (not your child)
- `500` - Server error

---

### 2. Get School Bank Accounts

Get list of bank accounts where parents can make transfers.

**Endpoint:** `GET /parent/get-bank-accounts`

**Query Parameters:**
- `student_id` (required) - Integer

**Request Example:**
```http
GET /api/parent/get-bank-accounts?student_id=123
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "school_name": "ABC International School",
    "accounts": [
      {
        "id": 1,
        "bank_name": "First Bank",
        "account_number": "1234567890",
        "account_name": "ABC International School",
        "account_type": "current",
        "is_primary": true
      },
      {
        "id": 2,
        "bank_name": "GTBank",
        "account_number": "0987654321",
        "account_name": "ABC International School",
        "account_type": "savings",
        "is_primary": false
      }
    ],
    "instruction": "Please make your transfer to any of the accounts below and upload your payment receipt."
  }
}
```

---

### 3. Submit Bank Transfer Payment

Submit payment with uploaded receipt image.

**Endpoint:** `POST /parent/submit-payment`

**Request Body:**
```json
{
  "student_id": 123,
  "student_fee_id": 45,
  "amount": 30000.00,
  "payment_method": "bank_transfer",
  "payment_date": "2024-01-20",
  "transfer_receipt_image": "data:image/jpeg;base64,/9j/4AAQSkZJRg...",
  "bank_name": "First Bank",
  "account_number": "1234567890",
  "notes": "Payment for First Term tuition"
}
```

**Request Fields:**
- `student_id` (required) - Integer
- `student_fee_id` (required) - Integer (from get-fees response)
- `amount` (required) - Float
- `payment_method` (required) - "bank_transfer" or "paystack"
- `payment_date` (required) - Date (YYYY-MM-DD)
- `transfer_receipt_image` (required for bank_transfer) - Base64 encoded image
- `bank_name` (required for bank_transfer) - String
- `account_number` (required for bank_transfer) - String
- `notes` (optional) - String

**Success Response (201):**
```json
{
  "success": true,
  "message": "Payment submitted successfully. Awaiting verification by school.",
  "data": {
    "payment_id": 78,
    "receipt_no": "RCT/2024/00078",
    "amount": 30000.00,
    "payment_method": "bank_transfer",
    "verification_status": "pending",
    "student_name": "John Doe",
    "fee_category": "Tuition Fee"
  }
}
```

**Notes:**
- Bank transfer payments are **pending verification** by school
- Paystack payments are **auto-verified**
- Receipt image must be base64 encoded (max 5MB)
- Supported image formats: JPG, PNG, PDF

---

### 4. Get Payment History

Get all payments made for a specific child.

**Endpoint:** `GET /parent/get-payment-history`

**Query Parameters:**
- `student_id` (required) - Integer

**Request Example:**
```http
GET /api/parent/get-payment-history?student_id=123
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "student_name": "John Doe",
    "payments": [
      {
        "id": 78,
        "receipt_no": "RCT/2024/00078",
        "amount": 30000.00,
        "payment_method": "bank_transfer",
        "payment_date": "2024-01-20",
        "fee_category": "Tuition Fee",
        "session": "2023/2024",
        "term": "First Term",
        "verification_status": "pending",
        "status_text": "Awaiting Verification",
        "verified_at": null,
        "rejection_reason": null,
        "bank_name": "First Bank",
        "transaction_reference": null,
        "paystack_reference": null,
        "notes": "Payment for First Term tuition",
        "submitted_at": "2024-01-20 14:30:00"
      },
      {
        "id": 65,
        "receipt_no": "RCT/2024/00065",
        "amount": 20000.00,
        "payment_method": "paystack",
        "payment_date": "2024-01-10",
        "fee_category": "Tuition Fee",
        "session": "2023/2024",
        "term": "First Term",
        "verification_status": "verified",
        "status_text": "Verified",
        "verified_at": "2024-01-10 10:15:00",
        "rejection_reason": null,
        "bank_name": null,
        "transaction_reference": null,
        "paystack_reference": "T123456789",
        "notes": "Paid via Paystack - card",
        "submitted_at": "2024-01-10 10:15:00"
      }
    ],
    "summary": {
      "total_payments": 2,
      "total_amount_paid": 50000.00,
      "verified_count": 1,
      "pending_count": 1,
      "rejected_count": 0
    }
  }
}
```

**Verification Status:**
- `pending` - Awaiting school verification (bank transfers)
- `verified` - Payment confirmed
- `rejected` - Payment rejected by school

---

### 5. Initialize Paystack Payment

Generate Paystack authorization URL for online payment.

**Endpoint:** `POST /parent/initialize-paystack-payment`

**Request Body:**
```json
{
  "student_id": 123,
  "student_fee_id": 45,
  "amount": 30000.00,
  "email": "parent@example.com",
  "callback_url": "myapp://payment-callback"
}
```

**Request Fields:**
- `student_id` (required) - Integer
- `student_fee_id` (required) - Integer
- `amount` (required) - Float
- `email` (required) - String (parent's email)
- `callback_url` (optional) - String (deep link for mobile app)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment initialized successfully",
  "data": {
    "authorization_url": "https://checkout.paystack.com/abc123xyz",
    "access_code": "abc123xyz",
    "reference": "FEE_123_45_1705756800",
    "amount": 30000.00,
    "fee_category": "Tuition Fee",
    "student_name": "John Doe"
  }
}
```

**Mobile App Flow:**
1. Call this endpoint
2. Open `authorization_url` in webview or browser
3. User completes payment on Paystack
4. Paystack redirects to `callback_url` with reference
5. Call verify-paystack-payment with reference

---

### 6. Verify Paystack Payment

Verify payment with Paystack and record it.

**Endpoint:** `POST /parent/verify-paystack-payment`

**Request Body:**
```json
{
  "reference": "FEE_123_45_1705756800"
}
```

**Request Fields:**
- `reference` (required) - String (from initialize-paystack-payment)

**Success Response (200):**
```json
{
  "success": true,
  "message": "Payment verified and recorded successfully",
  "data": {
    "payment_id": 79,
    "receipt_no": "RCT/2024/00079",
    "amount": 30000.00,
    "payment_date": "2024-01-20",
    "student_name": "John Doe",
    "paystack_reference": "FEE_123_45_1705756800",
    "verification_status": "verified"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Payment verification failed",
  "payment_status": "failed"
}
```

**Note:** This endpoint automatically updates the student's fee status.

---

## Image Upload Guide

### Base64 Encoding

For bank transfer receipt upload, encode image to base64:

**JavaScript Example:**
```javascript
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
};

// Usage
const file = event.target.files[0];
const base64 = await fileToBase64(file);
// Result: "data:image/jpeg;base64,/9j/4AAQSkZJRg..."
```

**React Native Example:**
```javascript
import * as ImagePicker from 'expo-image-picker';

const pickImage = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    base64: true,
    quality: 0.8,
  });

  if (!result.canceled) {
    const base64 = `data:image/jpeg;base64,${result.base64}`;
    // Use this base64 string in API call
  }
};
```

**Constraints:**
- Max file size: 5MB
- Supported formats: JPG, PNG, PDF
- Recommended: Compress image before upload

---

## Complete Payment Flows

### Flow 1: Bank Transfer

```
1. GET /parent/get-fees?student_id=123
   → Get outstanding fees

2. GET /parent/get-bank-accounts?student_id=123
   → Get school bank accounts

3. User makes bank transfer at their bank

4. User uploads receipt in app
   → Encode to base64

5. POST /parent/submit-payment
   {
     "payment_method": "bank_transfer",
     "transfer_receipt_image": "data:image/jpeg;base64,...",
     ...
   }
   → Payment created with "pending" status

6. GET /parent/get-payment-history?student_id=123
   → Check verification status
   → Status: "Awaiting Verification"

7. School admin verifies payment
   → Status changes to "verified" or "rejected"

8. Parent sees updated status in payment history
```

### Flow 2: Paystack Online Payment

```
1. GET /parent/get-fees?student_id=123
   → Get outstanding fees

2. POST /parent/initialize-paystack-payment
   {
     "student_id": 123,
     "student_fee_id": 45,
     "amount": 30000.00,
     "email": "parent@example.com"
   }
   → Returns authorization_url

3. Open authorization_url in webview
   → User completes payment on Paystack

4. Paystack redirects with reference

5. POST /parent/verify-paystack-payment
   {
     "reference": "FEE_123_45_1705756800"
   }
   → Payment auto-verified and recorded

6. GET /parent/get-payment-history?student_id=123
   → See verified payment immediately
```

---

## Error Handling

### Standard Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Technical details (in development)"
}
```

### Common HTTP Status Codes
- `200` - Success
- `201` - Created (payment submitted)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not logged in)
- `403` - Forbidden (not your child)
- `404` - Not Found
- `405` - Method Not Allowed
- `409` - Conflict (duplicate)
- `500` - Server Error

---

## Testing

### Test with Postman/Insomnia

**Step 1: Login as Parent**
```http
POST /api/parent/login
Content-Type: application/json

{
  "email": "parent@example.com"
}
```

**Step 2: Use returned session cookie for all subsequent requests**

**Step 3: Test endpoints**

### Test Payment Flow

Use Paystack test card:
```
Card Number: 4084084084084081
CVV: 408
Expiry: 01/99
PIN: 0000
OTP: 123456
```

---

## Rate Limiting

No rate limiting currently implemented.

---

## Support

For issues or questions:
- Email: support@yourschool.com
- API Version: 1.0
- Last Updated: December 23, 2025

---

## Changelog

### Version 1.0 (December 2025)
- Initial release
- Fee viewing
- Bank transfer with receipt upload
- Paystack integration
- Payment history
