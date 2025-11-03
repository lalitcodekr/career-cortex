"use client";

import { useEffect, useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, parse } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  const startDateInputRef = useRef(null);
  const endDateInputRef = useRef(null);
  const [isStartPickerOpen, setIsStartPickerOpen] = useState(false);
  const [isEndPickerOpen, setIsEndPickerOpen] = useState(false);
  const [startPickerMonth, setStartPickerMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [startPickerYear, setStartPickerYear] = useState(String(new Date().getFullYear()));
  const [endPickerMonth, setEndPickerMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [endPickerYear, setEndPickerYear] = useState(String(new Date().getFullYear()));

  const isSafari = typeof navigator !== "undefined" && /safari/i.test(navigator.userAgent) && !/chrome|crios|android|edg/i.test(navigator.userAgent);

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
          const month = String(parsedStartDate.getMonth() + 1).padStart(2, "0");
          setValue("startDate", `${year}-${month}`);
        }
      }
      if (entry.endDate && !entry.current) {
        const parsedEndDate = parse(entry.endDate, "MMM yyyy", new Date());
        if (!isNaN(parsedEndDate.getTime())) {
          const year = parsedEndDate.getFullYear();
          const month = String(parsedEndDate.getMonth() + 1).padStart(2, "0");
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
            <CardTitle>
              {editingIndex !== null ? `Edit ${type}` : `Add ${type}`}
            </CardTitle>
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

            {isSafari && (
              <>
                <Dialog open={isStartPickerOpen} onOpenChange={setIsStartPickerOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select start month</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-3">
                      <Select value={startPickerMonth} onValueChange={setStartPickerMonth}>
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={startPickerYear} onValueChange={setStartPickerYear}>
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 80 }, (_, idx) => String(new Date().getFullYear() + 10 - idx)).map((y) => (
                            <SelectItem key={y} value={y}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsStartPickerOpen(false)}>Cancel</Button>
                      <Button onClick={() => {
                        const value = `${startPickerYear}-${startPickerMonth}`;
                        setValue("startDate", value, { shouldValidate: true });
                        if (startDateInputRef.current) startDateInputRef.current.value = value;
                        setIsStartPickerOpen(false);
                      }}>Set</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={isEndPickerOpen} onOpenChange={setIsEndPickerOpen}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Select end month</DialogTitle>
                    </DialogHeader>
                    <div className="flex gap-3">
                      <Select value={endPickerMonth} onValueChange={setEndPickerMonth}>
                        <SelectTrigger>
                          <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map((m) => (
                            <SelectItem key={m} value={m}>{m}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={endPickerYear} onValueChange={setEndPickerYear}>
                        <SelectTrigger>
                          <SelectValue placeholder="Year" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 80 }, (_, idx) => String(new Date().getFullYear() + 10 - idx)).map((y) => (
                            <SelectItem key={y} value={y}>{y}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsEndPickerOpen(false)}>Cancel</Button>
                      <Button disabled={current} onClick={() => {
                        const value = `${endPickerYear}-${endPickerMonth}`;
                        setValue("endDate", value, { shouldValidate: true });
                        if (endDateInputRef.current) endDateInputRef.current.value = value;
                        setIsEndPickerOpen(false);
                      }}>Set</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder={isSafari ? "YYYY-MM" : "Start Date"}
                    type={isSafari ? "text" : "month"} // month picker on modern browsers; text with custom picker on Safari
                    {...(() => {
                      const { ref, ...rest } = register("startDate");
                      return {
                        ...rest,
                        ref: (e) => {
                          startDateInputRef.current = e;
                          if (typeof ref === "function") {
                            ref(e);
                          } else if (ref) {
                            ref.current = e;
                          }
                        },
                      };
                    })()}
                    error={errors.startDate}
                    className="pr-10"
                  />
                  {isSafari && (
                    <button
                      type="button"
                      onClick={() => {
                        const val = startDateInputRef.current?.value || "";
                        if (/^\d{4}-\d{2}$/.test(val)) {
                          const [y, m] = val.split("-");
                          setStartPickerYear(y);
                          setStartPickerMonth(m);
                        }
                        setIsStartPickerOpen(true);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                      tabIndex={-1}
                      aria-label="Open calendar picker"
                    >
                      <Calendar className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {errors.startDate && (
                  <p className="text-sm text-red-500">
                    {errors.startDate.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">Start Date</p>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Input
                    placeholder={isSafari ? "YYYY-MM" : "End Date"}
                    type={isSafari ? "text" : "month"} // month picker on modern browsers; text with custom picker on Safari
                    {...(() => {
                      const { ref, ...rest } = register("endDate");
                      return {
                        ...rest,
                        ref: (e) => {
                          endDateInputRef.current = e;
                          if (typeof ref === "function") {
                            ref(e);
                          } else if (ref) {
                            ref.current = e;
                          }
                        },
                      };
                    })()}
                    disabled={current}
                    error={errors.endDate}
                    className="pr-10"
                  />
                  {isSafari && (
                    <button
                      type="button"
                      onClick={() => {
                        if (current) return;
                        const val = endDateInputRef.current?.value || "";
                        if (/^\d{4}-\d{2}$/.test(val)) {
                          const [y, m] = val.split("-");
                          setEndPickerYear(y);
                          setEndPickerMonth(m);
                        }
                        setIsEndPickerOpen(true);
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                      tabIndex={-1}
                      aria-label="Open calendar picker"
                      disabled={current}
                    >
                      <Calendar className="h-4 w-4" />
                    </button>
                  )}
                </div>
                {errors.endDate && (
                  <p className="text-sm text-red-500">
                    {errors.endDate.message}
                  </p>
                )}
                <p className="text-sm text-muted-foreground">End Date</p>
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
            <Button type="button" variant="outline" onClick={handleCancel}>
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
