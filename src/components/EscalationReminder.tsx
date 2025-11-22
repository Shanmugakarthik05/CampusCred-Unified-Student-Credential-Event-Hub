import React, { useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { ODRequest } from '../App';

interface EscalationReminderProps {
  pendingRequests: ODRequest[];
  mentorId: string;
}

export function EscalationReminder({ pendingRequests, mentorId }: EscalationReminderProps) {
  const ESCALATION_THRESHOLD_HOURS = 24;
  
  // Calculate pending time for each request
  const getHoursPending = (submittedAt: string) => {
    const submitted = new Date(submittedAt);
    const now = new Date();
    const diffMs = now.getTime() - submitted.getTime();
    return diffMs / (1000 * 60 * 60); // Convert to hours
  };
  
  // Filter requests pending > 24 hours
  const overdueRequests = pendingRequests.filter(req => {
    const hoursPending = getHoursPending(req.submittedAt);
    return hoursPending > ESCALATION_THRESHOLD_HOURS;
  });
  
  // Filter requests pending > 12 hours (warning)
  const warningRequests = pendingRequests.filter(req => {
    const hoursPending = getHoursPending(req.submittedAt);
    return hoursPending > 12 && hoursPending <= ESCALATION_THRESHOLD_HOURS;
  });
  
  // Show toast notification for overdue requests
  useEffect(() => {
    if (overdueRequests.length > 0) {
      const hasShownToday = localStorage.getItem(`escalation-notified-${mentorId}-${new Date().toDateString()}`);
      
      if (!hasShownToday) {
        toast.error(
          '⚠️ Urgent: Overdue Approvals',
          {
            description: `You have ${overdueRequests.length} OD request${overdueRequests.length > 1 ? 's' : ''} pending for more than 24 hours. Please review to maintain workflow speed.`,
            duration: 10000,
          }
        );
        
        localStorage.setItem(`escalation-notified-${mentorId}-${new Date().toDateString()}`, 'true');
      }
    }
  }, [overdueRequests.length, mentorId]);
  
  const formatPendingTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.floor(hours * 60)} minutes`;
    } else if (hours < 24) {
      return `${Math.floor(hours)} hours`;
    } else {
      const days = Math.floor(hours / 24);
      const remainingHours = Math.floor(hours % 24);
      return `${days} day${days > 1 ? 's' : ''}${remainingHours > 0 ? ` ${remainingHours}h` : ''}`;
    }
  };
  
  if (overdueRequests.length === 0 && warningRequests.length === 0) {
    return null;
  }
  
  return (
    <div className="space-y-3">
      {/* Critical Alert - Overdue > 24 hours */}
      {overdueRequests.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800 flex items-center justify-between">
            <span>🚨 Urgent: Overdue Approvals</span>
            <Badge variant="destructive">{overdueRequests.length}</Badge>
          </AlertTitle>
          <AlertDescription className="text-red-700 space-y-2 mt-2">
            <p>The following requests have been pending for more than 24 hours:</p>
            <div className="space-y-2 mt-2">
              {overdueRequests.map(req => (
                <div 
                  key={req.id}
                  className="flex items-center justify-between p-2 bg-red-100 rounded text-sm"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{req.studentDetails.studentName}</div>
                    <div className="text-xs">{req.reason}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="destructive" className="text-xs">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatPendingTime(getHoursPending(req.submittedAt))}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs mt-2">⚡ Quick action required to maintain workflow efficiency</p>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Warning Alert - Approaching 24 hours */}
      {warningRequests.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <Clock className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800 flex items-center justify-between">
            <span>⏰ Approaching Deadline</span>
            <Badge className="bg-orange-100 text-orange-800">{warningRequests.length}</Badge>
          </AlertTitle>
          <AlertDescription className="text-orange-700 space-y-2 mt-2">
            <p>These requests will become overdue soon:</p>
            <div className="space-y-2 mt-2">
              {warningRequests.map(req => (
                <div 
                  key={req.id}
                  className="flex items-center justify-between p-2 bg-orange-100 rounded text-sm"
                >
                  <div className="flex-1">
                    <div className="font-semibold">{req.studentDetails.studentName}</div>
                    <div className="text-xs">{req.reason}</div>
                  </div>
                  <Badge className="bg-orange-200 text-orange-900 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatPendingTime(getHoursPending(req.submittedAt))}
                  </Badge>
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Summary Statistics */}
      <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center space-x-2 text-sm text-blue-800">
          <Clock className="h-4 w-4" />
          <span>Average pending time: {formatPendingTime(
            pendingRequests.reduce((sum, req) => sum + getHoursPending(req.submittedAt), 0) / 
            (pendingRequests.length || 1)
          )}</span>
        </div>
        <div className="text-xs text-blue-600">
          Target: &lt; 24 hours
        </div>
      </div>
    </div>
  );
}
