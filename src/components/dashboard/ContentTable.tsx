// frontend/src/components/dashboard/ContentTable.tsx
"use client";
import { useState, useTransition } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Download, Edit, Loader2 } from "lucide-react";
import { RefineModal } from "./RefineModal"; // Import the modal
import { createClient } from "@/lib/supabase/client"; // Use client for secure downloads

type ContentItem = any; // Use a proper type later

export const ContentTable = ({
  initialContent,
}: {
  initialContent: ContentItem[];
}) => {
  const [content, setContent] = useState(initialContent);
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDownloading, startDownloadTransition] = useTransition();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const supabase = createClient();

  const handleDownload = async (item: ContentItem) => {
    setDownloadingId(item.id);
    startDownloadTransition(async () => {
      if (item.content_type === 'uploaded_resource') {
        // This part remains the same
        const { data, error } = await supabase.storage
          .from('teacher_resources')
          .createSignedUrl(item.file_path, 60);

        if (data?.signedUrl) {
          window.open(data.signedUrl, '_blank');
        } else {
          alert("Error creating download link: " + error?.message);
        }
      } else {
        // --- NEW PDF GENERATION LOGIC ---
        // Get the current user's ID to create a secure folder path
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          alert("You must be logged in to download.");
          setDownloadingId(null);
          return;
        }

        // Call the Edge Function
        const { data, error } = await supabase.functions.invoke('generate-pdf', {
          body: {
            content: item,
            fileName: item.title,
            userId: user.id
          },
        });
        
        if (error || !data.downloadUrl) {
          alert("Failed to generate PDF: " + (error?.message || "Unknown error"));
        } else {
          // Trigger the download in the browser
          window.open(data.downloadUrl, '_blank');
        }
      }
      setDownloadingId(null);
    });
  };

  const handleRefineClick = (item: ContentItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.title}</TableCell>
                <TableCell>
                  <Badge>{item.content_type.replace(/_/g, " ")}</Badge>
                </TableCell>
                <TableCell>{item.subject || "N/A"}</TableCell>
                <TableCell>
                  {new Date(item.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-right space-x-2">
                  {item.content_type !== "uploaded_resource" && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRefineClick(item)}
                    >
                      <Edit className="h-4 w-4 mr-1" /> Refine with AI
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(item)}
                    disabled={isDownloading && downloadingId === item.id}
                  >
                    {isDownloading && downloadingId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {/* The Modal is rendered here but only visible when isModalOpen is true */}
      <RefineModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
};
