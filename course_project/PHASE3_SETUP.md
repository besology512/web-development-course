# Phase 3 – Real-Time System & Monetization Setup Guide

## Overview

Phase 3 implements:
- ✅ Socket.io real-time notifications for likes and tips
- ✅ Stripe integration for monetization with test mode
- ✅ Creator wallet and transaction history tracking
- ✅ Enhanced security with rate limiting and validation
- ✅ Advanced UI components (toasts, badges, skeleton loaders)

---

## 🚀 Backend Setup

### 1. Environment Variables

Add these to your `.env` file:

```env
# Stripe Configuration
STRIPE_PUBLIC_KEY=pk_test_xxx  # From Stripe Dashboard
STRIPE_SECRET_KEY=sk_test_xxx  # From Stripe Dashboard  
STRIPE_WEBHOOK_SECRET=whsec_xxx  # Generated after webhook setup

# Platform Configuration
PLATFORM_FEE_PERCENT=5  # 5% platform fee on tips

# Application URLs
CLIENT_URL=http://localhost:3000
API_URL=http://localhost:5000

# Socket.io
SOCKET_IO_ORIGIN=http://localhost:3000

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRE=7d
```

### 2. Install Dependencies (Already Installed)

The backend already has all required packages:
```json
{
  "socket.io": "^4.8.3",
  "stripe": "^22.0.1",
  "zod": "^4.3.6",
  "express-rate-limit": "^8.3.2"
}
```

### 3. Database Models Created

- ✅ **User.js** - Updated with `wallet` fields (balance, pendingBalance, totalEarnings, stripeAccountId)
- ✅ **Transaction.js** - New model for tracking all financial transactions
- ✅ **Tip.js** - Already exists, links tips to videos
- ✅ **Video.js** - Already supports likes
- ✅ **Review.js** - Already exists for video reviews

### 4. Backend Services & Controllers

**New Files Created:**
- ✅ `src/services/socketService.js` - Real-time Socket.io initialization and handlers
- ✅ `src/controllers/paymentController.js` - Stripe checkout and webhook handling
- ✅ `src/routes/paymentRoutes.js` - Payment API endpoints

**Updated Files:**
- ✅ `server.js` - Socket.io integration
- ✅ `src/app.js` - Payment routes and webhook middleware
- ✅ `src/controllers/videoController.js` - Like event emission

### 5. API Endpoints

#### Payments Endpoints
```
POST   /api/v1/payments/checkout          - Create Stripe checkout session
POST   /api/v1/payments/webhook           - Stripe webhook handler  
GET    /api/v1/payments/balance/:userId   - Get creator's wallet
GET    /api/v1/payments/history           - Get transaction history
GET    /api/v1/payments/verify/:sessionId - Verify payment
```

#### Real-Time Events (Socket.io)
```
Socket Events:
- like:notify           - Emitted when user likes a video
- tip:notify            - Emitted when user sends a tip
- notification:new-like - Received by video owner
- notification:new-tip  - Received by video owner
- notification:read     - Mark notification as read
- user:connected        - User comes online
- user:disconnected     - User goes offline
```

### 6. Running Backend

```bash
cd clipsphere-backend
npm install
npm run dev
```

Server will run on `http://localhost:5000` with WebSocket on same port.

---

## 🎯 Frontend Setup

### 1. New Components Created

```
components/
├── Toast.tsx                  # Toast notification bubbles
├── NotificationBadge.tsx      # Activity badge for navbar
├── TipModal.tsx              # Tip payment modal
├── CreatorBalance.tsx        # Creator earnings dashboard
└── SkeletonLoader.tsx        # Loading placeholders
```

### 2. New Hooks Created

```
hooks/
└── useNotifications.ts       # Manage notifications & Socket.io
```

### 3. New Services Created

```
services/
└── socket.ts                 # Socket.io client service
```

### 4. Integration Steps

#### Step 1: Update NavBar Component

Add notification badge and toast container:

```tsx
// components/NavBar.tsx
'use client';

import { useNotifications } from '@/hooks/useNotifications';
import { NotificationBadge } from './NotificationBadge';
import { ToastContainer } from './Toast';
import { useState } from 'react';

export const NavBar = () => {
    const { notifications, unreadCount, removeNotification } = useNotifications();
    const [toasts, setToasts] = useState<Array<{ id: string; message: string; type?: string }>>([]);

    // When notification arrives, show toast
    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0];
            const toast = {
                id: latest.id,
                message: latest.message,
                type: 'notification'
            };
            setToasts(prev => [toast, ...prev]);
        }
    }, [notifications]);

    const handleRemoveToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    return (
        <>
            <nav className="flex items-center justify-between p-4">
                {/* ... other nav items ... */}
                <NotificationBadge count={unreadCount} onClick={() => {/* open notifications */}} />
            </nav>
            <ToastContainer toasts={toasts} onClose={handleRemoveToast} />
        </>
    );
};
```

#### Step 2: Add Tip Button to Video

```tsx
// In your video detail/card component
import { TipModal } from '@/components/TipModal';
import { useState } from 'react';

export const VideoDetail = ({ video }) => {
    const [showTipModal, setShowTipModal] = useState(false);

    return (
        <>
            <button
                onClick={() => setShowTipModal(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg"
            >
                💖 Send Tip
            </button>
            
            <TipModal
                isOpen={showTipModal}
                onClose={() => setShowTipModal(false)}
                creatorId={video.owner._id}
                videoId={video._id}
                videoTitle={video.title}
            />
        </>
    );
};
```

