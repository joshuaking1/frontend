// frontend/src/components/dashboard/ExportButton.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileText, File, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type ExportButtonProps = {
  planData: unknown;
  onExport?: (format: "pdf" | "docx") => void;
};

export function ExportButton({ planData, onExport }: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState<"pdf" | "docx" | null>(null);
  const [exportSuccess, setExportSuccess] = useState<"pdf" | "docx" | null>(
    null
  );

  const handleExport = async (format: "pdf" | "docx") => {
    setIsExporting(format);
    setExportSuccess(null);

    try {
      // Call the export function
      if (format === "pdf") {
        await exportToPDF(planData);
      } else {
        await exportToDOCX(planData);
      }

      setExportSuccess(format);
      setTimeout(() => {
        setExportSuccess(null);
      }, 3000);
    } catch (error) {
      console.error(`Export to ${format.toUpperCase()} failed:`, error);
      alert(`Failed to export ${format.toUpperCase()}. Please try again.`);
    } finally {
      setIsExporting(null);
    }

    onExport?.(format);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
      {/* PDF Export Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.3,
        }}
      >
        <Button
          onClick={() => handleExport("pdf")}
          disabled={isExporting !== null}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[160px]"
          size="lg"
        >
          {isExporting === "pdf" ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : exportSuccess === "pdf" ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Downloaded!
            </>
          ) : (
            <>
              <FileText className="mr-2 h-5 w-5" />
              Export as PDF
            </>
          )}
        </Button>
      </motion.div>

      {/* DOCX Export Button */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          stiffness: 260,
          damping: 20,
          delay: 0.5,
        }}
      >
        <Button
          onClick={() => handleExport("docx")}
          disabled={isExporting !== null}
          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 min-w-[160px]"
          size="lg"
        >
          {isExporting === "docx" ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Generating...
            </>
          ) : exportSuccess === "docx" ? (
            <>
              <CheckCircle className="mr-2 h-5 w-5" />
              Downloaded!
            </>
          ) : (
            <>
              <File className="mr-2 h-5 w-5" />
              Export as DOCX
            </>
          )}
        </Button>
      </motion.div>
    </div>
  );
}

// PDF Export Function
async function exportToPDF(planData: unknown) {
  try {
    // Use browser's built-in print functionality for more reliable PDF generation
    const { inputs, aiContent } = planData as unknown;

    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      throw new Error("Popup blocked. Please allow popups and try again.");
    }

    // Generate the HTML content
    const htmlContent = generateLessonPlanHTML(inputs, aiContent);

    // Write the content to the new window
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Lesson Plan - ${inputs.subject} - Week ${inputs.week}</title>
          <style>
            @media print {
              body { margin: 0; padding: 20px; }
              @page { margin: 0.5in; }
            }
            body { 
              font-family: system-ui, -apple-system, sans-serif; 
              line-height: 1.4;
              color: #000;
            }
            table { 
              border-collapse: collapse; 
              width: 100%; 
              margin: 0;
            }
            td, th { 
              border: 1px solid #000; 
              padding: 8px; 
              text-align: left;
              vertical-align: top;
            }
            .header { 
              background-color: #f3f4f6 !important; 
              font-weight: bold;
            }
            .blue-bg { 
              background-color: #1e40af !important; 
              color: white !important;
            }
            .green-bg { 
              background-color: #f0fdf4 !important;
            }
            .differentiation-bg { 
              background-color: #dbeafe !important;
            }
            .activity-label { 
              font-weight: bold; 
              color: #ea580c; 
              margin-bottom: 4px;
            }
            ul { 
              margin: 4px 0; 
              padding-left: 16px;
            }
            li { 
              margin: 2px 0;
            }
            h2 { 
              text-align: center; 
              color: #1e40af; 
              margin-bottom: 20px;
            }
          </style>
        </head>
        <body>
          ${htmlContent}
          
          <!-- Generated by LearnBridge Edu Footer -->
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 12px; color: #6b7280;">
            <p style="margin: 0; font-style: italic;">Generated by <strong>LearnBridge Edu</strong> - AI-Powered Learning for Ghana's SBC</p>
            <p style="margin: 5px 0 0 0; font-size: 10px;">www.learnbridgeedu.com</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    // Wait for content to load, then trigger print
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();

      // Close the window after printing
      setTimeout(() => {
        printWindow.close();
      }, 1000);
    }, 500);
  } catch (error) {
    console.error("PDF export failed:", error);
    throw new Error("Failed to export PDF. Please try again.");
  }
}

