// src/components/dashboard/LessonPlanDisplay.tsx

import { ExportButton } from "./ExportButton";

// Define types for the data we expect
type PlanInputs = {
  subject: string;
  grade: string;
  week: string;
  duration: string;
  strand: string;
  subStrand: string;
  topic: string;
};

type AIContent = {
  contentStandard: string;
  learningOutcome: string;
  learningIndicator: string;
  essentialQuestions: string[];
  pedagogicalStrategies: string[];
  teachingAndLearningResources: string[];
  differentiationNotes: string[];
  starterActivity: { teacher: string; learner: string };
  introductoryActivity: { teacher: string; learner: string };
  mainActivity1: { teacher: string; learner: string };
  mainActivity2: { teacher: string; learner: string };
  lessonConclusion: { teacher: string; learner: string };
};

type LessonPlanDisplayProps = {
  planData: {
    inputs: PlanInputs;
    aiContent: AIContent;
  };
};

export const LessonPlanDisplay = ({ planData }: LessonPlanDisplayProps) => {
  const { inputs, aiContent } = planData;

  const renderList = (items: string[]) => (
    <ul className="list-disc pl-4 space-y-1 text-sm">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );

  return (
    <div className="bg-white shadow-lg rounded-lg border overflow-hidden">
      <div className="p-6">
        <h2 className="text-center font-bold text-2xl mb-6 text-brand-blue">
          Learning Plan
        </h2>

        {/* Table Layout */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <tbody>
              {/* Header Row */}
              <tr className="bg-gray-100">
                <td className="border border-gray-300 p-3 font-semibold w-1/6">
                  Subject
                </td>
                <td className="border border-gray-300 p-3">{inputs.subject}</td>
                <td className="border border-gray-300 p-3 font-semibold w-1/6">
                  Week
                </td>
                <td className="border border-gray-300 p-3">{inputs.week}</td>
                <td className="border border-gray-300 p-3 font-semibold w-1/6">
                  Duration
                </td>
                <td className="border border-gray-300 p-3">
                  {inputs.duration} mins
                </td>
                <td className="border border-gray-300 p-3 font-semibold w-1/6">
                  Form
                </td>
                <td className="border border-gray-300 p-3">{inputs.grade}</td>
              </tr>

              {/* Strand Row */}
              <tr>
                <td className="border border-gray-300 p-3 font-semibold bg-gray-50">
                  Strand
                </td>
                <td className="border border-gray-300 p-3" colSpan={3}>
                  {inputs.strand}
                </td>
                <td className="border border-gray-300 p-3 font-semibold bg-gray-50">
                  Sub-Strand
                </td>
                <td className="border border-gray-300 p-3" colSpan={3}>
                  {inputs.subStrand}
                </td>
              </tr>

              {/* Content Standard Row */}
              <tr>
                <td className="border border-gray-300 p-3 font-semibold bg-gray-50">
                  Content Standard
                </td>
                <td className="border border-gray-300 p-3" colSpan={7}>
                  {aiContent.contentStandard || inputs.topic}
                </td>
              </tr>

              {/* Learning Outcome Row */}
              <tr>
                <td className="border border-gray-300 p-3 font-semibold bg-gray-50">
                  Learning Outcome(s)
                </td>
                <td className="border border-gray-300 p-3" colSpan={7}>
                  {renderList([aiContent.learningOutcome])}
                </td>
              </tr>

              {/* Learning Indicator Row */}
              <tr>
                <td className="border border-gray-300 p-3 font-semibold bg-gray-50">
                  Learning Indicator(s)
                </td>
                <td className="border border-gray-300 p-3" colSpan={7}>
                  {renderList([aiContent.learningIndicator])}
                </td>
              </tr>

              {/* Essential Questions Row */}
              <tr>
                <td className="border border-gray-300 p-3 font-semibold bg-gray-50">
                  Essential Question(s)
                </td>
                <td className="border border-gray-300 p-3" colSpan={7}>
                  {renderList(aiContent.essentialQuestions)}
                </td>
              </tr>

              {/* Pedagogical Strategies Row */}
              <tr>
                <td className="border border-gray-300 p-3 font-semibold bg-gray-50">
                  Pedagogical Strategies
                </td>
                <td className="border border-gray-300 p-3" colSpan={7}>
                  {aiContent.pedagogicalStrategies.join(", ")}
                </td>
              </tr>

              {/* Teaching & Learning Resources Row */}
              <tr>
                <td className="border border-gray-300 p-3 font-semibold bg-gray-50">
                  Teaching & Learning Resources
                </td>
                <td className="border border-gray-300 p-3" colSpan={7}>
                  {renderList(aiContent.teachingAndLearningResources)}
                </td>
              </tr>

              {/* Key Notes on Differentiation Row */}
              <tr>
                <td className="border border-gray-300 p-3 font-semibold bg-blue-50">
                  Key Notes on Differentiation
                </td>
                <td
                  className="border border-gray-300 p-3 bg-blue-50"
                  colSpan={7}
                >
                  {aiContent.differentiationNotes.join(". ")}
                </td>
              </tr>
              {/* Activities Header */}
              <tr>
                <td
                  className="border border-gray-300 p-3 font-semibold bg-brand-blue text-white text-center"
                  colSpan={2}
                >
                  Teacher Activity
                </td>
                <td
                  className="border border-gray-300 p-3 font-semibold bg-brand-blue text-white text-center"
                  colSpan={6}
                >
                  Learner Activity
                </td>
              </tr>

              {/* Starter Activity */}
              <tr>
                <td className="border border-gray-300 p-3" colSpan={2}>
                  <div className="font-medium text-brand-orange mb-2">
                    Starter Activity
                  </div>
                  {aiContent.starterActivity.teacher}
                </td>
                <td className="border border-gray-300 p-3" colSpan={6}>
                  {aiContent.starterActivity.learner}
                </td>
              </tr>

              {/* Introductory Activity */}
              <tr>
                <td className="border border-gray-300 p-3" colSpan={2}>
                  <div className="font-medium text-brand-orange mb-2">
                    Introductory Activity
                  </div>
                  {aiContent.introductoryActivity.teacher}
                </td>
                <td className="border border-gray-300 p-3" colSpan={6}>
                  {aiContent.introductoryActivity.learner}
                </td>
              </tr>

              {/* Main Activity 1 */}
              <tr>
                <td className="border border-gray-300 p-3" colSpan={2}>
                  <div className="font-medium text-brand-orange mb-2">
                    Main Activity 1
                  </div>
                  {aiContent.mainActivity1.teacher}
                </td>
                <td className="border border-gray-300 p-3" colSpan={6}>
                  {aiContent.mainActivity1.learner}
                </td>
              </tr>

              {/* Main Activity 2 */}
              <tr>
                <td className="border border-gray-300 p-3" colSpan={2}>
                  <div className="font-medium text-brand-orange mb-2">
                    Main Activity 2
                  </div>
                  {aiContent.mainActivity2.teacher}
                </td>
                <td className="border border-gray-300 p-3" colSpan={6}>
                  {aiContent.mainActivity2.learner}
                </td>
              </tr>

              {/* Lesson Conclusion */}
              <tr>
                <td
                  className="border border-gray-300 p-3 bg-green-50"
                  colSpan={2}
                >
                  <div className="font-medium text-green-800 mb-2">
                    Lesson Conclusion
                  </div>
                  {aiContent.lessonConclusion.teacher}
                </td>
                <td
                  className="border border-gray-300 p-3 bg-green-50"
                  colSpan={6}
                >
                  {aiContent.lessonConclusion.learner}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Export Button */}
        <div className="mt-6 flex justify-center">
          <ExportButton planData={planData} />
        </div>
      </div>
    </div>
  );
};
