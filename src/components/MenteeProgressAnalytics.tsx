import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { 
  User, 
  TrendingUp, 
  TrendingDown, 
  Award, 
  Code2, 
  Calendar, 
  PieChart, 
  BarChart3,
  Trophy,
  AlertCircle,
  CheckCircle,
  Target,
  Zap,
  BookOpen,
  Dumbbell,
  Laptop
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import type { User as UserType, ODRequest } from '../App';

interface MenteeProgressAnalyticsProps {
  mentees: UserType[];
  odRequests: ODRequest[];
  currentUser: UserType;
}

interface MenteeStats {
  id: string;
  name: string;
  rollNumber: string;
  totalODs: number;
  approvedODs: number;
  rejectedODs: number;
  pendingODs: number;
  averageApprovalTime: number;
  leetCodeProgress: number;
  academicEvents: number;
  sportsEvents: number;
  technicalEvents: number;
  diversityScore: number;
  trend: 'up' | 'down' | 'stable';
  riskLevel: 'low' | 'medium' | 'high';
}

interface EventCategory {
  category: string;
  count: number;
  percentage: number;
  color: string;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export function MenteeProgressAnalytics({ mentees, odRequests, currentUser }: MenteeProgressAnalyticsProps) {
  const [selectedMentee, setSelectedMentee] = useState<string>('overview');
  const [timePeriod, setTimePeriod] = useState<'semester' | 'month' | 'all'>('semester');

  // Helper functions
  const getCurrentSemester = () => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    if (month >= 7) {
      return `Odd ${year}-${year + 1}`;
    } else {
      return `Even ${year - 1}-${year}`;
    }
  };

  const getSemesterForDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    
    if (month >= 7) {
      return `Odd ${year}-${year + 1}`;
    } else {
      return `Even ${year - 1}-${year}`;
    }
  };

  const categorizeEvent = (reason: string, detailedReason: string): 'academic' | 'sports' | 'technical' => {
    const text = `${reason} ${detailedReason}`.toLowerCase();
    
    if (text.includes('sport') || text.includes('cricket') || text.includes('football') || 
        text.includes('basketball') || text.includes('athletic') || text.includes('tournament')) {
      return 'sports';
    }
    
    if (text.includes('hackathon') || text.includes('coding') || text.includes('technical') ||
        text.includes('workshop') || text.includes('seminar') || text.includes('tech') ||
        text.includes('programming') || text.includes('project')) {
      return 'technical';
    }
    
    return 'academic';
  };

  // Calculate comprehensive stats for each mentee
  const menteeStats: MenteeStats[] = useMemo(() => {
    const currentSemester = getCurrentSemester();
    
    return mentees.map(mentee => {
      // Filter ODs based on time period
      let menteeODs = odRequests.filter(req => req.studentDetails?.studentId === mentee.id);
      
      if (timePeriod === 'semester') {
        menteeODs = menteeODs.filter(req => getSemesterForDate(req.submittedAt) === currentSemester);
      } else if (timePeriod === 'month') {
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        menteeODs = menteeODs.filter(req => new Date(req.submittedAt) >= oneMonthAgo);
      }

      const totalODs = menteeODs.length;
      const approvedODs = menteeODs.filter(req => req.status === 'mentor_approved' || req.status === 'hod_approved' || req.status === 'certificate_approved').length;
      const rejectedODs = menteeODs.filter(req => req.status === 'mentor_rejected' || req.status === 'hod_rejected').length;
      const pendingODs = menteeODs.filter(req => req.status === 'submitted' || req.status === 'pending_certificate').length;

      // Calculate average approval time
      const approvedWithTime = menteeODs.filter(req => 
        (req.status === 'mentor_approved' || req.status === 'hod_approved') && 
        req.mentorApprovedAt
      );
      
      const avgApprovalTime = approvedWithTime.length > 0
        ? approvedWithTime.reduce((sum, req) => {
            const submitted = new Date(req.submittedAt).getTime();
            const approved = new Date(req.mentorApprovedAt!).getTime();
            return sum + (approved - submitted) / (1000 * 60 * 60); // hours
          }, 0) / approvedWithTime.length
        : 0;

      // Categorize events
      const academicEvents = menteeODs.filter(req => categorizeEvent(req.reason, req.detailedReason) === 'academic').length;
      const sportsEvents = menteeODs.filter(req => categorizeEvent(req.reason, req.detailedReason) === 'sports').length;
      const technicalEvents = menteeODs.filter(req => categorizeEvent(req.reason, req.detailedReason) === 'technical').length;

      // Calculate diversity score (0-100)
      const categories = [academicEvents, sportsEvents, technicalEvents].filter(count => count > 0).length;
      const diversityScore = totalODs > 0 ? (categories / 3) * 100 : 0;

      // Calculate trend (compare last month vs previous month)
      const now = new Date();
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      
      const lastMonthODs = menteeODs.filter(req => {
        const date = new Date(req.submittedAt);
        return date >= lastMonth && date < now;
      }).length;
      
      const previousMonthODs = menteeODs.filter(req => {
        const date = new Date(req.submittedAt);
        return date >= twoMonthsAgo && date < lastMonth;
      }).length;

      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (lastMonthODs > previousMonthODs) trend = 'up';
      else if (lastMonthODs < previousMonthODs) trend = 'down';

      // Calculate risk level
      const rejectionRate = totalODs > 0 ? (rejectedODs / totalODs) * 100 : 0;
      let riskLevel: 'low' | 'medium' | 'high' = 'low';
      if (totalODs > 5 || rejectionRate > 30) riskLevel = 'high';
      else if (totalODs > 3 || rejectionRate > 15) riskLevel = 'medium';

      return {
        id: mentee.id,
        name: mentee.name,
        rollNumber: mentee.rollNumber || 'N/A',
        totalODs,
        approvedODs,
        rejectedODs,
        pendingODs,
        averageApprovalTime: Math.round(avgApprovalTime),
        leetCodeProgress: mentee.leetCodeCompleted || 0,
        academicEvents,
        sportsEvents,
        technicalEvents,
        diversityScore,
        trend,
        riskLevel
      };
    });
  }, [mentees, odRequests, timePeriod]);

  // Overview analytics
  const overviewStats = useMemo(() => {
    const totalMentees = menteeStats.length;
    const activeMentees = menteeStats.filter(m => m.totalODs > 0).length;
    const highPerformers = menteeStats.filter(m => m.leetCodeProgress >= 50 && m.approvedODs > 2).length;
    const atRisk = menteeStats.filter(m => m.riskLevel === 'high').length;
    const avgODsPerMentee = totalMentees > 0 
      ? menteeStats.reduce((sum, m) => sum + m.totalODs, 0) / totalMentees 
      : 0;
    const avgLeetCodeProgress = totalMentees > 0
      ? menteeStats.reduce((sum, m) => sum + m.leetCodeProgress, 0) / totalMentees
      : 0;
    const avgDiversityScore = totalMentees > 0
      ? menteeStats.reduce((sum, m) => sum + m.diversityScore, 0) / totalMentees
      : 0;

    return {
      totalMentees,
      activeMentees,
      highPerformers,
      atRisk,
      avgODsPerMentee,
      avgLeetCodeProgress,
      avgDiversityScore
    };
  }, [menteeStats]);

  // Chart data
  const topPerformersData = useMemo(() => {
    return [...menteeStats]
      .sort((a, b) => (b.approvedODs + b.leetCodeProgress) - (a.approvedODs + a.leetCodeProgress))
      .slice(0, 5)
      .map(m => ({
        name: m.name.split(' ')[0],
        approvedODs: m.approvedODs,
        leetCode: m.leetCodeProgress,
        combined: m.approvedODs + m.leetCodeProgress
      }));
  }, [menteeStats]);

  const eventDistributionData = useMemo(() => {
    const total = menteeStats.reduce((sum, m) => sum + m.academicEvents + m.sportsEvents + m.technicalEvents, 0);
    
    return [
      {
        name: 'Academic',
        value: menteeStats.reduce((sum, m) => sum + m.academicEvents, 0),
        percentage: total > 0 ? (menteeStats.reduce((sum, m) => sum + m.academicEvents, 0) / total * 100).toFixed(1) : 0
      },
      {
        name: 'Technical',
        value: menteeStats.reduce((sum, m) => sum + m.technicalEvents, 0),
        percentage: total > 0 ? (menteeStats.reduce((sum, m) => sum + m.technicalEvents, 0) / total * 100).toFixed(1) : 0
      },
      {
        name: 'Sports',
        value: menteeStats.reduce((sum, m) => sum + m.sportsEvents, 0),
        percentage: total > 0 ? (menteeStats.reduce((sum, m) => sum + m.sportsEvents, 0) / total * 100).toFixed(1) : 0
      }
    ].filter(item => item.value > 0);
  }, [menteeStats]);

  const leetCodeComparisonData = useMemo(() => {
    return menteeStats.map(m => ({
      name: m.name.split(' ')[0],
      progress: m.leetCodeProgress,
      ods: m.totalODs
    }));
  }, [menteeStats]);

  const selectedMenteeData = menteeStats.find(m => m.id === selectedMentee);

  return (
    <div className="space-y-6">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl">Mentee Progress Analytics</h2>
          <p className="text-muted-foreground">Comprehensive performance insights for your mentees</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <Select value={timePeriod} onValueChange={(value) => setTimePeriod(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semester">Current Semester</SelectItem>
              <SelectItem value="month">Last Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Total Mentees</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{overviewStats.totalMentees}</div>
            <p className="text-xs text-muted-foreground">
              {overviewStats.activeMentees} active this period
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">High Performers</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-yellow-600">{overviewStats.highPerformers}</div>
            <p className="text-xs text-muted-foreground">
              Excellent OD & LeetCode progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">Avg ODs/Student</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-blue-600">{overviewStats.avgODsPerMentee.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              Average utilization rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm">At Risk</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-red-600">{overviewStats.atRisk}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">
            <PieChart className="h-4 w-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="individual">
            <User className="h-4 w-4 mr-2" />
            Individual
          </TabsTrigger>
          <TabsTrigger value="leetcode">
            <Code2 className="h-4 w-4 mr-2" />
            LeetCode
          </TabsTrigger>
          <TabsTrigger value="diversity">
            <Award className="h-4 w-4 mr-2" />
            Diversity
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Performers Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Top 5 Performers</CardTitle>
                <CardDescription>Combined OD approvals and LeetCode progress</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={topPerformersData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="approvedODs" fill="#3b82f6" name="Approved ODs" />
                    <Bar dataKey="leetCode" fill="#10b981" name="LeetCode %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Event Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Event Category Distribution</CardTitle>
                <CardDescription>Academic vs Technical vs Sports participation</CardDescription>
              </CardHeader>
              <CardContent>
                {eventDistributionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <RePieChart>
                      <Pie
                        data={eventDistributionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percentage }) => `${name}: ${percentage}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {eventDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RePieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                    No event data available
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Mentee Performance Table */}
          <Card>
            <CardHeader>
              <CardTitle>All Mentees Performance</CardTitle>
              <CardDescription>Comprehensive overview of mentee activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {menteeStats.map(mentee => (
                  <div key={mentee.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div>
                          <h4 className="font-medium">{mentee.name}</h4>
                          <p className="text-sm text-muted-foreground">{mentee.rollNumber}</p>
                        </div>
                        {mentee.trend === 'up' && <TrendingUp className="h-4 w-4 text-green-600" />}
                        {mentee.trend === 'down' && <TrendingDown className="h-4 w-4 text-red-600" />}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">ODs</div>
                        <div className="font-semibold">{mentee.totalODs}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Approved</div>
                        <div className="font-semibold text-green-600">{mentee.approvedODs}</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">LeetCode</div>
                        <div className="font-semibold text-blue-600">{mentee.leetCodeProgress}%</div>
                      </div>
                      
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground">Diversity</div>
                        <div className="font-semibold">{mentee.diversityScore.toFixed(0)}%</div>
                      </div>
                      
                      <Badge 
                        variant={mentee.riskLevel === 'high' ? 'destructive' : mentee.riskLevel === 'medium' ? 'default' : 'secondary'}
                      >
                        {mentee.riskLevel}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Individual Tab */}
        <TabsContent value="individual" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Individual Mentee Dashboard</CardTitle>
                  <CardDescription>Detailed performance analysis for specific student</CardDescription>
                </div>
                <Select value={selectedMentee} onValueChange={setSelectedMentee}>
                  <SelectTrigger className="w-[250px]">
                    <SelectValue placeholder="Select a mentee" />
                  </SelectTrigger>
                  <SelectContent>
                    {menteeStats.map(mentee => (
                      <SelectItem key={mentee.id} value={mentee.id}>
                        {mentee.name} ({mentee.rollNumber})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              {selectedMenteeData ? (
                <div className="space-y-6">
                  {/* Student Header */}
                  <div className="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                    <div>
                      <h3 className="text-xl">{selectedMenteeData.name}</h3>
                      <p className="text-muted-foreground">{selectedMenteeData.rollNumber}</p>
                    </div>
                    <Badge 
                      variant={selectedMenteeData.riskLevel === 'high' ? 'destructive' : selectedMenteeData.riskLevel === 'medium' ? 'default' : 'secondary'}
                      className="text-sm"
                    >
                      {selectedMenteeData.riskLevel.toUpperCase()} RISK
                    </Badge>
                  </div>

                  {/* Key Metrics */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Total ODs</div>
                      <div className="text-2xl">{selectedMenteeData.totalODs}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Approved</div>
                      <div className="text-2xl text-green-600">{selectedMenteeData.approvedODs}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Pending</div>
                      <div className="text-2xl text-amber-600">{selectedMenteeData.pendingODs}</div>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <div className="text-sm text-muted-foreground mb-1">Rejected</div>
                      <div className="text-2xl text-red-600">{selectedMenteeData.rejectedODs}</div>
                    </div>
                  </div>

                  {/* Progress Indicators */}
                  <div className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">LeetCode Progress</span>
                        <span className="text-sm">{selectedMenteeData.leetCodeProgress}%</span>
                      </div>
                      <Progress value={selectedMenteeData.leetCodeProgress} className="h-2" />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm">Event Diversity Score</span>
                        <span className="text-sm">{selectedMenteeData.diversityScore.toFixed(0)}%</span>
                      </div>
                      <Progress value={selectedMenteeData.diversityScore} className="h-2" />
                    </div>
                  </div>

                  {/* Event Breakdown */}
                  <div className="grid grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                        <div className="text-2xl">{selectedMenteeData.academicEvents}</div>
                        <div className="text-sm text-muted-foreground">Academic</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Laptop className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                        <div className="text-2xl">{selectedMenteeData.technicalEvents}</div>
                        <div className="text-sm text-muted-foreground">Technical</div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <Dumbbell className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <div className="text-2xl">{selectedMenteeData.sportsEvents}</div>
                        <div className="text-sm text-muted-foreground">Sports</div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Performance Insights */}
                  <Alert>
                    <Zap className="h-4 w-4" />
                    <AlertTitle>Performance Insights</AlertTitle>
                    <AlertDescription>
                      <div className="space-y-2 mt-2">
                        {selectedMenteeData.approvedODs > 3 && (
                          <div className="flex items-center text-sm">
                            <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                            <span>Highly active in extracurricular activities</span>
                          </div>
                        )}
                        {selectedMenteeData.leetCodeProgress >= 50 && (
                          <div className="flex items-center text-sm">
                            <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                            <span>Excellent LeetCode preparation</span>
                          </div>
                        )}
                        {selectedMenteeData.diversityScore > 66 && (
                          <div className="flex items-center text-sm">
                            <CheckCircle className="h-3 w-3 mr-2 text-green-600" />
                            <span>Well-rounded event participation</span>
                          </div>
                        )}
                        {selectedMenteeData.rejectedODs > 2 && (
                          <div className="flex items-center text-sm">
                            <AlertCircle className="h-3 w-3 mr-2 text-amber-600" />
                            <span>Multiple rejections - may need guidance on OD policies</span>
                          </div>
                        )}
                        {selectedMenteeData.totalODs > 5 && (
                          <div className="flex items-center text-sm">
                            <AlertCircle className="h-3 w-3 mr-2 text-red-600" />
                            <span>Exceeded recommended OD limit - monitor closely</span>
                          </div>
                        )}
                      </div>
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Select a mentee to view detailed analytics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* LeetCode Comparison Tab */}
        <TabsContent value="leetcode" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>LeetCode Progress Comparison</CardTitle>
              <CardDescription>Compare LeetCode completion rates across all mentees</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={leetCodeComparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="progress" fill="#10b981" name="LeetCode Progress %" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* LeetCode Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Average Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-blue-600">
                  {overviewStats.avgLeetCodeProgress.toFixed(1)}%
                </div>
                <Progress value={overviewStats.avgLeetCodeProgress} className="mt-3 h-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Completed (≥100%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-green-600">
                  {menteeStats.filter(m => m.leetCodeProgress >= 100).length}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  out of {menteeStats.length} mentees
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">In Progress (50-99%)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl text-amber-600">
                  {menteeStats.filter(m => m.leetCodeProgress >= 50 && m.leetCodeProgress < 100).length}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  working towards goal
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Individual LeetCode Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Individual LeetCode Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {menteeStats
                  .sort((a, b) => b.leetCodeProgress - a.leetCodeProgress)
                  .map(mentee => (
                    <div key={mentee.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{mentee.name}</div>
                        <div className="text-sm text-muted-foreground">{mentee.rollNumber}</div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="w-48">
                          <Progress value={mentee.leetCodeProgress} className="h-2" />
                        </div>
                        <div className="w-16 text-right">
                          <span className={`font-semibold ${
                            mentee.leetCodeProgress >= 100 ? 'text-green-600' :
                            mentee.leetCodeProgress >= 50 ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            {mentee.leetCodeProgress}%
                          </span>
                        </div>
                        {mentee.leetCodeProgress >= 100 && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Event Diversity Tab */}
        <TabsContent value="diversity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Event Diversity Analysis</CardTitle>
              <CardDescription>
                Track how mentees balance academic, technical, and sports activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Diversity Score Summary */}
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold">Average Diversity Score</h4>
                      <p className="text-sm text-muted-foreground">
                        Measures variety in event participation
                      </p>
                    </div>
                    <div className="text-3xl text-purple-600">
                      {overviewStats.avgDiversityScore.toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Individual Diversity Scores */}
                <div className="space-y-3">
                  {menteeStats
                    .sort((a, b) => b.diversityScore - a.diversityScore)
                    .map(mentee => (
                      <div key={mentee.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h4 className="font-medium">{mentee.name}</h4>
                            <p className="text-sm text-muted-foreground">{mentee.rollNumber}</p>
                          </div>
                          <Badge variant={
                            mentee.diversityScore > 66 ? 'default' :
                            mentee.diversityScore > 33 ? 'secondary' :
                            'outline'
                          }>
                            {mentee.diversityScore.toFixed(0)}% Diverse
                          </Badge>
                        </div>

                        <div className="grid grid-cols-3 gap-3 mb-2">
                          <div className="text-center p-2 bg-blue-50 rounded">
                            <BookOpen className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                            <div className="text-sm">{mentee.academicEvents}</div>
                            <div className="text-xs text-muted-foreground">Academic</div>
                          </div>
                          
                          <div className="text-center p-2 bg-purple-50 rounded">
                            <Laptop className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                            <div className="text-sm">{mentee.technicalEvents}</div>
                            <div className="text-xs text-muted-foreground">Technical</div>
                          </div>
                          
                          <div className="text-center p-2 bg-green-50 rounded">
                            <Dumbbell className="h-4 w-4 mx-auto mb-1 text-green-600" />
                            <div className="text-sm">{mentee.sportsEvents}</div>
                            <div className="text-xs text-muted-foreground">Sports</div>
                          </div>
                        </div>

                        <Progress value={mentee.diversityScore} className="h-2" />
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle>Recommendations</CardTitle>
              <CardDescription>Suggestions for improving mentee engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {menteeStats.filter(m => m.diversityScore < 50 && m.totalODs > 0).length > 0 && (
                  <Alert>
                    <Target className="h-4 w-4" />
                    <AlertTitle>Encourage Event Diversity</AlertTitle>
                    <AlertDescription>
                      {menteeStats.filter(m => m.diversityScore < 50 && m.totalODs > 0).length} student(s) 
                      are focusing on only one type of event. Encourage them to explore different categories.
                    </AlertDescription>
                  </Alert>
                )}

                {menteeStats.filter(m => m.sportsEvents === 0 && m.totalODs > 2).length > 0 && (
                  <Alert>
                    <Dumbbell className="h-4 w-4" />
                    <AlertTitle>Promote Sports Participation</AlertTitle>
                    <AlertDescription>
                      {menteeStats.filter(m => m.sportsEvents === 0 && m.totalODs > 2).length} active student(s) 
                      haven't participated in sports events. Consider encouraging physical activities.
                    </AlertDescription>
                  </Alert>
                )}

                {menteeStats.filter(m => m.technicalEvents === 0 && m.totalODs > 2).length > 0 && (
                  <Alert>
                    <Laptop className="h-4 w-4" />
                    <AlertTitle>Boost Technical Engagement</AlertTitle>
                    <AlertDescription>
                      {menteeStats.filter(m => m.technicalEvents === 0 && m.totalODs > 2).length} student(s) 
                      should be encouraged to participate in hackathons, workshops, or technical seminars.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
