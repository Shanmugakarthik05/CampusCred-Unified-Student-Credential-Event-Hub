import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { Download, FileText, Info, CheckCircle } from 'lucide-react';

export function ODDownloadInfo() {
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-blue-800">
          <Info className="h-5 w-5" />
          <span>OD Letter Download Guide</span>
        </CardTitle>
        <CardDescription>
          Download official approval letters for your approved OD requests
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert className="bg-white border-blue-200">
          <CheckCircle className="h-4 w-4 text-blue-600" />
          <AlertDescription>
            <strong>When can you download?</strong><br />
            Official OD approval letters are available for download once your mentor has approved your request. The appropriate college seal (SCOFT/NON-SCOFT) will be automatically selected based on your department.
          </AlertDescription>
        </Alert>

        <div className="space-y-3">
          <div className="flex items-start space-x-3">
            <FileText className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-800">Official Format</div>
              <div className="text-sm text-blue-700">
                Downloaded letters include college letterhead, official details, and digital approval stamps.
              </div>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Download className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <div className="font-medium text-blue-800">Multiple Formats</div>
              <div className="text-sm text-blue-700">
                Download as HTML file for digital use or print directly for physical submission.
              </div>
            </div>
          </div>
        </div>

        <div className="p-3 bg-white rounded-lg border border-blue-200">
          <div className="text-sm text-blue-800">
            <strong>Letter includes:</strong>
          </div>
          <ul className="text-sm text-blue-700 mt-1 ml-4 space-y-1">
            <li>• Student details and department information</li>
            <li>• Complete OD dates and time periods</li>
            <li>• Detailed reason and event information</li>
            <li>• Official approval status and signatures</li>
            <li>• Saveetha Engineering College letterhead and seals</li>
            <li>• Automatic SCOFT/NON-SCOFT seal selection</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}