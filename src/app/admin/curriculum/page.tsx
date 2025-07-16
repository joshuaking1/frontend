// src/app/admin/curriculum/page.tsx
import { createClient } from "@/lib/supabase/server";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CurriculumUploadForm } from "@/components/admin/CurriculumUploadForm";
import { FileText, CheckCircle } from "lucide-react";

async function CurriculumManagementPage() {
  const supabase = await createClient();
  const { data: documents } = await supabase
    .from("sbc_curriculum_documents")
    .select("id, file_name, subject, grade_level, status")
    .order("created_at", { ascending: false });

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-brand-blue mb-2">
        Curriculum Management
      </h1>
      <p className="text-slate-600 mb-6">
        Upload and manage the source-of-truth SBC documents for the AI.
      </p>
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Ingest New Document</CardTitle>
              <CardDescription>
                Upload a PDF to make its content available to the AI.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CurriculumUploadForm />
            </CardContent>
          </Card>
        </div>
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-brand-blue mb-4">
            Ingested Documents
          </h2>
          <div className="space-y-3">
            {documents?.map((doc) => (
              <Card
                key={doc.id}
                className="bg-white flex items-center justify-between p-4"
              >
                <div className="flex items-center space-x-4">
                  <FileText className="h-6 w-6 text-brand-blue" />
                  <div>
                    <p className="font-semibold">{doc.file_name}</p>
                    <p className="text-sm text-slate-500">
                      {doc.subject} - Form {doc.grade_level}
                    </p>
                  </div>
                </div>
                <div className="flex items-center text-sm text-green-600 font-medium">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {doc.status}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CurriculumManagementPage;
