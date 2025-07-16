// src/components/admin/CurriculumUploadForm.tsx
"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { ingestSBCDocument } from "@/app/admin/curriculum/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Ingesting...
        </>
      ) : (
        "Ingest Document"
      )}
    </Button>
  );
}

export function CurriculumUploadForm() {
  const [state, formAction] = useActionState(ingestSBCDocument, {
    success: false,
    error: null,
  });

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" name="subject" required />
        </div>
        <div>
          <Label htmlFor="grade">Grade / Form</Label>
          <Input id="grade" name="grade" required />
        </div>
      </div>
      <div>
        <Label htmlFor="file">SBC PDF Document</Label>
        <Input
          id="file"
          name="file"
          type="file"
          required
          accept="application/pdf"
        />
      </div>
      <SubmitButton />
      {state.error && (
        <p className="text-sm text-red-500 mt-2">{state.error.message}</p>
      )}
    </form>
  );
}
