/**
 * Parses a description string into blocks of bullets and paragraphs.
 *
 * Consecutive lines starting with •, -, *, or – (after trimming) form a bullet list.
 * Other non-empty lines become paragraphs.
 *
 * Returns an array of blocks where each block is either:
 * - { type: 'bullets', items: string[] } — a list of bullet points (marker stripped)
 * - { type: 'paragraph', text: string } — a paragraph of text
 */
export interface ParsedBlock {
  type: 'bullets' | 'paragraph';
  items?: string[];
  text?: string;
}

const BULLET_MARKERS = ['•', '-', '*', '–'];

export function parseDescription(text: string | undefined | null): ParsedBlock[] {
  if (!text) return [];

  const lines = text.split('\n');
  const blocks: ParsedBlock[] = [];
  let currentBullets: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    // Check if this line starts with a bullet marker
    let isBulletLine = false;
    let bulletText = '';

    for (const marker of BULLET_MARKERS) {
      if (trimmed.startsWith(marker)) {
        isBulletLine = true;
        // Strip the marker and any following whitespace
        bulletText = trimmed.slice(marker.length).trim();
        break;
      }
    }

    if (isBulletLine && bulletText) {
      // This is a bullet point with text
      currentBullets.push(bulletText);
    } else if (isBulletLine && !bulletText) {
      // Bullet marker with no text — skip but don't flush current bullets
      // (this continues the bullet list, skipping empty bullet lines)
      continue;
    } else if (trimmed) {
      // Non-empty non-bullet line — flush bullets and add as paragraph
      if (currentBullets.length > 0) {
        blocks.push({ type: 'bullets', items: currentBullets });
        currentBullets = [];
      }
      blocks.push({ type: 'paragraph', text: trimmed });
    } else {
      // Empty line — flush bullets but don't add a paragraph
      if (currentBullets.length > 0) {
        blocks.push({ type: 'bullets', items: currentBullets });
        currentBullets = [];
      }
    }
  }

  // Flush any remaining bullets
  if (currentBullets.length > 0) {
    blocks.push({ type: 'bullets', items: currentBullets });
  }

  return blocks;
}
