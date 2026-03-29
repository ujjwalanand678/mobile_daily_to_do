# API Documentation

## Overview

The Daily To-Do application uses Google Drive API for cloud synchronization and Expo Notifications API for local notifications. This document documents all external API integrations and internal service APIs.

## External APIs

### Google Drive API

#### Authentication

**OAuth 2.0 Flow**
- **Scope Required**: `https://www.googleapis.com/auth/drive.appdata`
- **Client IDs**: Configured in GoogleSignin.configure()
- **Token Management**: Automatic refresh using refresh tokens
- **Permissions**: Private app data folder access only

#### API Endpoints

##### Upload File

**Endpoint**: `POST https://www.googleapis.com/upload/drive/v3/files`  
**Method**: POST (new file) / PATCH (existing file)  
**Purpose**: Upload application state to Google Drive

**Request Headers**:
```
Authorization: Bearer {access_token}
Content-Type: multipart/form-data
```

**Request Body**:
```
--boundary
Content-Disposition: form-data; name="metadata"
Content-Type: application/json

{
  "name": "daily_todo_backup.json",
  "parents": ["appDataFolder"]
}
--boundary
Content-Disposition: form-data; name="file"
Content-Type: application/json

{serialized_app_state}
--boundary--
```

**Response**:
```json
{
  "id": "file_id",
  "name": "daily_todo_backup.json",
  "modifiedTime": "2023-01-01T00:00:00.000Z"
}
```

**Error Handling**:
- `401 Unauthorized`: Token expired, requires re-authentication
- `403 Forbidden`: Insufficient permissions
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Server-side error

---

##### Download File

**Endpoint**: `GET https://www.googleapis.com/drive/v3/files/{fileId}?alt=media`  
**Method**: GET  
**Purpose**: Download application state from Google Drive

**Request Headers**:
```
Authorization: Bearer {access_token}
```

**Response**:
```
Content-Type: application/json
{serialized_app_state}
```

**Error Handling**:
- `404 Not Found`: File doesn't exist
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Access denied

---

##### Search Files

**Endpoint**: `GET https://www.googleapis.com/drive/v3/files`  
**Method**: GET  
**Purpose**: Find backup files in app data folder

**Query Parameters**:
```
q=name='daily_todo_backup.json' and trashed=false and 'appDataFolder' in parents
fields=id,name,modifiedTime,size
```

**Request Headers**:
```
Authorization: Bearer {access_token}
```

**Response**:
```json
{
  "files": [
    {
      "id": "file_id",
      "name": "daily_todo_backup.json",
      "modifiedTime": "2023-01-01T00:00:00.000Z",
      "size": "1024"
    }
  ]
}
```

**Error Handling**:
- Empty files array when no backup exists
- Authentication errors handled by token refresh

---

### Expo Notifications API

#### Permission Management

##### Request Permissions

**Method**: `Notifications.requestPermissionsAsync()`  
**Purpose**: Request notification permissions from user

**Response**:
```typescript
{
  status: 'granted' | 'denied' | 'undetermined',
  canAskAgain: boolean
}
```

**Platform Differences**:
- **iOS**: System permission dialog
- **Android**: Runtime permission
- **Web**: Always granted (mock implementation)

---

##### Schedule Notification

**Method**: `Notifications.scheduleNotificationAsync()`  
**Purpose**: Schedule local notification for task reminder

**Request Body**:
```typescript
{
  content: {
    title: string;
    body: string;
    data: { taskId: string };
    sound: 'default' | 'default' | boolean;
  };
  trigger: {
    date: Date;
  };
}
```

**Response**: `string` - Notification ID

**Example**:
```typescript
const notificationId = await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Task Reminder',
    body: 'Complete project documentation',
    data: { taskId: '123' },
    sound: 'default',
  },
  trigger: {
    date: new Date('2023-01-01T10:00:00'),
  },
});
```

**Error Handling**:
- Permission denied errors
- Invalid date errors
- Platform-specific limitations

---

##### Cancel Notification

**Method**: `Notifications.cancelScheduledNotificationAsync()`  
**Purpose**: Cancel scheduled notification

**Parameters**:
- `notificationId`: string - ID of notification to cancel

**Error Handling**:
- Invalid notification ID
- Already cancelled notifications

---

## Internal Service APIs

### SyncService API

#### Configuration

##### initialize()

**Method**: `SyncService.initialize()`  
**Purpose**: Initialize sync service and configure Google Sign-In  
**Returns**: `Promise<void>`

**Implementation**:
```typescript
static async initialize(): Promise<void> {
  if (Platform.OS === 'web') return;
  await GoogleDriveSyncEngine.configure();
}
```

**Error Handling**:
- Platform-specific configuration errors
- Google Sign-In setup failures

---

#### Authentication

##### signIn()

**Method**: `SyncService.signIn()`  
**Purpose**: Authenticate user with Google  
**Returns**: `Promise<boolean>` - Success status

