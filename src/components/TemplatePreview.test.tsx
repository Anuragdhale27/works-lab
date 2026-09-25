import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { TemplatePreview } from './TemplatePreview';
import { TEMPLATES } from '../templates';

describe('TemplatePreview', () => {
  it('renders no photo by default', () => {
    const { container } = render(<TemplatePreview template={TEMPLATES.modern} />);
    expect(container.querySelector('img')).toBeNull();
  });

  it('shows the given photo in templates that support one', () => {
    const { container } = render(<TemplatePreview template={TEMPLATES.modern} photo="/sample-avatar.png" />);
    expect(container.querySelector('img')).toHaveAttribute('src', '/sample-avatar.png');
  });
});
