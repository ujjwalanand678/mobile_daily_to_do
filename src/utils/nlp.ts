export interface ParsedDateTime {
  date: Date;
  cleanedText: string;
  originalText: string;
}

export class DateParser {
  static parseDateTime(text: string): ParsedDateTime | null {
    try {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      let parsedDate: Date | null = null;
      let cleanedText = text;
      
      // Simple regex patterns for common date/time expressions
      const patterns = [
        // "tomorrow at [time]"
        {
          regex: /tomorrow\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
          handler: (match: RegExpMatchArray) => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const hour = parseInt(match[1]);
            const minute = match[2] ? parseInt(match[2]) : 0;
            const period = match[3]?.toLowerCase();
            
            if (period === 'pm' && hour < 12) {
              tomorrow.setHours(hour + 12, minute, 0, 0);
            } else if (period === 'am' && hour === 12) {
              tomorrow.setHours(0, minute, 0, 0);
            } else {
              tomorrow.setHours(hour, minute, 0, 0);
            }
            
            return tomorrow;
          }
        },
        // "tomorrow morning/afternoon/evening/night"
        {
          regex: /tomorrow\s+(morning|afternoon|evening|night)/i,
          handler: (match: RegExpMatchArray) => {
            const tomorrow = new Date();
            tomorrow.setDate(tomorrow.getDate() + 1);
            const period = match[1].toLowerCase();
            
            switch (period) {
              case 'morning':
                tomorrow.setHours(9, 0, 0, 0);
                break;
              case 'afternoon':
                tomorrow.setHours(15, 0, 0, 0);
                break;
              case 'evening':
                tomorrow.setHours(18, 0, 0, 0);
                break;
              case 'night':
                tomorrow.setHours(20, 0, 0, 0);
                break;
            }
            
            return tomorrow;
          }
        },
        // "today at [time]"
        {
          regex: /today\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
          handler: (match: RegExpMatchArray) => {
            const today = new Date();
            const hour = parseInt(match[1]);
            const minute = match[2] ? parseInt(match[2]) : 0;
            const period = match[3]?.toLowerCase();
            
            if (period === 'pm' && hour < 12) {
              today.setHours(hour + 12, minute, 0, 0);
            } else if (period === 'am' && hour === 12) {
              today.setHours(0, minute, 0, 0);
            } else {
              today.setHours(hour, minute, 0, 0);
            }
            
            return today;
          }
        },
        // "[day] at [time]"
        {
          regex: /(monday|tuesday|wednesday|thursday|friday|saturday|sunday)\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
          handler: (match: RegExpMatchArray) => {
            const dayName = match[1].toLowerCase();
            const hour = parseInt(match[2]);
            const minute = match[3] ? parseInt(match[3]) : 0;
            const period = match[4]?.toLowerCase();
            
            const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
            const targetDay = days.indexOf(dayName);
            const currentDay = now.getDay();
            
            const date = new Date(now);
            const daysUntilTarget = (targetDay - currentDay + 7) % 7 || 7;
            date.setDate(date.getDate() + daysUntilTarget);
            
            if (period === 'pm' && hour < 12) {
              date.setHours(hour + 12, minute, 0, 0);
            } else if (period === 'am' && hour === 12) {
              date.setHours(0, minute, 0, 0);
            } else {
              date.setHours(hour, minute, 0, 0);
            }
            
            return date;
          }
        },
        // "tonight at [time]"
        {
          regex: /tonight\s+at\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i,
          handler: (match: RegExpMatchArray) => {
            const tonight = new Date();
            const hour = parseInt(match[1]);
            const minute = match[2] ? parseInt(match[2]) : 0;
            const period = match[3]?.toLowerCase();
            
            if (period === 'pm' && hour < 12) {
              tonight.setHours(hour + 12, minute, 0, 0);
            } else if (period === 'am' && hour === 12) {
              tonight.setHours(0, minute, 0, 0);
            } else {
              tonight.setHours(hour >= 6 ? hour : hour + 12, minute, 0, 0);
            }
            
            return tonight;
          }
        },
        // "in [number] hours/minutes"
        {
          regex: /in\s+(\d+)\s+(hours?|minutes?)/i,
          handler: (match: RegExpMatchArray) => {
            const amount = parseInt(match[1]);
            const unit = match[2].toLowerCase();
            
            const date = new Date();
            if (unit.startsWith('hour')) {
              date.setHours(date.getHours() + amount, 0, 0, 0);
            } else {
              date.setMinutes(date.getMinutes() + amount, 0, 0);
            }
            
            return date;
          }
        }
      ];
      
      for (const pattern of patterns) {
        const match = text.match(pattern.regex);
        if (match) {
          parsedDate = pattern.handler(match);
          cleanedText = text.replace(pattern.regex, '').trim();
          break;
        }
      }
      
      // Only return if the date is in the future
      if (parsedDate && parsedDate.getTime() > Date.now()) {
        return {
          date: parsedDate,
          cleanedText: cleanedText,
          originalText: text,
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error parsing date:', error);
      return null;
    }
  }
  
  // Common patterns that our parser handles:
  // - "tomorrow at 5pm"
  // - "tomorrow morning"
  // - "today at 9am"
  // - "monday at 3pm"
  // - "tonight at 8pm"
  // - "in 2 hours"
  // - "in 30 minutes"
  
  static getSupportedPatterns(): string[] {
    return [
      "tomorrow at [time]",
      "tomorrow [morning/afternoon/evening/night]",
      "today at [time]",
      "[day] at [time]",
      "tonight at [time]",
      "in [number] [hours/minutes]",
    ];
  }
}

// Utility to format date for display
export const formatDateForDisplay = (date: Date): string => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const taskDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  
  if (taskDate.getTime() === today.getTime()) {
    return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else if (taskDate.getTime() === tomorrow.getTime()) {
    return `Tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  } else {
    return date.toLocaleDateString([], { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
};
