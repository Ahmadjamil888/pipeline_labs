import * as React from "react"

import { cn } from "@/lib/utils"

const Progress = React.forwardRef<
  React.ElementRef<"div">,
  React.HTMLAttributes<"div"> & { value?: number }
>(({ className, value, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative h-4 w-full overflow-hidden rounded-full bg-secondary",
        className
      )}
      {...props}
    >
      <div
        className="h-full w-full flex-1 bg-primary transition-all"
        style={{ width: `${value || 0}%` }}
      />
    </div>
  )
})
Progress.displayName = "Progress"

export { Progress }
