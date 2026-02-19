import crypto from 'crypto';

/**
 * Gera uma senha provisória aleatória
 * @param length Comprimento da senha (padrão: 8)
 * @returns Senha gerada
 */
export function generateTemporaryPassword(length = 8): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%';
  let password = '';

  const randomBytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    password += chars[randomBytes[i] % chars.length];
  }

  return password;
}

/**
 * Horários de disponibilidade padrão (comercial)
 */
export const DEFAULT_AVAILABLE_HOURS = [
  '08:00', '09:00', '10:00', '11:00',
  '14:00', '15:00', '16:00', '17:00'
];
