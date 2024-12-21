import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useState, useMemo } from "react"

export function PostDateSelector({ date, onChange }) {
  const [open, setOpen] = useState(false)

  const formattedDate = useMemo(() => {
    try {
      return date instanceof Date && !isNaN(date) ? format(date, "PPP") : "Select date"
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Select date"
    }
  }, [date])

  const handleSelect = (newDate) => {
    if (newDate instanceof Date && !isNaN(newDate)) {
      onChange(newDate)
      setOpen(false)
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-[280px] justify-start text-left font-normal">
          <CalendarIcon className="mr-2 h-4 w-4" />
          {formattedDate}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date instanceof Date && !isNaN(date) ? date : undefined}
          onSelect={handleSelect}
          initialFocus
          className="bg-white"
          classNames={{
            day_selected: "bg-gray-100 text-gray-900 hover:bg-gray-200 text-sm rounded-md w-7",
            day: "h-7 w-7 p-0 font-normal aria-selected:opacity-100 hover:bg-gray-100 bg-white text-gray-500 text-sm",
            head_cell: "h-7 w-7 font-normal text-gray-500 text-sm",
            cell: "h-7 w-7 p-0 relative [&:has([aria-selected])]:bg-white focus-within:bg-white",
            nav_button: "border-0 hover:bg-gray-100 text-gray-400 h-6 w-6 flex items-center justify-center p-0",
            nav: "space-x-1 flex items-center justify-center",
            caption: "text-sm font-normal text-gray-900 flex items-center justify-center py-1",
            table: "w-full border-collapse space-y-1"
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
