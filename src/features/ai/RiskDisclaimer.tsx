"use client";

import { ShieldAlert } from "lucide-react";

type Props = {
  notes: string[];
};

export function RiskDisclaimer({ notes }: Props) {
  return (
    <div className="rounded-md border bg-muted/40 p-4 text-xs leading-6 text-muted-foreground">
      <div className="mb-2 flex items-center gap-2 font-medium text-foreground">
        <ShieldAlert className="h-4 w-4" />
        风险提示
      </div>
      <ul className="space-y-1">
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </div>
  );
}
