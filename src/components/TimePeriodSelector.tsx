import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import { cn } from './ui/utils';

interface TimePeriod {
  id: string;
  timeRange: string;
  label: string;
  selected: boolean;
  subjectCode?: string;
  slot?: string;
}

interface TimePeriodSelectorProps {
  selectedPeriods: string[];
  onPeriodsChange: (periods: string[]) => void;
  className?: string;
}

const TIME_PERIODS: TimePeriod[] = [
  { id: '08:00-09:00', timeRange: '8-9', label: 'Period 1', selected: false },
  { id: '09:00-10:00', timeRange: '9-10', label: 'Period 2', selected: false },
  { id: '10:00-11:00', timeRange: '10-11', label: 'Period 3', selected: false },
  { id: '11:00-12:00', timeRange: '11-12', label: 'Period 4', selected: false },
  { id: '12:00-13:00', timeRange: '12-1', label: 'Period 5', selected: false },
  { id: '13:00-14:00', timeRange: '1-2', label: 'Period 6', selected: false },
  { id: '14:00-15:00', timeRange: '2-3', label: 'Period 7', selected: false },
  { id: '15:00-16:00', timeRange: '3-4', label: 'Period 8', selected: false },
  { id: '16:00-17:00', timeRange: '4-5', label: 'Period 9', selected: false },
];

export function TimePeriodSelector({ selectedPeriods, onPeriodsChange, className }: TimePeriodSelectorProps) {
  const [subjectCodes, setSubjectCodes] = useState<Record<string, string>>({});
  const [slots, setSlots] = useState<Record<string, string>>({});

  const handlePeriodToggle = (periodId: string) => {
    const newSelectedPeriods = selectedPeriods.includes(periodId)
      ? selectedPeriods.filter(id => id !== periodId)
      : [...selectedPeriods, periodId];
    
    onPeriodsChange(newSelectedPeriods);
  };

  const handleSubjectCodeChange = (periodId: string, value: string) => {
    setSubjectCodes(prev => ({
      ...prev,
      [periodId]: value
    }));
  };

  const handleSlotChange = (periodId: string, value: string) => {
    setSlots(prev => ({
      ...prev,
      [periodId]: value
    }));
  };

  const selectAllPeriods = () => {
    onPeriodsChange(TIME_PERIODS.map(p => p.id));
  };

  const clearAllPeriods = () => {
    onPeriodsChange([]);
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle className="text-center text-lg font-medium">
          Hour Details of Student on OD Date:
        </CardTitle>
        <div className="flex justify-center space-x-2 mt-2">
          <button
            type="button"
            onClick={selectAllPeriods}
            className="text-xs bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded text-blue-700"
          >
            Select All
          </button>
          <button
            type="button"
            onClick={clearAllPeriods}
            className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded text-gray-700"
          >
            Clear All
          </button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-400">
            {/* Header Row */}
            <thead>
              <tr>
                <th className="border border-gray-400 bg-gray-100 p-2 text-sm font-medium w-20">
                  Time
                </th>
                {TIME_PERIODS.map((period) => (
                  <th
                    key={period.id}
                    className="border border-gray-400 bg-gray-100 p-2 text-sm font-medium min-w-[80px]"
                  >
                    {period.timeRange}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Subject Code Row */}
              <tr>
                <td className="border border-gray-400 bg-gray-50 p-2 text-sm font-medium">
                  Subject Code
                </td>
                {TIME_PERIODS.map((period) => (
                  <td key={period.id} className="border border-gray-400 p-1">
                    {selectedPeriods.includes(period.id) ? (
                      <Input
                        value={subjectCodes[period.id] || ''}
                        onChange={(e) => handleSubjectCodeChange(period.id, e.target.value)}
                        placeholder="Code"
                        className="text-xs h-8 text-center"
                      />
                    ) : (
                      <div className="h-8"></div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Slot Row */}
              <tr>
                <td className="border border-gray-400 bg-gray-50 p-2 text-sm font-medium">
                  Slot
                  <div className="text-xs text-gray-500 mt-1">
                    E.g.: CSE-B2-1
                  </div>
                </td>
                {TIME_PERIODS.map((period) => (
                  <td key={period.id} className="border border-gray-400 p-1">
                    {selectedPeriods.includes(period.id) ? (
                      <Input
                        value={slots[period.id] || ''}
                        onChange={(e) => handleSlotChange(period.id, e.target.value)}
                        placeholder="Slot"
                        className="text-xs h-8 text-center"
                      />
                    ) : (
                      <div className="h-8"></div>
                    )}
                  </td>
                ))}
              </tr>

              {/* Selection Row */}
              <tr>
                <td className="border border-gray-400 bg-gray-50 p-2 text-sm font-medium">
                  Select Period
                </td>
                {TIME_PERIODS.map((period) => (
                  <td key={period.id} className="border border-gray-400 p-2 text-center">
                    <div className="flex flex-col items-center space-y-1">
                      <Checkbox
                        checked={selectedPeriods.includes(period.id)}
                        onCheckedChange={() => handlePeriodToggle(period.id)}
                        className="w-4 h-4"
                      />
                      <span className="text-xs text-gray-600">
                        {period.label.replace('Period ', 'P')}
                      </span>
                    </div>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* Selected Periods Summary */}
        {selectedPeriods.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <Label className="text-sm font-medium text-blue-800">
              Selected Time Periods ({selectedPeriods.length}):
            </Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedPeriods.map((periodId) => {
                const period = TIME_PERIODS.find(p => p.id === periodId);
                return (
                  <span
                    key={periodId}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800"
                  >
                    {period?.timeRange}
                    <button
                      type="button"
                      onClick={() => handlePeriodToggle(periodId)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      ×
                    </button>
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {selectedPeriods.length === 0 && (
          <div className="mt-4 p-3 bg-amber-50 rounded-lg">
            <p className="text-sm text-amber-800">
              Please select at least one time period for your OD request.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}