import React, { useState, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Upload, FileText, X, CheckCircle, Camera, Scan, FolderOpen, Image, FileIcon } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { ODRequest, Certificate } from '../App';

interface CertificateUploadProps {
  odRequest: ODRequest;
  onUpload: (certificate: Omit<Certificate, 'id'>) => void;
}

export function CertificateUpload({ odRequest, onUpload }: CertificateUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const validateFile = (file: File): boolean => {
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please upload a PDF or image file (JPG, PNG)');
      return false;
    }
    
    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return false;
    }
    
    return true;
  };

  const processFile = (file: File) => {
    if (!validateFile(file)) return;
    
    setSelectedFile(file);
    
    // Create preview for images
    if (file.type.startsWith('image/')) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Drag and Drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      processFile(files[0]);
    }
  }, []);

  // Camera/Scan functionality
  const startCamera = async () => {
    setIsScanning(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment' // Use back camera if available
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      toast.error('Unable to access camera. Please ensure camera permissions are granted.');
      setIsScanning(false);
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');
    
    if (!context) return;
    
    // Set canvas size to video size
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], `certificate_scan_${Date.now()}.jpg`, {
          type: 'image/jpeg'
        });
        processFile(file);
        stopCamera();
      }
    }, 'image/jpeg', 0.8);
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
    }
    setIsScanning(false);
  };

  const clearFile = () => {
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setIsUploading(true);
    
    try {
      // Convert file to base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
      });

      const certificate: Omit<Certificate, 'id'> = {
        odRequestId: odRequest.id,
        studentId: odRequest.studentDetails.studentId,
        fileName: selectedFile.name,
        fileData,
        uploadedAt: new Date().toISOString(),
        status: 'uploaded'
      };

      onUpload(certificate);
      toast.success('Certificate uploaded successfully! Awaiting HOD approval.');
      
      // Reset form
      clearFile();
      setDescription('');
      setIsOpen(false);
    } catch (error) {
      toast.error('Failed to upload certificate. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Check if event is completed and certificate can be uploaded
  const canUploadCertificate = odRequest.status === 'completed' || 
                               (odRequest.status === 'mentor_approved' && 
                                new Date() > new Date(odRequest.toDate));

  if (!canUploadCertificate) {
    return null;
  }

  return (
    <>
      <Button 
        className="bg-green-600 hover:bg-green-700"
        onClick={() => setIsOpen(true)}
      >
        <Upload className="h-4 w-4 mr-2" />
        Upload Certificate
      </Button>
      
      <Dialog open={isOpen} onOpenChange={(open) => {
        setIsOpen(open);
        if (!open) {
          stopCamera();
          clearFile();
        }
      }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Upload Event Certificate</span>
          </DialogTitle>
          <DialogDescription>
            Upload your participation certificate or proof of completion for this OD request.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Details */}
          <Card className="bg-muted/50">
            <CardContent className="pt-4">
              <div className="space-y-2 text-sm">
                <div><strong>Event:</strong> {odRequest.reason}</div>
                <div><strong>Date:</strong> {
                  odRequest.fromDate === odRequest.toDate 
                    ? new Date(odRequest.fromDate).toLocaleDateString()
                    : `${new Date(odRequest.fromDate).toLocaleDateString()} - ${new Date(odRequest.toDate).toLocaleDateString()}`
                }</div>
                <div><strong>Detailed Reason:</strong> {odRequest.detailedReason}</div>
                {odRequest.description && <div><strong>Description:</strong> {odRequest.description}</div>}
              </div>
            </CardContent>
          </Card>

          {/* Upload Methods */}
          {!isScanning && !selectedFile && (
            <div className="space-y-4">
              <Label>Choose Upload Method</Label>
              
              {/* Upload Options */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Drag & Drop Area */}
                <Card 
                  className={`border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-primary/50 ${
                    isDragOver ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <Upload className={`h-8 w-8 mb-2 ${isDragOver ? 'text-primary' : 'text-muted-foreground'}`} />
                    <p className="text-sm font-medium">Drag & Drop</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Drop your file here or click to browse
                    </p>
                  </CardContent>
                </Card>

                {/* File Browser */}
                <Card 
                  className="border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-primary/50 border-muted-foreground/25"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <FolderOpen className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Choose File</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Browse from your device
                    </p>
                  </CardContent>
                </Card>

                {/* Camera/Scan */}
                <Card 
                  className="border-2 border-dashed cursor-pointer transition-all duration-200 hover:border-primary/50 border-muted-foreground/25"
                  onClick={startCamera}
                >
                  <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                    <Camera className="h-8 w-8 mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium">Scan Document</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Use camera to scan
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={handleFileSelect}
                className="hidden"
              />

              <p className="text-xs text-muted-foreground text-center">
                Supported formats: PDF, JPG, PNG (Max 5MB)
              </p>
            </div>
          )}

          {/* Camera View */}
          {isScanning && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Document Scanner</Label>
                <Button variant="outline" size="sm" onClick={stopCamera}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </div>
              
              <Card className="relative">
                <CardContent className="p-4">
                  <div className="relative rounded-lg overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      className="w-full h-64 object-cover"
                      playsInline
                      muted
                    />
                    
                    {/* Scan overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      <div className="absolute inset-4 border-2 border-white border-dashed rounded-lg flex items-center justify-center">
                        <div className="text-white text-center">
                          <Scan className="h-8 w-8 mx-auto mb-2" />
                          <p className="text-sm">Position document within frame</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center mt-4">
                    <Button onClick={capturePhoto} className="bg-blue-600 hover:bg-blue-700">
                      <Camera className="h-4 w-4 mr-2" />
                      Capture Photo
                    </Button>
                  </div>
                </CardContent>
              </Card>
              
              <canvas ref={canvasRef} className="hidden" />
            </div>
          )}

          {/* File Preview */}
          {selectedFile && !isScanning && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Selected File</Label>
                <Button variant="outline" size="sm" onClick={clearFile}>
                  <X className="h-4 w-4 mr-2" />
                  Remove
                </Button>
              </div>
              
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-start space-x-4">
                    {/* File Icon/Preview */}
                    <div className="flex-shrink-0">
                      {previewUrl ? (
                        <div className="relative">
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-20 h-20 object-cover rounded-lg border"
                          />
                          <div className="absolute -top-2 -right-2 bg-blue-500 text-white rounded-full p-1">
                            <Image className="h-3 w-3" />
                          </div>
                        </div>
                      ) : (
                        <div className="w-20 h-20 bg-red-100 rounded-lg flex items-center justify-center">
                          <FileIcon className="h-8 w-8 text-red-600" />
                        </div>
                      )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{selectedFile.name}</p>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <span>{Math.round(selectedFile.size / 1024)} KB</span>
                        <span>{selectedFile.type}</span>
                      </div>
                      <div className="flex items-center space-x-1 mt-2">
                        <CheckCircle className="h-4 w-4 text-green-600" />
                        <span className="text-sm text-green-600">Ready to upload</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Additional Description */}
          {selectedFile && !isScanning && (
            <div className="space-y-2">
              <Label htmlFor="description">Additional Notes (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Add any additional information about your participation..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            {selectedFile && !isScanning && (
              <Button 
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUploading ? (
                  <>
                    <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Upload Certificate
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
}