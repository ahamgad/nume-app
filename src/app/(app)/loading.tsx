import { Skeleton } from "@/components/ui/skeleton";

export default function AppLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col px-4 pt-4">
      <Skeleton className="h-10 w-40 rounded-md" />
      <Skeleton className="mt-4 h-24 w-full rounded-lg" />
      <Skeleton className="mt-4 h-24 w-full rounded-lg" />
    </div>
  );
}
