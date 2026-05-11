# ClipSphere Phase 3 - API & WebSocket Reference

## 📡 REST API Endpoints

### Payment Endpoints

#### 1. Create Stripe Checkout Session
```http
POST /api/v1/payments/checkout
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 10,           // USD, min 1, max 10000
  "videoId": "id123",     // Video being tipped on
  "creatorId": "id456",   // Video owner's ID
  "message": "Great content!"  // Optional
}

Response 200:
{
  "status": "success",
  "data": {
    "checkoutSessionId": "cs_test_xxx",
    "checkoutUrl": "https://checkout.stripe.com/...",
    "transactionId": "507f1f77bcf86cd799439011"
  }
}
```

#### 2. Get Creator Balance
```http
GET /api/v1/payments/balance/{userId}
Authorization: Bearer {token}

Response 200:
{
  "status": "success",
  "data": {
    "userId": "507f1f77bcf86cd799439011",
    "username": "creator_name",
    "wallet": {
      "balance": 250.50,
      "pendingBalance": 45.00,
      "totalEarnings": 450.75,
      "currency": "USD",
      "stripeAccountId": "acct_xxx",
      "lastPayout": "2026-04-30T12:00:00Z"
    }
  }
}
```

#### 3. Get Transaction History
```http
GET /api/v1/payments/history?limit=20&skip=0&type=all
Authorization: Bearer {token}

Query Parameters:
- limit: number (default: 20, max: 100)
- skip: number (default: 0)
- type: "all" | "tip" | "withdrawal" | "refund" | "bonus"

Response 200:
{
  "status": "success",
  "data": {
    "transactions": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "type": "tip",
        "status": "completed",
        "amount": 10,
        "from": { "username": "user123" },
        "to": { "username": "creator456" },
        "video": { "title": "My Awesome Video" },
        "createdAt": "2026-05-01T12:00:00Z"
      }
    ],
    "total": 150,
    "skip": 0,
    "limit": 20
  }
}
```

#### 4. Verify Payment
```http
GET /api/v1/payments/verify/{sessionId}
Authorization: Bearer {token}

Response 200:
{
  "status": "success",
  "data": {
    "transactionId": "507f1f77bcf86cd799439011",
    "sessionId": "cs_test_xxx",
    "amount": 10,
    "status": "completed",
    "from": "user123",
    "to": "creator456",
    "video": "My Awesome Video",
    "stripeStatus": "paid"
  }
}
```

#### 5. Stripe Webhook Handler
```http
POST /api/v1/payments/webhook
Stripe-Signature: t=xxx,v1=yyy

Body: Raw JSON from Stripe

Handles Events:
- checkout.session.completed → Update transaction, add to creator wallet
- charge.failed → Mark transaction as failed

Response 200: { "received": true }
```

---

## 🔌 WebSocket (Socket.io) Events

### Connection

**Client → Server:**
```javascript
// Connect to socket with JWT token
const socket = io('http://localhost:5000', {
    auth: {
        token: jwtToken  // JWT from login
    }
});
```

**Server → Client:**
```javascript
// User connected successfully
socket.on('user:connected', (data) => {
    console.log('Connected as:', data.userId, data.username);
});

// Connection lost
socket.on('user:disconnected', (data) => {
    console.log('User disconnected:', data.userId);
});

// Connection error
socket.on('connect_error', (error) => {
    console.error('Socket error:', error);
});
```

### Notifications

#### Like Notification
**Server emits when user likes a video:**
```javascript
socket.on('notification:new-like', (data) => {
    {
        "id": "like-1234567890",
        "type": "like",
        "likerUsername": "user123",
        "videoTitle": "Amazing Video",
        "videoId": "507f1f77bcf86cd799439011",
        "timestamp": "2026-05-01T12:00:00Z"
    }
});
```

#### Tip Notification
**Server emits when user tips a video:**
```javascript
socket.on('notification:new-tip', (data) => {
    {
        "id": "tip-1234567890",
        "type": "tip",
        "tiperUsername": "user123",
        "tipAmount": 10,
        "videoTitle": "Amazing Video",
        "videoId": "507f1f77bcf86cd799439011",
        "timestamp": "2026-05-01T12:00:00Z"
    }
});
```

### Client-Side Events

