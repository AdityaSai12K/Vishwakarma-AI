/**
 * Formats Vastu analysis results into human-readable reports
 * 
 * @param {Object} rawAnalysis - Raw blueprint extraction data
 * @param {Object} vastuResult - Vastu rules analysis result
 * @returns {Object} Formatted report with summary and details
 */

function formatReport(rawAnalysis, vastuResult) {
  const { score, assessment, issues, positives, suggestions } = vastuResult;

  // Generate summary text
  let summaryText = `Your blueprint has received a Vastu score of ${score}/100, which is ${assessment}. `;
  
  if (positives.length > 0) {
    summaryText += `The layout follows ${positives.length} key Vastu principle(s). `;
  }
  
  if (issues.length > 0) {
    summaryText += `There are ${issues.length} area(s) that could be improved according to Vastu Shastra. `;
  } else {
    summaryText += `Your design is well-aligned with Vastu principles! `;
  }

  // Generate detailed sections
  const summary = {
    score: score,
    assessment: assessment,
    total_issues: issues.length,
    total_positives: positives.length,
    summary_text: summaryText
  };

  // Format issues by severity
  const issuesBySeverity = {
    high: issues.filter(i => i.severity === 'high'),
    medium: issues.filter(i => i.severity === 'medium'),
    low: issues.filter(i => i.severity === 'low')
  };

  // Format detailed report
  const detailedReport = {
    blueprint_summary: {
      entrance_direction: rawAnalysis.entrance_direction || 'unknown',
      total_rooms: rawAnalysis.rooms?.length || 0,
      total_toilets: rawAnalysis.toilets?.length || 0,
      rooms_identified: rawAnalysis.rooms?.map(r => `${r.name} (${r.direction})`) || []
    },
    vastu_analysis: {
      score: score,
      assessment: assessment,
      breakdown: {
        high_priority_issues: issuesBySeverity.high.length,
        medium_priority_issues: issuesBySeverity.medium.length,
        low_priority_issues: issuesBySeverity.low.length
      }
    },
    positives: positives,
    issues: issues,
    suggestions: suggestions
  };

  // Generate human-readable text report
  let textReport = `VASTU ANALYSIS REPORT\n`;
  textReport += `================================\n\n`;
  textReport += `OVERALL SCORE: ${score}/100 (${assessment.toUpperCase()})\n\n`;
  
  textReport += `BLUEPRINT SUMMARY:\n`;
  textReport += `- Main Entrance: ${rawAnalysis.entrance_direction || 'unknown'}\n`;
  textReport += `- Total Rooms: ${rawAnalysis.rooms?.length || 0}\n`;
  textReport += `- Total Toilets: ${rawAnalysis.toilets?.length || 0}\n`;
  
  if (rawAnalysis.rooms && rawAnalysis.rooms.length > 0) {
    textReport += `\nROOMS IDENTIFIED:\n`;
    rawAnalysis.rooms.forEach(room => {
      textReport += `- ${room.name}: ${room.direction}\n`;
    });
  }
  
  if (positives.length > 0) {
    textReport += `\n✅ POSITIVE ASPECTS:\n`;
    positives.forEach((positive, index) => {
      textReport += `${index + 1}. ${positive.message}\n`;
    });
  }
  
  if (issues.length > 0) {
    textReport += `\n⚠️ AREAS FOR IMPROVEMENT:\n`;
    issues.forEach((issue, index) => {
      textReport += `${index + 1}. [${issue.severity.toUpperCase()}] ${issue.message}\n`;
      if (issue.suggestion) {
        textReport += `   💡 Suggestion: ${issue.suggestion}\n`;
      }
    });
  }
  
  if (suggestions.length > 0) {
    textReport += `\n💡 RECOMMENDATIONS:\n`;
    suggestions.forEach((suggestion, index) => {
      textReport += `${index + 1}. ${suggestion.message}\n`;
    });
  }

  return {
    summary,
    detailed: detailedReport,
    text: textReport
  };
}

module.exports = formatReport;

