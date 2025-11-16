const express = require('express');
const router = express.Router();
const extractRooms = require('../utils/extractRooms');
const vastuRules = require('../utils/vastuRules');
const formatReport = require('../utils/formatReport');

/**
 * POST /api/vastu-check
 * Analyzes a blueprint image for Vastu compliance
 * 
 * Request body:
 * {
 *   "image_url": "https://public-supabase-url/file.png"
 * }
 */
router.post('/vastu-check', async (req, res) => {
  try {
    const { image_url } = req.body;

    // Validate input
    if (!image_url) {
      return res.status(400).json({
        status: 'error',
        message: 'image_url is required'
      });
    }

    // Validate URL format
    if (!image_url.startsWith('http://') && !image_url.startsWith('https://')) {
      return res.status(400).json({
        status: 'error',
        message: 'image_url must be a valid HTTP/HTTPS URL'
      });
    }

    console.log('🔍 Starting Vastu analysis for:', image_url);

    // Step A: Extract room information using Google Gemini Vision
    console.log('📸 Extracting blueprint information...');
    const rawAnalysis = await extractRooms(image_url);

    if (!rawAnalysis) {
      return res.status(500).json({
        status: 'error',
        message: 'Failed to extract blueprint information'
      });
    }

    console.log('✅ Extracted blueprint data:', JSON.stringify(rawAnalysis, null, 2));

    // Step B: Apply Vastu rules
    console.log('🏛️ Applying Vastu rules...');
    const vastuResult = vastuRules(rawAnalysis);

    console.log('✅ Vastu analysis complete. Score:', vastuResult.score);

    // Step C: Format report
    console.log('📄 Formatting report...');
    const report = formatReport(rawAnalysis, vastuResult);

    // Return success response
    res.json({
      status: 'success',
      raw_analysis: rawAnalysis,
      vastu_result: vastuResult,
      report: report
    });

  } catch (error) {
    console.error('❌ Error in vastu-check:', error);
    res.status(500).json({
      status: 'error',
      message: error.message || 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

module.exports = router;

