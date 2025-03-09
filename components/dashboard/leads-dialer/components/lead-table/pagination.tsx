"use client";

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DEFAULTS } from "./constants";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  pageSize: number;
  totalRecords: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
}

export function Pagination({
  currentPage,
  totalPages,
  pageSize,
  totalRecords,
  onPageChange,
  onPageSizeChange,
}: PaginationProps) {
  const handlePageInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return;
    
    const pageNum = parseInt(value);
    if (pageNum > 0 && pageNum <= totalPages) {
      onPageChange(pageNum);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Only allow numeric keys, backspace, delete, and arrow keys
    if (
      !/^\d$/.test(e.key) &&
      !["Backspace", "Delete", "ArrowLeft", "ArrowRight"].includes(e.key)
    ) {
      e.preventDefault();
    }
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-black dark:text-white">
          Rows per page
        </p>
        <Select
          value={pageSize.toString()}
          onValueChange={(value) => onPageSizeChange(parseInt(value))}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize.toString()} />
          </SelectTrigger>
          <SelectContent>
            {DEFAULTS.PAGE_SIZE_OPTIONS.map((size) => (
              <SelectItem key={size} value={size.toString()}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-sm text-black dark:text-white">
          {`${((currentPage - 1) * pageSize) + 1}-${Math.min(currentPage * pageSize, totalRecords)} of ${totalRecords}`}
        </p>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="text-black dark:text-white"
        >
          <ChevronsLeft className="h-8 w-8 dark:text-white" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="text-black dark:text-white"
        >
          <ChevronLeft className="h-8 w-8 dark:text-white" />
        </Button>
        <div className="flex items-center space-x-2">
          <Input
            className="h-8 w-[50px] text-center text-black dark:text-white"
            value={currentPage}
            onChange={handlePageInput}
            onKeyDown={handleKeyDown}
          />
          <span className="text-sm text-black dark:text-white">of {totalPages}</span>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="text-black dark:text-white"
        >
          <ChevronRight className="h-8 w-8 dark:text-white" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="text-black dark:text-white"
        >
          <ChevronsRight className="h-8 w-8 dark:text-white" />
        </Button>
      </div>
    </div>
  );
}
