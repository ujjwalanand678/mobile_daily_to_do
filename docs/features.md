# Functional Requirements Documentation

### Premium Glassmorphism UI
- **Visual Identity**: Modern "Glassmorphism" aesthetic with frosted backgrounds and dynamic blurs.
- **Micro-animations**: Powered by **Reanimated 4** to provide high-fidelity state transitions.
- **Haptic Feedback**: Context-aware haptics for completion, deletion, and navigation.
- **Color Palette**: Sophisticated Indigo/Violet gradients with high-contrast accessibility.

### High-Performance Persistence
- **Engine**: **React Native MMKV** (C++ based direct memory mapping).
- **Speed**: Instant app startup and lag-free UI state updates.
- **Reliability**: Industrial-grade persistence that survives background app kills.

### Google Drive Sync (Privacy-First)
- **App Data Folder**: Uses the hidden `drive.appdata` scope so sync files stay invisible to the user's regular Drive view.
- **Conflict Logic**: High-resolution timestamp comparison to ensure no data loss during multi-device use.

### Theme Hook Implementation

- **useThemeColors()**: Returns appropriate color palette
- **useColorScheme()**: React Native system theme detection
- **Zustand Integration**: Reads themePreference from global state
- **Automatic Switching**: Real-time theme updates

### Settings Integration

- **Theme Selector**: Segmented control in Settings screen
- **Live Preview**: Theme changes apply immediately
- **User Preference**: Saved and restored across app sessions

## Sync Status & User Experience

### Google Drive Sync Status

- **Last Synced Timestamp**: ISO timestamp stored in Zustand
- **Relative Time Display**: "Last synced: 2 mins ago" formatting
- **Real-time Updates**: Timestamp updates on successful sync
- **Status Indicator**: Muted text display in Settings screen

### Undo Deletion System

- **Snackbar Confirmation**: 4-second undo window
- **Soft Delete**: Tasks marked for deletion before permanent removal
- **Animated Interface**: Smooth slide-up animation for snackbar
- **Timer Management**: Automatic cleanup after timeout
- **User Recovery**: Tap UNDO to restore deleted task

### Global Search Functionality

- **Real-time Search**: Live filtering as user types
- **Multi-field Search**: Searches title and notes fields
- **UI Adaptation**: Hides Smart Lists during search
- **Empty States**: Contextual messages for no results
- **Search Bar**: Sticky search input at top of HomeScreen

## Core Features

### Task Management

#### Task Creation

- **Functionality**: Create new tasks with comprehensive metadata
- **Input Fields**:
  - Title (required, string)
  - Notes (optional, string)
  - Priority (required, enum: 'low' | 'med' | 'high')
  - Due Date (optional, Date)
  - Folder (required, Folder reference)
  - Tags (optional, Tag array)
- **Natural Language Processing**: Automatic date/time parsing from task title
- **Validation**: Title must not be empty, folder must exist
- **Auto-features**: ID generation, timestamp creation, notification scheduling

#### Task Editing

- **Functionality**: Update existing task properties
- **Editable Fields**: All creation fields except ID and timestamps
- **Notification Rescheduling**: Automatic notification update when due date changes
- **Timestamp Update**: Automatic updatedAt field modification
- **Validation**: Same rules as creation, plus task existence check

#### Task Deletion

- **Functionality**: Remove tasks from the system
- **Cleanup**: Cancel associated notifications
- **Confirmation**: Swipe-to-delete with visual feedback
- **Haptic Feedback**: Heavy impact on deletion
- **Undo**: Implemented with 4-second snackbar confirmation

#### Task Completion

- **Functionality**: Toggle task completion status
- **Visual Feedback**: Strikethrough text, opacity change
- **Haptic Feedback**: Medium impact on toggle
- **Time Tracking**: Optional time spent tracking
- **Smart Lists**: Automatic removal from active lists

### Smart Lists

#### Inbox

