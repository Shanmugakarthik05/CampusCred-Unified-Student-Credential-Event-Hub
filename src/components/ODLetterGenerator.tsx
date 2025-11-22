import React from 'react';
import { Button } from './ui/button';
import { Printer } from 'lucide-react';
import { SCOFT_DEPARTMENTS } from '../App';
import type { ODRequest, User } from '../App';
import scoftSeal from 'figma:asset/d2c7f074af07b534a6bd0694ea4e0c5dcc54308c.png';
import nonScoftSeal from 'figma:asset/0e3f1776eb4f2d2ca3bebfdec913f885babcda1f.png';

interface ODLetterGeneratorProps {
  odRequest: ODRequest;
  currentUser: User;
}

export function ODLetterGenerator({ odRequest, currentUser }: ODLetterGeneratorProps) {
  const [scoftSealBase64, setScoftSealBase64] = React.useState<string>('');
  const [nonScoftSealBase64, setNonScoftSealBase64] = React.useState<string>('');

  // Convert images to base64 on component mount
  React.useEffect(() => {
    const convertImageToBase64 = async (imageSrc: string): Promise<string> => {
      try {
        const response = await fetch(imageSrc);
        const blob = await response.blob();
        return new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } catch (error) {
        console.error('Error converting image:', error);
        return '';
      }
    };

    convertImageToBase64(scoftSeal).then(setScoftSealBase64);
    convertImageToBase64(nonScoftSeal).then(setNonScoftSealBase64);
  }, []);

  const generateLetterHTML = (): string => {
    const currentDate = new Date().toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const fromDate = new Date(odRequest.fromDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const toDate = new Date(odRequest.toDate).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const timePeriods = Array.isArray(odRequest.odTime) 
      ? odRequest.odTime.join(', ') 
      : odRequest.odTime;

    const approvalDate = odRequest.mentorApprovedAt 
      ? new Date(odRequest.mentorApprovedAt).toLocaleDateString('en-IN', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        })
      : currentDate;

    // Automatically determine which seal to use based on student's department
    // SCOFT: AI&DS, AI&ML, CSE variants, IT
    // NON-SCOFT: Civil, Mechanical, ECE, EEE, Chemical, etc.
    const isScoftDepartment = SCOFT_DEPARTMENTS.includes(odRequest.studentDetails.department);
    const collegeSealBase64 = isScoftDepartment ? scoftSealBase64 : nonScoftSealBase64;
    const departmentType = isScoftDepartment ? 'SCOFT' : 'NON-SCOFT';

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OD Approval Letter - ${odRequest.id}</title>
    <style>
        @media print {
            body { margin: 0; }
            .no-print { display: none; }
        }
        
        body {
            font-family: 'Times New Roman', serif;
            line-height: 1.6;
            color: #000;
            max-width: 210mm;
            margin: 0 auto;
            padding: 20mm;
            background: white;
        }
        
        .letterhead {
            text-align: center;
            border-bottom: 3px solid #1e40af;
            padding-bottom: 20px;
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .letterhead-content {
            text-align: center;
        }
        
        .college-seal {
            width: 80px;
            height: 80px;
            margin: 0 20px;
            object-fit: contain;
        }
        
        .college-name {
            font-size: 26px;
            font-weight: bold;
            color: #1e40af;
            margin-bottom: 5px;
            text-transform: uppercase;
        }
        
        .college-subtitle {
            font-size: 18px;
            font-weight: 600;
            color: #374151;
            margin-bottom: 8px;
        }
        
        .college-address {
            font-size: 14px;
            color: #374151;
            margin-bottom: 5px;
        }
        
        .department-type {
            font-size: 16px;
            font-weight: 600;
            color: #1e40af;
            margin-top: 8px;
            padding: 4px 12px;
            border: 2px solid #1e40af;
            border-radius: 20px;
            display: inline-block;
        }
        
        .document-title {
            font-size: 18px;
            font-weight: bold;
            text-decoration: underline;
            margin: 30px 0 20px 0;
            text-align: center;
        }
        
        .ref-no {
            text-align: right;
            margin-bottom: 20px;
            font-size: 14px;
        }
        
        .date {
            text-align: right;
            margin-bottom: 30px;
            font-size: 14px;
        }
        
        .content {
            font-size: 16px;
            line-height: 1.8;
        }
        
        .student-details {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        
        .detail-row {
            display: flex;
            margin-bottom: 8px;
        }
        
        .detail-label {
            font-weight: bold;
            width: 150px;
            color: #374151;
        }
        
        .detail-value {
            color: #000;
        }
        
        .od-details {
            background-color: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 15px;
            margin: 20px 0;
            border-radius: 5px;
        }
        
        .approval-section {
            margin-top: 40px;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
        
        .signature-section {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
        }
        
        .signature-box {
            text-align: center;
            width: 200px;
        }
        
        .signature-line {
            border-top: 1px solid #000;
            margin-top: 60px;
            padding-top: 5px;
        }
        
        .stamp-area {
            border: 2px solid #1e40af;
            height: 80px;
            width: 120px;
            margin: 20px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 8px;
            background-color: #f8fafc;
        }
        
        .stamp-seal {
            width: 60px;
            height: 60px;
            object-fit: contain;
        }
        
        .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #6b7280;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
        
        .approved-stamp {
            position: relative;
            display: inline-block;
            color: #059669;
            font-weight: bold;
            font-size: 18px;
            transform: rotate(-15deg);
            border: 3px solid #059669;
            padding: 10px 20px;
            border-radius: 10px;
            background-color: rgba(5, 150, 105, 0.1);
        }
    </style>
</head>
<body>
    <!-- Letterhead -->
    <div class="letterhead">
        <img src="${collegeSealBase64}" alt="College Seal" class="college-seal" />
        <div class="letterhead-content">
            <div class="college-name">
                Saveetha Engineering College
            </div>
            <div class="college-subtitle">
                Autonomous Institution
            </div>
            <div class="college-address">
                Chennai, Tamil Nadu - 602105<br>
                Phone: +91-44-26801010 | Email: info@saveetha.ac.in | www.saveetha.ac.in
            </div>
            <div class="department-type">
                ${departmentType} Departments
            </div>
        </div>
        <img src="${collegeSealBase64}" alt="College Seal" class="college-seal" />
    </div>

    <!-- Reference and Date -->
    <div class="ref-no">
        <strong>Ref No:</strong> OD/${odRequest.id}/${new Date().getFullYear()}
    </div>
    <div class="date">
        <strong>Date:</strong> ${currentDate}
    </div>

    <!-- Document Title -->
    <div class="document-title">
        ON DUTY APPROVAL LETTER
    </div>

    <!-- Content -->
    <div class="content">
        <p>To Whom It May Concern,</p>
        
        <p>This is to certify that the following student has been granted <strong>ON DUTY</strong> permission for the specified period and purpose:</p>

        <!-- Student Details -->
        <div class="student-details">
            <h4 style="margin-top: 0; color: #1e40af;">Student Details:</h4>
            <div class="detail-row">
                <span class="detail-label">Student Name:</span>
                <span class="detail-value">${odRequest.studentDetails.studentName}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Roll Number:</span>
                <span class="detail-value">${odRequest.studentDetails.rollNumber}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Department:</span>
                <span class="detail-value">${odRequest.studentDetails.department}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Academic Year:</span>
                <span class="detail-value">${odRequest.studentDetails.year}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Phone Number:</span>
                <span class="detail-value">${odRequest.studentDetails.phoneNumber}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Email:</span>
                <span class="detail-value">${odRequest.studentDetails.email}</span>
            </div>
        </div>

        <!-- OD Details -->
        <div class="od-details">
            <h4 style="margin-top: 0; color: #92400e;">On Duty Details:</h4>
            <div class="detail-row">
                <span class="detail-label">From Date:</span>
                <span class="detail-value">${fromDate}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">To Date:</span>
                <span class="detail-value">${toDate}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Time Periods:</span>
                <span class="detail-value">${timePeriods}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Reason Category:</span>
                <span class="detail-value">${odRequest.reason}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Detailed Reason:</span>
                <span class="detail-value">${odRequest.detailedReason}</span>
            </div>
            ${odRequest.description ? `
            <div class="detail-row">
                <span class="detail-label">Additional Info:</span>
                <span class="detail-value">${odRequest.description}</span>
            </div>
            ` : ''}
        </div>

        <p>The above student is hereby granted permission to remain absent from regular classes for the mentioned period to participate in the aforementioned activity. This absence should be treated as <strong>ON DUTY</strong> and not counted as unauthorized absence.</p>

        <p><strong>This letter serves as official authorization for:</strong></p>
        <ul>
            <li>Absence from regular classes during the specified time periods</li>
            <li>Entry/exit permissions as required for the activity</li>
            <li>Academic considerations for missed lectures and assessments</li>
            <li>Official representation of the college (where applicable)</li>
        </ul>

        <p><strong>The student is advised to:</strong></p>
        <ul>
            <li>Carry this letter during the entire duration of the activity</li>
            <li>Report back to college immediately after completion of the activity</li>
            <li>Submit completion certificate/proof within 3 days of return</li>
            <li>Coordinate with respective faculty for any missed assignments/assessments</li>
            <li>Maintain discipline and uphold the college's reputation during the activity</li>
            <li>Inform the mentor immediately in case of any changes to the schedule</li>
        </ul>

        <p><strong>Validity:</strong> This OD approval is valid only for the dates and time periods mentioned above.</p>

        <!-- Approval Section -->
        <div class="approval-section">
            <div style="text-align: center; margin: 30px 0;">
                <span class="approved-stamp">APPROVED</span>
            </div>
            
            <div class="detail-row">
                <span class="detail-label">Approved By:</span>
                <span class="detail-value">${odRequest.mentorSignature || 'Faculty Mentor'}</span>
            </div>
            <div class="detail-row">
                <span class="detail-label">Approval Date:</span>
                <span class="detail-value">${approvalDate}</span>
            </div>
            ${odRequest.mentorFeedback ? `
            <div class="detail-row">
                <span class="detail-label">Mentor Comments:</span>
                <span class="detail-value">${odRequest.mentorFeedback}</span>
            </div>
            ` : ''}
        </div>

        <!-- Signature Section -->
        <div class="signature-section">
            <div class="signature-box">
                <div class="stamp-area">
                    <img src="${collegeSealBase64}" alt="College Seal" class="stamp-seal" />
                </div>
                <div class="signature-line">
                    Faculty Mentor<br>
                    ${odRequest.studentDetails.department}
                </div>
            </div>
            
            <div class="signature-box">
                <div class="stamp-area">
                    <img src="${collegeSealBase64}" alt="Official Stamp" class="stamp-seal" />
                </div>
                <div class="signature-line">
                    Head of Department<br>
                    ${odRequest.studentDetails.department}
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <div class="footer">
        <p><strong>Note:</strong> This is a system-generated document from Saveetha Engineering College OD Management System.</p>
        <p>For any queries, please contact the Academic Office.</p>
        <p>Generated on: ${new Date().toLocaleString('en-IN')} | Request ID: ${odRequest.id}</p>
    </div>
</body>
</html>`;
  };

  const handlePrintLetter = () => {
    // Check if seals are loaded
    if (!scoftSealBase64 || !nonScoftSealBase64) {
      alert('College seals are still loading. Please wait a moment and try again.');
      return;
    }
    const letterHTML = generateLetterHTML();
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(letterHTML);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  const isLoading = !scoftSealBase64 || !nonScoftSealBase64;

  return (
    <Button
      onClick={handlePrintLetter}
      variant="default"
      size="sm"
      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
      disabled={isLoading}
    >
      <Printer className="h-4 w-4" />
      <span>{isLoading ? 'Loading...' : 'Print Letter'}</span>
    </Button>
  );
}