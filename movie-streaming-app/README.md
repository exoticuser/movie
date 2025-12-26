# MovieStream - Movie & Series Streaming App

A modern, high-performance movie streaming web application built with Next.js 14, deployable on Vercel with PWA capabilities.

## Features

- 🎬 **Browse Movies & Series**: Explore featured content from multiple categories
- 🔍 **Search Functionality**: Fast search across all available content
- 📱 **Progressive Web App**: Install as an app on mobile devices
- 🎥 **Universal Video Player**: Supports MP4, HLS (m3u8), DASH, and all major codecs
- ⚡ **Optimized Performance**: Edge caching, image optimization, and lazy loading
- 🎨 **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- 🚫 **No Authentication Required**: All content is publicly accessible

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Video Player**: HLS.js for adaptive streaming
- **Deployment**: Vercel (optimized for edge functions)
- **PWA**: Service workers for offline capability

## Project Structure

```
movie-streaming-app/
├── app/
│   ├── api/              # API routes (server-side)
│   │   ├── tabs/         # Fetch category tabs
│   │   ├── search/       # Search endpoint
│   │   └── play/         # Get streaming links
│   ├── browse/           # Browse all categories page
│   ├── category/[type]/  # Category-specific pages
│   ├── search/           # Search results page
│   ├── watch/[id]/       # Video player page
│   ├── layout.tsx        # Root layout with header
│   ├── page.tsx          # Homepage
│   └── globals.css       # Global styles
├── components/
│   ├── Header.tsx        # Navigation header
│   ├── MovieCard.tsx     # Movie/series card component
│   ├── MovieRow.tsx      # Horizontal scrollable row
│   ├── SearchBar.tsx     # Search input component
│   └── VideoPlayer.tsx   # Video player with HLS support
├── lib/
│   ├── api-auth.ts       # API authentication (from a.py)
│   └── api-client.ts     # API client functions
├── public/
│   └── manifest.json     # PWA manifest
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm or yarn package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Build for Production

```bash
npm run build
npm run start
```

## Deployment to Vercel

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Deploy to Production**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Git Integration

1. **Push to GitHub** (if not already done)
   ```bash
   git add .
   git commit -m "MovieStream app ready for deployment"
   git push
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js and configure settings
   - Click "Deploy"

### Environment Variables (Optional)

No environment variables are required for basic functionality. The API authentication is handled automatically using the keys from `a.py`.

## PWA Installation

### On Mobile (Android/iOS)

1. Open the deployed app in your mobile browser
2. Tap the browser menu (usually three dots)
3. Select "Add to Home Screen" or "Install App"
4. The app will be installed like a native app

### On Desktop (Chrome/Edge)

1. Open the app in Chrome or Edge
2. Click the install icon (⊕) in the address bar
3. Click "Install"

## Performance Optimizations

- **Edge Caching**: API responses cached for 1 hour using Vercel's edge network
- **Image Optimization**: Next.js automatic image optimization with lazy loading
- **Code Splitting**: Automatic route-based code splitting
- **Streaming SSR**: Server-side rendering with streaming for faster TTFB
- **Prefetching**: Automatic prefetching of linked pages

## API Documentation

### API Routes

#### GET `/api/tabs?tabId={id}`
Fetch content sections for a specific tab (0-7).

**Response:**
```json
{
  "sections": [
    {
      "title": "Featured Movies",
      "subjects": [...]
    }
  ]
}
```

#### GET `/api/search?q={query}&page={page}&perPage={perPage}`
Search for movies and series.

**Response:**
```json
{
  "results": [
    {
      "subjectId": "123",
      "title": "Movie Title",
      "posterUrl": "...",
      "year": 2024
    }
  ]
}
```

#### GET `/api/play?subjectId={id}&season={season}&episode={episode}`
Get streaming links for a movie or episode.

**Response:**
```json
{
  "streams": [
    {
      "url": "https://...",
      "format": "MP4",
      "codecName": "H.264",
      "resolutions": ["1080p", "720p"],
      "signCookie": "..."
    }
  ]
}
```

## Building APK with Capacitor (Optional)

To create an Android APK:

1. **Install Capacitor**
   ```bash
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

2. **Initialize Capacitor**
   ```bash
   npx cap init MovieStream com.moviestream.app --web-dir=out
   ```

3. **Update next.config.ts for static export**
   ```typescript
   const nextConfig = {
     output: 'export',
     images: { unoptimized: true }
   };
   ```

4. **Build and add Android platform**
   ```bash
   npm run build
   npx cap add android
   npx cap sync
   ```

5. **Open in Android Studio**
   ```bash
   npx cap open android
   ```

6. **Build APK in Android Studio**
   - Build → Build Bundle(s) / APK(s) → Build APK(s)

## Browser Support

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (native HLS)
- Mobile browsers: Full support with PWA capabilities

## License

This project is provided as-is for educational purposes.

## Acknowledgments

- Based on the API structure from `a.py`
- Built with Next.js, React, and Tailwind CSS
- Video streaming powered by HLS.js
