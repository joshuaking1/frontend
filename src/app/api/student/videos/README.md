# YouTube Video Integration

This API route requires a YouTube Data API key to fetch educational videos.

## Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials (API Key)
5. Add the API key to your environment variables:

```bash
YOUTUBE_API_KEY=your_youtube_api_key_here
```

## Features

- Searches for educational videos related to learning topics
- Filters for medium-length, high-definition videos
- Displays video thumbnails, duration, view count, and channel info
- Provides embedded video player with modal interface
- Fallback handling when API is unavailable

## Usage

The API is automatically called when students view learning content. Videos are displayed in a dedicated section below the main content.
