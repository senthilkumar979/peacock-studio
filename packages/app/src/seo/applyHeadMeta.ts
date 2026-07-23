interface MetaTag {
  attr: 'name' | 'property';
  key: string;
  content: string;
}

export function setDocumentTitle(title: string): void {
  document.title = title;
}

export function upsertMeta(attr: 'name' | 'property', key: string, content: string): void {
  let tag = document.querySelector(`meta[${attr}="${key}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

export function upsertLink(rel: string, href: string): void {
  let link = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.rel = rel;
    document.head.appendChild(link);
  }
  link.href = href;
}

export function upsertJsonLd(id: string, data: unknown): void {
  let script = document.getElementById(id) as HTMLScriptElement | null;
  if (!script) {
    script = document.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    document.head.appendChild(script);
  }
  script.textContent = JSON.stringify(data);
}

export function removeJsonLd(id: string): void {
  document.getElementById(id)?.remove();
}

export function applyMetaTags(tags: MetaTag[]): void {
  for (const tag of tags) {
    upsertMeta(tag.attr, tag.key, tag.content);
  }
}
