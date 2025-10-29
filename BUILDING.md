# Building and Installing the Extensions

This repository contains two versions of the YouTube Likes Ratio extension: one for Chrome and one for Firefox.

## Chrome Extension

**Location:** `chrome-extension/`

### Installation (Development)
1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" in the top right
3. Click "Load unpacked"
4. Select the `chrome-extension` directory

### Packaging for Distribution
To create a `.zip` file for the Chrome Web Store:
```bash
cd chrome-extension
zip -r ../chrome-extension.zip .
```

### Key Features
- Uses Manifest V3 (latest Chrome standard)
- Uses `host_permissions` for site access
- Available on the [Chrome Web Store](https://chrome.google.com/webstore/detail/youtube-likes-ratio/lmalclgdccahfecpdlncehpnceeloppo)

## Firefox Extension

**Location:** `firefox-extension/`

### Installation (Development)
1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
2. Click "Load Temporary Add-on"
3. Navigate to the `firefox-extension` directory and select any file (e.g., `manifest.json`)

### Packaging for Distribution
To create a `.zip` file for Firefox Add-ons:
```bash
cd firefox-extension
zip -r ../firefox-extension.zip .
```

For submission to Firefox Add-ons, you can also use:
```bash
cd firefox-extension
web-ext build
```

### Key Features
- Uses Manifest V2 (better Firefox compatibility)
- Uses `permissions` for site access
- Includes `browser_specific_settings` with gecko-specific configuration
- Compatible with Firefox 57.0+

## Shared Functionality

Both extensions use the same `content-script.js` file, which:
- Parses YouTube view counts and like counts
- Calculates and displays the percentage of viewers who liked the video
- Updates dynamically as you navigate between videos
- Persists through YouTube's single-page app navigation

## Key Differences

| Feature | Chrome | Firefox |
|---------|--------|---------|
| Manifest Version | V3 | V2 |
| Permissions Key | `host_permissions` | `permissions` |
| Browser Settings | N/A | `browser_specific_settings` |
| Extension ID | Auto-generated | Explicitly set |

## Notes

- The content script works identically in both browsers
- No build step is required - extensions can be loaded directly
- Both extensions target the same YouTube selectors and functionality
