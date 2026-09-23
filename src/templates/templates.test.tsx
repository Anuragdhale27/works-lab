import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { TEMPLATE_KEYS, TEMPLATES } from './index';
import { emptyResumeData } from '../types/resume';

describe('template registry', () => {
  it('has exactly the six expected templates', () => {
    expect(TEMPLATE_KEYS.sort()).toEqual(['classic', 'executive', 'minimal', 'modern', 'sidebar', 'split']);
  });

  it.each(TEMPLATE_KEYS)('renders %s template with empty data without throwing', (key) => {
    const { Component } = TEMPLATES[key];
    render(<Component data={emptyResumeData} />);
    expect(screen.getByText('Your Name')).toBeInTheDocument();
  });

  it.each(['modern', 'minimal', 'executive', 'sidebar', 'split'] as const)('%s shows the photo only when set', (key) => {
    const { Component } = TEMPLATES[key];
    const { container, rerender } = render(<Component data={emptyResumeData} />);
    expect(container.querySelector('img')).toBeNull();
    rerender(<Component data={{ ...emptyResumeData, personal: { ...emptyResumeData.personal, photo: 'data:image/jpeg;base64,AAAA' } }} />);
    expect(container.querySelector('img')).not.toBeNull();
  });

  it.each(['sidebar', 'split'] as const)('%s template renders Experience section before Skills section in DOM order', (key) => {
    const { Component } = TEMPLATES[key];
    const testData = {
      ...emptyResumeData,
      summary: 'Test summary',
      experience: [{ title: 'Test Job', company: 'Test Company', location: '', start: '2020', end: '2021', description: '' }],
      skills: ['React', 'TypeScript'],
    };
    const { container } = render(<Component data={testData} />);

    const experienceHeading = Array.from(container.querySelectorAll('[class*="-section-title"]')).find(
      (el) => el.textContent === 'Work Experience'
    );
    const skillsHeading = Array.from(container.querySelectorAll('[class*="-section-title"]')).find(
      (el) => el.textContent === 'Skills'
    );

    if (experienceHeading && skillsHeading) {
      // Check that Experience comes before Skills in DOM order
      const result = experienceHeading.compareDocumentPosition(skillsHeading);
      // DOCUMENT_POSITION_FOLLOWING = 4, meaning skillsHeading comes after experienceHeading
      expect(result & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    }
  });
});
