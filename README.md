# Premium Event Registration Site

A mobile-first event registration system with social proof verification, prize redemption with card shuffle animation, and comprehensive admin management.

## Features

### User Flow
1. **Social + Proof Page**: Gated social media buttons (Instagram → YouTube → Facebook) with screenshot upload verification
2. **Registration**: Phone-based registration with IP/device duplicate blocking
3. **Success**: Display ticket code with copy and redeem options
4. **Redeem**: Admin-approved prize redemption with animated card shuffle

### Admin Panel
- Search and manage tickets by phone/code/name
- Approve tickets for redemption
- Mark tickets as used or cancelled
- View and download proof screenshots
- Manage prize pool with weighted selection
- Export ticket data as CSV
- Real-time Telegram notifications

### Security & Anti-Abuse
- One registration per phone number (enforced server-side)
- IP hash blocking (SHA-256 with salt)
- Device ID blocking (localStorage)
- Rate limiting on critical endpoints
- Admin password protection

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript
- **Backend**: Next.js API Routes
- **Database**: SQLite with better-sqlite3
- **File Storage**: Local filesystem
- **Notifications**: Telegram Bot API

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables (`.env.local`):
   ```env
   LOGO_URL=https://raw.githubusercontent.com/NOCKIT09/logo/main/image.png
   INSTAGRAM_URL=https://www.instagram.com/dreamsunllimited/
   YOUTUBE_URL=https://youtube.com/@dreamsunllimited?si=32NGV0nYhDoNMyqx
   FACEBOOK_URL=https://www.facebook.com/share/17R7faq94G/
   
   TELEGRAM_BOT_TOKEN=your_bot_token
   TELEGRAM_CHAT_ID=your_chat_id
   
   ADMIN_PASSWORD=your_admin_password
   IP_HASH_SALT=your_random_salt
   CITY_CODE=KOL
   PRODUCT_MAX_PROBABILITY=0.01
   RATE_LIMIT_WINDOW_MS=60000
   RATE_LIMIT_MAX=5
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Production Build

```bash
npm run build
npm start
```

## API Routes

- `GET /api/ip` - Get hashed IP for client
- `POST /api/social/start` - Initialize session
- `POST /api/proof/upload` - Upload proof screenshot
- `POST /api/register` - Register new ticket
- `POST /api/redeem` - Redeem ticket (with approval check)
- `GET /api/tickets/:code` - Get ticket details
- `PATCH /api/tickets/:code` - Update ticket (admin)
- `DELETE /api/tickets/:code` - Delete ticket (admin)
- `GET /api/admin/search` - Search tickets
- `GET /api/admin/export` - Export tickets as CSV
- `GET /api/admin/proofs/:code` - View/download proofs
- `POST /api/admin/prizes` - Add prize
- `PATCH /api/admin/prizes/:id` - Update prize
- `DELETE /api/admin/prizes/:id` - Delete prize

## Database Schema

### tickets
- id, name, phone (UNIQUE), email, code (UNIQUE)
- status (active/used/cancelled), approved (0/1)
- createdAt, updatedAt
- ipHash, deviceId, userAgent

### proofs
- id, codeOrSession, platform, filePath, createdAt

### prizes
- id, title, type (voucher/product), description, imageUrl
- quantity, weight, createdAt

### redemptions
- id, ticketCode, prizeId, prizeSnapshotJson
- phone, ipHash, deviceId, createdAt

## Admin Access

Navigate to `/admin` and login with the admin password set in your environment variables.

## Prize System

- **Vouchers**: ~90% probability (configurable)
- **Products**: ≤1% probability (capped by PRODUCT_MAX_PROBABILITY)
- Weighted random selection
- Quantity tracking with auto-fallback

## Deployment

For SPA deployment (Netlify, Vercel, etc.), the `public/_redirects` file ensures all routes are handled by Next.js.

### Vercel
```bash
vercel deploy
```

### Netlify
```bash
netlify deploy --prod
```

## License

MIT