**Implementation**:
```typescript
static async signIn(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  return await GoogleDriveSyncEngine.signIn();
}
```

**Side Effects**:
- Stores authentication tokens
- Triggers initial sync
- Updates UI state

**Error Handling**:
- Network connectivity issues
- Authentication failures
- Permission denials

---

##### signOut()

**Method**: `SyncService.signOut()`  
**Purpose**: Sign out user and clear authentication  
**Returns**: `Promise<void>`

**Side Effects**:
- Clears authentication tokens
- Stops background sync
- Updates UI state

---

##### isSignedIn()

**Method**: `SyncService.isSignedIn()`  
**Purpose**: Check current authentication status  
**Returns**: `Promise<boolean>`

---

#### Synchronization

##### syncWithDrive()

**Method**: `SyncService.syncWithDrive(localState: AppState)`  
**Purpose**: Synchronize local state with Google Drive  
**Returns**: `Promise<'uploaded' | 'downloaded' | 'no_action' | 'error'>`

**Parameters**:
```typescript
interface AppState {
  tasks: Task[];
  folders: Folder[];
  tags: Tag[];
}
```

**Return Values**:
- `uploaded`: Local data uploaded to Drive
- `downloaded`: Remote data downloaded and applied
- `no_action`: No sync needed (up-to-date)
- `error`: Sync operation failed

**Implementation Flow**:
1. Check authentication status
2. Compare local and remote timestamps
3. Determine sync direction
4. Execute upload/download
5. Update local metadata
6. Apply remote changes if downloaded

**Error Handling**:
- Network connectivity issues
- Authentication failures
- Data corruption handling
- Conflict resolution

---

##### performBackgroundSync()

**Method**: `SyncService.performBackgroundSync()`  
**Purpose**: Automatic background synchronization  
**Returns**: `Promise<void>`

**Trigger Conditions**:
- After state changes
- On app foreground
- Periodic intervals

**Implementation**:
```typescript
static async performBackgroundSync(): Promise<void> {
  const isSignedIn = await this.isSignedIn();
  if (!isSignedIn) return;

  const localState = await this.getLocalState();
  if (!localState) return;

  const result = await this.syncWithDrive(localState);
  
  if (result === 'downloaded') {
    const remoteState = await this.downloadFromDrive();
    if (remoteState) {
      await this.saveLocalState(remoteState);
    }
  }
}
```

---

### GoogleDriveSyncEngine API

#### File Operations

##### uploadToDrive()

**Method**: `GoogleDriveSyncEngine.uploadToDrive(data: string)`  
**Purpose**: Upload serialized data to Google Drive  
**Returns**: `Promise<void>`

**Parameters**:
- `data`: JSON string of application state

**Implementation**:
1. Check for existing file
2. Create metadata
3. Prepare multipart form data
4. Execute upload (POST or PATCH)
5. Handle response

**Error Handling**:
- File size limitations
- Network failures
- Authentication errors

---

##### downloadFromDrive()

**Method**: `GoogleDriveSyncEngine.downloadFromDrive()`  
**Purpose**: Download data from Google Drive  
**Returns**: `Promise<string | null>`

**Implementation**:
1. Find backup file
2. Download file content
3. Return raw data string

**Error Handling**:
- File not found
- Network errors
- Data corruption

---

##### getDriveFileMetadata()

**Method**: `GoogleDriveSyncEngine.getDriveFileMetadata()`  
**Purpose**: Get file metadata for sync comparison  
**Returns**: `Promise<DriveFile | null>`

**Response Type**:
```typescript
interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}
```

---

#### Sync Logic

##### shouldSync()

**Method**: `GoogleDriveSyncEngine.shouldSync()`  
**Purpose**: Determine if synchronization is needed  
**Returns**: `Promise<boolean>`

**Logic**:
1. Check authentication status
2. Compare local and remote timestamps
3. Apply threshold (1 minute)
4. Return sync decision

---

##### performSync()

**Method**: `GoogleDriveSyncEngine.performSync(localData: string)`  
**Purpose**: Execute synchronization logic  
**Returns**: `Promise<'uploaded' | 'downloaded' | 'no_action'>`

**Conflict Resolution**:
- Timestamp-based comparison
- Last-write-wins strategy
- Device ID tracking
- 1-minute threshold for concurrent changes

---

### NotificationManager API

#### Permission Management

##### requestPermissions()

**Method**: `NotificationManager.requestPermissions()`  
**Purpose**: Request notification permissions  
**Returns**: `Promise<boolean>`

**Platform Handling**:
- **Native**: Actual permission request
- **Web**: Mock implementation (always true)

---

#### Notification Scheduling

##### scheduleNotification()

**Method**: `NotificationManager.scheduleNotification(taskTitle, scheduledDate, taskId)`  
**Purpose**: Schedule task reminder notification  
**Returns**: `Promise<string | null>` - Notification ID

