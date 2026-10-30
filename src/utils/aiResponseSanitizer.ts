/**
 * AI Response Sanitizer & Structured Parser
 *
 * Removes all emojis and markdown special characters (*, #, `, _, ~, etc.)
 * and parses raw LLM output into clean, structured, executive data blocks.
 */

export interface CleanKeyValue {
  label: string;
  value: string;
}

export interface CleanStep {
  number: number;
  text: string;
}

export interface CleanSection {
  title?: string;
  summary?: string;
  keyValues: CleanKeyValue[];
  steps: CleanStep[];
  bulletPoints: string[];
  conclusion?: string;
}

export interface SanitizedAiResult {
  headline?: string;
  sections: CleanSection[];
  rawCleanText: string;
}

// Emoji range regex covers all standard Unicode emoji blocks and modifiers
const EMOJI_REGEX =
  /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{2300}-\u{23FF}\u{2B50}\u{200D}\u{FE0F}]/gu;

/**
 * Removes all emojis and raw markdown special characters from a string
 */
export function cleanRawText(input: string): string {
  if (!input) return '';

  return (
    input
      // 1. Remove emojis
      .replace(EMOJI_REGEX, '')
      // 2. Remove markdown header symbols (#, ##, ###)
      .replace(/^[#]+\s+/gm, '')
      // 3. Remove bold, italic, strikethrough, backticks
      .replace(/[*_`~]/g, '')
      // 4. Remove blockquote markers
      .replace(/^[>\s]+/gm, '')
      // 5. Remove citations e.g. [1], [2]
      .replace(/\[\d+\]/g, '')
      // 6. Clean markdown table bars
      .replace(/\|/g, ' ')
      // 7. Remove repeated horizontal rule dashes
      .replace(/^[-=_]{3,}$/gm, '')
      // 8. Normalize spacing
      .replace(/[ \t]+/g, ' ')
      .trim()
  );
}

/**
 * Parses raw AI response into structured sections with key-values, steps, and points
 */
export function sanitizeAndStructureAiOutput(rawText: string): SanitizedAiResult {
  const cleaned = cleanRawText(rawText);
  const lines = cleaned.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);

  const sections: CleanSection[] = [];
  let currentSection: CleanSection = {
    keyValues: [],
    steps: [],
    bulletPoints: [],
  };

  let headline: string | undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check for Headline on the very first line if short and bold-like
    if (i === 0 && line.length < 80 && !line.includes(':')) {
      headline = line;
      continue;
    }

    // Check for Section Header (e.g. "CANCELLATION RUNBOOK:", "Mandate Analysis", "Summary")
    const isHeader =
      (line.endsWith(':') && line.length < 60 && !line.includes('₹') && !line.includes('Rs.')) ||
      (/^[A-Z0-9\s/&-]{3,50}$/.test(line) && !line.includes('₹') && !line.includes('Rs.'));

    if (isHeader) {
      if (
        currentSection.title ||
        currentSection.keyValues.length > 0 ||
        currentSection.steps.length > 0 ||
        currentSection.bulletPoints.length > 0 ||
        currentSection.summary ||
        currentSection.conclusion
      ) {
        sections.push(currentSection);
      }
      currentSection = {
        title: line.replace(/:$/, '').trim(),
        keyValues: [],
        steps: [],
        bulletPoints: [],
      };
      continue;
    }

    // Check for Numbered Step (e.g. "1. Open UPI App", "2) Navigate to Settings")
    const stepMatch = line.match(/^(\d+)[\.\)]\s+(.+)$/);
    if (stepMatch) {
      currentSection.steps.push({
        number: parseInt(stepMatch[1], 10),
        text: stepMatch[2].trim(),
      });
      continue;
    }

    // Check for Bullet point (e.g. "• Item", "- Item", "* Item")
    // NOTE: Must check bullet point BEFORE key-value, so lines like "- Label: Details" are parsed as bullet items
    const bulletMatch = line.match(/^[-•*]\s*(.+)$/);
    if (bulletMatch) {
      currentSection.bulletPoints.push(bulletMatch[1].trim());
      continue;
    }

    // Check for Key-Value pair (e.g. "Merchant: Netflix", "Risk: High", "Status: Active")
    const colonIdx = line.indexOf(':');
    if (colonIdx > 0 && colonIdx < 35) {
      const label = line.slice(0, colonIdx).trim();
      const value = line.slice(colonIdx + 1).trim();
      // Ensure label is short, contains no sentences, and does not start with bullet characters
      if (
        label.length <= 30 &&
        !label.includes('.') &&
        !/^[-•*]/.test(label) &&
        value.length > 0
      ) {
        currentSection.keyValues.push({ label, value });
        continue;
      }
    }

    // Otherwise, treat as narrative text:
    // If structured items already exist in current section, treat as conclusion/outro;
    // otherwise treat as summary/intro.
    const hasItems =
      currentSection.keyValues.length > 0 ||
      currentSection.steps.length > 0 ||
      currentSection.bulletPoints.length > 0;

    if (!hasItems) {
      if (!currentSection.summary) {
        currentSection.summary = line;
      } else {
        currentSection.summary += ' ' + line;
      }
    } else {
      if (!currentSection.conclusion) {
        currentSection.conclusion = line;
      } else {
        currentSection.conclusion += ' ' + line;
      }
    }
  }

  // Push final section
  if (
    currentSection.title ||
    currentSection.keyValues.length > 0 ||
    currentSection.steps.length > 0 ||
    currentSection.bulletPoints.length > 0 ||
    currentSection.summary ||
    currentSection.conclusion
  ) {
    sections.push(currentSection);
  }

  return {
    headline,
    sections,
    rawCleanText: cleaned,
  };
}
