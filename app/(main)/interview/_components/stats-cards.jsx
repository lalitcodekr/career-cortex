"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// I'm assuming you are using lucide-react for icons based on your screenshot
import { Trophy, BarChart, HelpCircle } from "lucide-react";

/**
 * Renders the 3 stat cards: Average Score, Questions Practiced, and Latest Score.
 * Assumes it receives an array of 'assessments' objects.
 * Each assessment object should have at least 'quizScore', 'createdAt', and 'questions' array.
 *
 * NOTE: "Questions Practiced" is automatically calculated from the sum of all questions
 * across all assessments. You can optionally pass 'totalQuestions' prop to override.
 */
export default function StatsCards({ assessments, totalQuestions }) {
  // 1. Logic for Average Score
  const averageScore = useMemo(() => {
    if (!assessments || assessments.length === 0) {
      return 0;
    }
    const sum = assessments.reduce((acc, curr) => acc + curr.quizScore, 0);
    return sum / assessments.length;
  }, [assessments]);

  // 2. Calculate total questions from all assessments
  const calculatedTotalQuestions = useMemo(() => {
    if (!assessments || assessments.length === 0) {
      return 0;
    }
    // Sum up the length of questions array from each assessment
    return assessments.reduce((total, assessment) => {
      const questionCount = Array.isArray(assessment.questions)
        ? assessment.questions.length
        : 0;
      return total + questionCount;
    }, 0);
  }, [assessments]);

  // 3. Logic for Latest Score (as discussed)
  const latestAssessment = useMemo(() => {
    if (!assessments || assessments.length === 0) {
      return null; // Return null if no assessments
    }
    // Sort by createdAt date, newest first
    const sorted = [...assessments].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    return sorted[0]; // Newest is the first item
  }, [assessments]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Card 1: Average Score */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Average Score</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{averageScore.toFixed(1)}%</div>
          <p className="text-xs text-muted-foreground">
            Across {assessments?.length || 0} assessments
          </p>
        </CardContent>
      </Card>

      {/* Card 2: Questions Practiced */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Questions Practiced
          </CardTitle>
          <HelpCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {totalQuestions ?? calculatedTotalQuestions}
          </div>
          <p className="text-xs text-muted-foreground">Total questions</p>
        </CardContent>
      </Card>

      {/* Card 3: Latest Score (This is the one with the fix) */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Latest Score</CardTitle>
          <Trophy className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {/* HERE IS THE FIX:
              We use 'latestAssessment' from useMemo,
              and add '?.' before 'toFixed' to prevent the error
              if 'latestAssessment' or 'quizScore' is undefined.
            */}
            {latestAssessment?.quizScore?.toFixed(1) || 0}%
          </div>
          <p className="text-xs text-muted-foreground">Most recent quiz</p>
        </CardContent>
      </Card>
    </div>
  );
}
