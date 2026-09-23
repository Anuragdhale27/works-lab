import { Fragment, type ReactNode } from 'react';
import { parseDescription } from '../lib/parseDescription';

/**
 * Renders a description string as a combination of bullet lists and paragraphs.
 * Lines starting with •, -, *, or – form bullet lists; others become paragraphs.
 *
 * The component does not apply any CSS classes — styling is left to the parent
 * template (via .rmod-desc ul, .rcls-desc ul, etc. in each template's CSS).
 */
export function Description({ text }: { text: string | undefined | null }): ReactNode {
  if (!text) return null;

  const blocks = parseDescription(text);
  return (
    <Fragment>
      {blocks.map((block, idx) =>
        block.type === 'bullets' ? (
          <ul key={idx}>
            {block.items!.map((item, itemIdx) => (
              <li key={itemIdx}>{item}</li>
            ))}
          </ul>
        ) : (
          <p key={idx}>{block.text}</p>
        )
      )}
    </Fragment>
  );
}
