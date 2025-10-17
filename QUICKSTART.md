# Quick Start Guide

## Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Initialize Database with Sample Prizes**
   ```bash
   node scripts/init-db.js
   ```

3. **Configure Environment Variables**
   
   The `.env` and `.env.local` files are already configured. Update these values if needed:
   - `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` for notifications
   - `ADMIN_PASSWORD` for admin panel access
   - `IP_HASH_SALT` for security (keep this secret!)

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000)

5. **Build for Production**
   ```bash
   npm run build
   npm start
   ```

## User Flow Testing

### 1. Social Proof & Registration
- Visit `/` (home page)
- Click Instagram → YouTube → Facebook buttons (in sequence)
- Upload screenshot proof for each platform
- Click "Continue to Registration"
- Fill in name, phone, and email
- Submit registration
- You'll receive a ticket code (e.g., `DRM25-KOL-ABC123`)

### 2. Admin Approval
- Visit `/admin`
- Login with password: `DEBJIT`
- Find your ticket in the list
- Click "Approve" button
- Your ticket is now ready for redemption

### 3. Prize Redemption
- Visit `/redeem` or click "Redeem" from success page
- Paste your ticket code
- Click "Redeem Prize"
- Watch the card shuffle animation (3 seconds)
- See your prize!

## Admin Panel Features

### Tickets Tab
- **Search**: Find tickets by phone, code, or name
- **Approve**: Enable ticket for redemption
- **Mark Used**: Mark ticket as redeemed
- **Cancel**: Cancel a ticket
- **View Proofs**: See uploaded screenshots
- **Download**: Download all proofs as ZIP
- **Delete**: Permanently remove ticket (requires code confirmation)
- **Export CSV**: Download all tickets as spreadsheet

### Prizes Tab
- **Add Prize**: Create new vouchers or products
  - Title: Prize name
  - Type: voucher or product
  - Description: Details about the prize
  - Quantity: -1 for unlimited, or specific number
  - Weight: Higher weight = higher probability
- **Manage Prizes**: Edit or delete existing prizes

## Prize Configuration

The system uses weighted random selection:
- **Vouchers**: ~90% probability (total weight ~99)
- **Products**: ≤1% probability (weight 1, capped by `PRODUCT_MAX_PROBABILITY`)

Sample prizes included:
- ₹100 Voucher (weight 40)
- ₹200 Voucher (weight 30)
- ₹500 Voucher (weight 20)
- ₹1000 Voucher (weight 9)
- Premium Product (weight 1, qty 5)

## Telegram Notifications

The system sends notifications for:
- New registrations
- Ticket approvals
- Status changes
- Ticket deletions
- Product wins (highlighted)

Configure your bot:
1. Create bot with [@BotFather](https://t.me/BotFather)
2. Get bot token
3. Get your chat ID (send message to bot, then visit: `https://api.telegram.org/bot<TOKEN>/getUpdates`)
4. Update `.env.local` with token and chat ID

## Security Features

- **Phone Blocking**: One registration per phone number
- **IP Blocking**: SHA-256 hashed IP addresses
- **Device Blocking**: localStorage-based device fingerprinting
- **Rate Limiting**: 5 requests per minute per IP
- **Admin Protection**: Password-protected admin panel
- **Approval System**: Tickets must be approved before redemption

## File Structure

```
/workspace
├── app/
│   ├── api/          # API routes
│   ├── admin/        # Admin panel page
│   ├── redeem/       # Redemption page
│   ├── register/     # Registration page
│   ├── success/      # Success page
│   ├── page.tsx      # Social proof page
│   ├── layout.tsx    # App layout
│   └── globals.css   # Global styles
├── lib/
│   ├── db.ts         # SQLite database
│   ├── config.ts     # Configuration
│   ├── telegram.ts   # Telegram integration
│   ├── utils.ts      # Utility functions
│   └── rateLimit.ts  # Rate limiting
├── data/
│   └── event.db      # SQLite database file (auto-created)
├── public/
│   └── uploads/      # Proof screenshots (auto-created)
└── scripts/
    └── init-db.js    # Database initialization
```

## Troubleshooting

**Problem**: Uploads not working
- Ensure `public/uploads` directory exists and is writable
- Check file size (max 5MB)
- Verify image format (JPG/PNG only)

**Problem**: Telegram not sending
- Verify bot token and chat ID in `.env.local`
- Check bot has permission to send messages
- Test token with: `curl https://api.telegram.org/bot<TOKEN>/getMe`

**Problem**: Build fails
- Delete `.next` folder and rebuild
- Check Node.js version (18+)
- Run `npm install` again

**Problem**: Database locked
- Stop all running instances
- Delete `event.db-shm` and `event.db-wal` files
- Restart server

## Production Deployment

### Vercel
```bash
vercel deploy
```

### Other Platforms
Ensure:
- Node.js 18+ runtime
- Build command: `npm run build`
- Start command: `npm start`
- Environment variables configured
- Persistent storage for `data/` and `public/uploads/`

## License

MIT
