/**
 * Crypto Service using Web Crypto API
 * Implements AES-256 encryption where Key and IV are deterministically derived from the password.
 */

// Helper to convert string to ArrayBuffer
const str2ab = (str: string): ArrayBuffer => {
  const enc = new TextEncoder();
  return enc.encode(str);
};

// Helper to convert ArrayBuffer to string
const ab2str = (buf: ArrayBuffer): string => {
  const dec = new TextDecoder();
  return dec.decode(buf);
};

// Helper to convert ArrayBuffer to Base64
const ab2base64 = (buf: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buf);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

// Helper to convert Base64 to ArrayBuffer
const base642ab = (base64: string): ArrayBuffer => {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

// Derive SHA-256 hash
const sha256 = async (data: ArrayBuffer): Promise<ArrayBuffer> => {
  return await window.crypto.subtle.digest('SHA-256', data);
};

interface CryptoKeys {
  key: CryptoKey;
  iv: Uint8Array;
}

/**
 * Derives Key and IV deterministically from the password.
 * 
 * Requirement: "AES256 encryption KEY and IV are generated based on different 
 * 'password text box' passwords after SHA256... ensure consistency"
 */
const deriveKeyAndIV = async (password: string): Promise<CryptoKeys> => {
  const passwordBuffer = str2ab(password);

  // 1. Generate Key Material: SHA-256(password) -> 32 bytes (256 bits)
  const keyHash = await sha256(passwordBuffer);

  // 2. Generate IV Material: SHA-256(password + 'IV_SALT_FIXED') -> 32 bytes -> Take first 16 bytes for AES-CBC
  // We add a deterministic salt purely to ensure the IV bits are different from the Key bits, 
  // preventing weak key/IV correlation attacks, while remaining deterministic.
  const ivSourceBuffer = str2ab(password + 'SECURE_QR_IV_SALT');
  const ivHash = await sha256(ivSourceBuffer);
  const iv = new Uint8Array(ivHash).slice(0, 16); // AES-CBC requires 16-byte IV

  // 3. Import the Key for AES-CBC
  const key = await window.crypto.subtle.importKey(
    'raw',
    keyHash,
    { name: 'AES-CBC' },
    false,
    ['encrypt', 'decrypt']
  );

  return { key, iv };
};

export const encryptData = async (plainText: string, password: string): Promise<string> => {
  try {
    const { key, iv } = await deriveKeyAndIV(password);
    const dataBuffer = str2ab(plainText);

    const encryptedBuffer = await window.crypto.subtle.encrypt(
      {
        name: 'AES-CBC',
        iv: iv,
      },
      key,
      dataBuffer
    );

    return ab2base64(encryptedBuffer);
  } catch (error) {
    console.error('Encryption failed:', error);
    throw new Error('加密失败');
  }
};

export const decryptData = async (encryptedBase64: string, password: string): Promise<string> => {
  try {
    const { key, iv } = await deriveKeyAndIV(password);
    const encryptedBuffer = base642ab(encryptedBase64);

    const decryptedBuffer = await window.crypto.subtle.decrypt(
      {
        name: 'AES-CBC',
        iv: iv,
      },
      key,
      encryptedBuffer
    );

    return ab2str(decryptedBuffer);
  } catch (error) {
    console.error('Decryption failed:', error);
    // Usually means wrong password or corrupted file
    throw new Error('解密失败：密码错误或文件损坏');
  }
};
