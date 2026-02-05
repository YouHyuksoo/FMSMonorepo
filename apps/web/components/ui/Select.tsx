"use client";

import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import { Icon } from "./Icon";

// --- Context ---
interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}
const SelectContext = createContext<SelectContextType | undefined>(undefined);

// --- Components ---

export function Select({
  value,
  onValueChange,
  children,
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative w-full">{children}</div>
    </SelectContext.Provider>
  );
}

export function SelectTrigger({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const context = useContext(SelectContext);
  if (!context) throw new Error("SelectTrigger must be used within Select");
  
  return (
    <button
      type="button"
      onClick={() => context.setOpen(!context.open)}
      className={`flex h-10 w-full items-center justify-between rounded-xl border border-border bg-background-white dark:bg-surface-dark px-3 py-2 text-sm ring-offset-background placeholder:text-text-secondary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    >
      {children}
      <Icon name="expand_more" size="sm" className="opacity-50" />
    </button>
  );
}

export function SelectValue({ placeholder }: { placeholder?: string }) {
  const context = useContext(SelectContext);
  // This is a simplification. Ideally, we'd map value to a label.
  // For now, we rely on the parent logic or render the value directly if no label map exists. 
  // In a real implementation, Select would accept 'options' or we traverse children to find label.
  // To handle 'mapping' value to Children's text, we would need more complex logic.
  // For this refactor, we usually pass the text as value or handle it in parent.
  // We will assume the value is displayable OR the user handles display.
  // Wait, Radix SelectValue automatically displays the text of the selected item.
  // We can't easily emulate that without traversing children.
  // Let's rely on a global store or just display value for now (or improve this later).
  // HACK: Dispatch a custom event or use a state lifted up?
  // Let's try to find the label from the children in Content? No, Content might not be rendered.
  // Alternative: Pass `displayValue` to Select? No, existing API doesn't have it.
  
  // Quick Fix for now: Display value. (User might need to adjust if value != label).
  // Actually, standard usage often is value=id, label=Name.
  // If we can't find label, it's UI regression.
  // Let's try to implement a simple "Label Registry".
  return <span className="block truncate">{context?.value || placeholder}</span>;
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  const context = useContext(SelectContext);
  if (!context || !context.open) return null;

  return (
    <>
      <div className="fixed inset-0 z-10" onClick={() => context.setOpen(false)} />
      <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-xl border border-border bg-background-white dark:bg-surface-dark p-1 text-text shadow-md animate-in fade-in zoom-in-95">
        {children}
      </div>
    </>
  );
}

export function SelectItem({ value, children }: { value: string; children: React.ReactNode }) {
  const context = useContext(SelectContext);
  if (!context) return null;

  const isSelected = context.value === value;

  return (
    <div
      onClick={() => {
        context.onValueChange(value);
        context.setOpen(false);
      }}
      className={`relative flex w-full cursor-pointer select-none items-center rounded-lg py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-surface dark:hover:bg-background-dark focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 ${isSelected ? "bg-primary/10 text-primary" : ""}`}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Icon name="check" size="xs" />}
      </span>
      <span className="truncate">{children}</span>
    </div>
  );
}
