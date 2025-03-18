import { generateToken } from './token';

interface NfcLinkOptions {
  studentId: string;
  groupId?: string;
  courseId?: string;
}

interface NfcLinkResponse {
  token: string;
  url: string;
  expires: Date;
  expiresIn: string;
}

/**
 * Generate a dynamic link in response to an NFC tap
 * @param options Options including student ID and optional group/course IDs
 * @returns Response object with token, URL and expiration details
 */
export async function generateNfcLink(options: NfcLinkOptions): Promise<NfcLinkResponse> {
  const { studentId, groupId, courseId } = options;
  
  // Validate student ID
  if (!studentId || !/^\d{7}$/.test(studentId)) {
    throw new Error('Invalid student ID. Must be a 7-digit number.');
  }
  
  // Generate token
  const { token, expires } = generateToken(studentId);
  
  // Get base URL from environment or use default for dev
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  
  // Format full URL
  const url = `${baseUrl}/link/${token}`;
  
  // Calculate human-readable expiration time
  const expiresIn = formatExpirationTime(expires);
  
  // Return response
  return {
    token,
    url,
    expires,
    expiresIn,
  };
}

/**
 * Format expiration time into a human-readable string
 * @param expiresDate The expiration date
 * @returns Formatted string showing when the token expires
 */
function formatExpirationTime(expiresDate: Date): string {
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

/**
 * Log NFC access attempt for audit purposes
 * @param studentId Student ID attempting access
 * @param success Whether access was granted
 * @param details Additional details about the access attempt
 */
export async function logNfcAccess(
  studentId: string, 
  success: boolean, 
  details?: Record<string, any>
): Promise<void> {
  // In a real implementation, this would write to a database or log service
  console.log(`NFC Access: ${success ? 'SUCCESS' : 'FAIL'} - Student ID: ${studentId}`, details);
  
  // Here you would typically:
  // 1. Add a timestamp
  // 2. Store the IP address
  // 3. Store the device information
  // 4. Log to your database
}