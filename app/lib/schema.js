import z from "zod";

export const onboardingSchema = z.object({
  industry: z
    .string({
      required_error: "Please select an industry",
    })
    .min(1, "Please select an industry"), // Added min(1) for better empty string validation

  subIndustry: z
    .string({
      required_error: "Please select a specialization",
    })
    .min(1, "Please select a specialization"), // Added min(1) for better empty string validation

  // FIX: Called z.string() as a function before chaining .max()
  bio: z.string().max(500, "Bio must be 500 characters or less").optional(),

  experience: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(
      z
        .number()
        .min(0, "Experience must be at least 0 years")
        .max(50, "Experience must be at most 50 years")
    ),

  skills: z.string().transform((val) =>
    val
      ? val
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean)
      : undefined
  ),
});

export const entrySchema = z.object({
  title: z.string().min(1, "Title is required"),
  organization: z.string().min(1, "Organization is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional(),
  description: z.string().min(1, "Description is required"),
  current: z.boolean().default(false),
});

export const resumeSchema = z.object({
  contactInfo: z.object({
    email: z.string().email("Invalid email address"),
    mobile: z.string().optional(),
    location: z.string().optional(),
    linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
    github: z.string().url("Invalid URL").optional().or(z.literal("")),
  }),
  summary: z.string().optional(),
  skills: z.string().optional(),
  experience: z.array(entrySchema).default([]),
  education: z.array(entrySchema).default([]),
  projects: z.array(entrySchema).default([]),
});

export const coverLetterSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  jobTitle: z.string().min(1, "Job title is required"),
  jobDescription: z.string().optional(),
});
