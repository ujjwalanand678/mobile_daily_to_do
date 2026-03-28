import { Platform } from 'react-native';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export interface SyncMetadata {
  lastSyncTime: number;
  deviceId: string;
  appVersion: string;
}

export interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}

export class GoogleDriveSyncEngine {
  private static readonly APP_DATA_FILE = 'daily_todo_backup.json';
  private static readonly METADATA_FILE = 'sync_metadata.json';
  
  static async configure(): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('Google Sign-In not supported on web');
      return;
    }

    GoogleSignin.configure({
      webClientId: 'your-web-client-id.apps.googleusercontent.com', // Replace with actual client ID
      offlineAccess: true,
      forceCodeForRefreshToken: true,
      iosClientId: 'your-ios-client-id.apps.googleusercontent.com', // Replace with actual client ID
    });
  }

  static async signIn(): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('Google Sign-In not supported on web');
      return false;
    }

    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();
      
      // Check if we have the required scope
      const hasRequiredScope = userInfo.user.scopes?.includes('https://www.googleapis.com/auth/drive.appdata');
      
      if (!hasRequiredScope) {
        console.log('Requesting additional permissions...');
        // Sign out and sign in again with additional scopes
        await GoogleSignin.signOut();
        await GoogleSignin.signInWithScopes(['https://www.googleapis.com/auth/drive.appdata']);
      }
      
      return true;
    } catch (error) {
      console.error('Google Sign-In error:', error);
      return false;
    }
  }

  static async signOut(): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      await GoogleSignin.signOut();
    } catch (error) {
      console.error('Google Sign-Out error:', error);
    }
  }

  static async isSignedIn(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    
    try {
      return await GoogleSignin.isSignedIn();
    } catch (error) {
      console.error('Check sign-in status error:', error);
      return false;
    }
  }

  static async getAccessToken(): Promise<string | null> {
    if (Platform.OS === 'web') return null;
    
    try {
      const userInfo = await GoogleSignin.getTokens();
      return userInfo.accessToken;
    } catch (error) {
      console.error('Get access token error:', error);
      return null;
    }
  }

  private static async makeRequest(url: string, options: RequestInit = {}): Promise<Response> {
    const accessToken = await this.getAccessToken();
    
    if (!accessToken) {
      throw new Error('No access token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response;
  }

  static async uploadToDrive(data: string): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('Mock: Uploading to Google Drive');
      return;
    }

    try {
      // First, check if file exists
      const existingFile = await this.findFile(this.APP_DATA_FILE);
      
      const metadata = {
        name: this.APP_DATA_FILE,
        parents: ['appDataFolder'],
      };

      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', new Blob([data], { type: 'application/json' }));

      let url = 'https://www.googleapis.com/upload/drive/v3/files';
      let method = 'POST';

      if (existingFile) {
        // Update existing file
        url = `https://www.googleapis.com/upload/drive/v3/files/${existingFile.id}`;
        method = 'PATCH';
        formData.delete('parents'); // Don't include parents in update
      }

      const accessToken = await this.getAccessToken();
      if (!accessToken) throw new Error('No access token');

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      console.log('Successfully uploaded to Google Drive');
    } catch (error) {
      console.error('Upload to Drive error:', error);
      throw error;
    }
  }

  static async downloadFromDrive(): Promise<string | null> {
    if (Platform.OS === 'web') {
      console.log('Mock: Downloading from Google Drive');
      return null;
    }

    try {
      const file = await this.findFile(this.APP_DATA_FILE);
      
      if (!file) {
        console.log('No backup file found in Drive');
        return null;
      }

      const response = await this.makeRequest(
        `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`
      );

      const data = await response.text();
      console.log('Successfully downloaded from Google Drive');
      return data;
    } catch (error) {
      console.error('Download from Drive error:', error);
      return null;
    }
  }

  static async getDriveFileMetadata(): Promise<DriveFile | null> {
    if (Platform.OS === 'web') {
      console.log('Mock: Getting Drive file metadata');
      return null;
    }

    try {
      return await this.findFile(this.APP_DATA_FILE);
    } catch (error) {
      console.error('Get Drive metadata error:', error);
      return null;
    }
  }

  private static async findFile(fileName: string): Promise<DriveFile | null> {
    if (Platform.OS === 'web') {
      return null;
    }

    try {
      const response = await this.makeRequest(
        `https://www.googleapis.com/drive/v3/files?q=name='${fileName}' and trashed=false and 'appDataFolder' in parents&fields=id,name,modifiedTime,size`
      );

      const data = await response.json();
      
      if (data.files && data.files.length > 0) {
        return data.files[0];
      }
      
      return null;
    } catch (error) {
      console.error('Find file error:', error);
      return null;
    }
  }

  static async getLocalMetadata(): Promise<SyncMetadata | null> {
    try {
      const storage = this.getStorage();
      const metadata = storage.getString(this.METADATA_FILE);
      return metadata ? JSON.parse(metadata) : null;
    } catch (error) {
      console.error('Get local metadata error:', error);
      return null;
    }
  }

  static async saveLocalMetadata(metadata: SyncMetadata): Promise<void> {
    try {
      const storage = this.getStorage();
      storage.set(this.METADATA_FILE, JSON.stringify(metadata));
    } catch (error) {
      console.error('Save local metadata error:', error);
    }
  }

  private static getStorage() {
    if (Platform.OS === 'web') {
      return {
        getString: (key: string) => localStorage.getItem(key) || undefined,
        set: (key: string, value: string) => localStorage.setItem(key, value),
        delete: (key: string) => localStorage.removeItem(key),
      };
    } else {
      const { MMKV } = require('react-native-mmkv');
      return new MMKV({ id: 'google-drive-sync' });
    }
  }

  static generateDeviceId(): string {
    // Simple device ID generation
    const random = Math.random().toString(36).substring(2);
    const timestamp = Date.now().toString(36);
    return `${random}-${timestamp}`;
  }

  static async shouldSync(): Promise<boolean> {
    const isSignedIn = await this.isSignedIn();
    if (!isSignedIn) return false;

    const driveMetadata = await this.getDriveFileMetadata();
    const localMetadata = await this.getLocalMetadata();

    if (!driveMetadata && !localMetadata) {
      // First time sync - upload local data
      return true;
    }

    if (!driveMetadata && localMetadata) {
      // No remote data, upload local
      return true;
    }

    if (driveMetadata && !localMetadata) {
      // No local metadata, download from drive
      return true;
    }

    if (driveMetadata && localMetadata) {
      // Compare timestamps
      const driveTime = new Date(driveMetadata.modifiedTime).getTime();
      const localTime = localMetadata.lastSyncTime;
      
      return Math.abs(driveTime - localTime) > 60000; // 1 minute threshold
    }

    return false;
  }

  static async performSync(localData: string): Promise<'uploaded' | 'downloaded' | 'no_action'> {
    const driveMetadata = await this.getDriveFileMetadata();
    const localMetadata = await this.getLocalMetadata();

    if (!driveMetadata && !localMetadata) {
      // First time - upload local data
      await this.uploadToDrive(localData);
      await this.saveLocalMetadata({
        lastSyncTime: Date.now(),
        deviceId: this.generateDeviceId(),
        appVersion: '1.0.0',
      });
      return 'uploaded';
    }

    if (!driveMetadata && localMetadata) {
      // No remote data, upload local
      await this.uploadToDrive(localData);
      await this.saveLocalMetadata({
        ...localMetadata,
        lastSyncTime: Date.now(),
      });
      return 'uploaded';
    }

    if (driveMetadata && !localMetadata) {
      // No local metadata, download from drive
      const remoteData = await this.downloadFromDrive();
      if (remoteData) {
        await this.saveLocalMetadata({
          lastSyncTime: new Date(driveMetadata.modifiedTime).getTime(),
          deviceId: this.generateDeviceId(),
          appVersion: '1.0.0',
        });
        return 'downloaded';
      }
    }

    if (driveMetadata && localMetadata) {
      // Compare timestamps
      const driveTime = new Date(driveMetadata.modifiedTime).getTime();
      const localTime = localMetadata.lastSyncTime;

      if (driveTime > localTime) {
        // Remote is newer, download
        const remoteData = await this.downloadFromDrive();
        if (remoteData) {
          await this.saveLocalMetadata({
            lastSyncTime: driveTime,
            deviceId: this.generateDeviceId(),
            appVersion: '1.0.0',
          });
          return 'downloaded';
        }
      } else if (localTime > driveTime) {
        // Local is newer, upload
        await this.uploadToDrive(localData);
        await this.saveLocalMetadata({
          ...localMetadata,
          lastSyncTime: Date.now(),
        });
        return 'uploaded';
      }
    }

    return 'no_action';
  }
}
