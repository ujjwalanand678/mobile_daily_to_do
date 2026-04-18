import React, { useRef, useEffect } from 'react';
import { View, Text as RNText, TouchableOpacity, StyleSheet, Animated, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../theme/theme';

type SmartListType = 'inbox' | 'today' | 'upcoming';

interface ListConfig {
  id: SmartListType;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  activeIcon: keyof typeof Ionicons.glyphMap;
  count: number;
}

interface SmartListsProps {
  selectedList: SmartListType;
  onListChange: (list: SmartListType) => void;
  inboxCount: number;
  todayCount: number;
  upcomingCount: number;
}

function SmartListPill({
  config,
  isActive,
  onPress,
}: {
  config: ListConfig;
  isActive: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isActive ? 1.04 : 1,
      useNativeDriver: true,
      tension: 280,
      friction: 12,
    }).start();
  }, [isActive]);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {isActive ? (
          <LinearGradient
            colors={[theme.colors.primaryGradientStart, theme.colors.primaryGradientEnd]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.pill}
          >
            <Ionicons name={config.activeIcon} size={15} color="#FFF" />
            <RNText style={[styles.pillText, { color: '#FFF' }]}>{config.label}</RNText>
            {config.count > 0 && (
              <View style={styles.countBadgeActive}>
                <RNText style={[styles.countText, { color: theme.colors.primary }]}>
                  {config.count}
                </RNText>
              </View>
            )}
          </LinearGradient>
        ) : (
          <View style={[styles.pill, {
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.border,
          }]}>
            <Ionicons name={config.icon} size={15} color={theme.colors.textSecondary} />
            <RNText style={[styles.pillText, { color: theme.colors.textSecondary }]}>{config.label}</RNText>
            {config.count > 0 && (
              <View style={[styles.countBadgeActive, { backgroundColor: theme.colors.border }]}>
                <RNText style={[styles.countText, { color: theme.colors.textSecondary }]}>
                  {config.count}
                </RNText>
              </View>
            )}
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    gap: 6,
    marginRight: 8,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.1,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 1,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: 11,
    fontWeight: '800',
  },
});

export const SmartLists: React.FC<SmartListsProps> = ({
  selectedList,
  onListChange,
  inboxCount,
  todayCount,
  upcomingCount,
}) => {
  const theme = useTheme();

  const lists: ListConfig[] = [
    { id: 'inbox', label: 'Inbox', icon: 'file-tray-outline', activeIcon: 'file-tray', count: inboxCount },
    { id: 'today', label: 'Today', icon: 'today-outline', activeIcon: 'today', count: todayCount },
    { id: 'upcoming', label: 'Upcoming', icon: 'calendar-clear-outline', activeIcon: 'calendar-clear', count: upcomingCount },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.sm,
        paddingTop: 2,
      }}
    >
      {lists.map(list => (
        <SmartListPill
          key={list.id}
          config={list}
          isActive={selectedList === list.id}
          onPress={() => onListChange(list.id)}
        />
      ))}
    </ScrollView>
  );
};
