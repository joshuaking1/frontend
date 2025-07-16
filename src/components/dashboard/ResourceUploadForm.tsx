// src/components/dashboard/ResourceUploadForm.tsx
"use client";

import { useFormStatus } from "react-dom";
import { uploadResource } from "@/app/dashboard/teacher/resources/actions";
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
          Uploading...
        </>
      ) : (
        "Upload File"
      )}
    </Button>
  );
}

export function ResourceUploadForm() {
  return (
    <form action={uploadResource} className="space-y-4">
      <div>
        <Label htmlFor="title">Resource Title</Label>
        <Input id="title" name="title" required />
      </div>
      <div>
        <Label htmlFor="subject">Subject</Label>
        <Input id="subject" name="subject" required />
      </div>
      <div>
        <Label htmlFor="file">File</Label>
        <Input id="file" name="file" type="file" required />
      </div>
      <SubmitButton />
    </form>
  );
}
