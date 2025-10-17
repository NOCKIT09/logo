export const config = {
  logoUrl: process.env.LOGO_URL || '',
  instagramUrl: process.env.INSTAGRAM_URL || '',
  youtubeUrl: process.env.YOUTUBE_URL || '',
  facebookUrl: process.env.FACEBOOK_URL || '',
  
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || '',
  telegramChatId: process.env.TELEGRAM_CHAT_ID || '',
  
  adminPassword: process.env.ADMIN_PASSWORD || '',
  ipHashSalt: process.env.IP_HASH_SALT || '',
  cityCode: process.env.CITY_CODE || 'KOL',
  productMaxProbability: parseFloat(process.env.PRODUCT_MAX_PROBABILITY || '0.01'),
  rateLimitWindowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '5'),
};
