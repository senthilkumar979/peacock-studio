import { describe, expect, it } from 'vitest';
import {
  AUTOMATION_ITEMS,
  COMPARISON_ROWS,
  LANDING_CATEGORY,
  LANDING_FAQS,
  LANDING_FEATURES,
  LANDING_FEATURE_CATEGORIES,
  LANDING_TWO_FORMATS,
  WORKFLOW_STEPS,
} from './landingData';

describe('landingData', () => {
  it('exports category statement', () => {
    expect(LANDING_CATEGORY.headline).toMatch(/system of record/i);
    expect(LANDING_CATEGORY.description.length).toBeGreaterThan(20);
  });

  it('exports feature categories and features', () => {
    expect(LANDING_FEATURE_CATEGORIES.length).toBeGreaterThanOrEqual(3);
    expect(LANDING_FEATURES.length).toBeGreaterThan(0);
    expect(LANDING_TWO_FORMATS).toHaveLength(2);
  });

  it('exports workflow, comparison, faqs, and automation items', () => {
    expect(WORKFLOW_STEPS.length).toBeGreaterThan(0);
    expect(COMPARISON_ROWS.length).toBeGreaterThan(0);
    expect(LANDING_FAQS.length).toBeGreaterThan(0);
    expect(AUTOMATION_ITEMS.length).toBeGreaterThan(0);
  });
});
