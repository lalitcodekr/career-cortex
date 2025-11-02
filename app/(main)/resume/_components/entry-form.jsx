"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { entrySchema } from "@/app/lib/schema";
import {
  Sparkles,
  PlusCircle,
  X,
  Pencil,
  Save,
  Loader2,
  Calendar,
} from "lucide-react";
import { improveWithAI } from "@/actions/resume";
import { toast } from "sonner";
import useFetch from "@/hooks/use-fetch";

const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  const date = parse(dateString, "yyyy-MM", new Date());
  return format(date, "MMM yyyy");
};

export default function EntryForm({ type, entries, onChange }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const {
    register,
    handleSubmit: handleValidation,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(entrySchema),
    defaultValues: {
      title: "",
      organization: "",
      startDate: "",
      endDate: "",
      description: "",
      current: false,
    },
  });

  const current = watch("current");

  const handleAdd = handleValidation((data) => {
    const formattedEntry = {
      ...data,
      startDate: formatDisplayDate(data.startDate),
      endDate: data.current ? "" : formatDisplayDate(data.endDate),
    };

    if (editingIndex !== null) {
      // Update existing entry
      const newEntries = [...entries];
      newEntries[editingIndex] = formattedEntry;
      onChange(newEntries);
      setEditingIndex(null);
    } else {
      // Add new entry
      onChange([...entries, formattedEntry]);
    }

    reset();
    setIsAdding(false);
  });

  const handleEdit = (index) => {
    const entry = entries[index];
    try {
      setValue("title", entry.title);
      setValue("organization", entry.organization);
      // Parse the formatted date back to YYYY-MM format for the month input
      if (entry.startDate) {
        const parsedStartDate = parse(entry.startDate, "MMM yyyy", new Date());
        if (!isNaN(parsedStartDate.getTime())) {
          const year = parsedStartDate.getFullYear();
          const month = String(parsedStartDate.getMonth() + 1).padStart(2, '0');
          setValue("startDate", `${year}-${month}`);
        }
      }
      if (entry.endDate && !entry.current) {
        const parsedEndDate = parse(entry.endDate, "MMM yyyy", new Date());
        if (!isNaN(parsedEndDate.getTime())) {
          const year = parsedEndDate.getFullYear();
          const month = String(parsedEndDate.getMonth() + 1).padStart(2, '0');
          setValue("endDate", `${year}-${month}`);
        }
      }
      setValue("description", entry.description);
      setValue("current", entry.current || false);
      setEditingIndex(index);
      setIsAdding(true);
    } catch (error) {
      console.error("Error parsing dates for edit:", error);
      toast.error("Error loading entry for editing");
    }
  };

  const handleDelete = (index) => {
    const newEntries = entries.filter((_, i) => i !== index);
    onChange(newEntries);
  };

  const handleCancel = () => {
    reset();
    setIsAdding(false);
    setEditingIndex(null);
  };

  const {
    loading: isImproving,
    fn: improveWithAIFn,
    data: improvedContent,
    error: improveError,
  } = useFetch(improveWithAI);

  // Add this effect to handle the improvement result
  useEffect(() => {
    if (improvedContent && !isImproving && improvedContent.trim()) {
      setValue("description", improvedContent);
      toast.success("Description improved successfully!");
    }
    if (improveError) {
      toast.error(improveError.message || "Failed to improve description");
      console.error("AI improvement error:", improveError);
    }
  }, [improvedContent, improveError, isImproving, setValue]);

  // Replace handleImproveDescription with this
  const handleImproveDescription = async () => {
    const description = watch("description");
    const title = watch("title");
    const organization = watch("organization");
    
    if (!description) {
      toast.error("Please enter a description first");
      return;
    }

    await improveWithAIFn({
      current: description,
      type: type.toLowerCase(), // 'experience', 'education', or 'project'
      title: title || undefined,
      organization: organization || undefined,
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {entries.map((item, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {item.title} @ {item.organization}
              </CardTitle>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => handleEdit(index)}
                  title="Edit entry"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  onClick={() => handleDelete(index)}
                  title="Delete entry"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                {item.current
                  ? `${item.startDate} - Present`
                  : `${item.startDate} - ${item.endDate}`}
              </p>
              <p className="mt-2 text-sm whitespace-pre-wrap">
                {item.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {isAdding && (
        <Card>
          <CardHeader>
            <CardTitle>{editingIndex !== null ? `Edit ${type}` : `Add ${type}`}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="Title/Position"
                  {...register("title")}
                  error={errors.title}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Organization/Company"
                  {...register("organization")}
                  error={errors.organization}
                />
                {errors.organization && (
                  <p className="text-sm text-red-500">
                    {errors.organization.message}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Input
                  placeholder="Start Date"
                  type="month" // This is correct for a month/year picker
                  {...register("startDate")}
                  error={errors.startDate}
                />
                {errors.startDate && (
                  <p className="text-sm text-red-500">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  placeholder="End Date"
                  type="month" // This is correct for a month/year picker
                  {...register("endDate")}
                  disabled={current}
                  error={errors.endDate}
                />
                {errors.endDate && (
                  <p className="text-sm text-red-500">
                    {errors.endDate.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`current-${type}`} // Added unique id
                {...register("current")}
                onChange={(e) => {
                  setValue("current", e.target.checked);
                  if (e.target.checked) {
                    setValue("endDate", "");
                  }
                }}
              />
              <label htmlFor={`current-${type}`}>Current {type}</label>
            </div>

            <div className="space-y-2">
              <Textarea
                placeholder={`Description of your ${type.toLowerCase()}`}
                className="h-32"
                {...register("description")}
                error={errors.description}
              />
              {errors.description && (
                <p className="text-sm text-red-500">
                  {errors.description.message}
                </p>
              )}
            </div>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleImproveDescription}
              disabled={isImproving || !watch("description")}
            >
              {isImproving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Improving...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Improve with AI
                </>
              )}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button type="button" onClick={handleAdd}>
              <PlusCircle className="h-4 w-4 mr-2" />
              {editingIndex !== null ? "Update Entry" : "Add Entry"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {!isAdding && (
        <Button
          className="w-full"
          variant="outline"
          onClick={() => setIsAdding(true)}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Add {type}
        </Button>
      )}
    </div>
  );
}
