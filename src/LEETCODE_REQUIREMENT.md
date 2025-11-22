# LeetCode Completion Requirement for OD Requests

## Overview
The OD management system now includes a mandatory LeetCode completion requirement. Students must complete weekly LeetCode problems based on their academic year before they can submit OD requests.

## Requirements by Year

### 1st Year Students
- **Required:** Easy level problems
- Must complete at least one Easy problem in the current week

### 2nd Year Students  
- **Required:** Easy + Medium level problems
- Must complete at least one Easy problem AND one Medium problem in the current week

### 3rd & 4th Year Students
- **Required:** Easy + Medium + Hard level problems
- Must complete at least one Easy, one Medium, AND one Hard problem in the current week

## How It Works

### 1. Track LeetCode Progress
Students must use the **LeetCode Weekly Tracker** in their dashboard to:
- Start a new week of tracking
- Record the number of problems solved by difficulty
- Upload proof/screenshot of their progress
- Mark weeks as complete

### 2. Automatic Validation
When a student tries to submit an OD request, the system:
- Checks the student's year level
- Determines required difficulty levels
- Validates the current week's LeetCode data
- Shows the completion status in real-time

### 3. Visual Indicators
The OD request form displays:
- **Green border/background:** All requirements met ✓
- **Yellow border/background:** Some requirements incomplete ⚠
- **Red border/background:** No LeetCode data found ⚠

### 4. Submission Blocking
If requirements are not met:
- The submit button still functions, but validation occurs on click
- A detailed error toast appears explaining what's missing
- Students are directed to complete the missing requirements

## User Experience

### Information Banner
At the top of the OD request form, students see:
- 3-day advance submission policy
- LeetCode completion requirements by year
- Tips for tracking progress

### LeetCode Status Card
After entering their year, students see a dedicated card showing:
- Required difficulty levels for their year
- Current week's completion status
- Number of Easy/Medium/Hard problems completed
- Visual color-coding (green for completed, gray for pending)
- Clear messages about what's required

### Error Messages
If validation fails, students receive:
- Toast notification with specific missing requirements
- Guidance on what needs to be completed
- Link to the requirement based on their year

## Technical Implementation

### Files Created/Modified

1. **`/utils/leetCodeValidator.ts`** (NEW)
   - `validateLeetCodeCompletion()` - Main validation function
   - `getLeetCodeStatusSummary()` - Get display status
   - `getRequiredDifficulties()` - Determine required levels
   - `getRequirementMessage()` - Generate user-friendly messages

2. **`/components/ODRequestForm.tsx`** (MODIFIED)
   - Added LeetCode validation to `handleSubmit()`
   - Added LeetCode status card after Section 1
   - Imports validation utilities
   - Real-time status display based on student year

3. **`/components/ODNotificationBanner.tsx`** (MODIFIED)
   - Enhanced to show both 3-day policy and LeetCode requirements
   - Detailed breakdown of requirements by year
   - Tips for tracking progress

### Data Storage
- LeetCode data stored in localStorage: `leetcode_tracker_${userId}`
- Contains array of week objects with difficulty breakdowns
- Persists across sessions
- Each week includes: easy, medium, hard problem counts

### Validation Logic
```typescript
// Check if student has completed required difficulties
const validation = validateLeetCodeCompletion(userId, studentYear);

if (!validation.isValid) {
  // Show error and block submission
  toast.error('LeetCode Requirements Not Met', {
    description: validation.message
  });
  return;
}
```

## Benefits

### For Students
- Clear requirements before submission
- Real-time feedback on completion status
- Encourages consistent coding practice
- No surprises during submission

### For Faculty
- Ensures students maintain coding skills
- Automatic verification of completion
- Reduces manual checking
- Promotes academic discipline

### For Institution
- Standardized coding practice across years
- Trackable student progress
- Preparation for placements
- Better coding culture

## Future Enhancements

Potential additions:
- Integration with actual LeetCode API
- Automated problem verification
- Leaderboards and statistics
- Weekly problem recommendations
- Reminder notifications
- Export LeetCode progress reports

## Support

Students who need help should:
1. Visit their dashboard's "LeetCode Weekly Tracker"
2. Click "Start New Week" to begin tracking
3. Update their progress regularly
4. Upload proof screenshots
5. Complete required difficulties before OD submission

---

**Note:** This requirement applies to all new OD requests starting immediately. Students should maintain their weekly LeetCode practice to ensure smooth OD request processing.
