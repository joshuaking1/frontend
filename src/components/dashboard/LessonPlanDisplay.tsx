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
    <ul className="list-disc pl-4 sm:pl-5 space-y-1 text-sm sm:text-base">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );

  const renderOrderedList = (items: string[]) => (
    <ol className="list-decimal pl-4 sm:pl-5 space-y-1 text-sm sm:text-base">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ol>
  );

  return (
    <div className="bg-white shadow-lg rounded-lg border overflow-hidden">
      <div className="p-4 sm:p-6">
        <h2 className="text-center font-bold text-lg sm:text-xl lg:text-2xl mb-4 sm:mb-6 text-brand-blue">
          Learning Plan
        </h2>

        {/* Mobile-First Card Layout */}
        <div className="space-y-4 sm:space-y-6">
          {/* Basic Information Section */}
          <div className="bg-slate-50 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-brand-blue mb-3 text-sm sm:text-base">
              Basic Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
              <div>
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Subject:
                </span>
                <p className="text-sm sm:text-base font-medium">
                  {inputs.subject}
                </p>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Form:
                </span>
                <p className="text-sm sm:text-base font-medium">
                  {inputs.grade}
                </p>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Week:
                </span>
                <p className="text-sm sm:text-base font-medium">
                  {inputs.week}
                </p>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Duration:
                </span>
                <p className="text-sm sm:text-base font-medium">
                  {inputs.duration} mins
                </p>
              </div>
            </div>
          </div>

          {/* Curriculum Structure */}
          <div className="border rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-brand-blue mb-3 text-sm sm:text-base">
              Curriculum Structure
            </h3>
            <div className="space-y-2 sm:space-y-3">
              <div>
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Strand:
                </span>
                <p className="text-sm sm:text-base">{inputs.strand}</p>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-slate-600">
                  Sub-Strand:
                </span>
                <p className="text-sm sm:text-base">{inputs.subStrand}</p>
              </div>
            </div>
          </div>

          {/* Learning Objectives */}
          <div className="border rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-brand-blue mb-3 text-sm sm:text-base">
              Learning Objectives
            </h3>
            <div className="space-y-3 sm:space-y-4">
              <div>
                <span className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">
                  Content Standard:
                </span>
                <p className="text-sm sm:text-base leading-relaxed">
                  {aiContent.contentStandard || inputs.topic}
                </p>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">
                  Learning Outcome(s):
                </span>
                <p className="text-sm sm:text-base leading-relaxed">
                  {aiContent.learningOutcome}
                </p>
              </div>
              <div>
                <span className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">
                  Learning Indicator(s):
                </span>
                <p className="text-sm sm:text-base leading-relaxed">
                  {aiContent.learningIndicator}
                </p>
              </div>
            </div>
          </div>

          {/* Essential Questions */}
          <div className="border rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-brand-blue mb-3 text-sm sm:text-base">
              Essential Questions
            </h3>
            {renderOrderedList(aiContent.essentialQuestions)}
          </div>

          {/* Teaching Strategies & Resources */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="border rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-brand-blue mb-3 text-sm sm:text-base">
                Pedagogical Strategies
              </h3>
              <p className="text-sm sm:text-base leading-relaxed">
                {aiContent.pedagogicalStrategies.join(", ")}
              </p>
            </div>
            <div className="border rounded-lg p-3 sm:p-4">
              <h3 className="font-semibold text-brand-blue mb-3 text-sm sm:text-base">
                Teaching & Learning Resources
              </h3>
              {renderList(aiContent.teachingAndLearningResources)}
            </div>
          </div>

          {/* Differentiation Notes */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
            <h3 className="font-semibold text-blue-800 mb-3 text-sm sm:text-base">
              Key Notes on Differentiation
            </h3>
            {renderList(aiContent.differentiationNotes)}
          </div>

          {/* Lesson Activities */}
          <div className="border rounded-lg overflow-hidden">
            <div className="bg-brand-blue text-white p-3 sm:p-4">
              <h3 className="font-semibold text-center text-sm sm:text-base">
                Lesson Activities
              </h3>
            </div>

            <div className="divide-y">
              {/* Starter Activity */}
              <div className="p-3 sm:p-4">
                <h4 className="font-semibold text-brand-orange mb-3 text-sm sm:text-base">
                  Starter Activity (10 minutes)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">
                      Teacher Activity:
                    </span>
                    <p className="text-sm sm:text-base leading-relaxed bg-slate-50 p-2 sm:p-3 rounded">
                      {aiContent.starterActivity.teacher}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">
                      Learner Activity:
                    </span>
                    <p className="text-sm sm:text-base leading-relaxed bg-blue-50 p-2 sm:p-3 rounded">
                      {aiContent.starterActivity.learner}
                    </p>
                  </div>
                </div>
              </div>

              {/* Introductory Activity */}
              <div className="p-3 sm:p-4">
                <h4 className="font-semibold text-brand-orange mb-3 text-sm sm:text-base">
                  Introductory Activity (15 minutes)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">
                      Teacher Activity:
                    </span>
                    <p className="text-sm sm:text-base leading-relaxed bg-slate-50 p-2 sm:p-3 rounded">
                      {aiContent.introductoryActivity.teacher}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">
                      Learner Activity:
                    </span>
                    <p className="text-sm sm:text-base leading-relaxed bg-blue-50 p-2 sm:p-3 rounded">
                      {aiContent.introductoryActivity.learner}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Activity 1 */}
              <div className="p-3 sm:p-4">
                <h4 className="font-semibold text-brand-orange mb-3 text-sm sm:text-base">
                  Main Activity 1 (40 minutes)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">
                      Teacher Activity:
                    </span>
                    <p className="text-sm sm:text-base leading-relaxed bg-slate-50 p-2 sm:p-3 rounded">
                      {aiContent.mainActivity1.teacher}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">
                      Learner Activity:
                    </span>
                    <p className="text-sm sm:text-base leading-relaxed bg-blue-50 p-2 sm:p-3 rounded">
                      {aiContent.mainActivity1.learner}
                    </p>
                  </div>
                </div>
              </div>

              {/* Main Activity 2 */}
              <div className="p-3 sm:p-4">
                <h4 className="font-semibold text-brand-orange mb-3 text-sm sm:text-base">
                  Main Activity 2 (40 minutes)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <span className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">
                      Teacher Activity:
                    </span>
                    <p className="text-sm sm:text-base leading-relaxed bg-slate-50 p-2 sm:p-3 rounded">
                      {aiContent.mainActivity2.teacher}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs sm:text-sm font-medium text-slate-600 block mb-1">
                      Learner Activity:
                    </span>
                    <p className="text-sm sm:text-base leading-relaxed bg-blue-50 p-2 sm:p-3 rounded">
                      {aiContent.mainActivity2.learner}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lesson Closure */}
              <div className="p-3 sm:p-4 bg-green-50">
                <h4 className="font-semibold text-green-800 mb-3 text-sm sm:text-base">
                  Lesson Closure (15 minutes)
                </h4>
                <p className="text-sm sm:text-base leading-relaxed">
                  {aiContent.lessonConclusion.teacher}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
