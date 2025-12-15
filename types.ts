export enum AppRoute {
  HOME = 'home',
  SCAN = 'scan',
  READ = 'read',
}

export interface EncryptedFileContent {
  data: string; // Base64 encoded encrypted string
  // Note: We purposefully do not store salt/IV here as per requirements to derive them solely from password deterministically
}
