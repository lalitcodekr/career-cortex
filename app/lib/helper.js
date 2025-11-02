/**
 * Converts an array of entries (experience, education, projects) to markdown format
 * @param {Array} entries - Array of entry objects
 * @param {string} title - Section title (e.g., "Work Experience", "Education")
 * @returns {string} Markdown formatted string
 */
export function entriesToMarkdown(entries, title) {
  if (!entries || entries.length === 0) {
    return "";
  }

  // Use an array to build the markdown string
  const sectionBody = entries
    .map((entry) => {
      const entryParts = [];

      // Create date range
      const dateRange = entry.current
        ? `${entry.startDate} - Present`
        : entry.endDate
        ? `${entry.startDate} - ${entry.endDate}`
        : entry.startDate;

      // Add Title and Organization
      entryParts.push(
        `### ${entry.title}${
          entry.organization ? ` @ ${entry.organization}` : ""
        }`
      );

      // Add Date Range if it exists - format as right-aligned, no bullets
      if (dateRange) {
        // Format with spacing: "start - end"
        const formattedDate = dateRange.includes(" - ") 
          ? dateRange.replace(/\s*-\s*/, " - ") 
          : dateRange;
        entryParts.push(`<div align="right" style="text-align: right;"><em>${formattedDate}</em></div>`);
      }

      // --- THIS IS THE FIX ---
      // Check if description exists
      if (entry.description) {
        // 1. Split the description string by newlines
        // 2. Filter out any empty lines
        // 3. Map each line to a markdown bullet point
        // 4. Join with single newlines to keep items in one continuous list
        const descriptionBullets = entry.description
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .map((line) => `* ${line.trim()}`)
          .join("\n"); // Single newline keeps items in one list

        // Add a blank line before the bullets for proper markdown list parsing
        entryParts.push(`\n\n${descriptionBullets}`);
      }
      // -----------------------

      // Join the parts for this single entry (e.g., one project)
      // and add two newlines for spacing after it.
      return entryParts.join("\n");
    })
    .join("\n\n"); // Add space between each entry (e.g., between two projects)

  // Return the full section
  return `## ${title}\n\n${sectionBody}`;
}

/**
 * Parses markdown resume content back into form data structure
 * @param {string} markdown - Markdown formatted resume content
 * @returns {Object} Form data object with contactInfo, summary, skills, experience, education, projects
 */
export function markdownToFormData(markdown) {
  if (!markdown || !markdown.trim()) {
    return {
      contactInfo: {},
      summary: "",
      skills: "",
      experience: [],
      education: [],
      projects: [],
    };
  }

  const formData = {
    contactInfo: {},
    summary: "",
    skills: "",
    experience: [],
    education: [],
    projects: [],
  };

  // First, try to parse contact info (it appears as the first section with centered divs)
  // Format: ## <div align="center">Name</div>\n\n<div align="center">\n\nemail | mobile | links\n\n</div>
  const contactSectionMatch = markdown.match(/##\s*<div[^>]*align[^>]*center[^>]*>([^<]+)<\/div>[\s\S]*?<div[^>]*align[^>]*center[^>]*>[\s\n]*([^<]*)<\/div>/);
  if (contactSectionMatch) {
    const contactContent = contactSectionMatch[2];
    // Extract contact info from the pipe-separated format
    const contactParts = contactContent.split("|").map(p => p.trim()).filter(Boolean);
    contactParts.forEach((part) => {
      if (part.includes("📧")) {
        formData.contactInfo.email = part.replace(/📧\s*/, "").trim();
      } else if (part.includes("📱")) {
        formData.contactInfo.mobile = part.replace(/📱\s*/, "").trim();
      } else if (part.includes("💼") && part.includes("LinkedIn")) {
        const urlMatch = part.match(/\[LinkedIn\]\(([^\)]+)\)/);
        if (urlMatch) formData.contactInfo.linkedin = urlMatch[1];
      } else if (part.includes("🐦") && (part.includes("Twitter") || part.includes("X"))) {
        const urlMatch = part.match(/\[Twitter[^\]]*\]\(([^\)]+)\)/);
        if (urlMatch) formData.contactInfo.twitter = urlMatch[1];
      }
    });
  }

  // Split markdown into sections by ## headings
  const sections = markdown.split(/^##\s+/m).filter(Boolean);

  sections.forEach((section) => {
    const lines = section.split("\n");
    const title = lines[0]?.trim();
    const content = lines.slice(1).join("\n").trim();

    // Skip contact section if it was already parsed
    if (title && title.includes("<div")) {
      return;
    }

    // Parse Professional Summary
    if (title === "Professional Summary") {
      formData.summary = content;
    }

    // Parse Skills
    if (title === "Skills") {
      formData.skills = content;
    }

    // Parse Work Experience
    if (title === "Work Experience") {
      formData.experience = parseEntries(content);
    }

    // Parse Education
    if (title === "Education") {
      formData.education = parseEntries(content);
    }

    // Parse Projects
    if (title === "Projects") {
      formData.projects = parseEntries(content);
    }
  });

  return formData;
}

