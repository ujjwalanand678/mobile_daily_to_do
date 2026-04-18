import React, { useState } from 'react';
import { View, Text as RNText, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { RecurrenceRule, RecurrenceType } from '../types';
import { useTheme } from '../theme/theme';
import { RecurrenceManager } from '../utils/recurrence';

interface RecurrenceSelectorProps {
  visible: boolean;
  onClose: () => void;
  onSelect: (recurrence: RecurrenceRule | undefined) => void;
  currentRecurrence?: RecurrenceRule;
}

export const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  visible,
  onClose,
  onSelect,
  currentRecurrence,
}) => {
  const theme = useTheme();
  const [selectedType, setSelectedType] = useState<RecurrenceType>(
    currentRecurrence?.type || 'daily'
  );
  const [customInterval, setCustomInterval] = useState(
    currentRecurrence?.interval?.toString() || '1'
  );

  const handleSelect = () => {
    const recurrence: RecurrenceRule = {
      type: selectedType,
      ...(selectedType === 'custom' && { interval: parseInt(customInterval) || 1 }),
      ...(selectedType === 'daily' && parseInt(customInterval) > 1 && { 
        interval: parseInt(customInterval) 
      }),
      ...(selectedType === 'weekly' && parseInt(customInterval) > 1 && { 
        interval: parseInt(customInterval) 
      }),
      ...(selectedType === 'monthly' && parseInt(customInterval) > 1 && { 
        interval: parseInt(customInterval) 
      }),
    };

    onSelect(recurrence.type === 'daily' && !recurrence.interval ? undefined : recurrence);
    onClose();
  };

  const handleRemove = () => {
    onSelect(undefined);
    onClose();
  };

  const getRecurrenceOptions = (): { type: RecurrenceType; label: string; description: string }[] => {
    return [
      { type: 'daily', label: 'Daily', description: 'Every day' },
      { type: 'weekly', label: 'Weekly', description: 'Every week' },
      { type: 'monthly', label: 'Monthly', description: 'Every month' },
      { type: 'weekdays', label: 'Weekdays', description: 'Monday to Friday' },
      { type: 'custom', label: 'Custom', description: 'Custom interval' },
    ];
  };

  const styles = StyleSheet.create({
    overlay: {
      flex: 1,
      backgroundColor: theme.colors.overlay,
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: theme.colors.surface,
      borderTopLeftRadius: theme.borderRadius.xl,
      borderTopRightRadius: theme.borderRadius.xl,
      paddingTop: theme.spacing.lg,
      paddingHorizontal: theme.spacing.md,
      paddingBottom: theme.spacing.xxl,
      maxHeight: '80%',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: theme.spacing.lg,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.text,
    },
    closeButton: {
      fontSize: 24,
      color: theme.colors.textSecondary,
      padding: theme.spacing.xs,
    },
    optionContainer: {
      marginBottom: theme.spacing.md,
    },
    optionButton: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      marginBottom: theme.spacing.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    optionButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    optionContent: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    optionText: {
      fontSize: 16,
      fontWeight: '500',
      color: theme.colors.text,
    },
    optionTextActive: {
      color: 'white',
    },
    optionDescription: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
    optionDescriptionActive: {
      color: 'rgba(255, 255, 255, 0.8)',
    },
    customIntervalContainer: {
      marginTop: theme.spacing.md,
      marginBottom: theme.spacing.lg,
    },
    intervalInput: {
      backgroundColor: theme.colors.background,
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    buttonContainer: {
      flexDirection: 'row',
      gap: theme.spacing.md,
    },
    button: {
      flex: 1,
      borderRadius: theme.borderRadius.md,
      paddingVertical: theme.spacing.md,
      alignItems: 'center',
    },
    removeButton: {
      backgroundColor: theme.colors.error,
    },
    selectButton: {
      backgroundColor: theme.colors.primary,
    },
    buttonText: {
      color: 'white',
      fontSize: 16,
      fontWeight: '600',
    },
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={{ flex: 1 }} 
          onPress={onClose}
          activeOpacity={1}
        />
        <View style={styles.modalContainer}>
          <View style={styles.header}>
            <RNText style={styles.title}>Repeat</RNText>
            <TouchableOpacity onPress={onClose}>
              <RNText style={styles.closeButton}>×</RNText>
            </TouchableOpacity>
          </View>

          <View style={styles.optionContainer}>
            {getRecurrenceOptions().map((option) => (
              <TouchableOpacity
                key={option.type}
                style={[
                  styles.optionButton,
                  selectedType === option.type && styles.optionButtonActive,
                ]}
                onPress={() => setSelectedType(option.type)}
              >
                <View style={styles.optionContent}>
                  <View>
                    <RNText style={[
                      styles.optionText,
                      selectedType === option.type && styles.optionTextActive,
                    ]}>
                      {option.label}
                    </RNText>
                    <RNText style={[
                      styles.optionDescription,
                      selectedType === option.type && styles.optionDescriptionActive,
                    ]}>
                      {option.description}
                    </RNText>
                  </View>
                  {selectedType === option.type && (
                    <RNText style={[styles.optionText, styles.optionTextActive]}>
                      ✓
                    </RNText>
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Custom Interval Input */}
          {selectedType !== 'weekdays' && (
            <View style={styles.customIntervalContainer}>
              <RNText style={styles.optionText}>
                Repeat every
              </RNText>
              <RNText style={styles.optionDescription}>
                {selectedType === 'daily' ? 'days' : 
                 selectedType === 'weekly' ? 'weeks' : 'months'}
              </RNText>
              <RNText style={[styles.optionText, { marginTop: theme.spacing.sm }]}>
                Interval:
              </RNText>
              <RNText style={styles.intervalInput}>
                {customInterval}
              </RNText>
            </View>
          )}

          <View style={styles.buttonContainer}>
            <TouchableOpacity style={[styles.button, styles.removeButton]} onPress={handleRemove}>
              <RNText style={styles.buttonText}>Remove</RNText>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.selectButton]} onPress={handleSelect}>
              <RNText style={styles.buttonText}>Select</RNText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
