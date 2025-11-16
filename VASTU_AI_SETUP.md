# Vastu AI Feature - Complete Setup Guide

This guide will help you set up the full Vastu AI feature for your Vishwakarma AI website.

## Overview

The Vastu AI feature allows users to upload blueprint images and get comprehensive Vastu Shastra compliance analysis. It consists of:

1. **Frontend** (existing HTML/JS/CSS)
2. **Backend** (Node.js/Express server with Google Gemini integration)

## Quick Start

### Step 1: Install Backend Dependencies

```bash
cd backend
npm install express cors @google/generative-ai dotenv
```

### Step 2: Configure Environment Variables

Create a `.env` file in the `backend` directory:

```bash
cd backend
touch .env
```

Add the following to `.env`:

```
GEMINI_API_KEY=your_gemini_api_key_here
PORT=5000
```

**How to get Google Gemini API Key:**
1. Go to https://makersuite.google.com/app/apikey
2. Sign up or log in with your Google account
3. Click "Create API Key"
4. Copy the key and paste it in your `.env` file

### Step 3: Start the Backend Server

```bash
cd backend
node server.js
```

You should see:
```
🚀 Vastu AI Backend server running on http://localhost:5000
📝 Health check: http://localhost:5000/health
```

### Step 4: Test the Setup

1. Open your frontend website (e.g., `vastu.html` in a browser)
2. Click "Start Vastu Analysis"
3. Upload a blueprint image (JPG, PNG, or PDF)
4. Wait for analysis to complete

## File Structure

```
vishwakarmaai/
├── backend/
│   ├── server.js              # Main server file
│   ├── routes/
│   │   └── vastu.js          # API endpoint
│   ├── utils/
│   │   ├── extractRooms.js   # Google Gemini Vision integration
│   │   ├── vastuRules.js     # Vastu rules engine
│   │   └── formatReport.js   # Report formatter
│   ├── package.json
│   ├── .env                  # Your API keys (create this)
│   └── README.md
├── vastu.html                # Frontend page
├── js/
│   └── app.js                # Updated with API integration
└── css/
    └── styles.css            # Updated styles
```

## How It Works

1. **User uploads blueprint** → File is uploaded to Supabase storage
2. **Get public URL** → Supabase returns a public URL for the image
3. **Frontend calls backend** → Sends image URL to `/api/vastu-check`
4. **Backend processes**:
   - Calls Google Gemini Vision API to extract room information
   - Applies Vastu rules to the extracted data
   - Formats a comprehensive report
5. **Results displayed** → Frontend shows score, issues, positives, and suggestions

## Configuration

### Backend API URL

If your backend runs on a different port or URL, update `js/app.js`:

```javascript
const BACKEND_API_URL = 'http://localhost:5000'; // Change this if needed
```

### Supabase Configuration

Ensure your Supabase is configured in `js/app.js`:

```javascript
const SUPABASE_URL = 'your_supabase_url';
const SUPABASE_ANON_KEY = 'your_supabase_anon_key';
```

## Vastu Rules Implemented

The system checks:

- ✅ **Toilet must NOT be in Northeast** (Severe violation)
- ✅ **Kitchen should be in Southeast** (Ideal placement)
- ✅ **Master bedroom should be in Southwest** (Best for stability)
- ✅ **Main entrance ideally North/East** (Positive energy flow)
- ✅ **Staircase NOT in center** (Avoids Brahmasthan)
- ✅ **Pooja room in Northeast** (Sacred direction)

## Troubleshooting

### Backend won't start

**Error: `GEMINI_API_KEY is not set`**
- Check your `.env` file exists in the `backend` directory
- Ensure the file contains `GEMINI_API_KEY=your_key_here`
- Restart the server

**Error: `Port 5000 already in use`**
- Change `PORT=5001` in `.env` (or any other available port)
- Update `BACKEND_API_URL` in `js/app.js` to match

### Frontend can't connect to backend

**Error: `NetworkError` or `Failed to fetch`**
- Ensure backend server is running (`node backend/server.js`)
- Check `BACKEND_API_URL` in `js/app.js` matches your backend URL
- Check browser console for CORS errors
- Ensure backend is accessible (not blocked by firewall)

### Gemini API errors

**Error: `Invalid API key`**
- Verify your API key is correct in `.env`
- Check Google AI Studio account has quota
- Ensure API key hasn't expired
- Get a new key from https://makersuite.google.com/app/apikey

**Error: `Rate limit exceeded`**
- You've hit Gemini API rate limits
- Wait a few minutes or check your quota in Google AI Studio

### Analysis not working

**No results displayed**
- Check browser console for errors
- Verify file uploaded successfully to Supabase
- Check backend logs for errors
- Ensure blueprint image is clear and readable

## Production Deployment

### Backend Deployment

1. Deploy backend to a cloud service (Heroku, Railway, Render, etc.)
2. Set environment variables on the hosting platform:
   - `GEMINI_API_KEY`
   - `PORT` (usually auto-set by platform)
3. Update `BACKEND_API_URL` in frontend to your deployed backend URL

### Environment Variables for Production

```bash
GEMINI_API_KEY=AIzaSy...
PORT=5000
NODE_ENV=production
```

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review backend logs for error messages
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly

## Next Steps

- Customize Vastu rules in `backend/utils/vastuRules.js`
- Adjust Gemini prompts in `backend/utils/extractRooms.js`
- Add more analysis features
- Implement caching for faster responses
- Add user authentication for API access

---

**Note**: Make sure to keep your `.env` file secure and never commit it to version control. The `.env.example` file is provided as a template.

