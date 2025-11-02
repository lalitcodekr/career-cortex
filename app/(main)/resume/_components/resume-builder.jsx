// app/resume/_components/resume-builder.js

"use client";

import { useState, useEffect, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Download,
  Edit,
  Loader2,
  Monitor,
  Save,
} from "lucide-react";
import { toast } from "sonner"; // Make sure toast is imported
import MDEditor from "@uiw/react-md-editor";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { saveResume } from "@/actions/resume";
import EntryForm from "./entry-form";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/nextjs";
import { entriesToMarkdown, markdownToFormData } from "@/app/lib/helper";
import { resumeSchema } from "@/app/lib/schema";

export default function ResumeBuilder({ initialContent }) {
  const [activeTab, setActiveTab] = useState("edit");
  const [previewContent, setPreviewContent] = useState(initialContent);
  const { user } = useUser();
  const [resumeMode, setResumeMode] = useState("preview");
  const prevTabRef = useRef("edit");

  const {
    control,
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(resumeSchema),
    defaultValues: {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    },
  });

  const {
    loading: isSaving,
    fn: saveResumeFn,
    data: saveResult,
    error: saveError,
  } = useFetch(saveResume);

  // Watch form fields for preview updates
  const formValues = watch();

  // Populate form when initialContent exists
  useEffect(() => {
    if (initialContent) {
      const formData = markdownToFormData(initialContent);
      reset(formData);
      setPreviewContent(initialContent);
      prevTabRef.current = activeTab;
      // Optionally start on preview tab, but let user choose
      // setActiveTab("preview");
    }
  }, [initialContent, reset]);

  // Re-sync form when switching from preview/markdown tab back to edit tab
  // This ensures any markdown edits are reflected in the form
  useEffect(() => {
    // Only sync when switching FROM preview tab TO edit tab
    if (
      prevTabRef.current === "preview" &&
      activeTab === "edit" &&
      previewContent
    ) {
      try {
        const formData = markdownToFormData(previewContent);
        reset(formData);
      } catch (error) {
        console.error("Error parsing markdown to form data:", error);
      }
    }
    // Update previous tab reference
    prevTabRef.current = activeTab;
  }, [activeTab, previewContent, reset]);

  // Fix list items in MDEditor preview after content updates
  useEffect(() => {
    if (activeTab === "preview" && resumeMode === "preview") {
      const fixListItems = () => {
        const markdownElement = document.querySelector(".wmde-markdown");
        if (markdownElement) {
          // First, convert paragraphs with bullet characters into proper lists
          const paragraphs = Array.from(markdownElement.querySelectorAll("p"));
          const processed = new Set();

          paragraphs.forEach((p) => {
            if (processed.has(p)) return;

            // Skip if this paragraph is inside a date div (right-aligned)
            if (
              p.closest('div[align="right"]') ||
              p.closest('div[style*="text-align: right"]')
            ) {
              return;
            }

            const text = p.textContent.trim();
            // Check if paragraph contains bullet characters (•, *, -)
            // But not if it's just a date range format (e.g., "Apr 2021 - Apr 2023")
            if (
              /[•\-\*]\s/.test(text) &&
              !/^\w{3}\s\d{4}\s*-\s*(Present|\w{3}\s\d{4})$/.test(text)
            ) {
              // Split by bullet characters
              const parts = text
                .split(/(?=[•\-\*]\s)/)
                .filter((part) => part.trim());

              if (parts.length > 1 || /^[•\-\*]\s/.test(text)) {
                // This is a paragraph that should be a list
                const parent = p.parentNode;
                const ul = document.createElement("ul");
                ul.style.setProperty("display", "block", "important");
                ul.style.setProperty("padding-left", "2em", "important");
                ul.style.setProperty("margin-bottom", "16px", "important");

                parts.forEach((part) => {
                  const cleanedText = part.replace(/^[•\-\*]\s*/, "").trim();
                  if (cleanedText) {
                    const li = document.createElement("li");
                    li.textContent = cleanedText;
                    li.style.setProperty("display", "list-item", "important");
                    li.style.setProperty("margin-bottom", "12px", "important");
                    li.style.setProperty("white-space", "normal", "important");
                    li.style.setProperty("line-height", "1.6", "important");
                    ul.appendChild(li);
                  }
                });

                if (ul.children.length > 0) {
                  parent.insertBefore(ul, p);
                  p.remove();
                  processed.add(p);
                }
              } else {
                // Single bullet point - check if it should be converted
                if (/^[•\-\*]\s/.test(text)) {
                  const parent = p.parentNode;
                  const ul = document.createElement("ul");
                  ul.style.setProperty("display", "block", "important");
                  ul.style.setProperty("padding-left", "2em", "important");
                  ul.style.setProperty("margin-bottom", "16px", "important");

                  const cleanedText = text.replace(/^[•\-\*]\s*/, "").trim();
                  const li = document.createElement("li");
                  li.textContent = cleanedText;
                  li.style.setProperty("display", "list-item", "important");
                  li.style.setProperty("margin-bottom", "12px", "important");
                  ul.appendChild(li);

                  parent.insertBefore(ul, p);
                  p.remove();
                  processed.add(p);
                }
              }
            }
          });

          // Fix all existing list items
          const listItems = markdownElement.querySelectorAll("li");
          listItems.forEach((li) => {
            li.style.setProperty("display", "list-item", "important");
            li.style.setProperty("margin-bottom", "12px", "important");
            li.style.setProperty("margin-top", "0", "important");
            li.style.setProperty("white-space", "normal", "important");
            li.style.setProperty("line-height", "1.6", "important");
            li.style.setProperty("clear", "both", "important");
          });

          // Fix all unordered lists
          const lists = markdownElement.querySelectorAll("ul");
          lists.forEach((ul) => {
            ul.style.setProperty("display", "block", "important");
            ul.style.setProperty("padding-left", "2em", "important");
            ul.style.setProperty("margin-bottom", "16px", "important");
          });
        }
      };

      // Initial fix
      const timer = setTimeout(fixListItems, 100);

      // Use MutationObserver to fix when MDEditor re-renders
      const observer = new MutationObserver(() => {
        fixListItems();
      });

      const markdownContainer = document.querySelector(".wmde-markdown");
      if (markdownContainer) {
        observer.observe(markdownContainer, {
          childList: true,
          subtree: true,
          attributes: false,
        });
      }

      return () => {
        clearTimeout(timer);
        observer.disconnect();
      };
    }
  }, [previewContent, activeTab, resumeMode]);

  // Update preview content when form values change
  useEffect(() => {
    if (activeTab === "edit") {
      const newContent = getCombinedContent();
      setPreviewContent(newContent ? newContent : initialContent);
    }
  }, [formValues, activeTab]);

  // Handle save result
  useEffect(() => {
    if (saveResult && !isSaving) {
      toast.success("Resume saved successfully!");
    }
    if (saveError) {
      toast.error(saveError.message || "Failed to save resume");
    }
  }, [saveResult, saveError, isSaving]);

  const getContactMarkdown = () => {
    const { contactInfo } = formValues;
    const parts = [];
    if (contactInfo?.email) parts.push(`📧 ${contactInfo.email}`);
    if (contactInfo?.mobile) parts.push(`📱 ${contactInfo.mobile}`);
    if (contactInfo?.linkedin)
      parts.push(`💼 [LinkedIn](${contactInfo.linkedin})`);
    if (contactInfo?.twitter)
      parts.push(`🐦 [Twitter](${contactInfo.twitter})`);

    const userName = user?.fullName || user?.firstName || "Your Name";

    return parts.length > 0
      ? `## <div align="center">${userName}</div>
        \n\n<div align="center">\n\n${parts.join(" | ")}\n\n</div>`
      : "";
  };

  const getCombinedContent = () => {
    const { summary, skills, experience, education, projects } = formValues;
    return [
      getContactMarkdown(),
      summary && `## Professional Summary\n\n${summary}`,
      skills && `## Skills\n\n${skills}`,
      entriesToMarkdown(experience, "Work Experience"),
      entriesToMarkdown(education, "Education"),
      entriesToMarkdown(projects, "Projects"),
    ]
      .filter(Boolean)
      .join("\n\n");
  };

  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("resume-pdf");
      if (!element) {
        toast.error("Preview element not found. Cannot generate PDF.");
        return;
      }

      // Clone the element to avoid modifying the original
      const clonedElement = element.cloneNode(true);

      // First, convert date paragraphs to right-aligned divs (must be done before bullet conversion)
      const allParagraphs = Array.from(clonedElement.querySelectorAll("p"));
      allParagraphs.forEach((p) => {
        const text = p.textContent.trim();
        // Check if this looks like a date range (format: "MMM yyyy - MMM yyyy" or "MMM yyyy - Present")
        if (
          /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}\s*-\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$|^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}\s*-\s*Present$/i.test(
            text
          )
        ) {
          const parent = p.parentNode;
          const dateDiv = document.createElement("div");
          dateDiv.setAttribute("align", "right");
          dateDiv.style.textAlign = "right";
          dateDiv.style.margin = "0 0 8px 0";
          dateDiv.style.padding = "0";
          dateDiv.style.listStyle = "none";
          dateDiv.style.display = "block";

          const em = document.createElement("em");
          em.textContent = text;
          dateDiv.appendChild(em);

          parent.insertBefore(dateDiv, p);
          p.remove();
        }
      });

      // Convert paragraphs with bullet characters into proper lists
      const paragraphs = Array.from(clonedElement.querySelectorAll("p"));
      const processed = new Set();

      paragraphs.forEach((p) => {
        if (processed.has(p)) return;

        // Skip if this paragraph is inside a date div (right-aligned)
        if (
          p.closest('div[align="right"]') ||
          p.closest('div[style*="text-align: right"]')
        ) {
          return;
        }

        const text = p.textContent.trim();
        // Check if paragraph contains bullet characters (•, *, -)
        // But not if it's just a date range format
        if (
          /[•\-\*]\s/.test(text) &&
          !/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}\s*-\s*(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}$|^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s\d{4}\s*-\s*Present$/i.test(
            text
          )
        ) {
          // Split by bullet characters
          const parts = text
            .split(/(?=[•\-\*]\s)/)
            .filter((part) => part.trim());

          if (parts.length > 1 || /^[•\-\*]\s/.test(text)) {
            const parent = p.parentNode;
            const ul = document.createElement("ul");
            ul.style.display = "block";
            ul.style.paddingLeft = "2em";
            ul.style.marginBottom = "16px";
            ul.style.listStyleType = "disc";

            parts.forEach((part) => {
              const cleanedText = part.replace(/^[•\-\*]\s*/, "").trim();
              if (cleanedText) {
                const li = document.createElement("li");
                li.textContent = cleanedText;
                li.style.display = "list-item";
                li.style.marginBottom = "4px";
                li.style.paddingBottom = "2px";
                li.style.whiteSpace = "normal";
                li.style.lineHeight = "1.6";
                ul.appendChild(li);
              }
            });

            if (ul.children.length > 0) {
              parent.insertBefore(ul, p);
              p.remove();
              processed.add(p);
            }
          }
        }
      });

      // Fix all existing list items
      const listItems = clonedElement.querySelectorAll("li");
      listItems.forEach((li) => {
        li.style.display = "list-item";
        li.style.marginBottom = "4px";
        li.style.marginTop = "0";
        li.style.paddingLeft = "0.5em";
        li.style.paddingBottom = "2px";
        li.style.listStyleType = "disc";
        li.style.listStylePosition = "outside";
        li.style.whiteSpace = "normal";
        li.style.lineHeight = "1.6";
        // Ensure any paragraphs inside list items don't break the layout
        const paragraphs = li.querySelectorAll("p");
        paragraphs.forEach((p) => {
          p.style.display = "inline";
          p.style.margin = "0";
          p.style.padding = "0";
        });
        // Handle any inline elements that might be breaking the flow
        const inlineElements = li.querySelectorAll("span, strong, em");
        inlineElements.forEach((el) => {
          el.style.display = "inline";
        });
      });

      // Ensure ul elements are block-level
      const lists = clonedElement.querySelectorAll("ul");
      lists.forEach((ul) => {
        ul.style.display = "block";
        ul.style.paddingLeft = "2em";
        ul.style.marginBottom = "16px";
        ul.style.listStyleType = "disc";
      });

      const htmlContent = clonedElement.innerHTML;

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ htmlContent }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "PDF generation failed on the server");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "resume.pdf";
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);

      // --- ADDED THIS LINE ---
      toast.success("PDF downloaded successfully!");
      // -------------------------
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(error.message || "Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      const formattedContent = previewContent
        .replace(/\n/g, "\n") // Normalize newlines
        .replace(/\n\s*\n/g, "\n\n") // Normalize multiple newlines to double newlines
        .trim();

      console.log(previewContent, formattedContent);
      await saveResumeFn(previewContent);
    } catch (error) {
      console.error("Save error:", error);
    }
  };

  return (
    <div data-color-mode="light" className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-metallic animate-metallic leading-normal">
          Resume Builder
        </h1>
        <div className="space-x-2">
          <Button
            variant="destructive"
            onClick={handleSubmit(onSubmit)}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>
          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="edit">Form</TabsTrigger>
          <TabsTrigger value="preview">Markdown</TabsTrigger>
        </TabsList>

        <TabsContent value="edit">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 border rounded-lg bg-muted/50">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    {...register("contactInfo.email")}
                    type="email"
                    placeholder="your@email.com"
                    error={errors.contactInfo?.email}
                  />
                  {errors.contactInfo?.email && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.email.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile Number</label>
                  <Input
                    {...register("contactInfo.mobile")}
                    type="tel"
                    placeholder="+1 234 567 8900"
                  />
                  {errors.contactInfo?.mobile && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.mobile.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">LinkedIn URL</label>
                  <Input
                    {...register("contactInfo.linkedin")}
                    type="url"
                    placeholder="https://linkedin.com/in/your-profile"
                  />
                  {errors.contactInfo?.linkedin && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.linkedin.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    Twitter/X Profile
                  </label>
                  <Input
                    {...register("contactInfo.twitter")}
                    type="url"
                    placeholder="https://twitter.com/your-handle"
                  />
                  {errors.contactInfo?.twitter && (
                    <p className="text-sm text-red-500">
                      {errors.contactInfo.twitter.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Professional Summary</h3>
              <Controller
                name="summary"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="Write a compelling professional summary..."
                    error={errors.summary}
                  />
                )}
              />
              {errors.summary && (
                <p className="text-sm text-red-500">{errors.summary.message}</p>
              )}
            </div>

            {/* Skills */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Skills</h3>
              <Controller
                name="skills"
                control={control}
                render={({ field }) => (
                  <Textarea
                    {...field}
                    className="h-32"
                    placeholder="List your key skills..."
                    error={errors.skills}
                  />
                )}
              />
              {errors.skills && (
                <p className="text-sm text-red-500">{errors.skills.message}</p>
              )}
            </div>

            {/* Experience */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Work Experience</h3>
              <Controller
                name="experience"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Experience"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.experience && (
                <p className="text-sm text-red-500">
                  {errors.experience.message}
                </p>
              )}
            </div>

            {/* Education */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Education</h3>
              <Controller
                name="education"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Education"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.education && (
                <p className="text-sm text-red-500">
                  {errors.education.message}
                </p>
              )}
            </div>

            {/* Projects */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Projects</h3>
              <Controller
                name="projects"
                control={control}
                render={({ field }) => (
                  <EntryForm
                    type="Project"
                    entries={field.value}
                    onChange={field.onChange}
                  />
                )}
              />
              {errors.projects && (
                <p className="text-sm text-red-500">
                  {errors.projects.message}
                </p>
              )}
            </div>
          </form>
        </TabsContent>

        <TabsContent value="preview">
          {activeTab === "preview" && (
            <Button
              variant="link"
              type="button"
              className="mb-2"
              onClick={() =>
                setResumeMode(resumeMode === "preview" ? "edit" : "preview")
              }
            >
              {resumeMode === "preview" ? (
                <>
                  <Edit className="h-4 w-4" />
                  Edit Resume
                </>
              ) : (
                <>
                  <Monitor className="h-4 w-4" />
                  Show Preview
                </>
              )}
            </Button>
          )}

          {activeTab === "preview" && resumeMode !== "preview" && (
            <div className="flex p-3 gap-2 items-center border-2 border-yellow-600 text-yellow-600 rounded mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="text-sm">
                You will lose editied markdown if you update the form data.
              </span>
            </div>
          )}
          <div className="border rounded-lg">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={resumeMode}
            />
          </div>
          <div className="hidden">
            <div id="resume-pdf">
              <MDEditor.Markdown
                source={previewContent}
                style={{
                  background: "white",
                  color: "black",
                }}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