**Emit Like (called by frontend when user likes):**
```javascript
socket.emit('like:notify', {
    videoOwnerId: "507f1f77bcf86cd799439011",
    likerUsername: "user123",
    videoTitle: "My Video",
    videoId: "507f1f77bcf86cd799439011"
});
```

**Emit Tip (called by frontend when payment succeeds):**
```javascript
socket.emit('tip:notify', {
    videoOwnerId: "507f1f77bcf86cd799439011",
    tiperUsername: "user123",
    tipAmount: 10,
    videoTitle: "My Video",
    videoId: "507f1f77bcf86cd799439011"
});
```

**Mark Notification as Read:**
```javascript
socket.emit('notification:read', 'like-1234567890');
```

---

## 📊 Data Models

### Transaction Schema
```javascript
{
    _id: ObjectId,
    transactionId: String,        // Unique ID
    type: "tip|withdrawal|refund|bonus",
    status: "pending|completed|failed|cancelled",
    amount: Number,               // Total amount
    currency: "USD",
    from: ObjectId,              // Sender user
    to: ObjectId,                // Receiver user
    video: ObjectId,             // Associated video (for tips)
    stripePaymentIntentId: String,
    stripeCheckoutSessionId: String,
    fee: Number,                 // Platform fee
    netAmount: Number,           // Amount after fees
    description: String,
    createdAt: Date,
    completedAt: Date,
    updatedAt: Date
}
```

### User Wallet Fields
```javascript
wallet: {
    balance: Number,             // Available for withdrawal
    pendingBalance: Number,      // Being processed
    totalEarnings: Number,       // All-time earnings
    currency: "USD",
    stripeAccountId: String,     // For payouts
    lastPayout: Date
}
```

---

## 🔐 Error Responses

### 400 Bad Request
```json
{
  "status": "error",
  "message": "Invalid amount: must be between 1 and 10000"
}
```

### 401 Unauthorized
```json
{
  "status": "error",
  "message": "Authentication error"
}
```

### 404 Not Found
```json
{
  "status": "error",
  "message": "Video not found"
}
```

### 429 Too Many Requests
```json
{
  "status": "error",
  "message": "Too many checkout requests, please try again later."
}
```

---

## 🔑 Authentication

All endpoints (except webhook) require Bearer token in Authorization header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

WebSocket requires token in `auth` object during connection.

---

## 💬 Code Examples

### JavaScript/TypeScript (Frontend)

**Create Payment:**
```typescript
import { api } from '@/services/api';

const response = await api.post('/payments/checkout', {
    amount: 10,
    videoId: videoId,
    creatorId: creatorId,
    message: 'Love your content!'
});

window.location.href = response.data.checkoutUrl;
```

**Listen for Notifications:**
```typescript
import socketService from '@/services/socket';

socketService.onNotification((notification) => {
    console.log('Received notification:', notification);
    showToast(notification.message);
});
```

### cURL Examples

**Create Checkout:**
```bash
curl -X POST http://localhost:5000/api/v1/payments/checkout \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 10,
    "videoId": "607f1f77bcf86cd799439011",
    "creatorId": "607f1f77bcf86cd799439012"
  }'
```

**Get Balance:**
```bash
curl -X GET http://localhost:5000/api/v1/payments/balance/607f1f77bcf86cd799439011 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

**Get History:**
```bash
curl -X GET "http://localhost:5000/api/v1/payments/history?limit=10&type=tip" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚙️ Configuration

### Rate Limiting
- Checkout: 60 requests per minute per user
- Auth: 20 requests per 15 minutes
- Upload: 20 requests per hour

### Platform Fees
- Default: 5% of each tip
- Configurable via `PLATFORM_FEE_PERCENT` env var

### Payment Limits
- Minimum: $1.00
- Maximum: $10,000.00 per transaction

---

## 📝 Changelog

### v1.0.0 (Phase 3 - May 1, 2026)
- ✅ Socket.io real-time notifications
- ✅ Stripe payment integration
- ✅ Creator wallet system
- ✅ Transaction history tracking
- ✅ Payment webhook handling
- ✅ Rate limiting on payments
- ✅ Input validation with Zod

---

**Last Updated:** May 1, 2026
**API Version:** 1.0.0
