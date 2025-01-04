import React from 'react';
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import TooltipLabel from '@/components/ui/tooltip-label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Duration = ({ 
  date, 
  duration, 
  onDateChange, 
  onDurationChange,
  tooltip 
}) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <TooltipLabel className="text-lime-500" tooltip={tooltip.startDate}>
          Start Date
        </TooltipLabel>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full mt-2 justify-start text-left font-normal",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={onDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>

      <div>
        <TooltipLabel className="text-lime-500" tooltip={tooltip.duration}>
          Duration
        </TooltipLabel>
        <Select value={duration} onValueChange={onDurationChange}>
          <SelectTrigger className="mt-2">
            <SelectValue placeholder="Select duration" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">1 Week</SelectItem>
            <SelectItem value="month">1 Month</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default Duration; 