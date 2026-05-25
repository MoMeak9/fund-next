"use client";

import { AddWatchlistDialog } from "@/features/watchlist/AddWatchlistDialog";
import { WatchlistTable } from "@/features/watchlist/WatchlistTable";

export default function WatchlistPage() {
  return (
    <section>
      <h1 className="mb-4 text-2xl font-semibold">自选资产</h1>
      <div className="mb-6 max-w-md">
        <AddWatchlistDialog />
      </div>
      <WatchlistTable />
    </section>
  );
}
