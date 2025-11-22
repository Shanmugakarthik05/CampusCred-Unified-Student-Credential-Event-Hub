import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { GraduationCap, Users, Trophy, Code, Music } from 'lucide-react';
import type { ODRequest } from '../App';

interface ODCategoryInsightsProps {
  odRequests: ODRequest[];
}

export function ODCategoryInsights({ odRequests }: ODCategoryInsightsProps) {
  // Categorize OD requests by type
  const categorizeOD = (reason: string): string => {
    const lowerReason = reason.toLowerCase();
    
    if (lowerReason.includes('academic') || 
        lowerReason.includes('seminar') || 
        lowerReason.includes('workshop') || 
        lowerReason.includes('conference') ||
        lowerReason.includes('project') ||
        lowerReason.includes('internship') ||
        lowerReason.includes('training')) {
      return 'Academic';
    }
    
    if (lowerReason.includes('nss') || 
        lowerReason.includes('social') || 
        lowerReason.includes('community') ||
        lowerReason.includes('volunteer') ||
        lowerReason.includes('service')) {
      return 'NSS';
    }
    
    if (lowerReason.includes('sport') || 
        lowerReason.includes('cricket') || 
        lowerReason.includes('football') ||
        lowerReason.includes('basketball') ||
        lowerReason.includes('athletic') ||
        lowerReason.includes('tournament') ||
        lowerReason.includes('match')) {
      return 'Sports';
    }
    
    if (lowerReason.includes('technical') || 
        lowerReason.includes('hackathon') || 
        lowerReason.includes('coding') ||
        lowerReason.includes('tech') ||
        lowerReason.includes('programming') ||
        lowerReason.includes('competition') ||
        lowerReason.includes('contest')) {
      return 'Technical';
    }
    
    if (lowerReason.includes('cultural') || 
        lowerReason.includes('fest') || 
        lowerReason.includes('music') ||
        lowerReason.includes('dance') ||
        lowerReason.includes('drama') ||
        lowerReason.includes('art')) {
      return 'Cultural';
    }
    
    return 'Other';
  };

  // Calculate category-wise distribution
  const categoryStats = odRequests.reduce((acc, req) => {
    const category = categorizeOD(req.reason);
    acc[category] = (acc[category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalRequests = odRequests.length;

  const categoryData = Object.entries(categoryStats).map(([category, count]) => ({
    name: category,
    value: count,
    percentage: totalRequests > 0 ? ((count / totalRequests) * 100).toFixed(1) : 0
  }));

  // Define colors for each category
  const CATEGORY_COLORS: Record<string, string> = {
    Academic: '#3b82f6',
    NSS: '#10b981',
    Sports: '#f59e0b',
    Technical: '#8b5cf6',
    Cultural: '#ec4899',
    Other: '#6b7280'
  };

  const CATEGORY_ICONS: Record<string, any> = {
    Academic: GraduationCap,
    NSS: Users,
    Sports: Trophy,
    Technical: Code,
    Cultural: Music,
    Other: Users
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>OD Category Insights</CardTitle>
        <CardDescription>Percentage breakdown by event type</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CATEGORY_COLORS[entry.name] || '#6b7280'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category Breakdown */}
          <div className="space-y-3">
            {categoryData
              .sort((a, b) => b.value - a.value)
              .map((category) => {
                const Icon = CATEGORY_ICONS[category.name] || Users;
                const percentage = Number(category.percentage);
                
                return (
                  <div
                    key={category.name}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ backgroundColor: `${CATEGORY_COLORS[category.name]}15` }}
                  >
                    <div className="flex items-center space-x-3">
                      <div
                        className="p-2 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[category.name] }}
                      >
                        <Icon className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <div className="font-medium">{category.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {category.value} {category.value === 1 ? 'request' : 'requests'}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-semibold" style={{ color: CATEGORY_COLORS[category.name] }}>
                        {category.percentage}%
                      </div>
                      <div className="text-xs text-muted-foreground">of total</div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t grid grid-cols-2 md:grid-cols-3 gap-4">
          {categoryData
            .sort((a, b) => b.value - a.value)
            .slice(0, 3)
            .map((category, index) => (
              <div key={category.name} className="text-center">
                <div className="text-sm text-muted-foreground mb-1">
                  {index === 0 ? 'Most Common' : index === 1 ? '2nd Most' : '3rd Most'}
                </div>
                <div className="font-semibold">{category.name}</div>
                <div className="text-2xl font-semibold mt-1" style={{ color: CATEGORY_COLORS[category.name] }}>
                  {category.value}
                </div>
              </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
