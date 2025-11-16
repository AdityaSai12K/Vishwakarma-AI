# Quick Setup - Gemini API Key

## Step 1: Create .env file

Create a file named `.env` in the `backend` directory with the following content:

```
GEMINI_API_KEY=AIzaSyBHV5d_9scp-Tpg6Zh4j0pEnHtMDHQgv6Y
PORT=5000
```

## Step 2: Install dependencies

```bash
cd backend
npm install
```

## Step 3: Start the server

```bash
node server.js
```

You should see:
```
🚀 Vastu AI Backend server running on http://localhost:5000
📝 Health check: http://localhost:5000/health
```

## Step 4: Test it!

1. Open `vastu.html` in your browser
2. Click "Start Vastu Analysis"
3. Upload a blueprint image
4. Get your Vastu analysis!

---

**Note**: Keep your `.env` file secure and never commit it to Git.

