# Peacock Beta Launch Enhancement Plan

## Implementation status (branch `cursor/beta-enhancements-378a`)

All planned items are implemented and validated (monorepo typecheck, 38 shared tests, and app production build all pass):

- Data classification (public/internal/sensitive/secret) + expanded sensitive-field detection in `@peacock/shared`; extension stores classification-aware values (no secret/sensitive leaks).
- Enhanced step transcriptions: broader context hints and human-readable navigation copy.
- Observability: PostHog sink (consent-gated), Sentry init, Tawk.to support widget (hidden on public share routes).
- Analytics: `analytics_events` migration with RLS + security-definer RPCs (`record_share_event`, `record_org_event`, `get_org_analytics_summary`); repository + referrer/UTM capture; PDF-export and share-link-created events.
- Dashboard engagement analytics: summary cards + lazy-loaded Recharts (area + bar).
- Marketing: `/pricing` beta page (blurred tier preview, early-adopter promise, founding-user capture) and a modernized `SiteNav` (mobile drawer, active indicator) + `LibraryNav` Support button.

Notable deviations from the original draft: local storage uses `idb` (not Dexie); helpdesk chosen is Tawk.to (free, unlimited agents); GA/Hotjar/DataDog intentionally skipped in favor of PostHog + Sentry; analytics aggregation runs server-side via an RPC rather than a materialized view. Env vars are documented in `packages/app/.env.example`.

## 1. Navigation Redesign

### Current State
Three separate nav systems:
- **SiteNav** (`packages/app/src/components/site/SiteNav.tsx`) - Marketing header with Products/Solutions dropdowns
- **LibraryNav** (`packages/app/src/components/library/LibraryNav.tsx`) - Dashboard header with 6 nav items
- **AppHeader** (`packages/app/src/components/AppHeader.tsx`) - In-app context header

### Redesign Approach

**SiteNav improvements:**
- Add glass-morphism effects with better backdrop blur
- Implement smooth transitions for dropdown menus
- Add subtle hover states with modern scaling/shadow effects
- Include "Pricing" link in main nav
- Improve mobile responsiveness with slide-out drawer

**LibraryNav improvements:**
- Convert to card-based nav with icon emphasis
- Add notification badges for new features
- Implement active route indicators with animated underlines
- Add quick actions dropdown (New Tour, New Doc, etc.)
- Include user avatar/profile with Clerk integration

**Design principles:**
- Use Lexend font consistently
- Peacock brand colors with better contrast ratios
- Micro-interactions using Framer Motion
- Accessible keyboard navigation (ARIA attributes)

## 2. Pricing & Beta Page

### New Route
Add `PRICING_PATH = '/pricing'` to `packages/app/src/constants/routes.ts`

### Page Structure (`packages/app/src/pages/Pricing.tsx`)

**Hero section:**
- "Experience Peacock Beta - Free for Early Adopters"
- Beta badge with animated glow
- Subheading explaining current beta status

**Beta announcement:**
- "We're in beta and inviting users to experience Peacock at no cost"
- Transparent messaging about future pricing transition
- Early adopter benefits card highlighting exclusive pricing promise

**Future pricing preview:**
- Three-tier ghost pricing table (Personal/Team/Enterprise)
- Marked as "Coming Soon" with blur effect
- Feature comparison table showing what's planned

**Early adopter commitment:**
- Dedicated section: "Our Promise to Early Adopters"
- Guarantee of individual contact before pricing begins
- Commitment to offer discounted annual rates (below standard pricing)
- Badge/status for founding users
- Email collection form for pricing notifications

**Beta feedback CTA:**
- Link to support/feedback system
- Emphasize that feedback shapes the product

## 3. Analytics & Tracking Infrastructure

### Current State
Analytics seam exists but is unused:
- Console-only sink (`packages/app/src/analytics/consoleSink.ts`)
- Consent-gated client (`packages/app/src/analytics/analyticsClient.ts`)
- No product event tracking
- No share/export/embed view metrics

### Implementation

#### 3.1 Analytics Events Schema

