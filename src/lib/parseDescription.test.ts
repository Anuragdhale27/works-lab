import { describe, expect, it } from 'vitest';
import { parseDescription } from './parseDescription';

describe('parseDescription', () => {
  it('returns empty array for null or undefined', () => {
    expect(parseDescription(null)).toEqual([]);
    expect(parseDescription(undefined)).toEqual([]);
    expect(parseDescription('')).toEqual([]);
  });

  it('parses a single bullet point', () => {
    const result = parseDescription('• First item');
    expect(result).toEqual([{ type: 'bullets', items: ['First item'] }]);
  });

  it('parses multiple consecutive bullet points', () => {
    const result = parseDescription('• First\n• Second\n• Third');
    expect(result).toEqual([
      {
        type: 'bullets',
        items: ['First', 'Second', 'Third'],
      },
    ]);
  });

  it('recognizes different bullet markers', () => {
    const withDot = parseDescription('• Item');
    const withDash = parseDescription('- Item');
    const withStar = parseDescription('* Item');
    const withEndash = parseDescription('– Item');

    expect(withDot).toEqual([{ type: 'bullets', items: ['Item'] }]);
    expect(withDash).toEqual([{ type: 'bullets', items: ['Item'] }]);
    expect(withStar).toEqual([{ type: 'bullets', items: ['Item'] }]);
    expect(withEndash).toEqual([{ type: 'bullets', items: ['Item'] }]);
  });

  it('parses a paragraph as a single block', () => {
    const result = parseDescription('This is a paragraph');
    expect(result).toEqual([{ type: 'paragraph', text: 'This is a paragraph' }]);
  });

  it('separates bullets and paragraphs', () => {
    const result = parseDescription('• First bullet\n• Second bullet\nThis is a paragraph');
    expect(result).toEqual([
      { type: 'bullets', items: ['First bullet', 'Second bullet'] },
      { type: 'paragraph', text: 'This is a paragraph' },
    ]);
  });

  it('handles paragraph followed by bullets', () => {
    const result = parseDescription('A paragraph\n• First bullet\n• Second bullet');
    expect(result).toEqual([
      { type: 'paragraph', text: 'A paragraph' },
      { type: 'bullets', items: ['First bullet', 'Second bullet'] },
    ]);
  });

  it('handles multiple bullet lists separated by paragraphs', () => {
    const result = parseDescription(
      '• First bullet\n• Second bullet\nMiddle paragraph\n• Third bullet\n• Fourth bullet'
    );
    expect(result).toEqual([
      { type: 'bullets', items: ['First bullet', 'Second bullet'] },
      { type: 'paragraph', text: 'Middle paragraph' },
      { type: 'bullets', items: ['Third bullet', 'Fourth bullet'] },
    ]);
  });

  it('ignores empty lines between bullets', () => {
    const result = parseDescription('• First\n\n• Second');
    expect(result).toEqual([
      { type: 'bullets', items: ['First'] },
      { type: 'bullets', items: ['Second'] },
    ]);
  });

  it('strips whitespace around bullet markers', () => {
    const result = parseDescription('  •  Item with spaces  ');
    expect(result).toEqual([{ type: 'bullets', items: ['Item with spaces'] }]);
  });

  it('handles mixed content with empty lines', () => {
    const result = parseDescription(
      '• Bullet 1\n• Bullet 2\n\nParagraph text\n\n• Bullet 3'
    );
    expect(result).toEqual([
      { type: 'bullets', items: ['Bullet 1', 'Bullet 2'] },
      { type: 'paragraph', text: 'Paragraph text' },
      { type: 'bullets', items: ['Bullet 3'] },
    ]);
  });

  it('skips lines that are just bullet markers (no text)', () => {
    const result = parseDescription('• First\n•\n• Third');
    expect(result).toEqual([{ type: 'bullets', items: ['First', 'Third'] }]);
  });

  it('handles real-world example', () => {
    const text = `• Led development of microservices architecture serving 500K+ daily users
• Reduced API response time by 40% through caching and query optimisation
Collaborated with 5-person team on deployment pipeline improvements`;

    const result = parseDescription(text);
    expect(result).toEqual([
      {
        type: 'bullets',
        items: [
          'Led development of microservices architecture serving 500K+ daily users',
          'Reduced API response time by 40% through caching and query optimisation',
        ],
      },
      { type: 'paragraph', text: 'Collaborated with 5-person team on deployment pipeline improvements' },
    ]);
  });
});
