// frontend/src/components/student/SnapSolveUploader.tsx
"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { analyzeHomeworkImage } from "@/app/dashboard/student/snap-solve/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Camera, Loader2, Sparkles, AlertCircle } from "lucide-react";

export const SnapSolveUploader = () => {
  const router = useRouter();
  const [image, setImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        setError(
          "Image file is too large. Please select a file smaller than 20MB."
        );
        return;
      }
      setImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    if (!image) return;
    setIsLoading(true);
    setError(null);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setError("Authentication error. Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      const filePath = `${user.id}/${Date.now()}-${image.name}`;
      const { error: uploadError } = await supabase.storage
        .from("homework_snaps")
        .upload(filePath, image);
      if (uploadError) throw new Error(`Storage Error: ${uploadError.message}`);

      const result = await analyzeHomeworkImage(filePath);
      if (result.error) throw new Error(`${result.error}`);

      if (result.sessionId) {
        router.push(`/dashboard/student/snap-solve/${result.sessionId}`);
      } else {
        throw new Error("Failed to create tutoring session.");
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl w-full">
      <Card className="bg-white p-2 sm:p-8 rounded-lg shadow-2xl text-center">
        <CardHeader>
          <Camera className="mx-auto h-16 w-16 text-brand-orange" />
          <CardTitle className="mt-4 text-2xl font-bold text-brand-blue">
            Snap & Solve Homework Helper
          </CardTitle>
          <CardDescription className="mt-2 text-slate-600">
            Stuck on a problem? Upload a picture from your textbook and let our
            AI tutor guide you to the answer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mt-6 border-2 border-dashed rounded-lg p-6 hover:border-brand-orange transition-colors">
            <Input
              id="homework-image"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              ref={fileInputRef}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
            >
              Choose Image
            </Button>
            {previewUrl && (
              <div className="mt-4">
                <img
                  src={previewUrl}
                  alt="Homework preview"
                  className="mx-auto max-h-60 rounded-md border p-2 bg-slate-50"
                />
              </div>
            )}
          </div>

          {error && (
            <div className="mt-4 text-red-600 bg-red-50 p-3 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p>{error}</p>
            </div>
          )}

          <Button
            onClick={handleAnalyze}
            disabled={!image || isLoading}
            size="lg"
            className="mt-6 w-full text-lg py-6"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Analyzing
                Image...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-5 w-5" /> Start Tutoring Session
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
