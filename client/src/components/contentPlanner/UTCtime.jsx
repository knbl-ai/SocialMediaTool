import { useEffect, useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TooltipLabel from "@/components/ui/tooltip-label";

const timezones = [
  { offset: -12, city: "Baker Island", label: "UTC-12" },
  { offset: -11, city: "Pago Pago", label: "UTC-11" },
  { offset: -10, city: "Honolulu", label: "UTC-10" },
  { offset: -9, city: "Anchorage", label: "UTC-9" },
  { offset: -8, city: "Los Angeles", label: "UTC-8" },
  { offset: -7, city: "Phoenix", label: "UTC-7" },
  { offset: -6, city: "Chicago", label: "UTC-6" },
  { offset: -5, city: "New York", label: "UTC-5" },
  { offset: -4, city: "Halifax", label: "UTC-4" },
  { offset: -3, city: "São Paulo", label: "UTC-3" },
  { offset: -2, city: "Fernando de Noronha", label: "UTC-2" },
  { offset: -1, city: "Praia", label: "UTC-1" },
  { offset: 0, city: "London", label: "UTC" },
  { offset: 1, city: "Paris", label: "UTC+1" },
  { offset: 2, city: "Tel Aviv", label: "UTC+2" },
  { offset: 3, city: "Nairobi", label: "UTC+3" },
  { offset: 4, city: "Dubai", label: "UTC+4" },
  { offset: 5, city: "Karachi", label: "UTC+5" },
  { offset: 6, city: "Dhaka", label: "UTC+6" },
  { offset: 7, city: "Bangkok", label: "UTC+7" },
  { offset: 8, city: "Singapore", label: "UTC+8" },
  { offset: 9, city: "Tokyo", label: "UTC+9" },
  { offset: 10, city: "Sydney", label: "UTC+10" },
  { offset: 11, city: "Noumea", label: "UTC+11" },
  { offset: 12, city: "Auckland", label: "UTC+12" },
];

const UTCtime = ({ value, onChange, tooltip }) => {
  const [currentTimezone, setCurrentTimezone] = useState(null);

  // Effect to handle initial value and updates from parent
  useEffect(() => {
    if (value !== undefined) {
      setCurrentTimezone(value);
    } else {
      // If no value is provided, set to default UTC+2
      setCurrentTimezone(2);
      onChange?.(2);
    }
  }, [value, onChange]);

  const handleSelect = (newValue) => {
    const numericValue = Number(newValue);
    setCurrentTimezone(numericValue);
    onChange?.(numericValue);
  };

  const getCurrentTimezoneLabel = () => {
    const tz = timezones.find(t => t.offset === currentTimezone);
    return tz ? `${tz.label} ${tz.city}` : "Select timezone";
  };

  return (
    <div className="flex flex-col gap-2">
      <TooltipLabel tooltip={tooltip} className={"text-lime-500"}>UTC Time</TooltipLabel>
      <Select 
        value={currentTimezone?.toString()} 
        onValueChange={handleSelect}
      >
        <SelectTrigger className="w-[180px] bg-background">
          <SelectValue placeholder="Select timezone">
            {getCurrentTimezoneLabel()}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {timezones.map((tz) => (
            <SelectItem key={tz.offset} value={tz.offset.toString()}>
              {`${tz.label} ${tz.city}`}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default UTCtime; 