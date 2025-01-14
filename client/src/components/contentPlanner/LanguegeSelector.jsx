import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import TooltipLabel from "../ui/tooltip-label";

export default function LanguegeSelector({ value = 'English', onChange, tooltip }) {
  const languages = [
    { value: 'English', label: 'English' },
    { value: 'Hebrew', label: 'Hebrew' }
  ];

  return (
    <div className="w-[150px]">
      <TooltipLabel 
        className="text-lime-500" 
        tooltip={tooltip}
      >
        Language
      </TooltipLabel>
      <Select
        value={value}
        onValueChange={onChange}
      >
        <SelectTrigger className="w-full mt-2">
          <SelectValue placeholder="Select language" />
        </SelectTrigger>
        <SelectContent>
          {languages.map((language) => (
            <SelectItem 
              key={language.value} 
              value={language.value}
            >
              {language.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
