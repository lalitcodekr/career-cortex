"use server";

import { db } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { revalidatePath } from "next/cache";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro-latest" });

export async function saveResume(content) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  try {
    const resume = await db.resume.upsert({
      where: { userId: user.id },
      update: { content },
      create: { userId: user.id, content },
    });
    revalidatePath("/resume");
    return resume;
  } catch (error) {
    console.error("Error saving resume:", error.message);
    throw new Error("Failed to save resume");
  }
}

export async function getResume() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  return await db.resume.findUnique({
    where: { userId: user.id },
  });
}

export async function improveWithAI({ current, type, title, organization }) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({
    where: { clerkUserId: userId },
  });

  if (!user) throw new Error("User not found");

  const contextInfo = [];
  if (title) contextInfo.push(`Title/Position: ${title}`);
  if (organization) contextInfo.push(`Organization/Company: ${organization}`);
  const contextString = contextInfo.length > 0 
    ? `\n\nContext:\n${contextInfo.join('\n')}\n`
    : '';

  const prompt = `
    As an expert resume writer, improve the following ${type} description for a ${user.industry || 'professional'} professional.
    Make it more impactful, quantifiable, and aligned with industry standards.${contextString}
    
    Current description: "${current}"

    Requirements:
    1. Use strong action verbs (e.g., "Developed", "Led", "Optimized", "Implemented")
    2. Include specific metrics, numbers, and results where applicable
    3. Highlight relevant technical skills and tools
    4. Keep it concise but detailed (2-4 bullet points or 2-3 sentences)
    5. Focus on achievements and impact over responsibilities
    6. Use industry-specific keywords and terminology
    7. Make it professional and polished
    
    IMPORTANT: Return ONLY the improved description text. Do not include:
    - Any introductory text
    - Comments or explanations
    - Markdown formatting
    - Quotes around the text
    - Prefixes like "Improved:" or "Here is:"
    
    Just return the clean, improved description text.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    
    if (!response || !response.text) {
      throw new Error("Invalid response from AI model");
    }
    
    let improvedContent = response.text().trim();
    
    // Clean up common AI response patterns
    improvedContent = improvedContent
      .replace(/^Improved:\s*/i, '')
      .replace(/^Here (is|are).*?:\s*/i, '')
      .replace(/^The improved.*?:\s*/i, '')
      .replace(/^"|"$/g, '') // Remove quotes if wrapped
      .replace(/^'|'$/g, '') // Remove single quotes
      .replace(/```[\s\S]*?```/g, '') // Remove code blocks
      .replace(/^\*\s*/gm, '') // Remove markdown bullet points
      .replace(/\n{2,}/g, '\n') // Replace multiple newlines with single
      .trim();

    if (!improvedContent) {
      throw new Error("AI returned empty content");
    }

    return improvedContent;
  } catch (error) {
    console.error("Error generating improved resume content:", error);
    throw new Error("Failed to improve resume content");
  }
}
