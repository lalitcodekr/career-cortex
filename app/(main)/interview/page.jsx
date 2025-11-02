import { getAssessments } from "@/actions/interview";
import StatsCard from "./_components/stats-cards";
import PerformanceChart from "./_components/performance-chart";
import QuizList from "./_components/quiz-list";

const InterviewPage = async () => {
  const assessments = await getAssessments();
  return (
    <div>
      <div>
        <h1 className="text-5xl md:text-5xl lg:text-6xl font-bold text-metallic animate-metallic leading-normal mb-8 md:my-8 lg:my-12">
          Interview Preparation
        </h1>

        <div className="space-y-6">
          <StatsCard assessments={assessments} />
          <PerformanceChart assessments={assessments} />
          <QuizList assessments={assessments} />
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;