- **Purpose**: Tasks without due dates
- **Filter Criteria**: `!task.dueDate && !task.isCompleted`
- **Sorting**: Priority-based (high → medium → low)
- **Use Case**: Brain dump, backlog management

#### Today

- **Purpose**: Tasks scheduled for current day
- **Filter Criteria**: Due date between today start and tomorrow start
- **Time Range**: 00:00 today to 23:59 today
- **Sorting**: Priority-based
- **Use Case**: Daily focus, immediate action items

#### Upcoming

- **Purpose**: Future tasks beyond today
- **Filter Criteria**: Due date >= tomorrow
- **Sorting**: Chronological by due date, then priority
- **Use Case**: Future planning, deadline awareness

### Priority System

#### Priority Levels

- **High**: Urgent, important tasks (red indicator)
- **Medium**: Normal priority tasks (orange indicator)
- **Low**: Low urgency tasks (green indicator)

#### Priority Behavior

- **Visual Indicators**: Colored dots on task items
- **Sorting**: Higher priority tasks appear first
- **Default**: Medium priority for new tasks
- **Impact**: Affects smart list ordering

## Secondary Features

### Folder System

#### Folder Management

- **Creation**: Custom folders with name and color
- **Default Folder**: "My Tasks" (system created, non-deletable)
- **Color Coding**: Visual organization with customizable colors
- **Task Assignment**: Tasks can belong to exactly one folder
- **Deletion**: Custom folders can be deleted (tasks move to default)

#### Folder Features

- **CRUD Operations**: Create, read, update, delete
- **Color Selection**: Predefined color palette
- **Task Migration**: Automatic task reassignment on folder deletion
- **Validation**: Unique folder names, valid colors

### Tag System

#### Tag Management

- **Creation**: Custom tags with name and color
- **Multiple Assignment**: Tasks can have multiple tags
- **Visual Organization**: Colored tag indicators
- **Filtering**: Not implemented (future enhancement)

#### Tag Features

- **CRUD Operations**: Full lifecycle management
- **Color Coding**: Visual distinction between tags
- **Task Association**: Many-to-many relationship
- **Cleanup**: Tag removal from tasks on tag deletion

### Pomodoro Timer

#### Timer Functionality

- **Duration**: 25-minute focus sessions
- **Task Association**: Link timer to specific tasks
- **Time Tracking**: Automatic time logging to tasks
- **Session Counting**: Track completed sessions

#### Timer Features

- **Visual Progress**: Circular progress indicator
- **Color Changes**: Progress-based color transitions
- **Controls**: Start/pause, reset functionality
- **Animation**: Smooth progress animations
- **Haptic Feedback**: Session completion notification

#### Task Integration

- **Task Selection**: Choose from today's tasks
- **Time Logging**: Add 25 minutes to task.timeSpent
- **Session Display**: Show total completed sessions
- **Task Filtering**: Only show incomplete today tasks

## Admin Features

### Synchronization Settings

#### Google Authentication

- **Sign In**: OAuth 2.0 with Google
- **Sign Out**: Clear local authentication state
- **Status Check**: Verify current authentication
- **Permission Management**: Drive app data folder access

#### Sync Configuration

- **Manual Sync**: User-triggered synchronization
- **Background Sync**: Automatic sync after state changes
- **Conflict Resolution**: Timestamp-based conflict handling
- **Status Display**: Sync result indicators

### Notification Management

#### Permission Handling

- **Request Permissions**: On app startup
- **Status Check**: Verify notification permissions
- **Fallback**: Mock notifications for web platform
- **User Guidance**: Permission request explanations

#### Notification Scheduling

- **Task Reminders**: Automatic scheduling for due dates
- **Cancellation**: Remove notifications on task deletion/completion
- **Rescheduling**: Update notifications on due date changes
- **Content**: Task title as notification body

## User Flows

### Task Creation Flow

1. User taps floating action button
2. QuickAddModal appears with animation
3. User enters task title
4. NLP parser extracts date/time if present
5. User selects priority, folder, tags
6. User confirms creation
7. Task is added to store
8. Notification is scheduled
9. Background sync is triggered
10. Modal closes with animation

