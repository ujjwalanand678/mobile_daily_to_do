import React, { useState, useEffect } from 'react';
import { View, Text as RNText, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/theme';
import { SyncService } from '../services/syncService';

export const SyncSettings: React.FC = () => {
  const theme = useTheme();
  const { signInWithGoogle, signOutFromGoogle, isSignedInWithGoogle, syncWithDrive } = useAppStore();
  
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  useEffect(() => {
    checkSignInStatus();
  }, []);

  const checkSignInStatus = async () => {
    try {
      const signedIn = await isSignedInWithGoogle();
      setIsSignedIn(signedIn);
    } catch (error) {
      console.error('Error checking sign-in status:', error);
    }
  };

  const handleSignIn = async () => {
    setIsLoading(true);
    try {
      const success = await signInWithGoogle();
      if (success) {
        setIsSignedIn(true);
        setLastSyncTime(new Date().toLocaleString());
        Alert.alert('Success', 'Successfully signed in with Google Drive!');
      } else {
        Alert.alert('Error', 'Failed to sign in with Google.');
      }
    } catch (error) {
      console.error('Sign-in error:', error);
      Alert.alert('Error', 'An error occurred during sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out? Your data will no longer sync with Google Drive.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await signOutFromGoogle();
              setIsSignedIn(false);
              setLastSyncTime(null);
              Alert.alert('Success', 'Successfully signed out from Google Drive.');
            } catch (error) {
              console.error('Sign-out error:', error);
              Alert.alert('Error', 'An error occurred during sign-out.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleSyncNow = async () => {
    if (!isSignedIn) return;
    
    setIsLoading(true);
    try {
      const result = await syncWithDrive();
      
      switch (result) {
        case 'uploaded':
          Alert.alert('Sync Complete', 'Your data has been uploaded to Google Drive.');
          break;
        case 'downloaded':
          Alert.alert('Sync Complete', 'Your data has been downloaded from Google Drive.');
          break;
        case 'no_action':
          Alert.alert('Sync Complete', 'Your data is already up to date.');
          break;
        case 'error':
          Alert.alert('Sync Error', 'An error occurred during sync. Please try again.');
          break;
      }
      
      setLastSyncTime(new Date().toLocaleString());
    } catch (error) {
      console.error('Sync error:', error);
      Alert.alert('Sync Error', 'An error occurred during sync.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      padding: theme.spacing.lg,
    },
    section: {
      marginBottom: theme.spacing.xl,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.md,
    },
    statusCard: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    statusRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    statusLabel: {
      fontSize: 16,
      color: theme.colors.text,
    },
    statusValue: {
      fontSize: 16,
      fontWeight: '500',
    },
    statusConnected: {
      color: theme.colors.success,
    },
    statusDisconnected: {
      color: theme.colors.error,
    },
    button: {
      backgroundColor: theme.colors.primary,
      paddingVertical: theme.spacing.md,
      paddingHorizontal: theme.spacing.lg,
      borderRadius: theme.borderRadius.md,
      alignItems: 'center',
      marginBottom: theme.spacing.sm,
    },
    buttonSecondary: {
      backgroundColor: theme.colors.surface,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    buttonDanger: {
      backgroundColor: theme.colors.error,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
    buttonTextSecondary: {
      color: theme.colors.text,
    },
    infoText: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: theme.spacing.md,
    },
    lastSyncText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
    },
    loadingContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
      marginLeft: theme.spacing.sm,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <RNText style={styles.sectionTitle}>Google Drive Sync</RNText>
        
        <View style={styles.statusCard}>
          <View style={styles.statusRow}>
            <RNText style={styles.statusLabel}>Status:</RNText>
            <RNText style={[
              styles.statusValue,
              isSignedIn ? styles.statusConnected : styles.statusDisconnected
            ]}>
              {isSignedIn ? 'Connected' : 'Disconnected'}
            </RNText>
          </View>
          
          {lastSyncTime && (
            <View style={styles.statusRow}>
              <RNText style={styles.statusLabel}>Last sync:</RNText>
              <RNText style={styles.lastSyncText}>{lastSyncTime}</RNText>
            </View>
          )}
        </View>

        <RNText style={styles.infoText}>
          Google Drive sync securely backs up your tasks, folders, and tags to your private Google Drive storage. 
          Your data is stored in the hidden appDataFolder and is only accessible by this app.
        </RNText>

        {!isSignedIn ? (
          <TouchableOpacity
            style={styles.button}
            onPress={handleSignIn}
            disabled={isLoading}
          >
            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="white" size="small" />
                <RNText style={styles.loadingText}>Signing in...</RNText>
              </View>
            ) : (
              <RNText style={styles.buttonText}>Sign in with Google</RNText>
            )}
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={styles.button}
              onPress={handleSyncNow}
              disabled={isLoading}
            >
              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator color="white" size="small" />
                  <RNText style={styles.loadingText}>Syncing...</RNText>
                </View>
              ) : (
                <RNText style={styles.buttonText}>Sync Now</RNText>
              )}
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.button, styles.buttonDanger]}
              onPress={handleSignOut}
              disabled={isLoading}
            >
              <RNText style={styles.buttonText}>Sign Out</RNText>
            </TouchableOpacity>
          </>
        )}
      </View>

      <View style={styles.section}>
        <RNText style={styles.sectionTitle}>About Sync</RNText>
        <RNText style={styles.infoText}>
          • Automatic sync happens in the background when you're signed in{'\n'}
          • Your data is encrypted and stored privately in your Google Drive{'\n'}
          • Sync works across all your devices with the same Google account{'\n'}
          • You can sign out at any time to stop syncing
        </RNText>
      </View>
    </View>
  );
};
