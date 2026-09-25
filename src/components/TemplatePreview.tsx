import type { TemplateMeta } from '../templates';
import { sampleResumeData } from '../lib/sampleData';

/** Renders a template's real component at a fixed miniature scale, so the
 * landing page gallery and template detail page always match what the
 * builder actually produces — no hand-duplicated preview markup.
 * `photo` optionally adds a profile picture (image URL) to the sample data
 * for templates that support one. */
export function TemplatePreview({ template, photo }: { template: TemplateMeta; photo?: string }) {
  const { Component } = template;
  const data = photo ? { ...sampleResumeData, personal: { ...sampleResumeData.personal, photo } } : sampleResumeData;
  return (
    <div className="template-preview-scale">
      <Component data={data} />
    </div>
  );
}