### Task Completion Flow

1. User swipes task item right
2. Complete action appears with animation
3. User releases swipe
4. Haptic feedback triggers
5. Task completion state toggles
6. Task is removed from active lists
7. State is persisted
8. Background sync triggers

### Sync Flow

1. User signs in with Google
2. Authentication tokens are stored
3. Sync service is initialized
4. Local state is uploaded to Drive
5. Metadata is updated
6. UI shows sync status
7. Background sync continues automatically

### Pomodoro Flow

1. User navigates to Pomodoro screen
2. Today's tasks are displayed
3. User selects a task to focus on
4. User starts timer
5. 25-minute countdown begins
6. Progress indicator updates
7. Timer completes
8. Success notification triggers
9. Task time is updated
10. Session count increments

## Authentication & Authorization Logic

### Google Sign-In Process

1. **Configuration**: Set up OAuth client IDs
2. **Permission Request**: Request Drive app data scope
3. **Authentication**: User signs in with Google account
4. **Token Management**: Store access and refresh tokens
5. **Scope Validation**: Ensure required permissions are granted
6. **User Info**: Retrieve user profile information

### Authorization Logic

- **Scope Requirements**: `https://www.googleapis.com/auth/drive.appdata`
- **Token Refresh**: Automatic token refresh using refresh token
- **Error Handling**: Handle authentication failures gracefully
- **Sign Out**: Clear all authentication tokens and local data

### Security Considerations

- **Private Data**: Use app data folder for privacy
- **Token Storage**: Secure token storage
- **Permission Minimization**: Request only necessary permissions
- **User Control**: User can revoke access at any time

## API Behaviors

### Google Drive API Integration

#### File Upload

- **Method**: POST/PATCH to `https://www.googleapis.com/upload/drive/v3/files`
- **Authentication**: Bearer token in Authorization header
- **Content Type**: multipart/form-data with metadata and file
- **Error Handling**: HTTP status codes and error messages
- **Retry Logic**: Implement retry for network failures

#### File Download

- **Method**: GET with `?alt=media` parameter
- **Authentication**: Bearer token required
- **Response**: JSON string of application state
- **Validation**: Verify data integrity before parsing
- **Fallback**: Handle missing files gracefully

#### File Search

- **Method**: GET with query parameters
- **Filter**: By file name and app data folder
- **Fields**: id, name, modifiedTime, size
- **Pagination**: Handle multiple results if needed
- **Caching**: Cache file metadata to reduce API calls

### Notification API Behavior

#### Scheduling

- **Platform Detection**: Native vs web behavior
- **Permission Check**: Verify notification permissions
- **Content**: Task reminder with title and body
- **Trigger**: Date-based scheduling
- **Error Handling**: Graceful fallback for failures

#### Management

- **Cancellation**: Remove scheduled notifications
- **Rescheduling**: Update existing notifications
- **Batch Operations**: Handle multiple notifications
- **Cleanup**: Remove orphaned notifications

## State Management Logic

### Zustand Store Structure

#### Task State

- **Array Storage**: Tasks stored in array
- **CRUD Operations**: Add, update, delete, toggle
- **Persistence**: Automatic saving to storage
- **Sync Integration**: Trigger background sync

#### Folder State

- **Default Folder**: System-created, non-deletable
- **Custom Folders**: User-created, deletable
- **Color Management**: Hex color codes
- **Task Migration**: Handle folder deletion

#### Tag State

- **Many-to-Many**: Tasks can have multiple tags
- **Color Coding**: Visual organization
- **Cleanup**: Remove tag references on deletion
- **Validation**: Unique names within system

### State Persistence

- **Storage Abstraction**: Platform-agnostic storage interface
- **Serialization**: JSON.stringify for state storage
- **Deserialization**: JSON.parse with error handling
- **Fallback**: Default state on corruption
- **Atomic Operations**: Ensure data consistency

## Business Rules

### Task Rules

