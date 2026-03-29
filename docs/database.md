# Database Documentation

## Overview

The Daily To-Do application uses a hybrid storage approach combining local device storage with cloud synchronization. This document covers all data storage mechanisms, schemas, and data management strategies.

## Storage Architecture

### Local Storage

#### Primary Storage: MMKV (Native)
- **Technology**: React Native MMKV
- **Type**: Key-value storage
- **Performance**: High-speed, direct memory mapping
- **Encryption**: Optional (not currently implemented)
- **Platform**: iOS and Android only

#### Fallback Storage: localStorage (Web)
- **Technology**: Browser localStorage
- **Type**: Key-value storage
- **Performance**: Standard web storage
- **Limitations**: Synchronous, size limitations
- **Platform**: Web only

### Cloud Storage

#### Primary Cloud: Google Drive
- **Service**: Google Drive API
- **Location**: App Data Folder (private)
- **Format**: JSON files
- **Access**: OAuth 2.0 authentication
- **Sync**: Bidirectional synchronization

## Data Models

### Core Data Types

#### Task Model

```typescript
interface Task {
  id: string;                    // Unique identifier (timestamp-based)
  title: string;                 // Task title (required, non-empty)
  notes?: string;               // Optional notes/description
  isCompleted: boolean;         // Completion status
  dueDate?: Date;               // Optional due date/time
  priority: 'low' | 'med' | 'high'; // Priority level
  folderId: string;             // Associated folder ID
  tags: string[];               // Array of tag IDs
  createdAt: Date;               // Creation timestamp
  updatedAt: Date;               // Last modification timestamp
  notificationId?: string;       // Scheduled notification ID
  timeSpent?: number;           // Time spent in minutes (Pomodoro)
}
```

**Field Constraints**:
- `id`: Auto-generated, unique across all tasks
- `title`: Required, minimum 1 character, trimmed
- `priority`: Enum with three possible values
- `folderId`: Must reference existing folder
- `tags`: Array of existing tag IDs (can be empty)
- `dates`: ISO 8601 date strings in storage

**Validation Rules**:
```typescript
const validateTask = (task: Task): boolean => {
  return (
    task.id.length > 0 &&
    task.title.trim().length > 0 &&
    ['low', 'med', 'high'].includes(task.priority) &&
    task.folderId.length > 0 &&
    Array.isArray(task.tags) &&
    task.createdAt instanceof Date &&
    task.updatedAt instanceof Date
  );
};
```

---

#### Folder Model

```typescript
interface Folder {
  id: string;        // Unique identifier
  name: string;      // Folder name (required, unique)
  color: string;     // Hex color code
  createdAt: Date;   // Creation timestamp
  updatedAt: Date;   // Last modification timestamp
}
```

**Field Constraints**:
- `id`: Auto-generated, unique
- `name`: Required, unique across all folders
- `color`: Valid hex color code (e.g., "#007AFF")
- Default folder: id="default", name="My Tasks"

**Default Folder**:
```typescript
const defaultFolder: Folder = {
  id: 'default',
  name: 'My Tasks',
  color: '#007AFF',
  createdAt: new Date(),
  updatedAt: new Date(),
};
```

**Validation Rules**:
```typescript
const validateFolder = (folder: Folder): boolean => {
  return (
    folder.id.length > 0 &&
    folder.name.trim().length > 0 &&
    /^#[0-9A-Fa-f]{6}$/.test(folder.color) &&
    folder.createdAt instanceof Date &&
    folder.updatedAt instanceof Date
  );
};
```

---

#### Tag Model

```typescript
interface Tag {
  id: string;        // Unique identifier
  name: string;      // Tag name (required, unique)
  color: string;     // Hex color code
  createdAt: Date;   // Creation timestamp
  updatedAt: Date;   // Last modification timestamp
}
```

**Field Constraints**:
- `id`: Auto-generated, unique
- `name`: Required, unique across all tags
- `color`: Valid hex color code
- Optional assignment to tasks

**Validation Rules**:
```typescript
const validateTag = (tag: Tag): boolean => {
  return (
    tag.id.length > 0 &&
    tag.name.trim().length > 0 &&
    /^#[0-9A-Fa-f]{6}$/.test(tag.color) &&
    tag.createdAt instanceof Date &&
    tag.updatedAt instanceof Date
  );
};
```

---

### Application State Model

```typescript
interface AppState {
  tasks: Task[];     // Array of all tasks
  folders: Folder[]; // Array of all folders
  tags: Tag[];       // Array of all tags
}
```

**State Invariants**:
- At least one folder (default folder)
- All tasks reference valid folder IDs
- All task tag IDs reference valid tags
- No duplicate folder or tag names

