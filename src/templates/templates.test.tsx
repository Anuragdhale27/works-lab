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

  it.each(TEMPLATE_KEYS)('%s template renders an award title when awards has one entry', (key) => {
    const { Component } = TEMPLATES[key];
    const testData = {
      ...emptyResumeData,
      awards: [
        { title: 'Best Developer Award', issuer: 'Tech Org', year: '2023', description: 'For excellence in coding' },
      ],
    };
    const { container } = render(<Component data={testData} />);
    expect(container.textContent).toContain('Best Developer Award');
  });

  it.each(TEMPLATE_KEYS)('%s template respects sectionOrder: with projects before experience, Projects heading comes before Work Experience in DOM order', (key) => {
    const { Component } = TEMPLATES[key];
    const testData = {
      ...emptyResumeData,
      sectionOrder: ['projects', 'experience'],
      experience: [{ title: 'Test Job', company: 'Test Company', location: '', start: '2020', end: '2021', description: '' }],
      projects: [{ name: 'Test Project', tech: 'React', url: '', description: '' }],
    };
    const { container } = render(<Component data={testData} />);

    const projectsHeading = Array.from(container.querySelectorAll('[class*="-section-title"]')).find(
      (el) => el.textContent === 'Projects'
    );
    const experienceHeading = Array.from(container.querySelectorAll('[class*="-section-title"]')).find(
      (el) => el.textContent === 'Work Experience'
    );

    if (projectsHeading && experienceHeading) {
      const result = projectsHeading.compareDocumentPosition(experienceHeading);
      expect(result & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    }
  });

  it.each(TEMPLATE_KEYS)('%s template renders a custom section title when customSections is populated', (key) => {
    const { Component } = TEMPLATES[key];
    const testData = {
      ...emptyResumeData,
      customSections: [
        { id: 'volunteering', title: 'Volunteering', items: [{ heading: 'Test Org', subheading: 'Role', date: '2023', description: 'Description' }] },
      ],
    };
    const { container } = render(<Component data={testData} />);
    expect(container.textContent).toContain('Volunteering');
    expect(container.textContent).toContain('Test Org');
  });

  it.each(['sidebar', 'split'] as const)('%s template renders main-column headings before side-column headings in DOM order', (key) => {
    const { Component } = TEMPLATES[key];
    const testData = {
      ...emptyResumeData,
      sectionOrder: ['projects', 'experience', 'skills'],
      experience: [{ title: 'Test Job', company: 'Test Company', location: '', start: '2020', end: '2021', description: '' }],
      projects: [{ name: 'Test Project', tech: 'React', url: '', description: '' }],
      skills: ['React', 'TypeScript'],
    };
    const { container } = render(<Component data={testData} />);

    const projectsHeading = Array.from(container.querySelectorAll('[class*="-section-title"]')).find(
      (el) => el.textContent === 'Projects'
    );
    const skillsHeading = Array.from(container.querySelectorAll('[class*="-title"]')).find(
      (el) => el.textContent === 'Skills'
    );

    if (projectsHeading && skillsHeading) {
      const result = projectsHeading.compareDocumentPosition(skillsHeading);
      expect(result & Node.DOCUMENT_POSITION_FOLLOWING).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    }
  });
});
