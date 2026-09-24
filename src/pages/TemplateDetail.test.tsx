import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { TemplateDetail } from './TemplateDetail';
import { TEMPLATE_KEYS, TEMPLATES } from '../templates';

function renderAt(key: string) {
  return render(
    <MemoryRouter initialEntries={[`/template/${key}`]}>
      <Routes>
        <Route path="/template/:templateKey" element={<TemplateDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('TemplateDetail', () => {
  it.each(TEMPLATE_KEYS)('%s page has one h1, its features and links to the other templates', (key) => {
    const { container } = renderAt(key);

    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(TEMPLATES[key].name);

    for (const feature of TEMPLATES[key].features) {
      expect(screen.getByText(feature)).toBeInTheDocument();
    }

    const others = TEMPLATE_KEYS.filter((k) => k !== key);
    for (const other of others) {
      const link = screen.getByRole('link', { name: new RegExp(`${TEMPLATES[other].name} resume template`) });
      expect(link).toHaveAttribute('href', `/template/${other}`);
    }
    expect(within(container).queryByRole('link', { name: new RegExp(`${TEMPLATES[key].name} resume template`) })).toBeNull();
  });
});