---

### Sync Metadata Model

```typescript
interface SyncMetadata {
  lastSyncTime: number;  // Unix timestamp
  deviceId: string;      // Unique device identifier
  appVersion: string;    // Application version
}
```

**Purpose**: Track synchronization state and conflict resolution

---

## Storage Implementation

### Storage Abstraction Layer

```typescript
interface StorageInterface {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  delete: (key: string) => void;
}
```

#### Platform-Specific Implementation

**Native (MMKV)**:
```typescript
const { MMKV } = require('react-native-mmkv');
const mmkv = new MMKV({
  id: 'app-storage',
  encryptionKey: undefined, // Optional encryption
});

const nativeStorage: StorageInterface = {
  getString: (key: string) => mmkv.getString(key),
  set: (key: string, value: string) => mmkv.set(key, value),
  delete: (key: string) => mmkv.delete(key),
};
```

**Web (localStorage)**:
```typescript
const webStorage: StorageInterface = {
  getString: (key: string) => {
    try {
      return localStorage.getItem(key) || undefined;
    } catch {
      return undefined;
    }
  },
  set: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('localStorage error:', error);
    }
  },
  delete: (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('localStorage error:', error);
    }
  },
};
```

---

### Data Persistence Strategy

#### Primary Storage Keys

**Application State**:
- Key: `'app-storage'`
- Value: JSON string of `AppState`
- Update: On every state change

**Sync Metadata**:
- Key: `'sync_metadata'`
- Value: JSON string of `SyncMetadata`
- Update: After successful sync operations

**Daily Planner State**:
- Key: `'daily-planner-settings'`
- Value: Planner preferences and settings
- Update: User preference changes

#### Data Serialization

**JSON Serialization**:
```typescript
const saveState = (state: AppState): void => {
  try {
    const serializedState = JSON.stringify(state, (key, value) => {
      // Convert Date objects to ISO strings
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    });
    storage.set('app-storage', serializedState);
  } catch (error) {
    console.error('Error saving state:', error);
  }
};
```

**JSON Deserialization**:
```typescript
const loadState = (): AppState => {
  try {
    const storedData = storage.getString('app-storage');
    if (!storedData) return getDefaultState();
    
    const parsed = JSON.parse(storedData, (key, value) => {
      // Convert ISO strings back to Date objects
      if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(value)) {
        return new Date(value);
      }
      return value;
    });
    
    return validateState(parsed);
  } catch (error) {
    console.error('Error loading state:', error);
    return getDefaultState();
  }
};
```

---

## Cloud Storage Structure

### Google Drive Organization

#### App Data Folder
- **Location**: Private app-specific folder
- **Access**: Only the application can access
- **Quota**: Counts towards user's Google Drive storage
- **Privacy**: Not visible to user in Drive interface

#### Files Structure

**Primary Data File**:
- Filename: `daily_todo_backup.json`
- Content: Serialized `AppState`
- Size: Varies based on user data (typically < 1MB)
- Backup: Single file contains all data

**Metadata File**:
- Filename: `sync_metadata.json`
- Content: `SyncMetadata` for conflict resolution
- Size: Small (< 1KB)
- Purpose: Track sync state across devices

---

### Sync Data Format

**Backup File Format**:
```json
{
  "tasks": [
    {
      "id": "1640995200000",
      "title": "Complete project documentation",
      "notes": "Include all API endpoints and data models",
      "isCompleted": false,
      "dueDate": "2023-01-02T10:00:00.000Z",
      "priority": "high",
      "folderId": "default",
      "tags": ["1640995200001"],
      "createdAt": "2023-01-01T09:00:00.000Z",
      "updatedAt": "2023-01-01T09:00:00.000Z",
      "notificationId": "notification-123",
      "timeSpent": 25
    }
  ],
  "folders": [
    {
      "id": "default",
      "name": "My Tasks",
      "color": "#007AFF",
      "createdAt": "2023-01-01T00:00:00.000Z",
      "updatedAt": "2023-01-01T00:00:00.000Z"
    }
  ],
  "tags": [
    {
      "id": "1640995200001",
      "name": "Work",
      "color": "#FF3B30",
      "createdAt": "2023-01-01T09:00:00.000Z",
      "updatedAt": "2023-01-01T09:00:00.000Z"
    }
  ]
}
```

**Metadata File Format**:
```json
{
  "lastSyncTime": 1640995200000,
  "deviceId": "abc123-def456-ghi789",
  "appVersion": "1.0.0"
}
```

---

## Data Relationships

### Entity Relationship Diagram

```
Folder (1) -----> (N) Task
        ^                ^
        |                |
        |                |
   (Default)           (N)
        |                |
        |                |
   Tag (1) -----> (N) Task
```

