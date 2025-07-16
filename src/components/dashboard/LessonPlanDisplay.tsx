// src/components/dashboard/LessonPlanDisplay.tsx

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
  lessonClosure: { teacher: string; learner: string };
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
    <ul className="list-disc pl-5 space-y-1">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );

  const renderOrderedList = (items: string[]) => (
    <ol className="list-decimal pl-5 space-y-1">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ol>
  );

  return (
    <div className="bg-white p-4 shadow-lg rounded-lg border">
      <h2 className="text-center font-bold text-xl mb-4">Learning Plan</h2>
      <table className="w-full border-collapse border">
        <tbody>
          <tr className="bg-slate-50">
            <td className="border p-2 font-semibold">Subject</td>
            <td className="border p-2" colSpan={3}>
              {inputs.subject}
            </td>
            <td className="border p-2 font-semibold">Week</td>
            <td className="border p-2">{inputs.week}</td>
            <td className="border p-2 font-semibold">Duration</td>
            <td className="border p-2">{inputs.duration}</td>
            <td className="border p-2 font-semibold">Form</td>
            <td className="border p-2">{inputs.grade}</td>
          </tr>
          <tr>
            <td className="border p-2 font-semibold">Strand</td>
            <td className="border p-2" colSpan={3}>
              {inputs.strand}
            </td>
            <td className="border p-2 font-semibold">Sub-Strand</td>
            <td className="border p-2" colSpan={5}>
              {inputs.subStrand}
            </td>
          </tr>
          <tr>
            <td className="border p-2 font-semibold">Content Standard</td>
            <td className="border p-2" colSpan={9}>
              {aiContent.contentStandard || inputs.topic}
            </td>
          </tr>
          <tr>
            <td className="border p-2 font-semibold">Learning Outcome(s)</td>
            <td className="border p-2" colSpan={9}>
              {aiContent.learningOutcome}
            </td>
          </tr>
          <tr>
            <td className="border p-2 font-semibold">Learning Indicator(s)</td>
            <td className="border p-2" colSpan={9}>
              {aiContent.learningIndicator}
            </td>
          </tr>
          <tr>
            <td className="border p-2 font-semibold">Essential Question(s)</td>
            <td className="border p-2" colSpan={9}>
              {renderOrderedList(aiContent.essentialQuestions)}
            </td>
          </tr>
          <tr>
            <td className="border p-2 font-semibold">Pedagogical Strategies</td>
            <td className="border p-2" colSpan={9}>
              {aiContent.pedagogicalStrategies.join(", ")}
            </td>
          </tr>
          <tr>
            <td className="border p-2 font-semibold" rowSpan={2}>
              Teaching & Learning Resources
            </td>
            <td className="border p-2" colSpan={9}>
              {renderList(aiContent.teachingAndLearningResources)}
            </td>
          </tr>
          <tr></tr>
          <tr className="bg-slate-50">
            <td className="border p-2 font-bold text-center" colSpan={10}>
              Key Notes on Differentiation
            </td>
          </tr>
          <tr>
            <td className="border p-2" colSpan={10}>
              {renderList(aiContent.differentiationNotes)}
            </td>
          </tr>
          <tr className="bg-slate-50">
            <td className="border p-2 font-bold text-center" colSpan={5}>
              Teacher Activity
            </td>
            <td className="border p-2 font-bold text-center" colSpan={5}>
              Learner Activity
            </td>
          </tr>
          <tr>
            <td className="border p-2" colSpan={5}>
              <div className="font-semibold">Starter Activity (10 minutes)</div>
              {aiContent.starterActivity.teacher}
            </td>
            <td className="border p-2" colSpan={5}>
              <div className="font-semibold">Starter Activity (10 minutes)</div>
              {aiContent.starterActivity.learner}
            </td>
          </tr>
          <tr>
            <td className="border p-2" colSpan={5}>
              <div className="font-semibold">
                Introductory Activity (15 minutes)
              </div>
              {aiContent.introductoryActivity.teacher}
            </td>
            <td className="border p-2" colSpan={5}>
              <div className="font-semibold">
                Introductory Activity (15 minutes)
              </div>
              {aiContent.introductoryActivity.learner}
            </td>
          </tr>
          <tr>
            <td className="border p-2" colSpan={5}>
              <div className="font-semibold">Main Activity 1 (40 minutes)</div>
              {aiContent.mainActivity1.teacher}
            </td>
            <td className="border p-2" colSpan={5}>
              <div className="font-semibold">Main Activity 1 (40 minutes)</div>
              {aiContent.mainActivity1.learner}
            </td>
          </tr>
          <tr>
            <td className="border p-2" colSpan={5}>
              <div className="font-semibold">Main Activity 2 (40 minutes)</div>
              {aiContent.mainActivity2.teacher}
            </td>
            <td className="border p-2" colSpan={5}>
              <div className="font-semibold">Main Activity 2 (40 minutes)</div>
              {aiContent.mainActivity2.learner}
            </td>
          </tr>
          <tr>
            <td className="border p-2" colSpan={10}>
              <div className="font-semibold">Lesson Closure (15 minutes)</div>
              {aiContent.lessonClosure.teacher}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};
