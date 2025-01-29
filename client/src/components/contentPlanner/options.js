// Generate posting time options (00:00 to 23:00)
export const postingTimeOptions = Array.from({ length: 24 }, (_, i) => ({
  value: i.toString(), // Store in UTC
  label: `${i.toString().padStart(2, '0')}:00` // Display in local time
}));

// Helper functions for time conversion
export const getDisplayTime = (utcTime, utcOffset) => {
  const hour = parseInt(utcTime)
  const localHour = (hour + utcOffset + 24) % 24 // Add offset and handle wrap-around
  return localHour.toString().padStart(2, '0')
}

export const getUTCTime = (localTime, utcOffset) => {
  const hour = parseInt(localTime)
  const utcHour = (hour - utcOffset + 24) % 24 // Subtract offset and handle wrap-around
  return utcHour.toString().padStart(2, '0')
}

export const toneOptions = [
  { value: 'professional', label: 'Professional' },
  { value: 'funny', label: 'Funny' },
  { value: 'engaging', label: 'Engaging' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' }
];

export const frequencyOptions = [
  { value: '1', label: 'Every day' },
  { value: '2', label: 'Every 2 days' },
  { value: '3', label: 'Every 3 days' },
  { value: '4', label: 'Every 4 days' },
  { value: '5', label: 'Every 5 days' }
];

export const durationOptions = [
  { value: 'week', label: 'Week' },
  { value: 'month', label: 'Month' },
];

export const templateOptions = [
  { value: 'no', label: 'No Template' },
  { value: 'yes', label: 'Use Template' }
]; 