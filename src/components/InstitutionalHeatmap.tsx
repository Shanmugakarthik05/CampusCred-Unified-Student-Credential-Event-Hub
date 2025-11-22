import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { ODRequest } from '../App';
import { SCOFT_DEPARTMENTS, NON_SCOFT_DEPARTMENTS } from '../App';

interface InstitutionalHeatmapProps {
  odRequests: ODRequest[];
}

export function InstitutionalHeatmap({ odRequests }: InstitutionalHeatmapProps) {
  // Calculate department-wise OD volume
  const departmentData = [...SCOFT_DEPARTMENTS, ...NON_SCOFT_DEPARTMENTS].map(dept => {
    const deptRequests = odRequests.filter(req => req.studentDetails.department === dept);
    return {
      department: dept,
      count: deptRequests.length,
      category: SCOFT_DEPARTMENTS.includes(dept) ? 'SCOFT' : 'NON-SCOFT'
    };
  }).filter(d => d.count > 0);

  // Calculate max count for normalization
  const maxCount = Math.max(...departmentData.map(d => d.count), 1);

  // Get color intensity based on count
  const getHeatColor = (count: number, category: string) => {
    const intensity = count / maxCount;
    
    if (category === 'SCOFT') {
      if (intensity > 0.75) return 'bg-blue-600 text-white';
      if (intensity > 0.5) return 'bg-blue-500 text-white';
      if (intensity > 0.25) return 'bg-blue-400 text-white';
      return 'bg-blue-200 text-blue-900';
    } else {
      if (intensity > 0.75) return 'bg-green-600 text-white';
      if (intensity > 0.5) return 'bg-green-500 text-white';
      if (intensity > 0.25) return 'bg-green-400 text-white';
      return 'bg-green-200 text-green-900';
    }
  };

  // Get load indicator
  const getLoadIndicator = (count: number) => {
    const intensity = count / maxCount;
    if (intensity > 0.75) return { icon: TrendingUp, text: 'High Load', color: 'text-red-600' };
    if (intensity > 0.5) return { icon: TrendingUp, text: 'Medium Load', color: 'text-amber-600' };
    if (intensity > 0.25) return { icon: Minus, text: 'Normal Load', color: 'text-blue-600' };
    return { icon: TrendingDown, text: 'Low Load', color: 'text-green-600' };
  };

  // Split departments into SCOFT and NON-SCOFT
  const scoftData = departmentData.filter(d => d.category === 'SCOFT');
  const nonScoftData = departmentData.filter(d => d.category === 'NON-SCOFT');

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle>Institutional OD Heatmap</CardTitle>
        <CardDescription>Visual map of OD volume by department (color-coded load chart)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Legend */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <h4 className="font-semibold mb-2">Load Intensity</h4>
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-200 rounded"></div>
                  <span className="text-sm">Low</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-400 rounded"></div>
                  <span className="text-sm">Medium</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-500 rounded"></div>
                  <span className="text-sm">High</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded"></div>
                  <span className="text-sm">Very High</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold">{odRequests.length}</div>
              <div className="text-sm text-muted-foreground">Total OD Requests</div>
            </div>
          </div>

          {/* SCOFT Departments */}
          <div>
            <h3 className="font-semibold mb-3 text-blue-700">SCOFT Departments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {scoftData.map((dept) => {
                const load = getLoadIndicator(dept.count);
                return (
                  <div
                    key={dept.department}
                    className={`p-4 rounded-lg transition-all hover:scale-105 ${getHeatColor(dept.count, dept.category)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm leading-tight">{dept.department}</h4>
                      <Badge variant="secondary" className="ml-2 flex-shrink-0">
                        {dept.count}
                      </Badge>
                    </div>
                    <div className={`flex items-center space-x-1 text-xs mt-2 ${load.color}`}>
                      <load.icon className="h-3 w-3" />
                      <span>{load.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NON-SCOFT Departments */}
          <div>
            <h3 className="font-semibold mb-3 text-green-700">NON-SCOFT Departments</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {nonScoftData.map((dept) => {
                const load = getLoadIndicator(dept.count);
                return (
                  <div
                    key={dept.department}
                    className={`p-4 rounded-lg transition-all hover:scale-105 ${getHeatColor(dept.count, dept.category)}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm leading-tight">{dept.department}</h4>
                      <Badge variant="secondary" className="ml-2 flex-shrink-0">
                        {dept.count}
                      </Badge>
                    </div>
                    <div className={`flex items-center space-x-1 text-xs mt-2 ${load.color}`}>
                      <load.icon className="h-3 w-3" />
                      <span>{load.text}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
