// frontend/src/components/dashboard/RefineModal.tsx
"use client";
import { useState, useTransition } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
// Import the action we just created
import { refineContentWithAI } from "@/app/dashboard/teacher/advanced-tools/actions";

type ContentItem = any; // Use a proper type in a real app

type RefineModalProps = {
  item: ContentItem | null;
  isOpen: boolean;
  onClose: () => void;
};

export const RefineModal = ({ item, isOpen, onClose }: RefineModalProps) => {
  const [refinementPrompt, setRefinementPrompt] = useState("");
  const [isPending, startTransition] = useTransition();

  if (!item) return null;

  const handleRefine = () => {
    startTransition(async () => {
      const result = await refineContentWithAI(item, refinementPrompt);
      if (result.error) {
        alert(result.error);
      } else {
        // Success! Close the modal. The page will be revalidated by the action.
        onClose();
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Refine "{item.title}"</DialogTitle>
          <DialogDescription>
            Provide instructions for the AI to modify this content. The current
            content is shown below for context.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="h-48 overflow-y-auto rounded-md border bg-slate-50 p-3">
            <pre className="text-xs whitespace-pre-wrap">
              {JSON.stringify(item.structured_content, null, 2)}
            </pre>
          </div>
          <div>
            <Label htmlFor="refinementPrompt" className="font-semibold">
              Your Instructions
            </Label>
            <Textarea
              id="refinementPrompt"
              value={refinementPrompt}
              onChange={(e) => setRefinementPrompt(e.target.value)}
              placeholder="e.g., 'Make the lesson activities more suitable for group work', 'Change the weighting of the Creativity criterion to 25%', 'Translate this to French'"
              rows={3}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <Button
            onClick={handleRefine}
            disabled={isPending}
            className="bg-brand-blue hover:bg-brand-blue/90"
          >
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Refining...
              </>
            ) : (
              "Submit to AI"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
