import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle, XCircle, Clock } from 'lucide-react';
import type { User, ODRequest } from '../App';

interface MentorInsightsChartProps {
  odRequests: ODRequest[];
  allUsers: User[];
  department: string;
}

export function MentorInsightsChart({ odRequests, allUsers, department }: MentorInsightsChartProps) {
  const [selectedMentor, setSelectedMentor] = useState<string | null>(null);
  
  // Get all mentors in the department
  const departmentMentors = allUsers.filter(u => 
    u.role === 'faculty' && 
    u.department === department &&
    u.mentees && 
    u.mentees.length > 0
  );
  
  // Calculate mentor statistics
  const mentorStats = departmentMentors.map(mentor => {
    const mentorRequests = odRequests.filter(req => 
      mentor.mentees?.includes(req.studentDetails.studentId)
    );
    
    const approved = mentorRequests.filter(req => 
      ['mentor_approved', 'hod_approved', 'principal_approved', 'completed', 'certificate_approved'].includes(req.status)
    ).length;
    
    const rejected = mentorRequests.filter(req => 
      req.status === 'mentor_rejected'
    ).length;
    
    const pending = mentorRequests.filter(req => 
      req.status === 'submitted'
    ).length;
    
    // Calculate average response time
    const approvedReqs = mentorRequests.filter(req => req.mentorApprovedAt);
    const avgResponseTime = approvedReqs.length > 0
      ? approvedReqs.reduce((sum, req) => {
          const submitted = new Date(req.submittedAt).getTime();
          const approved = new Date(req.mentorApprovedAt!).getTime();
          return sum + (approved - submitted);
        }, 0) / approvedReqs.length / (1000 * 60 * 60) // Convert to hours
      : 0;
    
    // Detect delays (>24 hours pending)
    const delays = mentorRequests.filter(req => {
      if (req.status !== 'submitted') return false;
      const hoursPending = (new Date().getTime() - new Date(req.submittedAt).getTime()) / (1000 * 60 * 60);
      return hoursPending > 24;
    }).length;
    
    // Calculate approval rate
    const total = approved + rejected;
    const approvalRate = total > 0 ? (approved / total) * 100 : 0;
    
    return {
      id: mentor.id,
      name: mentor.name,
      approved,
      rejected,
      pending,
      total: mentorRequests.length,
      avgResponseTime,
      delays,
      approvalRate,
      menteeCount: mentor.mentees?.length || 0,
    };
  });
  
  // Sort by various metrics
  const slowestMentors = [...mentorStats]
    .filter(m => m.avgResponseTime > 0)
    .sort((a, b) => b.avgResponseTime - a.avgResponseTime)
    .slice(0, 3);
  
  const mostDelays = [...mentorStats]
    .filter(m => m.delays > 0)
    .sort((a, b) => b.delays - a.delays)
    .slice(0, 3);
  
  const excessiveApprovers = [...mentorStats]
    .filter(m => m.total > 0 && m.approvalRate > 95)
    .sort((a, b) => b.approvalRate - a.approvalRate);
  
  // Overall pie chart data
  const overallStats = {
    approved: mentorStats.reduce((sum, m) => sum + m.approved, 0),
    rejected: mentorStats.reduce((sum, m) => sum + m.rejected, 0),
    pending: mentorStats.reduce((sum, m) => sum + m.pending, 0),
  };
  
  const pieData = [
    { name: 'Approved', value: overallStats.approved, color: '#10b981' },
    { name: 'Rejected', value: overallStats.rejected, color: '#ef4444' },
    { name: 'Pending', value: overallStats.pending, color: '#f59e0b' },
  ];
  
  // Mentor comparison bar chart
  const mentorComparisonData = mentorStats.map(m => ({
    name: m.name.split(' ')[0], // First name only
    approved: m.approved,
    rejected: m.rejected,
    pending: m.pending,
  }));
  
  const formatResponseTime = (hours: number) => {
    if (hours < 1) return `${Math.floor(hours * 60)}m`;
    if (hours < 24) return `${Math.floor(hours)}h`;
    const days = Math.floor(hours / 24);
    const remainingHours = Math.floor(hours % 24);
    return `${days}d ${remainingHours}h`;
  };
  
  return (
    <div className="space-y-6">
      {/* Alerts for concerning patterns */}
      {mostDelays.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">⚠️ Mentors with Delayed Approvals</AlertTitle>
          <AlertDescription className="text-red-700">
            <div className="space-y-1 mt-2">
              {mostDelays.map(mentor => (
                <div key={mentor.id} className="text-sm">
                  <strong>{mentor.name}</strong>: {mentor.delays} request{mentor.delays > 1 ? 's' : ''} pending &gt; 24 hours
                </div>
              ))}
            </div>
          </AlertDescription>
        </Alert>
      )}
      
      {excessiveApprovers.length > 0 && (
        <Alert className="border-amber-200 bg-amber-50">
          <TrendingUp className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">📊 High Approval Rates Detected</AlertTitle>
          <AlertDescription className="text-amber-700">
            <div className="space-y-1 mt-2">
              {excessiveApprovers.slice(0, 3).map(mentor => (
                <div key={mentor.id} className="text-sm">
                  <strong>{mentor.name}</strong>: {mentor.approvalRate.toFixed(0)}% approval rate ({mentor.approved}/{mentor.total})
                </div>
              ))}
            </div>
            <p className="text-xs mt-2">Consider reviewing approval patterns for consistency</p>
          </AlertDescription>
        </Alert>
      )}
      
      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Overall Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Department-Wide OD Status</CardTitle>
            <CardDescription>Approved vs Rejected vs Pending by all mentors</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="text-2xl text-green-600">{overallStats.approved}</div>
                <div className="text-xs text-muted-foreground">Approved</div>
              </div>
              <div className="text-center p-2 bg-red-50 rounded">
                <div className="text-2xl text-red-600">{overallStats.rejected}</div>
                <div className="text-xs text-muted-foreground">Rejected</div>
              </div>
              <div className="text-center p-2 bg-amber-50 rounded">
                <div className="text-2xl text-amber-600">{overallStats.pending}</div>
                <div className="text-xs text-muted-foreground">Pending</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Mentor Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Mentor Performance Comparison</CardTitle>
            <CardDescription>OD processing by each mentor</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={mentorComparisonData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="approved" fill="#10b981" name="Approved" />
                <Bar dataKey="rejected" fill="#ef4444" name="Rejected" />
                <Bar dataKey="pending" fill="#f59e0b" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      {/* Detailed Mentor Statistics */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Mentor Statistics</CardTitle>
          <CardDescription>Performance metrics for each mentor in your department</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mentorStats.map(mentor => (
              <div 
                key={mentor.id}
                className={`p-4 border rounded-lg transition-colors ${
                  selectedMentor === mentor.id ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedMentor(selectedMentor === mentor.id ? null : mentor.id)}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold">{mentor.name}</h3>
                      <Badge variant="outline">{mentor.menteeCount} mentees</Badge>
                      {mentor.delays > 0 && (
                        <Badge variant="destructive" className="text-xs">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          {mentor.delays} delayed
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Total ODs:</span>
                        <span className="ml-2 font-semibold">{mentor.total}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Approved:</span>
                        <span className="ml-2 font-semibold text-green-600">{mentor.approved}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rejected:</span>
                        <span className="ml-2 font-semibold text-red-600">{mentor.rejected}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Pending:</span>
                        <span className="ml-2 font-semibold text-amber-600">{mentor.pending}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex items-center space-x-4 text-xs text-muted-foreground">
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Avg Response: {formatResponseTime(mentor.avgResponseTime)}</span>
                      </div>
                      <div className={`flex items-center space-x-1 ${
                        mentor.approvalRate > 95 ? 'text-amber-600' : 
                        mentor.approvalRate > 80 ? 'text-green-600' : 'text-blue-600'
                      }`}>
                        {mentor.approvalRate > 95 ? <TrendingUp className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                        <span>Approval Rate: {mentor.approvalRate.toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Response Time Rankings */}
      {slowestMentors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-amber-600" />
              <span>Response Time Analysis</span>
            </CardTitle>
            <CardDescription>Mentors with longest average response times</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {slowestMentors.map((mentor, index) => (
                <div key={mentor.id} className="flex items-center justify-between p-3 bg-amber-50 border border-amber-200 rounded">
                  <div className="flex items-center space-x-3">
                    <Badge className="bg-amber-100 text-amber-800">#{index + 1}</Badge>
                    <span className="font-semibold">{mentor.name}</span>
                  </div>
                  <Badge variant="outline" className="text-amber-700">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatResponseTime(mentor.avgResponseTime)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
