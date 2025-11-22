import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Download, Eye, CheckCircle, XCircle, Search, FileText, FolderOpen, Calendar } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { User, Certificate, ODRequest } from '../App';
import { SCOFT_DEPARTMENTS } from '../App';

interface CertificateManagerProps {
  user: User;
  certificates: Certificate[];
  setCertificates: React.Dispatch<React.SetStateAction<Certificate[]>>;
  odRequests: ODRequest[];
}

export function CertificateManager({ user, certificates, setCertificates, odRequests }: CertificateManagerProps) {
  const [selectedCertificate, setSelectedCertificate] = useState<Certificate | null>(null);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [feedback, setFeedback] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');

  // Get certificates for the HOD's department
  const departmentCertificates = certificates.filter(cert => {
    const request = odRequests.find(req => req.id === cert.odRequestId);
    return request?.studentDetails.department === user.department;
  });

  // Filter certificates
  const filteredCertificates = departmentCertificates.filter(cert => {
    const request = odRequests.find(req => req.id === cert.odRequestId);
    if (!request) return false;

    const matchesSearch = 
      request.studentDetails.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.studentDetails.rollNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.reason.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cert.fileName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filterStatus === 'all' || cert.status === filterStatus;

    const uploadDate = new Date(cert.uploadedAt);
    const matchesYear = filterYear === 'all' || uploadDate.getFullYear().toString() === filterYear;
    const matchesMonth = filterMonth === 'all' || uploadDate.getMonth().toString() === filterMonth;

    return matchesSearch && matchesStatus && matchesYear && matchesMonth;
  });

  // Group certificates by year and month
  const certificatesByPeriod = filteredCertificates.reduce((acc, cert) => {
    const date = new Date(cert.uploadedAt);
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(date);
    
    const key = `${year}-${monthName}`;
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(cert);
    return acc;
  }, {} as Record<string, Certificate[]>);

  const handleCertificateAction = (certificate: Certificate, action: 'approve' | 'reject', feedbackText: string) => {
    const newStatus: Certificate['status'] = action === 'approve' ? 'hod_approved' : 'hod_rejected';
    
    setCertificates(prev => prev.map(cert => 
      cert.id === certificate.id 
        ? { 
            ...cert, 
            status: newStatus, 
            hodFeedback: feedbackText,
            hodApprovedAt: action === 'approve' ? new Date().toISOString() : undefined
          }
        : cert
    ));

    // Update corresponding OD request status
    if (action === 'approve') {
      // Update the OD request to mark certificate as approved
      // This would typically be handled by the parent component
    }

    toast.success(`Certificate ${action}ed successfully`);
    setSelectedCertificate(null);
    setFeedback('');
  };

  const downloadCertificate = (certificate: Certificate) => {
    try {
      // Create blob from base64 data
      const byteCharacters = atob(certificate.fileData.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = certificate.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Certificate downloaded successfully');
    } catch (error) {
      toast.error('Failed to download certificate');
    }
  };

  const downloadDepartmentCertificates = (period?: string) => {
    const certificatesToDownload = period 
      ? certificatesByPeriod[period] 
      : departmentCertificates.filter(cert => cert.status === 'hod_approved');

    if (certificatesToDownload.length === 0) {
      toast.error('No certificates to download');
      return;
    }

    // In a real application, you would create a ZIP file with all certificates
    toast.success(`Preparing download of ${certificatesToDownload.length} certificates...`);
  };

  const getStatusBadge = (status: Certificate['status']) => {
    switch (status) {
      case 'uploaded':
        return <Badge className="bg-blue-100 text-blue-800">Pending Review</Badge>;
      case 'hod_approved':
        return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
      case 'hod_rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  // Check if department is SCOFT or NON-SCOFT
  const departmentCategory = (SCOFT_DEPARTMENTS as readonly string[]).includes(user.department || '') ? 'SCOFT' : 'NON-SCOFT';

  // Get unique years and months from certificates
  const availableYears = Array.from(new Set(
    departmentCertificates.map(cert => new Date(cert.uploadedAt).getFullYear())
  )).sort((a, b) => b - a);

  const availableMonths = [
    { value: '0', label: 'January' }, { value: '1', label: 'February' }, { value: '2', label: 'March' },
    { value: '3', label: 'April' }, { value: '4', label: 'May' }, { value: '5', label: 'June' },
    { value: '6', label: 'July' }, { value: '7', label: 'August' }, { value: '8', label: 'September' },
    { value: '9', label: 'October' }, { value: '10', label: 'November' }, { value: '11', label: 'December' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Certificate Management</h2>
          <p className="text-muted-foreground">
            {departmentCategory} Department - {user.department}
          </p>
        </div>
        <Button 
          onClick={() => downloadDepartmentCertificates()}
          className="bg-green-600 hover:bg-green-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Download All Approved
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Total Certificates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl">{departmentCertificates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-amber-600">
              {departmentCertificates.filter(cert => cert.status === 'uploaded').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl text-green-600">
              {departmentCertificates.filter(cert => cert.status === 'hod_approved').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Department Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg">
              <Badge className={departmentCategory === 'SCOFT' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}>
                {departmentCategory}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="review" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="review">Certificate Review</TabsTrigger>
          <TabsTrigger value="archive">Department Archive</TabsTrigger>
        </TabsList>

        <TabsContent value="review">
          <Card>
            <CardHeader>
              <CardTitle>Pending Certificate Reviews</CardTitle>
              <CardDescription>Review and approve/reject student certificates</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by student name, roll number, or reason..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="uploaded">Pending Review</SelectItem>
                    <SelectItem value="hod_approved">Approved</SelectItem>
                    <SelectItem value="hod_rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {filteredCertificates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>No certificates found</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Student Details</TableHead>
                      <TableHead>OD Details</TableHead>
                      <TableHead>Certificate</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredCertificates.map((certificate) => {
                      const request = odRequests.find(req => req.id === certificate.odRequestId);
                      return (
                        <TableRow key={certificate.id}>
                          <TableCell>
                            <div>
                              <div>{request?.studentDetails.studentName}</div>
                              <div className="text-sm text-muted-foreground">
                                {request?.studentDetails.rollNumber} - {request?.studentDetails.year}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div>
                              <div>{request?.reason}</div>
                              <div className="text-sm text-muted-foreground">
                                {request?.odDate && new Date(request.odDate).toLocaleDateString()}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <FileText className="h-4 w-4" />
                              <span className="text-sm truncate max-w-xs">{certificate.fileName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              {new Date(certificate.uploadedAt).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(certificate.status)}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => downloadCertificate(certificate)}
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              
                              {certificate.status === 'uploaded' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => {
                                      setSelectedCertificate(certificate);
                                      setActionType('approve');
                                    }}
                                  >
                                    <CheckCircle className="h-4 w-4" />
                                  </Button>

                                  <Button 
                                    size="sm" 
                                    variant="destructive"
                                    onClick={() => {
                                      setSelectedCertificate(certificate);
                                      setActionType('reject');
                                    }}
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </>
                              )}
                            </div>
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

        <TabsContent value="archive">
          <Card>
            <CardHeader>
              <CardTitle>Department Certificate Archive</CardTitle>
              <CardDescription>Browse certificates organized by year and month</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Archive Filters */}
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <Select value={filterYear} onValueChange={setFilterYear}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Years</SelectItem>
                    {availableYears.map(year => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterMonth} onValueChange={setFilterMonth}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Filter by month" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Months</SelectItem>
                    {availableMonths.map(month => (
                      <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Folder View */}
              <div className="space-y-4">
                {Object.entries(certificatesByPeriod).map(([period, certs]) => (
                  <Card key={period} className="border-l-4 border-l-blue-500">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="flex items-center space-x-2">
                          <FolderOpen className="h-5 w-5" />
                          <span>{period}</span>
                          <Badge variant="secondary">{certs.length} certificates</Badge>
                        </CardTitle>
                        <Button
                          size="sm"
                          onClick={() => downloadDepartmentCertificates(period)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download Period
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-muted-foreground">
                        {certs.filter(cert => cert.status === 'hod_approved').length} approved, {' '}
                        {certs.filter(cert => cert.status === 'uploaded').length} pending, {' '}
                        {certs.filter(cert => cert.status === 'hod_rejected').length} rejected
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Dialog */}
      <Dialog open={!!selectedCertificate} onOpenChange={() => setSelectedCertificate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              {actionType === 'approve' ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              <span>{actionType === 'approve' ? 'Approve Certificate' : 'Reject Certificate'}</span>
            </DialogTitle>
            <DialogDescription>
              {selectedCertificate && (
                <div className="space-y-2">
                  <p><strong>Student:</strong> {odRequests.find(req => req.id === selectedCertificate.odRequestId)?.studentDetails.studentName}</p>
                  <p><strong>Certificate:</strong> {selectedCertificate.fileName}</p>
                </div>
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">
                {actionType === 'approve' ? 'Approval Comments (Optional)' : 'Rejection Reason (Required)'}
              </Label>
              <Textarea
                id="feedback"
                placeholder={
                  actionType === 'approve' 
                    ? 'Add approval comments...'
                    : 'Please provide reason for rejection...'
                }
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                required={actionType === 'reject'}
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setSelectedCertificate(null)}>
                Cancel
              </Button>
              <Button
                onClick={() => selectedCertificate && handleCertificateAction(selectedCertificate, actionType, feedback)}
                disabled={actionType === 'reject' && !feedback.trim()}
                className={actionType === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
              >
                {actionType === 'approve' ? 'Approve Certificate' : 'Reject Certificate'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}