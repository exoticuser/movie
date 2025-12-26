# MovieStream - Architecture & Technical Details

This document explains the technical architecture and implementation details of the MovieStream application.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    User's Browser                       │
│  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   React UI  │  │ Service      │  │  HLS.js      │  │
│  │  Components │  │  Worker      │  │  Player      │  │
│  └─────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│              Next.js Server (Vercel Edge)               │
│  ┌─────────────────────────────────────────────────┐   │
│  │         API Routes (Server-side)                │   │
│  │  /api/tabs  /api/search  /api/play             │   │
│  └─────────────────────────────────────────────────┘   │
│                         │                               │
│  ┌─────────────────────────────────────────────────┐   │
│  │         Authentication & Signing                │   │
│  │  (ported from a.py)                            │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                         │
                         ↓
┌─────────────────────────────────────────────────────────┐
│             MovieBox API                                │
│        (api.inmoviebox.com)                            │
│  - Movie/Series metadata                               │
│  - Streaming links                                     │
│  - Search functionality                                │
└─────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Next.js 16**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first styling
- **HLS.js**: Adaptive video streaming
- **Hero Icons**: SVG icon library

### Backend
- **Next.js API Routes**: Server-side endpoints
- **Node.js crypto**: Authentication signing
- **Edge Functions**: Fast API responses

### Deployment
- **Vercel**: Hosting and edge network
- **Service Worker**: PWA and offline support
- **Capacitor**: Optional Android APK

## API Authentication

The authentication system is ported from `a.py` and implements a custom signature-based authentication:

### Flow

1. **Generate Timestamp**: Current time in milliseconds
2. **Create Client Token**: MD5 hash of reversed timestamp
3. **Build Canonical String**: Structured request representation
4. **Sign Request**: HMAC-MD5 with base64-encoded key
5. **Add Headers**: Include all auth headers in request

### Implementation

```typescript
// 1. Generate timestamp
const ts = Date.now();

// 2. Create X-Client-Token
const xClientToken = `${ts},${md5(ts.toString().reverse())}`;

// 3. Build canonical string
const canonical = [
  method,              // GET/POST
  'application/json',  // Accept
  'application/json',  // Content-Type
  bodyLength,          // Body size
  ts,                  // Timestamp
  bodyHash,            // MD5 of body
  urlPath + query      // Request path
].join('\n');

// 4. Sign with HMAC-MD5
const signature = hmac('md5', secret, canonical);

// 5. Create X-TR-Signature
const xTrSignature = `${ts}|2|${base64(signature)}`;
```

### Security Considerations

- Keys are embedded in code (consider environment variables for production)
- HMAC-MD5 used (older but functional)
- Timestamp prevents replay attacks (short window)
- No user authentication (all content public)

## API Routes

### `/api/tabs`

**Purpose**: Fetch content sections for homepage/browse

**Query Parameters**:
- `tabId`: Tab number (0-7)

**Process**:
1. Validate tabId
2. Construct API URL
3. Generate auth headers
4. Fetch from MovieBox API
5. Return sections with subjects

**Caching**: 1 hour (3600 seconds)

### `/api/search`

**Purpose**: Search for movies and series

**Query Parameters**:
- `q`: Search query
- `page`: Page number (default: 1)
- `perPage`: Results per page (default: 20)

**Process**:
1. Validate query
2. Create POST body with search params
3. Generate auth headers for POST
4. Fetch search results
5. Extract and flatten subjects
6. Return results array

**Caching**: 1 hour

### `/api/play`

**Purpose**: Get streaming links for video playback

**Query Parameters**:
- `subjectId`: Movie/series ID
- `season`: Season number (default: 0)
- `episode`: Episode number (default: 0)

**Process**:
1. Validate subjectId
2. Construct play-info URL
3. Generate auth headers
4. Fetch streams
5. Sort streams (MP4 first, then HLS, then others)
6. Return sorted streams

