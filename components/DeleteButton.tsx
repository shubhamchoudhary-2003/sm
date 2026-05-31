"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Trash2, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function handleDelete() {
    setLoading(true);
    await fetch(`/api/products/${id}`, { method: "DELETE" });
    setOpen(false);
    router.refresh();
    setLoading(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        className={cn(
          buttonVariants({ variant: "outline", size: "sm" }),
          "h-8 w-8 p-0 text-destructive hover:bg-destructive/10 border-destructive/30"
        )}
      >
        <Trash2 className="w-3 h-3" />
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Delete product?</DialogTitle>
          <DialogDescription>
            This will permanently remove the product and its photo. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="gap-2">
          <button
            className={cn(buttonVariants({ variant: "outline" }))}
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={cn(buttonVariants({ variant: "destructive" }))}
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-1.5">
                <Loader2 className="w-3 h-3 animate-spin" />
                Deleting…
              </span>
            ) : (
              "Delete"
            )}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
