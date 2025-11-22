import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { CheckCircle, XCircle, MessageSquare, Clock, Users, TrendingUp, Settings, Code2, BarChart, Filter, Eye, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { WeekOffSettings } from './WeekOffSettings';
import { LeetCodeViewer } from './LeetCodeViewer';
import { ODLimitTracker } from './ODLimitTracker';
import { StudentBehaviorInsights } from './StudentBehaviorInsights';
import { ProofVerificationView } from './ProofVerificationView';
import { EscalationReminder } from './EscalationReminder';
import { MenteeProgressAnalytics } from './MenteeProgressAnalytics';
import type { User, ODRequest } from '../App';

interface MentorDashboardProps {
  user: User;
  odRequests: ODRequest[];
  setOdRequests: React.Dispatch<React.SetStateAction<ODRequest[]>>;
  allUsers: User[];
}

export function MentorDashboard({ user, odRequests, setOdRequests, allUsers }: MentorDashboardProps) {
  const [selectedRequest, setSelectedRequest] = useState<ODRequest | null>(null);
  const [feedback, setFeedback] = useState('');
  const [actionType, setActionType] = useState<'approve' | 'reject' | 'return'>('approve');
  const [filter, setFilter] = useState<'all' | 'today' | 'thisWeek' | 'overLimit'>('all');
  const [selectedStudentForInsights, setSelectedStudentForInsights] = useState<User | null>(null);
  const [verificationRequest, setVerificationRequest] = useState<ODRequest | null>(null);
  
  // Filter students who are mentees
  const menteeUsers = allUsers.filter(u => user.mentees?.includes(u.id) && u.role === 'student');

  // Helper to get current semester
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

  const menteeRequests = odRequests.filter(req => 
    user.mentees?.includes(req.studentDetails.studentId) && 
    ['submitted'].includes(req.status)
  );
  
  // Apply filters
  const getFilteredRequests = () => {
    let filtered = menteeRequests;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    switch (filter) {
      case 'today':
        filtered = menteeRequests.filter(req => {
          const submittedDate = new Date(req.submittedAt);
          submittedDate.setHours(0, 0, 0, 0);
          return submittedDate.getTime() === today.getTime();
        });
        break;
      case 'thisWeek':
        const weekAgo = new Date(today);
        weekAgo.setDate(today.getDate() - 7);
        filtered = menteeRequests.filter(req => new Date(req.submittedAt) >= weekAgo);
        break;
      case 'overLimit':
        const currentSemester = getCurrentSemester();
        const MAX_OD_LIMIT = 5;
        
        // Get students who exceeded limit
        const overLimitStudentIds = new Set<string>();
        menteeUsers.forEach(student => {
          const studentODs = odRequests.filter(req => {
            const reqSemester = getSemesterForDate(req.submittedAt);
            return req.studentDetails.studentId === student.id &&
                   reqSemester === currentSemester &&
                   req.status !== 'mentor_rejected';
          });
          if (studentODs.length > MAX_OD_LIMIT) {
            overLimitStudentIds.add(student.id);
          }
        });
        
        filtered = menteeRequests.filter(req => overLimitStudentIds.has(req.studentDetails.studentId));
        break;
      default:
        break;
    }
    
    return filtered;
  };
  
  const filteredRequests = getFilteredRequests();
  
  const totalMentees = user.mentees?.length || 0;
  const pendingRequests = menteeRequests.length;
  const thisMonthApproved = odRequests.filter(req => 
    user.mentees?.includes(req.studentDetails.studentId) && 
    req.status === 'mentor_approved' &&
    new Date(req.lastUpdated).getMonth() === new Date().getMonth()
  ).length;

  // Helper function to format time periods
  const formatTimePeriod = (odTime: string | string[]) => {
    if (typeof odTime === 'string') {
      if (odTime === 'full-day') {
        return 'Full Day (8:00 AM - 5:00 PM)';
      }
      
      if (odTime.includes('-')) {
        const [start, end] = odTime.split('-');
        const formatTime = (time: string) => {
          const [hours, minutes] = time.split(':');
          const hour = parseInt(hours);
          const ampm = hour >= 12 ? 'PM' : 'AM';
          const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
          return `${displayHour}:${minutes} ${ampm}`;
        };
        return `${formatTime(start)} - ${formatTime(end)}`;
      }
      
      return odTime;
    }
    
    if (Array.isArray(odTime) && odTime.length > 0) {
      const timeMap: Record<string, string> = {
        '08:00-09:00': '8-9',
        '09:00-10:00': '9-10', 
        '10:00-11:00': '10-11',
        '11:00-12:00': '11-12',
        '12:00-13:00': '12-1',
        '13:00-14:00': '1-2',
        '14:00-15:00': '2-3',
        '15:00-16:00': '3-4',
        '16:00-17:00': '4-5'
      };
      
      const periods = odTime.map(period => timeMap[period] || period);
      return `Periods: ${periods.join(', ')}`;
    }
    
    return 'No periods';
  };

  const handleAction = (request: ODRequest, action: 'approve' | 'reject' | 'return', feedbackText: string) => {
    let newStatus: ODRequest['status'];
    let feedbackField: 'mentorFeedback' | 'hodFeedback' = 'mentorFeedback';
    
    switch (action) {
      case 'approve':
        newStatus = 'mentor_approved';
        break;
      case 'reject':
        newStatus = 'mentor_rejected';
        break;
      case 'return':
        newStatus = 'submitted';
        break;
      default:
        return;
    }

    setOdRequests(prev => prev.map(req => 
      req.id === request.id 
        ? { 
            ...req, 
            status: newStatus, 
            [feedbackField]: feedbackText,
            rejectionReason: action === 'reject' ? feedbackText : req.rejectionReason, // Save rejection reason
            mentorSignature: action === 'approve' ? user.name : undefined,
            mentorApprovedAt: action === 'approve' ? new Date().toISOString() : undefined,
            lastUpdated: new Date().toISOString()
          }
        : req
    ));

    toast.success(`Request ${action}ed successfully`);
    setSelectedRequest(null);
    setFeedback('');
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'approve':
        return <CheckCircle className="h-4 w-4" />;
      case 'reject':
        return <XCircle className="h-4 w-4" />;
      case 'return':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1>Mentor Dashboard</h1>
          <p className="text-muted-foreground">Review and approve OD requests from your mentees</p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Mentees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{totalMentees}</div>
              <p className="text-xs text-muted-foreground">Students under guidance</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending Reviews</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-amber-600">{pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Awaiting your approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">This Month Approved</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">{thisMonthApproved}</div>
              <p className="text-xs text-muted-foreground">Requests approved</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs for different sections */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="pending">Pending Requests</TabsTrigger>
            <TabsTrigger value="analytics">
              <TrendingUp className="h-4 w-4 mr-2" />
              Analytics
            </TabsTrigger>
            <TabsTrigger value="od-limits">
              <BarChart className="h-4 w-4 mr-2" />
              OD Limits
            </TabsTrigger>
            <TabsTrigger value="leetcode">
              <Code2 className="h-4 w-4 mr-2" />
              LeetCode Progress
            </TabsTrigger>
            <TabsTrigger value="settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-6">
            {/* Escalation Reminder */}
            <EscalationReminder pendingRequests={menteeRequests} mentorId={user.id} />
            
            {/* Quick Filter Bar */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-semibold">Filter:</span>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant={filter === 'all' ? 'default' : 'outline'}
                      onClick={() => setFilter('all')}
                    >
                      All ({menteeRequests.length})
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === 'today' ? 'default' : 'outline'}
                      onClick={() => setFilter('today')}
                    >
                      Today
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === 'thisWeek' ? 'default' : 'outline'}
                      onClick={() => setFilter('thisWeek')}
                    >
                      This Week
                    </Button>
                    <Button
                      size="sm"
                      variant={filter === 'overLimit' ? 'default' : 'outline'}
                      onClick={() => setFilter('overLimit')}
                      className="bg-red-100 text-red-700 hover:bg-red-200 border-red-300"
                    >
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Over Limit
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Action Required Section */}
        <Card>
          <CardHeader>
            <CardTitle>Action Required</CardTitle>
            <CardDescription>
              {filter === 'all' && 'OD requests from your mentees awaiting review'}
              {filter === 'today' && 'Requests submitted today'}
              {filter === 'thisWeek' && 'Requests submitted this week'}
              {filter === 'overLimit' && 'Requests from students who exceeded OD limit'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredRequests.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No requests found for this filter</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRequests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span>{request.studentDetails.studentName}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const student = menteeUsers.find(s => s.id === request.studentDetails.studentId);
                                if (student) setSelectedStudentForInsights(student);
                              }}
                              className="h-6 px-2"
                            >
                              <TrendingUp className="h-3 w-3" />
                            </Button>
                          </div>
                          <div className="text-sm text-muted-foreground">{request.studentDetails.rollNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>
                            {request.fromDate === request.toDate 
                              ? new Date(request.fromDate).toLocaleDateString()
                              : `${new Date(request.fromDate).toLocaleDateString()} - ${new Date(request.toDate).toLocaleDateString()}`
                            }
                          </div>
                          <div className="text-sm text-muted-foreground">{formatTimePeriod(request.odTime)}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div>{request.reason}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {request.detailedReason}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(request.submittedAt).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setVerificationRequest(request)}
                            className="h-8"
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          
                          <Button 
                            size="sm" 
                            className="bg-green-600 hover:bg-green-700 h-8"
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionType('approve');
                            }}
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>

                          <Button 
                            size="sm" 
                            variant="destructive"
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionType('reject');
                            }}
                            className="h-8"
                          >
                            <XCircle className="h-3 w-3 mr-1" />
                            Reject
                          </Button>

                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => {
                              setSelectedRequest(request);
                              setActionType('return');
                            }}
                            className="h-8"
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Return
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <MenteeProgressAnalytics
              mentees={menteeUsers}
              odRequests={odRequests}
              currentUser={user}
            />
          </TabsContent>

          <TabsContent value="od-limits" className="space-y-6">
            <ODLimitTracker 
              odRequests={odRequests}
              allUsers={allUsers}
              currentUser={user}
            />
          </TabsContent>

          <TabsContent value="leetcode" className="space-y-6">
            <LeetCodeViewer 
              students={menteeUsers}
              title="Mentee LeetCode Progress"
            />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <WeekOffSettings 
              user={user} 
              onSave={(weekOffDay) => {
                // Update faculty data in localStorage or backend
                const facultyData = localStorage.getItem('facultyMembers');
                if (facultyData) {
                  try {
                    const faculty = JSON.parse(facultyData);
                    const updated = faculty.map((f: any) => 
                      f.id === user.id ? { ...f, weekOffDay } : f
                    );
                    localStorage.setItem('facultyMembers', JSON.stringify(updated));
                  } catch (error) {
                    console.error('Error updating faculty data:', error);
                  }
                }
              }}
            />
          </TabsContent>
        </Tabs>

        {/* Action Dialog */}
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                {getActionIcon(actionType)}
                <span>
                  {actionType === 'approve' && 'Approve Request'}
                  {actionType === 'reject' && 'Reject Request'}
                  {actionType === 'return' && 'Return for Corrections'}
                </span>
              </DialogTitle>
              <DialogDescription>
                {selectedRequest && (
                  <div className="space-y-2">
                    <p><strong>Student:</strong> {selectedRequest.studentDetails.studentName}</p>
                    <p><strong>Date:</strong> {
                      selectedRequest.fromDate === selectedRequest.toDate 
                        ? new Date(selectedRequest.fromDate).toLocaleDateString()
                        : `${new Date(selectedRequest.fromDate).toLocaleDateString()} - ${new Date(selectedRequest.toDate).toLocaleDateString()}`
                    }</p>
                    <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                    <p><strong>Detailed Reason:</strong> {selectedRequest.detailedReason}</p>
                    {selectedRequest.description && <p><strong>Additional Description:</strong> {selectedRequest.description}</p>}
                    
                    {/* Prize Information */}
                    {selectedRequest.prizeInfo?.wonPrize && selectedRequest.prizeInfo.position && (
                      <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="font-semibold text-yellow-800">🏆 Prize/Award Information:</p>
                        <p className="text-sm mt-1">
                          <strong>Position:</strong> {selectedRequest.prizeInfo.position}
                          {selectedRequest.prizeInfo.cashPrize > 0 && (
                            <span> | <strong>Cash Prize:</strong> ₹{selectedRequest.prizeInfo.cashPrize}</span>
                          )}
                        </p>
                      </div>
                    )}
                    
                    {/* Attendance Information */}
                    {selectedRequest.attendanceInfo && selectedRequest.attendanceInfo.length > 0 && (
                      <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                        <p className="font-semibold text-blue-800">📚 Student Attendance Records:</p>
                        <div className="space-y-2 mt-2">
                          {selectedRequest.attendanceInfo.map((subject, idx) => (
                            <div key={idx} className="text-sm">
                              <strong>{subject.subjectCode}</strong> - {subject.subjectName}: 
                              <span className={`ml-1 font-semibold ${
                                subject.currentPercentage >= 75 ? 'text-green-600' : 
                                subject.currentPercentage >= 65 ? 'text-yellow-600' : 'text-red-600'
                              }`}>
                                {subject.currentPercentage}%
                              </span>
                            </div>
                          ))}
                          <p className="text-sm text-muted-foreground mt-1">
                            <strong>Average Attendance:</strong> {(
                              selectedRequest.attendanceInfo.reduce((sum, s) => sum + s.currentPercentage, 0) / 
                              selectedRequest.attendanceInfo.length
                            ).toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="feedback">
                  {actionType === 'approve' ? 'Approval Comments (Optional)' : 'Feedback (Required)'}
                </Label>
                <Textarea
                  id="feedback"
                  placeholder={
                    actionType === 'approve' 
                      ? 'Add any comments for this approval...'
                      : actionType === 'reject'
                      ? 'Please provide reason for rejection...'
                      : 'Please specify what needs to be corrected...'
                  }
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  required={actionType !== 'approve'}
                  rows={4}
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={() => selectedRequest && handleAction(selectedRequest, actionType, feedback)}
                  disabled={actionType !== 'approve' && !feedback.trim()}
                  className={
                    actionType === 'approve' 
                      ? 'bg-green-600 hover:bg-green-700'
                      : actionType === 'reject'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }
                >
                  {actionType === 'approve' && 'Approve Request'}
                  {actionType === 'reject' && 'Reject Request'}
                  {actionType === 'return' && 'Return for Corrections'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Student Behavior Insights Dialog */}
        <Dialog open={!!selectedStudentForInsights} onOpenChange={() => setSelectedStudentForInsights(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Student OD Behavior Insights</DialogTitle>
              <DialogDescription>
                Comprehensive analysis of student&apos;s OD patterns and history
              </DialogDescription>
            </DialogHeader>
            <div className="flex-1 overflow-y-auto pr-2">
              {selectedStudentForInsights && (
                <StudentBehaviorInsights
                  student={selectedStudentForInsights}
                  odRequests={odRequests}
                  onFlagToHOD={(studentId, reason) => {
                    toast.info('Flag to HOD', {
                      description: `Student flagged to HOD: ${reason}`,
                      duration: 5000,
                    });
                    setSelectedStudentForInsights(null);
                  }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
        
        {/* Proof Verification View */}
        {verificationRequest && (
          <ProofVerificationView
            request={verificationRequest}
            open={!!verificationRequest}
            onClose={() => setVerificationRequest(null)}
          />
        )}
      </div>
    </div>
  );
}