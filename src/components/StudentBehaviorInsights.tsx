import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';
import { TrendingUp, AlertTriangle, Award, Calendar, FileText, Flag } from 'lucide-react';
import type { User, ODRequest } from '../App';

interface StudentBehaviorInsightsProps {
  student: User;
  odRequests: ODRequest[];
  onFlagToHOD?: (studentId: string, reason: string) => void;
}

export function StudentBehaviorInsights({ student, odRequests, onFlagToHOD }: StudentBehaviorInsightsProps) {
  const studentRequests = odRequests.filter(req => req.studentDetails.studentId === student.id);
  
  // Calculate insights
  const totalODs = studentRequests.length;
  const approvedODs = studentRequests.filter(req => ['mentor_approved', 'hod_approved', 'principal_approved', 'completed', 'certificate_approved'].includes(req.status)).length;
  const rejectedODs = studentRequests.filter(req => ['mentor_rejected', 'hod_rejected', 'principal_rejected'].includes(req.status)).length;
  const pendingODs = studentRequests.filter(req => req.status === 'submitted').length;
  
  // Get current semester
  const getCurrentSemester = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    if (month >= 7) {
      return `Odd ${year}-${year + 1}`;
    } else {
      return `Even ${year - 1}-${year}`;
    }
  };
  
  const getSemesterForDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    if (month >= 7) {
      return `Odd ${year}-${year + 1}`;
    } else {
      return `Even ${year - 1}-${year}`;
    }
  };
  
  const currentSemester = getCurrentSemester();
  const currentSemesterODs = studentRequests.filter(req => {
    const reqSemester = getSemesterForDate(req.submittedAt);
    return reqSemester === currentSemester && req.status !== 'mentor_rejected';
  }).length;
  
  const MAX_OD_LIMIT = 5;
  const limitStatus = currentSemesterODs > MAX_OD_LIMIT ? 'exceeded' : 
                      currentSemesterODs === MAX_OD_LIMIT ? 'at-limit' : 'within';
  
  // Recent pattern detection (last 10 days)
  const tenDaysAgo = new Date();
  tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
  const recentODs = studentRequests.filter(req => new Date(req.submittedAt) >= tenDaysAgo);
  
  // Frequency by reason
  const reasonFrequency = studentRequests.reduce((acc, req) => {
    acc[req.reason] = (acc[req.reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const topReasons = Object.entries(reasonFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3);
  
  // Event types
  const eventTypes = studentRequests.reduce((acc, req) => {
    const type = req.reason || 'Other';
    if (!acc[type]) acc[type] = 0;
    acc[type]++;
    return acc;
  }, {} as Record<string, number>);
  
  // Calculate approval rate
  const approvalRate = totalODs > 0 ? (approvedODs / totalODs) * 100 : 0;
  
  // Auto-recommendation logic
  const shouldFlagToHOD = limitStatus === 'exceeded' || recentODs.length >= 3;
  
  return (
    <div className="space-y-4">
      {/* Alert for patterns requiring attention */}
      {recentODs.length >= 3 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Unusual Activity Pattern</AlertTitle>
          <AlertDescription className="text-orange-700">
            Applied for {recentODs.length} ODs in the last 10 days. Consider reviewing the pattern.
          </AlertDescription>
        </Alert>
      )}
      
      {limitStatus === 'exceeded' && (
        <Alert className="border-red-200 bg-red-50">
          <Flag className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">OD Limit Exceeded</AlertTitle>
          <AlertDescription className="text-red-700 space-y-2">
            <p>This student has exceeded the semester OD limit ({currentSemesterODs}/{MAX_OD_LIMIT}).</p>
            {onFlagToHOD && (
              <button
                onClick={() => onFlagToHOD(student.id, `Student has exceeded OD limit with ${currentSemesterODs} ODs this semester`)}
                className="text-sm underline hover:no-underline"
              >
                Flag to HOD for review
              </button>
            )}
          </AlertDescription>
        </Alert>
      )}
      
      {/* Student OD Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>OD Behavior Overview</span>
            </span>
            <Badge variant={limitStatus === 'exceeded' ? 'destructive' : limitStatus === 'at-limit' ? 'secondary' : 'default'}>
              {currentSemesterODs}/{MAX_OD_LIMIT} This Semester
            </Badge>
          </CardTitle>
          <CardDescription>
            {student.name} - {student.rollNumber || student.department}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Statistics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl text-blue-600">{totalODs}</div>
              <div className="text-xs text-muted-foreground">Total ODs</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl text-green-600">{approvedODs}</div>
              <div className="text-xs text-muted-foreground">Approved</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl text-red-600">{rejectedODs}</div>
              <div className="text-xs text-muted-foreground">Rejected</div>
            </div>
            <div className="text-center p-3 bg-amber-50 rounded-lg">
              <div className="text-2xl text-amber-600">{pendingODs}</div>
              <div className="text-xs text-muted-foreground">Pending</div>
            </div>
          </div>
          
          {/* Approval Rate */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Approval Rate</span>
              <span className={approvalRate >= 70 ? 'text-green-600' : approvalRate >= 50 ? 'text-amber-600' : 'text-red-600'}>
                {approvalRate.toFixed(0)}%
              </span>
            </div>
            <Progress value={approvalRate} className="h-2" />
          </div>
          
          {/* Top Reasons */}
          {topReasons.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm">Most Frequent Reasons:</div>
              <div className="space-y-2">
                {topReasons.map(([reason, count]) => (
                  <div key={reason} className="flex items-center justify-between text-sm">
                    <span className="flex items-center space-x-2">
                      <FileText className="h-3 w-3 text-muted-foreground" />
                      <span>{reason}</span>
                    </span>
                    <Badge variant="outline">{count} times</Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Recent Activity Pattern */}
          {recentODs.length > 0 && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-blue-800">
                <Calendar className="h-4 w-4" />
                <span>Recent Activity: {recentODs.length} OD{recentODs.length > 1 ? 's' : ''} in last 10 days</span>
              </div>
              {recentODs.length >= 3 && (
                <div className="mt-2 text-xs text-blue-700">
                  ⚠️ High frequency - Review pattern carefully
                </div>
              )}
            </div>
          )}
          
          {/* Auto Recommendation */}
          {shouldFlagToHOD && (
            <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg">
              <div className="flex items-center space-x-2 text-sm text-amber-800">
                <Flag className="h-4 w-4" />
                <span className="font-semibold">System Recommendation:</span>
              </div>
              <div className="mt-1 text-xs text-amber-700">
                Consider flagging this student to HOD for review due to {limitStatus === 'exceeded' ? 'exceeded OD limit' : 'unusual activity pattern'}.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Recent OD History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Recent OD History</CardTitle>
        </CardHeader>
        <CardContent>
          {studentRequests.length === 0 ? (
            <div className="text-center py-4 text-sm text-muted-foreground">
              No OD history available
            </div>
          ) : (
            <div className="space-y-2">
              {studentRequests.slice(0, 5).map((req) => (
                <div key={req.id} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                  <div className="flex-1">
                    <div>{req.reason}</div>
                    <div className="text-muted-foreground">
                      {new Date(req.fromDate).toLocaleDateString()}
                    </div>
                  </div>
                  <Badge variant={
                    req.status.includes('approved') ? 'default' :
                    req.status.includes('rejected') ? 'destructive' :
                    'secondary'
                  } className="text-xs">
                    {req.status.replace('_', ' ')}
                  </Badge>
                </div>
              ))}
              {studentRequests.length > 5 && (
                <div className="text-center text-xs text-muted-foreground">
                  + {studentRequests.length - 5} more ODs
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
