import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { AlertTriangle, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface SmartODLimitProps {
  currentCount: number;
  maxLimit: number;
  semester: string;
  isCompact?: boolean;
}

export function SmartODLimit({ currentCount, maxLimit, semester, isCompact = false }: SmartODLimitProps) {
  const [hasNotified, setHasNotified] = useState(false);
  const remaining = maxLimit - currentCount;
  const percentage = (currentCount / maxLimit) * 100;
  
  // Determine status
  const getStatus = () => {
    if (currentCount > maxLimit) return 'exceeded';
    if (currentCount === maxLimit) return 'at-limit';
    if (currentCount >= maxLimit - 1) return 'warning';
    return 'safe';
  };
  
  const status = getStatus();
  
  // Show notification when limit is reached or exceeded
  useEffect(() => {
    if (!hasNotified) {
      if (status === 'exceeded') {
        toast.error(
          '🚨 OD Limit Exceeded!',
          {
            description: `You have used ${currentCount}/${maxLimit} ODs this semester. Please consult with your mentor.`,
            duration: 8000,
          }
        );
        setHasNotified(true);
      } else if (status === 'at-limit') {
        toast.warning(
          '⚠️ OD Limit Reached!',
          {
            description: `You have reached the maximum limit of ${maxLimit} ODs for ${semester}.`,
            duration: 6000,
          }
        );
        setHasNotified(true);
      } else if (status === 'warning') {
        toast.warning(
          '⚠️ Approaching OD Limit',
          {
            description: `You have ${remaining} OD remaining for ${semester}. Use wisely!`,
            duration: 5000,
          }
        );
        setHasNotified(true);
      }
    }
  }, [status, currentCount, maxLimit, semester, remaining, hasNotified]);
  
  const getColor = () => {
    switch (status) {
      case 'exceeded':
        return {
          bg: 'bg-red-50 border-red-200',
          text: 'text-red-600',
          icon: 'text-red-600',
          progress: '[&>div]:bg-red-500',
          badge: 'bg-red-100 text-red-800 border-red-300'
        };
      case 'at-limit':
        return {
          bg: 'bg-orange-50 border-orange-200',
          text: 'text-orange-600',
          icon: 'text-orange-600',
          progress: '[&>div]:bg-orange-500',
          badge: 'bg-orange-100 text-orange-800 border-orange-300'
        };
      case 'warning':
        return {
          bg: 'bg-yellow-50 border-yellow-200',
          text: 'text-yellow-700',
          icon: 'text-yellow-600',
          progress: '[&>div]:bg-yellow-500',
          badge: 'bg-yellow-100 text-yellow-800 border-yellow-300'
        };
      default:
        return {
          bg: 'bg-green-50 border-green-200',
          text: 'text-green-600',
          icon: 'text-green-600',
          progress: '[&>div]:bg-green-500',
          badge: 'bg-green-100 text-green-800 border-green-300'
        };
    }
  };
  
  const colors = getColor();
  
  const getIcon = () => {
    switch (status) {
      case 'exceeded':
      case 'at-limit':
        return <AlertTriangle className={`h-5 w-5 ${colors.icon}`} />;
      case 'warning':
        return <AlertCircle className={`h-5 w-5 ${colors.icon}`} />;
      default:
        return <CheckCircle2 className={`h-5 w-5 ${colors.icon}`} />;
    }
  };
  
  const getMessage = () => {
    if (status === 'exceeded') {
      return `${currentCount - maxLimit} over limit`;
    }
    if (status === 'at-limit') {
      return 'Limit reached';
    }
    return `${remaining} remaining`;
  };

  if (isCompact) {
    return (
      <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 ${colors.bg} transition-all duration-300`}>
        {getIcon()}
        <div className="flex-1">
          <div className={`text-sm ${colors.text}`}>
            <span className="font-semibold">{currentCount}/{maxLimit}</span> ODs Used
          </div>
          <div className="text-xs text-muted-foreground">{getMessage()}</div>
        </div>
      </div>
    );
  }

  return (
    <Card className={`border-2 ${colors.bg} transition-all duration-300 hover:shadow-lg`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center space-x-2">
            {getIcon()}
            <span>OD Limit Tracker</span>
          </CardTitle>
          <div className={`px-2 py-1 rounded-md border ${colors.badge} text-xs`}>
            {semester}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Main Counter */}
        <div className="flex items-baseline justify-center space-x-2">
          <div className={`text-4xl ${colors.text} transition-all duration-300`}>
            {currentCount}
          </div>
          <div className="text-2xl text-muted-foreground">/</div>
          <div className="text-2xl text-muted-foreground">{maxLimit}</div>
        </div>
        
        {/* Status Message */}
        <div className={`text-center text-sm ${colors.text}`}>
          {getMessage()}
        </div>
        
        {/* Progress Bar */}
        <div className="space-y-1">
          <Progress 
            value={Math.min(percentage, 100)} 
            className={`h-3 transition-all duration-500 ${colors.progress}`}
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>0 ODs</span>
            <span className={colors.text}>{percentage.toFixed(0)}%</span>
            <span>{maxLimit} ODs</span>
          </div>
        </div>
        
        {/* Warning Messages */}
        {status === 'exceeded' && (
          <div className="text-xs text-red-700 bg-red-100 p-2 rounded border border-red-300">
            ⚠️ You have exceeded your OD limit. Please contact your mentor and HOD immediately.
          </div>
        )}
        
        {status === 'at-limit' && (
          <div className="text-xs text-orange-700 bg-orange-100 p-2 rounded border border-orange-300">
            ⚠️ You have reached the maximum OD limit. Any additional requests may require special approval.
          </div>
        )}
        
        {status === 'warning' && (
          <div className="text-xs text-yellow-700 bg-yellow-100 p-2 rounded border border-yellow-300">
            ⚠️ You are approaching your OD limit. Plan your remaining ODs carefully.
          </div>
        )}
        
        {status === 'safe' && (
          <div className="text-xs text-green-700 bg-green-100 p-2 rounded border border-green-300">
            ✅ You are within your OD limit. {remaining} ODs remaining for this semester.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
