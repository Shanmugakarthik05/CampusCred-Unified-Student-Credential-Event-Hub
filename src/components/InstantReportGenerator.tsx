import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Download, FileText, Table as TableIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { ODRequest, User } from '../App';
import { ALL_DEPARTMENTS } from '../App';

interface InstantReportGeneratorProps {
  odRequests: ODRequest[];
  allUsers: User[];
}

export function InstantReportGenerator({ odRequests, allUsers }: InstantReportGeneratorProps) {
  const [reportType, setReportType] = useState<'department' | 'gender' | 'eventType'>('department');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [format, setFormat] = useState<'csv' | 'pdf'>('csv');

  // Get unique months from OD requests
  const months = Array.from(
    new Set(
      odRequests.map(req => {
        const date = new Date(req.submittedAt);
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      })
    )
  ).sort().reverse();

  // Filter requests by selected month
  const getFilteredRequests = () => {
    if (selectedMonth === 'all') return odRequests;
    
    return odRequests.filter(req => {
      const date = new Date(req.submittedAt);
      const reqMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      return reqMonth === selectedMonth;
    });
  };

  // Categorize OD by type
  const categorizeOD = (reason: string): string => {
    const lowerReason = reason.toLowerCase();
    if (lowerReason.includes('academic') || lowerReason.includes('seminar') || lowerReason.includes('workshop')) return 'Academic';
    if (lowerReason.includes('nss') || lowerReason.includes('social')) return 'NSS';
    if (lowerReason.includes('sport') || lowerReason.includes('tournament')) return 'Sports';
    if (lowerReason.includes('technical') || lowerReason.includes('hackathon')) return 'Technical';
    if (lowerReason.includes('cultural') || lowerReason.includes('fest')) return 'Cultural';
    return 'Other';
  };

  // Generate CSV content based on report type
  const generateCSV = () => {
    const filteredRequests = getFilteredRequests();
    let csvContent = '';
    let headers: string[] = [];
    let rows: string[][] = [];

    if (reportType === 'department') {
      headers = ['Department', 'Total Requests', 'Approved', 'Pending', 'Rejected', 'Approval Rate'];
      
      const deptStats = ALL_DEPARTMENTS.map(dept => {
        const deptRequests = filteredRequests.filter(req => req.studentDetails.department === dept);
        const approved = deptRequests.filter(req => 
          ['mentor_approved', 'completed', 'certificate_uploaded', 'certificate_approved'].includes(req.status)
        ).length;
        const pending = deptRequests.filter(req => req.status === 'submitted').length;
        const rejected = deptRequests.filter(req => req.status === 'mentor_rejected').length;
        const approvalRate = deptRequests.length > 0 ? ((approved / deptRequests.length) * 100).toFixed(1) : '0';
        
        return [
          dept,
          deptRequests.length.toString(),
          approved.toString(),
          pending.toString(),
          rejected.toString(),
          `${approvalRate}%`
        ];
      }).filter(row => parseInt(row[1]) > 0);

      rows = deptStats;
    } else if (reportType === 'gender') {
      headers = ['Gender', 'Total Requests', 'Approved', 'Pending', 'Rejected'];
      
      const genderStats: Record<string, { total: number; approved: number; pending: number; rejected: number }> = {
        Male: { total: 0, approved: 0, pending: 0, rejected: 0 },
        Female: { total: 0, approved: 0, pending: 0, rejected: 0 },
        Other: { total: 0, approved: 0, pending: 0, rejected: 0 }
      };

      filteredRequests.forEach(req => {
        // Try to infer gender from name or use 'Other' as default
        const gender = 'Other'; // In real implementation, this would come from user profile
        genderStats[gender].total++;
        if (['mentor_approved', 'completed', 'certificate_uploaded', 'certificate_approved'].includes(req.status)) {
          genderStats[gender].approved++;
        } else if (req.status === 'submitted') {
          genderStats[gender].pending++;
        } else if (req.status === 'mentor_rejected') {
          genderStats[gender].rejected++;
        }
      });

      rows = Object.entries(genderStats).map(([gender, stats]) => [
        gender,
        stats.total.toString(),
        stats.approved.toString(),
        stats.pending.toString(),
        stats.rejected.toString()
      ]);
    } else if (reportType === 'eventType') {
      headers = ['Event Type', 'Total Requests', 'Approved', 'Pending', 'Rejected'];
      
      const eventTypeStats: Record<string, { total: number; approved: number; pending: number; rejected: number }> = {};

      filteredRequests.forEach(req => {
        const category = categorizeOD(req.reason);
        if (!eventTypeStats[category]) {
          eventTypeStats[category] = { total: 0, approved: 0, pending: 0, rejected: 0 };
        }
        
        eventTypeStats[category].total++;
        if (['mentor_approved', 'completed', 'certificate_uploaded', 'certificate_approved'].includes(req.status)) {
          eventTypeStats[category].approved++;
        } else if (req.status === 'submitted') {
          eventTypeStats[category].pending++;
        } else if (req.status === 'mentor_rejected') {
          eventTypeStats[category].rejected++;
        }
      });

      rows = Object.entries(eventTypeStats).map(([eventType, stats]) => [
        eventType,
        stats.total.toString(),
        stats.approved.toString(),
        stats.pending.toString(),
        stats.rejected.toString()
      ]);
    }

    // Build CSV
    csvContent = headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
    });

    return csvContent;
  };

  // Download CSV
  const downloadCSV = () => {
    const csvContent = generateCSV();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    const monthLabel = selectedMonth === 'all' ? 'All_Time' : selectedMonth;
    const fileName = `OD_Report_${reportType}_${monthLabel}.csv`;
    
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Report downloaded successfully!');
  };

  // Generate PDF (simplified version - in real app, use a library like jsPDF)
  const downloadPDF = () => {
    toast.info('PDF generation coming soon! For now, please use CSV format.');
  };

  const handleDownload = () => {
    if (format === 'csv') {
      downloadCSV();
    } else {
      downloadPDF();
    }
  };

  const filteredCount = getFilteredRequests().length;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5" />
          <span>Instant Report Generation</span>
        </CardTitle>
        <CardDescription>One-click monthly OD summary by department, gender, or event type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Report Type</label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="department">By Department</SelectItem>
                  <SelectItem value="gender">By Gender</SelectItem>
                  <SelectItem value="eventType">By Event Type</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Time Period</label>
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  {months.map(month => {
                    const [year, monthNum] = month.split('-');
                    const monthName = new Date(parseInt(year), parseInt(monthNum) - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    return (
                      <SelectItem key={month} value={month}>
                        {monthName}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Format</label>
              <Select value={format} onValueChange={(value: any) => setFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Preview Stats */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold mb-1">Report Preview</h4>
                <p className="text-sm text-muted-foreground">
                  This report will include {filteredCount} OD {filteredCount === 1 ? 'request' : 'requests'}
                </p>
              </div>
              <Button onClick={handleDownload} className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download Report</span>
              </Button>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <TableIcon className="h-6 w-6 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-semibold text-blue-600">{filteredCount}</div>
              <div className="text-sm text-muted-foreground">Total Records</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Download className="h-6 w-6 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-semibold text-green-600">{format.toUpperCase()}</div>
              <div className="text-sm text-muted-foreground">Export Format</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <FileText className="h-6 w-6 mx-auto mb-2 text-purple-600" />
              <div className="text-2xl font-semibold text-purple-600 capitalize">{reportType}</div>
              <div className="text-sm text-muted-foreground">Report Type</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
