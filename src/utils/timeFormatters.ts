// Utility functions for formatting time periods in the OD system

export function formatTimePeriod(timeString: string): string {
  if (timeString === 'full-day') {
    return 'Full Day (8:00 AM - 5:00 PM)';
  }
  
  if (timeString.includes('-')) {
    const [start, end] = timeString.split('-');
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':');
      const hour = parseInt(hours);
      const ampm = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
      return `${displayHour}:${minutes} ${ampm}`;
    };
    return `${formatTime(start)} - ${formatTime(end)}`;
  }
  
  return timeString;
}

export function getPeriodNumber(timeString: string): string {
  const periodMap: Record<string, string> = {
    '08:00-09:00': 'Period 1',
    '09:00-10:00': 'Period 2', 
    '10:00-11:00': 'Period 3',
    '11:00-12:00': 'Period 4',
    '12:00-13:00': 'Period 5',
    '13:00-14:00': 'Period 6',
    '14:00-15:00': 'Period 7',
    '15:00-16:00': 'Period 8',
    '16:00-17:00': 'Period 9',
    'full-day': 'Full Day'
  };
  
  return periodMap[timeString] || timeString;
}

export function formatTimePeriodWithNumber(timeString: string): string {
  const periodNumber = getPeriodNumber(timeString);
  const timeRange = formatTimePeriod(timeString);
  
  if (timeString === 'full-day') {
    return timeRange;
  }
  
  return `${periodNumber}: ${timeRange}`;
}

export function formatMultipleTimePeriods(odTime: string | string[]): string {
  if (typeof odTime === 'string') {
    return formatTimePeriod(odTime);
  }
  
  if (Array.isArray(odTime) && odTime.length > 0) {
    if (odTime.length === 1) {
      return formatTimePeriod(odTime[0]);
    }
    
    // For multiple periods, show range from first to last
    const firstPeriod = odTime[0];
    const lastPeriod = odTime[odTime.length - 1];
    
    if (firstPeriod && lastPeriod) {
      const firstTime = firstPeriod.split('-')[0];
      const lastTime = lastPeriod.split('-')[1];
      return formatTimePeriod(`${firstTime}-${lastTime}`);
    }
  }
  
  return 'No time selected';
}

export function formatTimePeriodsList(odTime: string | string[]): string {
  if (typeof odTime === 'string') {
    return formatTimePeriod(odTime);
  }
  
  if (Array.isArray(odTime) && odTime.length > 0) {
    return odTime.map(period => {
      const timeMap: Record<string, string> = {
        '08:00-09:00': '8-9',
        '09:00-10:00': '9-10', 
        '10:00-11:00': '10-11',
        '11:00-12:00': '11-12',
        '12:00-13:00': '12-1',
        '13:00-14:00': '1-2',
        '14:00-15:00': '2-3',
        '15:00-16:00': '3-4',
        '16:00-17:00': '4-5'
      };
      return timeMap[period] || period;
    }).join(', ');
  }
  
  return 'No periods selected';
}