"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface StickyBottomCTAProps {
  children: React.ReactNode;
  className?: string;
  showOnMobile?: boolean;
}

export function StickyBottomCTA({
  children,
  className,
  showOnMobile = true,
}: StickyBottomCTAProps) {
  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 p-4 shadow-lg",
        showOnMobile ? "lg:hidden" : "hidden",
        className
      )}
    >
      <div className="mx-auto max-w-lg">{children}</div>
    </div>
  );
}
