import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import type { User } from '../App';

interface WeekOffSettingsProps {
  user: User;
  onSave: (weekOffDay: string) => void;
}

const DAYS_OF_WEEK = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday'
];

export function WeekOffSettings({ user, onSave }: WeekOffSettingsProps) {
  const [selectedDay, setSelectedDay] = useState<string>('Saturday');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    // Load saved week off from localStorage
    const saved = localStorage.getItem(`weekoff_${user.id}`);
    if (saved) {
      setSelectedDay(saved);
    }
  }, [user.id]);

  const handleSave = () => {
    localStorage.setItem(`weekoff_${user.id}`, selectedDay);
    onSave(selectedDay);
    setHasChanges(false);
    toast.success(`Week off day set to ${selectedDay}`);
  };

  const handleDayChange = (day: string) => {
    setSelectedDay(day);
    setHasChanges(true);
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-cyan-50 border-blue-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Week Off Configuration
        </CardTitle>
        <CardDescription>
          Set your weekly off day. Students will see this information when browsing the faculty directory.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Select Your Week Off Day</Label>
          <Select value={selectedDay} onValueChange={handleDayChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a day" />
            </SelectTrigger>
            <SelectContent>
              {DAYS_OF_WEEK.map(day => (
                <SelectItem key={day} value={day}>
                  {day}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="bg-white/50 p-4 rounded-lg space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span>Current Week Off: <strong>{selectedDay}</strong></span>
          </div>
          <p className="text-xs text-muted-foreground">
            This information will be visible to students in the Faculty Directory
          </p>
        </div>

        {hasChanges && (
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-800">You have unsaved changes</p>
              <p className="text-xs text-yellow-700">Click Save to update your week off day</p>
            </div>
          </div>
        )}

        <Button 
          onClick={handleSave} 
          disabled={!hasChanges}
          className="w-full"
        >
          <Save className="h-4 w-4 mr-2" />
          Save Week Off Settings
        </Button>

        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
          <p className="text-sm text-blue-900 mb-2">📌 Important Notes:</p>
          <ul className="text-xs text-blue-800 space-y-1 ml-4 list-disc">
            <li>Your week off day will be automatically updated in the student's Faculty Directory</li>
            <li>Students can filter faculty by week off day when searching</li>
            <li>You can change this anytime</li>
            <li>OD requests can still be submitted, but students will be aware of your availability</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