// DOCX Export Function
async function exportToDOCX(planData: unknown) {
  // Dynamic import to avoid SSR issues
  const {
    Document,
    Packer,
    Paragraph,
    Table,
    TableRow,
    TableCell,
    TextRun,
    WidthType,
    BorderStyle,
  } = await import("docx");

  const { inputs, aiContent } = planData;

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Title
          new Paragraph({
            children: [
              new TextRun({
                text: "Learning Plan",
                bold: true,
                size: 32,
                color: "1e40af",
              }),
            ],
            alignment: "center",
            spacing: { after: 400 },
          }),

          // Create table with lesson plan data
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            borders: {
              top: { style: BorderStyle.SINGLE, size: 1 },
              bottom: { style: BorderStyle.SINGLE, size: 1 },
              left: { style: BorderStyle.SINGLE, size: 1 },
              right: { style: BorderStyle.SINGLE, size: 1 },
              insideHorizontal: { style: BorderStyle.SINGLE, size: 1 },
              insideVertical: { style: BorderStyle.SINGLE, size: 1 },
            },
            rows: [
              // Header row
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Subject", bold: true }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: inputs.subject })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Week", bold: true })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: inputs.week })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Duration", bold: true }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: `${inputs.duration} mins` }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Form", bold: true })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: inputs.grade })],
                      }),
                    ],
                  }),
                ],
              }),

              // Add more rows for other content...
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: "Strand", bold: true })],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: inputs.strand })],
                      }),
                    ],
                    columnSpan: 3,
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Sub-Strand", bold: true }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [new TextRun({ text: inputs.subStrand })],
                      }),
                    ],
                    columnSpan: 3,
                  }),
                ],
              }),

              // Content Standard
              new TableRow({
                children: [
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({ text: "Content Standard", bold: true }),
                        ],
                      }),
                    ],
                  }),
                  new TableCell({
                    children: [
                      new Paragraph({
                        children: [
                          new TextRun({
                            text: aiContent.contentStandard || inputs.topic,
                          }),
                        ],
                      }),
                    ],
                    columnSpan: 7,
                  }),
                ],
              }),

              // Add more rows as needed...
            ],
          }),

          // Add spacing before footer
          new Paragraph({
            children: [new TextRun({ text: "" })],
            spacing: { after: 400 },
          }),

          // Generated by LearnBridge Edu Footer
          new Paragraph({
            children: [
              new TextRun({
                text: "Generated by ",
                size: 20,
                color: "6b7280",
                italics: true,
              }),
              new TextRun({
                text: "LearnBridge Edu",
                size: 20,
                color: "6b7280",
                bold: true,
                italics: true,
              }),
              new TextRun({
                text: " - AI-Powered Learning for Ghana's SBC",
                size: 20,
                color: "6b7280",
                italics: true,
              }),
            ],
            alignment: "center",
            spacing: { after: 200 },
          }),

          // Website footer
          new Paragraph({
            children: [
              new TextRun({
                text: "www.learnbridgeedu.com",
                size: 18,
                color: "6b7280",
              }),
            ],
            alignment: "center",
          }),
        ],
      },
    ],
  });

  // Generate and download DOCX
  const blob = await Packer.toBlob(doc);
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `lesson-plan-${inputs.subject}-week-${inputs.week}.docx`;
  link.click();
  window.URL.revokeObjectURL(url);
}

