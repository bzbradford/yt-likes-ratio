# YouTube Likes Ratio

Browser extension to add a view:like ratio to YouTube video pages. It parses the view count and likes count from the page source and computes a % liked ratio. Now that the dislike count is gone and with it the like/dislike ratio, this extension calculates the percent of viewers who liked a video, giving some idea of viewer sentiment.

## Chrome Extension

[View this extension on the Chrome Web Store](https://chrome.google.com/webstore/detail/youtube-likes-ratio/lmalclgdccahfecpdlncehpnceeloppo)

The Chrome extension uses Manifest V3 and is located in the `chrome-extension` directory.

## Firefox Extension

The Firefox extension uses Manifest V2 for better compatibility and is located in the `firefox-extension` directory.

## Development

Both extensions share the same core functionality but use different manifest formats to comply with their respective browser requirements:

- **Chrome Extension**: Uses Manifest V3 with `host_permissions`
- **Firefox Extension**: Uses Manifest V2 with `permissions`
