# Component Documentation

## Overview

This document provides detailed documentation for all major components in the Daily To-Do application. Each component includes its purpose, props, behavior, and implementation details.

## Screen Components

### HomeScreen

**File**: `src/screens/HomeScreen.tsx`  
**Size**: 7,292 bytes  
**Purpose**: Main application screen displaying task list and management features

#### Props

None (uses global state and navigation)

#### Features

- Task list display with draggable functionality
- Smart list filtering (Inbox, Today, Upcoming)
- Quick add task functionality
- Daily planner integration
- Task count display
- Empty state handling

#### Dependencies

- `useAppStore` - Global state management
- `TaskItem` - Individual task component
- `FloatingActionButton` - Add button
- `QuickAddModal` - Task creation modal
- `SmartLists` - Filter component
- `DailyPlannerModal` - Planning interface
- `DraggableFlatList` - Drag-and-drop functionality

#### State Management

- Local state for modal visibility
- Smart list selection
- Filtered task computation
- Task counts calculation

#### UI Behavior

- Responsive layout with theme support
- Smooth animations and transitions
- Haptic feedback on interactions
- Gesture-based task management

#### Key Functions

- `handleAddTask()` - Task creation with notification scheduling
- `getFilteredTasks()` - Smart list filtering logic
- `handleReorder()` - Task reordering (placeholder implementation)
- `renderTask()` - Task item rendering

---

### PomodoroScreen

**File**: `src/screens/PomodoroScreen.tsx`  
**Size**: 9,137 bytes  
**Purpose**: Pomodoro timer for focused work sessions

#### Props

None (uses global state)

#### Features

- 25-minute countdown timer
- Task selection for focus sessions
- Visual progress indicators
- Session tracking and counting
- Time logging to tasks
- Start/pause/reset controls

#### Dependencies

- `useAppStore` - Task management
- Animated API - Progress animations
- Haptics - Touch feedback

#### State Management

- `selectedTask` - Currently associated task
- `timeLeft` - Timer countdown
- `isRunning` - Timer state
- `sessionCount` - Completed sessions
- Animation values for visual effects

#### UI Behavior

- Circular progress indicator
- Color changes based on time remaining
- Smooth animations for session completion
- Task selection interface
- Control buttons with disabled states

#### Key Functions

- `toggleTimer()` - Start/pause timer
- `resetTimer()` - Reset countdown
- `completeSession()` - Handle session completion
- `formatTime()` - Time display formatting
- `getProgressColor()` - Dynamic color based on progress

---

### CalendarScreen

**File**: `src/screens/CalendarScreen.tsx`  
**Size**: 648 bytes  
**Purpose**: Calendar view for date-based task management

#### Props

None (minimal implementation)

#### Features

- Calendar display (placeholder)
- Date navigation
- Task filtering by date

#### Dependencies

- Basic React Native components
- Theme system

#### State Management

- Minimal state (placeholder implementation)

#### UI Behavior

- Simple calendar interface
- Date selection functionality
- Task display for selected dates

---

### SettingsScreen

**File**: `src/screens/SettingsScreen.tsx`  
**Size**: 981 bytes  
**Purpose**: Settings and configuration interface

#### Props

None

#### Features

- Access to sync settings
- Account management
- App preferences

#### Dependencies

- Navigation components
- Theme system

#### UI Behavior

- Settings list interface
- Navigation to detailed settings
- Configuration options

---

## UI Components

### TaskItem

**File**: `src/components/TaskItem.tsx`  
**Size**: 4,860 bytes  
**Purpose**: Individual task display with swipe actions

#### Props

```typescript
interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  drag?: () => void;
  isActive?: boolean;
}
```

#### Features

- Swipe-to-complete (right swipe)
- Swipe-to-delete (left swipe)
- Priority color indicators
- Drag-and-drop support
- Haptic feedback
- Animated swipe actions

#### Dependencies

- `Swipeable` - Gesture handling
- `Animated` - Swipe animations
- `Haptics` - Touch feedback
- Task and Priority types

#### UI Behavior

- Card-style task display
- Swipe gesture indicators
- Priority dot visualization
- Completion state styling
- Drag state opacity changes

#### Key Functions

- `handleComplete()` - Task completion with haptic feedback
- `handleDelete()` - Task deletion with haptic feedback
- `getPriorityColor()` - Priority color mapping
- `renderRightActions()` - Complete action button
- `renderLeftActions()` - Delete action button

