export function validateEnv() {
  const requiredEnvs = ['NEXT_PUBLIC_GOOGLE_AI_API_KEY'];
  
  for (const env of requiredEnvs) {
    if (!process.env[env]) {
      throw new Error(`Missing required environment variable: ${env}`);
    }
  }
} 