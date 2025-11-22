import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Flag, AlertTriangle, TrendingUp, Bell } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { User, ODRequest } from '../App';

interface AutoFlaggedODListProps {
  odRequests: ODRequest[];
  allUsers: User[];
  department: string;
}

export function AutoFlaggedODList({ odRequests, allUsers, department }: AutoFlaggedODListProps) {
  const MAX_OD_LIMIT = 5;
  
  // Helper to get semester
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
  
  // Get all students in department
  const departmentStudents = allUsers.filter(u => 
    u.role === 'student' && u.department === department
  );
  
  // Calculate OD counts for each student
  const studentODCounts = departmentStudents.map(student => {
    const studentODs = odRequests.filter(req => {
      const reqSemester = getSemesterForDate(req.submittedAt);
      return req.studentDetails.studentId === student.id &&
             reqSemester === currentSemester &&
             req.status !== 'mentor_rejected';
    });
    
    const approvedODs = studentODs.filter(req =>
      ['mentor_approved', 'hod_approved', 'principal_approved', 'completed', 'certificate_approved'].includes(req.status)
    ).length;
    
    return {
      student,
      totalODs: studentODs.length,
      approvedODs,
      pendingODs: studentODs.filter(req => req.status === 'submitted' || req.status === 'mentor_approved').length,
      exceededLimit: approvedODs > MAX_OD_LIMIT,
      atLimit: approvedODs === MAX_OD_LIMIT,
      recentODs: studentODs.filter(req => {
        const daysSinceSubmission = (new Date().getTime() - new Date(req.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceSubmission <= 30;
      }).length,
    };
  });
  
  // Get students who exceeded limit
  const exceededLimitStudents = studentODCounts.filter(s => s.exceededLimit);
  const atLimitStudents = studentODCounts.filter(s => s.atLimit);
  const approaching = studentODCounts.filter(s => s.approvedODs >= 4 && !s.atLimit && !s.exceededLimit);
  
  // Real-time alerts
  useEffect(() => {
    const checkAndAlert = () => {
      const alertKey = `hod-limit-alert-${department}-${new Date().toDateString()}`;
      const hasAlertedToday = localStorage.getItem(alertKey);
      
      if (!hasAlertedToday && exceededLimitStudents.length > 0) {
        toast.error(`🚨 ${exceededLimitStudents.length} student${exceededLimitStudents.length > 1 ? 's have' : ' has'} exceeded OD limit`, {
          description: `Department: ${department}. Immediate review required.`,
          duration: 10000,
        });
        localStorage.setItem(alertKey, 'true');
      }
      
      if (!hasAlertedToday && atLimitStudents.length >= 5) {
        toast.warning(`⚠️ ${atLimitStudents.length} students reached OD limit this month`, {
          description: `Department: ${department}. Monitor closely.`,
          duration: 8000,
        });
      }
    };
    
    checkAndAlert();
  }, [exceededLimitStudents.length, atLimitStudents.length, department]);
  
  const getStatusColor = (student: typeof studentODCounts[0]) => {
    if (student.exceededLimit) return 'bg-red-100 border-red-300';
    if (student.atLimit) return 'bg-orange-100 border-orange-300';
    if (student.approvedODs >= 4) return 'bg-yellow-100 border-yellow-300';
    return 'bg-gray-50 border-gray-200';
  };
  
  const getStatusBadge = (student: typeof studentODCounts[0]) => {
    if (student.exceededLimit) {
      return <Badge variant="destructive" className="text-xs">🚨 Over Limit</Badge>;
    }
    if (student.atLimit) {
      return <Badge className="bg-orange-100 text-orange-800 text-xs">⚠️ At Limit</Badge>;
    }
    if (student.approvedODs >= 4) {
      return <Badge className="bg-yellow-100 text-yellow-800 text-xs">⚡ Approaching</Badge>;
    }
    return <Badge variant="outline" className="text-xs">Normal</Badge>;
  };
  
  return (
    <div className="space-y-6">
      {/* Critical Alerts */}
      {exceededLimitStudents.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <Flag className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">
            🚨 Critical: {exceededLimitStudents.length} Student{exceededLimitStudents.length > 1 ? 's' : ''} Exceeded OD Limit
          </AlertTitle>
          <AlertDescription className="text-red-700">
            These students have exceeded the maximum {MAX_OD_LIMIT} OD limit for this semester.
            Immediate review and action required.
          </AlertDescription>
        </Alert>
      )}
      
      {atLimitStudents.length >= 5 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Bell className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">
            Real-Time Alert: {atLimitStudents.length} students reached OD limit this month
          </AlertTitle>
          <AlertDescription className="text-orange-700">
            Department: {department} | Monitor these students closely for any additional OD requests.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-red-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Exceeded Limit</span>
              <Flag className="h-4 w-4 text-red-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-red-600">{exceededLimitStudents.length}</div>
            <p className="text-xs text-muted-foreground">&gt; {MAX_OD_LIMIT} ODs</p>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>At Limit</span>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-orange-600">{atLimitStudents.length}</div>
            <p className="text-xs text-muted-foreground">= {MAX_OD_LIMIT} ODs</p>
          </CardContent>
        </Card>
        
        <Card className="border-yellow-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Approaching</span>
              <TrendingUp className="h-4 w-4 text-yellow-600" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-yellow-600">{approaching.length}</div>
            <p className="text-xs text-muted-foreground">4 ODs</p>
          </CardContent>
        </Card>
        
        <Card className="border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Within Limit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl text-green-600">
              {studentODCounts.filter(s => s.approvedODs < 4).length}
            </div>
            <p className="text-xs text-muted-foreground">&lt; 4 ODs</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Auto-Flagged Students */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Flag className="h-5 w-5 text-red-600" />
            <span>Auto-Flagged Students - OD Limit Tracking</span>
          </CardTitle>
          <CardDescription>
            Students automatically flagged based on OD limit violations (highlighted in red)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {studentODCounts.filter(s => s.approvedODs >= 4).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>All students are within safe OD limits</p>
              <p className="text-xs mt-2">No flags triggered</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Approved ODs</TableHead>
                  <TableHead>Pending ODs</TableHead>
                  <TableHead>Last 30 Days</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {studentODCounts
                  .filter(s => s.approvedODs >= 4)
                  .sort((a, b) => b.approvedODs - a.approvedODs)
                  .map(studentData => (
                    <TableRow key={studentData.student.id} className={getStatusColor(studentData)}>
                      <TableCell>
                        <div>
                          <div className="font-semibold flex items-center space-x-2">
                            <span>{studentData.student.name}</span>
                            {studentData.exceededLimit && <Flag className="h-4 w-4 text-red-600" />}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {studentData.student.rollNumber || studentData.student.email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={studentData.exceededLimit ? 'destructive' : 'default'}
                          className="text-lg px-3 py-1"
                        >
                          {studentData.approvedODs}/{MAX_OD_LIMIT}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {studentData.pendingODs} pending
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {studentData.recentODs} OD{studentData.recentODs !== 1 ? 's' : ''}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(studentData)}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            toast.info('Student Details', {
                              description: `${studentData.student.name}: ${studentData.approvedODs} approved ODs this semester`,
                            });
                          }}
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Department Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Department OD Usage Summary</CardTitle>
          <CardDescription>Current semester overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
              <span className="text-sm">Total Students:</span>
              <span className="text-lg font-semibold">{departmentStudents.length}</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-green-50 rounded">
              <span className="text-sm">Average ODs per Student:</span>
              <span className="text-lg font-semibold">
                {departmentStudents.length > 0
                  ? (studentODCounts.reduce((sum, s) => sum + s.approvedODs, 0) / departmentStudents.length).toFixed(1)
                  : 0}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-purple-50 rounded">
              <span className="text-sm">Total ODs Approved This Semester:</span>
              <span className="text-lg font-semibold">
                {studentODCounts.reduce((sum, s) => sum + s.approvedODs, 0)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
