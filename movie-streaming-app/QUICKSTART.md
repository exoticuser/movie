# MovieStream - Quick Start Guide

This guide will help you get the MovieStream app running quickly.

## Prerequisites

- **Node.js** 18.x or higher
- **npm** or **yarn**
- **Git** (optional, for version control)

## Installation & Setup

### 1. Navigate to the Project

```bash
cd movie-streaming-app
```

### 2. Install Dependencies

```bash
npm install
```

This will install:
- Next.js 16.x (React framework)
- TypeScript (type safety)
- Tailwind CSS (styling)
- HLS.js (video streaming)
- Hero Icons (UI icons)
- And other dependencies

### 3. Run Development Server

```bash
npm run dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

### 4. Build for Production

```bash
npm run build
```

### 5. Start Production Server

```bash
npm start
```

## Project Structure

```
movie-streaming-app/
│
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes (Server-side)
│   │   ├── tabs/route.ts        # Fetch movie/series categories
│   │   ├── search/route.ts      # Search endpoint
│   │   └── play/route.ts        # Get streaming links
│   │
│   ├── browse/                   # Browse all categories page
│   ├── category/[type]/          # Category pages (movies/series)
│   ├── search/                   # Search page
│   ├── watch/[id]/               # Video player page
│   │
│   ├── layout.tsx               # Root layout (header, meta)
│   ├── page.tsx                 # Homepage
│   └── globals.css              # Global styles
│
├── components/                   # Reusable React Components
│   ├── Header.tsx               # Navigation header
│   ├── MovieCard.tsx            # Movie/series card
│   ├── MovieRow.tsx             # Horizontal scrollable row
│   ├── SearchBar.tsx            # Search input
│   ├── VideoPlayer.tsx          # HLS video player
│   ├── Loading.tsx              # Loading spinner
│   └── ServiceWorkerRegistration.tsx  # PWA setup
│
├── lib/                          # Utility Libraries
│   ├── api-auth.ts              # API authentication
│   └── api-client.ts            # API client functions
│
├── public/                       # Static Assets
│   ├── manifest.json            # PWA manifest
│   ├── sw.js                    # Service worker
│   ├── icon-192.svg             # PWA icon (small)
│   └── icon-512.svg             # PWA icon (large)
│
├── README.md                     # Main documentation
├── DEPLOYMENT.md                 # Deployment guide
├── CAPACITOR.md                  # APK generation guide
├── package.json                  # Dependencies
├── next.config.ts               # Next.js configuration
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
└── capacitor.config.json        # Capacitor (APK) config
```

## Features Overview

### 🎬 Browse Movies & Series
- Homepage displays featured content
- Browse by categories (Movies, Series)
- Horizontal scrollable rows

### 🔍 Search
- Real-time search across all content
- Results displayed in a grid
- Search from header or dedicated page

### 📱 Responsive Design
- Mobile-first approach
- Works on phones, tablets, and desktops
- Touch-friendly interface

### 🎥 Video Player
- Supports multiple formats (MP4, HLS, DASH)
- Adaptive streaming with HLS.js
- Compatible with all major codecs (H.264, etc.)

### ⚡ Performance
- Server-side rendering (SSR)
- API response caching (1 hour)
- Image optimization
- Code splitting
- Edge caching (Vercel)

### 📲 Progressive Web App (PWA)
- Install as app on mobile devices
- Offline support via service worker
- App-like experience
- Custom icons and splash screen

### 🔐 No Authentication
- All content publicly accessible
- No login/signup required
- Fast access to content

## API Routes

The app uses server-side API routes to communicate with the MovieBox API:

### GET `/api/tabs?tabId={0-7}`
Fetches content sections for a specific tab.

**Example:**
```bash
curl http://localhost:3000/api/tabs?tabId=0
```

### GET `/api/search?q={query}&page={1}&perPage={20}`
Searches for movies and series.

**Example:**
```bash
curl http://localhost:3000/api/search?q=spider
```

### GET `/api/play?subjectId={id}&season={0}&episode={0}`
Gets streaming links for a movie or episode.

**Example:**
```bash
curl http://localhost:3000/api/play?subjectId=12345&season=1&episode=1
```

## Configuration

### Environment Variables

No environment variables are required! The API keys from `a.py` are embedded in the code.

### Customization

#### Change Theme Colors

Edit `app/globals.css` or Tailwind classes:
- Primary: `blue-500` → change to your color
- Background: `gray-900` → change to your color

#### Modify Caching

Edit `lib/api-client.ts`:
```typescript
next: { revalidate: 3600 } // Change from 3600 seconds
```

#### Update PWA Settings

Edit `public/manifest.json`:
- `name`: App name
- `theme_color`: Theme color
- `background_color`: Background color

## Deployment Options

### Option 1: Vercel (Recommended)

```bash
npm install -g vercel
vercel login
vercel
```

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

### Option 2: Docker

```bash
docker build -t moviestream .
docker run -p 3000:3000 moviestream
```

### Option 3: Static Export + Hosting

```bash
# Update next.config.ts: output: 'export'
npm run build
# Deploy the 'out' folder to any static host
```

## Building Android APK

See [CAPACITOR.md](./CAPACITOR.md) for complete instructions.

**Quick start:**
```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init MovieStream com.moviestream.app --web-dir=out
npm run build
npx cap add android
npx cap open android
```

## Troubleshooting

### Build Errors

**Issue**: Dependencies not found
```bash
rm -rf node_modules package-lock.json
npm install
```

**Issue**: Port already in use
```bash
PORT=3001 npm run dev
```

### Runtime Errors

**Issue**: Images not loading
- Check `next.config.ts` has `unoptimized: true`
- Verify image URLs are accessible

**Issue**: API requests failing
- Check network connectivity
- Verify API endpoints are accessible
- Check browser console for errors

**Issue**: Videos not playing
- Ensure HLS.js is loaded
- Check video format compatibility
- Verify stream URLs are valid

### PWA Not Installing

**Issue**: "Add to Home Screen" not showing
- Ensure you're on HTTPS (required for PWA)
- Check `manifest.json` is accessible
- Verify service worker is registered
- Test in Chrome/Edge DevTools → Application → Manifest

## Performance Tips

1. **Enable Caching**: Already configured for 1 hour
2. **Use CDN**: Vercel automatically uses edge network
3. **Optimize Images**: Use WebP format when possible
4. **Lazy Loading**: Already implemented for images
5. **Code Splitting**: Automatic with Next.js

## Security Considerations

- API keys are embedded (not ideal for production)
- No rate limiting on API routes
- Consider adding authentication for production
- Add CORS headers if needed

## Browser Support

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari (with native HLS)
- ✅ Mobile browsers
- ⚠️ IE11 not supported

## Development Tips

### Hot Reload
Changes to files automatically refresh the page.

### TypeScript
Type checking happens automatically. Run manually:
```bash
npm run build
```

### Linting
```bash
npm run lint
```

### Format Code (if Prettier is configured)
```bash
npx prettier --write .
```

## Next Steps

1. ✅ **Test locally**: `npm run dev`
2. ✅ **Deploy to Vercel**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
3. 📱 **Build APK**: See [CAPACITOR.md](./CAPACITOR.md)
4. 🎨 **Customize**: Update colors, fonts, content
5. 📊 **Add Analytics**: Vercel Analytics or Google Analytics
6. 🔐 **Add Auth** (optional): NextAuth.js or similar

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Capacitor Documentation](https://capacitorjs.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [HLS.js](https://github.com/video-dev/hls.js)

## Support

For issues:
1. Check the troubleshooting section above
2. Review the [README.md](./README.md)
3. Check Next.js documentation
4. Open an issue on GitHub

## License

This project is provided as-is for educational purposes.
