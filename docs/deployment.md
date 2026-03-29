# Deployment Documentation

## Overview

This document provides comprehensive instructions for deploying the Daily To-Do application across different platforms including development, testing, and production environments.

## Prerequisites

### Development Environment
- Node.js 18.0+ and npm 8.0+
- Expo CLI installed globally
- Platform-specific development tools:
  - **iOS**: macOS with Xcode 14+
  - **Android**: Android Studio with SDK
  - **Web**: Modern web browser

### Accounts Required
- Expo account (expo.dev)
- Google Cloud Console project
- Apple Developer Account (iOS App Store)
- Google Play Console account (Android Play Store)

### Project Configuration
- Valid `app.json` configuration
- Proper Google Drive API setup
- Assets (icons, splash screens) prepared
- Environment variables configured

---

## Development Deployment

### Local Development Setup

#### Install Dependencies
```bash
# Install project dependencies
npm install

# Install Expo CLI globally
npm install -g @expo/cli

# Verify installation
expo --version
```

#### Environment Configuration
```bash
# Create environment file (if needed)
touch .env

# Add environment variables
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=your-web-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com
```

#### Run Development Server
```bash
# Start development server
npm start
# or
expo start

# Clear cache if needed
expo start --clear

# Start with tunnel for external access
expo start --tunnel
```

#### Platform-Specific Development

**iOS Simulator**:
```bash
# Install iOS dependencies
npx expo install react-native-screens react-native-safe-area-context

# Run on iOS simulator
expo start --ios
# or press 'i' in Expo CLI
```

**Android Emulator**:
```bash
# Install Android dependencies
npx expo install react-native-screens react-native-safe-area-context

# Run on Android emulator
expo start --android
# or press 'a' in Expo CLI
```

**Web Browser**:
```bash
# Run in web browser
expo start --web
# or press 'w' in Expo CLI
```

### Development Build Configuration

#### Setup EAS Build
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo account
eas login

# Configure project for EAS Build
eas build:configure
```

#### Development Build Profiles

**Update `eas.json`**:
```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "store"
    },
    "production": {
      "distribution": "store"
    }
  },
  "submit": {
    "production": {}
  }
}
```

#### Create Development Build
```bash
# Build for all platforms
eas build --platform all --profile development

# Build for specific platform
eas build --platform ios --profile development
eas build --platform android --profile development
```

#### Install Development Build
```bash
# Install on iOS (via QR code or TestFlight)
# Install on Android (via QR code or APK)
```

---

## Testing Deployment

### Preview Builds

#### Create Preview Build
```bash
# Build preview version for testing
eas build --platform all --profile preview

# Build specific platform
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

#### Testing Checklist
- [ ] All core features work correctly
- [ ] Navigation between screens
- [ ] Task CRUD operations
- [ ] Google Sign-In functionality
- [ ] Sync with Google Drive
- [ ] Push notifications
- [ ] Pomodoro timer
- [ ] Theme switching
- [ ] Responsive design
- [ ] Error handling

#### Beta Testing Distribution

**TestFlight (iOS)**:
```bash
# Submit to TestFlight
eas submit --platform ios --profile preview
```

**Google Play Internal Testing (Android)**:
```bash
# Submit to Google Play Console
eas submit --platform android --profile preview
```

---

## Production Deployment

### Production Build Configuration

#### Environment Setup
```bash
# Create production environment file
cp .env .env.production

# Update production variables
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=production-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=production-ios-client-id.apps.googleusercontent.com
```

#### Production Build Profile
```json
{
  "build": {
    "production": {
      "distribution": "store",
      "autoIncrement": true,
      "ios": {
        "resourceClass": "m1-medium"
      },
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### Build Production Version

#### Create Production Build
```bash
# Build for all platforms
eas build --platform all --profile production

# Build specific platform
eas build --platform ios --profile production
eas build --platform android --profile production
```

#### Build Optimization
```bash
# Enable auto increment version
eas build --platform all --profile production --autoIncrement

