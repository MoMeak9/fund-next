"use client";

type Props = { notes: string[] };

export function RiskDisclaimer({ notes }: Props) {
  return (
    <div className="rounded-md border border-muted bg-muted/30 p-4">
      {notes.map((note, i) => (
        <p key={i} className="text-xs text-muted-foreground">{note}</p>
      ))}
    </div>
  );
}