**Stream Formats**:
- MP4: Direct download links
- HLS (m3u8): Adaptive streaming
- DASH: Alternative streaming

## Video Player

### HLS.js Integration

The video player uses HLS.js for adaptive streaming:

```typescript
// Check if HLS is supported
if (Hls.isSupported()) {
  const hls = new Hls({
    enableWorker: true,        // Use web worker
    lowLatencyMode: true,      // Minimize delay
    backBufferLength: 90,      // Buffer management
  });
  
  hls.loadSource(streamUrl);
  hls.attachMedia(videoElement);
  
  // Handle errors
  hls.on(Hls.Events.ERROR, (event, data) => {
    if (data.fatal) {
      // Attempt recovery
      hls.startLoad(); // Network error
      hls.recoverMediaError(); // Media error
    }
  });
}
```

### Fallback for Safari

Safari has native HLS support:

```typescript
if (video.canPlayType('application/vnd.apple.mpegurl')) {
  video.src = hlsUrl; // Direct assignment
}
```

### Supported Codecs

- H.264 (AVC)
- H.265 (HEVC)
- VP9
- AAC audio
- MP3 audio

## Caching Strategy

### Server-side Caching (Next.js)

```typescript
// In API routes and pages
export const revalidate = 3600; // 1 hour

// In fetch calls
fetch(url, {
  next: { revalidate: 3600 }
});
```

### Client-side Caching (Service Worker)

```javascript
// Cache-first strategy for images
{
  urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/i,
  handler: 'CacheFirst',
  options: {
    cacheName: 'image-cache',
    expiration: {
      maxEntries: 200,
      maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
    },
  },
}
```

### Edge Caching (Vercel)

Vercel automatically caches at edge locations:
- Static assets: Cached indefinitely
- API routes: Respects cache headers
- Pages: ISR with 1-hour revalidation

## Progressive Web App (PWA)

### Manifest

Defines app metadata:
- Name and icons
- Display mode (standalone)
- Theme colors
- Start URL
- Shortcuts

### Service Worker

Provides offline support:
- Caches critical assets on install
- Intercepts fetch requests
- Serves from cache when available
- Updates cache in background

### Installation

On HTTPS sites:
1. Browser detects manifest
2. Shows "Add to Home Screen" prompt
3. User installs app
4. App appears on home screen
5. Opens in app mode (no browser UI)

## Performance Optimizations

### 1. Server-Side Rendering (SSR)

Homepage and browse pages are pre-rendered:
- Fast initial load
- SEO friendly
- Automatic with Next.js

### 2. Code Splitting

Automatic route-based splitting:
- Each page loads only its code
- Shared code in chunks
- Lazy loading for components

### 3. Image Optimization

Next.js Image component:
- Automatic resizing
- WebP conversion
- Lazy loading
- Responsive images

### 4. API Response Caching

Reduces API calls:
- 1-hour cache on all endpoints
- Stale-while-revalidate strategy
- Edge caching for global distribution

### 5. Incremental Static Regeneration (ISR)

Pages update in background:
- Initial: Serve cached page
- Background: Re-fetch data
- Next request: Updated page
- Interval: Every 1 hour

## Data Flow

### Homepage Load

```
1. User visits /
2. Next.js SSR renders page
3. Fetch from API routes (server-side)
4. API routes call MovieBox API
5. Data cached for 1 hour
6. Page sent to browser
7. Hydration (React interactive)
8. Service worker caches assets
```

### Search Flow

```
1. User types query
2. Debounced input (prevents spam)
3. Client-side fetch to /api/search
4. API route validates and signs request
5. MovieBox API returns results
6. Results displayed in grid
7. Click card → Navigate to /watch/[id]
```

### Video Playback Flow

```
1. Navigate to /watch/[id]
2. Fetch streams from /api/play
3. API gets signed URLs from MovieBox
4. Select best stream (MP4 > HLS > DASH)
5. Initialize HLS.js player
6. Load and parse manifest
7. Download video segments
8. Adaptive bitrate adjustment
9. Display video
```