1. **Title Requirement**: Every task must have a non-empty title
2. **Folder Assignment**: Every task must belong to exactly one folder
3. **Priority Default**: New tasks default to medium priority
4. **Timestamp Management**: createdAt and updatedAt are automatic
5. **Notification Logic**: Tasks with due dates get notifications
6. **Completion Logic**: Completed tasks are hidden from active lists

### Folder Rules

1. **Default Folder**: Cannot be deleted or renamed
2. **Unique Names**: Folder names must be unique
3. **Task Migration**: Deleting folder moves tasks to default
4. **Color Validation**: Folder colors must be valid hex codes

### Tag Rules

1. **Unique Names**: Tag names must be unique
2. **Multiple Assignment**: Tasks can have multiple tags
3. **Cleanup**: Deleting tags removes references from tasks
4. **Color Coding**: Tags support visual color indicators

### Sync Rules

1. **Authentication Required**: Sync requires Google sign-in
2. **Conflict Resolution**: Last-write-wins based on timestamps
3. **Background Sync**: Triggered after state changes
4. **Rate Limiting**: Respect API rate limits
5. **Offline Support**: App works without internet

## Edge Cases Handled

### Network Edge Cases

- **No Internet**: App works offline with local storage
- **Sync Failures**: Graceful fallback with retry logic
- **Authentication Errors**: Clear tokens and prompt re-auth
- **API Rate Limits**: Implement exponential backoff
- **Large Data**: Handle large state files efficiently

### Data Edge Cases

- **Corrupted State**: Fallback to default state
- **Missing Files**: Handle missing Drive files gracefully
- **Conflicting Data**: Timestamp-based conflict resolution
- **Storage Limits**: Handle localStorage quota exceeded
- **Invalid Dates**: Validate and handle invalid date inputs

### UI Edge Cases

- **Empty States**: Show helpful messages for empty lists
- **Loading States**: Visual feedback during operations
- **Error States**: User-friendly error messages
- **Long Task Titles**: Handle text overflow gracefully
- **Many Tasks**: Optimize list rendering for performance

### Platform Edge Cases

- **Web Limitations**: Mock notifications and sync for web
- **Native Permissions**: Handle permission denials gracefully
- **Memory Constraints**: Optimize memory usage
- **Screen Sizes**: Responsive design for different screens
- **Gesture Conflicts**: Handle gesture conflicts properly

## Performance Requirements

### Response Times

- **Task Creation**: < 500ms UI response
- **Task Toggle**: < 200ms visual feedback
- **Sync Operations**: < 5s for typical data
- **App Startup**: < 2s to interactive
- **Navigation**: < 300ms between screens

### Memory Usage

- **State Storage**: < 10MB for typical usage
- **List Rendering**: Efficient virtualization
- **Image Handling**: Optimize image memory usage
- **Animation Performance**: 60fps animations
- **Background Processing**: Minimal impact on UI

### Storage Efficiency

- **JSON Serialization**: Efficient state representation
- **Incremental Sync**: Only sync changed data
- **Compression**: Optional data compression
- **Cleanup**: Remove orphaned data
- **Backup Strategy**: Efficient backup creation

## Accessibility Requirements

### Visual Accessibility

- **Color Contrast**: WCAG AA compliance
- **Font Sizes**: Scalable text support
- **Color Blindness**: Not color-dependent information
- **High Contrast**: Support high contrast mode
- **Visual Indicators**: Non-color visual cues

### Interaction Accessibility

- **Touch Targets**: Minimum 44px touch targets
- **Gesture Alternatives**: Alternative to swipe gestures
- **Keyboard Support**: Keyboard navigation support
- **Voice Over**: Screen reader compatibility
- **Haptic Feedback**: Tactile feedback for actions

### Cognitive Accessibility

- **Clear Labels**: Descriptive button and field labels
- **Consistent Layout**: Predictable interface patterns
- **Error Messages**: Clear error explanations
- **Help Text**: Contextual help and instructions
- **Progress Indicators**: Visual progress feedback