/**
 * Parses a section's markdown content into entry objects
 * @param {string} content - Markdown content for entries
 * @returns {Array} Array of entry objects
 */
function parseEntries(content) {
  const entries = [];
  
  // Split by ### headings (each entry starts with ###)
  const entryBlocks = content.split(/^###\s+/m).filter(Boolean);

  entryBlocks.forEach((block) => {
    const lines = block.split("\n").filter(Boolean);
    if (lines.length === 0) return;

    // Parse title and organization from first line: "Title @ Organization"
    const titleLine = lines[0].trim();
    const titleMatch = titleLine.match(/^(.+?)(?:\s+@\s+(.+))?$/);
    if (!titleMatch) return;

    const title = titleMatch[1].trim();
    const organization = titleMatch[2]?.trim() || "";

    // Find date range (right-aligned div with em tag)
    // Try multiple patterns to catch different HTML structures
    let startDate = "";
    let endDate = "";
    let current = false;
    
    // Pattern 1: <div align="right">...<em>date</em></div>
    let dateMatch = block.match(/<div[^>]*align[^>]*right[^>]*>[\s\S]*?<em>([^<]+)<\/em>/);
    
    // Pattern 2: <div style="...text-align: right...">...<em>date</em></div>
    if (!dateMatch) {
      dateMatch = block.match(/<div[^>]*style[^>]*text-align[^>]*right[^>]*>[\s\S]*?<em>([^<]+)<\/em>/);
    }
    
    // Pattern 3: Just look for <em> with date-like content
    if (!dateMatch) {
      const emMatches = block.match(/<em>([^<]+)<\/em>/g);
      if (emMatches) {
        // Check if any match looks like a date range
        for (const emMatch of emMatches) {
          const dateStr = emMatch.replace(/<\/?em>/g, "").trim();
          // Check if it matches date format (MMM yyyy - MMM yyyy or MMM yyyy - Present)
          if (/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}/i.test(dateStr)) {
            dateMatch = [null, dateStr];
            break;
          }
        }
      }
    }
    
    if (dateMatch) {
      const dateStr = dateMatch[1].trim();
      if (dateStr.includes(" - ")) {
        const parts = dateStr.split(" - ").map((s) => s.trim());
        startDate = parts[0] || "";
        const endPart = parts[1] || "";
        if (endPart === "Present") {
          current = true;
          endDate = "";
        } else if (endPart) {
          endDate = endPart;
        }
      } else if (dateStr) {
        // Single date (just start date)
        startDate = dateStr;
      }
    }

    // Parse description (bullet points)
    let description = "";
    const descriptionMatch = block.match(/^(\*|•|[-])\s+(.+)$/gm);
    if (descriptionMatch && descriptionMatch.length > 0) {
      description = descriptionMatch
        .map((line) => line.replace(/^[\*•\-]\s+/, "").trim())
        .filter(Boolean)
        .join("\n");
    } else {
      // Try to get description from content after date
      const dateIndex = block.indexOf("</div>");
      if (dateIndex !== -1) {
        const descContent = block.substring(dateIndex + 6).trim();
        // Remove any remaining markdown formatting
        description = descContent.replace(/^[\*•\-]\s+/gm, "").trim();
      }
    }

    entries.push({
      title,
      organization,
      startDate,
      endDate,
      description,
      current,
    });
  });

  return entries;
}