# Build with specific version
eas build --platform all --profile production --version 1.0.0 --buildNumber 1
```

---

## iOS App Store Deployment

### Prerequisites

#### Apple Developer Account
- Enroll in Apple Developer Program ($99/year)
- Create App ID in App Store Connect
- Generate provisioning profiles
- Configure App Store Connect metadata

#### App Store Connect Setup
1. **Create App**
   - Go to App Store Connect
   - Click "My Apps" → "+"
   - Fill app information
   - Select platforms (iOS)

2. **Configure App Information**
   - App name and description
   - Keywords and categories
   - Privacy policy URL
   - Support URL

3. **Set Up Pricing and Availability**
   - Price tier
   - Availability by country
   - Release date

### Build and Submit

#### Build iOS Production
```bash
# Build for App Store
eas build --platform ios --profile production

# Verify build details
eas build:view --platform ios --build-id <build-id>
```

#### Upload to App Store Connect
```bash
# Submit to App Store Connect
eas submit --platform ios --profile production
```

#### App Store Review Process

**Metadata Preparation**:
- App description and screenshots
- Privacy policy and terms of service
- App icons and promotional images
- Age rating and content information

**Review Guidelines**:
- Follow Apple App Store Review Guidelines
- Ensure proper UI/UX design
- Test all functionality thoroughly
- Provide demo account if needed

**Review Timeline**:
- Initial review: 1-7 days
- Rejection response: 1-3 days
- Approval: Immediate publishing

---

## Android Play Store Deployment

### Prerequisites

#### Google Play Developer Account
- Register for Google Play Developer Console ($25 one-time)
- Create application listing
- Configure store listing
- Set up content ratings

#### Play Console Setup
1. **Create Application**
   - Go to Google Play Console
   - Click "Create app"
   - Fill app details
   - Select app category

2. **Store Listing**
   - App name and description
   - Screenshots and promotional graphics
   - Content rating questionnaire
   - Privacy policy URL

3. **Release Management**
   - Internal testing track
   - Closed testing track
   - Open testing track
   - Production release

### Build and Submit

#### Build Android Production
```bash
# Build for Play Store
eas build --platform android --profile production

# Generate signed APK/AAB
eas build --platform android --profile production --type app-bundle
```

#### Upload to Play Console
```bash
# Submit to Play Console
eas submit --platform android --profile production
```

#### Release Process

**Internal Testing**:
- Upload APK/AAB to internal testing
- Test with internal team
- Fix any issues found

**Closed Testing**:
- Move to closed testing track
- Add external testers
- Collect feedback and fix issues

**Open Testing**:
- Release to open testing (optional)
- Gather broader user feedback
- Prepare for production release

**Production Release**:
- Promote to production
- Schedule release or publish immediately
- Monitor performance and crashes

---

## Web Deployment

### Static Web Build

#### Build for Web
```bash
# Build web version
npx expo build:web

# Build with custom configuration
npx expo build:web --config webpack.config.js
```

#### Web Hosting Options

**Netlify**:
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy to Netlify
netlify deploy --prod --dir=web-build
```

**Vercel**:
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod
```

**GitHub Pages**:
```bash
# Build and deploy to GitHub Pages
npm run build
# Deploy web-build folder to gh-pages branch
```

### Web Configuration

#### Update `app.json` for Web
```json
{
  "expo": {
    "web": {
      "favicon": "./assets/favicon.png",
      "bundler": "metro"
    }
  }
}
```

#### Custom Domain Setup
```bash
# Add custom domain to hosting provider
# Update DNS records
# Configure SSL certificate
```

---

## Environment Configuration

### Environment Variables

#### Development Environment
```bash
# .env.development
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=dev-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=dev-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_API_URL=https://dev-api.example.com
EXPO_PUBLIC_SENTRY_DSN=development-sentry-dsn
```

#### Production Environment
```bash
# .env.production
EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=prod-client-id.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=prod-ios-client-id.apps.googleusercontent.com
EXPO_PUBLIC_API_URL=https://api.example.com
EXPO_PUBLIC_SENTRY_DSN=production-sentry-dsn
```

### Build Configuration

#### Platform-Specific Settings
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.dailytodo",
      "buildNumber": "1.0.0",
      "supportsTablet": true
    },
    "android": {
      "package": "com.yourcompany.dailytodo",
      "versionCode": 1,
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE"
      }
    },
    "web": {
      "bundler": "metro",
      "output": "single"
    }
  }
}
```

---

## Monitoring and Analytics

### Error Monitoring

