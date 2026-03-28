import React from 'react';
import { View, Text as RNText, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/theme';

type SmartListType = 'inbox' | 'today' | 'upcoming';

interface SmartListsProps {
  selectedList: SmartListType;
  onListChange: (list: SmartListType) => void;
  inboxCount: number;
  todayCount: number;
  upcomingCount: number;
}

export const SmartLists: React.FC<SmartListsProps> = ({
  selectedList,
  onListChange,
  inboxCount,
  todayCount,
  upcomingCount,
}) => {
  const theme = useTheme();

  const lists = [
    { id: 'inbox' as SmartListType, name: 'Inbox', count: inboxCount },
    { id: 'today' as SmartListType, name: 'Today', count: todayCount },
    { id: 'upcoming' as SmartListType, name: 'Upcoming', count: upcomingCount },
  ];

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.md,
    },
    listContainer: {
      flexDirection: 'row',
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.xs,
    },
    listButton: {
      flex: 1,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderRadius: theme.borderRadius.sm,
      alignItems: 'center',
    },
    listButtonActive: {
      backgroundColor: theme.colors.primary,
    },
    listButtonInactive: {
      backgroundColor: 'transparent',
    },
    listText: {
      fontSize: 14,
      fontWeight: '600',
    },
    listTextActive: {
      color: 'white',
    },
    listTextInactive: {
      color: theme.colors.textSecondary,
    },
    countText: {
      fontSize: 12,
      fontWeight: '500',
      marginTop: 2,
    },
    countTextActive: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
    countTextInactive: {
      color: theme.colors.textSecondary,
    },
  });

  return (
    <View style={styles.container}>
      <View style={styles.listContainer}>
        {lists.map((list) => (
          <TouchableOpacity
            key={list.id}
            style={[
              styles.listButton,
              selectedList === list.id
                ? styles.listButtonActive
                : styles.listButtonInactive,
            ]}
            onPress={() => onListChange(list.id)}
          >
            <RNText style={[
              styles.listText,
              selectedList === list.id
                ? styles.listTextActive
                : styles.listTextInactive,
            ]}>
              {list.name}
            </RNText>
            <RNText style={[
              styles.countText,
              selectedList === list.id
                ? styles.countTextActive
                : styles.countTextInactive,
            ]}>
              {list.count}
            </RNText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
