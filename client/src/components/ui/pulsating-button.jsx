"use client";;
import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "./button";

export default function PulsatingButton({
  children,
  className,
  pulseColor = "255 255 255",
  duration = "1.5s",
  ...props
}) {
  return (
    <div className="relative inline-flex items-center">
      <div
        className="absolute -inset-2 rounded-full opacity-30 animate-pulse-scale"
        style={{
          background: `rgb(${pulseColor} / 0.2)`,
          animationDuration: duration,
        }}
      />
      <div
        className="absolute -inset-2 rounded-full opacity-30 animate-pulse-scale delay-150"
        style={{
          background: `rgb(${pulseColor} / 0.2)`,
          animationDuration: duration,
        }}
      />
      <Button
        className={cn(
          "relative rounded-full",
          className
        )}
        {...props}
      >
        {children}
      </Button>
    </div>
  );
}
