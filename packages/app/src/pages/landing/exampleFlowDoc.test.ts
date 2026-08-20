import { afterEach, describe, expect, it } from 'vitest';
import {
  getLandingExampleEmbedPath,
  LANDING_EXAMPLE_FLOW_DESCRIPTION,
  LANDING_EXAMPLE_FLOW_SHARE_TOKEN,
  LANDING_EXAMPLE_FLOW_TITLE,
  prefetchLandingExampleEmbed,
} from './exampleFlowDoc';

describe('exampleFlowDoc', () => {
  afterEach(() => {
    document.head.querySelectorAll('link[data-peacock-example-embed]').forEach((node) => node.remove());
  });

  it('exports share token and copy', () => {
    expect(LANDING_EXAMPLE_FLOW_SHARE_TOKEN.length).toBeGreaterThan(0);
    expect(LANDING_EXAMPLE_FLOW_TITLE.length).toBeGreaterThan(0);
    expect(LANDING_EXAMPLE_FLOW_DESCRIPTION.length).toBeGreaterThan(0);
  });

  it('prefetches the example embed document once', () => {
    const href = getLandingExampleEmbedPath();
    expect(href).toBe(`/s/${LANDING_EXAMPLE_FLOW_SHARE_TOKEN}/embed`);

    prefetchLandingExampleEmbed();
    prefetchLandingExampleEmbed();

    const link = document.head.querySelector('link[data-peacock-example-embed]');
    if (!(link instanceof HTMLLinkElement)) throw new Error('expected prefetch link');
    expect(link).toHaveAttribute('rel', 'prefetch');
    expect(link).toHaveAttribute('href', href);
    expect(document.head.querySelectorAll('link[data-peacock-example-embed]')).toHaveLength(1);
  });
});
