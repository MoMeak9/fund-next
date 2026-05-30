"use client";

import { PageHeader } from "@/components/layout/page-header";
import { AddWatchlistDialog } from "@/features/watchlist/AddWatchlistDialog";
import { WatchlistTable } from "@/features/watchlist/WatchlistTable";

export default function WatchlistPage() {
  return (
    <section>
      <PageHeader title="自选资产" actions={<AddWatchlistDialog />} />
      <WatchlistTable />
    </section>
  );
}
