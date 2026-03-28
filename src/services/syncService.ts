import { Platform } from 'react-native';
import { GoogleDriveSyncEngine } from '../utils/googleDriveSync';
import { AppState } from '../types';

export class SyncService {
  private static readonly SYNC_KEY = 'app-storage';
  
  static async initialize(): Promise<void> {
    if (Platform.OS === 'web') {
      console.log('Sync service not available on web');
      return;
    }

    try {
      await GoogleDriveSyncEngine.configure();
    } catch (error) {
      console.error('Failed to configure Google Drive sync:', error);
    }
  }

  static async signIn(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    
    try {
      return await GoogleDriveSyncEngine.signIn();
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      return false;
    }
  }

  static async signOut(): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      await GoogleDriveSyncEngine.signOut();
    } catch (error) {
      console.error('Google Sign-Out failed:', error);
    }
  }

  static async isSignedIn(): Promise<boolean> {
    if (Platform.OS === 'web') return false;
    
    try {
      return await GoogleDriveSyncEngine.isSignedIn();
    } catch (error) {
      console.error('Check sign-in status failed:', error);
      return false;
    }
  }

  static async syncWithDrive(localState: AppState): Promise<'uploaded' | 'downloaded' | 'no_action' | 'error'> {
    if (Platform.OS === 'web') {
      console.log('Mock: Sync with Google Drive');
      return 'no_action';
    }

    try {
      const shouldSync = await GoogleDriveSyncEngine.shouldSync();
      if (!shouldSync) {
        return 'no_action';
      }

      // Serialize local state
      const serializedState = JSON.stringify(localState);
      
      // Perform sync
      const result = await GoogleDriveSyncEngine.performSync(serializedState);
      
      console.log(`Sync result: ${result}`);
      return result;
    } catch (error) {
      console.error('Sync with Drive failed:', error);
      return 'error';
    }
  }

  static async downloadFromDrive(): Promise<AppState | null> {
    if (Platform.OS === 'web') {
      console.log('Mock: Download from Google Drive');
      return null;
    }

    try {
      const data = await GoogleDriveSyncEngine.downloadFromDrive();
      if (data) {
        return JSON.parse(data) as AppState;
      }
      return null;
    } catch (error) {
      console.error('Download from Drive failed:', error);
      return null;
    }
  }

  static async uploadToDrive(state: AppState): Promise<boolean> {
    if (Platform.OS === 'web') {
      console.log('Mock: Upload to Google Drive');
      return true;
    }

    try {
      const serializedState = JSON.stringify(state);
      await GoogleDriveSyncEngine.uploadToDrive(serializedState);
      return true;
    } catch (error) {
      console.error('Upload to Drive failed:', error);
      return false;
    }
  }

  static async getLocalState(): Promise<AppState | null> {
    try {
      const storage = this.getStorage();
      const data = storage.getString(this.SYNC_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Get local state failed:', error);
      return null;
    }
  }

  static async saveLocalState(state: AppState): Promise<void> {
    try {
      const storage = this.getStorage();
      storage.set(this.SYNC_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Save local state failed:', error);
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
      return new MMKV();
    }
  }

  static async performBackgroundSync(): Promise<void> {
    if (Platform.OS === 'web') return;
    
    try {
      const isSignedIn = await this.isSignedIn();
      if (!isSignedIn) return;

      const localState = await this.getLocalState();
      if (!localState) return;

      const result = await this.syncWithDrive(localState);
      
      if (result === 'downloaded') {
        // Reload the app state from Drive
        const remoteState = await this.downloadFromDrive();
        if (remoteState) {
          await this.saveLocalState(remoteState);
          console.log('Background sync: Downloaded and applied remote state');
        }
      }
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
}
