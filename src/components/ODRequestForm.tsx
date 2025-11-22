import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Separator } from './ui/separator';
import { Upload, X, User, AlertTriangle, FileText, Calendar, Clock, CheckCircle2, Trophy, BookOpen, Plus, Trash2, Code2 } from 'lucide-react';
import { ODNotificationBanner } from './ODNotificationBanner';
import { TimePeriodSelector } from './TimePeriodSelector';
import { toast } from 'sonner@2.0.3';
import type { ODRequest } from '../App';
import { ALL_DEPARTMENTS, SCOFT_DEPARTMENTS, NON_SCOFT_DEPARTMENTS } from '../App';
import { validateLeetCodeCompletion, getLeetCodeStatusSummary, getRequirementMessage } from '../utils/leetCodeValidator';

interface ODRequestFormProps {
  currentUser: any;
  onSubmit: (requestData: Omit<ODRequest, 'id' | 'status' | 'submittedAt' | 'lastUpdated'>) => void;
  prefillData?: {
    fromDate?: string;
    toDate?: string;
    reason?: string;
    detailedReason?: string;
    description?: string;
  };
}

export function ODRequestForm({ currentUser, onSubmit, prefillData }: ODRequestFormProps) {
  const [formData, setFormData] = useState({
    studentDetails: {
      studentId: currentUser.id,
      studentName: currentUser.name,
      rollNumber: '',
      department: currentUser.department || '',
      year: '',
      phoneNumber: '',
      email: ''
    },
    fromDate: prefillData?.fromDate || '',
    toDate: prefillData?.toDate || '',
    odTime: [] as string[],
    reason: prefillData?.reason || '',
    detailedReason: prefillData?.detailedReason || '',
    description: prefillData?.description || '',
    documents: [] as File[],
    // Prize Information
    prizeInfo: {
      wonPrize: false,
      position: '' as '1st' | '2nd' | '3rd' | 'Participation' | '',
      cashPrize: 0
    },
    // Attendance Information
    attendanceInfo: [] as Array<{
      subjectCode: string;
      subjectName: string;
      currentPercentage: number;
    }>
  });

  const [dateError, setDateError] = useState<string>('');

  // Load student profile from localStorage on component mount
  useEffect(() => {
    const profileKey = `student_profile_${currentUser.id}`;
    const savedProfile = localStorage.getItem(profileKey);
    
    if (savedProfile) {
      try {
        const profile = JSON.parse(savedProfile);
        setFormData(prev => ({
          ...prev,
          studentDetails: {
            studentId: currentUser.id,
            studentName: profile.name || currentUser.name,
            rollNumber: profile.rollNumber || '',
            department: profile.department || currentUser.department || '',
            year: profile.year || '',
            phoneNumber: profile.phoneNumber || '',
            email: profile.email || ''
          }
        }));
      } catch (error) {
        console.error('Error loading student profile:', error);
      }
    }
  }, [currentUser.id, currentUser.name, currentUser.department]);

  const reasonOptions = [
    'Sports Competition',
    'Cultural Event',
    'Academic Conference',
    'Workshop/Seminar',
    'Job Interview',
    'Medical Appointment',
    'Family Emergency',
    'Research Work',
    'Other'
  ];

  // Validate OD date (must be submitted within 3 days after event completion)
  const validateODDate = (fromDate: string, toDate?: string): boolean => {
    if (!fromDate) return false;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day for accurate comparison
    
    const startDate = new Date(fromDate);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = toDate ? new Date(toDate) : new Date(fromDate);
    endDate.setHours(0, 0, 0, 0);
    
    // Validate that toDate is not before fromDate
    if (toDate && endDate < startDate) {
      setDateError('To date cannot be before from date.');
      return false;
    }
    
    // Check if event has already happened (endDate must be in the past)
    if (endDate >= today) {
      setDateError('OD requests can only be submitted after the event has been completed. Please wait until after the event ends.');
      return false;
    }
    
    // Check if submission is within 3 days of event completion
    const diffTime = today.getTime() - endDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays > 3) {
      setDateError(`OD requests must be submitted within 3 days after the event completion. Your event ended ${diffDays} days ago. Late submissions are not accepted.`);
      return false;
    }
    
    setDateError('');
    return true;
  };

  const handleFromDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, fromDate: date }));
    if (date) {
      validateODDate(date, formData.toDate);
    } else {
      setDateError('');
    }
  };

  const handleToDateChange = (date: string) => {
    setFormData(prev => ({ ...prev, toDate: date }));
    if (date && formData.fromDate) {
      validateODDate(formData.fromDate, date);
    } else {
      setDateError('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.studentDetails.studentName || !formData.studentDetails.rollNumber || 
        !formData.studentDetails.department || !formData.studentDetails.year ||
        !formData.studentDetails.phoneNumber || !formData.studentDetails.email) {
      toast.error('Please fill in all student details');
      return;
    }

    if (!formData.fromDate || !formData.toDate || !formData.odTime.length || !formData.reason || !formData.detailedReason) {
      toast.error('Please fill in all OD request details');
      return;
    }

    // Validate OD dates
    if (!validateODDate(formData.fromDate, formData.toDate)) {
      toast.error('Invalid OD dates. Please check the post-event submission requirement.');
      return;
    }

    // Validate LeetCode completion requirements
    const leetCodeValidation = validateLeetCodeCompletion(
      currentUser.id,
      formData.studentDetails.year
    );

    if (!leetCodeValidation.isValid) {
      toast.error('LeetCode Requirements Not Met', {
        description: leetCodeValidation.message,
        duration: 6000
      });
      return;
    }

    onSubmit(formData);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setFormData(prev => ({
      ...prev,
      documents: [...prev.documents, ...files]
    }));
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Important Notice */}
      <ODNotificationBanner type="warning" />

      {/* SECTION 1: STUDENT DETAILS */}
      <Card className="border-2 border-blue-200">
        <CardHeader className="bg-blue-50 space-y-1">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <User className="h-5 w-5 text-blue-600" />
            <span>Section 1: Student Details</span>
          </CardTitle>
          <CardDescription>
            All fields marked with <span className="text-red-500">*</span> are required
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="studentName" className="flex items-center">
                Student Name <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="studentName"
                value={formData.studentDetails.studentName}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  studentDetails: { ...prev.studentDetails, studentName: e.target.value }
                }))}
                placeholder="Enter your full name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="rollNumber" className="flex items-center">
                Roll Number <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="rollNumber"
                value={formData.studentDetails.rollNumber}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  studentDetails: { ...prev.studentDetails, rollNumber: e.target.value }
                }))}
                placeholder="e.g., CSE001"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="department" className="flex items-center">
                Department <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select 
                value={formData.studentDetails.department}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  studentDetails: { ...prev.studentDetails, department: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select your department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="header-scoft" disabled className="font-semibold text-blue-600">
                    SCOFT Departments
                  </SelectItem>
                  {SCOFT_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept} className="pl-4">
                      {dept}
                    </SelectItem>
                  ))}
                  <SelectItem value="header-non-scoft" disabled className="font-semibold text-purple-600">
                    NON-SCOFT Departments
                  </SelectItem>
                  {NON_SCOFT_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept} className="pl-4">
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="year" className="flex items-center">
                Academic Year <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select 
                value={formData.studentDetails.year}
                onValueChange={(value) => setFormData(prev => ({ 
                  ...prev, 
                  studentDetails: { ...prev.studentDetails, year: value }
                }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1st">1st Year</SelectItem>
                  <SelectItem value="2nd">2nd Year</SelectItem>
                  <SelectItem value="3rd">3rd Year</SelectItem>
                  <SelectItem value="4th">4th Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber" className="flex items-center">
                Phone Number <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="phoneNumber"
                type="tel"
                value={formData.studentDetails.phoneNumber}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  studentDetails: { ...prev.studentDetails, phoneNumber: e.target.value }
                }))}
                placeholder="+91 9876543210"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center">
                Email Address <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.studentDetails.email}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  studentDetails: { ...prev.studentDetails, email: e.target.value }
                }))}
                placeholder="student@college.edu"
                required
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* LEETCODE REQUIREMENT STATUS */}
      {formData.studentDetails.year && (() => {
        const leetCodeStatus = getLeetCodeStatusSummary(currentUser.id, formData.studentDetails.year);
        return (
          <Card className={`border-2 ${
            leetCodeStatus.status === 'complete' ? 'border-green-300 bg-green-50' : 
            leetCodeStatus.status === 'incomplete' ? 'border-yellow-300 bg-yellow-50' : 
            'border-red-300 bg-red-50'
          }`}>
            <CardHeader className={
              leetCodeStatus.status === 'complete' ? 'bg-green-100' : 
              leetCodeStatus.status === 'incomplete' ? 'bg-yellow-100' : 
              'bg-red-100'
            }>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Code2 className={`h-5 w-5 ${
                  leetCodeStatus.status === 'complete' ? 'text-green-600' : 
                  leetCodeStatus.status === 'incomplete' ? 'text-yellow-600' : 
                  'text-red-600'
                }`} />
                <span>LeetCode Completion Requirement</span>
                {leetCodeStatus.status === 'complete' && (
                  <CheckCircle2 className="h-5 w-5 text-green-600 ml-auto" />
                )}
                {leetCodeStatus.status === 'incomplete' && (
                  <AlertTriangle className="h-5 w-5 text-yellow-600 ml-auto" />
                )}
                {leetCodeStatus.status === 'no-data' && (
                  <AlertTriangle className="h-5 w-5 text-red-600 ml-auto" />
                )}
              </CardTitle>
              <CardDescription className={
                leetCodeStatus.status === 'complete' ? 'text-green-700' : 
                leetCodeStatus.status === 'incomplete' ? 'text-yellow-700' : 
                'text-red-700'
              }>
                {getRequirementMessage(formData.studentDetails.year)}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {leetCodeStatus.hasData && leetCodeStatus.currentWeek ? (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className={`p-3 rounded-lg ${
                        leetCodeStatus.currentWeek.difficulty.easy > 0 ? 'bg-green-100 border border-green-300' : 'bg-gray-100 border border-gray-300'
                      }`}>
                        <div className="text-center">
                          <div className="text-2xl font-medium">{leetCodeStatus.currentWeek.difficulty.easy}</div>
                          <div className="text-sm">Easy Problems</div>
                          {leetCodeStatus.requiredDifficulties.includes('easy') && (
                            <div className="text-xs mt-1">
                              {leetCodeStatus.currentWeek.difficulty.easy > 0 ? '✓ Required' : '⚠ Required'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        leetCodeStatus.currentWeek.difficulty.medium > 0 ? 'bg-yellow-100 border border-yellow-300' : 'bg-gray-100 border border-gray-300'
                      }`}>
                        <div className="text-center">
                          <div className="text-2xl font-medium">{leetCodeStatus.currentWeek.difficulty.medium}</div>
                          <div className="text-sm">Medium Problems</div>
                          {leetCodeStatus.requiredDifficulties.includes('medium') && (
                            <div className="text-xs mt-1">
                              {leetCodeStatus.currentWeek.difficulty.medium > 0 ? '✓ Required' : '⚠ Required'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className={`p-3 rounded-lg ${
                        leetCodeStatus.currentWeek.difficulty.hard > 0 ? 'bg-red-100 border border-red-300' : 'bg-gray-100 border border-gray-300'
                      }`}>
                        <div className="text-center">
                          <div className="text-2xl font-medium">{leetCodeStatus.currentWeek.difficulty.hard}</div>
                          <div className="text-sm">Hard Problems</div>
                          {leetCodeStatus.requiredDifficulties.includes('hard') && (
                            <div className="text-xs mt-1">
                              {leetCodeStatus.currentWeek.difficulty.hard > 0 ? '✓ Required' : '⚠ Required'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className={`p-3 rounded-lg border ${
                      leetCodeStatus.status === 'complete' ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'
                    }`}>
                      <p className={`text-sm ${
                        leetCodeStatus.status === 'complete' ? 'text-green-800' : 'text-yellow-800'
                      }`}>
                        <strong>Current Week {leetCodeStatus.currentWeek.weekNumber}:</strong> {leetCodeStatus.message}
                      </p>
                    </div>
                  </>
                ) : (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      <p className="mb-2">You must start tracking your LeetCode progress before submitting an OD request.</p>
                      <p className="text-sm">Go to your dashboard and click on \"LeetCode Weekly Tracker\" to start tracking your progress.</p>
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      <Separator className="my-6" />

      {/* SECTION 2: OD DATE RANGE */}
      <Card className="border-2 border-green-200">
        <CardHeader className="bg-green-50">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Calendar className="h-5 w-5 text-green-600" />
            <span>Section 2: OD Date Range</span>
          </CardTitle>
          <CardDescription>
            Select the dates when you attended the event (must be completed event, within last 3 days)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fromDate" className="flex items-center">
                Event Start Date <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="fromDate"
                type="date"
                value={formData.fromDate}
                onChange={(e) => handleFromDateChange(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                required
                className={dateError ? 'border-red-500' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Event must have already occurred
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toDate" className="flex items-center">
                Event End Date <span className="text-red-500 ml-1">*</span>
              </Label>
              <Input
                id="toDate"
                type="date"
                value={formData.toDate}
                onChange={(e) => handleToDateChange(e.target.value)}
                min={formData.fromDate}
                max={new Date().toISOString().split('T')[0]}
                required
                className={dateError ? 'border-red-500' : ''}
              />
              <p className="text-xs text-muted-foreground">
                Submit within 3 days of event completion
              </p>
            </div>
          </div>

          {dateError && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                {dateError}
              </AlertDescription>
            </Alert>
          )}

          {formData.fromDate && formData.toDate && !dateError && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">
                <strong>Selected Period:</strong> {new Date(formData.fromDate).toLocaleDateString()} 
                {formData.fromDate !== formData.toDate && ` to ${new Date(formData.toDate).toLocaleDateString()}`}
                {formData.fromDate === formData.toDate && ' (Single Day)'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* SECTION 3: TIME PERIODS */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-purple-50">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Clock className="h-5 w-5 text-purple-600" />
            <span>Section 3: Time Periods</span>
          </CardTitle>
          <CardDescription>
            Select the time periods you need OD for
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <TimePeriodSelector
            selectedPeriods={formData.odTime}
            onPeriodsChange={(periods) => setFormData(prev => ({ ...prev, odTime: periods }))}
          />
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* SECTION 4: REASON FOR OD */}
      <Card className="border-2 border-orange-200">
        <CardHeader className="bg-orange-50">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <FileText className="h-5 w-5 text-orange-600" />
            <span>Section 4: Reason for OD</span>
          </CardTitle>
          <CardDescription>
            Provide category and detailed reason for your request
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason" className="flex items-center">
              Category <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select 
              value={formData.reason}
              onValueChange={(value) => setFormData(prev => ({ ...prev, reason: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select reason category" />
              </SelectTrigger>
              <SelectContent>
                {reasonOptions.map((reason) => (
                  <SelectItem key={reason} value={reason}>
                    {reason}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="detailedReason" className="flex items-center">
              Detailed Reason <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="detailedReason"
              placeholder="Provide specific details about the reason for your OD (e.g., 'Inter-college basketball tournament at Anna University representing college team')"
              value={formData.detailedReason}
              onChange={(e) => setFormData(prev => ({ ...prev, detailedReason: e.target.value }))}
              required
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Include event name, organization, location, and your role
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">
              Additional Information (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add any additional information that may be helpful for approval..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="resize-none"
            />
          </div>
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* SECTION 5: PRIZE/AWARD INFORMATION */}
      <Card className="border-2 border-yellow-200">
        <CardHeader className="bg-yellow-50">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-600" />
            <span>Section 5: Prize/Award Information (Optional)</span>
          </CardTitle>
          <CardDescription>
            Fill this section if you won or expect to win any prizes at the event
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label className="flex items-center">
              Did you win or expect to win a prize?
            </Label>
            <Select 
              value={formData.prizeInfo.wonPrize ? 'yes' : 'no'}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                prizeInfo: { 
                  ...prev.prizeInfo, 
                  wonPrize: value === 'yes',
                  position: value === 'no' ? '' : prev.prizeInfo.position,
                  cashPrize: value === 'no' ? 0 : prev.prizeInfo.cashPrize
                }
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="no">No</SelectItem>
                <SelectItem value="yes">Yes</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.prizeInfo.wonPrize && (
            <>
              <div className="space-y-2">
                <Label htmlFor="position">
                  Position/Achievement
                </Label>
                <Select 
                  value={formData.prizeInfo.position}
                  onValueChange={(value) => setFormData(prev => ({ 
                    ...prev, 
                    prizeInfo: { ...prev.prizeInfo, position: value as '1st' | '2nd' | '3rd' | 'Participation' }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Place</SelectItem>
                    <SelectItem value="2nd">2nd Place</SelectItem>
                    <SelectItem value="3rd">3rd Place</SelectItem>
                    <SelectItem value="Participation">Participation Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cashPrize">
                  Cash Prize Amount (₹)
                </Label>
                <Input
                  id="cashPrize"
                  type="number"
                  min="0"
                  value={formData.prizeInfo.cashPrize || ''}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    prizeInfo: { ...prev.prizeInfo, cashPrize: Number(e.target.value) || 0 }
                  }))}
                  placeholder="Enter cash prize amount (if any)"
                />
                <p className="text-xs text-muted-foreground">
                  Enter 0 if no cash prize was awarded
                </p>
              </div>

              {formData.prizeInfo.position && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-sm text-yellow-800">
                    <strong>Achievement Summary:</strong> {formData.prizeInfo.position} position
                    {formData.prizeInfo.cashPrize > 0 && ` with ₹${formData.prizeInfo.cashPrize} cash prize`}
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* SECTION 6: ATTENDANCE INFORMATION */}
      <Card className="border-2 border-pink-200">
        <CardHeader className="bg-pink-50">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <BookOpen className="h-5 w-5 text-pink-600" />
            <span>Section 6: Attendance Information</span>
          </CardTitle>
          <CardDescription>
            Provide your current attendance details for subjects that will be affected
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          {formData.attendanceInfo.map((subject, index) => (
            <Card key={index} className="border border-gray-200">
              <CardContent className="pt-4 space-y-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Subject {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setFormData(prev => ({
                        ...prev,
                        attendanceInfo: prev.attendanceInfo.filter((_, i) => i !== index)
                      }));
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label>Subject Code</Label>
                    <Input
                      value={subject.subjectCode}
                      onChange={(e) => {
                        const newAttendance = [...formData.attendanceInfo];
                        newAttendance[index].subjectCode = e.target.value;
                        setFormData(prev => ({ ...prev, attendanceInfo: newAttendance }));
                      }}
                      placeholder="e.g., CSE401"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject Name</Label>
                    <Input
                      value={subject.subjectName}
                      onChange={(e) => {
                        const newAttendance = [...formData.attendanceInfo];
                        newAttendance[index].subjectName = e.target.value;
                        setFormData(prev => ({ ...prev, attendanceInfo: newAttendance }));
                      }}
                      placeholder="e.g., Data Structures"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Current Attendance %</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={subject.currentPercentage || ''}
                      onChange={(e) => {
                        const newAttendance = [...formData.attendanceInfo];
                        newAttendance[index].currentPercentage = Number(e.target.value) || 0;
                        setFormData(prev => ({ ...prev, attendanceInfo: newAttendance }));
                      }}
                      placeholder="e.g., 85.5"
                    />
                  </div>
                </div>
                {subject.currentPercentage > 0 && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          subject.currentPercentage >= 75 ? 'bg-green-500' : 
                          subject.currentPercentage >= 65 ? 'bg-yellow-500' : 'bg-red-500'
                        }`}
                        style={{ width: `${Math.min(subject.currentPercentage, 100)}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {subject.currentPercentage >= 75 ? 'Good attendance' : 
                       subject.currentPercentage >= 65 ? 'Average attendance' : 'Below requirement'}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setFormData(prev => ({
                ...prev,
                attendanceInfo: [
                  ...prev.attendanceInfo,
                  { subjectCode: '', subjectName: '', currentPercentage: 0 }
                ]
              }));
            }}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Subject Attendance
          </Button>

          {formData.attendanceInfo.length > 0 && (
            <div className="p-3 bg-pink-50 rounded-lg border border-pink-200">
              <p className="text-sm text-pink-800">
                <strong>Average Attendance:</strong> {(
                  formData.attendanceInfo.reduce((sum, s) => sum + s.currentPercentage, 0) / 
                  formData.attendanceInfo.length
                ).toFixed(2)}%
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator className="my-6" />

      {/* SECTION 7: SUPPORTING DOCUMENTS */}
      <Card className="border-2 border-indigo-200">
        <CardHeader className="bg-indigo-50">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Upload className="h-5 w-5 text-indigo-600" />
            <span>Section 7: Supporting Documents</span>
          </CardTitle>
          <CardDescription>
            Upload invitation letters, registration proof, or other relevant documents (Optional but recommended)
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Card className="border-dashed border-2 bg-gray-50">
            <CardContent className="p-6">
              <div className="text-center">
                <Upload className="h-10 w-10 mx-auto text-gray-400 mb-3" />
                <div className="text-sm text-gray-600 mb-3">
                  Upload supporting documents (PDF, DOC, JPG, PNG)
                </div>
                <Input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="file-upload"
                />
                <Label htmlFor="file-upload">
                  <Button type="button" variant="outline" className="pointer-events-none">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </Label>
                <p className="text-xs text-gray-500 mt-2">
                  Maximum file size: 5MB per file
                </p>
              </div>
            </CardContent>
          </Card>

          {formData.documents.length > 0 && (
            <div className="space-y-2">
              <Label>Uploaded Files ({formData.documents.length})</Label>
              <div className="space-y-2">
                {formData.documents.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                    <div className="flex items-center space-x-2">
                      <FileText className="h-4 w-4 text-gray-500" />
                      <span className="text-sm">{file.name}</span>
                      <span className="text-xs text-gray-500">
                        ({Math.round(file.size / 1024)} KB)
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary and Submit */}
      <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-2 border-blue-300">
        <CardHeader>
          <CardTitle className="text-base">Request Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-700 mb-2">Student Information:</div>
              <div className="space-y-1 text-xs">
                <div>Name: <span className="font-medium">{formData.studentDetails.studentName || '-'}</span></div>
                <div>Roll No: <span className="font-medium">{formData.studentDetails.rollNumber || '-'}</span></div>
                <div>Department: <span className="font-medium">{formData.studentDetails.department || '-'}</span></div>
                <div>Year: <span className="font-medium">{formData.studentDetails.year || '-'}</span></div>
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-700 mb-2">OD Information:</div>
              <div className="space-y-1 text-xs">
                <div>Dates: <span className="font-medium">
                  {formData.fromDate && formData.toDate 
                    ? `${new Date(formData.fromDate).toLocaleDateString()} - ${new Date(formData.toDate).toLocaleDateString()}`
                    : '-'
                  }
                </span></div>
                <div>Time Periods: <span className="font-medium">{formData.odTime.length || 0} selected</span></div>
                <div>Reason: <span className="font-medium">{formData.reason || '-'}</span></div>
                <div>Documents: <span className="font-medium">{formData.documents.length} file(s)</span></div>
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-700 mb-2">Additional Details:</div>
              <div className="space-y-1 text-xs">
                <div>Prize/Award: <span className="font-medium">
                  {formData.prizeInfo.wonPrize && formData.prizeInfo.position 
                    ? `${formData.prizeInfo.position}${formData.prizeInfo.cashPrize > 0 ? ` (₹${formData.prizeInfo.cashPrize})` : ''}`
                    : 'None'
                  }
                </span></div>
                <div>Attendance Records: <span className="font-medium">{formData.attendanceInfo.length} subject(s)</span></div>
                {formData.attendanceInfo.length > 0 && (
                  <div>Avg. Attendance: <span className="font-medium">
                    {(formData.attendanceInfo.reduce((sum, s) => sum + s.currentPercentage, 0) / formData.attendanceInfo.length).toFixed(1)}%
                  </span></div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 sticky bottom-0 bg-white pb-2 border-t">
        <Button 
          type="submit"
          className="bg-green-600 hover:bg-green-700"
          size="lg"
        >
          <CheckCircle2 className="h-5 w-5 mr-2" />
          Submit OD Request
        </Button>
      </div>
    </form>
  );
}