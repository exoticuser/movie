# Deployment Guide

This guide provides step-by-step instructions for deploying the MovieStream application.

## Quick Deploy to Vercel (Recommended)

Vercel is the recommended platform for hosting this Next.js application.

### Prerequisites

- A Vercel account (free tier available at [vercel.com](https://vercel.com))
- Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

### Steps

1. **Go to Vercel Dashboard**
   - Visit [vercel.com](https://vercel.com)
   - Log in or create an account

2. **Import Project**
   - Click "Add New..." → "Project"
   - Select your Git provider
   - Choose your repository

3. **Configure Project**
   - Framework: Next.js (auto-detected)
   - Root Directory: `movie-streaming-app`
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for the build to complete
   - Your app will be live at `https://your-project.vercel.app`

### Automatic Deployments

- Every push to your main branch triggers a production deployment
- Pull requests get preview deployments automatically
- Branch deployments allow testing before merging

## Alternative: Deploy via Vercel CLI

### Setup

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to your account
vercel login
```

### Deploy

```bash
# Navigate to project directory
cd movie-streaming-app

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

## Performance Optimizations on Vercel

The app is automatically optimized for Vercel:

### Edge Functions
- API routes run on Vercel's Edge Network for low latency
- Responses are cached at the edge for 1 hour (configurable)

### Image Optimization
- Next.js Image component automatically optimizes images
- Images are served in WebP format when supported
- Lazy loading for better performance

### Caching Strategy
- Static assets: Cached indefinitely with versioned URLs
- API responses: Cached for 1 hour (3600 seconds)
- Pages: Incremental Static Regeneration (ISR) every hour

## Building APK for Android

If you want to create a native Android app:

### Prerequisites

- Android Studio installed
- Java Development Kit (JDK) 11 or higher
- Node.js and npm

### Steps

1. **Install Capacitor Dependencies**
   ```bash
   cd movie-streaming-app
   npm install @capacitor/core @capacitor/cli @capacitor/android
   ```

2. **Update Next.js Config**
   
   Edit `next.config.ts`:
   ```typescript
   const nextConfig = {
     output: 'export', // Static export for Capacitor
     images: {
       unoptimized: true, // Required for static export
     },
     trailingSlash: true, // Better compatibility
   };
   ```

3. **Initialize Capacitor**
   ```bash
   npx cap init MovieStream com.moviestream.app --web-dir=out
   ```

4. **Build Next.js App**
   ```bash
   npm run build
   ```

5. **Add Android Platform**
   ```bash
   npx cap add android
   npx cap sync
   ```

6. **Open Android Studio**
   ```bash
   npx cap open android
   ```

7. **Build APK in Android Studio**
   - Once Android Studio opens your project
   - Go to Build → Build Bundle(s) / APK(s) → Build APK(s)
   - APK will be created in `android/app/build/outputs/apk/debug/`

8. **For Production APK**
   - Build → Generate Signed Bundle / APK
   - Follow the wizard to create a signing key
   - Build the release APK

### APK Size Optimization

To reduce APK size:

```bash
# Enable ProGuard in android/app/build.gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

## Environment-Specific Configuration

### Production Environment

No special environment variables needed. All API keys are embedded in the code (from a.py).

### Custom Domain Setup (Vercel)

1. Go to your project settings on Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Update your DNS settings as instructed
5. SSL certificate is automatically provisioned

## Monitoring and Analytics

### Vercel Analytics (Recommended)

1. Enable Vercel Analytics in project settings
2. Install the package:
   ```bash
   npm install @vercel/analytics
   ```

3. Add to `app/layout.tsx`:
   ```typescript
   import { Analytics } from '@vercel/analytics/react';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     );
   }
   ```

## Troubleshooting

### Build Failures

**Issue**: Build fails with "Module not found"
- **Solution**: Run `npm install` and ensure all dependencies are in package.json

**Issue**: Image optimization errors
- **Solution**: Ensure `unoptimized: true` is set in next.config.ts for static exports

### Runtime Issues

**Issue**: API requests failing
- **Solution**: Check API routes are accessible at `/api/...`
- Verify CORS settings if calling from different domain

**Issue**: Video player not working
- **Solution**: Ensure HLS.js is properly loaded
- Check browser console for errors
- Verify stream URLs are accessible

### APK Issues

**Issue**: White screen on Android app
- **Solution**: Ensure `output: 'export'` is set in next.config.ts
- Check Capacitor configuration in `capacitor.config.json`

**Issue**: Videos not playing in APK
- **Solution**: Add required permissions to `AndroidManifest.xml`:
  ```xml
  <uses-permission android:name="android.permission.INTERNET" />
  ```

## Support

For issues specific to:
- Next.js: [Next.js Documentation](https://nextjs.org/docs)
- Vercel: [Vercel Support](https://vercel.com/support)
- Capacitor: [Capacitor Documentation](https://capacitorjs.com/docs)

## Cost Estimation

### Vercel (Recommended)

- **Free Tier**: Suitable for testing and small projects
  - 100 GB bandwidth
  - Unlimited deployments
  - Automatic SSL

- **Pro Tier ($20/month)**: For production apps
  - 1 TB bandwidth
  - Advanced analytics
  - Password protection
  - Priority support

### Capacitor/Android

- **Free**: All open-source tools
- Only cost is potential Google Play Store fee ($25 one-time) if publishing
