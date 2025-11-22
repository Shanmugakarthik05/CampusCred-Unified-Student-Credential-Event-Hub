import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Plus, Download, Clock, CheckCircle, XCircle, FileText, Upload, Search, Users, TrendingUp, AlertTriangle, AlertCircle, BarChart } from 'lucide-react';
import { ODRequestForm } from './ODRequestForm';
import { StatusTracker } from './StatusTracker';
import { CertificateUpload } from './CertificateUpload';
import { ODNotificationBanner } from './ODNotificationBanner';
import { FacultySearch } from './FacultySearch';
import { ODLetterGenerator } from './ODLetterGenerator';
import { ODDownloadInfo } from './ODDownloadInfo';
import { EventRecommendations } from './EventRecommendations';
import { EventDiscovery } from './EventDiscovery';
import { StudentRegistration, StudentProfile } from './StudentRegistration';
import { WishlistManager } from './WishlistManager';
import { LeetCodeTracker } from './LeetCodeTracker';
import { SmartODLimit } from './SmartODLimit';
import { SmartNotificationSystem } from './SmartNotificationSystem';
import { toast } from 'sonner@2.0.3';
import type { User, ODRequest, Certificate, FacultyMember } from '../App';

// Semester helper function
function getCurrentSemester(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const year = now.getFullYear();
  
  if (month >= 7) {
    return `Odd ${year}-${year + 1}`;
  } else {
    return `Even ${year - 1}-${year}`;
  }
}

function getSemesterForDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  if (month >= 7) {
    return `Odd ${year}-${year + 1}`;
  } else {
    return `Even ${year - 1}-${year}`;
  }
}

interface StudentDashboardProps {
  user: User;
  odRequests: ODRequest[];
  setOdRequests: React.Dispatch<React.SetStateAction<ODRequest[]>>;
  certificates: Certificate[];
  setCertificates: React.Dispatch<React.SetStateAction<Certificate[]>>;
  faculty: FacultyMember[];
  studentProfile: StudentProfile | null;
  showRegistration: boolean;
  handleRegistrationComplete: (profile: StudentProfile) => void;
  allUsers: User[];
}

