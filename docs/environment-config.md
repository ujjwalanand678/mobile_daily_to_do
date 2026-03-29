# Environment and Configuration Documentation

## Overview

This document covers all environment variables, configuration files, feature flags, and build configurations used in the Daily To-Do application.

## Environment Variables

### Required Environment Variables

#### Google Sign-In Configuration
```bash
# Google OAuth Client IDs
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com
```

**Purpose**: Enable Google Sign-In and Google Drive synchronization  
**Source**: Google Cloud Console → Credentials → OAuth 2.0 Client IDs  
**Environment**: All environments (development, staging, production)

#### Application Configuration
```bash
# Application Metadata
EXPO_PUBLIC_APP_NAME=Daily To-Do
EXPO_PUBLIC_APP_VERSION=1.0.0
EXPO_PUBLIC_BUILD_NUMBER=1
```

**Purpose**: Application identification and versioning  
**Source**: Project configuration  
**Environment**: All environments

### Optional Environment Variables

#### Analytics and Monitoring
```bash
# Sentry Error Tracking
EXPO_PUBLIC_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Analytics Configuration
EXPO_PUBLIC_ANALYTICS_ENABLED=true
EXPO_PUBLIC_ANALYTICS_API_KEY=your-analytics-key
```

**Purpose**: Error tracking and usage analytics  
**Source**: Sentry dashboard, Analytics provider  
**Environment**: Production recommended, optional in development

#### Debug Configuration
```bash
# Debug Flags
EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=debug
EXPO_PUBLIC_PERFORMANCE_MONITORING=true
```

**Purpose**: Enhanced debugging and performance monitoring  
**Source**: Development configuration  
**Environment**: Development only

#### API Configuration
```bash
# API Endpoints (for future API integration)
EXPO_PUBLIC_API_BASE_URL=https://api.dailytodo.com
EXPO_PUBLIC_API_VERSION=v1
EXPO_PUBLIC_API_TIMEOUT=10000
```

**Purpose**: Backend API configuration  
**Source**: API service provider  
**Environment**: Environment-specific

### Environment Files

#### Development Environment (.env.development)
```bash
# Development Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=dev-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=dev-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=dev-android-client-id.apps.googleusercontent.com

EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=debug
EXPO_PUBLIC_PERFORMANCE_MONITORING=true

EXPO_PUBLIC_ANALYTICS_ENABLED=false
EXPO_PUBLIC_SENTRY_DSN=
```

#### Staging Environment (.env.staging)
```bash
# Staging Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=staging-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=staging-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=staging-android-client-id.apps.googleusercontent.com

EXPO_PUBLIC_DEBUG_MODE=true
EXPO_PUBLIC_LOG_LEVEL=info
EXPO_PUBLIC_PERFORMANCE_MONITORING=true

EXPO_PUBLIC_ANALYTICS_ENABLED=true
EXPO_PUBLIC_SENTRY_DSN=https://staging-sentry-dsn@sentry.io/project-id
```

#### Production Environment (.env.production)
```bash
# Production Configuration
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=prod-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=prod-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=prod-android-client-id.apps.googleusercontent.com

EXPO_PUBLIC_DEBUG_MODE=false
EXPO_PUBLIC_LOG_LEVEL=error
EXPO_PUBLIC_PERFORMANCE_MONITORING=false

EXPO_PUBLIC_ANALYTICS_ENABLED=true
EXPO_PUBLIC_SENTRY_DSN=https://prod-sentry-dsn@sentry.io/project-id
```

---

## Configuration Files

### Application Configuration (app.json)

#### Complete Configuration
```json
{
  "expo": {
    "name": "Daily To-Do",
    "slug": "daily_to_do",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "assetBundlePatterns": [
      "**/*"
    ],
    "ios": {
      "supportsTablet": true,
      "bundleIdentifier": "com.yourcompany.dailytodo",
      "buildNumber": "1.0.0",
      "infoPlist": {
        "NSCameraUsageDescription": "This app uses camera for profile pictures",
        "NSMicrophoneUsageDescription": "This app uses microphone for voice notes"
      }
    },
    "android": {
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png",
        "backgroundImage": "./assets/android-icon-background.png",
        "monochromeImage": "./assets/android-icon-monochrome.png"
      },
      "package": "com.yourcompany.dailytodo",
      "versionCode": 1,
      "permissions": [
        "CAMERA",
        "RECORD_AUDIO",
        "READ_EXTERNAL_STORAGE",
        "WRITE_EXTERNAL_STORAGE"
      ]
    },
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro",
      "output": "single",
      "meta": {
        "description": "Daily To-Do - Organize your tasks with smart features"
      }
    },
    "plugins": [
      "expo-font",
      "expo-asset",
      [
        "expo-notifications",
        {
          "icon": "./assets/notification-icon.png",
          "color": "#007AFF",
          "defaultChannel": "default"
        }
      ],
      [
        "expo-splash-screen",
        {
          "image": "./assets/splash-icon.png",
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ]
    ],
    "extra": {
      "eas": {
        "projectId": "your-eas-project-id"
      },
      "googleWebClientId": "${EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID}",
      "googleIosClientId": "${EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID}",
      "googleAndroidClientId": "${EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID}"
    }
  }
}
```

