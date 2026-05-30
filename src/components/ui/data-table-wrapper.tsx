"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DataTableWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function DataTableWrapper({ children, className }: DataTableWrapperProps) {
  return (
    <div className={cn("w-full overflow-x-auto rounded-md border", className)}>
      {children}
    </div>
  );
}