Create `packages/shared/src/types/analytics.ts`:
```typescript
interface AnalyticsEvent {
  // Core events
  'document_created' | 'document_shared' | 'document_viewed' |
  'tour_created' | 'tour_viewed' | 'tour_completed' |
  'pdf_exported' | 'embed_viewed' |
  'share_link_created' | 'share_link_accessed' |
  // User journey
  'user_signup' | 'user_onboard_complete' |
  'extension_installed' | 'first_recording_started'
}
```

#### 3.2 Share View Tracking

**Database schema** (new migration `supabase/migrations/20260722000000_analytics_events.sql`):
```sql
CREATE TABLE analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id),
  event_type text NOT NULL,
  resource_type text,
  resource_id uuid,
  share_token text,
  referrer_domain text,
  user_agent text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX idx_analytics_org_type ON analytics_events(organization_id, event_type);
CREATE INDEX idx_analytics_share_token ON analytics_events(share_token);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);
```

**Repository** (`packages/app/src/cloud/repositories/analyticsRepository.ts`):
- `trackEvent(event)` - Insert analytics event
- `getDocumentAnalytics(docId)` - Aggregate views/shares for a document
- `getOrganizationAnalytics(orgId, dateRange)` - Dashboard stats
- `getReferrerDomains(orgId)` - Top referrer domains

**Capture points:**
- `usePublicShare` hook - Track on share link resolution
- `PublicSharePage` - Track page view with referrer
- PDF export functions - Track download events
- Embed widget (future) - Track embed impressions

#### 3.3 Referrer Domain Tracking

**Capture logic:**
```typescript
// Extract referrer on share/embed views
const referrerDomain = document.referrer 
  ? new URL(document.referrer).hostname 
  : 'direct';
```

**Storage:**
- Include in `analytics_events.referrer_domain`
- Track `utm_*` query params in `metadata` jsonb
- Aggregate for marketing insights

#### 3.4 Dashboard Analytics Cards

**Update** `packages/app/src/pages/Dashboard.tsx`:

Add new stat cards:
- **Total Views** - Aggregated document/tour views
- **Shares Active** - Count of non-expired share links
- **PDF Exports** - Total export count
- **Avg. Views/Doc** - Engagement metric
- **Top Referrers** - List of domains driving traffic

**Charts to add** (use new chart library - recommend **Recharts**):
- Line chart: Views over time (7d/30d/90d)
- Bar chart: Views by document type (docs/tours/test cases)
- Pie chart: Traffic sources (Direct/Referral/Social)
- Bar chart: Top 5 referrer domains

**New component:** `packages/app/src/components/analytics/AnalyticsCharts.tsx`

Install: `pnpm add recharts` (React-friendly, TypeScript support, tree-shakeable)

## 4. Observability & Monitoring Tools

### Recommended Stack

**PostHog** (replaces GA + Hotjar + analytics):
- Session replay
- Heatmaps
- Product analytics
- Feature flags
- Free up to 1M events/month

**Sentry** (error tracking):
- JavaScript error monitoring
- Performance monitoring
- Release tracking
- Breadcrumb trails
- Free up to 5K events/month

**Skip:**
- Google Analytics (PostHog covers it)
- Hotjar (PostHog has session replay)
- DataDog (expensive; PostHog has performance monitoring)

### Implementation

#### 4.1 PostHog Integration

**Install:**
```bash
pnpm add posthog-js --filter @peacock/app
```

**Setup** (`packages/app/src/analytics/posthogSink.ts`):
```typescript
export class PostHogSink implements AnalyticsSink {
  init() {
    if (!import.meta.env.VITE_POSTHOG_KEY) return;
    posthog.init(import.meta.env.VITE_POSTHOG_KEY, {
      api_host: 'https://app.posthog.com',
      capture_pageview: false, // Manual via router
      session_recording: { recordCrossOriginIframes: true }
    });
  }
  
  trackEvent(name: string, properties?: Record<string, any>) {
    posthog.capture(name, properties);
  }
}
```

**Environment variables** (add to `.env.example`):
```
VITE_POSTHOG_KEY=phc_xxxxxxxxxxxxx
VITE_SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
```

