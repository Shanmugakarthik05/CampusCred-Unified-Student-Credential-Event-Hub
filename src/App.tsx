import React, { useState, useEffect } from 'react';
import { LoginScreen } from './components/LoginScreen';
import { StudentDashboard } from './components/StudentDashboard';
import { MentorDashboard } from './components/MentorDashboard';
import { HODDashboard } from './components/HODDashboard';
import { PrincipalDashboard } from './components/PrincipalDashboard';
import { ERPAdminView } from './components/ERPAdminView';
import { SessionWarning } from './components/SessionWarning';
import { StudentRegistration, StudentProfile } from './components/StudentRegistration';

import { Button } from './components/ui/button';
import { LogOut, User } from 'lucide-react';
import { toast, Toaster } from 'sonner@2.0.3';

// Department Lists
export const SCOFT_DEPARTMENTS = [
  'Artificial Intelligence & Data Science',
  'Artificial Intelligence & Machine Learning',
  'Computer Science & Engineering',
  'Computer Science & Engineering (Cyber Security)',
  'Computer Science & Engineering (IoT)',
  'Information Technology'
];

export const NON_SCOFT_DEPARTMENTS = [
  'Agricultural Engineering',
  'Bio Medical Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Electrical & Electronics Engineering',
  'Electronics & Instrumentation Engineering',
  'Electronics & Communication Engineering',
  'Mechanical Engineering',
  'Medical Electronics'
];

export const ALL_DEPARTMENTS = [...SCOFT_DEPARTMENTS, ...NON_SCOFT_DEPARTMENTS];

// Types
export interface User {
  id: string;
  username: string;
  name: string;
  role: 'student' | 'mentor' | 'hod' | 'principal' | 'admin';
  department?: string;
  mentees?: string[]; // For mentors - list of student IDs
  digitalSignature?: string; // Base64 encoded signature
  rollNumber?: string; // For students
}

export interface StudentDetails {
  studentId: string;
  studentName: string;
  rollNumber: string;
  department: string;
  year: string;
  phoneNumber: string;
  email: string;
}

export interface Certificate {
  id: string;
  odRequestId: string;
  studentId: string;
  fileName: string;
  fileData: string; // Base64 encoded file
  uploadedAt: string;
  status: 'uploaded' | 'hod_approved' | 'hod_rejected';
  hodFeedback?: string;
  hodApprovedAt?: string;
}

export interface ODRequest {
  id: string;
  studentDetails: StudentDetails;
  fromDate: string;
  toDate: string;
  odTime: string | string[]; // Can be single time or array of time periods
  reason: string;
  detailedReason: string; // Additional detailed reason for OD
  description: string;
  documents: File[];
  status: 'submitted' | 'mentor_approved' | 'mentor_rejected' | 'completed' | 'certificate_uploaded' | 'certificate_approved';
  submittedAt: string;
  lastUpdated: string;
  mentorFeedback?: string;
  mentorSignature?: string;
  mentorApprovedAt?: string;
  eventCompletedAt?: string;
  certificateId?: string;
  // Prize Information (NEW)
  prizeInfo?: {
    wonPrize: boolean;
    position?: '1st' | '2nd' | '3rd' | 'Participation';
    cashPrize?: number;
  };
  // Attendance Information (NEW)
  attendanceInfo?: {
    subjectCode: string;
    subjectName: string;
    currentPercentage: number;
  }[];
  // LeetCode Completion (NEW)
  leetCodeCompleted?: boolean;
  // Rejection reason (NEW)
  rejectionReason?: string;
  // Attachment URLs (NEW)
  attachmentUrls?: string[];
  // HOD Override (NEW)
  hodOverride?: {
    overriddenBy: string;
    overriddenAt: string;
    justification: string;
    originalStatus: string;
    originalRejectionReason?: string;
  };
  // Exception Review (NEW)
  exceptionReviewed?: boolean;
  exceptionApproved?: boolean;
  exceptionRemarks?: string;
  exceptionReviewedBy?: string;
  exceptionReviewedAt?: string;
  // Auto Escalation (NEW)
  autoEscalated?: boolean;
  escalatedAt?: string;
  escalationReason?: string;
}