#### Configuration Sections Explained

**Basic App Information**:
- `name`: Display name of the application
- `slug`: URL-friendly identifier
- `version`: Human-readable version
- `orientation`: Screen orientation lock

**Asset Configuration**:
- `icon`: App icon for all platforms
- `splash`: Splash screen configuration
- `assetBundlePatterns`: Assets to include in bundle

**Platform-Specific Settings**:
- `ios`: iOS-specific configuration
- `android`: Android-specific configuration
- `web`: Web-specific configuration

**Plugins**:
- `expo-font`: Font loading
- `expo-asset`: Asset management
- `expo-notifications`: Push notifications
- `expo-splash-screen`: Splash screen control

---

## Build Configuration (eas.json)

### Complete Build Configuration
```json
{
  "cli": {
    "version": ">= 3.0.0",
    "requireCodeSigning": true
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "channel": "development",
      "cache": {
        "disabled": false
      },
      "env": {
        "EXPO_PUBLIC_DEBUG_MODE": "true",
        "EXPO_PUBLIC_LOG_LEVEL": "debug"
      }
    },
    "preview": {
      "distribution": "store",
      "channel": "preview",
      "autoIncrement": true,
      "cache": {
        "disabled": false
      },
      "env": {
        "EXPO_PUBLIC_DEBUG_MODE": "true",
        "EXPO_PUBLIC_LOG_LEVEL": "info"
      },
      "ios": {
        "resourceClass": "m1-medium"
      },
      "android": {
        "buildType": "apk",
        "gradleCommand": ":app:assembleRelease"
      }
    },
    "production": {
      "distribution": "store",
      "channel": "production",
      "autoIncrement": true,
      "cache": {
        "disabled": false
      },
      "env": {
        "EXPO_PUBLIC_DEBUG_MODE": "false",
        "EXPO_PUBLIC_LOG_LEVEL": "error"
      },
      "ios": {
        "resourceClass": "m1-medium",
        "simulator": false
      },
      "android": {
        "buildType": "app-bundle",
        "gradleCommand": ":app:bundleRelease"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id",
        "appleIdPassword": "${APPLE_ID_PASSWORD}",
        "ascAppId": "your-app-store-connect-app-id"
      },
      "android": {
        "serviceAccountKey": "./google-service-account.json",
        "track": "production"
      }
    }
  },
  "hooks": {
    "preBuild": {
      "script": "npm run pre-build"
    },
    "postBuild": {
      "script": "npm run post-build"
    }
  }
}
```

### Build Profiles Explained

**Development Build**:
- Uses Expo development client
- Internal distribution for testing
- Debug features enabled
- Fast build times

**Preview Build**:
- Store distribution ready
- Beta testing channels
- Auto-increment version
- Optimized for testing

**Production Build**:
- Store distribution
- Production channel
- Maximum optimization
- Release ready

---

## TypeScript Configuration (tsconfig.json)

### Complete TypeScript Configuration
```json
{
  "extends": "expo/tsconfig.base",
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "allowJs": true,
    "checkJs": false,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/screens/*": ["screens/*"],
      "@/utils/*": ["utils/*"],
      "@/types/*": ["types/*"],
      "@/store/*": ["store/*"],
      "@/theme/*": ["theme/*"],
      "@/services/*": ["services/*"],
      "@/navigation/*": ["navigation/*"]
    },
    "typeRoots": [
      "./node_modules/@types",
      "./@types"
    ]
  },
  "include": [
    "src/**/*",
    "App.tsx",
    "index.ts"
  ],
  "exclude": [
    "node_modules",
    "babel.config.js",
    "metro.config.js",
    "jest.config.js"
  ]
}
```

### TypeScript Configuration Explained

**Compiler Options**:
- `strict`: Enable all strict type checking
- `baseUrl`: Base directory for module resolution
- `paths`: Path mapping for imports
- `jsx`: JSX transform configuration

