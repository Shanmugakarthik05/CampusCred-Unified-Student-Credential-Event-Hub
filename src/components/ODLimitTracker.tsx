import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Progress } from './ui/progress';
import { Search, AlertTriangle, AlertCircle, CheckCircle2, Users, FileText } from 'lucide-react';
import { Chart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import type { User, ODRequest } from '../App';
import { toast } from 'sonner@2.0.3';

interface ODLimitTrackerProps {
  odRequests: ODRequest[];
  allUsers: User[];
  currentUser: User;
  department?: string; // Optional filter for department (HOD/Mentor use)
}

interface StudentODStats {
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  currentSemester: string;
  totalODs: number;
  status: 'within-limit' | 'at-limit' | 'exceeded';
  mentorName?: string;
  odHistory: ODRequest[];
}

// Semester helper functions
function getCurrentAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 0-indexed
  
  // Academic year starts in July (month 7)
  if (month >= 7) {
    return `${year}-${year + 1}`;
  } else {
    return `${year - 1}-${year}`;
  }
}

function getCurrentSemester(): string {
  const now = new Date();
  const month = now.getMonth() + 1;
  const academicYear = getCurrentAcademicYear();
  
  // Odd semester: July to December (7-12)
  // Even semester: January to June (1-6)
  if (month >= 7) {
    return `Odd ${academicYear}`;
  } else {
    return `Even ${academicYear}`;
  }
}

function getSemesterForDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  if (month >= 7) {
    return `Odd ${year}-${year + 1}`;
  } else {
    return `Even ${year - 1}-${year}`;
  }
}

// Get list of recent semesters for filtering
function getRecentSemesters(): string[] {
  const currentYear = new Date().getFullYear();
  const semesters: string[] = [];
  
  for (let i = 0; i <= 2; i++) {
    const year = currentYear - i;
    semesters.push(`Odd ${year}-${year + 1}`);
    semesters.push(`Even ${year}-${year + 1}`);
  }
  
  return semesters;
}

