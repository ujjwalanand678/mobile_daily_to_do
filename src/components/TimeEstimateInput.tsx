import React, { useState, useEffect } from 'react';
import { View, Text as RNText, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../theme/theme';
import { TimeEstimateManager } from '../utils/timeEstimates';
import { Task } from '../types';

interface TimeEstimateInputProps {
  value?: number;
  onChange: (minutes: number | undefined) => void;
  taskTitle?: string;
  allTasks?: Task[];
  placeholder?: string;
}

export const TimeEstimateInput: React.FC<TimeEstimateInputProps> = ({
  value,
  onChange,
  taskTitle,
  allTasks,
  placeholder = 'Estimate time...',
}) => {
  const theme = useTheme();
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (value) {
      setInputValue(TimeEstimateManager.formatDuration(value));
    } else {
      setInputValue('');
    }
  }, [value]);

  const handleInputChange = (text: string) => {
    setInputValue(text);
    
    const parsed = TimeEstimateManager.parseDuration(text);
    if (parsed !== null) {
      onChange(parsed);
    } else if (text === '') {
      onChange(undefined);
    }
  };

  const handleSuggestionPress = (minutes: number) => {
    setInputValue(TimeEstimateManager.formatDuration(minutes));
    onChange(minutes);
    setShowSuggestions(false);
  };

  const getSuggestions = (): { minutes: number; label: string }[] => {
    const suggestions = [
      { minutes: 15, label: '15m - Quick task' },
      { minutes: 30, label: '30m - Short task' },
      { minutes: 45, label: '45m - Medium task' },
      { minutes: 60, label: '1h - Standard task' },
      { minutes: 90, label: '1h 30m - Long task' },
      { minutes: 120, label: '2h - Extended task' },
    ];

    // Add AI suggestion if available
    if (taskTitle && allTasks) {
      const aiSuggestion = TimeEstimateManager.suggestTimeEstimate(taskTitle, allTasks);
      if (aiSuggestion && !suggestions.find(s => s.minutes === aiSuggestion)) {
        suggestions.unshift({
          minutes: aiSuggestion,
          label: `${TimeEstimateManager.formatDuration(aiSuggestion)} - Suggested`
        });
      }
    }

    return suggestions;
  };

  const styles = StyleSheet.create({
    container: {
      marginBottom: theme.spacing.md,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: theme.spacing.sm,
    },
    inputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
    input: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.borderRadius.md,
      paddingHorizontal: theme.spacing.md,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.colors.background,
    },
    clearButton: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      padding: theme.spacing.sm,
    },
    suggestionsContainer: {
      marginTop: theme.spacing.sm,
      gap: theme.spacing.xs,
    },
    suggestionButton: {
      backgroundColor: theme.colors.surface,
      borderRadius: theme.borderRadius.sm,
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.md,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    suggestionText: {
      fontSize: 14,
      color: theme.colors.text,
    },
    helperText: {
      fontSize: 12,
      color: theme.colors.textSecondary,
      marginTop: theme.spacing.xs,
    },
  });

  const suggestions = getSuggestions();

  return (
    <View style={styles.container}>
      <RNText style={styles.label}>Time Estimate</RNText>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textSecondary}
          value={inputValue}
          onChangeText={handleInputChange}
          onFocus={() => setShowSuggestions(true)}
        />
        
        {inputValue && (
          <TouchableOpacity onPress={() => {
            setInputValue('');
            onChange(undefined);
          }}>
            <RNText style={styles.clearButton}>×</RNText>
          </TouchableOpacity>
        )}
      </View>

      {showSuggestions && (
        <View style={styles.suggestionsContainer}>
          {suggestions.map((suggestion) => (
            <TouchableOpacity
              key={suggestion.minutes}
              style={styles.suggestionButton}
              onPress={() => handleSuggestionPress(suggestion.minutes)}
            >
              <RNText style={styles.suggestionText}>{suggestion.label}</RNText>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <RNText style={styles.helperText}>
        Enter time like "30m", "1h", or "1h 30m"
      </RNText>
    </View>
  );
};
