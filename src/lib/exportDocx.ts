import type { ResumeData } from '../types/resume';
import { parseDescription } from './parseDescription';
import { resolveSectionOrder } from './sectionOrder';

/**
 * Dynamically import the docx library to keep it out of the main bundle.
 * Called only when the user clicks Export Word.
 */
async function getDocxModule() {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } = await import('docx');
  return { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip };
}

export async function exportResumeToDocx(data: ResumeData): Promise<void> {
  const { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, convertInchesToTwip } = await getDocxModule();

  const p = data.personal;
  // Convert hex color to RGB decimal
  const accentHex = data.accent || '#1c2b3a';
  const accentRGB = accentHex.slice(1);
  const sections: InstanceType<typeof Paragraph>[] = [];
  const order = resolveSectionOrder(data);
  const customMap = new Map(data.customSections.map((c) => [c.id, c]));

  // Name (Heading1) - 40 half-points = 20pt
  sections.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [
        new TextRun({
          text: p.name || 'Your Name',
          bold: true,
          size: 40,
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

  // Render sections by order
  for (const key of order) {
    if (key === 'summary') {
      if (data.summary) {
        sections.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
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
    } else if (key === 'experience') {
      if (data.experience.length > 0) {
        sections.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
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
    } else if (key === 'education') {
      if (data.education.length > 0) {
        sections.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
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
    } else if (key === 'skills') {
      if (data.skills.length > 0) {
        sections.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
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
    } else if (key === 'projects') {
      if (data.projects.length > 0) {
        sections.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
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
    } else if (key === 'certifications') {
      if (data.certifications.length > 0) {
        sections.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
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
    } else if (key === 'languages') {
      if (data.languages.length > 0) {
        sections.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
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
    } else if (key === 'awards') {
      if (data.awards.length > 0) {
        sections.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
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
            const blocks = parseDescription(award.description);
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
    } else if (key.startsWith('custom:')) {
      const customId = key.slice(7);
      const custom = customMap.get(customId);
      if (!custom) continue;
      const hasContent = custom.title || custom.items.some((item) => item.heading || item.description);
      if (!hasContent) continue;

      if (custom.title) {
        sections.push(
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            children: [
              new TextRun({
                text: custom.title,
                bold: true,
                color: accentRGB,
              }),
            ],
            spacing: { before: 200, after: 100 },
          })
        );
      }

      for (const item of custom.items) {
        if (item.heading) {
          sections.push(
            new Paragraph({
              children: [
                new TextRun({
                  text: item.heading,
                  bold: true,
                }),
              ],
              spacing: { after: 50 },
            })
          );
        }
        if (item.subheading || item.date) {
          sections.push(
            new Paragraph({
              text: `${item.subheading}${item.date ? ` · ${item.date}` : ''}`,
              spacing: { after: 100 },
            })
          );
        }
        if (item.description) {
          const blocks = parseDescription(item.description);
          for (const block of blocks) {
            if (block.type === 'bullets' && block.items) {
              for (const bulletItem of block.items) {
                sections.push(
                  new Paragraph({
                    text: bulletItem,
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
  }

  // Create document with paragraph styles
  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: 'Calibri',
            size: 40, // 20pt in half-points
            bold: true,
            color: accentRGB,
          },
          paragraph: {
            spacing: { line: 240, lineRule: 'auto' },
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            font: 'Calibri',
            size: 24, // 12pt in half-points
            bold: true,
            color: accentRGB,
          },
          paragraph: {
            spacing: { line: 240, lineRule: 'auto' },
          },
        },
      ],
    },
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
