import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Database, Download, Search, Filter, Calendar, User, FileText, Settings, Shield } from 'lucide-react';
import { SystemNotificationManager } from './SystemNotificationManager';
import type { User, ODRequest, Certificate } from '../App';

interface ERPAdminViewProps {
  user: User;
  odRequests: ODRequest[];
  certificates: Certificate[];
  users: User[];
}

export function ERPAdminView({ user, odRequests, certificates, users }: ERPAdminViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('all');
  const [selectedData, setSelectedData] = useState<'requests' | 'users' | 'certificates' | 'notifications'>('requests');

  // Filter OD requests
  const filteredRequests = odRequests.filter(req => {
    const matchesSearch = req.studentDetails.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.studentDetails.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         req.id.includes(searchTerm);
    
    const matchesStatus = filterStatus === 'all' || req.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || req.studentDetails.department === filterDepartment;
    
    let matchesDate = true;
    if (dateRange !== 'all') {
      const reqDate = new Date(req.submittedAt);
      const now = new Date();
      switch (dateRange) {
        case 'today':
          matchesDate = reqDate.toDateString() === now.toDateString();
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = reqDate >= weekAgo;
          break;
        case 'month':
          matchesDate = reqDate.getMonth() === now.getMonth() && reqDate.getFullYear() === now.getFullYear();
          break;
        case 'quarter':
          const quarter = Math.floor(now.getMonth() / 3);
          const reqQuarter = Math.floor(reqDate.getMonth() / 3);
          matchesDate = reqQuarter === quarter && reqDate.getFullYear() === now.getFullYear();
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDepartment && matchesDate;
  });

  // Filter users
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.id.includes(searchTerm);
    const matchesDepartment = filterDepartment === 'all' || u.department === filterDepartment;
    
    return matchesSearch && matchesDepartment;
  });

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

  const getRoleBadge = (role: string) => {
    const colors: Record<string, string> = {
      student: 'bg-blue-100 text-blue-800',
      mentor: 'bg-green-100 text-green-800',
      hod: 'bg-purple-100 text-purple-800',
      principal: 'bg-red-100 text-red-800',
      admin: 'bg-gray-100 text-gray-800'
    };
    
    return <Badge className={colors[role] || 'bg-gray-100 text-gray-800'}>{role}</Badge>;
  };

  const exportData = (dataType: 'requests' | 'users' | 'certificates' | 'notifications') => {
    let data, csvContent;
    
    switch (dataType) {
      case 'requests':
        data = filteredRequests;
        csvContent = generateRequestsCSV(data);
        break;
      case 'certificates':
        data = certificates;
        csvContent = generateCertificatesCSV(data);
        break;
      case 'users':
        data = filteredUsers;
        csvContent = generateUsersCSV(data);
        break;
      case 'notifications':
        // Notifications don't need export functionality
        return;
      default:
        return;
    }
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${dataType}_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const generateRequestsCSV = (requests: ODRequest[]) => {
    const headers = [
      'ID', 'Student Name', 'Roll Number', 'Department', 'OD Date', 'OD Time',
      'Reason', 'Description', 'Status', 'Submitted At', 'Last Updated',
      'Mentor Feedback', 'HOD Feedback'
    ];
    
    const rows = requests.map(req => [
      req.id,
      req.studentDetails.studentName,
      req.studentDetails.rollNumber,
      req.studentDetails.department,
      req.odDate,
      req.odTime,
      req.reason,
      `"${req.description.replace(/"/g, '""')}"`,
      req.status,
      req.submittedAt,
      req.lastUpdated,
      req.mentorFeedback || '',
      req.hodFeedback || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateUsersCSV = (users: User[]) => {
    const headers = [
      'ID', 'Username', 'Name', 'Role', 'Department', 'Mentees'
    ];
    
    const rows = users.map(u => [
      u.id,
      u.username,
      u.name,
      u.role,
      u.department || '',
      u.mentees?.join(';') || ''
    ]);
    
    return [headers, ...rows].map(row => row.join(',')).join('\n');
  };

  const generateCertificatesCSV = (certificates: Certificate[]) => {
    const headers = [
      'Certificate ID', 'OD Request ID', 'Student ID', 'Student Name', 'Roll Number', 
      'Department', 'File Name', 'Upload Date', 'Status', 'HOD Feedback', 'HOD Approved Date'
    ];
    
    const rows = certificates.map(cert => {
      const odRequest = odRequests.find(req => req.id === cert.odRequestId);
      return [
        cert.id,
        cert.odRequestId,
        cert.studentId,
        odRequest?.studentDetails.studentName || 'N/A',
        odRequest?.studentDetails.rollNumber || 'N/A',
        odRequest?.studentDetails.department || 'N/A',
        cert.fileName,
        cert.uploadedAt,
        cert.status,
        cert.hodFeedback || '',
        cert.hodApprovedAt || ''
      ];
    });
    
    return [headers, ...rows].map(row => row.join(',')).join('\\n');
  };

  // Get unique departments
  const departments = Array.from(new Set([
    ...odRequests.map(req => req.studentDetails.department),
    ...users.map(u => u.department)
  ].filter(Boolean)));

  // System statistics
  const systemStats = {
    totalRequests: odRequests.length,
    totalUsers: users.length,
    uniqueDepartments: departments.length,
    dataIntegrity: Math.round((odRequests.filter(req => 
      req.studentDetails.studentName && req.studentDetails.rollNumber && req.studentDetails.department && req.reason
    ).length / odRequests.length) * 100)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-slate-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1>ERP Admin - Data Access Portal</h1>
            <p className="text-muted-foreground">Complete system data access and export capabilities</p>
          </div>
          <div className="flex items-center space-x-2">
            <Database className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Full Database Access</span>
          </div>
        </div>

        {/* System Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Total Records</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{systemStats.totalRequests}</div>
              <p className="text-xs text-muted-foreground">OD requests</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">System Users</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{systemStats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">Active users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Departments</CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{systemStats.uniqueDepartments}</div>
              <p className="text-xs text-muted-foreground">Active departments</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm">Data Integrity</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl">{systemStats.dataIntegrity}%</div>
              <p className="text-xs text-muted-foreground">Complete records</p>
            </CardContent>
          </Card>
        </div>

        {/* Data Tables */}
        <Tabs value={selectedData} onValueChange={(value) => setSelectedData(value as 'requests' | 'users' | 'certificates' | 'notifications')} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requests">OD Requests Data</TabsTrigger>
            <TabsTrigger value="certificates">Certificates Data</TabsTrigger>
            <TabsTrigger value="users">User Management Data</TabsTrigger>
            <TabsTrigger value="notifications">System Notifications</TabsTrigger>
          </TabsList>
          
          <TabsContent value="requests">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>OD Requests Database</CardTitle>
                    <CardDescription>Complete raw data access with filtering and export</CardDescription>
                  </div>
                  <Button onClick={() => exportData('requests')} className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search all fields..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                  
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="mentor_approved">Mentor Approved</SelectItem>
                      <SelectItem value="mentor_rejected">Mentor Rejected</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="certificate_uploaded">Certificate Uploaded</SelectItem>
                      <SelectItem value="certificate_approved">Certificate Approved</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={dateRange} onValueChange={setDateRange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Date range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Time</SelectItem>
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="week">This Week</SelectItem>
                      <SelectItem value="month">This Month</SelectItem>
                      <SelectItem value="quarter">This Quarter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                  Showing {filteredRequests.length} of {odRequests.length} records
                </div>

                <div className="border rounded-lg overflow-auto max-h-[600px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Student Details</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>OD Date/Time</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Submitted</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Mentor Feedback</TableHead>
                        <TableHead>HOD Feedback</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRequests.map((request) => (
                        <TableRow key={request.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-xs">{request.id}</TableCell>
                          <TableCell>
                            <div>
                              <div>{request.studentDetails.studentName}</div>
                              <div className="text-xs text-muted-foreground">{request.studentDetails.rollNumber}</div>
                            </div>
                          </TableCell>
                          <TableCell>{request.studentDetails.department}</TableCell>
                          <TableCell>
                            <div>
                              <div className="text-sm">{new Date(request.odDate).toLocaleDateString()}</div>
                              <div className="text-xs text-muted-foreground">{request.odTime}</div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="max-w-xs">
                              <div className="truncate">{request.reason}</div>
                              <div className="text-xs text-muted-foreground truncate">{request.description}</div>
                            </div>
                          </TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell className="text-xs">
                            {new Date(request.submittedAt).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs">
                            {new Date(request.lastUpdated).toLocaleString()}
                          </TableCell>
                          <TableCell className="text-xs max-w-xs truncate">
                            {request.mentorFeedback || 'N/A'}
                          </TableCell>
                          <TableCell className="text-xs max-w-xs truncate">
                            {request.hodFeedback || 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="certificates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Certificates Database</CardTitle>
                    <CardDescription>Complete certificate tracking with HOD approvals</CardDescription>
                  </div>
                  <Button onClick={() => exportData('certificates')} className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground mb-4">
                  Showing {certificates.length} certificates
                </div>

                <div className="border rounded-lg overflow-auto max-h-[600px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>Certificate ID</TableHead>
                        <TableHead>Student Details</TableHead>
                        <TableHead>OD Details</TableHead>
                        <TableHead>File Name</TableHead>
                        <TableHead>Upload Date</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>HOD Feedback</TableHead>
                        <TableHead>HOD Approved Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {certificates.map((certificate) => {
                        const odRequest = odRequests.find(req => req.id === certificate.odRequestId);
                        return (
                          <TableRow key={certificate.id} className="hover:bg-muted/50">
                            <TableCell className="font-mono text-xs">{certificate.id}</TableCell>
                            <TableCell>
                              <div>
                                <div>{odRequest?.studentDetails.studentName || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">
                                  {odRequest?.studentDetails.rollNumber} - {odRequest?.studentDetails.department}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="text-sm">{odRequest?.reason || 'N/A'}</div>
                                <div className="text-xs text-muted-foreground">
                                  {odRequest?.odDate && new Date(odRequest.odDate).toLocaleDateString()}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span className="text-sm truncate max-w-xs">{certificate.fileName}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-xs">
                              {new Date(certificate.uploadedAt).toLocaleString()}
                            </TableCell>
                            <TableCell>
                              {certificate.status === 'uploaded' && (
                                <Badge className="bg-blue-100 text-blue-800">Pending Review</Badge>
                              )}
                              {certificate.status === 'hod_approved' && (
                                <Badge className="bg-green-100 text-green-800">Approved</Badge>
                              )}
                              {certificate.status === 'hod_rejected' && (
                                <Badge variant="destructive">Rejected</Badge>
                              )}
                            </TableCell>
                            <TableCell className="text-xs max-w-xs truncate">
                              {certificate.hodFeedback || 'N/A'}
                            </TableCell>
                            <TableCell className="text-xs">
                              {certificate.hodApprovedAt 
                                ? new Date(certificate.hodApprovedAt).toLocaleString()
                                : 'N/A'
                              }
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>User Management Database</CardTitle>
                    <CardDescription>Complete user data with roles and permissions</CardDescription>
                  </div>
                  <Button onClick={() => exportData('users')} className="bg-green-600 hover:bg-green-700">
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by name, username, or ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>

                  <Select value={filterDepartment} onValueChange={setFilterDepartment}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filter by department" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {departments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="text-sm text-muted-foreground mb-4">
                  Showing {filteredUsers.length} of {users.length} users
                </div>

                <div className="border rounded-lg overflow-auto max-h-[600px]">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background">
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Username</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Role</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Mentees</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredUsers.map((user) => (
                        <TableRow key={user.id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-xs">{user.id}</TableCell>
                          <TableCell className="font-mono">{user.username}</TableCell>
                          <TableCell>{user.name}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{user.department || 'N/A'}</TableCell>
                          <TableCell className="text-xs">
                            {user.mentees?.length ? (
                              <div className="max-w-xs truncate">
                                {user.mentees.join(', ')}
                              </div>
                            ) : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications">
            <SystemNotificationManager />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}