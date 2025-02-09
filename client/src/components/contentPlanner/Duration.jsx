import { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TooltipLabel from "@/components/ui/tooltip-label";
import { useContentPlanner } from "@/hooks/useContentPlanner";
import { useParams } from "react-router-dom";

export default function Duration({ date, duration, onDateChange, onDurationChange, tooltip, generateUploaded }) {
  const [open, setOpen] = useState(false);
  const { accountId } = useParams();
  const { contentPlanner } = useContentPlanner(accountId);

  const handleSelect = (newDate) => {
    if (newDate instanceof Date && !isNaN(newDate)) {
      onDateChange(newDate.toISOString());
      setOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <TooltipLabel 
            className="text-lime-500" 
            tooltip={tooltip.startDate}
          >
            Start Date
          </TooltipLabel>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant={"outline"}
                className={cn(
                  "w-full justify-start text-left font-normal mt-2",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(new Date(date), "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date ? new Date(date) : undefined}
                onSelect={handleSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        <div className="flex-1">
          <TooltipLabel 
            className={cn(
              "text-lime-500",
              generateUploaded && "text-gray-400"
            )}
            tooltip={tooltip.duration}
          >
            Duration
          </TooltipLabel>
          <Select
            value={duration}
            onValueChange={onDurationChange}
            disabled={generateUploaded}
          >
            <SelectTrigger 
              className={cn(
                "mt-2",
                generateUploaded && "opacity-50"
              )}
            >
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Week</SelectItem>
              <SelectItem value="month">Month</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
} 