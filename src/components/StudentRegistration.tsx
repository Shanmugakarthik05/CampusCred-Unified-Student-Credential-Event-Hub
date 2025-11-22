import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { GraduationCap, User, Mail, Phone, Building2, Hash, CheckCircle } from 'lucide-react';
import { ALL_DEPARTMENTS } from '../App';

export interface StudentProfile {
  name: string;
  rollNumber: string;
  department: string;
  year: string;
  phoneNumber: string;
  email: string;
}

interface StudentRegistrationProps {
  userId: string;
  onComplete: (profile: StudentProfile) => void;
}

export function StudentRegistration({ userId, onComplete }: StudentRegistrationProps) {
  const [formData, setFormData] = useState<StudentProfile>({
    name: '',
    rollNumber: '',
    department: '',
    year: '',
    phoneNumber: '',
    email: ''
  });
  const [errors, setErrors] = useState<Partial<Record<keyof StudentProfile, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof StudentProfile, string>> = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Name must be at least 3 characters';
    }

    // Roll number validation
    if (!formData.rollNumber.trim()) {
      newErrors.rollNumber = 'Roll number is required';
    } else if (!/^[A-Z0-9]+$/i.test(formData.rollNumber)) {
      newErrors.rollNumber = 'Roll number should contain only letters and numbers';
    }

    // Department validation
    if (!formData.department) {
      newErrors.department = 'Department is required';
    }

    // Year validation
    if (!formData.year) {
      newErrors.year = 'Year is required';
    }

    // Phone number validation
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^[+]?[0-9]{10,13}$/.test(formData.phoneNumber.replace(/[\s-]/g, ''))) {
      newErrors.phoneNumber = 'Please enter a valid phone number (10-13 digits)';
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Save to localStorage with userId as key
      const profileKey = `student_profile_${userId}`;
      localStorage.setItem(profileKey, JSON.stringify(formData));
      
      // Call the onComplete callback
      onComplete(formData);
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof StudentProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary/10 rounded-full p-4">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Complete Your Profile</CardTitle>
          <CardDescription className="text-center">
            Please provide your details to continue. This is a one-time setup and your information will be saved automatically.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6 bg-blue-50 border-blue-200">
            <CheckCircle className="h-4 w-4 text-blue-600" />
            <AlertDescription className="text-blue-900">
              Your details will be automatically saved and used for all future OD requests
            </AlertDescription>
          </Alert>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Full Name <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className={`pl-10 ${errors.name ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            {/* Roll Number */}
            <div className="space-y-2">
              <Label htmlFor="rollNumber">
                Roll Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="rollNumber"
                  type="text"
                  placeholder="e.g., CSE001, ECE042"
                  value={formData.rollNumber}
                  onChange={(e) => handleChange('rollNumber', e.target.value.toUpperCase())}
                  className={`pl-10 ${errors.rollNumber ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.rollNumber && (
                <p className="text-sm text-destructive">{errors.rollNumber}</p>
              )}
            </div>

            {/* Department and Year */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="department">
                  Department <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.department} onValueChange={(value) => handleChange('department', value)}>
                  <SelectTrigger className={errors.department ? 'border-destructive' : ''}>
                    <Building2 className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                      SCOFT Departments
                    </div>
                    <SelectItem value="Artificial Intelligence & Data Science">AI & Data Science</SelectItem>
                    <SelectItem value="Artificial Intelligence & Machine Learning">AI & Machine Learning</SelectItem>
                    <SelectItem value="Computer Science & Engineering">Computer Science & Engineering</SelectItem>
                    <SelectItem value="Computer Science & Engineering (Cyber Security)">CSE (Cyber Security)</SelectItem>
                    <SelectItem value="Computer Science & Engineering (IoT)">CSE (IoT)</SelectItem>
                    <SelectItem value="Information Technology">Information Technology</SelectItem>
                    
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground mt-2">
                      NON-SCOFT Departments
                    </div>
                    <SelectItem value="Agricultural Engineering">Agricultural Engineering</SelectItem>
                    <SelectItem value="Bio Medical Engineering">Bio Medical Engineering</SelectItem>
                    <SelectItem value="Civil Engineering">Civil Engineering</SelectItem>
                    <SelectItem value="Chemical Engineering">Chemical Engineering</SelectItem>
                    <SelectItem value="Electrical & Electronics Engineering">Electrical & Electronics Engineering</SelectItem>
                    <SelectItem value="Electronics & Instrumentation Engineering">Electronics & Instrumentation Engineering</SelectItem>
                    <SelectItem value="Electronics & Communication Engineering">Electronics & Communication Engineering</SelectItem>
                    <SelectItem value="Mechanical Engineering">Mechanical Engineering</SelectItem>
                    <SelectItem value="Medical Electronics">Medical Electronics</SelectItem>
                  </SelectContent>
                </Select>
                {errors.department && (
                  <p className="text-sm text-destructive">{errors.department}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">
                  Year <span className="text-destructive">*</span>
                </Label>
                <Select value={formData.year} onValueChange={(value) => handleChange('year', value)}>
                  <SelectTrigger className={errors.year ? 'border-destructive' : ''}>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st">1st Year</SelectItem>
                    <SelectItem value="2nd">2nd Year</SelectItem>
                    <SelectItem value="3rd">3rd Year</SelectItem>
                    <SelectItem value="4th">4th Year</SelectItem>
                  </SelectContent>
                </Select>
                {errors.year && (
                  <p className="text-sm text-destructive">{errors.year}</p>
                )}
              </div>
            </div>

            {/* Phone Number */}
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">
                Phone Number <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+91 9876543210"
                  value={formData.phoneNumber}
                  onChange={(e) => handleChange('phoneNumber', e.target.value)}
                  className={`pl-10 ${errors.phoneNumber ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.phoneNumber && (
                <p className="text-sm text-destructive">{errors.phoneNumber}</p>
              )}
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">
                Email Address <span className="text-destructive">*</span>
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your.name@college.edu"
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  className={`pl-10 ${errors.email ? 'border-destructive' : ''}`}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? 'Saving Profile...' : 'Complete Registration'}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <p className="text-xs text-muted-foreground text-center">
              <CheckCircle className="inline h-3 w-3 mr-1" />
              All information is stored securely and can be updated from your profile settings
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
