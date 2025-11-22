import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent } from './ui/card';
import { Download, ExternalLink, FileText, Image as ImageIcon, Award, BookOpen, X } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { ODRequest } from '../App';

interface ProofVerificationViewProps {
  request: ODRequest;
  open: boolean;
  onClose: () => void;
}

export function ProofVerificationView({ request, open, onClose }: ProofVerificationViewProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // Mock attachments since we're using File[] in the actual implementation
  // In a real app, these would be URLs from uploaded files
  const hasAttachments = request.attachmentUrls && request.attachmentUrls.length > 0;
  
  const getFileIcon = (filename: string) => {
    if (filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
      return <ImageIcon className="h-4 w-4" />;
    }
    return <FileText className="h-4 w-4" />;
  };
  
  const handleDownload = (url: string, filename: string) => {
    toast.success(`Downloading ${filename}`);
    // In real implementation, trigger download
  };
  
  const handleOpenInNewTab = (url: string) => {
    window.open(url, '_blank');
  };
  
  return (
    <>
      <Dialog open={open} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span>Request Details & Proof Verification</span>
            </DialogTitle>
            <DialogDescription>
              View all details and attachments for this OD request
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Student Information */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Student Information</h3>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-muted-foreground">Name:</span>
                    <span className="ml-2 font-semibold">{request.studentDetails.studentName}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Roll Number:</span>
                    <span className="ml-2 font-semibold">{request.studentDetails.rollNumber}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Department:</span>
                    <span className="ml-2 font-semibold">{request.studentDetails.department}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Year:</span>
                    <span className="ml-2 font-semibold">{request.studentDetails.year}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Event Details */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Event Details</h3>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Event:</span>
                    <span className="ml-2 font-semibold">{request.reason}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Details:</span>
                    <p className="mt-1 text-muted-foreground">{request.detailedReason}</p>
                  </div>
                  {request.description && (
                    <div>
                      <span className="text-muted-foreground">Additional Description:</span>
                      <p className="mt-1 text-muted-foreground">{request.description}</p>
                    </div>
                  )}
                  <div>
                    <span className="text-muted-foreground">Date:</span>
                    <span className="ml-2">
                      {request.fromDate === request.toDate 
                        ? new Date(request.fromDate).toLocaleDateString()
                        : `${new Date(request.fromDate).toLocaleDateString()} - ${new Date(request.toDate).toLocaleDateString()}`
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Time Period:</span>
                    <span className="ml-2">
                      {typeof request.odTime === 'string' 
                        ? request.odTime 
                        : Array.isArray(request.odTime) 
                          ? request.odTime.join(', ')
                          : 'Not specified'
                      }
                    </span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Status:</span>
                    <Badge className="ml-2">{request.status.replace('_', ' ')}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Prize Information */}
            {request.prizeInfo?.wonPrize && (
              <Card className="border-yellow-200 bg-yellow-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <Award className="h-5 w-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800">Prize/Award Information</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    {request.prizeInfo.position && (
                      <div>
                        <span className="text-muted-foreground">Position:</span>
                        <Badge className="ml-2 bg-yellow-600">{request.prizeInfo.position}</Badge>
                      </div>
                    )}
                    {request.prizeInfo.cashPrize && request.prizeInfo.cashPrize > 0 && (
                      <div>
                        <span className="text-muted-foreground">Cash Prize:</span>
                        <span className="ml-2 font-semibold text-green-600">₹{request.prizeInfo.cashPrize}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Attendance Information */}
            {request.attendanceInfo && request.attendanceInfo.length > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <BookOpen className="h-5 w-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Attendance Records</h3>
                  </div>
                  <div className="space-y-2">
                    {request.attendanceInfo.map((subject, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm p-2 bg-white rounded">
                        <div>
                          <span className="font-semibold">{subject.subjectCode}</span>
                          <span className="text-muted-foreground ml-2">- {subject.subjectName}</span>
                        </div>
                        <Badge 
                          className={
                            subject.currentPercentage >= 75 
                              ? 'bg-green-100 text-green-800' 
                              : subject.currentPercentage >= 65 
                                ? 'bg-yellow-100 text-yellow-800' 
                                : 'bg-red-100 text-red-800'
                          }
                        >
                          {subject.currentPercentage}%
                        </Badge>
                      </div>
                    ))}
                    <div className="text-sm text-muted-foreground mt-2">
                      <strong>Average Attendance:</strong> {(
                        request.attendanceInfo.reduce((sum, s) => sum + s.currentPercentage, 0) / 
                        request.attendanceInfo.length
                      ).toFixed(1)}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {/* Mentor Feedback */}
            {request.mentorFeedback && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <h3 className="font-semibold text-green-800 mb-2">Mentor Feedback</h3>
                  <p className="text-sm text-green-700">{request.mentorFeedback}</p>
                  {request.mentorApprovedAt && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Approved on: {new Date(request.mentorApprovedAt).toLocaleString()}
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
            
            {/* Attachments Section */}
            <Card>
              <CardContent className="pt-6">
                <h3 className="font-semibold mb-3">Proof/Attachments</h3>
                {hasAttachments ? (
                  <div className="space-y-3">
                    {request.attachmentUrls!.map((url, index) => {
                      const filename = `attachment-${index + 1}.jpg`;
                      const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
                      
                      return (
                        <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                          <div className="flex items-center space-x-3">
                            {getFileIcon(filename)}
                            <div>
                              <div className="font-semibold text-sm">{filename}</div>
                              <div className="text-xs text-muted-foreground">
                                {isImage ? 'Image' : 'Document'}
                              </div>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            {isImage && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setSelectedImage(url)}
                              >
                                <ImageIcon className="h-3 w-3 mr-1" />
                                Preview
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDownload(url, filename)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Download
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleOpenInNewTab(url)}
                            >
                              <ExternalLink className="h-3 w-3 mr-1" />
                              Open
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                    <p>No attachments available</p>
                    <p className="text-xs mt-2">Student will upload proof after event completion</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 pt-4 border-t">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Image Preview Modal */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-6xl">
            <DialogHeader>
              <DialogTitle className="flex items-center justify-between">
                <span>Image Preview</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedImage(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center justify-center bg-gray-100 rounded-lg p-4">
              <img 
                src={selectedImage} 
                alt="Attachment preview" 
                className="max-w-full max-h-[70vh] object-contain rounded"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => handleDownload(selectedImage, 'attachment.jpg')}
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
              <Button
                variant="outline"
                onClick={() => handleOpenInNewTab(selectedImage)}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open in New Tab
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