export function StudentDashboard({ 
  user, 
  odRequests, 
  setOdRequests, 
  certificates, 
  setCertificates, 
  faculty,
  studentProfile,
  showRegistration,
  handleRegistrationComplete,
  allUsers
}: StudentDashboardProps) {
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [showEventODForm, setShowEventODForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  
  // Show registration form if student hasn't completed profile
  if (showRegistration) {
    return <StudentRegistration userId={user.id} onComplete={handleRegistrationComplete} />;
  }

  const userRequests = odRequests.filter(req => req.studentDetails.studentId === user.id);
  const totalRequests = userRequests.length;
  const approvedRequests = userRequests.filter(req => req.status === 'mentor_approved' || req.status === 'completed' || req.status === 'certificate_approved').length;
  const pendingRequests = userRequests.filter(req => 
    ['submitted'].includes(req.status)
  ).length;
  const completedRequests = userRequests.filter(req => req.status === 'completed').length;

  // Calculate current semester OD count
  const currentSemester = getCurrentSemester();
  const MAX_OD_LIMIT = 5;
  const currentSemesterODs = userRequests.filter(req => {
    const reqSemester = getSemesterForDate(req.submittedAt);
    return reqSemester === currentSemester && req.status !== 'mentor_rejected';
  }).length;
  
  const odLimitStatus = currentSemesterODs < MAX_OD_LIMIT ? 'within' : 
                        currentSemesterODs === MAX_OD_LIMIT ? 'at-limit' : 'exceeded';

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'mentor_approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'certificate_uploaded':
        return <Badge className="bg-purple-100 text-purple-800">Certificate Uploaded</Badge>;
      case 'certificate_approved':
        return <Badge className="bg-green-100 text-green-800">Certificate Approved</Badge>;
      case 'mentor_rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'submitted':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Approval</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const handleNewRequest = (requestData: Omit<ODRequest, 'id' | 'status' | 'submittedAt' | 'lastUpdated'>) => {
    // Double-check date validation
    const today = new Date();
    const odDate = new Date(requestData.fromDate);
    const diffTime = odDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 3) {
      const requiredDate = new Date();
      requiredDate.setDate(today.getDate() + 3);
      toast.error(`OD requests must be submitted at least 3 days in advance. Please select a date on or after ${requiredDate.toLocaleDateString()}.`);
      return;
    }

    const newRequest: ODRequest = {
      ...requestData,
      id: Date.now().toString(),
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      lastUpdated: new Date().toISOString()
    };
    
    setOdRequests(prev => [...prev, newRequest]);
    setShowRequestForm(false);
    toast.success('OD request submitted successfully! Your request is now under review.');
  };

  const handleCertificateUpload = (certificateData: Omit<Certificate, 'id'>) => {
    const newCertificate: Certificate = {
      ...certificateData,
      id: Date.now().toString()
    };
    
    setCertificates(prev => [...prev, newCertificate]);
    
    // Update the OD request status to certificate_uploaded
    setOdRequests(prev => prev.map(req => 
      req.id === certificateData.odRequestId 
        ? { ...req, status: 'certificate_uploaded', certificateId: newCertificate.id, lastUpdated: new Date().toISOString() }
        : req
    ));
  };

  const handleApplyForODFromEvent = (event: any) => {
    setSelectedEvent(event);
    setShowEventODForm(true);
  };

  // Note: Download is now handled directly in ODLetterGenerator component

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
      if (periods.length === 1) {
        return `Period ${periods[0]}`;
      }
      return `Periods: ${periods.join(', ')}`;
    }
    
    return 'No periods';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Smart Notification System - Invisible component that monitors status changes */}
        <SmartNotificationSystem odRequests={odRequests} userId={user.id} />
        
        {/* Important Notice */}
        <ODNotificationBanner type="info" />
        
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1>Welcome back, {user.name}</h1>
            <p className="text-muted-foreground">Manage your OD requests and track their status</p>
          </div>
          <Dialog open={showRequestForm} onOpenChange={setShowRequestForm}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Submit New OD
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <DialogHeader>
                <DialogTitle>Submit New OD Request</DialogTitle>
                <DialogDescription>
                  Fill in all the details below to submit your OD request. Scroll down to see all sections.
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-y-auto flex-1 pr-2">
                <ODRequestForm currentUser={user} onSubmit={handleNewRequest} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Smart OD Limit Tracker */}
        <SmartODLimit 
          currentCount={currentSemesterODs}
          maxLimit={MAX_OD_LIMIT}
          semester={currentSemester}
        />

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Requests</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{totalRequests}</div>
              <p className="text-xs text-muted-foreground">All time requests</p>
            </CardContent>
          </Card>

          <Card className={
            odLimitStatus === 'exceeded' ? 'border-red-200 bg-red-50' :
            odLimitStatus === 'at-limit' ? 'border-orange-200 bg-orange-50' : ''
          }>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">This Semester</CardTitle>
              <BarChart className={`h-4 w-4 ${
                odLimitStatus === 'exceeded' ? 'text-red-600' :
                odLimitStatus === 'at-limit' ? 'text-orange-600' : 'text-green-600'
              }`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl ${
                odLimitStatus === 'exceeded' ? 'text-red-600' :
                odLimitStatus === 'at-limit' ? 'text-orange-600' : 'text-green-600'
              }`}>
                {currentSemesterODs} / {MAX_OD_LIMIT}
              </div>
              <p className="text-xs text-muted-foreground">{currentSemester}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Approved</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">{approvedRequests}</div>
              <p className="text-xs text-muted-foreground">Successfully approved</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-amber-600">{pendingRequests}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Completed</CardTitle>
              <Upload className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-blue-600">{completedRequests}</div>
              <p className="text-xs text-muted-foreground">Ready for certificate</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Dashboard Tabs */}
        <Tabs defaultValue="requests" className="w-full">
          <TabsList className="grid w-full grid-cols-5 mb-6">
            <TabsTrigger value="requests" className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>My OD Requests</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>Events</span>
            </TabsTrigger>
            <TabsTrigger value="wishlist" className="flex items-center space-x-2">
              <CheckCircle className="h-4 w-4" />
              <span>Wishlist</span>
            </TabsTrigger>
            <TabsTrigger value="leetcode" className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4" />
              <span>LeetCode</span>
            </TabsTrigger>
            <TabsTrigger value="faculty" className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span>Faculty</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <CardTitle>My Applications</CardTitle>
                <CardDescription>Track the status of all your OD requests</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="approved">Approved</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="all" className="space-y-4">
                    <RequestsTable 
                      requests={userRequests} 
                      getStatusBadge={getStatusBadge}
                      handleCertificateUpload={handleCertificateUpload}
                      formatTimePeriod={formatTimePeriod}
                      currentUser={user}
                    />
                  </TabsContent>
                  
                  <TabsContent value="pending" className="space-y-4">
                    <RequestsTable 
                      requests={userRequests.filter(req => 
                        ['submitted'].includes(req.status)
                      )} 
                      getStatusBadge={getStatusBadge}
                      handleCertificateUpload={handleCertificateUpload}
                      formatTimePeriod={formatTimePeriod}
                      currentUser={user}
                    />
                  </TabsContent>
                  
                  <TabsContent value="approved" className="space-y-4">
                    <ODDownloadInfo />
                    <RequestsTable 
                      requests={userRequests.filter(req => ['mentor_approved', 'completed', 'certificate_uploaded', 'certificate_approved'].includes(req.status))} 
                      getStatusBadge={getStatusBadge}
                      handleCertificateUpload={handleCertificateUpload}
                      formatTimePeriod={formatTimePeriod}
                      currentUser={user}
                    />
                  </TabsContent>
                  
                  <TabsContent value="rejected" className="space-y-4">
                    <RequestsTable 
                      requests={userRequests.filter(req => 
                        ['mentor_rejected'].includes(req.status)
                      )} 
                      getStatusBadge={getStatusBadge}
                      handleCertificateUpload={handleCertificateUpload}
                      formatTimePeriod={formatTimePeriod}
                      currentUser={user}
                    />
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="events">
            <Tabs defaultValue="discover" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="discover">
                  <Search className="h-4 w-4 mr-2" />
                  Discover Events
                </TabsTrigger>
                <TabsTrigger value="recommendations">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Recommendations
                </TabsTrigger>
              </TabsList>

              <TabsContent value="discover">
                <EventDiscovery 
                  userDepartment={user.department}
                  onApplyForOD={handleApplyForODFromEvent}
                />
              </TabsContent>

              <TabsContent value="recommendations">
                <EventRecommendations 
                  userDepartment={user.department}
                  onApplyForOD={handleApplyForODFromEvent}
                  userId={user.id}
                />
              </TabsContent>
            </Tabs>
          </TabsContent>

          <TabsContent value="wishlist">
            <WishlistManager userId={user.id} />
          </TabsContent>

          <TabsContent value="leetcode">
            <LeetCodeTracker userId={user.id} />
          </TabsContent>

          <TabsContent value="faculty">
            <FacultySearch faculty={faculty} />
          </TabsContent>
        </Tabs>

        {/* Event OD Form Dialog */}
        <Dialog open={showEventODForm} onOpenChange={setShowEventODForm}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <DialogHeader>
              <DialogTitle>Apply for OD - {selectedEvent?.title}</DialogTitle>
              <DialogDescription>
                Pre-filled details for {selectedEvent?.title}. You can modify the information as needed.
              </DialogDescription>
            </DialogHeader>
            <div className="overflow-y-auto flex-1 pr-2">
              {selectedEvent && (
                <ODRequestForm 
                  currentUser={user} 
                  onSubmit={(data) => {
                    handleNewRequest(data);
                    setShowEventODForm(false);
                    setSelectedEvent(null);
                  }}
                  prefillData={{
                    fromDate: selectedEvent.startDate,
                    toDate: selectedEvent.endDate,
                    reason: selectedEvent.category,
                    detailedReason: `${selectedEvent.title} organized by ${selectedEvent.organizer}`,
                    description: selectedEvent.description
                  }}
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}

function RequestsTable({ 
  requests, 
  getStatusBadge,
  handleCertificateUpload,
  formatTimePeriod,
  currentUser
}: { 
  requests: ODRequest[]; 
  getStatusBadge: (status: string) => React.ReactNode;
  handleCertificateUpload: (certificateData: Omit<Certificate, 'id'>) => void;
  formatTimePeriod: (odTime: string | string[]) => string;
  currentUser: User;
}) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No requests found
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date & Time</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Progress</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
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
            <TableCell>{getStatusBadge(request.status)}</TableCell>
            <TableCell>
              <StatusTracker status={request.status} />
            </TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                {request.status === 'certificate_approved' && (
                  <>
                    <ODLetterGenerator
                      odRequest={request}
                      currentUser={currentUser}
                    />
                    <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 border border-green-200 rounded-md">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-green-800">100% Complete</span>
                    </div>
                  </>
                )}
                
                {(request.status === 'completed' || 
                  (request.status === 'mentor_approved' && new Date() > new Date(request.toDate))) && (
                  <CertificateUpload 
                    odRequest={request}
                    onUpload={handleCertificateUpload}
                  />
                )}
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}