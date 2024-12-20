import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Clock } from "lucide-react"

export function PostTimeSelector({ time, onChange }) {
  const hours = Array.from({ length: 24 }, (_, i) => i)

  return (
    <Select value={time} onValueChange={onChange}>
      <SelectTrigger className="w-full ">
        <div className="flex items-center">
          <Clock className="mr-2 h-4 w-4" />
          <SelectValue placeholder="Select time" />
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
