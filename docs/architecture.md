# Technical Architecture Documentation

## System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Daily To-Do App                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Home Screen   │  │  Pomodoro Screen│  │ Calendar Screen │  │
│  │                 │  │                 │  │                 │  │
│  │ • Task List     │  │ • Timer         │  │ • Calendar View │  │
│  │ • Smart Lists   │  │ • Task Selector │  │ • Due Dates     │  │
│  │ • Quick Add     │  │ • Session Track │  │ • Navigation    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Settings Screen │  │ Task Components │  │ Modal Components│  │
│  │                 │  │                 │  │                 │  │
│  │ • Sync Settings │  │ • TaskItem      │  │ • QuickAddModal │  │
│  │ • Google Auth   │  │ • DraggableList │  │ • DailyPlanner │  │
│  │ • Preferences   │  │ • SmartLists    │  │ • SyncSettings │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                    Zustand State Management                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   Task Store    │  │  Folder Store   │  │    Tag Store    │  │
│  │                 │  │                 │  │                 │  │
│  │ • CRUD ops      │  │ • CRUD ops      │  │ • CRUD ops      │  │
│  │ • Notifications │  │ • Color mgmt    │  │ • Color mgmt    │  │
│  │ • Time tracking │  │ • Default folder│  │ • Assignment    │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                        Storage Layer                           │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │   MMKV Storage  │  │ Local Storage   │  │  Notifications  │  │
│  │   (Native)      │  │   (Web)         │  │   (Expo)        │  │
│  │                 │  │                 │  │                 │  │
│  │ • App State     │  │ • App State     │  │ • Task Reminders│  │
│  │ • Sync Metadata │  │ • Sync Metadata │  │ • Scheduling    │  │
│  │ • User Prefs    │  │ • User Prefs    │  │ • Permissions   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                     Sync Services                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │  Sync Service   │  │ Google Drive    │  │  Google Auth    │  │
│  │                 │  │     Engine      │  │                 │  │
│  │ • Background    │  │ • Upload/Download│  │ • OAuth Flow    │  │
│  │ • Conflict Res  │  │ • File Mgmt     │  │ • Token Mgmt    │  │
│  │ • Auto Trigger  │  │ • Metadata      │  │ • Permissions   │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
├─────────────────────────────────────────────────────────────────┤
│                     Utility Layer                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  │
│  │ Daily Planner   │  │     NLP         │  │   Theme System  │  │
│  │                 │  │                 │  │                 │  │
│  │ • Task Filtering │  │ • Date Parsing  │  │ • Light/Dark   │  │
│  │ • Daily Review  │  │ • Text Cleaning │  │ • Color Scheme │  │
│  │ • Suggestions   │  │ • Smart Extract │  │ • Spacing      │  │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Frontend Architecture

### Component Architecture

The frontend follows a hierarchical component structure:

```
App.tsx
├── GestureHandlerRootView
└── AppNavigator
    └── TabNavigator
        ├── HomeScreen
        │   ├── TaskItem (DraggableFlatList)
        │   ├── FloatingActionButton
        │   ├── QuickAddModal
        │   ├── SmartLists
        │   └── DailyPlannerModal
        ├── PomodoroScreen
        │   ├── Timer Component
        │   ├── Task Selector
        │   └── Session Counter
        ├── CalendarScreen
        │   └── Calendar View
        └── SettingsScreen
            └── SyncSettings
```

### State Management Architecture

**Zustand Store Structure:**

```typescript
interface AppStore extends AppState {
  // Task Management
  addTask: (task) => void;
  toggleTask: (taskId) => void;
  updateTask: (taskId, updates) => void;
  deleteTask: (taskId) => void;

  // Folder Management
  addFolder: (folder) => void;
  updateFolder: (folderId, updates) => void;
  deleteFolder: (folderId) => void;

  // Tag Management
  addTag: (tag) => void;
  updateTag: (tagId, updates) => void;
  deleteTag: (tagId) => void;

  // Sync Management
  signInWithGoogle: () => Promise<boolean>;
  signOutFromGoogle: () => Promise<void>;
  syncWithDrive: () => Promise<SyncResult>;

  // Notification Management
  requestNotificationPermissions: () => Promise<boolean>;
}
```

### Navigation Architecture

**React Navigation Setup:**

- **Bottom Tab Navigator**: Main app navigation
- **No Headers**: Clean, minimal interface
- **Tab Configuration**:
  - Home: Main task management
  - Pomodoro: Focus timer
  - Calendar: Date-based view
  - Settings: Configuration and sync

## Backend Architecture

### Cloud Storage Architecture

**Google Drive Integration:**

```
Google Drive API
├── Authentication (OAuth 2.0)
├── App Data Folder (Private)
│   ├── daily_todo_backup.json (Main data)
│   └── sync_metadata.json (Sync state)
├── File Operations
│   ├── Upload (PUT/PATCH)
│   ├── Download (GET)
│   └── Metadata Query
└── Conflict Resolution
    ├── Timestamp Comparison
    └── Device ID Tracking
```

### Sync Engine Architecture

**Sync Service Flow:**

