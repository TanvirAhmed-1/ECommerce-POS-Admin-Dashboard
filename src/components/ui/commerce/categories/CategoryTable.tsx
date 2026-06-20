import React, { useState, useEffect, useMemo } from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FolderTree, Plus, Edit, Trash2, ChevronDown, ChevronRight, Search, X } from "lucide-react";
import Pagination from "@/components/shared/Pagination";

interface CategoryTableProps {
  categories: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  itemsPerPage: number;
  setItemsPerPage: (size: number) => void;
  targetId: string | null;
  handleEditClick: (node: any) => void;
  handleAddSubClick: (node: any) => void;
  handleDeleteClick: (id: string, name: string, e: React.MouseEvent) => void;
  handleCancel: () => void; // For "Add Root" button action
}

export default function CategoryTable({
  categories,
  searchQuery,
  setSearchQuery,
  currentPage,
  setCurrentPage,
  itemsPerPage,
  setItemsPerPage,
  targetId,
  handleEditClick,
  handleAddSubClick,
  handleDeleteClick,
  handleCancel,
}: CategoryTableProps) {
  // Collapsed tree node states
  const [expandedIds, setExpandedIds] = useState<Record<string, boolean>>({});

  // Initialize collapse states (expand all by default)
  useEffect(() => {
    const expandAll = (list: any[]) => {
      const ids: Record<string, boolean> = {};
      const traverse = (items: any[]) => {
        items.forEach((item) => {
          ids[item._id] = true;
          if (item.children) {
            traverse(item.children);
          }
        });
      };
      traverse(list);
      setExpandedIds(ids);
    };
    if (categories && categories.length > 0) {
      expandAll(categories);
    }
  }, [categories]);

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Flatten tree for flat table rendering, respecting collapse states
  const getFlatCategories = (nodes: any[]): any[] => {
    const list: any[] = [];
    const traverse = (items: any[], isParentCollapsed = false) => {
      items.forEach((item) => {
        const isCollapsed = !expandedIds[item._id];
        
        list.push({
          ...item,
          isRowHidden: isParentCollapsed,
        });

        if (item.children && item.children.length > 0) {
          traverse(item.children, isParentCollapsed || isCollapsed);
        }
      });
    };
    traverse(nodes, false);
    return list;
  };

  // 1. Filter nodes based on search query
  const filteredList = useMemo(() => {
    const flatList = getFlatCategories(categories);
    if (!searchQuery.trim()) {
      return flatList.filter((item) => !item.isRowHidden);
    }
    return flatList.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery, expandedIds]);

  // 2. Paginate the filtered list
  const totalPages = Math.ceil(filteredList.length / itemsPerPage);
  const paginatedList = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredList, currentPage, itemsPerPage]);

  return (
    <div className="glass-card p-5 rounded-2xl border border-border">
      <div className="flex justify-between items-center mb-5">
        <div>
          <h4 className="font-heading text-base font-bold text-foreground">Category Hierarchy</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Click any node to edit details or use hover buttons to manage tree branches.
          </p>
        </div>
        <button
          onClick={handleCancel}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:opacity-90 transition-all cursor-pointer shadow-sm shadow-primary/20"
        >
          <Plus size={14} /> Add Root
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/80" size={14} />
        <input
          type="text"
          placeholder="Search categories by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-9 py-2.5 text-xs font-semibold rounded-xl border border-border bg-card text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer p-1 rounded-md hover:bg-muted transition-colors"
          >
            <X size={12} />
          </button>
        )}
      </div>

      <div className="space-y-2 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
        {categories.length > 0 ? (
          <div className="rounded-xl border border-border overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead className="w-[8%] text-[10px] font-bold uppercase tracking-wider pl-4">SL</TableHead>
                  <TableHead className="w-[15%] text-[10px] font-bold uppercase tracking-wider">Image</TableHead>
                  <TableHead className="w-[40%] text-[10px] font-bold uppercase tracking-wider">Category / Info</TableHead>
                  <TableHead className="w-[25%] text-[10px] font-bold uppercase tracking-wider">Visibility & Badges</TableHead>
                  <TableHead className="w-[12%] text-right text-[10px] font-bold uppercase tracking-wider pr-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedList.length > 0 ? (
                  paginatedList.map((node, index) => {
                    const hasChildren = node.children && node.children.length > 0;
                    const isExpanded = !!expandedIds[node._id];
                    const isSelectedForEdit = targetId === node._id;
                    const globalIndex = (currentPage - 1) * itemsPerPage + index + 1;

                    return (
                      <TableRow
                        key={node._id}
                        onClick={() => handleEditClick(node)}
                        className={`cursor-pointer transition-all border-b border-border/40 hover:bg-muted/10 ${
                          isSelectedForEdit
                            ? "bg-primary/5 dark:bg-primary/10 border-l-2 border-l-primary"
                            : ""
                        }`}
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
                              className="w-12 h-12 object-cover rounded-xl border border-border/80 shrink-0 shadow-sm"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-xl bg-muted border border-border/60 flex items-center justify-center text-muted-foreground/60 shrink-0">
                              <FolderTree size={18} />
                            </div>
                          )}
                        </TableCell>

                        {/* Category Info with Hierarchy Indentation */}
                        <TableCell className="py-3">
                          <div
                            className="flex items-center gap-2 min-w-0"
                            style={{ paddingLeft: searchQuery.trim() ? "0px" : `${node.level * 16}px` }}
                            onClick={(e) => {
                              // Avoid triggering row edit click if they clicked expand trigger
                            }}
                          >
                            {/* Expand/Collapse Trigger (only visible when not searching) */}
                            {!searchQuery.trim() && hasChildren ? (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleExpand(node._id, e);
                                }}
                                className="p-1 rounded hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 cursor-pointer transition-colors"
                              >
                                {isExpanded ? <ChevronDown size={13} className="animate-fade-in" /> : <ChevronRight size={13} className="animate-fade-in" />}
                              </button>
                            ) : (
                              !searchQuery.trim() && <div className="w-6 shrink-0" />
                            )}

                            <div className="flex flex-col min-w-0 ml-1">
                              <span className="text-xs font-bold text-foreground truncate flex items-center gap-1.5">
                                {node.name}
                                {node.level === 0 && (
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-muted-foreground uppercase tracking-wider scale-90">
                                    Root
                                  </span>
                                )}
                              </span>
                              <span className="text-[10px] text-muted-foreground truncate font-medium">
                                /{node.slug} {node.title ? `• ${node.title}` : ""}
                              </span>
                            </div>
                          </div>
                        </TableCell>

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
                          </div>
                        </TableCell>

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
                              title="Edit Category"
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
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-xs font-semibold text-muted-foreground">
                      No categories found matching your search.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {/* Reusable Pagination component */}
            {filteredList.length > 0 && (
              <div className="p-4 border-t border-border bg-card/50">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={(page) => setCurrentPage(page)}
                  totalItems={filteredList.length}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={(size) => {
                    setItemsPerPage(size);
                    setCurrentPage(1);
                  }}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground space-y-2">
            <FolderTree className="mx-auto text-muted/30" size={36} />
            <p className="text-xs font-bold">No Categories Configured</p>
            <p className="text-[10px]">Create your first root category using the form on the right.</p>
          </div>
        )}
      </div>
    </div>
  );
}
