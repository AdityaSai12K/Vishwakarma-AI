/**
 * Vastu Rules Engine
 * Checks blueprint data against Vastu Shastra principles
 * 
 * @param {Object} blueprintData - Extracted blueprint information
 * @returns {Object} Vastu analysis result with score, issues, positives, and suggestions
 */

function vastuRules(blueprintData) {
  const issues = [];
  const positives = [];
  const suggestions = [];

  let score = 100; // Start with perfect score, deduct for violations

  const entranceDirection = (blueprintData.entrance_direction || 'unknown').toLowerCase();
  const rooms = blueprintData.rooms || [];
  const toilets = blueprintData.toilets || [];

  // Helper function to normalize direction
  function normalizeDirection(dir) {
    if (!dir || dir === 'unknown') return 'unknown';
    return dir.toLowerCase().trim();
  }

  // Helper function to check if direction matches
  function matchesDirection(actual, expected) {
    if (actual === 'unknown') return false;
    return actual === expected.toLowerCase();
  }

  // Rule 1: Toilet must NOT be in Northeast (NE)
  toilets.forEach((toilet, index) => {
    const direction = normalizeDirection(toilet.direction);
    if (matchesDirection(direction, 'northeast') || matchesDirection(direction, 'ne')) {
      score -= 15; // Severe violation
      issues.push({
        severity: 'high',
        category: 'toilet',
        message: `Toilet ${index + 1} is located in Northeast - This is considered inauspicious in Vastu. Northeast is the most sacred direction.`,
        suggestion: 'Consider relocating the toilet to Northwest, Southwest, or South. If relocation is not possible, use Vastu remedies like placing a mirror or keeping the toilet door closed.'
      });
    } else if (direction !== 'unknown') {
      positives.push({
        category: 'toilet',
        message: `Toilet ${index + 1} is well-placed (not in Northeast)`
      });
    }
  });

  // Rule 2: Kitchen should be in Southeast (SE)
  const kitchen = rooms.find(r => 
    r.name && r.name.toLowerCase().includes('kitchen')
  );
  if (kitchen) {
    const kitchenDir = normalizeDirection(kitchen.direction);
    if (matchesDirection(kitchenDir, 'southeast') || matchesDirection(kitchenDir, 'se')) {
      score += 0; // Already at max
      positives.push({
        category: 'kitchen',
        message: 'Kitchen is ideally positioned in Southeast - Perfect for fire element placement'
      });
    } else if (matchesDirection(kitchenDir, 'northeast') || matchesDirection(kitchenDir, 'ne')) {
      score -= 20; // Very bad placement
      issues.push({
        severity: 'high',
        category: 'kitchen',
        message: 'Kitchen is in Northeast - This is highly inauspicious. Northeast should be kept clean and open.',
        suggestion: 'Relocate kitchen to Southeast if possible. If not, ensure proper ventilation and use Vastu remedies.'
      });
    } else if (kitchenDir !== 'unknown') {
      score -= 5;
      issues.push({
        severity: 'medium',
        category: 'kitchen',
        message: `Kitchen is in ${kitchenDir} instead of ideal Southeast`,
        suggestion: 'Southeast is the ideal direction for kitchen (fire element). Consider relocation if possible.'
      });
    }
  } else {
    issues.push({
      severity: 'low',
      category: 'kitchen',
      message: 'Kitchen location could not be determined',
      suggestion: 'Ensure kitchen is placed in Southeast direction for optimal Vastu compliance'
    });
  }

  // Rule 3: Master Bedroom should be in Southwest (SW)
  const masterBedroom = rooms.find(r => 
    r.name && (r.name.toLowerCase().includes('master') || r.name.toLowerCase().includes('bedroom'))
  );
  if (masterBedroom) {
    const bedroomDir = normalizeDirection(masterBedroom.direction);
    if (matchesDirection(bedroomDir, 'southwest') || matchesDirection(bedroomDir, 'sw')) {
      positives.push({
        category: 'bedroom',
        message: 'Master bedroom is ideally positioned in Southwest - Promotes stability and rest'
      });
    } else if (matchesDirection(bedroomDir, 'northeast') || matchesDirection(bedroomDir, 'ne')) {
      score -= 15;
      issues.push({
        severity: 'high',
        category: 'bedroom',
        message: 'Master bedroom is in Northeast - Not ideal for rest and stability',
        suggestion: 'Southwest is ideal for master bedroom. Consider relocating if possible.'
      });
    } else if (bedroomDir !== 'unknown') {
      score -= 5;
      issues.push({
        severity: 'low',
        category: 'bedroom',
        message: `Master bedroom is in ${bedroomDir} instead of ideal Southwest`,
        suggestion: 'Southwest is the most stable direction, ideal for master bedroom placement'
      });
    }
  }

  // Rule 4: Entrance ideally North/East
  if (entranceDirection !== 'unknown') {
    if (matchesDirection(entranceDirection, 'north') || matchesDirection(entranceDirection, 'east')) {
      positives.push({
        category: 'entrance',
        message: `Main entrance faces ${entranceDirection} - Excellent for positive energy flow`
      });
    } else if (matchesDirection(entranceDirection, 'southwest') || matchesDirection(entranceDirection, 'sw') ||
               matchesDirection(entranceDirection, 'south') || matchesDirection(entranceDirection, 'south')) {
      score -= 10;
      issues.push({
        severity: 'medium',
        category: 'entrance',
        message: `Main entrance faces ${entranceDirection} - Not ideal according to Vastu`,
        suggestion: 'North or East facing entrance is considered most auspicious. If relocation is not possible, use Vastu remedies at the entrance.'
      });
    } else {
      score -= 5;
      issues.push({
        severity: 'low',
        category: 'entrance',
        message: `Main entrance faces ${entranceDirection}`,
        suggestion: 'North or East facing entrance is considered ideal for positive energy flow'
      });
    }
  } else {
    score -= 3;
    issues.push({
      severity: 'low',
      category: 'entrance',
      message: 'Main entrance direction could not be determined',
      suggestion: 'Ensure main entrance faces North or East for optimal Vastu compliance'
    });
  }

  // Rule 5: Staircase NOT in center
  const hasCentralStaircase = blueprintData.special_notes?.some(note => 
    note.toLowerCase().includes('staircase') && 
    (note.toLowerCase().includes('center') || note.toLowerCase().includes('central'))
  );
  if (hasCentralStaircase) {
    score -= 12;
    issues.push({
      severity: 'high',
      category: 'staircase',
      message: 'Staircase appears to be in the center of the building',
      suggestion: 'Staircase should not be in the center (Brahmasthan). Consider relocating to West, South, or Southwest side.'
    });
  }

  // Rule 6: Pooja room should be in Northeast (NE)
  const poojaRoom = rooms.find(r => 
    r.name && (r.name.toLowerCase().includes('pooja') || r.name.toLowerCase().includes('temple') || r.name.toLowerCase().includes('prayer'))
  );
  if (poojaRoom) {
    const poojaDir = normalizeDirection(poojaRoom.direction);
    if (matchesDirection(poojaDir, 'northeast') || matchesDirection(poojaDir, 'ne')) {
      positives.push({
        category: 'pooja',
        message: 'Pooja room is ideally positioned in Northeast - Most sacred direction'
      });
    } else if (poojaDir !== 'unknown') {
      score -= 8;
      issues.push({
        severity: 'medium',
        category: 'pooja',
        message: `Pooja room is in ${poojaDir} instead of ideal Northeast`,
        suggestion: 'Northeast is the most sacred direction - ideal for pooja/prayer room'
      });
    }
  } else {
    suggestions.push({
      category: 'pooja',
      message: 'Consider adding a pooja/prayer room in the Northeast corner for spiritual well-being'
    });
  }

  // Additional suggestions based on analysis
  if (issues.length === 0) {
    suggestions.push({
      category: 'general',
      message: 'Your layout follows most Vastu principles! Maintain cleanliness and proper ventilation.'
    });
  }

  if (issues.some(i => i.severity === 'high')) {
    suggestions.push({
      category: 'general',
      message: 'Some high-priority Vastu violations detected. Consider consulting a Vastu expert for detailed remedies.'
    });
  }

  // Ensure score is between 0 and 100
  score = Math.max(0, Math.min(100, Math.round(score)));

  // Generate overall assessment
  let assessment = 'excellent';
  if (score < 60) assessment = 'poor';
  else if (score < 75) assessment = 'fair';
  else if (score < 90) assessment = 'good';

  return {
    score,
    assessment,
    issues,
    positives,
    suggestions
  };
}

module.exports = vastuRules;

