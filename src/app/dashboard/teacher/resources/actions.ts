// src/app/dashboard/teacher/resources/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const resourceSchema = z.object({
  title: z.string().min(3, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  file: z.instanceof(File).refine(f => f.size > 0, "A file is required."),
});

export async function uploadResource(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in to upload." };

  const validation = resourceSchema.safeParse({
    title: formData.get('title'),
    subject: formData.get('subject'),
    file: formData.get('file'),
  });

  if (!validation.success) {
    return { error: "Invalid form data." };
  }

  const { title, subject, file } = validation.data;
  const filePath = `${user.id}/${Date.now()}-${file.name}`;

  // 1. Upload file to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('teacher_resources')
    .upload(filePath, file);

  if (uploadError) {
    console.error("Storage Error:", uploadError);
    return { error: "Failed to upload file." };
  }

  // 2. Insert metadata into the database
  const { error: dbError } = await supabase
    .from('resources')
    .insert({
      uploader_id: user.id,
      title,
      subject,
      file_path: filePath,
      file_type: file.type,
    });

  if (dbError) {
    console.error("Database Error:", dbError);
    // Attempt to clean up storage if DB insert fails
    await supabase.storage.from('teacher_resources').remove([filePath]);
    return { error: "Failed to save resource metadata." };
  }

  revalidatePath('/dashboard/teacher/resources');
  return { success: true };
}