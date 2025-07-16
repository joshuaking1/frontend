// src/app/onboarding/actions.ts
"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

// Zod schema for validation
const teacherOnboardingSchema = z.object({
  fullName: z.string().min(3, "Full name must be at least 3 characters"),
  gender: z.string().min(1, "Please select a gender"),
  yearsOfExperience: z.coerce.number().min(0, "Experience cannot be negative"),
  positionRank: z.string().min(2, "Please enter your position or rank"),
  region: z.string().min(1, "Please select a region"),
  district: z.string().min(1, "Please select a district"),
  schoolName: z.string().min(3, "Please enter your school name"),
  subjects: z.array(z.string()).min(1, "Please select at least one subject"),
});

export async function updateTeacherProfile(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/auth/sign-in');
  }

  const rawFormData = {
    fullName: formData.get('fullName'),
    gender: formData.get('gender'),
    yearsOfExperience: formData.get('yearsOfExperience'),
    positionRank: formData.get('positionRank'),
    region: formData.get('region'),
    district: formData.get('district'),
    schoolName: formData.get('schoolName'),
    subjects: formData.getAll('subjects'),
  };
  
  const validation = teacherOnboardingSchema.safeParse(rawFormData);

  if (!validation.success) {
    // In a real app, you'd return these errors to the form.
    // For now, we'll throw an error.
    throw new Error(validation.error.flatten().fieldErrors.toString());
  }
  
  const { fullName, gender, region, district, schoolName, yearsOfExperience, positionRank, subjects } = validation.data;

  // We need to find or create the school
  let { data: school } = await supabase.from('schools').select('id').eq('name', schoolName).single();
  
  if (!school) {
    const { data: newSchool, error: schoolError } = await supabase
      .from('schools')
      .insert({ name: schoolName, region, district })
      .select('id')
      .single();

    if (schoolError || !newSchool) throw new Error("Could not create school.");
    school = newSchool;
  }
  
  // Update the profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      gender: gender,
      location_region: region,
      location_district: district,
      onboarding_complete: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);
  
  if (profileError) throw new Error("Could not update profile.");

  // Insert into teacher_details table
  const { error: teacherDetailsError } = await supabase
    .from('teacher_details')
    .insert({
      profile_id: user.id,
      school_id: school.id,
      years_of_experience: yearsOfExperience,
      position_rank: positionRank,
      subjects_taught: subjects
    });
  
  if (teacherDetailsError) throw new Error("Could not save teacher details.");
  
  // Revalidate the path to trigger middleware and redirect
  revalidatePath('/onboarding/teacher', 'layout');
  redirect(`/dashboard/teacher`);
}
const studentOnboardingSchema = z.object({
    fullName: z.string().min(3, "Full name must be at least 3 characters"),
    dateOfBirth: z.string().refine((dob) => new Date(dob).toString() !== 'Invalid Date', "Please enter a valid date"),
    gender: z.string().min(1, "Please select a gender"),
    region: z.string().min(1, "Please select a region"),
    schoolName: z.string().min(3, "Please enter your school name"),
    currentClass: z.string().min(1, "Please enter your class or grade"),
});


export async function updateStudentProfile(formData: FormData) {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return redirect('/auth/sign-in');
  }

  const rawFormData = {
    fullName: formData.get('fullName'),
    dateOfBirth: formData.get('dateOfBirth'),
    gender: formData.get('gender'),
    region: formData.get('region'),
    schoolName: formData.get('schoolName'),
    currentClass: formData.get('currentClass'),
  };

  const validation = studentOnboardingSchema.safeParse(rawFormData);
  
  if (!validation.success) {
    const errorMessages = Object.values(validation.error.flatten().fieldErrors).join(', ');
    throw new Error(`Invalid form data: ${errorMessages}`);
  }

  const { fullName, dateOfBirth, gender, region, schoolName, currentClass } = validation.data;

  // Find or create the school
  let { data: school } = await supabase.from('schools').select('id').eq('name', schoolName).single();
  
  if (!school) {
    const { data: newSchool, error: schoolError } = await supabase
      .from('schools')
      .insert({ name: schoolName, region })
      .select('id')
      .single();

    if (schoolError || !newSchool) throw new Error("Could not create school.");
    school = newSchool;
  }

  // Update the profiles table
  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      full_name: fullName,
      date_of_birth: new Date(dateOfBirth).toISOString(),
      gender: gender,
      location_region: region,
      onboarding_complete: true,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id);

  if (profileError) throw new Error(`Could not update profile: ${profileError.message}`);

  // Insert into student_details table
  const { error: studentDetailsError } = await supabase
    .from('student_details')
    .insert({
      profile_id: user.id,
      school_id: school.id,
      current_class: currentClass
    });

  if (studentDetailsError) throw new Error(`Could not save student details: ${studentDetailsError.message}`);

  revalidatePath('/onboarding/student', 'layout');
  redirect(`/dashboard/student`);
}