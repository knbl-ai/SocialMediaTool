import React, { useState, useMemo } from 'react';
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Calendar } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "../ui/select";
import { durationOptions } from './options';

export default function Duration() {
  // Get the first day of next month
  const getNextMonthStart = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 1);
    date.setDate(1);
    return date;
  };

  const [startDate, setStartDate] = useState(getNextMonthStart());
  const [open, setOpen] = useState(false);

  const formattedDate = useMemo(() => {
    try {
      return startDate instanceof Date && !isNaN(startDate) ? format(startDate, "PPP") : "Select date"
    } catch (error) {
      console.error("Error formatting date:", error)
      return "Select date"
    }
  }, [startDate]);

  const handleSelect = (newDate) => {
    if (newDate instanceof Date && !isNaN(newDate)) {
      setStartDate(newDate);
      setOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="startDate" className="text-green-500">Start Date</Label>
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {formattedDate}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate instanceof Date && !isNaN(startDate) ? startDate : undefined}
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
        </div>
        
        <div className="space-y-1">
          <Label htmlFor="duration" className="text-green-500">Duration</Label>
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="Select duration" />
            </SelectTrigger>
            <SelectContent>
              {durationOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch id="autoRenewal" />
        <Label htmlFor="autoRenewal" className="cursor-pointer">Auto Renewal</Label>
      </div>
    </div>
  );
} 