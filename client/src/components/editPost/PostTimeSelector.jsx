import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock } from "lucide-react"
import { useEffect } from "react"

export function PostTimeSelector({ time, onChange }) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  const DEFAULT_HOUR = "10"

  useEffect(() => {
    if (!time) {
      onChange(DEFAULT_HOUR)
    }
  }, [time, onChange])

  return (
    <Select value={time || DEFAULT_HOUR} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          <SelectValue>
            {time ? `${time.toString().padStart(2, '0')}:00` : "10:00"}
          </SelectValue>
        </div>
      </SelectTrigger>
      <SelectContent>
        {hours.map((hour) => (
          <SelectItem key={hour} value={hour.toString()}>
            {hour.toString().padStart(2, '0')}:00
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
