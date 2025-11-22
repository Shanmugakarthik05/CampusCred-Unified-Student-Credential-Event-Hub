import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { AlertTriangle, Bell, BellOff, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { ODRequest, User } from '../App';
import { ALL_DEPARTMENTS } from '../App';

interface PolicyAlertSystemProps {
  odRequests: ODRequest[];
  allUsers: User[];
}

interface DepartmentAlert {
  department: string;
  issue: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  details: string;
}

export function PolicyAlertSystem({ odRequests, allUsers }: PolicyAlertSystemProps) {
  const [alerts, setAlerts] = useState<DepartmentAlert[]>([]);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Calculate OD limits for students
  const OD_LIMIT_PER_SEMESTER = 5;

  useEffect(() => {
    const newAlerts: DepartmentAlert[] = [];

    // Ensure we have valid arrays before proceeding
    if (!Array.isArray(odRequests) || !Array.isArray(allUsers)) {
      return;
    }

    // Check each department for policy violations
    ALL_DEPARTMENTS.forEach(dept => {
      const deptRequests = odRequests.filter(req => req.studentDetails?.department === dept);
      const deptStudents = allUsers.filter(u => u.role === 'student' && u.department === dept);

      // Alert 1: Department exceeding average OD limit
      const avgODsPerStudent = deptStudents.length > 0 ? deptRequests.length / deptStudents.length : 0;
      if (avgODsPerStudent > OD_LIMIT_PER_SEMESTER) {
        newAlerts.push({
          department: dept,
          issue: 'Exceeding OD Limits',
          severity: 'high',
          count: Math.round(avgODsPerStudent),
          details: `Average ${avgODsPerStudent.toFixed(1)} ODs per student (limit: ${OD_LIMIT_PER_SEMESTER})`
        });
      }

      // Alert 2: High rejection rate
      const rejectedCount = deptRequests.filter(req => req.status === 'mentor_rejected').length;
      const rejectionRate = deptRequests.length > 0 ? (rejectedCount / deptRequests.length) * 100 : 0;
      if (rejectionRate > 30 && deptRequests.length >= 5) {
        newAlerts.push({
          department: dept,
          issue: 'High Rejection Rate',
          severity: 'medium',
          count: Math.round(rejectionRate),
          details: `${rejectionRate.toFixed(0)}% of OD requests are rejected`
        });
      }

      // Alert 3: Students repeatedly exceeding limits
      const studentODCounts = deptRequests.reduce((acc, req) => {
        if (req.studentDetails?.studentId) {
          acc[req.studentDetails.studentId] = (acc[req.studentDetails.studentId] || 0) + 1;
        }
        return acc;
      }, {} as Record<string, number>);

      const studentsExceedingLimit = Object.values(studentODCounts).filter(count => count > OD_LIMIT_PER_SEMESTER).length;
      if (studentsExceedingLimit > 0) {
        newAlerts.push({
          department: dept,
          issue: 'Students Exceeding Limits',
          severity: studentsExceedingLimit > 5 ? 'critical' : 'high',
          count: studentsExceedingLimit,
          details: `${studentsExceedingLimit} student${studentsExceedingLimit > 1 ? 's' : ''} exceeded ${OD_LIMIT_PER_SEMESTER} OD limit`
        });
      }

      // Alert 4: Unusual spike in OD requests
      const recentRequests = deptRequests.filter(req => {
        const daysSinceSubmit = (Date.now() - new Date(req.submittedAt).getTime()) / (1000 * 60 * 60 * 24);
        return daysSinceSubmit <= 7;
      });
      const recentVsTotal = deptRequests.length > 0 ? (recentRequests.length / deptRequests.length) * 100 : 0;
      if (recentVsTotal > 40 && recentRequests.length >= 5) {
        newAlerts.push({
          department: dept,
          issue: 'Unusual Spike in Requests',
          severity: 'medium',
          count: recentRequests.length,
          details: `${recentRequests.length} requests in the last 7 days (${recentVsTotal.toFixed(0)}% of total)`
        });
      }

      // Alert 5: Pending requests piling up
      const pendingRequests = deptRequests.filter(req => req.status === 'submitted');
      if (pendingRequests.length > 10) {
        newAlerts.push({
          department: dept,
          issue: 'Pending Requests Backlog',
          severity: pendingRequests.length > 20 ? 'high' : 'medium',
          count: pendingRequests.length,
          details: `${pendingRequests.length} requests awaiting mentor approval`
        });
      }
    });

    setAlerts(newAlerts);
  }, [odRequests, allUsers]);

  // Show notification when new critical alerts appear
  useEffect(() => {
    if (notificationsEnabled) {
      const criticalAlerts = alerts.filter(a => 
        a.severity === 'critical' && !dismissedAlerts.has(`${a.department}-${a.issue}`)
      );
      
      if (criticalAlerts.length > 0) {
        toast.error(`${criticalAlerts.length} critical policy alert${criticalAlerts.length > 1 ? 's' : ''} detected!`, {
          description: 'Check the Policy Alert System for details'
        });
      }
    }
  }, [alerts, notificationsEnabled, dismissedAlerts]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 border-red-500 text-red-900';
      case 'high': return 'bg-orange-100 border-orange-500 text-orange-900';
      case 'medium': return 'bg-yellow-100 border-yellow-500 text-yellow-900';
      case 'low': return 'bg-blue-100 border-blue-500 text-blue-900';
      default: return 'bg-gray-100 border-gray-500 text-gray-900';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <XCircle className="h-5 w-5" />;
      case 'medium':
        return <AlertTriangle className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
    }
  };

  const dismissAlert = (alert: DepartmentAlert) => {
    const alertKey = `${alert.department}-${alert.issue}`;
    setDismissedAlerts(prev => new Set(prev).add(alertKey));
    toast.success('Alert dismissed');
  };

  const activeAlerts = alerts.filter(a => !dismissedAlerts.has(`${a.department}-${a.issue}`));
  const criticalCount = activeAlerts.filter(a => a.severity === 'critical').length;
  const highCount = activeAlerts.filter(a => a.severity === 'high').length;
  const mediumCount = activeAlerts.filter(a => a.severity === 'medium').length;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Policy Alert System</span>
            </CardTitle>
            <CardDescription>Notifications when departments repeatedly exceed limits</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNotificationsEnabled(!notificationsEnabled);
              toast.success(`Notifications ${!notificationsEnabled ? 'enabled' : 'disabled'}`);
            }}
          >
            {notificationsEnabled ? (
              <><Bell className="h-4 w-4 mr-2" /> Enabled</>
            ) : (
              <><BellOff className="h-4 w-4 mr-2" /> Disabled</>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-2xl font-semibold">{activeAlerts.length}</div>
            <div className="text-sm text-muted-foreground">Total Alerts</div>
          </div>
          <div className="text-center p-3 bg-red-50 rounded-lg">
            <div className="text-2xl font-semibold text-red-600">{criticalCount}</div>
            <div className="text-sm text-muted-foreground">Critical</div>
          </div>
          <div className="text-center p-3 bg-orange-50 rounded-lg">
            <div className="text-2xl font-semibold text-orange-600">{highCount}</div>
            <div className="text-sm text-muted-foreground">High</div>
          </div>
          <div className="text-center p-3 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-semibold text-yellow-600">{mediumCount}</div>
            <div className="text-sm text-muted-foreground">Medium</div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {activeAlerts.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <h3 className="font-semibold mb-2">No Policy Violations</h3>
              <p className="text-sm text-muted-foreground">
                All departments are operating within normal parameters
              </p>
            </div>
          ) : (
            activeAlerts
              .sort((a, b) => {
                const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                return severityOrder[a.severity] - severityOrder[b.severity];
              })
              .map((alert, index) => (
                <Alert key={index} className={`border-l-4 ${getSeverityColor(alert.severity)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3 flex-1">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <AlertTitle className="flex items-center space-x-2 mb-1">
                          <span>{alert.department}</span>
                          <Badge variant="outline" className="uppercase text-xs">
                            {alert.severity}
                          </Badge>
                        </AlertTitle>
                        <AlertDescription>
                          <div className="font-medium mb-1">{alert.issue}</div>
                          <div className="text-sm">{alert.details}</div>
                        </AlertDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissAlert(alert)}
                      className="ml-4"
                    >
                      Dismiss
                    </Button>
                  </div>
                </Alert>
              ))
          )}
        </div>

        {/* Dismissed Alerts Info */}
        {dismissedAlerts.size > 0 && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {dismissedAlerts.size} alert{dismissedAlerts.size > 1 ? 's' : ''} dismissed
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setDismissedAlerts(new Set());
                  toast.success('All alerts restored');
                }}
              >
                Restore All
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
