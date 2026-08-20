import { describe, expect, it } from 'vitest';
import {
  FLOW_DOCUMENT_CAPABILITY_GROUPS,
  FLOW_DOCUMENT_LIFECYCLE,
  FLOW_DOCUMENT_PAGE,
  getFlowDocumentImageSrc,
} from './flowDocumentsData';

describe('flowDocumentsData', () => {
  it('exports page copy, lifecycle, and capability groups', () => {
    expect(FLOW_DOCUMENT_PAGE.intro.length).toBeGreaterThan(20);
    expect(FLOW_DOCUMENT_LIFECYCLE.length).toBeGreaterThan(0);
    expect(FLOW_DOCUMENT_CAPABILITY_GROUPS.length).toBeGreaterThan(0);
    expect(getFlowDocumentImageSrc('hero.png')).toContain('/products/flow-documents/hero.png');
  });
});
