import { describe, expect, it } from 'vitest';
import {
  LANDING_EXAMPLE_FLOW_DESCRIPTION,
  LANDING_EXAMPLE_FLOW_SHARE_TOKEN,
  LANDING_EXAMPLE_FLOW_TITLE,
} from './exampleFlowDoc';

describe('exampleFlowDoc', () => {
  it('exports share token and copy', () => {
    expect(LANDING_EXAMPLE_FLOW_SHARE_TOKEN.length).toBeGreaterThan(0);
    expect(LANDING_EXAMPLE_FLOW_TITLE.length).toBeGreaterThan(0);
    expect(LANDING_EXAMPLE_FLOW_DESCRIPTION.length).toBeGreaterThan(0);
  });
});
