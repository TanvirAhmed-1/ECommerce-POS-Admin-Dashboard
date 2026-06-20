import React from "react";
import { Sliders, Search, Edit, Trash2 } from "lucide-react";

interface AttributeTableProps {
  attributes: any[];
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  targetId: string | null;
  handleEditClick: (attr: any) => void;
  handleDeleteClick: (id: string, name: string, e: React.MouseEvent) => void;
}

export default function AttributeTable({
  attributes,
  searchQuery,
  setSearchQuery,
  targetId,
  handleEditClick,
  handleDeleteClick,
}: AttributeTableProps) {
  return (
    <div className="glass-card p-5 rounded-2xl border border-border">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">
          Configured Attributes ({attributes.length})
        </h3>
        {/* Search Bar */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
          <input
            type="text"
            placeholder="Search attributes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-9 pr-3 rounded-lg border border-border bg-card text-xs font-medium text-foreground outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-all placeholder:text-muted-foreground"
          />
        </div>
      </div>

      {/* Attributes List */}
      <div className="space-y-3 overflow-y-auto max-h-[600px] pr-1 custom-scrollbar">
        {attributes.length > 0 ? (
          <div className="space-y-3">
            {attributes.map((attr) => {
              const isSelectedForEdit = targetId === attr._id;
              return (
                <div
                  key={attr._id}
                  onClick={() => handleEditClick(attr)}
                  className={`group p-4 rounded-xl border transition-all cursor-pointer flex flex-col gap-2 relative overflow-hidden ${
                    isSelectedForEdit
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-border hover:border-zinc-400 dark:hover:border-zinc-700 bg-card hover:bg-muted/10"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">
                        {attr.name}
                      </h4>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        slug: {attr.slug}
                      </span>
                      {!attr.isActive && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-500 uppercase tracking-wider">
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    {/* Float Actions */}
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(attr);
                        }}
                        className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded cursor-pointer transition-colors"
                        title="Edit Attribute"
                      >
                        <Edit size={12} />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(attr._id, attr.name, e);
                        }}
                        className="p-1 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded cursor-pointer transition-colors"
                        title="Delete Attribute"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>

                  {/* Display Value Badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {attr.values && attr.values.map((v: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-muted dark:bg-zinc-800 text-[10px] text-foreground font-semibold rounded-md border border-border/60"
                      >
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-muted-foreground space-y-2">
            <Sliders className="mx-auto text-muted/30 animate-pulse" size={36} />
            <p className="text-xs font-bold">No Attributes Configured</p>
            <p className="text-[10px]">Create attributes (e.g. Size, Color) to start configuring variants.</p>
          </div>
        )}
      </div>
    </div>
  );
}
