import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock } from "lucide-react"
import { useEffect } from "react"

export function PostTimeSelector({ time, onChange }) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const DEFAULT_HOUR = "10"

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

  useEffect(() => {
    // Only update if the format needs to be fixed
    const formattedTime = formatHour(time)
    if (time !== formattedTime) {
      onChange(formattedTime)
    }
  }, [time, onChange])

  return (
    <Select 
      value={formatHour(time)}
      onValueChange={(value) => onChange(formatHour(value))}
    >
      <SelectTrigger className="w-full">
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          <SelectValue>
            {`${formatHour(time)}:00`}
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
