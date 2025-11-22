import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { BarChart3, TrendingUp, Users, Clock, AlertTriangle, Search, Building, Building2, GraduationCap, AlertCircle, Activity, Layers, PieChart as PieChartIcon, FileText, Bell } from 'lucide-react';
import { Chart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, ComposedChart, Line } from 'recharts';
import { ODLimitTracker } from './ODLimitTracker';
import { LiveODPipeline } from './LiveODPipeline';
import { InstitutionalHeatmap } from './InstitutionalHeatmap';
import { ODCategoryInsights } from './ODCategoryInsights';
import { InstantReportGenerator } from './InstantReportGenerator';
import { PolicyAlertSystem } from './PolicyAlertSystem';
import type { User, ODRequest, Certificate } from '../App';
import { SCOFT_DEPARTMENTS, NON_SCOFT_DEPARTMENTS } from '../App';

interface PrincipalDashboardProps {
  user: User;
  odRequests: ODRequest[];
  certificates: Certificate[];
  allUsers: User[];
}

export function PrincipalDashboard({ user, odRequests, certificates, allUsers }: PrincipalDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');

  // Institution-wide statistics
  const totalRequests = odRequests.length;
  const approvedRequests = odRequests.filter(req => 
    ['mentor_approved', 'completed', 'certificate_uploaded', 'certificate_approved'].includes(req.status)
  ).length;
  const pendingRequests = odRequests.filter(req => 
    ['submitted'].includes(req.status)
  ).length;
  const rejectedRequests = odRequests.filter(req => 
    ['mentor_rejected'].includes(req.status)
  ).length;

  // Approval rate
  const approvalRate = totalRequests > 0 ? Math.round((approvedRequests / totalRequests) * 100) : 0;

  // SCOFT vs NON-SCOFT distribution
  const scoftRequests = odRequests.filter(req => 
    SCOFT_DEPARTMENTS.includes(req.studentDetails.department)
  );
  const nonScoftRequests = odRequests.filter(req => 
    NON_SCOFT_DEPARTMENTS.includes(req.studentDetails.department)
  );

  const scoftVsNonScoftData = [
    { 
      name: 'SCOFT', 
      value: scoftRequests.length, 
      color: '#4F46E5',
      departments: SCOFT_DEPARTMENTS.length 
    },
    { 
      name: 'NON-SCOFT', 
      value: nonScoftRequests.length, 
      color: '#10B981',
      departments: NON_SCOFT_DEPARTMENTS.length 
    }
  ];

  // Department-wise detailed breakdown
  const departmentBreakdown = [...SCOFT_DEPARTMENTS, ...NON_SCOFT_DEPARTMENTS].map(dept => {
    const deptRequests = odRequests.filter(req => req.studentDetails.department === dept);
    const deptCertificates = certificates.filter(cert => {
      const odRequest = odRequests.find(req => req.id === cert.odRequestId);
      return odRequest?.studentDetails.department === dept;
    });
    
    return {
      department: dept,
      category: SCOFT_DEPARTMENTS.includes(dept) ? 'SCOFT' : 'NON-SCOFT',
      totalRequests: deptRequests.length,
      approved: deptRequests.filter(req => 
        ['mentor_approved', 'completed', 'certificate_uploaded', 'certificate_approved'].includes(req.status)
      ).length,
      pending: deptRequests.filter(req => req.status === 'submitted').length,
      rejected: deptRequests.filter(req => req.status === 'mentor_rejected').length,
      certificates: deptCertificates.length,
      certificatesApproved: deptCertificates.filter(cert => cert.status === 'hod_approved').length
    };
  }).filter(dept => dept.totalRequests > 0); // Only show departments with requests

  // Department-wise statistics
  const departmentStats = odRequests.reduce((acc, req) => {
    const dept = req.studentDetails.department || 'Unknown';
    if (!acc[dept]) {
      acc[dept] = { total: 0, approved: 0, pending: 0, rejected: 0 };
    }
    acc[dept].total++;
    if (['mentor_approved', 'completed', 'certificate_uploaded', 'certificate_approved'].includes(req.status)) acc[dept].approved++;
    else if (['submitted'].includes(req.status)) acc[dept].pending++;
    else if (['mentor_rejected'].includes(req.status)) acc[dept].rejected++;
    return acc;
  }, {} as Record<string, { total: number; approved: number; pending: number; rejected: number }>);

  const departmentChartData = Object.entries(departmentStats).map(([dept, stats]) => ({
    department: dept.length > 15 ? dept.substring(0, 15) + '...' : dept,
    total: stats.total,
    approved: stats.approved,
    pending: stats.pending,
    rejected: stats.rejected
  }));

  // Monthly trends
  const monthlyStats = odRequests.reduce((acc, req) => {
    const month = new Date(req.submittedAt).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
    if (!acc[month]) {
      acc[month] = { total: 0, approved: 0 };
    }
    acc[month].total++;
    if (['mentor_approved', 'completed', 'certificate_uploaded', 'certificate_approved'].includes(req.status)) acc[month].approved++;
    return acc;
  }, {} as Record<string, { total: number; approved: number }>);

  const monthlyChartData = Object.entries(monthlyStats)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([month, stats]) => ({
      month,
      total: stats.total,
      approved: stats.approved,
      approvalRate: stats.total > 0 ? Math.round((stats.approved / stats.total) * 100) : 0
    }));

  // Reason distribution
  const reasonStats = odRequests.reduce((acc, req) => {
    acc[req.reason] = (acc[req.reason] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const reasonChartData = Object.entries(reasonStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6)
    .map(([reason, count]) => ({
      reason: reason.length > 20 ? reason.substring(0, 20) + '...' : reason,
      count
    }));

  // Stuck requests (pending > 48 hours)
  const stuckRequests = odRequests.filter(req => {
    if (!['submitted'].includes(req.status)) return false;
    const hoursSinceUpdate = (Date.now() - new Date(req.lastUpdated).getTime()) / (1000 * 60 * 60);
    return hoursSinceUpdate > 48;
  });

  // Filter audit logs
  const filteredAuditLogs = odRequests.filter(req => {
    const matchesSearch = req.studentDetails.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.studentDetails.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.reason.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === 'all' || req.studentDetails.department === filterDepartment;
    
    let matchesTime = true;
    if (timeFilter !== 'all') {
      const reqDate = new Date(req.submittedAt);
      const now = new Date();
      switch (timeFilter) {
        case 'today':
          matchesTime = reqDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesTime = reqDate >= weekAgo;
          break;
        case 'month':
          matchesTime = reqDate.getMonth() === now.getMonth() && reqDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesDepartment && matchesTime;
  });

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'mentor_approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
      case 'certificate_uploaded':
        return <Badge className="bg-purple-100 text-purple-800">Certificate Uploaded</Badge>;
      case 'certificate_approved':
        return <Badge className="bg-green-100 text-green-800">Certificate Approved</Badge>;
      case 'mentor_rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      case 'submitted':
        return <Badge className="bg-yellow-100 text-yellow-800">Pending Review</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1>Principal Dashboard</h1>
          <p className="text-muted-foreground">Institutional oversight and analytics for the OD system</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Requests</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{totalRequests}</div>
              <p className="text-xs text-muted-foreground">Institution-wide</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Approved</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-green-600">{approvedRequests}</div>
              <p className="text-xs text-muted-foreground">{approvalRate}% approval rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Pending</CardTitle>
              <Clock className="h-4 w-4 text-amber-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-amber-600">{pendingRequests}</div>
              <p className="text-xs text-muted-foreground">In workflow</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Departments</CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{Object.keys(departmentStats).length}</div>
              <p className="text-xs text-muted-foreground">Active departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Stuck Requests</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl text-red-600">{stuckRequests.length}</div>
              <p className="text-xs text-muted-foreground">&gt; 48 hours pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Live Pipeline View - Featured prominently */}
        <LiveODPipeline odRequests={odRequests} />

        {/* Policy Alerts - Important for Principal oversight */}
        <PolicyAlertSystem odRequests={odRequests} allUsers={allUsers} />

        {/* Analytics Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">
              <Activity className="h-4 w-4 mr-2" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="heatmap">
              <Layers className="h-4 w-4 mr-2" />
              Heatmap
            </TabsTrigger>
            <TabsTrigger value="insights">
              <PieChartIcon className="h-4 w-4 mr-2" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="reports">
              <FileText className="h-4 w-4 mr-2" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="od-limits">
              <AlertCircle className="h-4 w-4 mr-2" />
              OD Limits
            </TabsTrigger>
            <TabsTrigger value="departments">
              <Building2 className="h-4 w-4 mr-2" />
              Departments
            </TabsTrigger>
          </TabsList>

          <TabsContent value="heatmap">
            <InstitutionalHeatmap odRequests={odRequests} />
          </TabsContent>

          <TabsContent value="insights">
            <ODCategoryInsights odRequests={odRequests} />
          </TabsContent>

          <TabsContent value="reports">
            <InstantReportGenerator odRequests={odRequests} allUsers={allUsers} />
          </TabsContent>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Department-wise OD Distribution</CardTitle>
                  <CardDescription>Total requests by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="total" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Trends</CardTitle>
                  <CardDescription>OD requests and approval rates over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <ComposedChart data={monthlyChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis yAxisId="left" />
                      <YAxis yAxisId="right" orientation="right" />
                      <Tooltip />
                      <Bar yAxisId="left" dataKey="total" fill="#10b981" />
                      <Line yAxisId="right" type="monotone" dataKey="approvalRate" stroke="#f59e0b" strokeWidth={2} />
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top OD Reasons</CardTitle>
                  <CardDescription>Most common reasons for OD requests</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={reasonChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ reason, percent }) => `${reason} (${(percent * 100).toFixed(0)}%)`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {reasonChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <CardDescription>Approval rates by department</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentChartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" angle={-45} textAnchor="end" height={100} />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="approved" fill="#10b981" />
                      <Bar dataKey="rejected" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="od-limits">
            <ODLimitTracker 
              odRequests={odRequests}
              allUsers={allUsers}
              currentUser={user}
            />
          </TabsContent>

          <TabsContent value="departments">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Building2 className="h-5 w-5" />
                  <span>Department-wise Analysis</span>
                </CardTitle>
                <CardDescription>Comprehensive breakdown by department with certificate tracking</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentBreakdown.map((dept, index) => (
                    <Card key={index} className={`border-l-4 ${dept.category === 'SCOFT' ? 'border-l-blue-500' : 'border-l-green-500'}`}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base">{dept.department}</CardTitle>
                            <CardDescription>
                              <Badge className={dept.category === 'SCOFT' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                                {dept.category}
                              </Badge>
                            </CardDescription>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-semibold">{dept.totalRequests}</div>
                            <div className="text-xs text-muted-foreground">Total Requests</div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div className="text-center">
                            <div className="text-lg font-semibold text-green-600">{dept.approved}</div>
                            <div className="text-muted-foreground">Approved</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-amber-600">{dept.pending}</div>
                            <div className="text-muted-foreground">Pending</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-red-600">{dept.rejected}</div>
                            <div className="text-muted-foreground">Rejected</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-blue-600">{dept.certificates}</div>
                            <div className="text-muted-foreground">Certificates</div>
                          </div>
                          <div className="text-center">
                            <div className="text-lg font-semibold text-purple-600">{dept.certificatesApproved}</div>
                            <div className="text-muted-foreground">Cert. Approved</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Audit Log */}
        <Tabs defaultValue="audit" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="audit">System Audit Log</TabsTrigger>
            <TabsTrigger value="stuck">Stuck Requests</TabsTrigger>
          </TabsList>
          
          <TabsContent value="audit">
            <Card>
              <CardHeader>
                <CardTitle>System Audit Log</CardTitle>
                <CardDescription>Complete history of all OD requests with filtering</CardDescription>
              </CardHeader>
              <CardContent>
                {/* Filter Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search by student, roll number, or reason..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8"
                      />
                    </div>
                  </div>
                  
                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {Object.keys(departmentStats).map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={timeFilter} onValueChange={setTimeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Time filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Details</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAuditLogs.slice(0, 50).map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>
                          <div>
                            <div>{request.studentDetails.studentName}</div>
                            <div className="text-sm text-muted-foreground">{request.studentDetails.rollNumber}</div>
                          </div>
                        </TableCell>
                        <TableCell>{request.studentDetails.department}</TableCell>
                        <TableCell>
                          <div>
                            <div>{new Date(request.odDate).toLocaleDateString()}</div>
                            <div className="text-sm text-muted-foreground">{request.odTime}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate">{request.reason}</div>
                        </TableCell>
                        <TableCell>{getStatusBadge(request.status)}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(request.submittedAt).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {new Date(request.lastUpdated).toLocaleDateString()}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stuck">
            <Card>
              <CardHeader>
                <CardTitle>Stuck Requests</CardTitle>
                <CardDescription>Requests pending for more than 48 hours</CardDescription>
              </CardHeader>
              <CardContent>
                {stuckRequests.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No stuck requests found</p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Current Status</TableHead>
                        <TableHead>Days Pending</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {stuckRequests.map((request) => {
                        const daysPending = Math.floor((Date.now() - new Date(request.lastUpdated).getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <TableRow key={request.id}>
                            <TableCell>
                              <div>
                                <div>{request.studentName}</div>
                                <div className="text-sm text-muted-foreground">{request.rollNumber}</div>
                              </div>
                            </TableCell>
                            <TableCell>{request.department}</TableCell>
                            <TableCell>{request.reason}</TableCell>
                            <TableCell>{getStatusBadge(request.status)}</TableCell>
                            <TableCell>
                              <Badge variant="destructive">{daysPending} days</Badge>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}