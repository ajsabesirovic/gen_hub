"use client";

import * as React from "react";
import { Filter, X } from "lucide-react";
import { Button } from "./button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "./sheet";
import { cn } from "@/lib/utils";

interface FilterSheetProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  activeFilterCount?: number;
  onClearFilters?: () => void;
  className?: string;
}

export function FilterSheet({
  children,
  title = "Filters",
  description,
  activeFilterCount = 0,
  onClearFilters,
  className,
}: FilterSheetProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <>
            <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className={cn("lg:hidden gap-2", className)}
      >
        <Filter className="h-4 w-4" />
        Filters
        {activeFilterCount > 0 && (
          <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
            {activeFilterCount}
          </span>
        )}
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-[320px] overflow-y-auto">
          <SheetHeader className="border-b pb-4">
            <div className="flex items-center justify-between pr-6">
              <SheetTitle className="text-lg">{title}</SheetTitle>
              {activeFilterCount > 0 && onClearFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onClearFilters();
                    setOpen(false);
                  }}
                  className="h-auto px-2 py-1 text-xs"
                >
                  Clear all
                  <X className="ml-1 h-3 w-3" />
                </Button>
              )}
            </div>
            {description && <SheetDescription>{description}</SheetDescription>}
            {activeFilterCount > 0 && (
              <p className="text-xs text-muted-foreground">
                {activeFilterCount} filter{activeFilterCount !== 1 ? "s" : ""}{" "}
                active
              </p>
            )}
          </SheetHeader>
          <div className="flex-1 overflow-y-auto p-4 space-y-6">{children}</div>
        </SheetContent>
      </Sheet>
    </>
  );
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  className?: string;
}

export function FilterSection({
  title,
  children,
  className,
}: FilterSectionProps) {
  return (
    <div className={cn("space-y-3 text-left", className)}>
      <label className="text-sm font-medium text-foreground text-left">
        {title}
      </label>
      {children}
    </div>
  );
}

interface FilterDividerProps {
  className?: string;
}

export function FilterDivider({ className }: FilterDividerProps) {
  return <div className={cn("h-px bg-border", className)} />;
}
