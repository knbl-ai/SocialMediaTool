import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Info } from "lucide-react";

const TooltipLabel = ({ children, tooltip, className }) => {
  return (
    <div className="flex items-center gap-1">
      <Label className={className}>{children}</Label>
      <TooltipProvider delayDuration={200}>
        <Tooltip>
          <TooltipTrigger asChild>
            <Info className="h-3 w-3 text-green-500 cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="text-xs bg-lime-500 p-2 max-w-[200px]">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default TooltipLabel; 