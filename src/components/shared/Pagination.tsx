import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  onItemsPerPageChange?: (size: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
}: PaginationProps) {
  if (!totalPages || totalPages === 0) return null;

  // Calculate visible page range (e.g. current - 1, current, current + 1)
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);

      if (currentPage <= 3) {
        end = 4;
      } else if (currentPage >= totalPages - 2) {
        start = totalPages - 3;
      }

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }

    return pages;
  };

  // Helper values for showing summary text
  const startItem = totalItems !== undefined && itemsPerPage !== undefined ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = totalItems !== undefined && itemsPerPage !== undefined ? Math.min(currentPage * itemsPerPage, totalItems) : 0;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-3 w-full">
      <div className="flex flex-wrap items-center gap-4">
        {/* Entries summary */}
        {totalItems !== undefined && itemsPerPage !== undefined ? (
          <span className="text-xs font-medium text-muted-foreground">
            Showing <span className="text-foreground font-bold">{startItem}</span> to{" "}
            <span className="text-foreground font-bold">{endItem}</span> of{" "}
            <span className="text-foreground font-bold">{totalItems}</span> entries
          </span>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">
            Page <span className="text-foreground font-bold">{currentPage}</span> of{" "}
            <span className="text-foreground font-bold">{totalPages}</span>
          </span>
        )}

        {/* Items Per Page Selector */}
        {onItemsPerPageChange && itemsPerPage !== undefined && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <span className="opacity-70">Show</span>
            <select
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="px-2 py-1 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all text-xs font-bold cursor-pointer"
            >
              {[5, 10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            <span className="opacity-70">entries</span>
          </div>
        )}
      </div>

      {/* Page controls (only render if totalPages > 1) */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5 select-none">
          {/* First Page */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/10 disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-muted-foreground cursor-pointer transition-all shrink-0"
            title="First Page"
          >
            <ChevronsLeft size={14} />
          </button>

          {/* Previous Page */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/10 disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-muted-foreground cursor-pointer transition-all shrink-0"
            title="Previous Page"
          >
            <ChevronLeft size={14} />
          </button>

          {/* Pages */}
          {getPageNumbers().map((page, idx) => (
            <React.Fragment key={idx}>
              {page === "..." ? (
                <span className="px-2 text-xs text-muted-foreground font-bold select-none cursor-default">...</span>
              ) : (
                <button
                  onClick={() => onPageChange(Number(page))}
                  className={`w-9 h-9 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-primary text-white border-primary shadow-sm shadow-primary/20"
                      : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/10"
                  }`}
                >
                  {page}
                </button>
              )}
            </React.Fragment>
          ))}

          {/* Next Page */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/10 disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-muted-foreground cursor-pointer transition-all shrink-0"
            title="Next Page"
          >
            <ChevronRight size={14} />
          </button>

          {/* Last Page */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted/10 disabled:opacity-40 disabled:hover:bg-card disabled:hover:text-muted-foreground cursor-pointer transition-all shrink-0"
            title="Last Page"
          >
            <ChevronsRight size={14} />
          </button>
        </div>
      )}
    </div>
  );
}
