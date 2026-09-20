import type { TemplateMeta } from '../templates';
import { sampleResumeData } from '../lib/sampleData';

/** Renders a template's real component at a fixed miniature scale, so the
 * landing page gallery and template detail page always match what the
 * builder actually produces — no hand-duplicated preview markup. */
export function TemplatePreview({ template }: { template: TemplateMeta }) {
  const { Component } = template;
  return (
    <div className="template-preview-scale">
      <Component data={sampleResumeData} />
    </div>
  );
}
