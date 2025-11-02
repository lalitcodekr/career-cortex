// app/api/generate-pdf/route.js

import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";
import chromium from "@sparticuz/chromium";

// Local Chrome path for development (macOS)
const CHROME_PATH =
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

export async function POST(req) {
  try {
    const { htmlContent, type = "resume", filename } = await req.json();

    if (!htmlContent) {
      return new NextResponse(
        JSON.stringify({ error: "No content provided" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Cover letter specific styling
    const isCoverLetter = type === "cover-letter";

    // Configure browser launch options based on environment
    // Always use @sparticuz/chromium unless we're on local macOS development
    const isVercel = !!process.env.VERCEL;
    const isProduction = process.env.NODE_ENV === "production";
    const isLocalMac = process.platform === "darwin" && !isVercel && !isProduction;

    let launchOptions;

    if (isLocalMac) {
      // Only use local Chrome when on macOS and in local development
      launchOptions = {
        headless: true,
        executablePath: CHROME_PATH,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      };
    } else {
      // Use @sparticuz/chromium for Vercel/serverless environments (default for all non-local-mac)
      chromium.setGraphicsMode(false); // Disable GPU for serverless
      const executablePath = await chromium.executablePath();
      
      launchOptions = {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: executablePath,
        headless: chromium.headless,
      };
    }

    const browser = await puppeteer.launch(launchOptions);

    const page = await browser.newPage();

    // Cover letter optimized styling
    const coverLetterStyles = isCoverLetter
      ? `
      body { 
        font-family: 'Times New Roman', Times, serif;
        font-size: 12pt;
        line-height: 1.6;
        color: #000;
        max-width: 8.5in;
        margin: 0 auto;
      }
      p {
        margin-bottom: 12pt;
        text-align: justify;
      }
      h1, h2, h3, h4, h5, h6 {
        font-family: 'Times New Roman', Times, serif;
        margin-top: 18pt;
        margin-bottom: 12pt;
        font-weight: bold;
        line-height: 1.3;
      }
      /* Hide anchor links for cleaner appearance */
      h1 .anchor, h2 .anchor, h3 .anchor, h4 .anchor, h5 .anchor, h6 .anchor {
        display: none;
      }
      /* Signature line spacing */
      p:last-child {
        margin-top: 24pt;
      }
    `
      : `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"; 
        font-size: 16px;
        line-height: 1.5;
      }
      h1, h2, h3, h4, h5, h6 {
        margin-top: 24px;
        margin-bottom: 16px;
        font-weight: 600;
        line-height: 1.25;
      }
      h1 .anchor, h2 .anchor, h3 .anchor, h4 .anchor, h5 .anchor, h6 .anchor {
        display: none;
      }
      h2 {
        padding-bottom: 0.3em;
        border-bottom: 1px solid #eaecef;
      }
      p {
        text-align: justify;
      }
      /* Right-align date ranges */
      div[align="right"],
      div[style*="text-align: right"] {
        text-align: right !important;
        margin: 0 0 8px 0 !important;
        padding: 0 !important;
        list-style: none !important;
      }
      ul {
        padding-left: 2em;
        display: block !important;
        list-style-type: disc;
        margin: 0;
        margin-bottom: 16px;
      }
      /* --- THIS RULE WAS ADDED --- */
      li {
        display: list-item !important; /* Force list-item display to show bullets */
        list-style-type: disc;
        list-style-position: outside;
        text-align: justify; /* Keeps list items justified */
        margin-bottom: 4px !important;   /* Reduced spacing between bullet points */
        margin-top: 0 !important;
        margin-left: 0;
        padding-left: 0.5em;
        padding-bottom: 2px;
        line-height: 1.6;
        white-space: normal; /* Ensure proper wrapping */
        page-break-inside: avoid; /* Keep bullet points together */
        clear: both; /* Ensure each item starts on new line */
        min-height: 1.2em; /* Ensure minimum height for each bullet */
      }
      /* Handle paragraphs inside list items */
      li p {
        display: inline;
        margin: 0;
        padding: 0;
      }
      /* Ensure nested lists also format correctly */
      ul ul {
        margin-top: 8px;
        margin-bottom: 8px;
      }
      /* Force list items to not be inline */
      li + li {
        margin-top: 0;
      }
      /* -------------------------- */
      a {
        color: #0366d6;
        text-decoration: none;
      }
      code {
        font-family: monospace;
        font-size: 0.9em;
        background-color: #f6f8fa;
        padding: 0.2em 0.4em;
        border-radius: 3px;
      }
    `;

    await page.setContent(
      `
      <html>
        <head>
          <style>
            html, body {
              margin: 0;
              padding: 0;
            }
            ${coverLetterStyles}
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                    color-adjust: exact;
                }
            }
          </style>
        </head>
        <body>
          ${htmlContent}
        </body>
      </html>
    `,
      { waitUntil: "networkidle0" }
    );

    // Fix list items and dates to ensure they're properly formatted
    await page.evaluate(() => {
      // First, convert date paragraphs to right-aligned divs (must be done before bullet conversion)
      const allParagraphs = Array.from(document.querySelectorAll("p"));
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
      const paragraphs = Array.from(document.querySelectorAll("p"));
      const processed = new Set();

      paragraphs.forEach((p) => {
        if (processed.has(p)) return;

        // Skip if this paragraph is inside a date div
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
          // Split by bullet characters to handle multiple bullets in one paragraph
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
      const listItems = document.querySelectorAll("li");
      listItems.forEach((li) => {
        li.style.display = "list-item";
        li.style.marginBottom = "4px";
        li.style.marginTop = "0";
        li.style.paddingBottom = "2px";
        li.style.lineHeight = "1.6";
        li.style.whiteSpace = "normal";
        li.style.minHeight = "1.2em";

        // Fix any paragraphs inside list items
        const paragraphs = li.querySelectorAll("p");
        paragraphs.forEach((p) => {
          const text = p.textContent;
          p.remove();
          if (text.trim()) {
            const textNode = document.createTextNode(text);
            li.appendChild(textNode);
          }
        });
      });

      // Ensure ul elements are block-level
      const lists = document.querySelectorAll("ul");
      lists.forEach((ul) => {
        ul.style.display = "block";
        ul.style.paddingLeft = "2em";
        ul.style.marginBottom = "16px";
      });
    });

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: isCoverLetter
        ? {
            top: "20mm",
            right: "25mm",
            bottom: "20mm",
            left: "25mm",
          }
        : {
            top: "12mm",
            right: "12mm",
            bottom: "12mm",
            left: "12mm",
          },
    });

    await browser.close();

    const defaultFilename = isCoverLetter ? "cover-letter.pdf" : "resume.pdf";
    const finalFilename = filename || defaultFilename;

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${finalFilename}"`,
      },
    });
  } catch (error) {
    console.error("PDF Generation Error:", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to generate PDF" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
