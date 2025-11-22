import React from 'react';
import { Progress } from './ui/progress';
import { CheckCircle, Clock, XCircle, ArrowRight } from 'lucide-react';

interface StatusTrackerProps {
  status: string;
}

export function StatusTracker({ status }: StatusTrackerProps) {
  const getProgress = () => {
    switch (status) {
      case 'submitted':
        return 20;
      case 'mentor_approved':
        return 40;
      case 'hod_approved':
        return 60;
      case 'principal_approved':
        return 80;
      case 'completed':
      case 'certificate_uploaded':
      case 'certificate_approved':
        return 100;
      case 'mentor_rejected':
      case 'hod_rejected':
      case 'principal_rejected':
        return 0;
      default:
        return 0;
    }
  };

  const getSteps = () => {
    const steps = [
      { label: 'Submitted', status: 'submitted', key: 'submitted' },
      { label: 'Mentor', status: 'mentor_approved', key: 'mentor' },
      { label: 'HOD', status: 'hod_approved', key: 'hod' },
      { label: 'Principal', status: 'principal_approved', key: 'principal' },
      { label: 'ERP Logged', status: 'completed', key: 'erp' }
    ];

    return steps.map((step, index) => {
      let stepStatus: 'completed' | 'current' | 'pending' | 'rejected' = 'pending';
      
      // Handle rejection states
      if (status === 'mentor_rejected') {
        stepStatus = index === 0 ? 'completed' : index === 1 ? 'rejected' : 'pending';
      } else if (status === 'hod_rejected') {
        stepStatus = index <= 1 ? 'completed' : index === 2 ? 'rejected' : 'pending';
      } else if (status === 'principal_rejected') {
        stepStatus = index <= 2 ? 'completed' : index === 3 ? 'rejected' : 'pending';
      }
      // Handle normal flow
      else if (status === 'submitted') {
        stepStatus = index === 0 ? 'current' : 'pending';
      } else if (status === 'mentor_approved') {
        stepStatus = index === 0 ? 'completed' : index === 1 ? 'current' : 'pending';
      } else if (status === 'hod_approved') {
        stepStatus = index <= 1 ? 'completed' : index === 2 ? 'current' : 'pending';
      } else if (status === 'principal_approved') {
        stepStatus = index <= 2 ? 'completed' : index === 3 ? 'current' : 'pending';
      } else if (status === 'completed' || status === 'certificate_uploaded' || status === 'certificate_approved') {
        stepStatus = 'completed';
      }
      
      return { ...step, stepStatus };
    });
  };

  const steps = getSteps();
  const progress = getProgress();
  const isRejected = status === 'mentor_rejected' || status === 'hod_rejected' || status === 'principal_rejected';

  return (
    <div className="w-full">
      {/* Step Indicators */}
      <div className="flex items-center justify-between mb-3">
        {steps.map((step, index) => (
          <React.Fragment key={step.key}>
            <div className="flex flex-col items-center flex-1">
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500
                ${step.stepStatus === 'completed' 
                  ? 'bg-green-500 border-green-500 text-white shadow-lg shadow-green-200 animate-pulse' 
                  : step.stepStatus === 'current'
                  ? 'bg-blue-500 border-blue-500 text-white shadow-lg shadow-blue-200 animate-pulse'
                  : step.stepStatus === 'rejected'
                  ? 'bg-red-500 border-red-500 text-white shadow-lg shadow-red-200'
                  : 'bg-gray-100 border-gray-300 text-gray-400'
              }`}>
                {step.stepStatus === 'completed' && <CheckCircle className="w-5 h-5" />}
                {step.stepStatus === 'current' && <Clock className="w-5 h-5 animate-spin" />}
                {step.stepStatus === 'rejected' && <XCircle className="w-5 h-5" />}
                {step.stepStatus === 'pending' && <span className="text-xs">{index + 1}</span>}
              </div>
              <span className={`text-xs mt-2 text-center transition-colors duration-300 ${
                step.stepStatus === 'completed' ? 'text-green-600' :
                step.stepStatus === 'current' ? 'text-blue-600' :
                step.stepStatus === 'rejected' ? 'text-red-600' :
                'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
            
            {/* Arrow between steps */}
            {index < steps.length - 1 && (
              <div className="flex items-center justify-center -mt-6">
                <ArrowRight className={`h-4 w-4 transition-colors duration-300 ${
                  steps[index].stepStatus === 'completed' ? 'text-green-500' :
                  steps[index].stepStatus === 'current' ? 'text-blue-500' :
                  'text-gray-300'
                }`} />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>
      
      {/* Progress Bar */}
      <Progress 
        value={progress} 
        className={`h-2 transition-all duration-500 ${
          isRejected ? '[&>div]:bg-red-500' : 
          status === 'completed' || status === 'certificate_approved' ? '[&>div]:bg-green-500' : 
          '[&>div]:bg-blue-500'
        }`}
      />
      
      {/* Status Message */}
      <div className={`text-xs text-center mt-2 transition-colors duration-300 ${
        isRejected ? 'text-red-600' :
        status === 'completed' || status === 'certificate_approved' ? 'text-green-600' :
        'text-blue-600'
      }`}>
        {isRejected ? '❌ Request Rejected' : 
         status === 'completed' || status === 'certificate_approved' ? '✅ Process Complete' :
         `⏳ ${progress}% Complete`}
      </div>
    </div>
  );
}
