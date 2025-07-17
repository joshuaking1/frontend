// frontend/src/components/dashboard/TosBuilder.tsx
"use client";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { generateTos } from "@/app/dashboard/teacher/advanced-tools/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, ListChecks } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from "@/components/ui/table";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full sm:w-auto bg-brand-blue hover:bg-brand-blue/90"
    >
      {pending ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Building...
        </>
      ) : (
        <>
          <ListChecks className="mr-2 h-4 w-4" />
          Build Table of Spec
        </>
      )}
    </Button>
  );
}

function TosDisplay({ tos }: { tos: any }) {
  if (!tos || !tos.specifications) return null;

  const totalQuestions = tos.specifications.reduce(
    (sum: number, item: any) => sum + item.totalQuestions,
    0
  );
  const cognitiveTotals = tos.cognitiveLevels.map((level: string) =>
    tos.specifications.reduce(
      (sum: number, item: any) => sum + item.breakdown[level.toLowerCase()],
      0
    )
  );

  return (
    <Card className="mt-6 border-slate-200">
      <CardHeader>
        <CardTitle className="text-xl text-brand-blue">
          {tos.title} - ({tos.subject})
        </CardTitle>
        <CardDescription>Total Marks: {tos.totalMarks}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-slate-50 hover:bg-slate-100">
                <TableHead
                  rowSpan={2}
                  className="w-[25%] font-bold text-slate-700 align-bottom"
                >
                  Topic/Sub-Strand
                </TableHead>
                <TableHead
                  colSpan={6}
                  className="text-center font-bold text-slate-700 border-l"
                >
                  Cognitive Levels (Bloom's Taxonomy)
                </TableHead>
                <TableHead
                  rowSpan={2}
                  className="align-bottom font-bold text-slate-700 border-l"
                >
                  Total Questions
                </TableHead>
                <TableHead
                  rowSpan={2}
                  className="align-bottom font-bold text-slate-700 border-l"
                >
                  Total Marks
                </TableHead>
              </TableRow>
              <TableRow className="bg-slate-50 hover:bg-slate-100">
                {tos.cognitiveLevels.map((level: string) => (
                  <TableHead
                    key={level}
                    className="text-center font-semibold border-l"
                  >
                    {level}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {tos.specifications.map((spec: any) => (
                <TableRow key={spec.topic} className="border-b">
                  <TableCell className="font-medium text-slate-800">
                    {spec.topic}
                  </TableCell>
                  {tos.cognitiveLevels.map((level: string) => (
                    <TableCell key={level} className="text-center border-l">
                      {spec.breakdown[level.toLowerCase()]}
                    </TableCell>
                  ))}
                  <TableCell className="text-center font-bold border-l">
                    {spec.totalQuestions}
                  </TableCell>
                  <TableCell className="text-center font-bold border-l">
                    {spec.totalMarks}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-slate-100 font-bold">
                <TableCell>Total</TableCell>
                {cognitiveTotals.map((total, index) => (
                  <TableCell key={index} className="text-center border-l">
                    {total}
                  </TableCell>
                ))}
                <TableCell className="text-center border-l">
                  {totalQuestions}
                </TableCell>
                <TableCell className="text-center border-l">
                  {tos.totalMarks}
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

export function TosBuilder() {
  const [state, formAction] = useActionState(generateTos, {
    tos: null,
    error: null,
  });

  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle className="text-2xl text-brand-blue">
          AI-Powered Table of Specification (TOS) Builder
        </CardTitle>
        <CardDescription>
          Detail the curriculum content covered. The AI will generate a balanced
          exam blueprint aligned with the SBC.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <Label htmlFor="examTitle" className="font-semibold">
                Examination Title
              </Label>
              <Input
                id="examTitle"
                name="examTitle"
                placeholder="e.g., End of First Term Examination"
              />
            </div>
            <div>
              <Label htmlFor="totalMarks" className="font-semibold">
                Total Marks
              </Label>
              <Input
                id="totalMarks"
                name="totalMarks"
                type="number"
                placeholder="e.g., 100"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="subject" className="font-semibold">
              Subject
            </Label>
            <Input
              id="subject"
              name="subject"
              placeholder="e.g., Art and Design"
            />
          </div>
          <div>
            <Label htmlFor="strandsCovered" className="font-semibold">
              Strands & Sub-Strands Covered
            </Label>
            <Textarea
              id="strandsCovered"
              name="strandsCovered"
              placeholder="List all the strands and sub-strands covered during the term. Be as detailed as possible for the best results..."
              rows={5}
            />
          </div>
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </form>

        {state.tos && <TosDisplay tos={state.tos} />}

        {state.error && (
          <p className="text-red-600 font-semibold mt-4 bg-red-50 p-3 rounded-md">
            {state.error}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
