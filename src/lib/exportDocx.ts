import type { ResumeData } from '../types/resume';
import { parseDescription } from './parseDescription';

/**
 * Dynamically import the docx library to keep it out of the main bundle.
 * Called only when the user clicks Export Word.
 */
async function getDocxModule() {
  const { Document, Packer, Paragraph, TextRun, AlignmentType, convertInchesToTwip } = await import('docx');
  return { Document, Packer, Paragraph, TextRun, AlignmentType, convertInchesToTwip };
}

export async function exportResumeToDocx(data: ResumeData): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, AlignmentType, convertInchesToTwip } = await getDocxModule();

  const p = data.personal;
  // Convert hex color to RGB decimal
  const accentHex = data.accent || '#1c2b3a';
  const accentRGB = accentHex.slice(1);
  const sections: InstanceType<typeof Paragraph>[] = [];

  // Name (large)
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: p.name || 'Your Name',
          size: 32, // 16pt in half-points
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    })
  );

  // Title
  if (p.title) {
    sections.push(
      new Paragraph({
        text: p.title,
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }

  // Contact line: email | phone | location
  const contactParts = [p.email, p.phone, p.location, p.linkedin, p.portfolio].filter(Boolean);
  if (contactParts.length > 0) {
    sections.push(
      new Paragraph({
        text: contactParts.join(' | '),
        alignment: AlignmentType.CENTER,
        spacing: { after: 300 },
      })
    );
  }

  // Professional Summary
  if (data.summary) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Professional Summary',
            bold: true,
            color: accentRGB,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );
    sections.push(
      new Paragraph({
        text: data.summary,
        spacing: { after: 200 },
      })
    );
  }

  // Work Experience
  if (data.experience.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Work Experience',
            bold: true,
            color: accentRGB,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    for (const exp of data.experience) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${exp.title || 'Job Title'} | ${exp.start}${(exp.start || exp.end) ? ' – ' : ''}${exp.end || 'Present'}`,
              bold: true,
            }),
          ],
          spacing: { after: 50 },
        })
      );
      if (exp.company || exp.location) {
        sections.push(
          new Paragraph({
            text: `${exp.company}${exp.location ? ` · ${exp.location}` : ''}`,
            spacing: { after: 100 },
          })
        );
      }
      if (exp.description) {
        const blocks = parseDescription(exp.description);
        for (const block of blocks) {
          if (block.type === 'bullets' && block.items) {
            for (const item of block.items) {
              sections.push(
                new Paragraph({
                  text: item,
                  bullet: { level: 0 },
                  spacing: { after: 50 },
                })
              );
            }
          } else if (block.type === 'paragraph' && block.text) {
            sections.push(
              new Paragraph({
                text: block.text,
                spacing: { after: 100 },
              })
            );
          }
        }
      }
      sections.push(
        new Paragraph({
          text: '',
          spacing: { after: 100 },
        })
      );
    }
  }

  // Projects
  if (data.projects.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Projects',
            bold: true,
            color: accentRGB,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    for (const proj of data.projects) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: proj.name || 'Project Name',
              bold: true,
            }),
          ],
          spacing: { after: 50 },
        })
      );
      if (proj.tech) {
        sections.push(
          new Paragraph({
            text: `Tech: ${proj.tech}`,
            spacing: { after: 100 },
          })
        );
      }
      if (proj.description) {
        const blocks = parseDescription(proj.description);
        for (const block of blocks) {
          if (block.type === 'bullets' && block.items) {
            for (const item of block.items) {
              sections.push(
                new Paragraph({
                  text: item,
                  bullet: { level: 0 },
                  spacing: { after: 50 },
                })
              );
            }
          } else if (block.type === 'paragraph' && block.text) {
            sections.push(
              new Paragraph({
                text: block.text,
                spacing: { after: 100 },
              })
            );
          }
        }
      }
      sections.push(
        new Paragraph({
          text: '',
          spacing: { after: 100 },
        })
      );
    }
  }

  // Education
  if (data.education.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Education',
            bold: true,
            color: accentRGB,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    for (const edu of data.education) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: edu.degree || 'Degree',
              bold: true,
            }),
          ],
          spacing: { after: 50 },
        })
      );
      sections.push(
        new Paragraph({
          text: `${edu.institution}${edu.location ? ` · ${edu.location}` : ''}`,
          spacing: { after: 50 },
        })
      );
      if (edu.start || edu.end) {
        sections.push(
          new Paragraph({
            text: `${edu.start || ''} – ${edu.end || 'Present'}${edu.description ? ` · ${edu.description}` : ''}`,
            spacing: { after: 100 },
          })
        );
      }
      sections.push(
        new Paragraph({
          text: '',
          spacing: { after: 100 },
        })
      );
    }
  }

  // Skills
  if (data.skills.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Skills',
            bold: true,
            color: accentRGB,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );
    sections.push(
      new Paragraph({
        text: data.skills.join(', '),
        spacing: { after: 200 },
      })
    );
  }

  // Certifications
  if (data.certifications.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Certifications',
            bold: true,
            color: accentRGB,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    for (const cert of data.certifications) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: cert.name || 'Certification Name',
              bold: true,
            }),
          ],
          spacing: { after: 50 },
        })
      );
      if (cert.org || cert.year) {
        sections.push(
          new Paragraph({
            text: `${cert.org}${cert.year ? ` · ${cert.year}` : ''}`,
            spacing: { after: 100 },
          })
        );
      }
      sections.push(
        new Paragraph({
          text: '',
          spacing: { after: 100 },
        })
      );
    }
  }

  // Awards & Achievements
  if (data.awards.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Awards & Achievements',
            bold: true,
            color: accentRGB,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    for (const award of data.awards) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: award.title || 'Award',
              bold: true,
            }),
          ],
          spacing: { after: 50 },
        })
      );
      if (award.issuer || award.year) {
        sections.push(
          new Paragraph({
            text: `${award.issuer}${award.year ? ` · ${award.year}` : ''}`,
            spacing: { after: 100 },
          })
        );
      }
      if (award.description) {
        sections.push(
          new Paragraph({
            text: award.description,
            spacing: { after: 100 },
          })
        );
      }
      sections.push(
        new Paragraph({
          text: '',
          spacing: { after: 100 },
        })
      );
    }
  }

  // Languages
  if (data.languages.length > 0) {
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Languages',
            bold: true,
            color: accentRGB,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    for (const lang of data.languages) {
      sections.push(
        new Paragraph({
          text: `${lang.lang} – ${lang.level}`,
          spacing: { after: 50 },
        })
      );
    }
  }

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.75),
              bottom: convertInchesToTwip(0.75),
              left: convertInchesToTwip(0.75),
            },
          },
        },
        children: sections,
      },
    ],
  });

  // Generate and download
  const blob = await Packer.toBlob(doc);
  const fileName = p.name ? `${p.name.replace(/\s+/g, '_')}_Resume.docx` : 'Resume.docx';
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
