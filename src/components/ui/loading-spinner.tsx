import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function LoadingSpinner({ className }: Props) {
  return (
    <div
      className={cn(
        "h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500",
        className,
      )}
    />
  );
}
