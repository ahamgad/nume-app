import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

function AccountCardRowSkeleton() {
  return (
    <div className="flex min-h-16 gap-3 px-4 py-3">
      <Skeleton className="size-9 shrink-0 self-center rounded-[8px]" />
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="ms-auto h-4 w-16 shrink-0" />
        </div>
        <Skeleton className="h-4 w-40 max-w-full" />
      </div>
    </div>
  );
}

function AccountSectionSkeleton({ cardCount }: { cardCount: number }) {
  return (
    <section>
      <Skeleton className="mb-2 h-3 w-28" />
      <Card className="overflow-hidden shadow-none">
        {Array.from({ length: cardCount }, (_, index) => (
          <div key={index}>
            <AccountCardRowSkeleton />
            {index < cardCount - 1 ? (
              <div className="mx-4 border-b border-border" />
            ) : null}
          </div>
        ))}
      </Card>
    </section>
  );
}

/** Mirrors the loaded Accounts list: filter chips, sections, and card rows. */
export function AccountsListSkeleton() {
  return (
    <>
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-9 w-[4.75rem] rounded-full" />
        <Skeleton className="h-9 w-[5.5rem] rounded-full" />
      </div>
      <div className="space-y-6">
        <AccountSectionSkeleton cardCount={2} />
        <AccountSectionSkeleton cardCount={1} />
      </div>
    </>
  );
}
