import React from 'react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { AlertTriangle, Clock, Info, Code2 } from 'lucide-react';

interface ODNotificationBannerProps {
  type?: 'info' | 'warning' | 'error';
  className?: string;
}

export function ODNotificationBanner({ type = 'info', className = '' }: ODNotificationBannerProps) {
  const getIcon = () => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getStyles = () => {
    switch (type) {
      case 'warning':
        return 'border-amber-200 bg-amber-50 text-amber-800';
      case 'error':
        return 'border-red-200 bg-red-50 text-red-800';
      default:
        return 'border-blue-200 bg-blue-50 text-blue-800';
    }
  };

  return (
    <Alert className={`${getStyles()} ${className}`}>
      {getIcon()}
      <AlertTitle className="flex items-center space-x-2">
        <Clock className="h-4 w-4" />
        <span>Important: OD Submission Requirements</span>
      </AlertTitle>
      <AlertDescription className="mt-2">
        <div className="space-y-3">
          <div>
            <p className="font-medium mb-1">
              📅 Post-Event Submission Policy
            </p>
            <p className="text-sm">
              All OD requests must be submitted <strong>within 3 days after attending the event</strong>. 
              Late submissions will <strong>not be accepted</strong>.
            </p>
            <div className="text-xs mt-1 p-2 bg-white/60 rounded border">
              <strong>Example:</strong> If your event ended on Friday, submit your OD request by Monday (within 3 days).
            </div>
          </div>
          
          <div className="border-t pt-2">
            <p className="font-medium mb-1 flex items-center gap-2">
              <Code2 className="h-4 w-4" />
              💻 LeetCode Completion Requirement
            </p>
            <p className="text-sm">
              Before submitting an OD request, you must complete the <strong>current week's LeetCode problems</strong> based on your year:
            </p>
            <ul className="text-sm mt-2 ml-4 space-y-1 list-disc">
              <li><strong>1st Year:</strong> Easy problems</li>
              <li><strong>2nd Year:</strong> Easy + Medium problems</li>
              <li><strong>3rd & 4th Year:</strong> Easy + Medium + Hard problems</li>
            </ul>
            <p className="text-xs mt-2 p-2 bg-white/60 rounded border">
              💡 <strong>Tip:</strong> Track your progress in the \"LeetCode Weekly Tracker\" section of your dashboard.
            </p>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}