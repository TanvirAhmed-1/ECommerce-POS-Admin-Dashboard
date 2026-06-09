"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trash2, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { ReactNode, useState } from "react";

interface DeleteConfirmProps {
  onConfirm: () => Promise<void>;
  title?: string;
  deleteName?: string;
  successMessage?: string;
  errorMessage?: string;
  trigger?: ReactNode;
}

export default function DeleteConfirm({
  onConfirm,
  title = "Are you sure?",
  deleteName = "Are you sure you want to remove the!.",
  trigger,
}: DeleteConfirmProps) {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  const handleDelete = async () => {
    try {
      setLoading(true);
      await onConfirm();
      setOpen(false);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger ?? (
          <Button
            variant="destructive"
            size="icon"
            className="bg-red-500 hover:bg-red-600 text-white transition-all duration-200 shadow-md hover:shadow-lg"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="bg-slate-950/95 backdrop-blur-xl border border-slate-800 max-w-md text-white">
        <DialogHeader>
          <div className="flex flex-col items-center gap-3 mb-2">
            <div className="p-4 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <AlertTriangle className="h-8 w-8" />
            </div>
            <DialogTitle className="text-xl font-bold font-heading text-white">
              {title}
            </DialogTitle>
          </div>
          <DialogDescription className="text-on-surface-variant/85 text-center text-sm leading-normal">
            Are you sure you want to remove the {deleteName}?
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
            className="flex-1 text-sm font-semibold border border-slate-700 hover:bg-slate-850 hover:border-slate-600 text-slate-300 transition-all duration-200 cursor-pointer bg-slate-900/50"
          >
            No, cancel!
          </Button>

          <Button
            onClick={handleDelete}
            disabled={loading}
            className="flex-1 bg-rose-600 hover:bg-rose-500 hover:shadow-rose-600/15 shadow-lg text-white font-medium transition-all duration-200 disabled:opacity-50 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center gap-2 justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Deleting...
              </div>
            ) : (
              <div className="flex text-sm font-semibold items-center gap-2 justify-center">
                Yes, delete it!
              </div>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}