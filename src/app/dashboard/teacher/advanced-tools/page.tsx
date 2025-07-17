// frontend/src/app/dashboard/teacher/advanced-tools/page.tsx
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RubricGenerator } from "@/components/dashboard/RubricGenerator";
import { TosBuilder } from "@/components/dashboard/TosBuilder";
import { Ruler, ListChecks } from "lucide-react";

export default function AdvancedToolsPage() {
  return (
    <div>
      <h1 className="text-3xl font-bold text-brand-blue mb-2">
        Advanced Assessment Tools
      </h1>
      <p className="text-slate-600 mb-6">
        Leverage AI to create sophisticated, curriculum-aligned evaluation
        instruments.
      </p>

      <Tabs defaultValue="rubric-generator">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rubric-generator">
            <Ruler className="mr-2 h-4 w-4" />
            Rubric Generator
          </TabsTrigger>
          <TabsTrigger value="tos-builder">
            <ListChecks className="mr-2 h-4 w-4" />
            Table of Spec Builder
          </TabsTrigger>
        </TabsList>
        <TabsContent value="rubric-generator">
          <RubricGenerator />
        </TabsContent>
        <TabsContent value="tos-builder">
          {" "}
          <TosBuilder />{" "}
        </TabsContent>
      </Tabs>
    </div>
  );
}
