import * as React from "react"
import { cn } from "../../lib/utils"

export function BorderBeam({
  className,
  size = 300,
  duration = 15,
  anchor = 90,
  borderWidth = 1.5,
  colorFrom = "#ffaa40",
  colorTo = "#9c40ff",
  delay = 0,
}) {
  return (
    <div
      className={cn(
        "absolute inset-0 overflow-hidden rounded-[inherit]",
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          maskImage: "linear-gradient(black, black)",
          maskComposite: "exclude",
          WebkitMaskImage: "linear-gradient(black, black)",
          WebkitMaskComposite: "xor",
          padding: borderWidth,
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `conic-gradient(from ${anchor}deg at 50% 50%, transparent 0%, ${colorFrom} 10%, ${colorTo} 50%, transparent 100%)`,
          animation: `spin ${duration}s linear infinite`,
          animationDelay: `${delay}s`,
          width: `${size}%`,
          height: `${size}%`,
          transform: "translate(-50%, -50%)",
          left: "50%",
          top: "50%",
        }}
      />
    </div>
  )
} 