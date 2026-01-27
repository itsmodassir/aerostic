# App Update System

This document describes the app update functionality implemented for the iOS mobile app.

## Overview

The app includes an automatic update checking system that:
- Checks for updates every 30 minutes by default
- Shows update prompts when new versions are available
- Provides manual update checking capabilities
- Handles both optional and force updates

## Components

### 1. `useAppUpdates` Hook
Located in `src/hooks/useAppUpdates.ts`

**Features:**
- Automatic version checking
- Current vs latest version comparison
- Device information retrieval
- App Store integration

**Usage:**
```typescript
const { version, checkForUpdates, openAppStore } = useAppUpdates({
  checkInterval: 30, // minutes
  forceUpdate: false,
  storeUrl: 'https://apps.apple.com/app/aerostic/id123456789'
});
```

### 2. `AppUpdatePrompt` Component
Located in `src/components/AppUpdatePrompt.tsx`

**Features:**
- Automatic update dialogs
- Version information display
- Manual update checking
- Force update support

**Props:**
- `checkInterval`: How often to check for updates (minutes)
- `forceUpdate`: Whether updates are mandatory
- `storeUrl`: App Store URL for your app
- `showVersionInfo`: Show detailed version information

### 3. `AppVersionInfo` Component
Located in `src/components/AppVersionInfo.tsx`

A settings page component that displays detailed version information and manual update controls.

## Setup Instructions

### 1. Configure App Store URL
Update the `storeUrl` in the components to point to your actual App Store listing:

```typescript
const storeUrl = 'https://apps.apple.com/app/your-app-name/id123456789';
```

### 2. Configure Version API
Update the `getLatestVersion` function in `useAppUpdates.ts` to fetch from your backend or GitHub releases:

```typescript
const getLatestVersion = async (): Promise<string> => {
  const response = await fetch('https://api.your-backend.com/version');
  const data = await response.json();
  return data.version;
};
```

### 3. Integration
The update system is automatically integrated into the app through `App.tsx`. The `AppUpdatePrompt` component runs in the background and shows dialogs when updates are available.

## Configuration Options

### Automatic Updates
```typescript
<AppUpdatePrompt 
  checkInterval={30}     // Check every 30 minutes
  forceUpdate={false}    // Allow users to dismiss
  storeUrl="..."         // Your App Store URL
/>
```

### Manual Updates
```typescript
<AppUpdatePrompt 
  showVersionInfo={true}  // Show version details
  checkInterval={60}      // Check every hour
/>
```

## Testing

### Development
In development, the system will show demo updates. To test:
1. Modify the version comparison logic to return `true`
2. Test the update flow
3. Verify App Store opening

### Production
1. Deploy your app to the App Store
2. Configure the correct App Store URL
3. Set up your version API endpoint
4. Test with beta users

## iOS Specific Notes

### App Store Guidelines
- Updates must go through App Store review
- Use the official App Store URLs
- Handle update failures gracefully

### Version Management
- Use semantic versioning (e.g., 1.0.0)
- Update version in `package.json` and Xcode
- Keep version APIs updated

### User Experience
- Don't show update prompts too frequently
- Provide clear update benefits
- Handle network failures gracefully

## Troubleshooting

### Common Issues
1. **Updates not detected**: Check version API response
2. **App Store not opening**: Verify URL format
3. **Frequent prompts**: Adjust check interval
4. **Version comparison errors**: Validate version format

### Debug Mode
Enable debug logging in `useAppUpdates.ts`:
```typescript
console.log('Current version:', currentVersion);
console.log('Latest version:', latestVersion);
console.log('Update available:', updateAvailable);
```

## Next Steps

1. **Backend Integration**: Set up version API endpoint
2. **App Store Setup**: Configure correct App Store URL
3. **Analytics**: Track update adoption rates
4. **Testing**: Test with beta users
5. **Documentation**: Update user-facing documentation