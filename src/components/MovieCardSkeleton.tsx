import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function MovieCardSkeleton() {
  return (
    <Card className="w-[200px] shrink-0">
      <CardContent className="p-0">
        <Skeleton className="h-[300px] w-full rounded-t-lg" />
        <div className="space-y-2 p-3">
          <Skeleton className="h-5 w-4/5" />
          <div className="flex justify-between">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/4" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