**Wire up in** `AnalyticsTracker.tsx`:
- Swap `ConsoleSink` for `PostHogSink` in production
- Identify users when Clerk auth is active
- Enable session recordings on consent

#### 4.2 Sentry Integration

**Install:**
```bash
pnpm add @sentry/react @sentry/vite-plugin --filter @peacock/app
```

**Setup** (`packages/app/src/utils/sentry.ts`):
```typescript
import * as Sentry from "@sentry/react";

export function initSentry() {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration()
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
    environment: import.meta.env.MODE,
  });
}
```

**React Error Boundary:**
```typescript
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</Sentry.ErrorBoundary>
```

**Vite plugin** (for source maps):
Update `packages/app/vite.config.ts` to include Sentry plugin

## 5. Helpdesk/Support Integration

### Recommended: Tawk.to

**Why Tawk.to:**
- **100% free forever** - Unlimited agents, unlimited chats
- No feature caps or pricing cliffs
- Built-in knowledge base
- Mobile apps for support team
- 98% customer satisfaction rating
- 6M+ businesses use it

**Alternative:** Crisp (free for 2 agents, better UI) if you prefer modern interface

### Implementation

**Installation:**
Add widget script to `packages/app/index.html`:
```html
<script type="text/javascript">
var Tawk_API=Tawk_API||{}, Tawk_LoadStart=new Date();
(function(){
var s1=document.createElement("script"),s0=document.getElementsByTagName("script")[0];
s1.async=true;
s1.src='https://embed.tawk.to/YOUR_PROPERTY_ID/YOUR_WIDGET_ID';
s1.charset='UTF-8';
s1.setAttribute('crossorigin','*');
s0.parentNode.insertBefore(s1,s0);
})();
</script>
```

**User context integration:**
```typescript
// In authenticated app, pass user info to Tawk
if (window.Tawk_API && user) {
  window.Tawk_API.setAttributes({
    name: user.fullName,
    email: user.emailAddress,
    hash: user.id // For secure mode
  });
}
```

**Visibility rules:**
- Hide on public share pages
- Show on dashboard, library, and builder pages
- Prominent "Support" button in LibraryNav

**Knowledge base:**
- Create help articles for common flows
- Link from empty states and onboarding

## 6. Enhanced Step Transcriptions

### Current System
Deterministic template-based generation in `packages/shared/src/utils/stepDescription.ts`:
- `resolveStepLabels` extracts target/field/value from `ElementSnapshot`
- Fixed templates per control kind (button/link/input/select/etc.)
- Uses only: `innerText`, labels, placeholder, name/id, parent/grandparent context
- `data-country` is the only context hint captured

### Enhancement Approach

**Phase 1: Richer Context (No AI - Quick Win)**

**Expand label resolution** in `stepDescriptionLabels.ts`:
- Use `dataAttributes` more broadly (not just `data-country`)
- Include form name/legend if element is in `<form>`
- Check `aria-description` and `title` attributes
- Look at sibling elements for additional context
- Use `classList` to infer purpose (e.g., `.submit-btn`, `.cancel-link`)

**Better templates** in `stepDescription.ts`:
- Include page title in navigation descriptions
- Add form context to submit buttons ("Submit the payment form")
- Infer action from data attributes (data-action="save" → "Save changes")
- Use more semantic verbs based on button classes

**Examples:**
- Current: "Click Save"
- Enhanced: "Click Save to save the payment details form"

- Current: "Enter john@example.com in Email"
- Enhanced: "Enter your email address in the Email field on the Sign up form"

**Phase 2: AI-Enhanced Transcription (Future)**

*Note: This can be added later when budget allows*

- Keep deterministic labels as structured input
- Send to OpenAI/Anthropic API for natural language rewrite
- Store in new field: `aiGeneratedDescription`
- Fallback to template-based description if API fails
- Add settings toggle: "Use AI-enhanced descriptions"

## 7. Sensitive Input Masking & Data Classification

