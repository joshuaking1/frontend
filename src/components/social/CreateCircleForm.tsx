// src/components/social/CreateCircleForm.tsx
"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2 } from "lucide-react";
import { createStudyCircle } from "@/app/dashboard/student/social/actions";

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending} className="bg-brand-blue hover:bg-brand-blue/90">
            {pending ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Creating...</> : "Create Circle"}
        </Button>
    )
}

export const CreateCircleForm = () => {
    const [open, setOpen] = useState(false);
    
    const handleFormAction = async (formData: FormData) => {
        const result = await createStudyCircle(formData);
        if (result?.error) {
            alert(`Error: ${result.error}`);
        } else {
            setOpen(false); // Close dialog on success
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                    <PlusCircle className="mr-2 h-4 w-4" /> Create a New Circle
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create a New Study Circle</DialogTitle>
                    <DialogDescription>
                        Start a new community. Give it a name and a short description to help others find it.
                    </DialogDescription>
                </DialogHeader>
                <form action={handleFormAction} className="space-y-4 pt-4">
                     <div>
                        <Label htmlFor="name">Circle Name</Label>
                        <Input id="name" name="name" placeholder="e.g., 'Form 3 Physics Help'" required />
                    </div>
                     <div>
                        <Label htmlFor="description">Description</Label>
                        <Textarea id="description" name="description" placeholder="e.g., 'A place to discuss tough physics problems and share study notes.'" />
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary">Cancel</Button>
                        </DialogClose>
                        <SubmitButton />
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}