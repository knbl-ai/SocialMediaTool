import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock } from "lucide-react"
import { useEffect, useState } from "react"
import api from "@/lib/api"

export function PostTimeSelector({ time, onChange, accountId }) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const DEFAULT_HOUR = "10"
  const [utcOffset, setUtcOffset] = useState(0)

  // Fetch UTC offset when component mounts
  useEffect(() => {
    const fetchUtcOffset = async () => {
      try {
        if (accountId) {
          const contentPlanner = await api.get(`/content-planner/${accountId}`);
          setUtcOffset(contentPlanner.utcOffset || 0);
        }
      } catch (error) {
        console.error("Error fetching UTC offset:", error);
      }
    };
    fetchUtcOffset();
  }, [accountId]);

  // Helper to ensure we only work with hours in hh format
  const formatHour = (timeValue) => {
    if (!timeValue) return DEFAULT_HOUR
    
    // If already in correct format (hh), return as is
    if (timeValue.length === 2 && !isNaN(timeValue)) {
      return timeValue
    }
    
    // If time includes minutes (e.g., "10:00"), take only hours
    const hour = timeValue.includes(':') ? timeValue.split(':')[0] : timeValue
    // Convert to two-digit format
    return hour.toString().padStart(2, '0')
  }

  // Convert UTC time to local display time
  const getDisplayTime = (utcTime) => {
    const hour = parseInt(formatHour(utcTime))
    const localHour = (hour + utcOffset + 24) % 24 // Add offset and handle wrap-around
    return localHour.toString().padStart(2, '0')
  }

  // Convert local time to UTC for saving
  const getUTCTime = (localTime) => {
    const hour = parseInt(formatHour(localTime))
    const utcHour = (hour - utcOffset + 24) % 24 // Subtract offset and handle wrap-around
    return utcHour.toString().padStart(2, '0')
  }

  useEffect(() => {
    // Only update if the format needs to be fixed
    const formattedTime = formatHour(time)
    if (time !== formattedTime) {
      onChange(formattedTime)
    }
  }, [time, onChange])

  return (
    <Select 
      value={getDisplayTime(time)}
      onValueChange={(localTime) => onChange(getUTCTime(localTime))}
    >
      <SelectTrigger className="w-full">
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          <SelectValue>
            {`${getDisplayTime(time)}:00`}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {hours.map((hour) => {
          const formattedHour = hour.toString().padStart(2, '0')
          return (
            <SelectItem key={hour} value={formattedHour}>
              {`${formattedHour}:00`}
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}
