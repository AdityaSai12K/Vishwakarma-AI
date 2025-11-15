# VISHWAKARMA AI - Static HTML/CSS/JS Version

This is a static, no-build-required version of the VISHWAKARMA AI application, converted from a React/Next.js (Lovable) project. The site is ready to run locally or deploy to any static hosting service (Vercel, Netlify, GitHub Pages, etc.).

## 📁 Project Structure

```
/
├── index.html          # Home page
├── converter.html      # 2D → 3D Converter page
├── vastu.html         # Vastu AI Dashboard page
├── login.html         # Login/Authentication page
├── 404.html           # 404 Not Found page
├── css/
│   └── styles.css     # All CSS styles (converted from Tailwind)
├── js/
│   └── app.js         # Main JavaScript (routing, Supabase, utilities)
├── assets/
│   ├── favicon.ico    # Site favicon
│   └── placeholder.svg # Placeholder image
└── README.md          # This file
```

## 🚀 Quick Start

### Running Locally

**Option 1: Open directly in browser**
```bash
# Simply open index.html in your browser
open index.html
```

**Option 2: Using a simple HTTP server (recommended)**
```bash
# Using Python 3
python3 -m http.server 8000

# Using Node.js (npx)
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000` in your browser.

## 🔧 Configuration

### Supabase Setup

1. **Get your Supabase credentials:**
   - Go to your Supabase project dashboard
   - Navigate to Settings → API
   - Copy your `Project URL` and `anon/public` key

2. **Configure in `js/app.js`:**
   ```javascript
   const SUPABASE_URL = 'https://your-project.supabase.co';
   const SUPABASE_ANON_KEY = 'your-anon-key-here';
   ```

3. **For production deployment (Vercel/Netlify):**
   - Add environment variables in your hosting platform:
     - `SUPABASE_URL`
     - `SUPABASE_ANON_KEY`
   - Update `js/app.js` to read from environment variables:
     ```javascript
     const SUPABASE_URL = window.SUPABASE_URL || '<REPLACE_WITH_SUPABASE_URL>';
     const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '<REPLACE_WITH_SUPABASE_ANON_KEY>';
     ```

### Supabase Database Setup

The application expects the following Supabase setup:

1. **Storage Bucket:**
   - Create a bucket named `uploads` in Supabase Storage
   - Set it to public or configure RLS policies as needed

2. **Database Table:**
   - Create a `jobs` table with the following schema:
   ```sql
   CREATE TABLE jobs (
     id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
     user_id UUID,
     input_path TEXT,
     status TEXT DEFAULT 'pending',
     created_at TIMESTAMP DEFAULT NOW()
   );
   ```

## ✨ Features

- ✅ **No build step required** - Pure HTML/CSS/JS
- ✅ **Supabase integration** - Authentication and file uploads
- ✅ **Responsive design** - Works on all devices
- ✅ **Toast notifications** - User feedback system
- ✅ **File upload** - Drag & drop or click to upload
- ✅ **Magic link authentication** - Email-based login
- ✅ **Client-side routing** - Simple page navigation

## 📋 Features by Page

### Home (`index.html`)
- Hero section with animated background
- Feature cards
- "How it works" section
- Responsive navigation

### Converter (`converter.html`)
- File upload (drag & drop or click)
- File processing simulation
- 3D model preview placeholder
- Export controls (UI only)

### Vastu AI (`vastu.html`)
- Vastu analysis dashboard
- Score visualization (circular progress)
- Strengths and weaknesses display
- Smart recommendations
- Directional compass

### Login (`login.html`)
- Email-based authentication
- Magic link sign-in via Supabase
- Social login buttons (UI only)
- Form validation

## 🧪 Testing & Verification Checklist

Before deploying, verify the following:

- [ ] `index.html` loads without console errors
- [ ] Navigation between pages works correctly
- [ ] All links in navbar are functional
- [ ] Sign-in flow triggers Supabase magic link call (check browser console)
- [ ] File upload UI works (uploads to Supabase Storage)
- [ ] CSS visually matches original design (within 1-2px)
- [ ] All images/icons load (no 404 errors)
- [ ] No references to React/Next.js remain in code
- [ ] Toast notifications appear and dismiss correctly
- [ ] Responsive design works on mobile/tablet/desktop

## 🔍 Troubleshooting

### Supabase Errors

**Error: "Supabase is not configured"**
- Make sure you've set `SUPABASE_URL` and `SUPABASE_ANON_KEY` in `js/app.js`
- Verify the Supabase JS library is loaded (check Network tab)

**Error: "Table 'jobs' does not exist"**
- Create the `jobs` table in your Supabase database (see Database Setup above)

**Error: "Authentication failed" (401/403)**
- Check that your Supabase keys are correct
- Verify RLS policies allow the operations you're trying to perform

### File Upload Issues

**Error: "File size exceeds 8MB limit"**
- The client-side limit is 8MB. For larger files, modify the limit in `js/app.js`:
  ```javascript
  const maxSize = 10 * 1024 * 1024; // 10MB
  ```

**Error: "Invalid file type"**
- Only JPG, PNG, and PDF files are accepted
- Check the file extension matches the allowed types

### Styling Issues

**Styles not loading:**
- Ensure `css/styles.css` is in the correct location
- Check browser console for 404 errors on CSS file
- Verify the path in HTML: `<link rel="stylesheet" href="css/styles.css">`

## 📦 Deployment

### Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run: `vercel`
3. Add environment variables in Vercel dashboard

### Netlify
1. Drag and drop the project folder to Netlify
2. Or use Netlify CLI: `netlify deploy`
3. Add environment variables in Netlify dashboard

### GitHub Pages
1. Push to GitHub repository
2. Go to Settings → Pages
3. Select source branch and folder
4. Note: GitHub Pages doesn't support environment variables, so you'll need to hardcode Supabase keys in `js/app.js` (not recommended for production)

## 🔐 Security Notes

- ⚠️ **Never commit Supabase keys to version control**
- Use environment variables in production
- The `anon` key is safe to expose in client-side code (it's designed for this)
- For production, configure Row Level Security (RLS) policies in Supabase

## 📝 API Functions

The following Supabase functions are implemented in `js/app.js`:

- `signInWithEmail(email)` - Sends magic link for authentication
- `uploadPlanFile(file, userId)` - Uploads file to Supabase Storage
- `createJobRecord(userId, input_path)` - Creates a job record in the database
- `getCurrentUser()` - Gets the currently authenticated user

## 🎨 Customization

### Colors
Edit CSS variables in `css/styles.css`:
```css
:root {
  --primary: 270 45% 23%;
  --purple-medium: 270 60% 50%;
  /* ... */
}
```

### Fonts
The project uses Inter font from Google Fonts. To change:
1. Update the font link in HTML `<head>`
2. Update `font-family` in `css/styles.css`

## 📄 License

This project is converted from a Lovable/Next.js application. All original design and functionality is preserved.

## 🤝 Support

For issues or questions:
1. Check the Troubleshooting section above
2. Verify Supabase configuration
3. Check browser console for errors
4. Ensure all files are in the correct directory structure

---

**Note:** This is a static conversion. Some features that required server-side processing (like actual 3D model generation) are simulated with UI placeholders. The Supabase integration handles authentication and file storage, but any backend processing would need to be implemented separately.
