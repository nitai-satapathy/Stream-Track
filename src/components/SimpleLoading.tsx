import { Loader2 } from "lucide-react";

interface SimpleLoadingProps {
  message?: string;
}

export function SimpleLoading({ message = "Loading..." }: SimpleLoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-3" />
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}
