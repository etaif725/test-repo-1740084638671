import { Checkbox } from "@/components/ui/checkbox";
import {
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUp, ArrowDown } from "lucide-react";
import type { Lead } from "@/types/types_db";
import { FIELD_MAPPINGS } from "./constants";
import { SortState } from "./types";

interface TableHeaderProps {
  onSelectAll: (checked: boolean) => void;
  allSelected: boolean;
  sortState: SortState;
  onSort: (column: keyof Lead) => void;
  hasLeads: boolean;
}

export function LeadTableHeader({
  onSelectAll,
  allSelected,
  sortState,
  onSort,
  hasLeads,
}: TableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead className="w-[50px] text-black dark:text-white bg-white dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-colors">
          <Checkbox
            checked={allSelected}
            onCheckedChange={onSelectAll}
            disabled={!hasLeads}
          />
        </TableHead>
        {Object.entries(FIELD_MAPPINGS).map(([key, label]) => (
          <TableHead
            key={key}
            className="cursor-pointer select-none text-black dark:text-white bg-white dark:bg-zinc-950 hover:bg-zinc-200 dark:hover:bg-zinc-900 transition-colors"
            onClick={() => onSort(key as keyof Lead)}
          >
            <div className="flex items-center space-x-1">
              <span>{label}</span>
              {sortState.column === key && (
                <span className="ml-1">
                  {sortState.direction === "asc" ? (
                    <ArrowUp className="h-4 w-4" />
                  ) : (
                    <ArrowDown className="h-4 w-4" />
                  )}
                </span>
              )}
            </div>
          </TableHead>
        ))}
      </TableRow>
    </TableHeader>
  );
}
