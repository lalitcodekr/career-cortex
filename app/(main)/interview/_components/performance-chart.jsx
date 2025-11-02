"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";

export default function PerformanceChart({ assessments }) {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (assessments && assessments.length > 0) {
      const sortedAssessments = [...assessments].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );

      const formattedData = sortedAssessments.map((assessment, index) => ({
        name: `Quiz ${index + 1}`,
        date: format(new Date(assessment.createdAt), "MMM dd"),
        score: assessment.quizScore,
      }));
      setChartData(formattedData);
    }
  }, [assessments]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-metallic animate-metallic text-3xl md:text-4xl">
          Performance Trend
        </CardTitle>
        <CardDescription>Your quiz scores over time</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />

              <XAxis
                dataKey="name"
                tickFormatter={(value, index) => chartData[index]?.date || ""}
                interval="preserveStartEnd"
              />

              <YAxis domain={[0, 100]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload?.length) {
                    return (
                      <div className="bg-background border rounded-lg p-2 shadow-md">
                        <p className="text-sm font-medium">
                          {/* CHANGED: Added toFixed here too for consistency */}
                          Score: {Number(payload[0].value).toFixed(1)}%
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {payload[0].payload.date}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                // --- CHANGED: Hardcoded stroke color ---
                // Using a default recharts color, but "#FFFFFF" (white) also works
                stroke="#FFFFFF"
                strokeWidth={2}
                // Optional: Adds dots at the data points
                dot={{ r: 4, fill: "#FFFFFF" }}
              >
                <LabelList
                  dataKey="score"
                  position="top"
                  // --- CHANGED: Added toFixed(1) to round the number ---
                  formatter={(value) => `${value.toFixed(1)}%`}
                  style={{ fill: "hsl(var(--foreground))", fontSize: "12px" }}
                />
              </Line>
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
