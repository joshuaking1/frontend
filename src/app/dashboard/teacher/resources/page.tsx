// src/app/dashboard/teacher/resources/page.tsx
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UploadCloud, File, Trash2 } from "lucide-react";
import { uploadResource } from "./actions";

// This is a separate Client Component to handle form state
import { ResourceUploadForm } from "@/components/dashboard/ResourceUploadForm";

async function ResourcesPage() {
  const supabase = await createClient();
  const { data: resources } = await supabase
    .from("resources")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-blue mb-2">
        My Resource Vault
      </h1>
      <p className="text-slate-600 mb-6">
        Upload, manage, and reuse your teaching materials.
      </p>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Upload Form Section */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <UploadCloud className="mr-2" /> Upload New Resource
              </CardTitle>
              <CardDescription>
                Add a new file to your personal vault.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResourceUploadForm />
            </CardContent>
          </Card>
        </div>

        {/* Display Section */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-brand-blue mb-4">
            Your Uploaded Resources
          </h2>
          {resources && resources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resources.map((resource) => (
                <Card
                  key={resource.id}
                  className="bg-white flex items-center p-4 justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <File className="h-8 w-8 text-brand-orange" />
                    <div>
                      <p className="font-semibold">{resource.title}</p>
                      <p className="text-sm text-slate-500">
                        {resource.subject}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-slate-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center p-8 border-2 border-dashed rounded-lg">
              <p className="text-slate-500">
                You haven't uploaded any resources yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResourcesPage;