### Relationship Rules

#### Folder-Task Relationship
- **Cardinality**: One-to-many (1:N)
- **Constraint**: Every task must belong to exactly one folder
- **Cascade**: Deleting folder moves tasks to default folder
- **Default**: Default folder cannot be deleted

#### Tag-Task Relationship
- **Cardinality**: Many-to-many (N:M)
- **Implementation**: Task stores array of tag IDs
- **Cascade**: Deleting tag removes reference from all tasks
- **Optional**: Tasks can have zero tags

#### Temporal Relationships
- **Creation**: `createdAt` never changes
- **Modification**: `updatedAt` updates on any change
- **Sync**: Sync metadata tracks last synchronization

---

## Data Integrity

### Validation Rules

#### Task Validation
```typescript
const validateTaskIntegrity = (task: Task, folders: Folder[], tags: Tag[]): boolean => {
  // Required fields
  if (!task.id || !task.title.trim() || !task.folderId) return false;
  
  // Valid priority
  if (!['low', 'med', 'high'].includes(task.priority)) return false;
  
  // Valid folder reference
  if (!folders.find(f => f.id === task.folderId)) return false;
  
  // Valid tag references
  for (const tagId of task.tags) {
    if (!tags.find(t => t.id === tagId)) return false;
  }
  
  // Date validation
  if (!(task.createdAt instanceof Date) || !(task.updatedAt instanceof Date)) return false;
  
  return true;
};
```

#### Folder Validation
```typescript
const validateFolderIntegrity = (folder: Folder, allFolders: Folder[]): boolean => {
  // Required fields
  if (!folder.id || !folder.name.trim() || !folder.color) return false;
  
  // Color format
  if (!/^#[0-9A-Fa-f]{6}$/.test(folder.color)) return false;
  
  // Unique name (except default folder)
  const duplicates = allFolders.filter(f => 
    f.id !== folder.id && f.name === folder.name
  );
  if (duplicates.length > 0) return false;
  
  // Default folder protection
  if (folder.id === 'default' && folder.name !== 'My Tasks') return false;
  
  return true;
};
```

#### State Validation
```typescript
const validateAppState = (state: AppState): boolean => {
  // At least default folder exists
  if (!state.folders.find(f => f.id === 'default')) return false;
  
  // All tasks valid
  for (const task of state.tasks) {
    if (!validateTaskIntegrity(task, state.folders, state.tags)) return false;
  }
  
  // All folders valid
  for (const folder of state.folders) {
    if (!validateFolderIntegrity(folder, state.folders)) return false;
  }
  
  // All tags valid
  for (const tag of state.tags) {
    if (!validateTag(tag)) return false;
  }
  
  return true;
};
```

---

### Data Migration

#### Version Management

**Current Version**: 1.0.0  
**Migration Strategy**: Semantic versioning with backward compatibility

**Migration Functions**:
```typescript
interface Migration {
  version: string;
  migrate: (data: any) => AppState;
}

const migrations: Migration[] = [
  {
    version: '1.0.0',
    migrate: (data: any): AppState => {
      // Initial data structure - no migration needed
      return validateState(data);
    },
  },
  // Future migrations would be added here
];

const migrateData = (data: any, targetVersion: string): AppState => {
  let currentState = data;
  
  for (const migration of migrations) {
    if (migration.version <= targetVersion) {
      currentState = migration.migrate(currentState);
    }
  }
  
  return currentState;
};
```

---

## Performance Optimization

### Storage Performance

#### MMKV Optimization
- **Direct Memory Mapping**: Faster than traditional storage
- **No Serialization Overhead**: Binary format storage
- **Compression**: Optional data compression
- **Batching**: Multiple operations in single transaction

#### localStorage Optimization
- **Debounced Writes**: Reduce write frequency
- **Data Compression**: Minimize storage usage
- **Cleanup**: Remove orphaned data

### Sync Performance

#### Incremental Sync
- **Change Detection**: Only sync modified data
- **Compression**: Reduce network payload
- **Batching**: Group multiple changes
- **Background Processing**: Non-blocking operations

#### Conflict Resolution Performance
- **Timestamp Comparison**: Quick conflict detection
- **Device ID Tracking**: Avoid self-conflicts
- **Threshold Logic**: Reduce unnecessary syncs

---

## Backup and Recovery

### Local Backup

#### Automatic Backups
- **Frequency**: On every state change
- **Location**: Local storage only
- **Retention**: Single current state
- **Validation**: Data integrity checks