**Include/Exclude**:
- Include source files and app entry points
- Exclude configuration and test files

---

## Feature Flags

### Implementation

#### Feature Flag Configuration
```typescript
// src/config/featureFlags.ts
export interface FeatureFlags {
  enableGoogleDrive: boolean;
  enableNotifications: boolean;
  enablePomodoroTimer: boolean;
  enableDailyPlanner: boolean;
  enableAnalytics: boolean;
  enableDebugMode: boolean;
  enableBetaFeatures: boolean;
}

export const defaultFlags: FeatureFlags = {
  enableGoogleDrive: true,
  enableNotifications: true,
  enablePomodoroTimer: true,
  enableDailyPlanner: true,
  enableAnalytics: false,
  enableDebugMode: false,
  enableBetaFeatures: false,
};

export const developmentFlags: FeatureFlags = {
  ...defaultFlags,
  enableAnalytics: false,
  enableDebugMode: true,
  enableBetaFeatures: true,
};

export const productionFlags: FeatureFlags = {
  ...defaultFlags,
  enableAnalytics: true,
  enableDebugMode: false,
  enableBetaFeatures: false,
};

export const getFeatureFlags = (): FeatureFlags => {
  const environment = process.env.NODE_ENV || 'development';
  
  switch (environment) {
    case 'production':
      return productionFlags;
    case 'development':
      return developmentFlags;
    default:
      return defaultFlags;
  }
};
```

#### Feature Flag Usage
```typescript
// src/hooks/useFeatureFlags.ts
import { useAtom } from 'jotai';
import { getFeatureFlags } from '../config/featureFlags';

export const useFeatureFlags = () => {
  const flags = getFeatureFlags();
  
  return {
    isGoogleDriveEnabled: flags.enableGoogleDrive,
    areNotificationsEnabled: flags.enableNotifications,
    isPomodoroTimerEnabled: flags.enablePomodoroTimer,
    isDailyPlannerEnabled: flags.enableDailyPlanner,
    isAnalyticsEnabled: flags.enableAnalytics,
    isDebugModeEnabled: flags.enableDebugMode,
    areBetaFeaturesEnabled: flags.enableBetaFeatures,
  };
};
```

### Feature Flag Examples

#### Conditional Feature Rendering
```typescript
// Example: Conditional Google Drive Sync
const SyncSettings = () => {
  const { isGoogleDriveEnabled } = useFeatureFlags();
  
  if (!isGoogleDriveEnabled) {
    return <Text>Sync is not available in this version</Text>;
  }
  
  return <GoogleDriveSyncSettings />;
};
```

#### Beta Feature Access
```typescript
// Example: Beta feature gate
const BetaFeature = () => {
  const { areBetaFeaturesEnabled } = useFeatureFlags();
  
  if (!areBetaFeaturesEnabled) {
    return null;
  }
  
  return <NewExperimentalFeature />;
};
```

---

## Platform-Specific Configuration

### iOS Configuration

#### Info.plist Customizations
```xml
<!-- ios/Info.plist additions -->
<key>NSCameraUsageDescription</key>
<string>This app uses camera for profile pictures</string>
<key>NSMicrophoneUsageDescription</key>
<string>This app uses microphone for voice notes</string>
<key>UIBackgroundModes</key>
<array>
  <string>background-fetch</string>
  <string>background-processing</string>
  <string>remote-notification</string>
</array>
```

#### App Store Connect Configuration
```json
{
  "ios": {
    "bundleIdentifier": "com.yourcompany.dailytodo",
    "buildNumber": "1.0.0",
    "supportsTablet": true,
    "infoPlist": {
      "CFBundleDisplayName": "Daily To-Do",
      "CFBundleVersion": "1.0.0",
      "LSRequiresIPhoneOS": true,
      "UIRequiredDeviceCapabilities": ["armv7"]
    }
  }
}
```

### Android Configuration

#### AndroidManifest.xml Customizations
```xml
<!-- Android manifest additions -->
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.RECORD_AUDIO" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
```

#### Gradle Configuration
```gradle
// android/app/build.gradle
android {
    compileSdkVersion rootProject.ext.compileSdkVersion

    compileOptions {
        sourceCompatibility JavaVersion.VERSION_11
        targetCompatibility JavaVersion.VERSION_11
    }

    kotlinOptions {
        jvmTarget = '11'
    }

    defaultConfig {
        applicationId "com.yourcompany.dailytodo"
        minSdkVersion rootProject.ext.minSdkVersion
        targetSdkVersion rootProject.ext.targetSdkVersion
        versionCode 1
        versionName "1.0.0"
    }
}
```

