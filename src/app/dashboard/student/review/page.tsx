// frontend/src/app/dashboard/student/review/page.tsx
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { FlashcardReviewClient } from "@/components/student/FlashcardReviewClient"; // To be created
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function ReviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  // Fetch all cards due for review today or earlier
  const { data: dueReviews } = await supabase
    .from("srs_reviews")
    .select(
      `
            *,
            flashcard: flashcards!inner(*)
        `
    )
    .eq("student_id", user.id)
    .lte("next_review_at", new Date().toISOString())
    .order("next_review_at", { ascending: true });

  if (!dueReviews || dueReviews.length === 0) {
    return (
      <div className="text-center py-20">
        <h1 className="text-2xl font-bold text-brand-blue">All Caught Up!</h1>
        <p className="text-slate-600 mt-2">
          You have no flashcards to review today. Great job!
        </p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/student/notes">Go to Notes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-blue mb-6">
        Daily Review Session ({dueReviews.length} cards)
      </h1>
      <FlashcardReviewClient initialReviews={dueReviews} />
    </div>
  );
}