#### Step 3: Add Creator Balance Page

```tsx
// app/creator/balance/page.tsx
import { CreatorBalance } from '@/components/CreatorBalance';
import { getAuth } from '@/lib/auth';

export default async function BalancePage() {
    const { user } = await getAuth();
    return <CreatorBalance userId={user.id} />;
}
```

### 5. Frontend Environment Variables

Add to `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_xxx
```

### 6. Running Frontend

```bash
cd clipsphere-frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`.

---

## 💳 Stripe Configuration (Local Testing)

### 1. Install Stripe CLI

**Windows:**
```bash
# Download from: https://github.com/stripe/stripe-cli/releases
# Or using scoop:
scoop install stripe
```

**Mac:**
```bash
brew install stripe/stripe-cli/stripe
```

**Linux:**
```bash
wget https://github.com/stripe/stripe-cli/releases/download/v1.x.x/stripe_1.x.x_linux_x86_64.tar.gz
tar -xvf stripe_*.tar.gz
sudo mv stripe /usr/local/bin
```

### 2. Login to Stripe

```bash
stripe login
```

This opens a browser to authenticate. Approve the login.

### 3. Forward Stripe Webhooks Locally

```bash
stripe listen --forward-to localhost:5000/api/v1/payments/webhook
```

This outputs:
- ✅ Ready to accept webhook events from Stripe
- ✅ `STRIPE_WEBHOOK_SECRET` (copy to `.env`)

**Keep this terminal open** while testing.

### 4. Trigger Test Events

In another terminal:

```bash
# Simulate successful payment
stripe trigger charge.succeeded

# List recent webhook events
stripe logs tail

# Get test card numbers
stripe samples
```

**Test Card Numbers (Stripe):**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Auth Required: `4000 0025 0000 3155`

---

## 🧪 Testing Workflow

### 1. Test Like Notification

1. Login as User A
2. Login as User B (different browser/incognito)
3. User B watches User A's video
4. User B clicks "Like"
5. ✅ User A should receive toast: "User B liked your video"

### 2. Test Tip Payment

1. Login as Creator (User A)
2. Login as Tipper (User B)
3. User B visits Creator's video
4. User B clicks "Send Tip" → $5
5. Redirected to Stripe checkout
6. Enter test card: `4242 4242 4242 4242`
7. Exp: `12/34`, CVC: `567`
8. Pay
9. ✅ Success page
10. ✅ Creator receives notification
11. ✅ Creator's balance updated
12. ✅ Transaction in history

### 3. Check Webhook (Stripe CLI Terminal)

```
2026-05-01 12:34:56.789 → charge.succeeded [ch_1xxx]
2026-05-01 12:34:56.890 → payment_intent.succeeded [pi_1xxx]
2026-05-01 12:34:56.991 → checkout.session.completed [cs_1xxx]
```

---

## 🔒 Security Checklist

- ✅ JWT authentication on Socket.io
- ✅ Rate limiting on payment endpoints (60 per minute)
- ✅ Stripe webhook signature verification
- ✅ Zod input validation on all payment inputs
- ✅ CORS configured for local requests
- ✅ Helmet security headers
- ✅ No sensitive data in client-side code
- ✅ Transaction amounts validated server-side

---

## 📊 Database Migrations (if needed)

If updating existing database:

```bash
# Update User schema with wallet fields
db.users.updateMany({}, { 
    $set: { 
        wallet: {
            balance: 0,
            pendingBalance: 0,
            totalEarnings: 0,
            currency: "USD"
        }
    }
})

# Ensure indexes
db.transactions.createIndex({ "from": 1, "createdAt": -1 })
db.transactions.createIndex({ "to": 1, "createdAt": -1 })
db.transactions.createIndex({ "stripePaymentIntentId": 1 })
```

---

## 🐛 Troubleshooting

### Socket.io Connection Issues
```
Error: Authentication error
→ Check JWT token is being sent
→ Verify token is not expired
```

### Stripe Webhook Not Received
```
No POST requests to /payments/webhook
→ Ensure Stripe CLI is running: stripe listen --forward-to ...
→ Check webhook URL is correct in Stripe Dashboard
```

### Rate Limit Hit
```
Error: Too many requests
→ Wait 1 minute or restart server
→ Adjust RATE_LIMIT_WINDOW in .env
```

### Notifications Not Showing
```
Toast not appearing
→ Check useNotifications hook is called in component
→ Verify Socket.io is connected in browser console
→ Check for JS errors in console
```

---

## 📈 Next Steps (Phase 4)

- [ ] Email notifications for tips
- [ ] Withdrawal/payout management
- [ ] Creator analytics dashboard
- [ ] Tax documentation for US creators
- [ ] Subscription model (Patreon-like)
- [ ] Gift card support

---

## 📞 Support

For issues or questions:
1. Check browser console for errors
2. Check server logs (`npm run dev` output)
3. Verify `.env` variables match documentation
4. Test Socket.io connection at `ws://localhost:5000`
5. Verify Stripe webhooks are being forwarded

---

**Last Updated:** May 1, 2026
**Status:** ✅ Phase 3 Complete
