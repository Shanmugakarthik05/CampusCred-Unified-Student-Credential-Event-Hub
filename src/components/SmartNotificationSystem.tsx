import React, { useEffect, useRef } from 'react';
import { toast } from 'sonner@2.0.3';
import { CheckCircle, XCircle, Clock, AlertCircle, Bell } from 'lucide-react';

interface SmartNotificationSystemProps {
  odRequests: any[];
  userId: string;
}

export function SmartNotificationSystem({ odRequests, userId }: SmartNotificationSystemProps) {
  const previousRequestsRef = useRef<any[]>([]);
  
  useEffect(() => {
    // Get user's requests
    const userRequests = odRequests.filter(req => req.studentDetails.studentId === userId);
    const previousRequests = previousRequestsRef.current;
    
    // Check for status changes
    userRequests.forEach(request => {
      const previousRequest = previousRequests.find(prev => prev.id === request.id);
      
      // If request exists and status changed
      if (previousRequest && previousRequest.status !== request.status) {
        handleStatusChange(request, previousRequest.status);
      }
    });
    
    // Update ref
    previousRequestsRef.current = userRequests;
  }, [odRequests, userId]);
  
  const handleStatusChange = (request: any, previousStatus: string) => {
    const newStatus = request.status;
    
    // Get readable event name
    const eventName = request.detailedReason || request.reason || 'OD Request';
    
    // Notification based on new status
    switch (newStatus) {
      case 'mentor_approved':
        toast.success(
          '✅ Mentor Approved!',
          {
            description: `Your OD for "${eventName}" has been approved by your mentor and moved to HOD review.`,
            icon: <CheckCircle className="h-5 w-5 text-green-600" />,
            duration: 6000,
          }
        );
        break;
        
      case 'hod_approved':
        toast.success(
          '✅ HOD Approved!',
          {
            description: `Your OD for "${eventName}" has been approved by HOD and moved to Principal review.`,
            icon: <CheckCircle className="h-5 w-5 text-green-600" />,
            duration: 6000,
          }
        );
        break;
        
      case 'principal_approved':
        toast.success(
          '✅ Principal Approved!',
          {
            description: `Your OD for "${eventName}" has been approved by Principal and is ready for ERP logging.`,
            icon: <CheckCircle className="h-5 w-5 text-green-600" />,
            duration: 6000,
          }
        );
        break;
        
      case 'completed':
        toast.success(
          '🎉 OD Approved & Logged!',
          {
            description: `Your OD for "${eventName}" has been successfully logged in the ERP system. You can now download your OD letter.`,
            icon: <CheckCircle className="h-5 w-5 text-green-600" />,
            duration: 8000,
          }
        );
        break;
        
      case 'certificate_uploaded':
        toast.info(
          '📄 Certificate Uploaded',
          {
            description: `Certificate for "${eventName}" uploaded successfully. Awaiting HOD approval.`,
            icon: <Clock className="h-5 w-5 text-blue-600" />,
            duration: 5000,
          }
        );
        break;
        
      case 'certificate_approved':
        toast.success(
          '✅ Certificate Approved!',
          {
            description: `Certificate for "${eventName}" has been approved. Process complete!`,
            icon: <CheckCircle className="h-5 w-5 text-green-600" />,
            duration: 6000,
          }
        );
        break;
        
      case 'mentor_rejected':
        toast.error(
          '❌ Mentor Rejected',
          {
            description: `Your OD for "${eventName}" has been rejected by your mentor. ${request.rejectionReason ? `Reason: ${request.rejectionReason}` : 'Please contact your mentor for details.'}`,
            icon: <XCircle className="h-5 w-5 text-red-600" />,
            duration: 8000,
          }
        );
        break;
        
      case 'hod_rejected':
        toast.error(
          '❌ HOD Rejected',
          {
            description: `Your OD for "${eventName}" has been rejected by HOD. ${request.rejectionReason ? `Reason: ${request.rejectionReason}` : 'Please contact your HOD for details.'}`,
            icon: <XCircle className="h-5 w-5 text-red-600" />,
            duration: 8000,
          }
        );
        break;
        
      case 'principal_rejected':
        toast.error(
          '❌ Principal Rejected',
          {
            description: `Your OD for "${eventName}" has been rejected by Principal. ${request.rejectionReason ? `Reason: ${request.rejectionReason}` : 'Please contact the Principal office for details.'}`,
            icon: <XCircle className="h-5 w-5 text-red-600" />,
            duration: 8000,
          }
        );
        break;
        
      default:
        // Generic notification for other status changes
        toast.info(
          '🔔 Status Update',
          {
            description: `Your OD for "${eventName}" status has been updated.`,
            icon: <Bell className="h-5 w-5 text-blue-600" />,
            duration: 5000,
          }
        );
    }
  };
  
  // This component doesn't render anything, it just handles notifications
  return null;
}

// Export helper function for manual notifications
export const notifyStatusChange = (status: string, eventName: string, rejectionReason?: string) => {
  switch (status) {
    case 'mentor_approved':
      toast.success(
        '✅ Mentor Approved!',
        {
          description: `Your OD for "${eventName}" has been approved by your mentor.`,
          duration: 6000,
        }
      );
      break;
      
    case 'hod_approved':
      toast.success(
        '✅ HOD Approved!',
        {
          description: `Your OD for "${eventName}" has been approved by HOD.`,
          duration: 6000,
        }
      );
      break;
      
    case 'principal_approved':
      toast.success(
        '✅ Principal Approved!',
        {
          description: `Your OD for "${eventName}" has been approved by Principal.`,
          duration: 6000,
        }
      );
      break;
      
    case 'completed':
      toast.success(
        '🎉 OD Complete!',
        {
          description: `Your OD for "${eventName}" is complete and logged in ERP.`,
          duration: 8000,
        }
      );
      break;
      
    default:
      break;
  }
};
