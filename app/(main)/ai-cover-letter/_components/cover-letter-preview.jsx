"use client";

import { useState, useEffect } from "react";
import MDEditor from "@uiw/react-md-editor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Save, Download, Loader2, Edit, Monitor } from "lucide-react";
import { toast } from "sonner";
import { updateCoverLetter } from "@/actions/cover-letter";
import useFetch from "@/hooks/use-fetch";

const CoverLetterPreview = ({ content: initialContent, coverLetterId, jobTitle, companyName }) => {
  const [previewContent, setPreviewContent] = useState(initialContent || "");
  const [activeTab, setActiveTab] = useState("preview");
  const [coverLetterMode, setCoverLetterMode] = useState("preview");

  // Sync content when initialContent changes
  useEffect(() => {
    if (initialContent) {
      setPreviewContent(initialContent);
    }
  }, [initialContent]);

  const {
    loading: isSaving,
    fn: updateCoverLetterFn,
  } = useFetch(updateCoverLetter);

  const [isGenerating, setIsGenerating] = useState(false);

  const handleSave = async () => {
    if (!coverLetterId) {
      toast.error("Cover letter ID is missing");
      return;
    }

    try {
      // updateCoverLetter expects (id, content) but useFetch passes args as array
      await updateCoverLetterFn(coverLetterId, previewContent);
      toast.success("Cover letter saved successfully!");
    } catch (error) {
      console.error("Save error:", error);
      toast.error(error.message || "Failed to save cover letter");
    }
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    try {
      const element = document.getElementById("cover-letter-pdf");
      if (!element) {
        toast.error("Preview element not found. Cannot generate PDF.");
        return;
      }

      const htmlContent = element.innerHTML;

      const response = await fetch("/api/generate-pdf", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          htmlContent,
          type: "cover-letter", // Add type for cover letter specific styling
          filename: `${jobTitle}_${companyName}_CoverLetter.pdf`.replace(/[^a-z0-9]/gi, '_')
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "PDF generation failed on the server");
      }

      const blob = await response.blob();

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const filename = `${jobTitle || 'CoverLetter'}_${companyName || 'Company'}_CoverLetter.pdf`.replace(/[^a-z0-9]/gi, '_');
      a.download = filename;
      document.body.appendChild(a);
      a.click();

      a.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF downloaded successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      toast.error(error.message || "Failed to generate PDF");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div data-color-mode="light" className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-2">
        <h2 className="text-2xl md:text-3xl font-bold">
          Cover Letter Editor
        </h2>
        <div className="flex space-x-2">
          {coverLetterId && (
            <Button
              variant="default"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </>
              )}
            </Button>
          )}
          <Button onClick={generatePDF} disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Download PDF
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="preview">Markdown Editor</TabsTrigger>
        </TabsList>

        <TabsContent value="preview">
          <Button
            variant="link"
            type="button"
            className="mb-2"
            onClick={() =>
              setCoverLetterMode(coverLetterMode === "preview" ? "edit" : "preview")
            }
          >
            {coverLetterMode === "preview" ? (
              <>
                <Edit className="h-4 w-4 mr-2" />
                Edit Markdown
              </>
            ) : (
              <>
                <Monitor className="h-4 w-4 mr-2" />
                Show Preview
              </>
            )}
          </Button>

          <div className="border rounded-lg">
            <MDEditor
              value={previewContent}
              onChange={setPreviewContent}
              height={800}
              preview={coverLetterMode}
            />
          </div>
          
          {/* Hidden element for PDF generation */}
          <div className="hidden">
            <div id="cover-letter-pdf">
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
};

export default CoverLetterPreview;
