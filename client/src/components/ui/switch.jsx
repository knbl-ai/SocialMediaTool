import * as React from "react"
import { cn } from "@/lib/utils"

const Switch = React.forwardRef(({ className, checked, onCheckedChange, ...props }, ref) => (
  <label className="relative inline-block w-[30px] h-[17px]">
    <input
      type="checkbox"
      className="opacity-0 w-0 h-0"
      checked={checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
      ref={ref}
      {...props}
    />
    <span className={cn(
      "absolute cursor-pointer inset-0 rounded-[17px] bg-gray-300 transition-all duration-400",
      "before:absolute before:content-[''] before:h-[13px] before:w-[13px] before:left-[2px] before:bottom-[2px]",
      "before:bg-white before:transition-all before:duration-400 before:rounded-full",
      "data-[checked=true]:bg-lime-500 data-[checked=true]:before:translate-x-[13px]",
      className
    )} data-checked={checked} />
  </label>
))

Switch.displayName = "Switch"

export { Switch }
