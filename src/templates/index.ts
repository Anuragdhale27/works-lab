import type { ComponentType } from 'react';
import type { ResumeData, TemplateKey } from '../types/resume';
import { ModernTemplate } from './ModernTemplate';
import { ClassicTemplate } from './ClassicTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { ExecutiveTemplate } from './ExecutiveTemplate';
import { SidebarTemplate } from './SidebarTemplate';
import { SplitTemplate } from './SplitTemplate';
import { TEMPLATE_META_REGISTRY } from './meta';

export interface TemplateMeta {
  key: TemplateKey;
  name: string;
  best: string;
  color: string;
  description: string;
  Component: ComponentType<{ data: ResumeData }>;
}

// Single source of truth for the 6 resume templates: the builder's live
// preview, the landing page's template gallery, and the template detail
// page all render from this registry instead of hand-duplicated markup.
export const TEMPLATES: Record<TemplateKey, TemplateMeta> = {
  modern: {
    ...TEMPLATE_META_REGISTRY.modern,
    Component: ModernTemplate,
  },
  classic: {
    ...TEMPLATE_META_REGISTRY.classic,
    Component: ClassicTemplate,
  },
  minimal: {
    ...TEMPLATE_META_REGISTRY.minimal,
    Component: MinimalTemplate,
  },
  executive: {
    ...TEMPLATE_META_REGISTRY.executive,
    Component: ExecutiveTemplate,
  },
  sidebar: {
    ...TEMPLATE_META_REGISTRY.sidebar,
    Component: SidebarTemplate,
  },
  split: {
    ...TEMPLATE_META_REGISTRY.split,
    Component: SplitTemplate,
  },
} as Record<TemplateKey, TemplateMeta>;

export const TEMPLATE_KEYS = Object.keys(TEMPLATES) as TemplateKey[];

export function isTemplateKey(key: string | undefined): key is TemplateKey {
  return !!key && key in TEMPLATES;
}
