import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FolderTree, Plus, Edit, Trash2, Search, X, RotateCcw, CornerDownRight } from "lucide-react";
import Pagination from "@/components/shared/Pagination";

interface CategoryTableProps {
  categories: any[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPage: number;
  };
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  activeFilter: string;
  setActiveFilter: (val: string) => void;
  navbarFilter: string;
  setNavbarFilter: (val: string) => void;
  footerFilter: string;
  setFooterFilter: (val: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (size: number) => void;
  targetId: string | null;
  handleEditClick: (node: any) => void;
  handleAddSubClick: (node: any) => void;
  handleDeleteClick: (id: string, name: string, e: React.MouseEvent) => void;
  handleResetFilters: () => void;
  isLoading?: boolean;
}

export default function CategoryTable({
  categories,
  meta,
  searchQuery,
  setSearchQuery,
  activeFilter,
  setActiveFilter,
  navbarFilter,
  setNavbarFilter,
  footerFilter,
  setFooterFilter,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  targetId,
  handleEditClick,
  handleAddSubClick,
  handleDeleteClick,
  handleResetFilters,
  isLoading = false,
}: CategoryTableProps) {
  // Local input state for search box
  const [inputSearchText, setInputSearchText] = React.useState<string>(searchQuery);

  // Sync if searchQuery changes externally (e.g. reset)
  React.useEffect(() => {
    setInputSearchText(searchQuery);
  }, [searchQuery]);

  const hasActiveFilters = Boolean(searchQuery || activeFilter || navbarFilter || footerFilter);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchQuery(inputSearchText.trim());
    setCurrentPage(1);
  };

  const handleResetClick = () => {
    setInputSearchText("");
    handleResetFilters();
  };

