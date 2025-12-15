
export enum AppScreen {
  HOME = 'HOME',
  SCAN_QR = 'SCAN_QR',
  SCAN_RESULT = 'SCAN_RESULT',
  READ_FILE = 'READ_FILE',
  READ_RESULT = 'READ_RESULT'
}

export interface SecurityContext {
  key: string; // Hex string
  iv: string;  // Hex string
}

export interface EncryptedFileContent {
  ciphertext: string;
}

// Defines the structure of the .qrd file content (JSON)
export interface QRDFile {
  version: string;
  data: string; // Base64 encrypted string
}
