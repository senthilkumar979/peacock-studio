# Static landing example: KachaBazar

Served as same-origin assets so corporate networks that block Supabase/Clerk still see the demo.

| File | Role |
|------|------|
| `document.json` | `SavedFlowDocument` with `screenshotUrls` pointing at `/examples/kachabazar/shots/…` |
| `shots/*.png` | Step screenshots |

Landing iframe: `/examples/kachabazar` → `StaticExamplePlayerPage` (no `resolve-share`).

To refresh from the live cloud share, re-export via resolve-share `flow` + `screenshots`, download images with a browser User-Agent, rewrite URLs to `/examples/kachabazar/shots/<id>.png`, and overwrite these files.