### Current State
Sensitive field detection exists (`packages/shared/src/utils/masking.ts`):
- Checks `type="password"`
- Pattern matches: ssn, cvv, cvc, pin, secret, token, credit card
- `ENABLE_VALUE_MASKING = false` (values stored in full)
- Sensitive fields skip recording entirely

### Enhanced Implementation

#### 7.1 Expand Sensitive Field Patterns

**Update** `masking.ts`:
```typescript
const SENSITIVE_PATTERNS = {
  password: /password|pwd|passwd/i,
  token: /token|api.?key|secret.?key|bearer/i,
  financial: /ssn|cvv|cvc|pin|credit.?card|iban|routing.?number|account.?number/i,
  personal: /passport|license|tax.?id|national.?id/i,
  auth: /authorization|auth.?token|session.?id/i,
  security: /otp|mfa|2fa|security.?code|verification.?code/i
};

const SENSITIVE_TYPES = [
  'password', 'hidden', // Input types
];

const SENSITIVE_AUTOCOMPLETE = [
  'current-password', 'new-password', 
  'cc-number', 'cc-csc', 'cc-exp',
];
```

#### 7.2 Data Classification System

**New types** (`packages/shared/src/types/dataClassification.ts`):
```typescript
export type DataClassification = 
  | 'public'      // Safe to display
  | 'internal'    // Org-only, not public
  | 'sensitive'   // Mask in UI
  | 'secret';     // Never display

export interface ClassifiedField {
  selector: string;
  classification: DataClassification;
  reason: string; // Auto-detected reason
  maskedValue?: string;
}
```

**Classification logic** (`packages/shared/src/utils/classifyField.ts`):
```typescript
export function classifyField(element: ElementSnapshot): DataClassification {
  // Check if field matches sensitive patterns
  if (isSensitiveField(element)) return 'secret';
  
  // Financial fields
  if (matchesPattern(element, SENSITIVE_PATTERNS.financial)) return 'secret';
  
  // Auth tokens
  if (matchesPattern(element, SENSITIVE_PATTERNS.auth)) return 'secret';
  
  // Personal identifiable info
  if (matchesPattern(element, SENSITIVE_PATTERNS.personal)) return 'sensitive';
  
  // Email, phone (visible but sensitive)
  if (element.type === 'email' || element.type === 'tel') return 'sensitive';
  
  // Default: public
  return 'public';
}
```

#### 7.3 Masking Strategy

**By classification level:**
- **Secret**: Never capture value, show as `••••••••` in UI/exports
- **Sensitive**: Capture but mask display as `abc***` (first 3 chars)
- **Internal**: Capture full value, only show to authenticated org members
- **Public**: Show in full everywhere

**Update** `ElementSnapshot`:
```typescript
export interface ElementSnapshot {
  // ... existing fields
  valuePreview: string | null;
  classification: DataClassification;
  maskedValue?: string; // Pre-computed masked version
}
```

**Apply in capture** (`packages/extension/src/content/index.ts`):
```typescript
const snapshot = extractElementSnapshot(target);
snapshot.classification = classifyField(snapshot);

if (snapshot.classification === 'secret') {
  snapshot.valuePreview = null;
  snapshot.maskedValue = '••••••••';
} else if (snapshot.classification === 'sensitive') {
  snapshot.maskedValue = maskValue(snapshot.valuePreview);
}
```

**Display logic** (UI components):
```typescript
function displayValue(step: FlowStep): string {
  const classification = step.element?.classification;
  
  if (classification === 'secret') {
    return '••••••••';
  }
  
  if (classification === 'sensitive') {
    return step.element?.maskedValue ?? 'hidden';
  }
  
  return step.element?.valuePreview ?? '';
}
```

#### 7.4 User Override (Future Enhancement)

Allow users to manually reclassify fields:
- Settings panel in editor
- "Mark as sensitive" / "Mark as public" per step
- Persists in `FlowStep` metadata

#### 7.5 Extension Options Page

Add settings in extension:
- Toggle: "Pause recording on sensitive pages" (already exists)
- Toggle: "Mask all input values" (global masking)
- Custom patterns: User-defined sensitive field patterns
- Whitelist: Domains that never record

## 8. Implementation Phases