#### Reusability

- Highly reusable across different screens
- Configurable callbacks for actions
- Theme-aware styling
- Platform-optimized gestures

---

### FloatingActionButton

**File**: `src/components/FloatingActionButton.tsx`  
**Size**: 1,844 bytes  
**Purpose**: Floating action button for primary actions

#### Props

```typescript
interface FloatingActionButtonProps {
  visible: boolean;
  onPress: () => void;
}
```

#### Features

- Animated appearance/disappearance
- Floating positioning
- Touch feedback
- Accessibility support

#### Dependencies

- Animated API - Visibility animations
- TouchableOpacity - Touch handling
- Theme system - Styling

#### UI Behavior

- Circular button with plus icon
- Bottom-right positioning
- Smooth fade and scale animations
- Shadow effects for depth

#### Reusability

- Generic floating button component
- Configurable press handler
- Visibility control
- Theme integration

---

### QuickAddModal

**File**: `src/components/QuickAddModal.tsx`  
**Size**: 12,472 bytes  
**Purpose**: Modal for quick task creation with smart parsing

#### Props

```typescript
interface QuickAddModalProps {
  visible: boolean;
  onClose: () => void;
  onAddTask: (task: TaskData) => void;
  folders: Folder[];
  tags: Tag[];
}
```

#### Features

- Natural language date/time parsing
- Priority selection
- Folder and tag assignment
- Animated modal transitions
- Date preview functionality
- Input validation

#### Dependencies

- Modal component - Modal display
- Animated API - Transition animations
- DateParser - NLP functionality
- Theme system - Styling

#### State Management

- Form inputs (title, notes, priority, etc.)
- Parsed due date from NLP
- Selected folder and tags
- Date preview visibility

#### UI Behavior

- Slide-up modal animation
- Form validation feedback
- Real-time date parsing preview
- Priority selector
- Folder and tag selection
- Keyboard-aware layout

#### Key Functions

- `handleAdd()` - Task creation with validation
- `handleClose()` - Modal cleanup
- Date parsing effect for real-time preview
- Animation setup for transitions

#### Reusability

- Configurable task creation callback
- Dynamic folder and tag options
- Theme-aware styling
- Platform-optimized modal behavior

---

### SmartLists

**File**: `src/components/SmartLists.tsx`  
**Size**: 2,900 bytes  
**Purpose**: Smart list filters (Inbox, Today, Upcoming)

#### Props

```typescript
interface SmartListsProps {
  selectedList: SmartListType;
  onListChange: (list: SmartListType) => void;
  inboxCount: number;
  todayCount: number;
  upcomingCount: number;
}
```

#### Features

- Tab-based list filtering
- Task count displays
- Visual selection indicators
- Smooth transitions

#### Dependencies

- TouchableOpacity - Touch handling
- Theme system - Styling

#### UI Behavior

- Horizontal tab layout
- Count badges for each list
- Selected state styling
- Touch feedback animations

#### List Types

- **Inbox**: Tasks without due dates
- **Today**: Tasks scheduled for today
- **Upcoming**: Future tasks

#### Reusability

- Configurable list selection
- Dynamic count updates
- Theme integration
- Gesture-optimized interactions

---

### DailyPlannerModal

**File**: `src/components/DailyPlannerModal.tsx`  
**Size**: 11,952 bytes  
**Purpose**: Daily planning interface for organizing tasks

#### Props

```typescript
interface DailyPlannerModalProps {
  visible: boolean;
  onClose: () => void;
  todayTasks: Task[];
  overdueTasks: Task[];
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
}
```

#### Features

- Today's task overview
- Overdue task highlighting
- Task rescheduling interface
- Time-based organization
- Priority-based sorting

#### Dependencies

- Modal component - Modal display
- Animated API - Transitions
- Task components - Task display
- Theme system - Styling

#### State Management

- Task organization by time
- Update handling for task changes
- Modal visibility state

#### UI Behavior

- Full-screen modal layout
- Task sections (overdue, today)
- Task interaction for rescheduling
- Smooth animations and transitions

#### Key Functions

- Task organization logic
- Update handling for task changes
- Modal lifecycle management

#### Reusability

- Configurable task data
- Dynamic update callbacks
- Theme-aware styling
- Flexible task organization

