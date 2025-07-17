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

  // 2. Insert metadata into the NEW teacher_content table
  const { error: dbError } = await supabase
    .from('teacher_content')
    .insert({
      owner_id: user.id,
      content_type: 'uploaded_resource',
      title: title,
      subject: subject,
      file_path: filePath,
      structured_content: {
        original_filename: file.name,
        file_size: file.size,
        mime_type: file.type,
      }
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

export async function deleteResource(resourceId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    return { error: "You must be logged in." };
  }

  try {
    // Get the resource to check ownership and get file path
    const { data: resource, error: fetchError } = await supabase
      .from('teacher_content')
      .select('*')
      .eq('id', resourceId)
      .eq('owner_id', user.id)
      .eq('content_type', 'uploaded_resource')
      .single();

    if (fetchError || !resource) {
      return { error: "Resource not found or access denied." };
    }

    // Delete from storage if file_path exists
    if (resource.file_path) {
      await supabase.storage
        .from('teacher_resources')
        .remove([resource.file_path]);
    }

    // Delete from database
    const { error: deleteError } = await supabase
      .from('teacher_content')
      .delete()
      .eq('id', resourceId)
      .eq('owner_id', user.id);

    if (deleteError) {
      return { error: "Failed to delete resource." };
    }

    revalidatePath('/dashboard/teacher/resources');
    return { success: true };

  } catch (error) {
    console.error("Delete resource error:", error);
    return { error: "An unexpected error occurred." };
  }
}
