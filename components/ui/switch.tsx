"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
    <div className="flex items-center bg-green-200/20 rounded-2xl w-60 shadow-sm"> {/* Adjusted width for better spacing */}
    <SwitchPrimitives.Root
      className={cn(
        "relative inline-flex items-center py-1.5 justify-between shrink-0 cursor-pointer rounded-xl border-4 border-transparent transition-all ease-in-out duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
        "bg-transparent w-full",
        className
      )}
      {...props}
      ref={ref}
    >
      <div className="flex justify-between w-full px-2"> {/* Padding for text alignment */}
        <span className="navbar-dashboard-font font-medium text-white select-none pointer-events-none flex-1 text-center pr-4">Adaptive</span>
        <span className="navbar-dashboard-font font-medium text-white select-none pointer-events-none flex-1 text-center">Static</span>
      </div>
      <SwitchPrimitives.Thumb
        className={cn(
          "pointer-events-none absolute left-0 top-0 block h-full w-1/2 bg-green-200/20 rounded-xl transition-transform shadow-lg",
          "data-[state=checked]:translate-x-full"
        )}
      />
    </SwitchPrimitives.Root>
  </div>
));

Switch.displayName = "Switch";

export { Switch } 
