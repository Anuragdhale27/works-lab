import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TEMPLATE_KEYS, TEMPLATES } from './index';
import { emptyResumeData } from '../types/resume';

describe('template registry', () => {
  it('has exactly the four expected templates', () => {
    expect(TEMPLATE_KEYS.sort()).toEqual(['classic', 'executive', 'minimal', 'modern']);
  });

  it.each(TEMPLATE_KEYS)('renders %s template with empty data without throwing', (key) => {
    const { Component } = TEMPLATES[key];
    render(<Component data={emptyResumeData} />);
    expect(screen.getByText('Your Name')).toBeInTheDocument();
  });
});