### Web Configuration

#### Webpack Configuration
```javascript
// webpack.config.js
const createExpoWebpackConfigAsync = require('@expo/webpack-config');

module.exports = async function (env, argv) {
  const config = await createExpoWebpackConfigAsync({
    ...env,
    babel: {
      dangerouslyAddModulePathsToTranspile: ['@expo/vector-icons'],
    },
  });
  
  // Add custom webpack configuration
  config.resolve.alias = {
    ...config.resolve.alias,
    '@': './src',
  };
  
  return config;
};
```

---

## Environment Setup Scripts

### Setup Scripts

#### Environment Setup Script
```bash
#!/bin/bash
# scripts/setup-env.sh

echo "Setting up Daily To-Do environment..."

# Check for required environment variables
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please update .env with your configuration"
fi

# Install dependencies
echo "Installing dependencies..."
npm install

# Install Expo CLI
echo "Installing Expo CLI..."
npm install -g @expo/cli

# Setup EAS CLI
echo "Setting up EAS CLI..."
npm install -g eas-cli
eas login

echo "Environment setup complete!"
echo "Next steps:"
echo "1. Update .env with your Google Client IDs"
echo "2. Run 'npm start' to start development server"
```

#### Environment Validation Script
```bash
#!/bin/bash
# scripts/validate-env.sh

echo "Validating environment configuration..."

# Check required environment variables
required_vars=(
    "EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID"
    "EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID"
    "EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -gt 0 ]; then
    echo "❌ Missing required environment variables:"
    printf '%s\n' "${missing_vars[@]}"
    exit 1
fi

echo "✅ Environment validation passed!"
```

---

## Configuration Management

### Configuration Loading

#### Configuration Service
```typescript
// src/config/configService.ts
export class ConfigService {
  private static instance: ConfigService;
  private config: any;

  private constructor() {
    this.loadConfig();
  }

  static getInstance(): ConfigService {
    if (!ConfigService.instance) {
      ConfigService.instance = new ConfigService();
    }
    return ConfigService.instance;
  }

  private loadConfig(): void {
    this.config = {
      environment: process.env.NODE_ENV || 'development',
      google: {
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
        androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
      },
      analytics: {
        enabled: process.env.EXPO_PUBLIC_ANALYTICS_ENABLED === 'true',
        apiKey: process.env.EXPO_PUBLIC_ANALYTICS_API_KEY,
      },
      sentry: {
        dsn: process.env.EXPO_PUBLIC_SENTRY_DSN,
      },
      debug: {
        enabled: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
        logLevel: process.env.EXPO_PUBLIC_LOG_LEVEL || 'info',
      },
    };
  }

  get(key: string): any {
    return this.getNestedValue(this.config, key);
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}
```

#### Configuration Usage
```typescript
// src/hooks/useConfig.ts
import { ConfigService } from '../config/configService';

export const useConfig = () => {
  const config = ConfigService.getInstance();
  
  return {
    environment: config.get('environment'),
    googleClientId: config.get('google.webClientId'),
    isAnalyticsEnabled: config.get('analytics.enabled'),
    isDebugEnabled: config.get('debug.enabled'),
  };
};
```

---

## Security Configuration

### Environment Variable Security

#### Sensitive Data Handling
```typescript
// src/config/secrets.ts
export class SecretsManager {
  private static secrets: Map<string, string> = new Map();
  
  static setSecret(key: string, value: string): void {
    // In production, use secure storage
    if (process.env.NODE_ENV === 'production') {
      // Store in secure storage (MMKV with encryption)
      const { MMKV } = require('react-native-mmkv');
      const storage = new MMKV({ id: 'secrets', encryptionKey: 'your-encryption-key' });
      storage.set(key, value);
    } else {
      this.secrets.set(key, value);
    }
  }
  
  static getSecret(key: string): string | undefined {
    if (process.env.NODE_ENV === 'production') {
      const { MMKV } = require('react-native-mmkv');
      const storage = new MMKV({ id: 'secrets', encryptionKey: 'your-encryption-key' });
      return storage.getString(key);
    }
    return this.secrets.get(key);
  }
}
```

#### API Key Protection
```typescript
// src/utils/apiProtection.ts
export const protectApiKey = (apiKey: string): string => {
  // Mask API key for logging
  if (apiKey.length <= 8) return '***';
  return apiKey.substring(0, 4) + '***' + apiKey.substring(apiKey.length - 4);
};

export const validateApiKey = (apiKey: string): boolean => {
  // Basic validation for API key format
  return apiKey.length >= 20 && /^[a-zA-Z0-9._-]+$/.test(apiKey);
};
```