**Parameters**:
- `taskTitle`: string - Task title for notification body
- `scheduledDate`: Date - When to show notification
- `taskId`: string - Task identifier for notification data

**Implementation**:
```typescript
static async scheduleNotification(
  taskTitle: string,
  scheduledDate: Date,
  taskId: string
): Promise<string | null> {
  if (Platform.OS === 'web') {
    return 'mock-notification-id';
  }

  const notificationId = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Task Reminder',
      body: taskTitle,
      data: { taskId },
      sound: 'default',
    },
    trigger: { date: scheduledDate },
  });

  return notificationId;
}
```

**Validation**:
- Future date validation
- Permission status check
- Platform compatibility

---

##### cancelNotification()

**Method**: `NotificationManager.cancelNotification(notificationId)`  
**Purpose**: Cancel scheduled notification  
**Returns**: `Promise<void>`

**Error Handling**:
- Invalid notification ID
- Already cancelled notifications
- Platform-specific errors

---

##### rescheduleNotification()

**Method**: `NotificationManager.rescheduleNotification(taskTitle, scheduledDate, taskId, oldNotificationId)`  
**Purpose**: Update existing notification  
**Returns**: `Promise<string | null>`

**Implementation**:
1. Cancel old notification if exists
2. Schedule new notification
3. Return new notification ID

**Use Cases**:
- Task due date changes
- Task title updates
- Time adjustments

---

## Data Formats

### Application State Format

```typescript
interface AppState {
  tasks: Task[];
  folders: Folder[];
  tags: Tag[];
}

interface Task {
  id: string;
  title: string;
  notes?: string;
  isCompleted: boolean;
  dueDate?: Date;
  priority: 'low' | 'med' | 'high';
  folderId: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  notificationId?: string;
  timeSpent?: number;
}

interface Folder {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Tag {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Sync Metadata Format

```typescript
interface SyncMetadata {
  lastSyncTime: number;
  deviceId: string;
  appVersion: string;
}
```

### Google Drive File Metadata

```typescript
interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
  size?: string;
}
```

## Error Handling

### Authentication Errors

**Types**:
- Token expiration
- Permission denial
- Network failures
- Configuration errors

**Handling**:
- Automatic token refresh
- User re-authentication prompts
- Graceful fallback to offline mode
- Clear error messages

### Sync Errors

**Types**:
- Network connectivity
- Data corruption
- Conflict resolution failures
- API rate limits

**Handling**:
- Retry mechanisms with exponential backoff
- Data validation and recovery
- User notification of sync failures
- Manual sync options

### Notification Errors

**Types**:
- Permission denied
- Invalid scheduling
- Platform limitations
- System restrictions

**Handling**:
- Permission request guidance
- Fallback to visual reminders
- Platform-specific workarounds
- User education

## Rate Limiting

### Google Drive API Limits

- **Upload/Download**: 1,000,000 requests per day
- **File Operations**: 10,000 requests per second per user
- **Storage**: 15 GB free per user

### Mitigation Strategies

- Batch operations when possible
- Background sync throttling
- Incremental updates only
- Local caching to reduce API calls

## Security Considerations

### Data Protection

- **Private Storage**: App Data Folder access only
- **Encrypted Transmission**: HTTPS required
- **Token Security**: Secure token storage
- **Scope Minimization**: Request only necessary permissions

### Authentication Security

- **OAuth 2.0**: Standard authentication flow
- **Token Refresh**: Automatic token renewal
- **Scope Validation**: Ensure required permissions
- **User Control**: Clear sign-out options

## Performance Optimization

### API Optimization

- **Compression**: JSON data compression
- **Caching**: Metadata and file caching
- **Batching**: Multiple operations in single request
- **Background Processing**: Non-blocking operations

### Sync Optimization

- **Incremental Sync**: Only sync changed data
- **Timestamp Comparison**: Avoid unnecessary uploads
- **Delta Updates**: Partial data updates
- **Conflict Prevention**: Proactive conflict detection

## Testing

### API Testing

- **Mock Services**: Local testing with mock APIs
- **Integration Tests**: End-to-end API testing
- **Error Scenarios**: Network failure testing
- **Performance Tests**: API response time testing

### Sync Testing

- **Conflict Resolution**: Simultaneous update testing
- **Data Integrity**: Data corruption testing
- **Recovery**: Error recovery testing
- **Performance**: Large dataset testing

## Future API Enhancements

### Potential Integrations

- **Calendar APIs**: Integration with Google Calendar
- **Reminder APIs**: Enhanced notification systems
- **Collaboration APIs**: Multi-user support
- **Analytics APIs**: Usage tracking and insights

### API Versioning

- **Backward Compatibility**: Maintain API compatibility
- **Version Management**: Clear versioning strategy
- **Migration Paths**: Smooth upgrade paths
- **Deprecation Notices**: Advance warning for changes

This API documentation provides comprehensive coverage of all external and internal APIs used in the Daily To-Do application, including authentication, synchronization, and notification systems.
