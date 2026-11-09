"use client";

import * as React from "react";
import { Tabs as TabsPrimitive } from "radix-ui";
import { cn } from "@/lib/utils";

// shadcn Tabs, restyled as an underline: a line under the tabs, and a blue bar that slides to the active one.

function Tabs({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Root>) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex flex-col", className)} {...props} />;
}

// The row of tabs. Put a <TabsIndicator /> inside it.
function TabsList({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.List>) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn("relative flex w-full border-b border-border", className)} {...props} />;
}

// Each tab takes an equal share of the width
function TabsTrigger({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Trigger>) {
  return (
    <TabsPrimitive.Trigger
      data-slot="tabs-trigger"
      className={cn(
        "flex-1 px-6 pt-2 pb-3.5 text-center text-sm font-semibold whitespace-nowrap text-muted-foreground transition-colors duration-300 outline-none",
        "hover:text-foreground data-[state=active]:text-primary",
        "focus-visible:rounded-md focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}

// The sliding bar. `index` is the position of the active tab (0 is the first), `count` is how many tabs there are.
function TabsIndicator({ index, count }: { index: number; count: number }) {
  return (
    <span
      aria-hidden="true"
      className="absolute -bottom-px left-0 h-0.5 rounded-full bg-primary transition-transform duration-300 ease-out"
      style={{ width: `${100 / count}%`, transform: `translateX(${index * 100}%)` }}
    />
  );
}

// Radix only renders the active tab's content, so it fades in each time you switch
function TabsContent({ className, ...props }: React.ComponentProps<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-slot="tabs-content"
      className={cn("flex-1 outline-none animate-in fade-in-0 slide-in-from-bottom-2 duration-300", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsIndicator, TabsContent };