import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { AlertCircle, TrendingUp, Clock, Zap } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { ODRequest } from '../App';

interface AutoEscalationSystemProps {
  odRequests: ODRequest[];
  setOdRequests: React.Dispatch<React.SetStateAction<ODRequest[]>>;
  department: string;
}

export function AutoEscalationSystem({ odRequests, setOdRequests, department }: AutoEscalationSystemProps) {
  const ESCALATION_THRESHOLD_HOURS = 24;
  
  // Get escalated requests
  const escalatedRequests = odRequests.filter(req =>
    req.studentDetails.department === department &&
    req.autoEscalated === true
  );
  
  // Get requests pending mentor action for >24 hours
  const pendingEscalation = odRequests.filter(req => {
    if (req.studentDetails.department !== department) return false;
    if (req.status !== 'submitted') return false;
    
    const submittedTime = new Date(req.submittedAt).getTime();
    const now = new Date().getTime();
    const hoursPending = (now - submittedTime) / (1000 * 60 * 60);
    
    return hoursPending > ESCALATION_THRESHOLD_HOURS && !req.autoEscalated;
  });
  
  const formatPendingTime = (submittedAt: string) => {
    const hours = (new Date().getTime() - new Date(submittedAt).getTime()) / (1000 * 60 * 60);
    
    if (hours < 24) {
      return `${Math.floor(hours)} hours`;
    }
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return `${days} day${days > 1 ? 's' : ''} ${remainingHours}h`;
  };
  
  // Auto-escalate pending requests
  useEffect(() => {
    if (pendingEscalation.length > 0) {
      const escalateRequests = () => {
        setOdRequests(prev => prev.map(req => {
          const shouldEscalate = pendingEscalation.find(er => er.id === req.id);
          if (shouldEscalate) {
            return {
              ...req,
              autoEscalated: true,
              escalatedAt: new Date().toISOString(),
              escalationReason: `Mentor did not act within ${ESCALATION_THRESHOLD_HOURS} hours`,
            };
          }
          return req;
        }));
        
        toast.warning('Auto-Escalation Triggered', {
          description: `${pendingEscalation.length} request${pendingEscalation.length > 1 ? 's have' : ' has'} been auto-escalated to HOD due to mentor inaction`,
          duration: 8000,
        });
      };
      
      // Check if we should escalate (once per session)
      const escalationKey = `escalated-${new Date().toDateString()}`;
      const hasEscalatedToday = sessionStorage.getItem(escalationKey);
      
      if (!hasEscalatedToday) {
        escalateRequests();
        sessionStorage.setItem(escalationKey, 'true');
      }
    }
  }, [pendingEscalation.length, setOdRequests]);
  
  return (
    <div className="space-y-6">
      {/* Info Alert */}
      <Alert className="border-blue-200 bg-blue-50">
        <Zap className="h-4 w-4 text-blue-600" />
        <AlertTitle className="text-blue-800">Auto-Escalation System Active</AlertTitle>
        <AlertDescription className="text-blue-700">
          OD requests that remain pending with mentors for more than {ESCALATION_THRESHOLD_HOURS} hours are
          automatically escalated to HOD level with a notification. This ensures timely processing.
        </AlertDescription>
      </Alert>
      
      {/* Pending Escalation Warning */}
      {pendingEscalation.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">
            ⚠️ {pendingEscalation.length} Request{pendingEscalation.length > 1 ? 's' : ''} Approaching Auto-Escalation
          </AlertTitle>
          <AlertDescription className="text-orange-700">
            These requests will be auto-escalated if mentors don't act soon.
          </AlertDescription>
        </Alert>
      )}
      
      {/* Auto-Escalated Requests */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5 text-red-600" />
            <span>Auto-Escalated Requests</span>
            {escalatedRequests.length > 0 && (
              <Badge variant="destructive">{escalatedRequests.length}</Badge>
            )}
          </CardTitle>
          <CardDescription>
            Requests escalated to HOD due to mentor inaction ({'>'}24 hours)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {escalatedRequests.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p>No auto-escalated requests</p>
              <p className="text-xs mt-2">All mentors are responding within the time limit</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead>Pending Duration</TableHead>
                  <TableHead>Escalation Note</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {escalatedRequests.map(request => (
                  <TableRow key={request.id} className="bg-red-50">
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
                        {new Date(request.submittedAt).toLocaleDateString()}
                        <div className="text-xs text-muted-foreground">
                          {new Date(request.submittedAt).toLocaleTimeString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatPendingTime(request.submittedAt)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <div className="flex items-center space-x-1 text-xs text-red-700">
                          <Zap className="h-3 w-3" />
                          <span className="font-semibold">Auto-Escalated</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {request.escalationReason}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Escalated: {new Date(request.escalatedAt || '').toLocaleString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-orange-100 text-orange-800">
                        {request.status === 'submitted' ? 'Awaiting HOD Action' : request.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Total Escalated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{escalatedRequests.length}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Approaching Escalation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{pendingEscalation.length}</div>
            <p className="text-xs text-muted-foreground">Pending &gt; {ESCALATION_THRESHOLD_HOURS}h</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Escalation Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">
              {odRequests.filter(r => r.studentDetails.department === department).length > 0
                ? ((escalatedRequests.length / odRequests.filter(r => r.studentDetails.department === department).length) * 100).toFixed(1)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Of total requests</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Mentor Performance Alert */}
      {escalatedRequests.length > 5 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">High Escalation Rate Detected</AlertTitle>
          <AlertDescription className="text-red-700">
            The department has a high number of auto-escalated requests. Consider reviewing mentor
            responsiveness and workload distribution.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