  return (
    <div className="glass-card p-5 rounded-2xl border border-border space-y-4">
      {/* 1. Top Search & Filter Bar (Backend Powered) */}
      <form
        onSubmit={handleSearchSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3"
      >
        {/* Search Input */}
        <div className="lg:col-span-4 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/70" size={14} />
          <input
            type="text"
            placeholder="Search categories by name, slug, title..."
            value={inputSearchText}
            onChange={(e) => setInputSearchText(e.target.value)}
            className="w-full pl-10 pr-9 h-10 text-xs font-semibold rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-xs"
          />
          {inputSearchText && (
            <button
              type="button"
              onClick={() => {
                setInputSearchText("");
                setSearchQuery("");
                setCurrentPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-md hover:bg-muted transition-colors"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Active Status Filter */}
        <div className="lg:col-span-2">
          <select
            value={activeFilter}
            onChange={(e) => {
              setActiveFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-xs"
          >
            <option value="">All Status</option>
            <option value="true">Active Only</option>
            <option value="false">Inactive Only</option>
          </select>
        </div>

        {/* Navbar Filter */}
        <div className="lg:col-span-2">
          <select
            value={navbarFilter}
            onChange={(e) => {
              setNavbarFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-xs"
          >
            <option value="">All Navbar</option>
            <option value="true">In Navbar</option>
            <option value="false">Not in Navbar</option>
          </select>
        </div>

        {/* Footer Filter */}
        <div className="lg:col-span-2">
          <select
            value={footerFilter}
            onChange={(e) => {
              setFooterFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full h-10 px-3 text-xs font-semibold rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer shadow-xs"
          >
            <option value="">All Footer</option>
            <option value="true">In Footer</option>
            <option value="false">Not in Footer</option>
          </select>
        </div>

        {/* Right Side Search and Reset Buttons */}
        <div className="lg:col-span-2 flex items-center gap-2">
          <button
            type="submit"
            className="flex-1 h-10 px-3 bg-primary hover:bg-primary/90 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20 transition-all cursor-pointer active:scale-98"
          >
            <Search size={13} />
            <span>Search</span>
          </button>
          <button
            type="button"
            onClick={handleResetClick}
            className="h-10 px-3.5 bg-muted/40 hover:bg-muted text-muted-foreground hover:text-foreground border border-border rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer active:scale-98"
            title="Reset Search and Filters"
          >
            <RotateCcw size={13} />
            <span>Reset</span>
          </button>
        </div>
      </form>

      {/* 2. Categories Table */}
      <div className="space-y-2 overflow-y-auto max-h-[650px] pr-1 custom-scrollbar">
        {categories.length > 0 ? (
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[6%] text-[10px] font-bold uppercase tracking-wider pl-4">SL</TableHead>
                  <TableHead className="w-[10%] text-[10px] font-bold uppercase tracking-wider">Image</TableHead>
                  <TableHead className="w-[42%] text-[10px] font-bold uppercase tracking-wider">Category / Hierarchy</TableHead>
                  <TableHead className="w-[28%] text-[10px] font-bold uppercase tracking-wider">Visibility & Media</TableHead>
                  <TableHead className="w-[14%] text-right text-[10px] font-bold uppercase tracking-wider pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((node, index) => {
                  const isSelectedForEdit = targetId === node._id;
                  const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;
                  const parentName =
                    node.parentCategory && typeof node.parentCategory === "object"
                      ? node.parentCategory.name
                      : null;
                  const isRoot = !parentName && (node.level === 0 || node.level === undefined);
                  const level = node.level || (parentName ? 1 : 0);

                  return (
                    <TableRow
                      key={node._id}
                      onClick={() => handleEditClick(node)}
                      className={`cursor-pointer transition-all border-b border-border/40 hover:bg-muted/10 ${
                        isSelectedForEdit
                          ? "bg-primary/5 dark:bg-primary/10 border-l-2 border-l-primary"
                          : ""
                      } ${isRoot && index > 0 ? "border-t border-t-border/70" : ""}`}
                    >
                      {/* SL Column */}
                      <TableCell className="pl-4 py-3 text-xs font-bold text-muted-foreground">
                        {globalIndex}
                      </TableCell>

                      {/* Dedicated Image Column */}
                      <TableCell className="py-3">
                        {node.image ? (
                          <img
                            src={node.image}
                            alt={node.name}
                            className="w-11 h-11 object-cover rounded-xl border border-border/80 shrink-0 shadow-xs"
                          />
                        ) : (
                          <div className="w-11 h-11 rounded-xl bg-muted border border-border/60 flex items-center justify-center text-muted-foreground/60 shrink-0">
                            <FolderTree size={16} />
                          </div>
                        )}
                      </TableCell>

                      {/* Category Info with Parent-Based Child Hierarchy Indentation */}
                      <TableCell className="py-3">
                        <div
                          className="flex flex-col min-w-0"
                          style={{ paddingLeft: `${level * 20}px` }}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {!isRoot && (
                              <CornerDownRight size={13} className="text-primary/70 shrink-0" />
                            )}
                            <span className={`text-xs truncate ${isRoot ? "font-bold text-foreground" : "font-semibold text-foreground/90"}`}>
                              {node.name}
                            </span>
                            {isRoot ? (
                              <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-muted-foreground uppercase tracking-wider">
                                Root
                              </span>
                            ) : (
                              <span className="text-[9px] font-medium text-primary px-1.5 py-0.5 rounded bg-primary/10 truncate">
                                ↳ {parentName}
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-muted-foreground truncate font-medium mt-0.5">
                            /{node.slug} {node.title ? `• ${node.title}` : ""}
                          </span>
                        </div>
                      </TableCell>

                      {/* Visibility & Media Status Badges */}
                      <TableCell className="py-3">
                        <div className="flex flex-wrap gap-1 items-center">
                          {node.isActive ? (
                            <Badge variant="outline" className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-none uppercase tracking-wider hover:bg-emerald-500/15">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[9px] font-bold px-2 py-0.5 rounded bg-rose-500/10 text-rose-500 border-none uppercase tracking-wider hover:bg-rose-500/15">
                              Inactive
                            </Badge>
                          )}
                          {node.isFeatured && (
                            <Badge variant="outline" className="text-[9px] font-bold px-2 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border-none uppercase tracking-wider hover:bg-purple-500/15">
                              Featured
                            </Badge>
                          )}
                          {node.showInNavbar && (
                            <Badge variant="outline" className="text-[9px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border-none uppercase tracking-wider hover:bg-blue-500/15">
                              Navbar
                            </Badge>
                          )}
                          {node.showInFooter && (
                            <Badge variant="outline" className="text-[9px] font-bold px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border-none uppercase tracking-wider hover:bg-amber-500/15">
                              Footer
                            </Badge>
                          )}
                          {node.banner && (
                            <Badge variant="outline" className="text-[9px] font-bold px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-none uppercase tracking-wider hover:bg-cyan-500/15">
                              Banner
                            </Badge>
                          )}
                          {node.description && (
                            <Badge variant="outline" className="text-[9px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-none uppercase tracking-wider hover:bg-indigo-500/15">
                              SEO
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right py-3 pr-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleAddSubClick(node);
                            }}
                            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg cursor-pointer transition-colors"
                            title="Add Subcategory"
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditClick(node);
                            }}
                            className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg cursor-pointer transition-colors"
                            title="Edit Category Settings"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteClick(node._id, node.name, e);
                            }}
                            className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg cursor-pointer transition-colors"
                            title="Delete Category"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>

            {/* 3. Reusable Pagination Component (Backend Connected) */}
            <div className="p-4 border-t border-border bg-card/50">
              <Pagination
                currentPage={currentPage}
                totalPages={meta.totalPage || 1}
                totalItems={meta.total || 0}
                itemsPerPage={itemsPerPage}
                onPageChange={(page) => setCurrentPage(page)}
                onItemsPerPageChange={(size) => {
                  setItemsPerPage(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        ) : (
          <div className="p-12 text-center text-muted-foreground space-y-3 rounded-2xl border border-dashed border-border bg-card/50">
            <FolderTree className="mx-auto text-muted/30" size={40} />
            <div className="space-y-1">
              <p className="text-sm font-bold text-foreground">No Categories Found</p>
              <p className="text-xs text-muted-foreground">
                {hasActiveFilters
                  ? "No categories match the active filter criteria. Try changing or resetting your filters."
                  : "No categories have been created yet. Click '+ Add New Category' above to get started."}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw size={12} /> Reset Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

