import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ArrowRight, Users, UserCheck, Crown } from 'lucide-react';
import type { ODRequest } from '../App';

interface LiveODPipelineProps {
  odRequests: ODRequest[];
}

export function LiveODPipeline({ odRequests }: LiveODPipelineProps) {
  // Count requests at each stage
  const mentorPending = odRequests.filter(req => req.status === 'submitted').length;
  const hodPending = odRequests.filter(req => 
    req.status === 'mentor_approved' || req.status === 'completed'
  ).length;
  const principalReview = odRequests.filter(req => 
    req.status === 'certificate_uploaded'
  ).length;
  
  const stages = [
    {
      name: 'Mentor Review',
      icon: Users,
      count: mentorPending,
      color: 'bg-blue-100 text-blue-700',
      borderColor: 'border-blue-400',
      description: 'Initial approval'
    },
    {
      name: 'HOD Review',
      icon: UserCheck,
      count: hodPending,
      color: 'bg-purple-100 text-purple-700',
      borderColor: 'border-purple-400',
      description: 'Certificate verification'
    },
    {
      name: 'Principal Review',
      icon: Crown,
      count: principalReview,
      color: 'bg-amber-100 text-amber-700',
      borderColor: 'border-amber-400',
      description: 'Final approval'
    }
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Live OD Pipeline View</span>
        </CardTitle>
        <CardDescription>Real-time flow of applications at each approval level</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between space-x-4">
          {stages.map((stage, index) => (
            <React.Fragment key={stage.name}>
              <div className={`flex-1 border-2 ${stage.borderColor} rounded-lg p-6 ${stage.color} transition-all hover:shadow-md`}>
                <div className="flex items-center justify-between mb-4">
                  <stage.icon className="h-8 w-8" />
                  <Badge variant="secondary" className="text-xl px-3 py-1">
                    {stage.count}
                  </Badge>
                </div>
                <h3 className="font-semibold mb-1">{stage.name}</h3>
                <p className="text-sm opacity-80">{stage.description}</p>
                <div className="mt-3 pt-3 border-t border-current/20">
                  <p className="text-xs font-medium">
                    {stage.count} {stage.count === 1 ? 'request' : 'requests'} pending
                  </p>
                </div>
              </div>
              
              {index < stages.length - 1 && (
                <ArrowRight className="h-8 w-8 text-gray-400 flex-shrink-0" />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-semibold text-blue-600">{mentorPending}</div>
            <div className="text-sm text-muted-foreground">At Mentor Stage</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-purple-600">{hodPending}</div>
            <div className="text-sm text-muted-foreground">At HOD Stage</div>
          </div>
          <div>
            <div className="text-2xl font-semibold text-amber-600">{principalReview}</div>
            <div className="text-sm text-muted-foreground">At Principal Stage</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
