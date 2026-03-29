# Folder & File Structure Documentation

## Complete Project Tree Structure

```
daily_to_do/
├── .expo/                          # Expo configuration and cache
├── .git/                           # Git version control
├── assets/                         # Static assets (images, icons)
│   ├── icon.png                    # App icon
│   ├── splash-icon.png             # Splash screen image
│   ├── android-icon-foreground.png # Android adaptive icon
│   ├── android-icon-background.png # Android adaptive icon background
│   ├── android-icon-monochrome.png # Android monochrome icon
│   └── favicon.png                 # Web favicon
├── docs/                           # Documentation files
│   ├── project-overview.md         # Project overview and purpose
│   ├── architecture.md             # Technical architecture
│   ├── features.md                 # Functional requirements
│   ├── folder-structure.md         # This file
│   ├── components.md               # Component documentation
│   ├── api.md                      # API documentation
│   ├── database.md                 # Database and storage
│   ├── user-flows.md              # User interaction flows
│   ├── rebuild-from-scratch.md    # Rebuild guide
│   └── deployment.md               # Deployment instructions
├── src/                            # Source code directory
│   ├── components/                 # Reusable UI components
│   │   ├── DailyPlannerModal.tsx   # Daily planning interface
│   │   ├── FloatingActionButton.tsx # Floating action button
│   │   ├── QuickAddModal.tsx       # Quick task creation modal
│   │   ├── SmartLists.tsx          # Smart list filters
│   │   ├── SyncSettings.tsx        # Sync configuration UI
│   │   └── TaskItem.tsx            # Individual task component
│   ├── navigation/                 # Navigation configuration
│   │   └── AppNavigator.tsx        # Main app navigator
│   ├── screens/                    # Screen components
│   │   ├── CalendarScreen.tsx      # Calendar view screen
│   │   ├── HomeScreen.tsx          # Main task list screen
│   │   ├── PomodoroScreen.tsx      # Pomodoro timer screen
│   │   └── SettingsScreen.tsx      # Settings and sync screen
│   ├── services/                   # Business logic services
│   │   └── syncService.ts          # Google Drive sync service
│   ├── store/                      # State management
│   │   └── useAppStore.ts          # Zustand global state
│   ├── theme/                      # Theme and styling
│   │   ├── colors.ts               # Light and dark color palettes
│   │   └── theme.ts                # Theme system and hooks
│   ├── types/                      # TypeScript type definitions
│   │   └── index.ts                # Core type interfaces
│   └── utils/                      # Utility functions
│       ├── dailyPlanner.ts         # Daily planning utilities
│       ├── googleDriveSync.ts      # Google Drive sync engine
│       ├── nlp.ts                  # Natural language processing
│       ├── notifications.ts        # Notification management
│       ├── testStorage.ts          # Storage testing utilities
│       └── time.ts                 # Time-related utility functions
├── App.tsx                         # Main app component
├── app.json                        # Expo app configuration
├── eas.json                        # Expo Application Services config
├── index.ts                        # App entry point
├── package.json                    # Dependencies and scripts
├── package-lock.json               # Dependency lock file
├── tsconfig.json                   # TypeScript configuration
└── .gitignore                      # Git ignore rules
```

## Root Folders Meaning

### `/assets` - Static Assets
**Purpose**: Contains all static media files used by the application
**Contents**:
- App icons for different platforms
- Splash screen images
- Platform-specific adaptive icons
- Web favicon

**Platform Support**:
- iOS: Standard icon.png
- Android: Adaptive icons with foreground/background
- Web: favicon.png

### `/docs` - Documentation
**Purpose**: Complete project documentation for maintenance and rebuilding
**Contents**: Comprehensive markdown files covering all aspects of the application
**Importance**: Critical for project maintenance and knowledge transfer

### `/src` - Source Code
**Purpose**: All application source code organized by functionality
**Structure**: Feature-based organization with clear separation of concerns
**Platform**: Cross-platform React Native code

### Root Configuration Files
- **`App.tsx`**: Main application entry point with gesture handling
- **`app.json`**: Expo configuration for all platforms
- **`eas.json`**: Build and deployment configuration
- **`index.ts`**: JavaScript entry point
- **`package.json`**: Node.js dependencies and scripts
- **`tsconfig.json`**: TypeScript compiler configuration
- **`.gitignore`**: Version control ignore rules

## Source Code Structure

### `/src/components` - UI Components

#### `DailyPlannerModal.tsx` (11,952 bytes)
**Purpose**: Daily planning interface for organizing today's tasks
**Features**:
- Today's task overview
- Overdue task highlighting
- Task rescheduling interface
- Time-based organization