---

### SyncSettings

**File**: `src/components/SyncSettings.tsx`  
**Size**: 8,503 bytes  
**Purpose**: Google Drive sync configuration interface

#### Props

```typescript
interface SyncSettingsProps {
  visible: boolean;
  onClose: () => void;
}
```

#### Features

- Google authentication status
- Sign in/sign out functionality
- Manual sync triggers
- Sync status display
- Error handling and feedback

#### Dependencies

- Modal component - Modal display
- useAppStore - Sync functions
- Theme system - Styling

#### State Management

- Authentication status tracking
- Sync operation states
- Error state management
- Loading states

#### UI Behavior

- Settings list interface
- Authentication buttons
- Status indicators
- Progress feedback
- Error messages

#### Key Functions

- Google sign-in handling
- Sign-out functionality
- Manual sync triggering
- Status checking

#### Reusability

- Standalone sync configuration
- Global state integration
- Error handling patterns
- Status management

---

## Navigation Components

### AppNavigator

**File**: `src/navigation/AppNavigator.tsx`  
**Size**: 1,321 bytes  
**Purpose**: Main navigation setup with bottom tab navigator

#### Props

None (root navigator)

#### Features

- Bottom tab navigation
- Screen routing configuration
- Navigation container setup
- Tab customization

#### Dependencies

- React Navigation - Navigation framework
- Screen components - Tab content

#### Tab Configuration

- **Home**: Main task management
- **Pomodoro**: Focus timer
- **Calendar**: Date-based view
- **Settings**: Configuration

#### UI Behavior

- Bottom tab bar
- Icon and label display
- Tab switching animations
- Active state indicators

#### Reusability

- Central navigation configuration
- Easy tab management
- Consistent navigation behavior
- Platform-optimized implementation

---

## Utility Components

## Component Patterns

### State Management Patterns

- **Global State**: Zustand store for shared data
- **Local State**: useState for component-specific data
- **Derived State**: useMemo for computed values
- **Effects**: useEffect for side effects and lifecycle

### Animation Patterns

- **Modal Animations**: Fade and slide transitions
- **Gesture Animations**: Swipe and drag feedback
- **Progress Animations**: Timer and loading indicators
- **Micro-interactions**: Haptic feedback integration

### Theme Integration

- **useTheme Hook**: Consistent styling across components
- **Dynamic Colors**: Light/dark mode support
- **Spacing System**: Consistent spacing using theme values
- **Typography**: Unified text styling

### Error Handling Patterns

- **Graceful Degradation**: Fallbacks for missing features
- **User Feedback**: Clear error messages
- **Retry Mechanisms**: Automatic retry for transient failures
- **State Recovery**: Error state management

### Performance Patterns

- **Memoization**: React.memo for expensive renders
- **Virtualization**: FlatList for large datasets
- **Lazy Loading**: Component code splitting (future)
- **Optimistic Updates**: Immediate UI feedback

## Component Dependencies

### Shared Dependencies

- **React Native**: Core UI components
- **React Navigation**: Navigation framework
- **Zustand**: State management
- **Theme System**: Styling and appearance
- **TypeScript**: Type safety

### External Dependencies

- **Expo Notifications**: Push notifications
- **Expo Haptics**: Haptic feedback
- **React Native Gesture Handler**: Advanced gestures
- **React Native Reanimated**: Smooth animations
- **React Native MMKV**: High-performance storage

### Internal Dependencies

- **useAppStore**: Global state access
- **Task Types**: TypeScript interfaces
- **Utility Functions**: Helper functions
- **Service Classes**: Business logic

## Component Testing

### Current Testing Approach

- Manual testing on multiple platforms
- Component integration testing
- User interaction testing
- Performance testing

### Future Testing Strategy

- Unit tests for utility functions
- Component rendering tests
- Interaction testing with React Testing Library
- Visual regression testing

## Component Maintenance

### Documentation Updates

- Prop changes documentation
- Behavior modifications
- Dependency updates
- Performance improvements

### Code Quality

- TypeScript strict mode
- ESLint rules enforcement
- Code review processes
- Refactoring practices

### Accessibility

- Touch target sizing
- Screen reader support
- Color contrast compliance
- Keyboard navigation

This component documentation provides a comprehensive reference for understanding, maintaining, and extending the Daily To-Do application's UI components.
