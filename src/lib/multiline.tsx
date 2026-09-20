import { Fragment, type ReactNode } from 'react';

/**
 * Renders text with embedded newlines as separate lines joined by <br/>,
 * mirroring the old esc() helper's "\n" -> "<br>" behavior — but safely,
 * since JSX text nodes are escaped automatically and no HTML is injected.
 */
export function multiline(text: string | undefined | null): ReactNode {
  if (!text) return null;
  const lines = text.split('\n');
  return lines.map((line, i) => (
    <Fragment key={i}>
      {line}
      {i < lines.length - 1 && <br />}
    </Fragment>
  ));
}
