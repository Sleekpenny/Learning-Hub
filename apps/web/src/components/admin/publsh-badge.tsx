import { cn } from "@/lib/utils";

const PublishBadge = ({ published }: { published: boolean }) =>{
  return (
    <span
      className={cn(
        "inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold",
        published ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800",
      )}
    >
      {published ? "Published" : "Draft"}
    </span>
  );
}

export default PublishBadge