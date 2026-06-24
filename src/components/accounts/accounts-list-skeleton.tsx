import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ACCOUNT_CARD_CATEGORY_LABEL_CLASS,
  ACCOUNT_CARD_CATEGORY_TO_FIRST_GAP_PX,
  ACCOUNT_CARD_CONTAINER_CLASS,
  ACCOUNT_CARD_GAP_PX,
  ACCOUNT_CARD_LOGO_SIZE_PX,
  ACCOUNT_CARD_PADDING_PX,
} from "@/lib/layout/account-card-chrome";
import { cn } from "@/lib/utils";

function AccountCardSkeleton() {
  return (
    <Card
      className={cn("overflow-hidden", ACCOUNT_CARD_CONTAINER_CLASS)}
      style={{ padding: ACCOUNT_CARD_PADDING_PX }}
    >
      <div className="flex" style={{ gap: 8 }}>
        <Skeleton
          className="shrink-0 rounded-[8px]"
          style={{
            width: ACCOUNT_CARD_LOGO_SIZE_PX,
            height: ACCOUNT_CARD_LOGO_SIZE_PX,
          }}
        />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="ms-auto h-3 w-16 shrink-0" />
          </div>
          <Skeleton className="h-4 w-40 max-w-full" />
        </div>
      </div>
    </Card>
  );
}

function AccountSectionSkeleton({ cardCount }: { cardCount: number }) {
  return (
    <section>
      <Skeleton
        className={cn("h-3 w-28", ACCOUNT_CARD_CATEGORY_LABEL_CLASS)}
        style={{ marginBottom: ACCOUNT_CARD_CATEGORY_TO_FIRST_GAP_PX }}
      />
      <div className="flex flex-col" style={{ gap: ACCOUNT_CARD_GAP_PX }}>
        {Array.from({ length: cardCount }, (_, index) => (
          <AccountCardSkeleton key={index} />
        ))}
      </div>
    </section>
  );
}

/** Mirrors the loaded Accounts list: filter chips, sections, and account cards. */
export function AccountsListSkeleton() {
  return (
    <>
      <div className="mb-4 flex gap-2">
        <Skeleton className="h-9 w-[4.75rem] rounded-full" />
        <Skeleton className="h-9 w-[5.5rem] rounded-full" />
      </div>
      <div className="flex flex-col" style={{ gap: 24 }}>
        <AccountSectionSkeleton cardCount={2} />
        <AccountSectionSkeleton cardCount={1} />
      </div>
    </>
  );
}
