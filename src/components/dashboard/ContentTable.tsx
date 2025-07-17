// frontend/src/components/dashboard/ContentTable.tsx
"use client";
import { useState } from "react";
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
import { Download, Edit } from "lucide-react";
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

  const supabase = createClient();

  const handleDownload = async (item: ContentItem) => {
    if (item.content_type === "uploaded_resource") {
      // For uploaded files, generate a secure, temporary download link
      const { data, error } = await supabase.storage
        .from("teacher_resources")
        .createSignedUrl(item.file_path, 60); // Link is valid for 60 seconds

      if (data?.signedUrl) {
        window.open(data.signedUrl, "_blank");
      } else {
        alert("Error creating download link: " + error?.message);
      }
    } else {
      // For AI content, create a Markdown file and trigger download
      const contentString = `## ${item.title}\n\n**Type:** ${
        item.content_type
      }\n**Subject:** ${item.subject}\n\n---\n\n${JSON.stringify(
        item.structured_content,
        null,
        2
      )}`;
      const blob = new Blob([contentString], { type: "text/markdown" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${item.title.replace(/ /g, "_")}.md`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleRefineClick = (item: ContentItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="rounded-md border bg-white">
        <Table>
          {/* ... TableHeader remains the same ... */}
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
                  >
                    <Download className="h-4 w-4" />
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
