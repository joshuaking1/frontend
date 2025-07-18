// frontend/src/components/student/CreateEssayDialog.tsx
"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Loader2 } from "lucide-react";
import { createNewEssay } from "@/app/dashboard/student/essay-helper/actions";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="bg-brand-blue hover:bg-brand-blue/90"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Creating...
        </>
      ) : (
        "Create Essay and Start Writing"
      )}
    </Button>
  );
}

export const CreateEssayDialog = () => {
  const [open, setOpen] = useState(false);
  // The server action handles redirection, so we don't need complex client-side state management.

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Essay
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a New Essay</DialogTitle>
          <DialogDescription>
            Give your essay a title and a topic. The topic will help the AI
            provide relevant curriculum-aligned feedback.
          </DialogDescription>
        </DialogHeader>
        <form action={createNewEssay} className="space-y-4 pt-4">
          <div>
            <Label htmlFor="title">Essay Title</Label>
            <Input
              id="title"
              name="title"
              placeholder="e.g., The Impact of Cocoa Farming on Ghana's Economy"
              required
            />
          </div>
          <div>
            <Label htmlFor="topic">Main Topic or Subject</Label>
            <Input
              id="topic"
              name="topic"
              placeholder="e.g., Ghanaian Agriculture"
              required
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <SubmitButton />
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