export interface FacultyMember {
  id: string;
  name: string;
  designation: string;
  department: string;
  roomNumber: string;
  building: string;
  floor: string;
  phoneExtension: string;
  email: string;
  officeHours: string;
  weekOffDay: string;
  specialization: string[];
  isHOD: boolean;
  availability: 'Available' | 'Busy' | 'In Meeting' | 'Out of Office';
}

// Mock data for demo
const mockUsers: User[] = [
  {
    id: '1',
    username: 'student001',
    name: 'John Doe',
    role: 'student',
    department: 'Computer Science & Engineering',
    rollNumber: 'CSE001'
  },
  {
    id: '2',
    username: 'student002',
    name: 'Jane Smith',
    role: 'student',
    department: 'Computer Science & Engineering',
    rollNumber: 'CSE002'
  },
  {
    id: '3',
    username: 'student003',
    name: 'Mike Johnson',
    role: 'student',
    department: 'Electronics & Communication Engineering',
    rollNumber: 'ECE001'
  },
  {
    id: '4',
    username: 'mentor001',
    name: 'Dr. Sarah Wilson',
    role: 'mentor',
    department: 'Computer Science & Engineering',
    mentees: ['1', '2'],
    digitalSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  },
  {
    id: '5',
    username: 'mentor002',
    name: 'Prof. Robert Brown',
    role: 'mentor',
    department: 'Electronics & Communication Engineering',
    mentees: ['3'],
    digitalSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  },
  {
    id: '6',
    username: 'hod001',
    name: 'Dr. Michael Davis',
    role: 'hod',
    department: 'Computer Science & Engineering',
    digitalSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  },
  {
    id: '7',
    username: 'hod002',
    name: 'Dr. Lisa Anderson',
    role: 'hod',
    department: 'Electronics & Communication Engineering',
    digitalSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  },
  {
    id: '8',
    username: 'principal001',
    name: 'Dr. James Thompson',
    role: 'principal',
    digitalSignature: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
  },
  {
    id: '9',
    username: 'admin001',
    name: 'System Administrator',
    role: 'admin'
  }
];

const mockODRequests: ODRequest[] = [
  {
    id: 'OD001',
    studentDetails: {
      studentId: '1',
      studentName: 'John Doe',
      rollNumber: 'CSE001',
      department: 'Computer Science & Engineering',
      year: '3rd',
      phoneNumber: '+91 9876543210',
      email: 'john.doe@college.edu'
    },
    fromDate: '2024-10-15',
    toDate: '2024-10-15',
    odTime: ['09:00-10:00', '10:00-11:00'],
    reason: 'Sports Competition',
    detailedReason: 'Inter-college basketball tournament representing the college team',
    description: 'Participating in inter-college basketball tournament',
    documents: [],
    status: 'certificate_approved',
    submittedAt: '2024-10-01T10:00:00Z',
    lastUpdated: '2024-10-20T14:30:00Z',
    mentorFeedback: 'Approved for sports activity',
    mentorSignature: 'Dr. Sarah Wilson',
    mentorApprovedAt: '2024-10-02T09:00:00Z',
    eventCompletedAt: '2024-10-15T18:00:00Z',
    certificateId: 'CERT001'
  },
  {
    id: 'OD002',
    studentDetails: {
      studentId: '2',
      studentName: 'Jane Smith',
      rollNumber: 'CSE002',
      department: 'Computer Science & Engineering',
      year: '4th',
      phoneNumber: '+91 9876543212',
      email: 'jane.smith@college.edu'
    },
    fromDate: '2024-10-20',
    toDate: '2024-10-20',
    odTime: '14:00-15:00',
    reason: 'Job Interview',
    detailedReason: 'Campus placement interview with leading technology company',
    description: 'Technical interview at Tech Corp',
    documents: [],
    status: 'completed',
    submittedAt: '2024-10-02T09:15:00Z',
    lastUpdated: '2024-10-20T16:00:00Z',
    mentorFeedback: 'Good opportunity for career',
    mentorSignature: 'Dr. Sarah Wilson',
    mentorApprovedAt: '2024-10-03T11:20:00Z',
    eventCompletedAt: '2024-10-20T16:00:00Z'
  },
  {
    id: 'OD003',
    studentDetails: {
      studentId: '3',
      studentName: 'Mike Johnson',
      rollNumber: 'ECE003',
      department: 'Electronics & Communication Engineering',
      year: '2nd',
      phoneNumber: '+91 9876543214',
      email: 'mike.johnson@college.edu'
    },
    fromDate: '2024-10-18',
    toDate: '2024-10-19',
    odTime: ['10:00-11:00', '11:00-12:00', '12:00-13:00'],
    reason: 'Academic Conference',
    detailedReason: 'IEEE International Conference on Electronics and Communication Technologies',
    description: 'IEEE Conference on Electronics',
    documents: [],
    status: 'submitted',
    submittedAt: '2024-10-01T16:45:00Z',
    lastUpdated: '2024-10-01T16:45:00Z'
  }
];

