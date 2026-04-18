import React, { useState, useEffect, useRef } from 'react';
import { View, Text as RNText, StyleSheet, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAppStore } from '../store/useAppStore';
import { useTheme } from '../theme/theme';
import { GradientButton } from './GradientButton';

export const SyncSettings: React.FC = () => {
  const theme = useTheme();
  const { signInWithGoogle, signOutFromGoogle, isSignedInWithGoogle, syncWithDrive } = useAppStore();

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);

  // Pulsing dot animation when connected
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    checkSignInStatus();
  }, []);

  useEffect(() => {
    if (isSignedIn) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.5, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [isSignedIn]);

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
        Alert.alert('Connected!', 'Successfully signed in with Google Drive.');
      } else {
        Alert.alert('Error', 'Failed to sign in with Google.');
      }
    } catch (error) {
      Alert.alert('Error', 'An error occurred during sign-in.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Disconnect Google Drive',
      'Your tasks will no longer sync to Google Drive.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Disconnect',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true);
            try {
              await signOutFromGoogle();
              setIsSignedIn(false);
              setLastSyncTime(null);
            } catch (error) {
              Alert.alert('Error', 'Could not sign out.');
            } finally {
              setIsLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleSyncNow = async () => {
    if (!isSignedIn) return;
    setIsLoading(true);
    try {
      const result = await syncWithDrive();
      const messages: Record<typeof result, string> = {
        uploaded: 'Data uploaded to Google Drive.',
        downloaded: 'Data downloaded from Google Drive.',
        no_action: 'Everything is already up to date.',
        error: 'Sync failed. Please try again.',
      };
      Alert.alert(result === 'error' ? 'Sync Error' : 'Sync Complete', messages[result]);
      setLastSyncTime(new Date().toLocaleString());
    } catch (error) {
      Alert.alert('Sync Error', 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const styles = StyleSheet.create({
    container: { padding: theme.spacing.lg },
    statusRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.md,
    },
    statusLeft: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.sm },
    statusLabel: { fontSize: 16, fontWeight: '600', color: theme.colors.text },
    statusDotWrapper: { width: 20, alignItems: 'center', justifyContent: 'center' },
    statusDot: { width: 10, height: 10, borderRadius: 5 },
    statusText: { fontSize: 13, fontWeight: '600' },
    lastSync: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      fontStyle: 'italic',
      marginBottom: theme.spacing.md,
    },
    infoText: {
      fontSize: 13,
      color: theme.colors.textSecondary,
      lineHeight: 20,
      marginBottom: theme.spacing.md,
    },
    btnGap: { marginTop: theme.spacing.sm },
  });

  return (
    <View style={styles.container}>
      {/* Status row */}
      <View style={styles.statusRow}>
        <View style={styles.statusLeft}>
          <Ionicons name="logo-google" size={20} color={theme.colors.primary} />
          <RNText style={styles.statusLabel}>Google Drive</RNText>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Animated.View style={[styles.statusDot, {
            backgroundColor: isSignedIn ? theme.colors.success : theme.colors.error,
            transform: isSignedIn ? [{ scale: pulseAnim }] : [],
          }]} />
          <RNText style={[styles.statusText, { color: isSignedIn ? theme.colors.success : theme.colors.error }]}>
            {isSignedIn ? 'Connected' : 'Not connected'}
          </RNText>
        </View>
      </View>

      {lastSyncTime && (
        <RNText style={styles.lastSync}>Last synced: {lastSyncTime}</RNText>
      )}

      <RNText style={styles.infoText}>
        Your tasks are backed up securely to your personal Google Drive. Only this app can access the data.
      </RNText>

      {!isSignedIn ? (
        <GradientButton
          label="Connect Google Drive"
          icon="logo-google"
          onPress={handleSignIn}
          loading={isLoading}
          fullWidth
        />
      ) : (
        <>
          <GradientButton
            label="Sync Now"
            icon="cloud-upload-outline"
            onPress={handleSyncNow}
            loading={isLoading}
            fullWidth
          />
          <View style={styles.btnGap}>
            <GradientButton
              label="Disconnect"
              icon="log-out-outline"
              onPress={handleSignOut}
              variant="danger"
              fullWidth
            />
          </View>
        </>
      )}
    </View>
  );
};
