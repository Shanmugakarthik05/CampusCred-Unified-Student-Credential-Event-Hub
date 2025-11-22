import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { ShieldCheck, AlertTriangle, FileText, CheckCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { User, ODRequest } from '../App';

interface HODOverrideSystemProps {
  odRequests: ODRequest[];
  setOdRequests: React.Dispatch<React.SetStateAction<ODRequest[]>>;
  department: string;
  hodName: string;
}

export function HODOverrideSystem({ odRequests, setOdRequests, department, hodName }: HODOverrideSystemProps) {
  const [selectedRequest, setSelectedRequest] = useState<ODRequest | null>(null);
  const [overrideJustification, setOverrideJustification] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Get all rejected requests in the department
  const rejectedRequests = odRequests.filter(req =>
    req.studentDetails.department === department &&
    req.status === 'mentor_rejected'
  );
  
  const handleOverride = () => {
    if (!selectedRequest || !overrideJustification.trim()) {
      toast.error('Please provide justification for the override');
      return;
    }
    
    setOdRequests(prev => prev.map(req =>
      req.id === selectedRequest.id
        ? {
            ...req,
            status: 'mentor_approved', // Override to approved
            hodOverride: {
              overriddenBy: hodName,
              overriddenAt: new Date().toISOString(),
              justification: overrideJustification,
              originalStatus: 'mentor_rejected',
              originalRejectionReason: req.rejectionReason,
            },
            lastUpdated: new Date().toISOString(),
          }
        : req
    ));
    
    toast.success('Mentor rejection overridden successfully', {
      description: `${selectedRequest.studentDetails.studentName}'s OD request has been approved via HOD override`,
    });
    
    setSelectedRequest(null);
    setOverrideJustification('');
    setIsDialogOpen(false);
  };
  
  // Get previously overridden requests
  const overriddenRequests = odRequests.filter(req =>
    req.studentDetails.department === department &&
    req.hodOverride
  );
  
  return (
    <div className="space-y-6">
      {/* Alert */}
      <Alert className="border-purple-200 bg-purple-50">
        <ShieldCheck className="h-4 w-4 text-purple-600" />
        <AlertTitle className="text-purple-800">HOD Override Authority</AlertTitle>
        <AlertDescription className="text-purple-700">
          As HOD, you have the authority to override mentor rejections with proper justification.
          All overrides are logged for audit purposes.
        </AlertDescription>
      </Alert>
      
      {/* Rejected Requests Available for Override */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span>Mentor-Rejected Requests</span>
          </CardTitle>
          <CardDescription>
            These requests were rejected by mentors and are available for HOD override
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rejectedRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No rejected requests requiring review</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Event/Reason</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Mentor Rejection Reason</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rejectedRequests.map(request => (
                  <TableRow key={request.id}>
                    <TableCell>
                      <div>
                        <div className="font-semibold">{request.studentDetails.studentName}</div>
                        <div className="text-sm text-muted-foreground">{request.studentDetails.rollNumber}</div>
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
                        {new Date(request.fromDate).toLocaleDateString()}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <Badge variant="destructive" className="mb-1">Rejected</Badge>
                        <div className="text-sm text-muted-foreground">
                          {request.rejectionReason || 'No reason provided'}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Dialog open={isDialogOpen && selectedRequest?.id === request.id} onOpenChange={(open) => {
                        setIsDialogOpen(open);
                        if (!open) {
                          setSelectedRequest(null);
                          setOverrideJustification('');
                        }
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsDialogOpen(true);
                            }}
                          >
                            <ShieldCheck className="h-4 w-4 mr-1" />
                            Override
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle className="flex items-center space-x-2">
                              <ShieldCheck className="h-5 w-5 text-purple-600" />
                              <span>HOD Override - Approve Rejected Request</span>
                            </DialogTitle>
                            <DialogDescription>
                              Override mentor rejection with proper justification
                            </DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            {/* Request Details */}
                            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
                              <div><strong>Student:</strong> {request.studentDetails.studentName}</div>
                              <div><strong>Roll Number:</strong> {request.studentDetails.rollNumber}</div>
                              <div><strong>Event:</strong> {request.reason}</div>
                              <div><strong>Date:</strong> {new Date(request.fromDate).toLocaleDateString()}</div>
                              <div><strong>Details:</strong> {request.detailedReason}</div>
                            </div>
                            
                            {/* Mentor's Rejection Reason */}
                            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                              <div className="flex items-center space-x-2 mb-2">
                                <AlertTriangle className="h-4 w-4 text-red-600" />
                                <span className="font-semibold text-red-800">Mentor Rejection Reason:</span>
                              </div>
                              <div className="text-sm text-red-700">
                                {request.rejectionReason || 'No reason provided'}
                              </div>
                            </div>
                            
                            {/* Override Justification */}
                            <div className="space-y-2">
                              <Label htmlFor="override-justification" className="text-purple-800 font-semibold">
                                HOD Override Justification (Required) *
                              </Label>
                              <Textarea
                                id="override-justification"
                                placeholder="Provide detailed justification for overriding the mentor's rejection. This will be logged for audit purposes."
                                value={overrideJustification}
                                onChange={(e) => setOverrideJustification(e.target.value)}
                                rows={4}
                                className="border-purple-300 focus:border-purple-500"
                              />
                              <p className="text-xs text-muted-foreground">
                                ⚠️ This action will be recorded with your name and timestamp for accountability.
                              </p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-2 pt-4 border-t">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setIsDialogOpen(false);
                                  setSelectedRequest(null);
                                  setOverrideJustification('');
                                }}
                              >
                                Cancel
                              </Button>
                              <Button
                                className="bg-purple-600 hover:bg-purple-700"
                                onClick={handleOverride}
                                disabled={!overrideJustification.trim()}
                              >
                                <ShieldCheck className="h-4 w-4 mr-2" />
                                Confirm Override & Approve
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Override History */}
      {overriddenRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-purple-600" />
              <span>Override History</span>
            </CardTitle>
            <CardDescription>
              Record of all HOD overrides for audit purposes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overriddenRequests.map(request => (
                <div key={request.id} className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-purple-600">Override</Badge>
                        <span className="font-semibold">{request.studentDetails.studentName}</span>
                        <span className="text-sm text-muted-foreground">({request.studentDetails.rollNumber})</span>
                      </div>
                      
                      <div className="text-sm space-y-1">
                        <div><strong>Event:</strong> {request.reason}</div>
                        <div><strong>Original Rejection:</strong> {request.hodOverride?.originalRejectionReason}</div>
                        <div className="p-2 bg-white border border-purple-200 rounded">
                          <strong>HOD Justification:</strong>
                          <p className="mt-1 text-muted-foreground">{request.hodOverride?.justification}</p>
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground flex items-center space-x-4">
                        <span>Overridden by: {request.hodOverride?.overriddenBy}</span>
                        <span>Date: {new Date(request.hodOverride?.overriddenAt || '').toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
