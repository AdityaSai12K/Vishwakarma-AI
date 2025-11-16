# Vastu AI Backend

Backend server for Vastu AI analysis feature. This service processes blueprint images using Google Gemini Vision API and applies Vastu Shastra compliance rules.

## Features

- 📸 **Blueprint Analysis**: Extracts room information, directions, and architectural features from floor plan images using Google Gemini Vision API
- 🏛️ **Vastu Compliance**: Checks layouts against traditional Vastu Shastra principles
- 📊 **Detailed Reports**: Generates comprehensive scores, issues, positives, and suggestions
- 🔒 **Error Handling**: Robust error handling with safe defaults to prevent crashes

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Gemini API Key

## Installation

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   
   Create a `.env` file in the `backend` directory:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Google Gemini API key:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   PORT=5000
   ```

4. **Start the server**:
   ```bash
   node server.js
   ```
   
   Or with npm:
   ```bash
   npm start
   ```

The server will start on `http://localhost:5000` by default.

## API Endpoints

### POST /api/vastu-check

Analyzes a blueprint image for Vastu compliance.

**Request Body:**
```json
{
  "image_url": "https://public-supabase-url/file.png"
}
```

**Response:**
```json
{
  "status": "success",
  "raw_analysis": {
    "entrance_direction": "North",
    "rooms": [
      {"name": "kitchen", "direction": "southeast"},
      {"name": "master bedroom", "direction": "southwest"}
    ],
    "toilets": [
      {"direction": "northwest"}
    ],
    "special_notes": []
  },
  "vastu_result": {
    "score": 85,
    "assessment": "good",
    "issues": [...],
    "positives": [...],
    "suggestions": [...]
  },
  "report": {
    "summary": {...},
    "detailed": {...},
    "text": "..."
  }
}
```

### GET /health

Health check endpoint.

**Response:**
```json
{
  "status": "ok",
  "message": "Vastu AI Backend is running"
}
```

## Vastu Rules Implemented

The system checks for:

1. **Toilet Placement**: Must NOT be in Northeast
2. **Kitchen Placement**: Should be in Southeast
3. **Master Bedroom**: Should be in Southwest
4. **Main Entrance**: Ideally North or East facing
5. **Staircase**: Should NOT be in center
6. **Pooja Room**: Should be in Northeast

## Project Structure

```
backend/
├── server.js              # Main Express server
├── routes/
│   └── vastu.js          # Vastu analysis API route
├── utils/
│   ├── extractRooms.js   # OpenAI Vision integration
│   ├── vastuRules.js     # Vastu compliance rules engine
│   └── formatReport.js   # Report formatting utilities
├── package.json
├── .env.example
└── README.md
```

## Error Handling

The backend includes comprehensive error handling:

- Invalid or missing `image_url` returns 400 error
- OpenAI API failures return safe default structures
- JSON parsing errors are handled gracefully
- All errors include helpful error messages

## Development

### Running in Development Mode

```bash
node server.js
```

The server runs in development mode by default. For production, set `NODE_ENV=production`.

### Testing

Test the health endpoint:
```bash
curl http://localhost:5000/health
```

Test the Vastu analysis endpoint:
```bash
curl -X POST http://localhost:5000/api/vastu-check \
  -H "Content-Type: application/json" \
  -d '{"image_url": "https://example.com/blueprint.png"}'
```

## Troubleshooting

### Gemini API Key Issues

- Ensure your `.env` file has `GEMINI_API_KEY` set
- Verify the API key is valid and has sufficient quota
- Check Google AI Studio for API status if requests are failing
- Get your API key from: https://makersuite.google.com/app/apikey

### Port Already in Use

If port 5000 is already in use, change the `PORT` in your `.env` file and update the frontend `BACKEND_API_URL` in `js/app.js`.

### CORS Issues

The server includes CORS middleware. If you encounter CORS errors, ensure the frontend URL is allowed in `server.js`.

## Notes

- The Google Gemini Vision API requires a valid API key and may incur costs
- Processing time depends on image size and Gemini API response time
- The system uses `gemini-1.5-flash` for fast and cost-efficient analysis
- All responses include safe fallbacks to prevent crashes