#### `FloatingActionButton.tsx` (1,844 bytes)
**Purpose**: Floating action button for quick task creation
**Features**:
- Animated appearance
- Touch feedback
- Position management
- Accessibility support

#### `QuickAddModal.tsx` (12,472 bytes)
**Purpose**: Modal for quick task creation with smart parsing
**Features**:
- Natural language date parsing
- Priority selection
- Folder and tag assignment
- Animated transitions

#### `SmartLists.tsx` (2,900 bytes)
**Purpose**: Smart list filters (Inbox, Today, Upcoming)
**Features**:
- Task filtering logic
- Count displays
- Tab navigation
- Visual selection indicators

#### `SyncSettings.tsx` (8,503 bytes)
**Purpose**: Google Drive sync configuration interface
**Features**:
- Authentication status
- Sync controls
- Settings management
- Error handling

#### `TaskItem.tsx` (5,237 bytes)
**Purpose**: Individual task display with interaction
**Features**:
- Swipe actions (complete/delete)
- Priority indicators
- Drag functionality
- Haptic feedback

### `/src/navigation` - Navigation Structure

#### `AppNavigator.tsx` (1,321 bytes)
**Purpose**: Main navigation setup with bottom tab navigator
**Features**:
- Tab configuration
- Screen routing
- Navigation container setup
- Platform-specific navigation

**Tab Structure**:
1. Home - Main task management
2. Pomodoro - Focus timer
3. Calendar - Date-based view
4. Settings - Configuration

### `/src/screens` - Screen Components

#### `HomeScreen.tsx` (11,775 bytes)
**Purpose**: Main application screen with task list and management
**Features**:
- Task list display
- Smart list filtering
- Quick add functionality
- Daily planner integration

#### `PomodoroScreen.tsx` (9,137 bytes)
**Purpose**: Pomodoro timer for focused work sessions
**Features**:
- 25-minute timer
- Task selection
- Session tracking
- Visual progress indicators

#### `CalendarScreen.tsx` (5,401 bytes)
**Purpose**: Calendar view for date-based task management
**Features**:
- Calendar display
- Date navigation
- Task filtering by date

#### `SettingsScreen.tsx` (3,934 bytes)
**Purpose**: Settings and configuration interface
**Features**:
- Sync settings access
- App preferences
- Account management

### `/src/services` - Business Logic

#### `syncService.ts` (4,677 bytes)
**Purpose**: High-level synchronization service
**Features**:
- Google Drive integration
- Background sync
- Conflict resolution
- Authentication management

**Key Functions**:
- `initialize()` - Service setup
- `signIn()` - User authentication
- `syncWithDrive()` - Data synchronization
- `performBackgroundSync()` - Automatic sync

### `/src/store` - State Management

#### `useAppStore.ts` (9,941 bytes)
**Purpose**: Global application state management with Zustand
**Features**:
- Task CRUD operations
- Folder management
- Tag management
- Sync integration
- Storage persistence

**State Structure**:
```typescript
interface AppStore {
  tasks: Task[]
  folders: Folder[]
  tags: Tag[]
  // Action methods
  addTask, toggleTask, updateTask, deleteTask
  addFolder, updateFolder, deleteFolder
  addTag, updateTag, deleteTag
  signInWithGoogle, syncWithDrive
}
```

### `/src/theme` - Styling System