#### Sentry Setup
```bash
# Install Sentry
npm install @sentry/react-native @sentry/expo

# Configure Sentry
# Add to app.js or main entry point
```

#### Performance Monitoring
```bash
# Install performance monitoring
npm install @sentry/tracing

# Configure performance tracking
```

### Analytics Integration

#### Expo Analytics
```bash
# Enable analytics in app.json
{
  "expo": {
    "analytics": {
      "enabled": true
    }
  }
}
```

#### Custom Analytics
```bash
# Install analytics SDK
npm install @analytics/segment

# Configure analytics tracking
```

---

## Security Considerations

### API Security

#### Google Drive API
- Use OAuth 2.0 with proper scopes
- Implement token refresh logic
- Secure storage of access tokens
- Rate limiting and error handling

#### Data Protection
- Encrypt sensitive local data
- Use HTTPS for all network requests
- Implement proper authentication
- Follow platform security guidelines

### App Store Security

#### iOS Security
- Code signing with proper certificates
- App Transport Security (ATS) compliance
- Privacy policy and data handling
- App Store encryption requirements

#### Android Security
- Proper signing keys management
- Network security configuration
- Permissions justification
- Play Protect compliance

---

## Continuous Integration/Continuous Deployment (CI/CD)

### GitHub Actions Setup

#### Workflow Configuration
```yaml
# .github/workflows/build.yml
name: Build and Deploy

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    - uses: actions/setup-node@v2
      with:
        node-version: '18'
    - run: npm install
    - run: npm test
    - run: eas build --platform all --profile production
```

### Automated Testing

#### Unit Tests
```bash
# Install testing framework
npm install --save-dev jest @testing-library/react-native

# Run tests
npm test
```

#### E2E Tests
```bash
# Install E2E testing
npm install --save-dev detox

# Run E2E tests
npm run test:e2e
```

---

## Deployment Troubleshooting

### Common Build Issues

#### iOS Build Failures
```bash
# Clear build cache
eas build --clear-cache

# Check Xcode version
xcode-select --version

# Update iOS dependencies
npx expo install --fix
```

#### Android Build Failures
```bash
# Clear Gradle cache
cd android && ./gradlew clean

# Update Android dependencies
npx expo install --fix

# Check Android SDK configuration
```

#### Web Build Issues
```bash
# Clear Metro cache
npx expo start --clear

# Check webpack configuration
npm run build:web --verbose
```

### Common Deployment Issues

#### App Store Rejection
- Review Apple App Store Guidelines
- Fix metadata issues
- Resubmit with corrections

#### Play Store Rejection
- Review Google Play policies
- Fix policy violations
- Resubmit with corrections

#### Sync Issues
- Verify Google Drive API configuration
- Check OAuth consent screen
- Test authentication flow

---

## Post-Deployment Maintenance

### Version Management

#### Semantic Versioning
- MAJOR.MINOR.PATCH format
- Increment based on changes
- Document breaking changes

#### Release Notes
- Document new features
- List bug fixes
- Note breaking changes

### Monitoring

#### Crash Reporting
- Monitor crash rates
- Fix critical issues
- Track performance metrics

#### User Feedback
- Collect user reviews
- Respond to feedback
- Implement feature requests

### Updates

#### Regular Updates
- Security patches
- Feature enhancements
- Bug fixes

#### Update Deployment
- Test updates thoroughly
- Deploy incrementally
- Monitor for issues

---

## Rollback Procedures

### Emergency Rollback

#### App Store Rollback
- Submit new version with fixes
- Request expedited review
- Communicate with users

#### Play Store Rollback
- Publish previous stable version
- Use staged rollout
- Monitor rollback success

#### Web Rollback
- Revert to previous deployment
- Clear CDN cache
- Monitor web performance

---

## Performance Optimization

### Build Optimization

#### Bundle Size Reduction
- Remove unused dependencies
- Optimize images and assets
- Use code splitting

#### Build Speed
- Use build caching
- Parallelize builds
- Optimize dependencies

### Runtime Optimization

#### App Performance
- Monitor memory usage
- Optimize rendering performance
- Reduce battery consumption

#### Network Performance
- Implement caching strategies
- Optimize API calls
- Use compression

This deployment documentation provides comprehensive coverage of all deployment aspects for the Daily To-Do application, from development setup to production deployment and maintenance.
