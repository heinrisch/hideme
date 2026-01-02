const API_KEY_PATTERNS = [
  { name: 'Twitch Stream Key', pattern: /live_\d+_[a-zA-Z0-9]{40}/g, replacement: '[TWITCH_KEY_HIDDEN]' },
  { name: 'AWS Access Key', pattern: /AKIA[0-9A-Z]{16}/g, replacement: '[AWS_KEY_HIDDEN]' },
  { name: 'AWS Secret Key', pattern: /(?:aws_secret_access_key|AWS_SECRET_ACCESS_KEY)[\s:=]+[A-Za-z0-9/+=]{40}/g, replacement: '[AWS_SECRET_HIDDEN]' },
  { name: 'GitHub Token', pattern: /ghp_[a-zA-Z0-9]{36}/g, replacement: '[GITHUB_TOKEN_HIDDEN]' },
  { name: 'GitHub OAuth', pattern: /gho_[a-zA-Z0-9]{36}/g, replacement: '[GITHUB_OAUTH_HIDDEN]' },
  { name: 'Stripe Secret Key', pattern: /sk_live_[a-zA-Z0-9]{24,}/g, replacement: '[STRIPE_KEY_HIDDEN]' },
  { name: 'Stripe Publishable Key', pattern: /pk_live_[a-zA-Z0-9]{24,}/g, replacement: '[STRIPE_PK_HIDDEN]' },
  { name: 'Google API Key', pattern: /AIza[0-9A-Za-z_-]{35}/g, replacement: '[GOOGLE_API_HIDDEN]' },
  { name: 'Discord Bot Token', pattern: /[MN][A-Za-z\d]{23}\.[\w-]{6}\.[\w-]{27}/g, replacement: '[DISCORD_TOKEN_HIDDEN]' },
  { name: 'Slack Token', pattern: /xox[baprs]-[0-9a-zA-Z]{10,48}/g, replacement: '[SLACK_TOKEN_HIDDEN]' },
  { name: 'Generic API Key', pattern: /(?:api[_-]?key|apikey|api[_-]?secret)[\s:=]+['"]?[a-zA-Z0-9_\-]{20,}['"]?/gi, replacement: '[API_KEY_HIDDEN]' },
  { name: 'Bearer Token', pattern: /Bearer\s+[a-zA-Z0-9_\-\.]{20,}/g, replacement: 'Bearer [TOKEN_HIDDEN]' },
  { name: 'JWT Token', pattern: /eyJ[a-zA-Z0-9_-]*\.eyJ[a-zA-Z0-9_-]*\.[a-zA-Z0-9_-]*/g, replacement: '[JWT_TOKEN_HIDDEN]' },
  { name: 'Email Address', pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, replacement: '[EMAIL_HIDDEN]' }
];

if (typeof module !== 'undefined' && module.exports) module.exports = { API_KEY_PATTERNS };
