import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Code2, Users } from 'lucide-react';
import { LeetCodeTracker } from './LeetCodeTracker';
import type { User } from '../App';

interface LeetCodeViewerProps {
  students: User[];
  title?: string;
}

export function LeetCodeViewer({ students, title = "Student LeetCode Progress" }: LeetCodeViewerProps) {
  const [selectedStudent, setSelectedStudent] = useState<string>('');

  const selectedStudentData = students.find(s => s.id === selectedStudent);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            {title}
          </CardTitle>
          <CardDescription>
            Monitor student coding progress and weekly LeetCode completions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label>Select Student</Label>
            <Select value={selectedStudent} onValueChange={setSelectedStudent}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a student to view their progress..." />
              </SelectTrigger>
              <SelectContent>
                {students.map(student => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name} ({student.rollNumber || student.id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {selectedStudent ? (
        <LeetCodeTracker 
          userId={selectedStudent} 
          viewOnly={true}
          viewUserName={selectedStudentData?.name}
        />
      ) : (
        <Card className="p-12">
          <div className="text-center text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Select a student to view their LeetCode progress</p>
          </div>
        </Card>
      )}
    </div>
  );
}
