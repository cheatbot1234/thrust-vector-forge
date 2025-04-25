
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

export function LoadingIndicator({ className, size = "md" }: LoadingIndicatorProps) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <Loader2 className={cn(sizes[size], "animate-spin text-rocket-orange")} />
    </div>
  );
}