// Generate HTML for PDF export (matching the exact styling)
function generateLessonPlanHTML(inputs: unknown, aiContent: unknown): string {
  const renderList = (items: string[]) =>
    `<ul style="list-style-type: disc; padding-left: 1rem; margin: 0.25rem 0; font-size: 0.875rem;">
      ${items
        .map((item) => `<li style="margin: 0.25rem 0;">${item}</li>`)
        .join("")}
    </ul>`;

  return `
    <div style="background: white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border-radius: 0.5rem; border: 1px solid #e5e7eb; overflow: hidden; font-family: system-ui, -apple-system, sans-serif;">
      <div style="padding: 1.5rem;">
        <h2 style="text-align: center; font-weight: bold; font-size: 1.5rem; margin-bottom: 1.5rem; color: #1e40af;">
          Learning Plan
        </h2>

        <div style="overflow-x: auto;">
          <table style="width: 100%; border-collapse: collapse; border: 1px solid #d1d5db;">
            <tbody>
              <!-- Header Row -->
              <tr style="background-color: #f3f4f6;">
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; font-weight: 600; width: 12.5%;">Subject</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;">${
                  inputs.subject
                }</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; font-weight: 600; width: 12.5%;">Week</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;">${
                  inputs.week
                }</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; font-weight: 600; width: 12.5%;">Duration</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;">${
                  inputs.duration
                } mins</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; font-weight: 600; width: 12.5%;">Form</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;">${
                  inputs.grade
                }</td>
              </tr>

              <!-- Strand Row -->
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; font-weight: 600; background-color: #f9fafb;">Strand</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;" colspan="3">${
                  inputs.strand
                }</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; font-weight: 600; background-color: #f9fafb;">Sub-Strand</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;" colspan="3">${
                  inputs.subStrand
                }</td>
              </tr>

              <!-- Content Standard Row -->
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; font-weight: 600; background-color: #f9fafb;">Content Standard</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;" colspan="7">${
                  aiContent.contentStandard || inputs.topic
                }</td>
              </tr>

              <!-- Learning Outcome Row -->
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; font-weight: 600; background-color: #f9fafb;">Learning Outcome(s)</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;" colspan="7">${renderList(
                  [aiContent.learningOutcome]
                )}</td>
              </tr>

              <!-- Learning Indicator Row -->
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; font-weight: 600; background-color: #f9fafb;">Learning Indicator(s)</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;" colspan="7">${renderList(
                  [aiContent.learningIndicator]
                )}</td>
              </tr>

              <!-- Essential Questions Row -->
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; font-weight: 600; background-color: #f9fafb;">Essential Question(s)</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;" colspan="7">${renderList(
                  aiContent.essentialQuestions
                )}</td>
              </tr>

              <!-- Pedagogical Strategies Row -->
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; font-weight: 600; background-color: #f9fafb;">Pedagogical Strategies</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;" colspan="7">${aiContent.pedagogicalStrategies.join(
                  ", "
                )}</td>
              </tr>

              <!-- Teaching & Learning Resources Row -->
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; font-weight: 600; background-color: #f9fafb;">Teaching & Learning Resources</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;" colspan="7">${renderList(
                  aiContent.teachingAndLearningResources
                )}</td>
              </tr>

              <!-- Key Notes on Differentiation Row -->
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; font-weight: 600; background-color: #dbeafe;">Key Notes on Differentiation</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; background-color: #dbeafe;" colspan="7">${aiContent.differentiationNotes.join(
                  ". "
                )}</td>
              </tr>

              <!-- Activities Header -->
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; font-weight: 600; background-color: #1e40af; color: white; text-align: center;" colspan="2">Teacher Activity</td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; font-weight: 600; background-color: #1e40af; color: white; text-align: center;" colspan="6">Learner Activity</td>
              </tr>

              <!-- Starter Activity -->
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;" colspan="2">
                  <div style="font-weight: 500; color: #ea580c; margin-bottom: 0.5rem;">Starter Activity</div>
                  ${aiContent.starterActivity.teacher}
                </td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;" colspan="6">${
                  aiContent.starterActivity.learner
                }</td>
              </tr>

              <!-- Introductory Activity -->
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;" colspan="2">
                  <div style="font-weight: 500; color: #ea580c; margin-bottom: 0.5rem;">Introductory Activity</div>
                  ${aiContent.introductoryActivity.teacher}
                </td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;" colspan="6">${
                  aiContent.introductoryActivity.learner
                }</td>
              </tr>

              <!-- Main Activity 1 -->
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;" colspan="2">
                  <div style="font-weight: 500; color: #ea580c; margin-bottom: 0.5rem;">Main Activity 1</div>
                  ${aiContent.mainActivity1.teacher}
                </td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;" colspan="6">${
                  aiContent.mainActivity1.learner
                }</td>
              </tr>

              <!-- Main Activity 2 -->
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;" colspan="2">
                  <div style="font-weight: 500; color: #ea580c; margin-bottom: 0.5rem;">Main Activity 2</div>
                  ${aiContent.mainActivity2.teacher}
                </td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem;" colspan="6">${
                  aiContent.mainActivity2.learner
                }</td>
              </tr>

              <!-- Lesson Conclusion -->
              <tr>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; background-color: #f0fdf4;" colspan="2">
                  <div style="font-weight: 500; color: #166534; margin-bottom: 0.5rem;">Lesson Conclusion</div>
                  ${aiContent.lessonConclusion.teacher}
                </td>
                <td style="border: 1px solid #d1d5db; padding: 0.75rem; background-color: #f0fdf4;" colspan="6">${
                  aiContent.lessonConclusion.learner
                }</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `;
}
