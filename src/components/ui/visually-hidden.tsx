import * as React from "react"
import { cn } from "@/lib/utils"

/**
 * VisuallyHidden component hides content visually while keeping it accessible to screen readers.
 * This is useful for accessibility when you need to provide context for assistive technologies
 * without showing it to sighted users.
 */
const VisuallyHidden = React.forwardRef<
  React.ElementRef<"span">,
  React.ComponentPropsWithoutRef<"span">
>(({ className, ...props }, ref) => (
  <span
    ref={ref}
    className={cn(
      "absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0",
      className
    )}
    {...props}
  />
))
VisuallyHidden.displayName = "VisuallyHidden"

export { VisuallyHidden }