## File Structure Rationale

### `/app` - App Router
Next.js 13+ uses file-system routing:
- `page.tsx` = Page component
- `layout.tsx` = Shared layout
- `route.ts` = API endpoint

### `/components` - Reusable UI
Shared across pages:
- No routing logic
- Pure presentation
- Client components

### `/lib` - Utilities
Business logic:
- API clients
- Authentication
- Helper functions

### `/public` - Static Files
Served as-is:
- Images
- Icons
- Manifest
- Service worker

## Deployment Architecture

### Vercel Deployment

```
Git Push → Vercel Build
    │
    ├─→ Install Dependencies
    ├─→ TypeScript Check
    ├─→ Build Next.js App
    ├─→ Generate Static Pages
    ├─→ Deploy to Edge Network
    └─→ Provide URL
```

### Edge Functions

API routes run at edge:
- Low latency (close to users)
- Auto-scaling
- No cold starts
- Global distribution

### CDN Distribution

Static assets via CDN:
- Images
- JavaScript bundles
- CSS files
- Public folder content

## Capacitor for Android

### Build Process

```
1. Build Next.js (static export)
2. Initialize Capacitor
3. Add Android platform
4. Sync web files
5. Open in Android Studio
6. Build APK
```

### Webview Integration

Capacitor wraps web app in Android WebView:
- Uses system WebView (Chrome)
- Full HTML5 support
- Native API access (camera, etc.)
- Offline support

### App Size

Typical APK size:
- Base: ~5-10 MB
- With assets: 10-20 MB
- Depends on cached content

## Monitoring & Analytics

### Vercel Analytics

Track:
- Page views
- User interactions
- Performance metrics
- Error rates

### Performance Metrics

Monitor:
- TTFB (Time to First Byte)
- FCP (First Contentful Paint)
- LCP (Largest Contentful Paint)
- CLS (Cumulative Layout Shift)
- FID (First Input Delay)

## Scalability

### Current Limits

- Vercel Free: 100 GB bandwidth/month
- Edge Functions: 100,000 invocations/day
- Build time: 45 seconds typical

### Scaling Considerations

1. **Database**: Currently API-based (no DB needed)
2. **Caching**: Reduces API load significantly
3. **CDN**: Handles static assets globally
4. **Edge**: API routes scale automatically

### Future Enhancements

1. **User Authentication**: Add accounts
2. **Favorites**: Save user preferences
3. **Recommendations**: AI-based suggestions
4. **Comments**: User reviews
5. **Ratings**: Star ratings
6. **Watch History**: Track progress

## Security Best Practices

### Current Implementation

✅ HTTPS enforced (Vercel)
✅ XSS protection (React escaping)
✅ CORS configured
✅ Content Security Policy

### Recommendations

⚠️ Move API keys to environment variables
⚠️ Add rate limiting
⚠️ Implement authentication
⚠️ Add input sanitization
⚠️ Enable CSRF protection

## Troubleshooting Guide

### Build Issues

**TypeScript errors**: Run `npm run build` to see all errors
**Missing dependencies**: Run `npm install`
**Cache issues**: Delete `.next` folder

### Runtime Issues

**API failures**: Check network tab in DevTools
**Video not playing**: Check HLS.js console logs
**PWA not installing**: Verify HTTPS and manifest

### Performance Issues

**Slow loading**: Enable caching, check CDN
**High bandwidth**: Optimize images, use WebP
**Memory leaks**: Check for unmounted components

## Conclusion

The MovieStream app demonstrates:
- Modern React patterns with Next.js
- Efficient API authentication
- Adaptive video streaming
- PWA capabilities
- Production-ready deployment

It's optimized for:
- ⚡ Performance
- 📱 Mobile experience
- 🔒 Security
- 🌍 Global availability
- 📈 Scalability
