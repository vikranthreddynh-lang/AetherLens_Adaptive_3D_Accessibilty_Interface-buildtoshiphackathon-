import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load .env from apps/api or root
dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(4000),
  FRONTEND_ORIGIN: z.string().default('http://localhost:5173'),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(10),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),

  GEMINI_API_KEY: z.string().min(10),
  GEMINI_LIVE_MODEL: z.string().default('gemini-3.8-flash'),
  GEMINI_SUMMARY_MODEL: z.string().default('gemini-3.8-flash'),

  MAX_AUDIO_CHUNK_BYTES: z.coerce.number().default(65536),
  MAX_VIDEO_FRAME_BYTES: z.coerce.number().default(1048576),
  MAX_WEBSOCKET_MESSAGE_BYTES: z.coerce.number().default(2097152),

  MAX_LIVE_SESSIONS_PER_USER: z.coerce.number().default(1),
  MAX_GUEST_SESSIONS_PER_IP: z.coerce.number().default(5),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(60),
  AI_RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(20),

  LIVE_SESSION_MAX_DURATION_MS: z.coerce.number().default(300000), // 5 minutes standard real-time session
  WEBSOCKET_IDLE_TIMEOUT_MS: z.coerce.number().default(60000),
  WS_RECONNECT_LIMIT: z.coerce.number().default(3),

  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
});

const parsed = EnvSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('CRITICAL: Environment validation failed:');
  console.error(JSON.stringify(parsed.error.format(), null, 2));
  process.exit(1);
}

export const env = parsed.data;
