import React, { memo, useMemo, useCallback } from 'react';
import { Label } from '../ui/label';
import { Calendar } from '../ui/calendar';
import { Switch } from '../ui/switch';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '../../lib/utils';
import SelectField from './SelectField';
import { durationOptions } from './options';

const Duration = memo(({
  date,
  duration,
  autoRenew,
  onDateChange,
  onDurationChange,
  onAutoRenewChange
}) => {
  // Ensure date is a valid Date object
  const safeDate = useMemo(() => {
    return date instanceof Date && !isNaN(date) ? date : new Date();
  }, [date]);

  const formattedDate = useMemo(() => {
    return format(safeDate, "PPP");
  }, [safeDate]);

  return (
    <div className="grid grid-cols-2 gap-4 items-start">
      <div className="w-full ">
        <Label className="text-lime-500">Start Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                "w-full justify-start text-left font-normal mt-2",
                !safeDate && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {formattedDate}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={safeDate}
              onSelect={onDateChange}
              initialFocus
            />
          </PopoverContent>
        </Popover>
      </div>
      <div className="w-full space-y-4 ">
        <div>
          <SelectField
            label="Duration"
            options={durationOptions}
            placeholder="Select duration"
            labelClass="text-lime-500"
            value={duration}
            onChange={onDurationChange}
          />
        </div>

        <div className="flex items-center justify-end">
          <Label className="text-gray-500 mr-2">Auto Renew</Label>
          <Switch
            checked={autoRenew}
            onCheckedChange={onAutoRenewChange}
          />
        </div>
      </div>
    </div>
  );
});

Duration.displayName = 'Duration';

export default Duration; 