```
Local State Change
    ↓
Background Sync Trigger
    ↓
Check Sign-in Status
    ↓
Compare Local vs Remote Timestamps
    ↓
Decision: Upload/Download/No Action
    ↓
Execute Sync Operation
    ↓
Update Local Metadata
    ↓
Refresh UI State
```

## Database Architecture

### Local Storage Architecture

**Storage Abstraction:**

```typescript
interface StorageInterface {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
}
```

**Platform-Specific Implementation:**

- **Native**: MMKV (High-performance key-value storage)
- **Web**: localStorage (Fallback implementation)

### Data Model Architecture

**Core Data Structures:**

```typescript
// Task Model
interface Task {
  id: string;
  title: string;
  notes?: string;
  isCompleted: boolean;
  dueDate?: Date;
  priority: "low" | "med" | "high";
  folderId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  notificationId?: string;
  timeSpent?: number;
}

// Folder Model
interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

// Tag Model
interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## External Integrations

### Google Drive Integration

**API Endpoints Used:**

- `POST https://www.googleapis.com/upload/drive/v3/files` (Upload)
- `PATCH https://www.googleapis.com/upload/drive/v3/files/{id}` (Update)
- `GET https://www.googleapis.com/drive/v3/files/{id}?alt=media` (Download)
- `GET https://www.googleapis.com/drive/v3/files` (Search)

**Authentication Flow:**

1. Google Sign-In with OAuth 2.0
2. Request Drive App Data scope
3. Access token management
4. Automatic token refresh

### Notification Integration

**Expo Notifications:**

- Permission management
- Local notification scheduling
- Task reminder system
- Cross-platform compatibility

## Data Flow Architecture

### Request Lifecycle

**Task Creation Flow:**

```
User Input → QuickAddModal → NLP Parsing → Store.addTask()
    ↓
Local Storage Update → Background Sync Trigger → Google Drive Upload
    ↓
Notification Scheduling → UI Update → State Persistence
```

**Sync Flow:**

```
App State Change → Zustand Store Update → Local Storage Save
    ↓
Background Sync → Google Drive API → Conflict Resolution
    ↓
Remote State Update → Local State Refresh → UI Re-render
```

### State Synchronization

**Bidirectional Sync:**

```
Local Changes ──→ Upload to Drive ──→ Update Remote State
     ↑                                    ↓
     └──←── Download from Drive ←──←───←──┘
```

**Conflict Resolution Strategy:**

- Timestamp-based comparison
- Last-write-wins approach
- Device ID tracking
- 1-minute threshold for concurrent changes

## Performance Architecture

### Rendering Optimization

**List Performance:**

- DraggableFlatList with virtualization
- Efficient re-rendering with React.memo
- Optimized gesture handling
- Smooth animations with Reanimated

**State Management Optimization:**

- Zustand's shallow comparison
- Selective re-renders
- Minimal state updates
- Efficient storage operations

### Storage Performance

**MMKV Benefits:**

- Direct memory mapping
- No serialization overhead
- Cross-platform consistency
- High read/write speeds

**Sync Optimization:**

- Background processing
- Incremental updates
- Conflict prevention
- Network efficiency

## Security Architecture

### Data Protection

**Local Security:**

- Optional MMKV encryption
- Secure token storage
- Permission-based access

**Cloud Security:**

- OAuth 2.0 authentication
- Private app data folder
- Secure API communication
- Token lifecycle management

### Privacy Considerations

**Data Minimization:**

- Only essential data collection
- No analytics tracking
- User-controlled data
- Transparent sync process

## Scalability Architecture

### Current Limitations

**Single-User Architecture:**

- No multi-user support
- Individual Google Drive accounts
- No team collaboration features
- Limited to app data folder

### Future Scalability

**Potential Enhancements:**

- Multi-user authentication
- Shared folders and tasks
- API endpoints for integrations
- Alternative cloud providers

## Error Handling Architecture

### Error Categories

**Network Errors:**

- Google Drive API failures
- Authentication issues
- Network connectivity problems
- Sync conflict resolution

**Storage Errors:**

- MMKV access failures
- localStorage quota exceeded
- Data corruption handling
- Backup recovery mechanisms

**UI Errors:**

- Component rendering issues
- Gesture handling failures
- Animation performance problems
- State inconsistency

### Recovery Strategies

**Automatic Recovery:**

- Retry mechanisms for network operations
- Fallback to local storage
- State validation and correction
- Graceful degradation

**User Communication:**

- Error message display
- Sync status indicators
- Manual retry options
- Data export capabilities

## Testing Architecture

### Testing Strategy

**Component Testing:**

- Unit tests for utilities
- Component rendering tests
- State management tests
- Integration testing

**Manual Testing:**

- Cross-platform verification
- Sync functionality testing
- Edge case validation
- Performance testing

### Quality Assurance

**Code Quality:**

- TypeScript type checking
- ESLint rules enforcement
- Code review processes
- Documentation maintenance

**Performance Monitoring:**

- Memory usage tracking
- Render performance metrics
- Storage operation timing
- Network request monitoring
