// frontend/src/components/dashboard/TosBuilder.tsx
"use client";

import { useFormState, useFormStatus } from "react-dom";
import { generateTos } from "@/app/dashboard/teacher/advanced-tools/actions";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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

// This is the 100x renderer. It takes the structured JSON and builds the perfect table.
function TosDisplay({ tos }: { tos: any }) {
  if (!tos || !tos.weeks) return null;

  // Calculate totals for the footer
  const totals = { dok1: 0, dok2: 0, dok3: 0, dok4: 0, total: 0 };
  tos.weeks.forEach((week: any) => {
    Object.values(week.questionDistribution).forEach((dist: any) => {
      totals.dok1 += dist.dok1;
      totals.dok2 += dist.dok2;
      totals.dok3 += dist.dok3;
      totals.dok4 += dist.dok4;
      totals.total += dist.dok1 + dist.dok2 + dist.dok3 + dist.dok4;
    });
  });

  return (
    <Card className="mt-6 border-slate-200">
      <CardHeader className="text-center">
        <CardTitle className="text-xl text-brand-blue uppercase">
          {tos.subject}
        </CardTitle>
        <CardDescription className="font-semibold">
          {tos.examTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto border">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-bold border-r">Week</TableHead>
                <TableHead className="font-bold border-r w-[35%]">
                  Focal Area (s)
                </TableHead>
                <TableHead className="font-bold border-r">
                  Type of questions
                </TableHead>
                <TableHead
                  colSpan={4}
                  className="text-center font-bold border-r"
                >
                  DoK levels
                </TableHead>
                <TableHead className="font-bold">Total</TableHead>
              </TableRow>
              <TableRow className="bg-slate-50">
                <TableHead className="border-r"></TableHead>
                <TableHead className="border-r"></TableHead>
                <TableHead className="border-r"></TableHead>
                <TableHead className="font-semibold text-center border-r">
                  1 (30%)
                </TableHead>
                <TableHead className="font-semibold text-center border-r">
                  2 (40%)
                </TableHead>
                <TableHead className="font-semibold text-center border-r">
                  3 (25%)
                </TableHead>
                <TableHead className="font-semibold text-center border-r">
                  4 (5%)
                </TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tos.weeks.map((week: any, weekIndex: number) => (
                <>
                  <TableRow key={`${week.weekNumber}-mcq`}>
                    <TableCell
                      rowSpan={3}
                      className="font-bold text-center border-r align-top"
                    >
                      {week.weekNumber}
                    </TableCell>
                    <TableCell rowSpan={3} className="border-r align-top">
                      <ul className="list-decimal pl-4">
                        {week.focalAreas.map((area: string, i: number) => (
                          <li key={i}>{area}</li>
                        ))}
                      </ul>
                    </TableCell>
                    <TableCell className="font-medium border-r">
                      Multiple choice
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {week.questionDistribution.multipleChoice.dok1 || "-"}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {week.questionDistribution.multipleChoice.dok2 || "-"}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {week.questionDistribution.multipleChoice.dok3 || "-"}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {week.questionDistribution.multipleChoice.dok4 || "-"}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {Object.values(
                        week.questionDistribution.multipleChoice
                      ).reduce((a: number, b: number) => a + b, 0)}
                    </TableCell>
                  </TableRow>
                  <TableRow key={`${week.weekNumber}-essay`}>
                    <TableCell className="font-medium border-r">
                      Essay
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {week.questionDistribution.essay.dok1 || "-"}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {week.questionDistribution.essay.dok2 || "-"}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {week.questionDistribution.essay.dok3 || "-"}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {week.questionDistribution.essay.dok4 || "-"}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {Object.values(week.questionDistribution.essay).reduce(
                        (a: number, b: number) => a + b,
                        0
                      )}
                    </TableCell>
                  </TableRow>
                  <TableRow
                    key={`${week.weekNumber}-practical`}
                    className="border-b"
                  >
                    <TableCell className="font-medium border-r">
                      Practical
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {week.questionDistribution.practical.dok1 || "-"}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {week.questionDistribution.practical.dok2 || "-"}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {week.questionDistribution.practical.dok3 || "-"}
                    </TableCell>
                    <TableCell className="text-center border-r">
                      {week.questionDistribution.practical.dok4 || "-"}
                    </TableCell>
                    <TableCell className="text-center font-bold">
                      {Object.values(
                        week.questionDistribution.practical
                      ).reduce((a: number, b: number) => a + b, 0)}
                    </TableCell>
                  </TableRow>
                </>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow className="bg-slate-100 font-bold">
                <TableCell colSpan={3} className="text-right">
                  TOTAL
                </TableCell>
                <TableCell className="text-center border-l">
                  {totals.dok1}
                </TableCell>
                <TableCell className="text-center border-l">
                  {totals.dok2}
                </TableCell>
                <TableCell className="text-center border-l">
                  {totals.dok3}
                </TableCell>
                <TableCell className="text-center border-l">
                  {totals.dok4}
                </TableCell>
                <TableCell className="text-center border-l">
                  {totals.total}
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
  const [state, formAction] = useFormState(generateTos, {
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
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
              <Label htmlFor="weeksCovered" className="font-semibold">
                Weeks Covered
              </Label>
              <Input
                id="weeksCovered"
                name="weeksCovered"
                placeholder="e.g., 1-6"
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
