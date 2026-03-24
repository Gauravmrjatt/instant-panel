"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TablePaginationProps {
  page: number;
  totalItems: number;
  rowsPerPage: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rows: number) => void;
}

export default function TablePagination({
  page,
  totalItems,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
}: TablePaginationProps) {
  const totalPages = Math.ceil(totalItems / rowsPerPage);
  const startItem = (page - 1) * rowsPerPage + 1;
  const endItem = Math.min(page * rowsPerPage, totalItems);

  return (
    <div className="flex w-full items-center justify-between gap-2">
      <div className="flex items-center gap-2">
        <Label className="whitespace-nowrap">Rows per page:</Label>
        <Select
          onValueChange={(value) => onRowsPerPageChange(Number(value))}
          value={rowsPerPage.toString()}
        >
          <SelectTrigger className="w-[70px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10">10</SelectItem>
            <SelectItem value="20">20</SelectItem>
            <SelectItem value="50">50</SelectItem>
            <SelectItem value="100">100</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <span className="whitespace-nowrap text-muted-foreground text-sm">
          {startItem}-{endItem} of {totalItems}
        </span>

        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <Button
                aria-label="Go to previous page"
                disabled={page === 1}
                size="icon"
                variant="ghost"
                onClick={() => onPageChange(page - 1)}
              >
                <ChevronLeftIcon className="h-4 w-4" />
              </Button>
            </PaginationItem>
            <PaginationItem>
              <Button
                aria-label="Go to next page"
                disabled={page >= totalPages}
                size="icon"
                variant="ghost"
                onClick={() => onPageChange(page + 1)}
              >
                <ChevronRightIcon className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  );
}
