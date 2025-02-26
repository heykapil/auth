import crypto from "crypto";
export function generateNanoId(length: number) {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const alphabetLength = alphabet.length;
  let id = '';

  while (id.length < length) {
    const bytes = crypto.randomBytes(length);
    for (const byte of bytes) {
      // Skip bytes that would create modulo bias
      if (byte >= 256 - (256 % alphabetLength)) continue;
      id += alphabet[byte % alphabetLength];
      if (id.length === length) break;
    }
  }
  return id;
}
export function generateUserID() {
  // Get current time in seconds (Unix timestamp)
  const unixTimestamp = Math.floor(Date.now() / 1000);
  // Convert to hexadecimal string
  const unixHex =  unixTimestamp.toString(16);
  const randomHex = generateNanoId(4);
  return `${randomHex}-${unixHex}`
}