#### Manual Export
```typescript
const exportData = (): string => {
  const state = loadState();
  return JSON.stringify(state, null, 2);
};

const importData = (jsonData: string): boolean => {
  try {
    const importedState = JSON.parse(jsonData);
    const validatedState = migrateData(importedState, '1.0.0');
    
    if (validateAppState(validatedState)) {
      saveState(validatedState);
      return true;
    }
    return false;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
};
```

### Cloud Backup

#### Google Drive Backup
- **Automatic**: Background synchronization
- **Redundancy**: Multiple device support
- **Version History**: Google Drive versioning
- **Recovery**: Download from any device

#### Backup Verification
```typescript
const verifyBackup = async (): Promise<boolean> => {
  try {
    const localState = loadState();
    const remoteData = await SyncService.downloadFromDrive();
    
    if (!remoteData) return false;
    
    const remoteState = JSON.parse(remoteData);
    return JSON.stringify(localState) === JSON.stringify(remoteState);
  } catch (error) {
    console.error('Backup verification failed:', error);
    return false;
  }
};
```

---

## Security and Privacy

### Data Protection

#### Local Security
- **Storage Encryption**: Optional MMKV encryption
- **Access Control**: App sandbox restrictions
- **Memory Protection**: Secure memory management

#### Cloud Security
- **Private Storage**: App Data Folder access only
- **Encrypted Transmission**: HTTPS/TLS required
- **Authentication**: OAuth 2.0 with proper scopes
- **Token Security**: Secure token storage

### Privacy Considerations

#### Data Minimization
- **Essential Data Only**: Store only necessary information
- **No Analytics**: No user tracking or analytics
- **Local Processing**: NLP processing done locally
- **User Control**: Complete data ownership

#### Data Transparency
- **Clear Storage**: Users can see all stored data
- **Export Capability**: Data export functionality
- **Deletion**: Complete data deletion on sign-out
- **Access Control**: User controls cloud sync

---

## Monitoring and Debugging

### Storage Monitoring

#### Performance Metrics
```typescript
interface StorageMetrics {
  readOperations: number;
  writeOperations: number;
  readLatency: number[];
  writeLatency: number[];
  storageSize: number;
  errorCount: number;
}

const trackStorageOperation = (operation: 'read' | 'write', duration: number): void => {
  // Track operation performance
  metrics[`${operation}Operations`]++;
  metrics[`${operation}Latency`].push(duration);
};
```

#### Error Tracking
```typescript
interface StorageError {
  timestamp: Date;
  operation: string;
  error: Error;
  context: any;
}

const logStorageError = (operation: string, error: Error, context?: any): void => {
  const errorLog: StorageError = {
    timestamp: new Date(),
    operation,
    error,
    context,
  };
  
  console.error('Storage Error:', errorLog);
  // Could send to analytics service in production
};
```

### Debugging Tools

#### Data Inspector
```typescript
const inspectStorage = (): void => {
  console.log('=== Storage Inspection ===');
  console.log('App State:', loadState());
  console.log('Storage Size:', getStorageSize());
  console.log('Sync Metadata:', getSyncMetadata());
  console.log('Validation:', validateAppState(loadState()));
};

const getStorageSize = (): number => {
  const data = storage.getString('app-storage') || '';
  return new Blob([data]).size;
};
```

#### Sync Debugger
```typescript
const debugSync = async (): Promise<void> => {
  console.log('=== Sync Debug ===');
  console.log('Signed In:', await SyncService.isSignedIn());
  console.log('Last Sync:', await getLocalMetadata());
  console.log('Remote Metadata:', await GoogleDriveSyncEngine.getDriveFileMetadata());
  console.log('Should Sync:', await GoogleDriveSyncEngine.shouldSync());
};
```

---

## Future Enhancements

### Database Improvements

#### Alternative Storage
- **SQLite**: For complex queries and relationships
- **IndexedDB**: Enhanced web storage
- **Realm**: Object-oriented database
- **WatermelonDB**: Reactive database

#### Performance Enhancements
- **Caching Layer**: In-memory caching
- **Compression**: Data compression algorithms
- **Lazy Loading**: Load data on demand
- **Indexing**: Fast data retrieval

### Advanced Features

#### Data Analytics
- **Usage Statistics**: Task completion rates
- **Performance Metrics**: Time tracking analytics
- **Trend Analysis**: Productivity patterns
- **Export Options**: CSV, PDF exports

#### Collaboration Features
- **Multi-user Support**: Shared tasks and folders
- **Real-time Sync**: Instant updates across devices
- **Conflict Resolution**: Advanced merge strategies
- **Permissions**: User access controls

This database documentation provides comprehensive coverage of all data storage aspects of the Daily To-Do application, including local storage, cloud synchronization, data models, and future enhancements.
