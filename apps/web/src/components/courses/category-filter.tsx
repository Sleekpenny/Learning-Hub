import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/state-message";

type Props = {
  // undefined while the categories are loading
  categories: string[] | undefined;
  // "" means all categories
  active: string;
  onChange: (category: string) => void;
};

// The category chips. On a phone they scroll sideways in one row instead of wrapping into many rows.
export function CategoryFilter({ categories, active, onChange }: Props) {
  if (!categories) {
    return (
      <div className="flex gap-2" aria-hidden="true">
        {["w-24", "w-32", "w-28", "w-36"].map((width) => (
          <Skeleton key={width} className={`h-9 rounded-full ${width}`} />
        ))}
      </div>
    );
  }

  return (
    <div
      role="group"
      aria-label="Filter by category"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {["", ...categories].map((name) => {
        const isActive = name === active;
        return (
          <button
            key={name || "all"}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(name)}
            className={cn(
              "shrink-0 rounded-full border px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
              isActive
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-white text-foreground/80 hover:border-primary/40 hover:text-primary",
            )}
          >
            {name || "All courses"}
          </button>
        );
      })}
    </div>
  );
}