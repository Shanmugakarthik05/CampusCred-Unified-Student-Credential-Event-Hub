import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { 
  Code2, 
  Trophy, 
  TrendingUp, 
  Calendar, 
  Upload, 
  CheckCircle2, 
  Target,
  Award,
  FileImage,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

interface LeetCodeWeek {
  id: string;
  weekNumber: number;
  startDate: string;
  endDate: string;
  problemsSolved: number;
  targetProblems: number;
  difficulty: {
    easy: number;
    medium: number;
    hard: number;
  };
  proofScreenshot?: string; // Base64 encoded image
  notes?: string;
  completedAt?: string;
  status: 'in-progress' | 'completed' | 'not-started';
}

interface LeetCodeTrackerProps {
  userId: string;
  viewOnly?: boolean;
  viewUserName?: string;
}

export function LeetCodeTracker({ userId, viewOnly = false, viewUserName }: LeetCodeTrackerProps) {
  const [weeks, setWeeks] = useState<LeetCodeWeek[]>([]);
  const [showAddWeek, setShowAddWeek] = useState(false);
  const [selectedWeek, setSelectedWeek] = useState<LeetCodeWeek | null>(null);
  const [showProof, setShowProof] = useState(false);

  useEffect(() => {
    // Load data from localStorage
    const saved = localStorage.getItem(`leetcode_tracker_${userId}`);
    if (saved) {
      try {
        setWeeks(JSON.parse(saved));
      } catch (error) {
        console.error('Error loading LeetCode data:', error);
      }
    }
  }, [userId]);

  const saveWeeks = (newWeeks: LeetCodeWeek[]) => {
    setWeeks(newWeeks);
    localStorage.setItem(`leetcode_tracker_${userId}`, JSON.stringify(newWeeks));
  };

  const addWeek = () => {
    const newWeek: LeetCodeWeek = {
      id: Date.now().toString(),
      weekNumber: weeks.length + 1,
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      problemsSolved: 0,
      targetProblems: 7,
      difficulty: { easy: 0, medium: 0, hard: 0 },
      status: 'in-progress'
    };
    saveWeeks([...weeks, newWeek]);
    setShowAddWeek(false);
    toast.success('New week added!');
  };

  const updateWeek = (weekId: string, updates: Partial<LeetCodeWeek>) => {
    const updated = weeks.map(w => 
      w.id === weekId ? { ...w, ...updates } : w
    );
    saveWeeks(updated);
    toast.success('Week updated!');
  };

  const uploadProof = (weekId: string, file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      updateWeek(weekId, { 
        proofScreenshot: base64,
        completedAt: new Date().toISOString()
      });
      toast.success('Proof uploaded successfully!');
    };
    reader.onerror = () => {
      toast.error('Failed to upload proof');
    };
    reader.readAsDataURL(file);
  };

  const deleteWeek = (weekId: string) => {
    const updated = weeks.filter(w => w.id !== weekId);
    saveWeeks(updated);
    toast.success('Week deleted');
  };

  const markAsComplete = (weekId: string) => {
    updateWeek(weekId, { 
      status: 'completed',
      completedAt: new Date().toISOString()
    });
  };

  const totalProblems = weeks.reduce((sum, w) => sum + w.problemsSolved, 0);
  const completedWeeks = weeks.filter(w => w.status === 'completed').length;
  const totalEasy = weeks.reduce((sum, w) => sum + w.difficulty.easy, 0);
  const totalMedium = weeks.reduce((sum, w) => sum + w.difficulty.medium, 0);
  const totalHard = weeks.reduce((sum, w) => sum + w.difficulty.hard, 0);

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="bg-purple-100 rounded-full p-3">
              <Code2 className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-purple-900 mb-1">
                {viewOnly && viewUserName ? `${viewUserName}'s ` : ''}LeetCode Weekly Progress
              </h3>
              <p className="text-sm text-purple-700 mb-4">
                {viewOnly 
                  ? 'View student\'s coding journey and weekly progress' 
                  : 'Track your coding journey week by week. Upload proof of completion and monitor your progress!'}
              </p>
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="text-2xl text-purple-900">{totalProblems}</div>
                  <div className="text-xs text-purple-600">Total Problems</div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="text-2xl text-purple-900">{completedWeeks}</div>
                  <div className="text-xs text-purple-600">Weeks Completed</div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="text-2xl text-purple-900">{weeks.length}</div>
                  <div className="text-xs text-purple-600">Total Weeks</div>
                </div>
                <div className="bg-white/50 rounded-lg p-3">
                  <div className="text-2xl text-purple-900">
                    {weeks.length > 0 ? Math.round((completedWeeks / weeks.length) * 100) : 0}%
                  </div>
                  <div className="text-xs text-purple-600">Completion Rate</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Difficulty Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Difficulty Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Easy: {totalEasy} problems</span>
                <span className="text-sm text-green-600">{totalProblems > 0 ? Math.round((totalEasy / totalProblems) * 100) : 0}%</span>
              </div>
              <Progress value={totalProblems > 0 ? (totalEasy / totalProblems) * 100 : 0} className="h-2 bg-green-100" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Medium: {totalMedium} problems</span>
                <span className="text-sm text-yellow-600">{totalProblems > 0 ? Math.round((totalMedium / totalProblems) * 100) : 0}%</span>
              </div>
              <Progress value={totalProblems > 0 ? (totalMedium / totalProblems) * 100 : 0} className="h-2 bg-yellow-100" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Hard: {totalHard} problems</span>
                <span className="text-sm text-red-600">{totalProblems > 0 ? Math.round((totalHard / totalProblems) * 100) : 0}%</span>
              </div>
              <Progress value={totalProblems > 0 ? (totalHard / totalProblems) * 100 : 0} className="h-2 bg-red-100" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add Week Button */}
      {!viewOnly && (
        <div className="flex justify-end">
          <Button onClick={addWeek}>
            <Calendar className="h-4 w-4 mr-2" />
            Start New Week
          </Button>
        </div>
      )}

      {/* Weeks List */}
      <div className="grid gap-4 md:grid-cols-2">
        {weeks.map(week => (
          <Card key={week.id} className={`${week.status === 'completed' ? 'border-green-300 bg-green-50' : ''}`}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    Week {week.weekNumber}
                    {week.status === 'completed' && (
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                    )}
                  </CardTitle>
                  <CardDescription>
                    {new Date(week.startDate).toLocaleDateString('en-IN')} - {new Date(week.endDate).toLocaleDateString('en-IN')}
                  </CardDescription>
                </div>
                <Badge className={week.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'}>
                  {week.status === 'completed' ? 'Completed' : 'In Progress'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex justify-between mb-2">
                  <span className="text-sm">Progress: {week.problemsSolved} / {week.targetProblems}</span>
                  <span className="text-sm">{Math.round((week.problemsSolved / week.targetProblems) * 100)}%</span>
                </div>
                <Progress value={(week.problemsSolved / week.targetProblems) * 100} />
              </div>

              <div className="flex gap-2">
                <div className="flex-1 bg-green-50 p-2 rounded text-center">
                  <div className="text-sm text-green-800">{week.difficulty.easy}</div>
                  <div className="text-xs text-green-600">Easy</div>
                </div>
                <div className="flex-1 bg-yellow-50 p-2 rounded text-center">
                  <div className="text-sm text-yellow-800">{week.difficulty.medium}</div>
                  <div className="text-xs text-yellow-600">Medium</div>
                </div>
                <div className="flex-1 bg-red-50 p-2 rounded text-center">
                  <div className="text-sm text-red-800">{week.difficulty.hard}</div>
                  <div className="text-xs text-red-600">Hard</div>
                </div>
              </div>

              {week.notes && (
                <div className="text-sm text-muted-foreground bg-muted p-2 rounded">
                  {week.notes}
                </div>
              )}

              <div className="flex gap-2">
                {!viewOnly && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Upload className="h-4 w-4 mr-2" />
                        {week.proofScreenshot ? 'Update Proof' : 'Upload Proof'}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Upload Proof - Week {week.weekNumber}</DialogTitle>
                        <DialogDescription>
                          Upload a screenshot of your LeetCode progress for this week
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label>Problems Solved</Label>
                          <Input 
                            type="number" 
                            value={week.problemsSolved}
                            onChange={(e) => updateWeek(week.id, { problemsSolved: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label>Easy</Label>
                            <Input 
                              type="number" 
                              value={week.difficulty.easy}
                              onChange={(e) => updateWeek(week.id, { 
                                difficulty: { ...week.difficulty, easy: parseInt(e.target.value) || 0 }
                              })}
                            />
                          </div>
                          <div>
                            <Label>Medium</Label>
                            <Input 
                              type="number" 
                              value={week.difficulty.medium}
                              onChange={(e) => updateWeek(week.id, { 
                                difficulty: { ...week.difficulty, medium: parseInt(e.target.value) || 0 }
                              })}
                            />
                          </div>
                          <div>
                            <Label>Hard</Label>
                            <Input 
                              type="number" 
                              value={week.difficulty.hard}
                              onChange={(e) => updateWeek(week.id, { 
                                difficulty: { ...week.difficulty, hard: parseInt(e.target.value) || 0 }
                              })}
                            />
                          </div>
                        </div>
                        <div>
                          <Label>Notes (Optional)</Label>
                          <Textarea 
                            value={week.notes || ''}
                            onChange={(e) => updateWeek(week.id, { notes: e.target.value })}
                            placeholder="Add any notes about this week's progress..."
                          />
                        </div>
                        <div>
                          <Label>Screenshot Proof</Label>
                          <Input 
                            type="file" 
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) uploadProof(week.id, file);
                            }}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Max 5MB. PNG, JPG, or WebP
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}

                {week.proofScreenshot && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className={viewOnly ? 'flex-1' : ''}>
                        <Eye className="h-4 w-4" />
                        {viewOnly && <span className="ml-2">View Proof</span>}
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>Proof - Week {week.weekNumber}</DialogTitle>
                      </DialogHeader>
                      <img 
                        src={week.proofScreenshot} 
                        alt={`Week ${week.weekNumber} proof`}
                        className="w-full rounded-lg"
                      />
                    </DialogContent>
                  </Dialog>
                )}

                {!viewOnly && week.status !== 'completed' && (
                  <Button 
                    size="sm"
                    onClick={() => markAsComplete(week.id)}
                    disabled={!week.proofScreenshot}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Complete
                  </Button>
                )}

                {!viewOnly && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => deleteWeek(week.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {week.completedAt && (
                <div className="text-xs text-muted-foreground">
                  Completed on {new Date(week.completedAt).toLocaleDateString('en-IN')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {weeks.length === 0 && (
          <Card className="col-span-2 p-12">
            <div className="text-center text-muted-foreground">
              <Code2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No weeks tracked yet</p>
              {!viewOnly && <p className="text-sm mt-2">Start tracking your LeetCode progress by adding your first week!</p>}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
