import * as React from "react"
import { cn } from "@/lib/utils"

const Modal = React.forwardRef(({ className, children, show, onClose, ...props }, ref) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm" onClick={onClose}>
      <div 
        className="fixed left-[50%] top-[50%] z-50 w-[70vw] max-w-[90vw] translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
        onClick={e => e.stopPropagation()}
        {...props}
      >
        {children}
      </div>
    </div>
  )
})
Modal.displayName = "Modal"

export { Modal }