### Phase 1: Foundation (Week 1-2)
1. Install observability tools (PostHog, Sentry, Tawk.to)
2. Create analytics database schema and repositories
3. Set up referrer tracking on share views
4. Expand sensitive field patterns and data classification

### Phase 2: UI/UX (Week 2-3)
1. Redesign SiteNav and LibraryNav
2. Create Pricing/Beta page
3. Build analytics dashboard cards
4. Integrate Recharts for visualizations

### Phase 3: Enhancement (Week 3-4)
1. Improve step transcription templates with richer context
2. Implement data classification masking in UI
3. Add Tawk.to support widget with user context
4. Wire up analytics events throughout app

### Phase 4: Testing & Polish (Week 4-5)
1. Test all analytics tracking end-to-end
2. Verify sensitive data masking in all export formats
3. Load test referrer tracking and analytics writes
4. Polish navbar transitions and micro-interactions
5. User acceptance testing of pricing page messaging

## 9. Technical Dependencies

### New Packages
```json
{
  "dependencies": {
    "posthog-js": "^1.100.0",
    "@sentry/react": "^8.0.0",
    "recharts": "^2.13.0"
  },
  "devDependencies": {
    "@sentry/vite-plugin": "^2.20.0"
  }
}
```

### Environment Variables
```
# Analytics
VITE_POSTHOG_KEY=
VITE_POSTHOG_HOST=https://app.posthog.com

# Error tracking
VITE_SENTRY_DSN=
VITE_SENTRY_AUTH_TOKEN= # For source maps

# Support (Tawk.to)
VITE_TAWK_PROPERTY_ID=
VITE_TAWK_WIDGET_ID=
```

### Database Migrations
- `20260722000000_analytics_events.sql` - Analytics events table
- `20260723000000_analytics_aggregates.sql` - Materialized views for dashboards

## 10. Success Metrics

### Analytics Coverage
- [ ] 100% of share link views tracked
- [ ] PDF export events captured
- [ ] Referrer domains logged for all external traffic
- [ ] User journey events (signup → first recording)

### Data Protection
- [ ] Zero sensitive values in step descriptions/exports
- [ ] All password/token fields properly classified as 'secret'
- [ ] Type-safe data classification across extension → app

### User Experience
- [ ] Navigation redesign A/B tested (bounce rate improvement)
- [ ] Pricing page clarity validated (beta messaging clear to 90%+ users)
- [ ] Support response time < 2 hours (Tawk.to integration)

### Observability
- [ ] Error rate < 1% (Sentry tracking)
- [ ] Session replay enabled for error debugging
- [ ] Performance monitoring showing LCP < 2.5s

## Files to Create/Modify

### New Files
- `packages/app/src/pages/Pricing.tsx`
- `packages/app/src/components/analytics/AnalyticsCharts.tsx`
- `packages/app/src/analytics/posthogSink.ts`
- `packages/app/src/utils/sentry.ts`
- `packages/app/src/cloud/repositories/analyticsRepository.ts`
- `packages/shared/src/types/dataClassification.ts`
- `packages/shared/src/types/analytics.ts`
- `packages/shared/src/utils/classifyField.ts`
- `supabase/migrations/20260722000000_analytics_events.sql`

### Modified Files
- `packages/app/src/constants/routes.ts` - Add pricing route
- `packages/app/src/App.tsx` - Add pricing route, Sentry wrapper
- `packages/app/src/components/site/SiteNav.tsx` - Redesign
- `packages/app/src/components/library/LibraryNav.tsx` - Redesign
- `packages/app/src/pages/Dashboard.tsx` - Add analytics cards
- `packages/shared/src/utils/masking.ts` - Expand patterns
- `packages/shared/src/utils/stepDescription.ts` - Enhanced templates
- `packages/shared/src/utils/stepDescriptionLabels.ts` - Richer context
- `packages/shared/src/types/events.ts` - Add classification field
- `packages/extension/src/content/index.ts` - Apply classification
- `packages/app/vite.config.ts` - Add Sentry plugin
- `packages/app/index.html` - Add Tawk.to widget
- `.env.example` - Add new environment variables
