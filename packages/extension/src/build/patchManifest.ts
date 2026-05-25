interface ManifestContentScript {
  matches?: string[];
  exclude_matches?: string[];
  js: string[];
  run_at: string;
}

interface ManifestJson {
  content_scripts: ManifestContentScript[];
  externally_connectable: { matches: string[] };
}

const DEFAULT_LOCAL_PATTERNS = [
  'http://localhost:5173/*',
  'http://127.0.0.1:5173/*',
];

function addUniquePattern(list: string[], pattern: string): void {
  if (!list.includes(pattern)) list.push(pattern);
}

export function patchManifestForAppUrl(
  manifest: ManifestJson,
  appUrl: string | undefined
): ManifestJson {
  const next = structuredClone(manifest);

  let origin: string | null = null;
  if (appUrl?.trim()) {
    try {
      origin = new URL(appUrl.trim()).origin;
    } catch {
      origin = null;
    }
  }

  const appPatterns = [...DEFAULT_LOCAL_PATTERNS];
  if (origin && !DEFAULT_LOCAL_PATTERNS.some((entry) => entry.startsWith(origin!))) {
    appPatterns.push(`${origin}/*`);
  }

  const recorder = next.content_scripts[0];
  const bridge = next.content_scripts[1];

  if (recorder?.exclude_matches) {
    for (const pattern of appPatterns) addUniquePattern(recorder.exclude_matches, pattern);
  }

  if (bridge?.matches) {
    for (const pattern of appPatterns) addUniquePattern(bridge.matches, pattern);
  }

  for (const pattern of appPatterns) {
    addUniquePattern(next.externally_connectable.matches, pattern);
  }

  return next;
}

export function patchManifestFileContents(
  rawManifest: string,
  appUrl: string | undefined
): string {
  const manifest = JSON.parse(rawManifest) as ManifestJson;
  return `${JSON.stringify(patchManifestForAppUrl(manifest, appUrl), null, 2)}\n`;
}
