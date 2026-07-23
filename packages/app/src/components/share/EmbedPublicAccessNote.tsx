/** Callout shown when publishing an embed — embeds are always publicly viewable. */
export const EmbedPublicAccessNote = () => (
  <aside
    className="rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-950"
    role="note"
  >
    <p className="font-semibold">Embeds are public</p>
    <p className="mt-1 leading-relaxed text-amber-900/90">
      Anyone who can open this embed can view the content without signing in. Treat the iframe URL
      like a public link — do not embed confidential docs unless that exposure is intended.
    </p>
  </aside>
);