---

## Debug Configuration

### Debug Tools Setup

#### Debug Configuration
```typescript
// src/config/debug.ts
export const debugConfig = {
  enabled: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
  logLevel: process.env.EXPO_PUBLIC_LOG_LEVEL || 'info',
  performanceMonitoring: process.env.EXPO_PUBLIC_PERFORMANCE_MONITORING === 'true',
  
  // Debug endpoints
  apiEndpoints: {
    mock: process.env.NODE_ENV === 'development',
    staging: process.env.NODE_ENV === 'staging',
  },
  
  // Feature flags for debugging
  features: {
    verboseLogging: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
    networkLogging: process.env.EXPO_PUBLIC_DEBUG_MODE === 'true',
    performanceLogging: process.env.EXPO_PUBLIC_PERFORMANCE_MONITORING === 'true',
  },
};
```

#### Debug Logger
```typescript
// src/utils/debugLogger.ts
export class DebugLogger {
  private static isDebugEnabled(): boolean {
    return process.env.EXPO_PUBLIC_DEBUG_MODE === 'true';
  }

  static log(message: string, data?: any): void {
    if (this.isDebugEnabled()) {
      console.log(`[DEBUG] ${message}`, data);
    }
  }

  static error(message: string, error?: Error): void {
    if (this.isDebugEnabled()) {
      console.error(`[ERROR] ${message}`, error);
    }
  }

  static performance(operation: string, startTime: number): void {
    if (process.env.EXPO_PUBLIC_PERFORMANCE_MONITORING === 'true') {
      const duration = Date.now() - startTime;
      console.log(`[PERF] ${operation}: ${duration}ms`);
    }
  }
}
```

---

## Configuration Validation

### Validation Rules

#### Environment Variable Validation
```typescript
// src/config/validation.ts
export interface ValidationRule {
  required: boolean;
  pattern?: RegExp;
  minLength?: number;
  custom?: (value: string) => boolean;
}

export const validationRules: Record<string, ValidationRule> = {
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: {
    required: true,
    pattern: /^[a-zA-Z0-9._-]+\.apps\.googleusercontent\.com$/,
    custom: (value) => value.includes('.apps.googleusercontent.com'),
  },
  EXPO_PUBLIC_APP_VERSION: {
    required: true,
    pattern: /^\d+\.\d+\.\d+$/,
  },
  EXPO_PUBLIC_SENTRY_DSN: {
    required: false,
    pattern: /^https:\/\/[a-zA-Z0-9._-]+@sentry\.io\/\d+$/,
  },
};

export const validateEnvironment = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = [];

  Object.entries(validationRules).forEach(([key, rule]) => {
    const value = process.env[key];

    if (rule.required && !value) {
      errors.push(`Missing required environment variable: ${key}`);
      return;
    }

    if (value && rule.pattern && !rule.pattern.test(value)) {
      errors.push(`Invalid format for ${key}: ${value}`);
    }

    if (value && rule.minLength && value.length < rule.minLength) {
      errors.push(`${key} must be at least ${rule.minLength} characters`);
    }

    if (value && rule.custom && !rule.custom(value)) {
      errors.push(`Custom validation failed for ${key}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
  };
};
```

---

## Configuration Best Practices

### Environment Management

1. **Use Environment-Specific Files**
   - Separate `.env.development`, `.env.staging`, `.env.production`
   - Load appropriate file based on NODE_ENV

2. **Secure Sensitive Data**
   - Never commit `.env` files to version control
   - Use secure storage for production secrets
   - Rotate API keys regularly

3. **Validate Configuration**
   - Validate required environment variables on startup
   - Provide clear error messages for missing configuration
   - Fail fast for critical configuration errors

4. **Document Configuration**
   - Maintain clear documentation for all environment variables
   - Include examples and default values
   - Explain purpose and source of each variable

5. **Use Feature Flags**
   - Implement feature flags for conditional functionality
   - Enable debug features only in development
   - Control beta features with flags

### Build Configuration

1. **Optimize Build Profiles**
   - Separate development, preview, and production builds
   - Enable appropriate optimizations for each profile
   - Use caching to improve build times

2. **Platform-Specific Configuration**
   - Customize settings for iOS, Android, and Web
   - Handle platform differences gracefully
   - Test on all target platforms

3. **Version Management**
   - Use semantic versioning
   - Auto-increment build numbers
   - Maintain clear changelog

This environment and configuration documentation provides comprehensive coverage of all configuration aspects needed to build, deploy, and maintain the Daily To-Do application across different environments and platforms.
