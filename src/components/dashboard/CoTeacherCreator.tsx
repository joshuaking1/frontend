// src/components/dashboard/CoTeacherCreator.tsx
"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle } from "lucide-react";
import { createCoTeacher } from "@/app/dashboard/teacher/co-teacher/actions";
import { useState } from "react";

export function CoTeacherCreator() {
  const [open, setOpen] = useState(false);

  const handleFormAction = async (formData: FormData) => {
    const result = await createCoTeacher(formData);
    if (result.success) {
      setOpen(false); // Close the dialog on success
    } else {
      // Handle error display if needed
      alert(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full bg-brand-orange hover:bg-brand-orange/90">
          <PlusCircle className="mr-2 h-4 w-4" /> Create New Co-Teacher
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Your AI Co-Teacher</DialogTitle>
          <DialogDescription>
            Define the personality and expertise of your new AI colleague.
          </DialogDescription>
        </DialogHeader>
        <form action={handleFormAction} className="space-y-4">
          <div>
            <Label htmlFor="name">Co-Teacher Name</Label>
            <Input
              id="name"
              name="name"
              placeholder="e.g., 'History Helper'"
              required
            />
          </div>
          <div>
            <Label htmlFor="persona">Persona</Label>
            <Textarea
              id="persona"
              name="persona"
              placeholder="Describe your AI's personality. e.g., 'A witty and sharp-tongued English literature expert who quotes Shakespeare.'"
              required
            />
          </div>
          <Button type="submit" className="w-full">
            Save Co-Teacher
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