const mockCertificates: Certificate[] = [
  {
    id: 'CERT001',
    odRequestId: 'OD001',
    studentId: '1',
    fileName: 'basketball_tournament_certificate.pdf',
    fileData: 'data:application/pdf;base64,JVBERi0xLjQKJcOkw7zDtsO8...',
    uploadedAt: '2024-10-16T10:00:00Z',
    status: 'hod_approved',
    hodFeedback: 'Excellent participation',
    hodApprovedAt: '2024-10-17T14:00:00Z'
  }
];

const mockFaculty: FacultyMember[] = [
  // SCOFT Department Faculty
  {
    id: 'FAC001',
    name: 'Dr. Sarah Wilson',
    designation: 'Associate Professor & Mentor',
    department: 'Computer Science & Engineering',
    roomNumber: 'CS-201',
    building: 'SCOFT Block A',
    floor: '2nd Floor',
    phoneExtension: '2201',
    email: 'sarah.wilson@college.edu',
    officeHours: '10:00 AM - 4:00 PM',
    weekOffDay: 'Sunday',
    specialization: ['Software Engineering', 'Data Structures', 'Programming'],
    isHOD: false,
    availability: 'Available'
  },
  {
    id: 'FAC002',
    name: 'Dr. Michael Davis',
    designation: 'Professor & HOD',
    department: 'Computer Science & Engineering',
    roomNumber: 'CS-101',
    building: 'SCOFT Block A',
    floor: '1st Floor',
    phoneExtension: '2101',
    email: 'michael.davis@college.edu',
    officeHours: '9:00 AM - 5:00 PM',
    weekOffDay: 'Saturday',
    specialization: ['Computer Networks', 'Cybersecurity', 'System Administration'],
    isHOD: true,
    availability: 'Available'
  },
  {
    id: 'FAC003',
    name: 'Prof. Rajesh Kumar',
    designation: 'Assistant Professor',
    department: 'Artificial Intelligence & Data Science',
    roomNumber: 'AI-301',
    building: 'SCOFT Block B',
    floor: '3rd Floor',
    phoneExtension: '2301',
    email: 'rajesh.kumar@college.edu',
    officeHours: '11:00 AM - 5:00 PM',
    weekOffDay: 'Sunday',
    specialization: ['Machine Learning', 'Deep Learning', 'Data Analytics'],
    isHOD: false,
    availability: 'In Meeting'
  },
  {
    id: 'FAC004',
    name: 'Dr. Priya Sharma',
    designation: 'Professor & HOD',
    department: 'Artificial Intelligence & Data Science',
    roomNumber: 'AI-201',
    building: 'SCOFT Block B',
    floor: '2nd Floor',
    phoneExtension: '2201',
    email: 'priya.sharma@college.edu',
    officeHours: '9:00 AM - 4:00 PM',
    weekOffDay: 'Saturday',
    specialization: ['Artificial Intelligence', 'Neural Networks', 'Pattern Recognition'],
    isHOD: true,
    availability: 'Available'
  },
  {
    id: 'FAC005',
    name: 'Prof. Amit Patel',
    designation: 'Associate Professor',
    department: 'Information Technology',
    roomNumber: 'IT-202',
    building: 'SCOFT Block C',
    floor: '2nd Floor',
    phoneExtension: '2202',
    email: 'amit.patel@college.edu',
    officeHours: '10:00 AM - 4:00 PM',
    weekOffDay: 'Sunday',
    specialization: ['Web Development', 'Database Systems', 'Cloud Computing'],
    isHOD: false,
    availability: 'Available'
  },
  {
    id: 'FAC006',
    name: 'Dr. Sunita Reddy',
    designation: 'Professor & HOD',
    department: 'Information Technology',
    roomNumber: 'IT-101',
    building: 'SCOFT Block C',
    floor: '1st Floor',
    phoneExtension: '2101',
    email: 'sunita.reddy@college.edu',
    officeHours: '9:00 AM - 5:00 PM',
    weekOffDay: 'Saturday',
    specialization: ['Information Systems', 'IT Management', 'Enterprise Architecture'],
    isHOD: true,
    availability: 'Busy'
  },

  // NON-SCOFT Department Faculty
  {
    id: 'FAC007',
    name: 'Prof. Robert Brown',
    designation: 'Associate Professor & Mentor',
    department: 'Electronics & Communication Engineering',
    roomNumber: 'ECE-301',
    building: 'Engineering Block A',
    floor: '3rd Floor',
    phoneExtension: '3301',
    email: 'robert.brown@college.edu',
    officeHours: '10:00 AM - 4:00 PM',
    weekOffDay: 'Sunday',
    specialization: ['Digital Signal Processing', 'Communication Systems', 'VLSI Design'],
    isHOD: false,
    availability: 'Available'
  },
  {
    id: 'FAC008',
    name: 'Dr. Lisa Anderson',
    designation: 'Professor & HOD',
    department: 'Electronics & Communication Engineering',
    roomNumber: 'ECE-101',
    building: 'Engineering Block A',
    floor: '1st Floor',
    phoneExtension: '3101',
    email: 'lisa.anderson@college.edu',
    officeHours: '9:00 AM - 5:00 PM',
    weekOffDay: 'Saturday',
    specialization: ['Microwave Engineering', 'Antenna Design', 'RF Systems'],
    isHOD: true,
    availability: 'Available'
  },
  {
    id: 'FAC009',
    name: 'Prof. Kumar Swamy',
    designation: 'Assistant Professor',
    department: 'Mechanical Engineering',
    roomNumber: 'MECH-202',
    building: 'Engineering Block B',
    floor: '2nd Floor',
    phoneExtension: '3202',
    email: 'kumar.swamy@college.edu',
    officeHours: '11:00 AM - 5:00 PM',
    weekOffDay: 'Sunday',
    specialization: ['Thermodynamics', 'Heat Transfer', 'Manufacturing'],
    isHOD: false,
    availability: 'Out of Office'
  },
  {
    id: 'FAC010',
    name: 'Dr. Anita Desai',
    designation: 'Professor & HOD',
    department: 'Mechanical Engineering',
    roomNumber: 'MECH-101',
    building: 'Engineering Block B',
    floor: '1st Floor',
    phoneExtension: '3101',
    email: 'anita.desai@college.edu',
    officeHours: '9:00 AM - 4:00 PM',
    weekOffDay: 'Saturday',
    specialization: ['Fluid Mechanics', 'Machine Design', 'CAD/CAM'],
    isHOD: true,
    availability: 'Available'
  },
  {
    id: 'FAC011',
    name: 'Prof. Srinivas Rao',
    designation: 'Associate Professor',
    department: 'Civil Engineering',
    roomNumber: 'CIVIL-301',
    building: 'Engineering Block C',
    floor: '3rd Floor',
    phoneExtension: '3301',
    email: 'srinivas.rao@college.edu',
    officeHours: '10:00 AM - 4:00 PM',
    weekOffDay: 'Sunday',
    specialization: ['Structural Engineering', 'Concrete Technology', 'Construction Management'],
    isHOD: false,
    availability: 'Available'
  },
  {
    id: 'FAC012',
    name: 'Dr. Meera Nair',
    designation: 'Professor & HOD',
    department: 'Civil Engineering',
    roomNumber: 'CIVIL-101',
    building: 'Engineering Block C',
    floor: '1st Floor',
    phoneExtension: '3101',
    email: 'meera.nair@college.edu',
    officeHours: '9:00 AM - 5:00 PM',
    weekOffDay: 'Saturday',
    specialization: ['Transportation Engineering', 'Urban Planning', 'Environmental Engineering'],
    isHOD: true,
    availability: 'In Meeting'
  },
  {
    id: 'FAC013',
    name: 'Prof. Vikram Singh',
    designation: 'Assistant Professor',
    department: 'Electrical & Electronics Engineering',
    roomNumber: 'EEE-202',
    building: 'Engineering Block D',
    floor: '2nd Floor',
    phoneExtension: '3202',
    email: 'vikram.singh@college.edu',
    officeHours: '11:00 AM - 5:00 PM',
    weekOffDay: 'Sunday',
    specialization: ['Power Systems', 'Renewable Energy', 'Electrical Machines'],
    isHOD: false,
    availability: 'Available'
  },
  {
    id: 'FAC014',
    name: 'Dr. Kavitha Menon',
    designation: 'Professor & HOD',
    department: 'Electrical & Electronics Engineering',
    roomNumber: 'EEE-101',
    building: 'Engineering Block D',
    floor: '1st Floor',
    phoneExtension: '3101',
    email: 'kavitha.menon@college.edu',
    officeHours: '9:00 AM - 4:00 PM',
    weekOffDay: 'Saturday',
    specialization: ['Control Systems', 'Power Electronics', 'Smart Grid'],
    isHOD: true,
    availability: 'Available'
  },
  {
    id: 'FAC015',
    name: 'Prof. Ramesh Gupta',
    designation: 'Associate Professor',
    department: 'Chemical Engineering',
    roomNumber: 'CHEM-301',
    building: 'Engineering Block E',
    floor: '3rd Floor',
    phoneExtension: '3301',
    email: 'ramesh.gupta@college.edu',
    officeHours: '10:00 AM - 4:00 PM',
    weekOffDay: 'Sunday',
    specialization: ['Process Engineering', 'Chemical Reactors', 'Mass Transfer'],
    isHOD: false,
    availability: 'Available'
  }
];

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [studentProfile, setStudentProfile] = useState<StudentProfile | null>(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [odRequests, setOdRequests] = useState<ODRequest[]>(mockODRequests);
  const [certificates, setCertificates] = useState<Certificate[]>(mockCertificates);
  const [users] = useState<User[]>(mockUsers);
  const [faculty] = useState<FacultyMember[]>(mockFaculty);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(900); // 15 minutes in seconds
  const [showSessionWarning, setShowSessionWarning] = useState(false);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);

  // Check if student has a profile when user logs in
  useEffect(() => {
    if (currentUser && currentUser.role === 'student') {
      const profileKey = `student_profile_${currentUser.id}`;
      const savedProfile = localStorage.getItem(profileKey);
      
      if (savedProfile) {
        try {
          setStudentProfile(JSON.parse(savedProfile));
          setShowRegistration(false);
        } catch (error) {
          console.error('Error parsing saved profile:', error);
          setShowRegistration(true);
        }
      } else {
        setShowRegistration(true);
      }
    } else {
      setShowRegistration(false);
      setStudentProfile(null);
    }
  }, [currentUser]);

  const handleRegistrationComplete = (profile: StudentProfile) => {
    setStudentProfile(profile);
    setShowRegistration(false);
    toast.success('Profile saved successfully! You can now start applying for OD.');
  };

  // Session management
  const resetSessionTimer = () => {
    if (sessionTimer) {
      clearInterval(sessionTimer);
    }
    
    setSessionTimeLeft(900); // Reset to 15 minutes
    setShowSessionWarning(false);
    
    const timer = setInterval(() => {
      setSessionTimeLeft(prev => {
        if (prev <= 1) {
          handleLogout();
          return 0;
        }
        if (prev === 60 && !showSessionWarning) {
          setShowSessionWarning(true);
        }
        return prev - 1;
      });
    }, 1000);
    
    setSessionTimer(timer);
  };

  const extendSession = () => {
    resetSessionTimer();
    toast.success('Session extended successfully');
  };

  const handleLogin = (username: string, password: string): boolean => {
    // Demo login - in real app, this would call authentication API
    if (password !== 'password123') {
      return false;
    }
    
    const user = mockUsers.find(u => u.username === username);
    if (user) {
      setCurrentUser(user);
      resetSessionTimer();
      toast.success(`Welcome back, ${user.name}!`);
      return true;
    }
    
    return false;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSessionTimeLeft(900);
    setShowSessionWarning(false);
    if (sessionTimer) {
      clearInterval(sessionTimer);
      setSessionTimer(null);
    }
    toast.success('Logged out successfully');
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (sessionTimer) {
        clearInterval(sessionTimer);
      }
    };
  }, [sessionTimer]);

  // Activity listener to reset timer on user interaction
  useEffect(() => {
    if (!currentUser) return;

    const resetTimer = () => {
      if (sessionTimeLeft < 840) { // Only reset if more than 1 minute has passed
        resetSessionTimer();
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer, true);
    });

    return () => {
      events.forEach(event => {
        document.removeEventListener(event, resetTimer, true);
      });
    };
  }, [currentUser, sessionTimeLeft]);

  // Render login screen if not authenticated
  if (!currentUser) {
    return (
      <>
        <LoginScreen onLogin={handleLogin} />
        <Toaster position="top-right" />
      </>
    );
  }

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (currentUser.role) {
      case 'student':
        return (
          <StudentDashboard 
            user={currentUser} 
            odRequests={odRequests}
            setOdRequests={setOdRequests}
            certificates={certificates}
            setCertificates={setCertificates}
            faculty={faculty}
            studentProfile={studentProfile}
            showRegistration={showRegistration}
            handleRegistrationComplete={handleRegistrationComplete}
            allUsers={users}
          />
        );
      case 'mentor':
        return (
          <MentorDashboard 
            user={currentUser} 
            odRequests={odRequests}
            setOdRequests={setOdRequests}
            allUsers={users}
          />
        );
      case 'hod':
        return (
          <HODDashboard 
            user={currentUser} 
            odRequests={odRequests}
            setOdRequests={setOdRequests}
            certificates={certificates}
            setCertificates={setCertificates}
            allUsers={users}
          />
        );
      case 'principal':
        return (
          <PrincipalDashboard 
            user={currentUser} 
            odRequests={odRequests}
            certificates={certificates}
          />
        );
      case 'admin':
        return (
          <ERPAdminView 
            user={currentUser} 
            odRequests={odRequests}
            certificates={certificates}
            users={users}
          />
        );
      default:
        return <div>Invalid user role</div>;
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-border px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-lg font-medium">Student OD System</h1>
            <span className="text-sm text-muted-foreground">|</span>
            <span className="text-sm text-muted-foreground capitalize">{currentUser.role} Portal</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <User className="h-4 w-4" />
              <span>{currentUser.name}</span>
            </div>
            
            <div className="text-sm text-muted-foreground">
              Session: {Math.floor(sessionTimeLeft / 60)}:{(sessionTimeLeft % 60).toString().padStart(2, '0')}
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {renderDashboard()}
      </main>



      {/* Session Warning Modal */}
      {showSessionWarning && (
        <SessionWarning
          timeLeft={sessionTimeLeft}
          onExtend={extendSession}
          onLogout={handleLogout}
        />
      )}

      {/* Toast Notifications */}
      <Toaster position="top-right" />
    </div>
  );
}