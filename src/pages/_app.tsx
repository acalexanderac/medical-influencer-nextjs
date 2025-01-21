import { validateEnv } from '@/lib/env';

// Validar variables de entorno en desarrollo
if (process.env.NODE_ENV === 'development') {
  validateEnv();
} 