export function ODLimitTracker({ odRequests, allUsers, currentUser, department }: ODLimitTrackerProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [semesterFilter, setSemesterFilter] = useState<string>(getCurrentSemester());
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notifiedStudents, setNotifiedStudents] = useState<Set<string>>(new Set());

  const MAX_OD_LIMIT = 5;

  // Calculate student statistics
  const calculateStudentStats = (): StudentODStats[] => {
    // Ensure we have valid arrays before proceeding
    if (!Array.isArray(allUsers) || !Array.isArray(odRequests)) {
      return [];
    }

    // Filter students based on department if provided
    let students = allUsers.filter(u => u.role === 'student');
    if (department) {
      students = students.filter(u => u.department === department);
    }

    // If current user is a mentor, filter to their mentees
    if (currentUser?.role === 'mentor') {
      students = students.filter(u => currentUser.mentees?.includes(u.id));
    }

    return students.map(student => {
      // Filter OD requests for this student in the selected semester
      const studentODs = odRequests.filter(req => {
        const reqSemester = getSemesterForDate(req.submittedAt);
        return req.studentDetails?.studentId === student.id && 
               reqSemester === semesterFilter &&
               req.status !== 'mentor_rejected'; // Don't count rejected ODs
      });

      const totalODs = studentODs.length;
      let status: 'within-limit' | 'at-limit' | 'exceeded';
      
      if (totalODs < MAX_OD_LIMIT) {
        status = 'within-limit';
      } else if (totalODs === MAX_OD_LIMIT) {
        status = 'at-limit';
      } else {
        status = 'exceeded';
      }

      // Find mentor name
      const mentor = allUsers.find(u => u.role === 'mentor' && u.mentees?.includes(student.id));

      return {
        studentId: student.id,
        studentName: student.name,
        rollNumber: student.rollNumber || 'N/A',
        department: student.department || 'N/A',
        currentSemester: semesterFilter,
        totalODs,
        status,
        mentorName: mentor?.name,
        odHistory: studentODs
      };
    });
  };

  const studentStats = calculateStudentStats();

  // Filter students based on search and status
  const filteredStats = studentStats.filter(stat => {
    const matchesSearch = 
      stat.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stat.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stat.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || stat.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Sort by status priority (exceeded > at-limit > within-limit) and then by OD count
  const sortedStats = [...filteredStats].sort((a, b) => {
    const statusOrder = { 'exceeded': 0, 'at-limit': 1, 'within-limit': 2 };
    const statusDiff = statusOrder[a.status] - statusOrder[b.status];
    if (statusDiff !== 0) return statusDiff;
    return b.totalODs - a.totalODs;
  });

  // Analytics data
  const statusCounts = {
    withinLimit: studentStats.filter(s => s.status === 'within-limit').length,
    atLimit: studentStats.filter(s => s.status === 'at-limit').length,
    exceeded: studentStats.filter(s => s.status === 'exceeded').length
  };

  const chartData = [
    { name: 'Within Limit', value: statusCounts.withinLimit, color: '#10b981' },
    { name: 'At Limit (5 ODs)', value: statusCounts.atLimit, color: '#f59e0b' },
    { name: 'Exceeded', value: statusCounts.exceeded, color: '#ef4444' }
  ];

  const distributionData = Array.from({ length: 8 }, (_, i) => {
    const count = studentStats.filter(s => s.totalODs === i).length;
    return { ods: i.toString(), count };
  });

  // Notification logic
  useEffect(() => {
    studentStats.forEach(stat => {
      const notificationKey = `${stat.studentId}-${semesterFilter}`;
      
      if (!notifiedStudents.has(notificationKey)) {
        if (stat.status === 'at-limit') {
          toast.warning(
            `⚠️ ${stat.studentName} has reached the OD limit (5 ODs this semester)`,
            {
              duration: 6000,
              description: `Student: ${stat.rollNumber} | Department: ${stat.department}`
            }
          );
          setNotifiedStudents(prev => new Set(prev).add(notificationKey));
        } else if (stat.status === 'exceeded') {
          toast.error(
            `🚨 ${stat.studentName} has exceeded the OD limit! Action required.`,
            {
              duration: 8000,
              description: `Total ODs: ${stat.totalODs} | Department: ${stat.department}`
            }
          );
          setNotifiedStudents(prev => new Set(prev).add(notificationKey));
        }
      }
    });
  }, [studentStats, semesterFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'within-limit':
        return 'bg-green-50 hover:bg-green-100';
      case 'at-limit':
        return 'bg-orange-50 hover:bg-orange-100';
      case 'exceeded':
        return 'bg-red-50 hover:bg-red-100';
      default:
        return '';
    }
  };

  const getStatusBadge = (status: string, totalODs: number) => {
    switch (status) {
      case 'within-limit':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Within Limit
          </Badge>
        );
      case 'at-limit':
        return (
          <Badge className="bg-orange-100 text-orange-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Limit Reached ({totalODs}/5)
          </Badge>
        );
      case 'exceeded':
        return (
          <Badge className="bg-red-100 text-red-800">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Exceeded ({totalODs}/5)
          </Badge>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Alert Banners */}
      {statusCounts.atLimit > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertCircle className="h-4 w-4 text-orange-600" />
          <AlertTitle className="text-orange-800">Warning: Students at OD Limit</AlertTitle>
          <AlertDescription className="text-orange-700">
            {statusCounts.atLimit} student(s) have reached the maximum OD limit of 5 for {semesterFilter}.
          </AlertDescription>
        </Alert>
      )}

      {statusCounts.exceeded > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertTitle className="text-red-800">Urgent: Students Exceeded OD Limit</AlertTitle>
          <AlertDescription className="text-red-700">
            {statusCounts.exceeded} student(s) have exceeded the OD limit! Immediate action required.
          </AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{studentStats.length}</div>
            <p className="text-xs text-muted-foreground">In {semesterFilter}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Within Limit</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">{statusCounts.withinLimit}</div>
            <p className="text-xs text-muted-foreground">&lt; 5 ODs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">At Limit</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-orange-600">{statusCounts.atLimit}</div>
            <p className="text-xs text-muted-foreground">Exactly 5 ODs</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Exceeded</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{statusCounts.exceeded}</div>
            <p className="text-xs text-muted-foreground">&gt; 5 ODs</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>OD Limit Status Distribution</CardTitle>
            <CardDescription>Students by limit status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>OD Count Distribution</CardTitle>
            <CardDescription>Number of students per OD count</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={distributionData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="ods" label={{ value: 'Number of ODs', position: 'insideBottom', offset: -5 }} />
                <YAxis label={{ value: 'Students', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle>Student OD Limit Overview</CardTitle>
          <CardDescription>
            Track OD usage per student with automatic alerts at limit (5 ODs per semester)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, roll number, or department..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>

            <Select value={semesterFilter} onValueChange={setSemesterFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent>
                {getRecentSemesters().map(sem => (
                  <SelectItem key={sem} value={sem}>{sem}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="within-limit">Within Limit</SelectItem>
                <SelectItem value="at-limit">At Limit</SelectItem>
                <SelectItem value="exceeded">Exceeded</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Student Table */}
          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student Name</TableHead>
                  <TableHead>Register Number</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Total OD Taken</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Status</TableHead>
                  {currentUser.role !== 'student' && <TableHead>Mentor</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedStats.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                      <p>No students found matching the criteria</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedStats.map((stat) => (
                    <TableRow key={stat.studentId} className={getStatusColor(stat.status)}>
                      <TableCell>
                        <div>
                          <div>{stat.studentName}</div>
                          {stat.status === 'exceeded' && (
                            <div className="text-xs text-red-600">⚠️ Needs Review</div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{stat.rollNumber}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{stat.department}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <span className={`text-lg ${
                            stat.status === 'exceeded' ? 'text-red-600' :
                            stat.status === 'at-limit' ? 'text-orange-600' : 'text-green-600'
                          }`}>
                            {stat.totalODs}
                          </span>
                          <span className="text-sm text-muted-foreground">/ {MAX_OD_LIMIT}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="w-full max-w-[120px]">
                          <Progress 
                            value={(stat.totalODs / MAX_OD_LIMIT) * 100} 
                            className={`h-2 ${
                              stat.status === 'exceeded' ? '[&>div]:bg-red-500' :
                              stat.status === 'at-limit' ? '[&>div]:bg-orange-500' : '[&>div]:bg-green-500'
                            }`}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            {((stat.totalODs / MAX_OD_LIMIT) * 100).toFixed(0)}%
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(stat.status, stat.totalODs)}
                      </TableCell>
                      {currentUser.role !== 'student' && (
                        <TableCell className="text-sm text-muted-foreground">
                          {stat.mentorName || 'Not Assigned'}
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
              <span className="text-sm">🟢 Within Limit (0-4 ODs)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
              <span className="text-sm">🟠 Limit Reached (5 ODs)</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
              <span className="text-sm">🔴 Exceeded Limit (&gt;5 ODs)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
