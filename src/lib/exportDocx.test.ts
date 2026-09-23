import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { exportResumeToDocx } from './exportDocx';
import type { ResumeData } from '../types/resume';

describe('exportDocx', () => {
  let capturedBlob: Blob | null = null;

  beforeEach(() => {
    capturedBlob = null;
    // Mock URL.createObjectURL and URL.revokeObjectURL to capture the blob
    URL.createObjectURL = vi.fn((obj: unknown) => {
      if (obj instanceof Blob) {
        capturedBlob = obj;
      }
      return 'blob:mock-url';
    });
    URL.revokeObjectURL = vi.fn();

    // Mock DOM methods
    document.body.appendChild = vi.fn();
    document.body.removeChild = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    capturedBlob = null;
  });

  it('should generate a .docx file with real heading styles (Heading1/Heading2) and custom sections', async () => {
    const sampleData: ResumeData = {
      personal: {
        name: 'John Doe',
        title: 'Software Engineer',
        email: 'john@example.com',
        phone: '555-1234',
        location: 'New York',
        linkedin: 'linkedin.com/in/john',
        portfolio: 'johndoe.dev',
        photo: '',
      },
      summary: 'A skilled software engineer with 5 years of experience.',
      experience: [
        {
          company: 'Tech Corp',
          title: 'Senior Engineer',
          location: 'New York',
          start: '2020',
          end: 'Present',
          description: '• Led team of 5 engineers\n• Improved performance by 40%',
        },
      ],
      education: [
        {
          degree: 'BS Computer Science',
          institution: 'State University',
          location: 'Boston',
          start: '2014',
          end: '2018',
          description: 'GPA: 3.8',
        },
      ],
      skills: ['JavaScript', 'React', 'TypeScript'],
      projects: [
        {
          name: 'Resume Builder',
          tech: 'React, TypeScript',
          url: 'github.com/example',
          description: 'A resume building application\n• Built with React 19 and Vite',
        },
      ],
      certifications: [
        {
          name: 'AWS Solutions Architect',
          org: 'Amazon',
          year: '2022',
          url: '',
        },
      ],
      languages: [
        {
          lang: 'English',
          level: 'Native',
        },
        {
          lang: 'Spanish',
          level: 'Fluent',
        },
      ],
      awards: [
        {
          title: 'Employee of the Year',
          issuer: 'Tech Corp',
          year: '2022',
          description: 'For outstanding performance',
        },
      ],
      customSections: [
        {
          id: 'custom-1',
          title: 'Volunteering',
          items: [
            {
              heading: 'Community Mentor',
              subheading: 'Local Tech Nonprofit',
              date: 'Jan 2022 – Dec 2023',
              description: '• Mentored 10+ junior developers\n• Led weekly workshops',
            },
          ],
        },
      ],
      sectionOrder: [],
      accent: '#7f1d1d',
    };

    // The function should complete without throwing
    await expect(exportResumeToDocx(sampleData)).resolves.toBeUndefined();

    // Verify that a blob was created and download was triggered
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalled();
    expect(capturedBlob).toBeTruthy();

    // Extract and validate the document XML
    if (capturedBlob) {
      const arrayBuffer = await capturedBlob.arrayBuffer();
      // Use JSZip to extract the document XML from the docx
      const { default: JSZip } = await import('jszip');
      const zip = new JSZip();
      await zip.loadAsync(arrayBuffer);

      // Read the document.xml file
      const documentXml = await zip.file('word/document.xml')?.async('text');
      expect(documentXml).toBeTruthy();

      if (documentXml) {
        // Verify heading styles are present
        expect(documentXml).toContain('w:val="Heading1"');
        expect(documentXml).toContain('w:val="Heading2"');
        // Verify custom section title appears
        expect(documentXml).toContain('Volunteering');
      }
    }
  });

  it('should handle missing name gracefully', async () => {
    const minimalData: ResumeData = {
      personal: {
        name: '',
        title: '',
        email: 'test@example.com',
        phone: '',
        location: '',
        linkedin: '',
        portfolio: '',
        photo: '',
      },
      summary: '',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      awards: [],
      customSections: [],
      sectionOrder: [],
    };

    await expect(exportResumeToDocx(minimalData)).resolves.toBeUndefined();
    expect(URL.createObjectURL).toHaveBeenCalled();
  });

  it('should parse descriptions with bullets correctly', async () => {
    const dataWithBullets: ResumeData = {
      personal: {
        name: 'Jane Smith',
        title: 'Product Manager',
        email: 'jane@example.com',
        phone: '',
        location: '',
        linkedin: '',
        portfolio: '',
        photo: '',
      },
      summary: 'Experienced PM\n• 7 years in tech\n• Led 3 successful launches',
      experience: [],
      education: [],
      skills: [],
      projects: [],
      certifications: [],
      languages: [],
      awards: [],
      customSections: [],
      sectionOrder: [],
    };

    await expect(exportResumeToDocx(dataWithBullets)).resolves.toBeUndefined();
    expect(URL.createObjectURL).toHaveBeenCalled();
  });
});
