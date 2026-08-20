import { afterEach, describe, expect, it } from 'vitest';
import {
  getLandingExampleEmbedPath,
  LANDING_EXAMPLE_FLOW_DESCRIPTION,
  LANDING_EXAMPLE_FLOW_TITLE,
  LANDING_EXAMPLE_SLUG,
  prefetchLandingExampleEmbed,
} from './exampleFlowDoc';

describe('exampleFlowDoc', () => {
  afterEach(() => {
    document.head.querySelectorAll('link[data-peacock-example-embed]').forEach((node) => node.remove());
  });

  it('exports static example slug and copy', () => {
    expect(LANDING_EXAMPLE_SLUG).toBe('kachabazar');
    expect(LANDING_EXAMPLE_FLOW_TITLE.length).toBeGreaterThan(0);
    expect(LANDING_EXAMPLE_FLOW_DESCRIPTION.length).toBeGreaterThan(0);
  });

  it('prefetches the static example document once', () => {
    const href = getLandingExampleEmbedPath();
    expect(href).toBe(`/examples/${LANDING_EXAMPLE_SLUG}`);

    prefetchLandingExampleEmbed();
    prefetchLandingExampleEmbed();

    const link = document.head.querySelector('link[data-peacock-example-embed]');
    if (!(link instanceof HTMLLinkElement)) throw new Error('expected prefetch link');
    expect(link).toHaveAttribute('rel', 'prefetch');
    expect(link).toHaveAttribute('href', `/examples/${LANDING_EXAMPLE_SLUG}/document.json`);
    expect(document.head.querySelectorAll('link[data-peacock-example-embed]')).toHaveLength(1);
  });
});
