import crypto from 'crypto';

interface TokenData {
  studentId: string;
  createdAt: number;
  expiresAt: number;
}

interface ValidateResult {
  valid: boolean;
  studentId?: string;
  expired?: boolean;
  error?: string;
}

// Token validity duration in milliseconds (4 hours)
const TOKEN_VALIDITY_MS = 4 * 60 * 60 * 1000;

// Secret key for token encryption (should be in environment variables in production)
const SECRET_KEY = process.env.TOKEN_SECRET_KEY || 'your-secret-key-change-in-production';

/**
 * Generate a secure token for a student
 * @param studentId 7-digit student identifier
 * @returns Object containing the token and expiration details
 */
export function generateToken(studentId: string): { token: string; expires: Date } {
  // Validate student ID format
  if (!/^\d{7}$/.test(studentId)) {
    throw new Error('Invalid student ID format. Must be 7 digits.');
  }

  const now = Date.now();
  const expiresAt = now + TOKEN_VALIDITY_MS;

  // Create token data
  const tokenData: TokenData = {
    studentId,
    createdAt: now,
    expiresAt,
  };

  // Convert data to string and encrypt
  const dataString = JSON.stringify(tokenData);
  
  // Create a cipher using the secret key
  const cipher = crypto.createCipher('aes-256-cbc', SECRET_KEY);
  
  // Encrypt the data
  let encryptedData = cipher.update(dataString, 'utf8', 'base64');
  encryptedData += cipher.final('base64');
  
  // URL-safe base64
  const token = encryptedData
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  
  return {
    token,
    expires: new Date(expiresAt),
  };
}

/**
 * Validate a token and extract the student ID
 * @param token The token to validate
 * @returns Validation result with student ID if valid
 */
export function validateToken(token: string): ValidateResult {
  try {
    // Restore padding and convert URL-safe characters back
    const paddedToken = token
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    
    // Decrypt token
    const decipher = crypto.createDecipher('aes-256-cbc', SECRET_KEY);
    let decryptedData = decipher.update(paddedToken, 'base64', 'utf8');
    decryptedData += decipher.final('utf8');
    
    // Parse token data
    const tokenData: TokenData = JSON.parse(decryptedData);
    
    // Check if token is expired
    const now = Date.now();
    if (tokenData.expiresAt < now) {
      return {
        valid: false,
        expired: true,
        error: 'Token has expired',
      };
    }
    
    // Token is valid
    return {
      valid: true,
      studentId: tokenData.studentId,
    };
  } catch (error) {
    return {
      valid: false,
      error: 'Invalid token',
    };
  }
}

/**
 * Format expiration time into a human-readable string
 * @param expiresDate The expiration date
 * @returns Formatted string showing when the token expires
 */
export function formatExpirationTime(expiresDate: Date): string {
  const now = new Date();
  const diffMs = expiresDate.getTime() - now.getTime();
  const diffMinutes = Math.round(diffMs / 60000);
  
  if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
  }
  
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;
  
  if (minutes === 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`;
  }
  
  return `${hours} hour${hours !== 1 ? 's' : ''} and ${minutes} minute${minutes !== 1 ? 's' : ''}`;
}