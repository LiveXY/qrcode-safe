
import CryptoJS from 'crypto-js';
import { SecurityContext } from '../types';

/**
 * Generates random AES-256 Key and IV.
 */
export const generateSecurityContext = (): SecurityContext => {
  const key = CryptoJS.lib.WordArray.random(32); // 256 bits
  const iv = CryptoJS.lib.WordArray.random(16);  // 128 bits
  return {
    key: CryptoJS.enc.Hex.stringify(key),
    iv: CryptoJS.enc.Hex.stringify(iv)
  };
};

/**
 * Encrypts plain text using AES-256.
 */
export const encryptData = (data: string, context: SecurityContext): string => {
  const keyHex = CryptoJS.enc.Hex.parse(context.key);
  const ivHex = CryptoJS.enc.Hex.parse(context.iv);

  const encrypted = CryptoJS.AES.encrypt(data, keyHex, {
    iv: ivHex,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return encrypted.toString();
};

/**
 * Decrypts data using AES-256.
 */
export const decryptData = (ciphertext: string, context: SecurityContext): string => {
  try {
    const keyHex = CryptoJS.enc.Hex.parse(context.key);
    const ivHex = CryptoJS.enc.Hex.parse(context.iv);

    const decrypted = CryptoJS.AES.decrypt(ciphertext, keyHex, {
      iv: ivHex,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error("Decryption failed", error);
    return "";
  }
};

/**
 * Creates a .env formatted string for key storage.
 */
export const generateEnvContent = (context: SecurityContext): string => {
  return `AES_KEY=${context.key}\nAES_IV=${context.iv}`;
};
