# Principal Dashboard - User Guide

## Dashboard Layout

### Top Section: KPI Cards
Five key performance indicator cards showing:
- **Total Requests** - Institution-wide OD count
- **Approved** - With approval rate percentage
- **Pending** - Currently in workflow
- **Departments** - Number of active departments
- **Stuck Requests** - Requests pending >48 hours

---

## Featured Sections (Always Visible)

### 1. Live OD Pipeline View
```
┌─────────────────────────────────────────────────────────────┐
│  Mentor Review    →    HOD Review    →    Principal Review  │
│  [12 pending]          [5 pending]        [2 pending]       │
└─────────────────────────────────────────────────────────────┘
```
Visual flow showing real-time application status at each approval level.

### 2. Policy Alert System
```
┌─────────────────────────────────────────────────────────────┐
│  🚨 Critical Alerts                              [Bell Icon] │
├─────────────────────────────────────────────────────────────┤
│  ⚠️  Computer Science - Students Exceeding Limits           │
│      5 students exceeded 5 OD limit            [Dismiss]     │
├─────────────────────────────────────────────────────────────┤
│  ⚠️  Mechanical - High Rejection Rate                       │
│      35% of OD requests are rejected           [Dismiss]     │
└─────────────────────────────────────────────────────────────┘
```
Automated alerts for policy violations with dismissible notifications.

---

## Tabbed Analytics

### Tab 1: Overview
**Department-wise Charts:**
- OD Distribution by Department (Bar Chart)
- Monthly Trends (Combined Bar + Line Chart)
- Top OD Reasons (Pie Chart)
- Department Performance (Approval/Rejection Bar Chart)

### Tab 2: Heatmap 🗺️
**Institutional OD Heatmap**
```
SCOFT Departments
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│   AI & DS    │ │   AI & ML    │ │     CSE      │
│     [45]     │ │     [38]     │ │     [62]     │
│  High Load   │ │ Medium Load  │ │  High Load   │
└──────────────┘ └──────────────┘ └──────────────┘

NON-SCOFT Departments
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│    Civil     │ │  Mechanical  │ │     EEE      │
│     [28]     │ │     [35]     │ │     [22]     │
│ Normal Load  │ │ Medium Load  │ │  Low Load    │
└──────────────┘ └──────────────┘ └──────────────┘
```

**Color Legend:**
- 🟦 Light Blue: Low Load
- 🔵 Medium Blue: Normal Load
- 🔷 Dark Blue: High Load
- 🔹 Darkest Blue: Very High Load

### Tab 3: Insights 📈
**OD Category Breakdown**
```
Pie Chart + Breakdown List:

Academic:  35%  (142 requests)  🎓
Technical: 28%  (113 requests)  💻
Sports:    18%   (73 requests)  🏆
Cultural:  12%   (48 requests)  🎭
NSS:        7%   (28 requests)  🤝
```

**Top 3 Summary:**
- Most Common: Academic (142)
- 2nd Most: Technical (113)
- 3rd Most: Sports (73)

### Tab 4: Reports 📄
**Report Generator Interface**
```
┌─────────────────────────────────────────────────────────────┐
│  Report Configuration                                        │
├─────────────────────────────────────────────────────────────┤
│  Report Type:    [By Department ▼]                          │
│  Time Period:    [This Month    ▼]                          │
│  Format:         [CSV           ▼]                          │
├─────────────────────────────────────────────────────────────┤
│  Preview: This report will include 245 OD requests           │
│                                      [Download Report] 📥     │
└─────────────────────────────────────────────────────────────┘
```

**Report Options:**
- **Type:** Department / Gender / Event Type
- **Period:** All Time / Specific Month
- **Format:** CSV / PDF (coming soon)

**Generated CSV includes:**
- Department Report: Dept, Total, Approved, Pending, Rejected, Approval Rate
- Gender Report: Gender, Total, Approved, Pending, Rejected
- Event Type Report: Type, Total, Approved, Pending, Rejected

### Tab 5: OD Limits
Complete OD limit tracking system showing:
- Students approaching/exceeding limits
- Color-coded indicators
- Department-wise breakdown

### Tab 6: Departments
Comprehensive department analysis with:
- SCOFT vs NON-SCOFT categorization
- Request counts and statuses
- Certificate tracking
- Approval rates

---

## Bottom Section: System Audit

### Audit Log Tab
Searchable table with filters:
- Search by student, roll number, or reason
- Filter by department
- Filter by time period (Today, Week, Month, All Time)
- Shows all OD request details with timestamps

### Stuck Requests Tab
List of requests pending >48 hours with:
- Student details
- Department
- Current status
- Days pending (highlighted in red)

---

## Key Features Summary

✅ **Real-time Monitoring** - Live pipeline shows current system state
✅ **Visual Analytics** - Charts, heatmaps, and color-coded indicators
✅ **Automated Alerts** - Proactive policy violation detection
✅ **Quick Reports** - One-click CSV downloads for any time period
✅ **Comprehensive Filtering** - Multiple ways to slice and analyze data
✅ **Department Insights** - SCOFT vs NON-SCOFT comparison
✅ **Category Analysis** - Event type distribution and trends

---

## Usage Tips

1. **Check Pipeline First** - Start with the Live OD Pipeline to see workflow status
2. **Review Alerts** - Address critical alerts from the Policy Alert System
3. **Use Heatmap** - Identify departments with unusual activity levels
4. **Generate Reports** - Monthly reports for institutional records
5. **Monitor Limits** - Check OD Limits tab regularly for students nearing thresholds
6. **Audit Trail** - Use Audit Log for detailed historical analysis

---

## Color Coding Guide

**Status Colors:**
- 🟢 Green: Approved/Success
- 🟡 Yellow: Pending/Warning
- 🔴 Red: Rejected/Critical
- 🔵 Blue: Info/Neutral
- 🟣 Purple: Certificate-related

**Alert Severity:**
- 🔴 Critical: Immediate action required
- 🟠 High: Attention needed soon
- 🟡 Medium: Monitor situation
- 🔵 Low: Informational only

**Department Categories:**
- 🔵 Blue: SCOFT departments
- 🟢 Green: NON-SCOFT departments

---

## Notification System

**Bell Icon Control:**
- ✅ Enabled: Receive toast notifications for critical alerts
- ❌ Disabled: Silent mode (alerts still visible in dashboard)

**Toast Notifications appear for:**
- Critical policy violations
- System-wide issues
- Successful downloads
- Alert dismissals

---

## Best Practices

1. **Daily Review** - Check dashboard at start of day for overnight activity
2. **Weekly Reports** - Generate weekly reports for trend analysis
3. **Alert Management** - Don't dismiss critical alerts without action
4. **Department Balance** - Use heatmap to ensure balanced OD distribution
5. **Audit Trail** - Keep CSV exports for institutional records
6. **Proactive Monitoring** - Address yellow/orange alerts before they become critical

---

## Quick Actions

**From Dashboard:**
- View real-time pipeline status → Check Live Pipeline
- Generate monthly report → Reports tab → Select month → Download
- Find high-load department → Heatmap tab → Look for dark colors
- Check student limits → OD Limits tab
- Investigate stuck requests → Stuck Requests tab
- Review policy violations → Policy Alert System

---

This guide provides Principal users with a complete understanding of the enhanced dashboard features and how to use them effectively for institutional oversight.