#### `colors.ts` (1,134 bytes)
**Purpose**: Light and dark theme color palette definitions
**Features**:
- ThemeColors interface definition
- Light theme with iOS-style colors
- Dark theme with deep grays (#121212)
- Accessibility-focused color contrast
- Semantic color definitions (success, error, warning)

#### `theme.ts` (3,084 bytes)
**Purpose**: Application theme system and custom hooks
**Features**:
- Complete Theme interface with spacing, borders, shadows
- useThemeColors() hook for dynamic theming
- useTheme() hook for full theme object
- System theme integration with useColorScheme()
- Zustand store integration for theme preferences

### `/src/types` - Type Definitions

#### `index.ts` (635 bytes)
**Purpose**: Core TypeScript type definitions
**Contents**:
- Task interface
- Folder interface
- Tag interface
- AppState interface
- Priority type

**Key Types**:
```typescript
export type Priority = 'low' | 'med' | 'high'
export interface Task { ... }
export interface Folder { ... }
export interface Tag { ... }
export interface AppState { ... }
```

### `/src/utils` - Utility Functions

#### `dailyPlanner.ts` (3,481 bytes)
**Purpose**: Daily planning and task organization utilities
**Features**:
- Task filtering by date
- Overdue task detection
- Daily planning logic
- Storage abstraction

#### `googleDriveSync.ts` (10,317 bytes)
**Purpose**: Google Drive API integration and sync engine
**Features**:
- File upload/download
- Authentication handling
- Metadata management
- Conflict resolution

#### `nlp.ts` (7,428 bytes)
**Purpose**: Natural language processing for date/time parsing
**Features**:
- Date/time extraction from text
- Text cleaning and normalization
- Smart date parsing
- Pattern matching

#### `notifications.ts` (3,334 bytes)
**Purpose**: Notification management and scheduling
**Features**:
- Permission handling
- Notification scheduling
- Cancellation and rescheduling
- Platform abstraction

#### `testStorage.ts` (407 bytes)
**Purpose**: Storage testing and debugging utilities
**Features**:
- Storage validation
- Debug functions
- Test data management

#### `time.ts` (817 bytes)
**Purpose**: Time-related utility functions
**Features**:
- Time formatting and parsing
- Date manipulation helpers
- Time zone handling
- Duration calculations

## Component Dependencies

### Component Hierarchy
```
App.tsx
└── AppNavigator.tsx
    └── TabNavigator
        ├── HomeScreen.tsx
        │   ├── TaskItem.tsx (repeated)
        │   ├── FloatingActionButton.tsx
        │   ├── QuickAddModal.tsx
        │   ├── SmartLists.tsx
        │   └── DailyPlannerModal.tsx
        ├── PomodoroScreen.tsx
        ├── CalendarScreen.tsx
        └── SettingsScreen.tsx
            └── SyncSettings.tsx
```

### Cross-Component Dependencies
- **All Screens**: `useAppStore` for state management
- **All Components**: `useTheme` for styling
- **Task Components**: Task and Folder types
- **Modal Components**: Animation and gesture libraries
- **Sync Components**: Google Drive services

## Data Flow Architecture

### State Management Flow
```
User Action → Component Event → Store Action → State Update → Storage Save → UI Re-render
```

### Component Communication
- **Parent to Child**: Props passing
- **Child to Parent**: Callback functions
- **Global State**: Zustand store
- **Event Handling**: Gesture and touch events

### Storage Integration
- **Local Storage**: MMKV (native) / localStorage (web)
- **Cloud Storage**: Google Drive API
- **State Persistence**: Automatic on state change
- **Sync Logic**: Background synchronization

## Configuration Files

### `app.json` - Expo Configuration
**Purpose**: Cross-platform app configuration
**Key Settings**:
- App name and slug
- Platform-specific settings
- Icon and splash configuration
- Build properties

### `eas.json` - Build Configuration
**Purpose**: Expo Application Services build settings
**Contents**:
- Build profiles
- Distribution settings
- Environment variables

### `tsconfig.json` - TypeScript Configuration
**Purpose**: TypeScript compiler settings
**Features**:
- Strict type checking
- Expo base configuration
- Path resolution

### `package.json` - Dependencies
**Purpose**: Node.js package management
**Contents**:
- Application dependencies
- Development scripts
- Platform-specific packages

## Platform-Specific Considerations

### iOS Specific
- Icon sizes and formats
- Splash screen requirements
- Build settings in app.json

### Android Specific
- Adaptive icons
- Package naming
- Build configuration

### Web Specific
- Favicon configuration
- Polyfill usage
- Storage fallbacks

## Build and Deployment Structure

### Development Files
- Source code in `/src`
- Configuration files at root
- Documentation in `/docs`

### Build Artifacts
- Generated by Expo CLI
- Platform-specific bundles
- Asset optimization

### Deployment Configuration
- EAS build profiles
- Environment-specific settings
- Release management

## Testing Structure

### Current Testing
- Storage testing utilities (`testStorage.ts`)
- Manual testing procedures
- Platform verification

### Future Testing Structure
- Unit tests for utilities
- Component testing
- Integration testing
- E2E testing

## Documentation Structure

### Technical Documentation
- Architecture and design decisions
- API documentation
- Component specifications
- Build instructions

### User Documentation
- Feature descriptions
- User guides
- Troubleshooting
- Best practices

This folder structure supports:
- **Maintainability**: Clear separation of concerns
- **Scalability**: Modular architecture
- **Cross-platform**: Shared codebase
- **Development**: Efficient workflow
- **Documentation**: Comprehensive knowledge base
