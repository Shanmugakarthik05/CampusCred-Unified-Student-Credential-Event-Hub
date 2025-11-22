import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Flag, CheckCircle, XCircle, AlertTriangle, Award } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { User, ODRequest } from '../App';

interface ExceptionListProps {
  odRequests: ODRequest[];
  setOdRequests: React.Dispatch<React.SetStateAction<ODRequest[]>>;
  allUsers: User[];
  department: string;
  hodName: string;
}

export function ExceptionList({ odRequests, setOdRequests, allUsers, department, hodName }: ExceptionListProps) {
  const [selectedRequest, setSelectedRequest] = useState<ODRequest | null>(null);
  const [exceptionDecision, setExceptionDecision] = useState<'approve' | 'reject' | null>(null);
  const [remarks, setRemarks] = useState('');
  
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
  
  // Get students who exceeded limit
  const departmentStudents = allUsers.filter(u => 
    u.role === 'student' && u.department === department
  );
  
  const studentsOverLimit = departmentStudents.map(student => {
    const studentODs = odRequests.filter(req => {
      const reqSemester = getSemesterForDate(req.submittedAt);
      return req.studentDetails.studentId === student.id &&
             reqSemester === currentSemester &&
             req.status !== 'mentor_rejected';
    });
    
    const approvedCount = studentODs.filter(req => 
      ['mentor_approved', 'hod_approved', 'principal_approved', 'completed', 'certificate_approved'].includes(req.status)
    ).length;
    
    const pendingOverLimit = studentODs.filter(req =>
      req.status === 'submitted' || req.status === 'mentor_approved'
    );
    
    return {
      student,
      totalODs: studentODs.length,
      approvedCount,
      pendingOverLimit: pendingOverLimit.filter((_, idx) => approvedCount + idx >= MAX_OD_LIMIT),
      isOverLimit: approvedCount >= MAX_OD_LIMIT,
    };
  }).filter(s => s.pendingOverLimit.length > 0);
  
  // Filter for special cases (prizes, awards, competitions)
  const specialCaseRequests = studentsOverLimit.flatMap(s => 
    s.pendingOverLimit.filter(req => {
      // Special cases: Won prize, hackathon, competition, conference
      const hasSpecialReason = 
        req.prizeInfo?.wonPrize ||
        req.reason.toLowerCase().includes('hackathon') ||
        req.reason.toLowerCase().includes('competition') ||
        req.reason.toLowerCase().includes('conference') ||
        req.reason.toLowerCase().includes('award');
      
      return hasSpecialReason && !req.exceptionReviewed;
    })
  );
  
  const handleExceptionDecision = () => {
    if (!selectedRequest || !exceptionDecision || !remarks.trim()) {
      toast.error('Please provide remarks for your decision');
      return;
    }
    
    setOdRequests(prev => prev.map(req =>
      req.id === selectedRequest.id
        ? {
            ...req,
            exceptionReviewed: true,
            exceptionApproved: exceptionDecision === 'approve',
            exceptionRemarks: remarks,
            exceptionReviewedBy: hodName,
            exceptionReviewedAt: new Date().toISOString(),
            status: exceptionDecision === 'approve' ? 'mentor_approved' : 'mentor_rejected',
            lastUpdated: new Date().toISOString(),
          }
        : req
    ));
    
    toast.success(
      exceptionDecision === 'approve' 
        ? 'Exception approved - OD limit waived' 
        : 'Exception denied - OD limit enforced'
    );
    
    setSelectedRequest(null);
    setExceptionDecision(null);
    setRemarks('');
  };
  
  // Get reviewed exceptions
  const reviewedExceptions = odRequests.filter(req =>
    req.studentDetails.department === department &&
    req.exceptionReviewed
  );
  
  return (
    <div className="space-y-6">
      {/* Alert */}
      <Alert className="border-orange-200 bg-orange-50">
        <Flag className="h-4 w-4 text-orange-600" />
        <AlertTitle className="text-orange-800">Special Case Review Required</AlertTitle>
        <AlertDescription className="text-orange-700">
          Students who exceeded the {MAX_OD_LIMIT} OD limit but have applied for events with special circumstances
          (prizes, competitions, conferences) require manual HOD review for exception approval.
        </AlertDescription>
      </Alert>
      
      {/* Special Cases Requiring Review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Award className="h-5 w-5 text-orange-600" />
            <span>Exception Cases - Manual Review Required</span>
          </CardTitle>
          <CardDescription>
            Students over OD limit with special cases (prizes, competitions, conferences)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {specialCaseRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No exception cases pending review</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>OD Count</TableHead>
                  <TableHead>Event Details</TableHead>
                  <TableHead>Special Case Reason</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {specialCaseRequests.map(request => {
                  const studentData = studentsOverLimit.find(s => 
                    s.student.id === request.studentDetails.studentId
                  );
                  
                  return (
                    <TableRow key={request.id}>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{request.studentDetails.studentName}</div>
                          <div className="text-sm text-muted-foreground">{request.studentDetails.rollNumber}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="destructive">
                          {studentData?.approvedCount}/{MAX_OD_LIMIT} (Over Limit)
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-semibold">{request.reason}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-xs">
                            {request.detailedReason}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Date: {new Date(request.fromDate).toLocaleDateString()}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {request.prizeInfo?.wonPrize && (
                            <Badge className="bg-yellow-100 text-yellow-800">
                              🏆 Prize: {request.prizeInfo.position}
                            </Badge>
                          )}
                          {request.prizeInfo?.cashPrize && request.prizeInfo.cashPrize > 0 && (
                            <div className="text-xs text-green-600">
                              Cash: ₹{request.prizeInfo.cashPrize}
                            </div>
                          )}
                          {(request.reason.toLowerCase().includes('hackathon') ||
                            request.reason.toLowerCase().includes('competition')) && (
                            <Badge className="bg-blue-100 text-blue-800">
                              Competition/Hackathon
                            </Badge>
                          )}
                          {request.reason.toLowerCase().includes('conference') && (
                            <Badge className="bg-purple-100 text-purple-800">
                              Conference
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          className="bg-orange-600 hover:bg-orange-700"
                          onClick={() => {
                            setSelectedRequest(request);
                            setExceptionDecision(null);
                            setRemarks('');
                          }}
                        >
                          <Flag className="h-4 w-4 mr-1" />
                          Review
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Exception Review History */}
      {reviewedExceptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Exception Review History</CardTitle>
            <CardDescription>Previously reviewed exception cases</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {reviewedExceptions.slice(0, 10).map(request => (
                <div 
                  key={request.id}
                  className={`p-4 border rounded-lg ${
                    request.exceptionApproved 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge className={request.exceptionApproved ? 'bg-green-600' : 'bg-red-600'}>
                          {request.exceptionApproved ? 'Exception Approved' : 'Exception Denied'}
                        </Badge>
                        <span className="font-semibold">{request.studentDetails.studentName}</span>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div><strong>Event:</strong> {request.reason}</div>
                        <div className="p-2 bg-white border rounded">
                          <strong>HOD Remarks:</strong>
                          <p className="mt-1 text-muted-foreground">{request.exceptionRemarks}</p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Reviewed by {request.exceptionReviewedBy} on {new Date(request.exceptionReviewedAt || '').toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Review Dialog */}
      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Flag className="h-5 w-5 text-orange-600" />
              <span>Review Exception Case</span>
            </DialogTitle>
            <DialogDescription>
              Decide whether to approve an exception for a student who exceeded the OD limit
            </DialogDescription>
          </DialogHeader>
          
          {selectedRequest && (
            <div className="space-y-4">
              {/* Student & Request Details */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><strong>Student:</strong> {selectedRequest.studentDetails.studentName}</div>
                  <div><strong>Roll:</strong> {selectedRequest.studentDetails.rollNumber}</div>
                  <div><strong>Event:</strong> {selectedRequest.reason}</div>
                  <div><strong>Date:</strong> {new Date(selectedRequest.fromDate).toLocaleDateString()}</div>
                </div>
                <div className="text-sm">
                  <strong>Details:</strong> {selectedRequest.detailedReason}
                </div>
              </div>
              
              {/* OD Limit Warning */}
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertTitle className="text-red-800">OD Limit Exceeded</AlertTitle>
                <AlertDescription className="text-red-700">
                  This student has already reached or exceeded the {MAX_OD_LIMIT} OD limit for this semester.
                </AlertDescription>
              </Alert>
              
              {/* Special Case Details */}
              {(selectedRequest.prizeInfo?.wonPrize || selectedRequest.reason.toLowerCase().includes('hackathon')) && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="font-semibold text-yellow-800 mb-2">🏆 Special Case Details:</div>
                  {selectedRequest.prizeInfo?.wonPrize && (
                    <div className="text-sm space-y-1">
                      <div><strong>Position:</strong> {selectedRequest.prizeInfo.position}</div>
                      {selectedRequest.prizeInfo.cashPrize > 0 && (
                        <div><strong>Cash Prize:</strong> ₹{selectedRequest.prizeInfo.cashPrize}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
              
              {/* Decision & Remarks */}
              <div className="space-y-4 p-4 border rounded-lg">
                <Label className="font-semibold">Exception Decision *</Label>
                <div className="flex space-x-3">
                  <Button
                    className={`flex-1 ${exceptionDecision === 'approve' ? 'bg-green-600' : 'bg-gray-200'}`}
                    onClick={() => setExceptionDecision('approve')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Approve Exception
                  </Button>
                  <Button
                    className={`flex-1 ${exceptionDecision === 'reject' ? 'bg-red-600' : 'bg-gray-200'}`}
                    onClick={() => setExceptionDecision('reject')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    Deny Exception
                  </Button>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="exception-remarks">Remarks (Required) *</Label>
                  <Textarea
                    id="exception-remarks"
                    placeholder="Provide detailed justification for your decision..."
                    value={remarks}
                    onChange={(e) => setRemarks(e.target.value)}
                    rows={4}
                  />
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button variant="outline" onClick={() => setSelectedRequest(null)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleExceptionDecision}
                  disabled={!exceptionDecision || !remarks.trim()}
                  className={exceptionDecision === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
                >
                  Confirm Decision
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
