import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  Bug,
  ClipboardList,
  Code2,
  GraduationCap,
  Headphones,
  HeartHandshake,
  Layers3,
  Presentation,
  Shield,
} from 'lucide-react';

export interface SolutionBenefit {
  title: string;
  description: string;
}

export interface SolutionUseCase {
  title: string;
  description: string;
}

export interface SolutionOutcome {
  label: string;
  value: string;
}

export interface SolutionChallenge {
  title: string;
  description: string;
}

export interface SolutionRole {
  slug: string;
  title: string;
  shortTitle: string;
  tagline: string;
  summary: string;
  whoTheyAre: string;
  bestFitWhen: string[];
  primaryChallenges: SolutionChallenge[];
  flowDocuments: {
    headline: string;
    description: string;
    benefits: SolutionBenefit[];
  };
  productTours: {
    headline: string;
    description: string;
    benefits: SolutionBenefit[];
  };
  whyPeacock: {
    headline: string;
    differentiators: SolutionBenefit[];
  };
  useCases: SolutionUseCase[];
  businessOutcomes: SolutionOutcome[];
  icon: LucideIcon;
  accentGradient: string;
  iconBg: string;
}

export const PEACOCK_CATEGORY_STATEMENT = {
  headline: 'The system of record for how work actually happens.',
  description:
    'Peacock transforms real workflows into reusable execution guides and narrative experiences, helping teams align faster, enable others consistently, and preserve operational knowledge as products evolve.',
} as const;

export const SOLUTION_ROLES: SolutionRole[] = [
  {
    slug: 'developers',
    title: 'Developers & Engineers',
    shortTitle: 'Developers',
    tagline: 'Hand off working software — without becoming the documentation layer.',
    summary:
      'Peacock captures how internal tools and features actually work — structured flow docs for handoff, tours for the broader story your org needs.',
    whoTheyAre:
      'Engineers ship continuously and absorb interruption from QA, support, and product. They need to transfer working software without becoming the living documentation layer.',
    bestFitWhen: [
      'Engineers repeat the same walkthroughs every sprint',
      'Internal tools change faster than written guides stay current',
      'QA and support rely on tribal knowledge instead of authoritative references',
    ],
    primaryChallenges: [
      {
        title: 'You are the handoff',
        description:
          'Every release triggers screen shares and Slack threads. Without a durable artifact, engineering stays on the critical path for questions others should self-serve.',
      },
      {
        title: 'Internal surfaces stay invisible',
        description:
          'Admin consoles, flags, and ops workflows never get the documentation investment customer features receive. Knowledge compounds in individuals, not the org.',
      },
      {
        title: 'Manual docs decay on contact',
        description:
          'Screenshot-based guides mislead after the first UI tweak. Teams stop trusting docs or burn cycles maintaining assets nobody owns.',
      },
    ],
    flowDocuments: {
      headline: 'The execution reference for engineering handoff',
      description:
        'Record while building or verifying. Each capture becomes a step-indexed, branch-aware doc — the operational artifact QA runs against and support follows on tickets.',
      benefits: [
        {
          title: 'Capture from any environment',
          description: 'Document staging, local, or internal consoles during normal work — not a separate documentation sprint.',
        },
        {
          title: 'One doc, multiple paths',
          description: 'Model admin, member, and edge-case flows without maintaining parallel copies.',
        },
        {
          title: 'Hand off with a link',
          description: 'Replace the next calendar invite with a readonly player your org can trust.',
        },
      ],
    },
    productTours: {
      headline: 'The narrative layer for platform and release communication',
      description:
        'Chain flow docs into guided journeys — how the platform fits together, what shipped this quarter, how a new engineer should orient.',
      benefits: [
        {
          title: 'Tell the platform story once',
          description: 'Group deploy, rollback, and observability flows into a coherent internal narrative.',
        },
        {
          title: 'Frame by audience',
          description: 'On-call engineer, platform admin, or new hire — open with context before depth.',
        },
        {
          title: 'Platform narrative stays current',
          description: 'Update a linked capture; every tour referencing it reflects the latest behavior.',
        },
      ],
    },
    whyPeacock: {
      headline: 'How your software actually works — preserved as teams change it',
      differentiators: [
        {
          title: 'Workflows captured, not written up',
          description:
            'Peacock records what happens in the browser. Engineering hands downstream teams structured steps tied to the live product.',
        },
        {
          title: 'Built for change, not archival',
          description:
            'When UI shifts, update the affected capture. Links and tour references stay valid.',
        },
        {
          title: 'One source downstream teams execute against',
          description:
            'QA, support, and PM pull from the same truth instead of reconstructing it from memory.',
        },
      ],
    },
    useCases: [
      {
        title: 'Sprint handoff to QA',
        description: 'Branching flow doc with happy path and validation scenarios attached to the release.',
      },
      {
        title: 'Internal platform orientation',
        description: 'Tour connecting DevOps, admin, and troubleshooting workflows for new engineers.',
      },
      {
        title: 'Changelog with proof',
        description: 'Readonly flow docs linked from release notes so stakeholders see what changed.',
      },
    ],
    businessOutcomes: [
      { label: 'Engineering leverage', value: 'Fewer repeat walkthroughs' },
      { label: 'Cross-team clarity', value: 'One authoritative handoff artifact' },
      { label: 'Documentation trust', value: 'References that match the product' },
    ],
    icon: Code2,
    accentGradient: 'from-sky-500 to-blue-700',
    iconBg: 'bg-sky-500/10 text-sky-700',
  },
  {
    slug: 'testers',
    title: 'QA & Test Engineers',
    shortTitle: 'Testers',
    tagline: 'Make release decisions with evidence the business can read.',
    summary:
      'Peacock turns live product behavior into visual validation assets — execution-grade scenarios for QA, business-readable journeys for UAT and regression review.',
    whoTheyAre:
      'QA owns quality evidence and coordinates sign-off across engineering and the business. They need scenarios grounded in what users see — not abstract scripts that diverge from the build under test.',
    bestFitWhen: [
      'Business stakeholders struggle to validate releases from text-only test cases',
      'Regression scope is debated without a visual reference everyone trusts',
      'Test documentation falls behind UI changes every release',
    ],
    primaryChallenges: [
      {
        title: 'Scripts and screens diverge',
        description:
          'Written cases describe controls that moved or renamed. Testers reconcile documentation instead of exercising risk.',
      },
      {
        title: 'UAT defaults to live demos',
        description:
          'Business reviewers cannot self-validate from dense step lists. Sign-off waits on calendars, not evidence.',
      },
      {
        title: 'Regression scope is invisible',
        description:
          'Spreadsheets of case IDs do not show leadership what user impact is actually covered before go-live.',
      },
    ],
    flowDocuments: {
      headline: 'Visual scenarios your team executes against',
      description:
        'Each capture becomes a screenshot-driven scenario with editable steps — the reference testers run and attach to formal validation packages.',
      benefits: [
        {
          title: 'Business-readable validation steps',
          description: 'Sponsors see the exact screen at each decision point — not tester shorthand.',
        },
        {
          title: 'Branching without duplication',
          description: 'Role-based and error paths live in one scenario instead of fragmented copies.',
        },
        {
          title: 'Before-and-after confidence',
          description: 'Compare captures across builds to confirm UI changes landed as expected.',
        },
      ],
    },
    productTours: {
      headline: 'Regression narratives business stakeholders review independently',
      description:
        'Bundle priority journeys into a structured release story — scope, sequence, and expected behavior in one approval-ready experience.',
      benefits: [
        {
          title: 'Release scope everyone can see',
          description: 'Auth, core flows, and integrations presented as a coherent validation story.',
        },
        {
          title: 'Stakeholder sign-off without calendar dependency',
          description: 'Business owners validate expected behavior async and arrive at approval prepared.',
        },
        {
          title: 'Targeted review under release debate',
          description: 'Sponsors revisit the exact workflow in question — not an entire regression session.',
        },
      ],
    },
    whyPeacock: {
      headline: 'QA as the strategic owner of release confidence',
      differentiators: [
        {
          title: 'Evidence from the application under test',
          description:
            'Peacock captures behavior directly from the product under test — not abstract descriptions written after the fact.',
        },
        {
          title: 'Structured validation, not a recording graveyard',
          description:
            'Steps are indexed, editable, and exportable. Formal packages attach to release governance.',
        },
        {
          title: 'A language both engineering and the business share',
          description:
            'Visual scenarios bridge QA precision and sponsor comprehension — reducing sign-off friction.',
        },
      ],
    },
    useCases: [
      {
        title: 'Pre-release regression review',
        description: 'Tour of priority user journeys shared with release managers and business owners.',
      },
      {
        title: 'Defect reproduction package',
        description: 'Exact step sequence attached to the ticket — no ambiguity about reproduction.',
      },
      {
        title: 'Exploratory session capture',
        description: 'Record discovered paths during exploration; formalize into scenarios later.',
      },
    ],
    businessOutcomes: [
      { label: 'Release confidence', value: 'Greater certainty before go-live' },
      { label: 'Stakeholder alignment', value: 'Faster cross-functional sign-off' },
      { label: 'Validation integrity', value: 'Scenarios aligned to live UI' },
    ],
    icon: Bug,
    accentGradient: 'from-violet-500 to-purple-700',
    iconBg: 'bg-violet-500/10 text-violet-700',
  },
  {
    slug: 'product-owners',
    title: 'Product Owners & Product Managers',
    shortTitle: 'Product Owners',
    tagline: 'Ship capability and the story that sells it — together.',
    summary:
      'Capture accepted workflows as execution references for GTM, then compose release narratives that connect features to customer outcomes.',
    whoTheyAre:
      'PMs translate problems into shipped value and carry that message to sales, CS, support, and leadership. The product moves weekly; launch materials rarely keep pace.',
    bestFitWhen: [
      'Every launch spawns decks, videos, and docs with no single source of truth',
      'Sales, CS, and support each need a different angle on the same release',
      'Leadership asks how features connect — not just what shipped',
    ],
    primaryChallenges: [
      {
        title: 'No canonical launch artifact',
        description:
          'Enablement hunts across Slack, decks, and recordings for what actually shipped and why it matters.',
      },
      {
        title: 'GTM angles multiply your workload',
        description:
          'The same release becomes three narratives rebuilt manually for different audiences.',
      },
      {
        title: 'Features without a through-line',
        description:
          'Isolated demos fail to show how capabilities compose into the customer outcome executives fund.',
      },
    ],
    flowDocuments: {
      headline: 'Acceptance-grade execution references',
      description:
        'Record each closed story on staging — one flow doc per journey. Support and CS execute against these post-launch; they are how work actually happens in the product.',
      benefits: [
        {
          title: 'Done criteria with proof',
          description: 'Acceptance backed by real product behavior, not slide approximations.',
        },
        {
          title: 'Complex flows, readable structure',
          description: 'Section long journeys so GTM teams can follow without engineering present.',
        },
        {
          title: 'Leadership review before announcement',
          description: 'Share readonly links async — arrive at launch aligned, not surprised.',
        },
      ],
    },
    productTours: {
      headline: 'Release narratives that connect investment to outcome',
      description:
        'Sequence flow docs into a story about who benefits, what changed, and how capabilities fit together — built for enablement, all-hands, and partner updates.',
      benefits: [
        {
          title: 'Context before capability depth',
          description: 'Open with the buyer or user role so feature detail lands with purpose.',
        },
        {
          title: 'Iterate privately, publish when ready',
          description: 'Draft tours until messaging is right; mark live when GTM is equipped.',
        },
        {
          title: 'One voice across GTM at launch',
          description: 'Sales, CS, and support draw from the same release narrative — regardless of who presents.',
        },
      ],
    },
    whyPeacock: {
      headline: 'Launch from the product, not from a deck factory',
      differentiators: [
        {
          title: 'Captured at acceptance, not reconstructed later',
          description:
            'Flows are recorded from the product as stories close — the canonical record of what shipped.',
        },
        {
          title: 'Execution and narrative from one pipeline',
          description:
            'Flow docs power support and CS; tours power sales and leadership — without duplicate production.',
        },
        {
          title: 'Current when the product moves',
          description: 'Refresh individual capabilities; linked tours inherit the update.',
        },
      ],
    },
    useCases: [
      {
        title: 'Quarterly release enablement',
        description: 'Tour grouping flagship capabilities under the target buyer narrative.',
      },
      {
        title: 'Design partner onboarding',
        description: 'Self-serve journey for beta cohorts with a completion path to feedback.',
      },
      {
        title: 'Executive roadmap preview',
        description: 'Condensed tour connecting shipped work to strategic themes.',
      },
    ],
    businessOutcomes: [
      { label: 'Launch readiness', value: 'GTM assets available at ship time' },
      { label: 'Message consistency', value: 'One narrative, multiple audiences' },
      { label: 'Investment visibility', value: 'Outcomes visible across releases' },
    ],
    icon: Layers3,
    accentGradient: 'from-peacock-500 to-peacock-800',
    iconBg: 'bg-peacock-500/10 text-peacock-800',
  },
  {
    slug: 'business-analysts',
    title: 'Business Analysts & Stakeholders',
    shortTitle: 'Business Analysts',
    tagline: 'Turn agreed process into evidence sponsors can approve.',
    summary:
      'Record as-is and to-be workflows on the live system. Give cross-functional sponsors visual proof for sign-off, training, and process change.',
    whoTheyAre:
      'BAs translate business need into delivered behavior and defend that alignment to non-technical sponsors. They need proof approvers can review without a developer on the call.',
    bestFitWhen: [
      'Requirements and specs lack on-screen evidence sponsors trust',
      'Sign-off stalls waiting for live demos everyone can attend',
      'Process changes must land consistently across finance, HR, and operations',
    ],
    primaryChallenges: [
      {
        title: 'Specs without visual proof',
        description:
          'Text-heavy requirements hide what users will actually see. Disputes surface late when built behavior diverges from sponsor expectations.',
      },
      {
        title: 'Approval tied to availability',
        description:
          'Sign-off waits on coordinated walkthroughs because async evidence does not exist.',
      },
      {
        title: 'Process change does not travel',
        description:
          'A workflow update in one system must be understood differently by finance, HR, and ops — static diagrams miss the on-screen reality.',
      },
    ],
    flowDocuments: {
      headline: 'Process execution with audit-friendly evidence',
      description:
        'Capture what the business user sees and does at each step. These are the operational references for training, sign-off, and traceable export.',
      benefits: [
        {
          title: 'Screens replace abstraction',
          description: 'Every step shows the actual interface — not a flowchart alone.',
        },
        {
          title: 'Session context attached',
          description: 'Environment metadata captured automatically for attributable records.',
        },
        {
          title: 'Approval-ready exports',
          description: 'PDF packages with instructions and visuals sponsors can file.',
        },
      ],
    },
    productTours: {
      headline: 'End-to-end process stories for sponsor review',
      description:
        'Walk approvers through complete business processes across system touchpoints — organized how sponsors think about the work, not how tickets are routed.',
      benefits: [
        {
          title: 'Framing before field-level detail',
          description: 'Intro context sets the process before step-by-step playback.',
        },
        {
          title: 'Review on their schedule',
          description: 'Readonly links reduce the meeting loops that delay go-live.',
        },
        {
          title: 'Lens by business role',
          description: 'Finance approver, HR partner, or operations lead — same process, right framing.',
        },
      ],
    },
    whyPeacock: {
      headline: 'How work happens — documented where it happens',
      differentiators: [
        {
          title: 'Evidence from the live application',
          description:
            'Peacock captures workflows in the application under review — not screenshots pasted into a shared doc.',
        },
        {
          title: 'Sponsor review on their timeline',
          description:
            'Approvers examine the process segments relevant to their function — without scheduling another walkthrough.',
        },
        {
          title: 'Maintainable as procedures evolve',
          description: 'Update the affected flow when policy changes — without rebuilding approval binders.',
        },
      ],
    },
    useCases: [
      {
        title: 'UAT sign-off on staging',
        description: 'Expected behavior shared with business owners before production cutover.',
      },
      {
        title: 'Legacy-to-target migration',
        description: 'As-is and to-be flow docs for process re-engineering programs.',
      },
      {
        title: 'Procurement and RFP evidence',
        description: 'Exported workflows demonstrating supported business processes.',
      },
    ],
    businessOutcomes: [
      { label: 'Approval confidence', value: 'Visual proof on record' },
      { label: 'Cross-functional alignment', value: 'Shared reference across departments' },
      { label: 'Governance efficiency', value: 'Async review before live sessions' },
    ],
    icon: ClipboardList,
    accentGradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-500/10 text-amber-800',
  },
  {
    slug: 'helpdesk',
    title: 'IT Support & Service Desk',
    shortTitle: 'IT Support',
    tagline: 'Every agent follows the same proven path — on every ticket.',
    summary:
      'Capture resolution workflows as execution playbooks agents run on live calls, and training journeys that ramp new hires without weeks of shadowing.',
    whoTheyAre:
      'Service desk teams operate at volume with rotating staff. They need resolution paths that match the product today — not tribal knowledge from whoever has been on the team longest.',
    bestFitWhen: [
      'Knowledge base articles no longer match the product UI',
      'New agents depend on shadowing to learn resolution paths',
      'The same ticket type gets different answers depending on who picks it up',
    ],
    primaryChallenges: [
      {
        title: 'KB drift erodes trust',
        description:
          'Support articles mislead agents on live calls. Customers notice when guidance does not match their screen.',
      },
      {
        title: 'Ramp depends on proximity',
        description:
          'Hiring spikes extend shadowing cycles because no structured curriculum exists agents can replay alone.',
      },
      {
        title: 'Inconsistent first-touch resolution',
        description:
          'Without step-accurate playbooks, quality varies by agent and escalations absorb what frontline guidance should prevent.',
      },
    ],
    flowDocuments: {
      headline: 'Resolution playbooks built for ticket execution',
      description:
        'Record the correct path once — access, device, identity, VPN — with click-level steps agents follow while on the call or in the queue.',
      benefits: [
        {
          title: 'Steps agents can execute under pressure',
          description: 'Exact UI guidance replaces vague KB paragraphs during live assistance.',
        },
        {
          title: 'Aligned with the customer on live calls',
          description: 'Agents execute steps while assisting the customer — no guessing from vague KB text.',
        },
        {
          title: 'Stable links through UI changes',
          description: 'Update the capture; agents keep the same bookmark.',
        },
      ],
    },
    productTours: {
      headline: 'Tier-1 curricula that scale with hiring',
      description:
        'Organize top resolution paths into a structured ramp journey — how new agents learn the queue, not a folder of disconnected articles.',
      benefits: [
        {
          title: 'Organized by how tickets arrive',
          description: 'Access, device, billing, network — mapped to actual queue patterns.',
        },
        {
          title: 'Goals framed for frontline success',
          description: 'First-touch resolution and escalation reduction built into the journey arc.',
        },
        {
          title: 'Team refresh without retraining from zero',
          description: 'Walk through process updates in a structured session, not ad hoc tips.',
        },
      ],
    },
    whyPeacock: {
      headline: 'The authoritative reference for how issues get resolved',
      differentiators: [
        {
          title: 'Captured from the consoles agents use daily',
          description:
            'Peacock records resolution paths in the actual admin and support tools — not articles rebuilt after every UI change.',
        },
        {
          title: 'Indexed steps supervisors can standardize',
          description:
            'Agents land on the exact procedure. Frontline quality no longer depends on who answered the queue.',
        },
        {
          title: 'Playbooks that survive product updates',
          description: 'Refresh the workflow capture; the organization keeps one trusted link.',
        },
      ],
    },
    useCases: [
      {
        title: 'High-volume ticket paths',
        description: 'Tour covering the resolution workflows that drive most queue volume.',
      },
      {
        title: 'Week-one agent ramp',
        description: 'Self-paced journey completed before first live shift.',
      },
      {
        title: 'Customer self-serve for simple fixes',
        description: 'Readonly flow doc sent when the fix is safe for the customer to run.',
      },
    ],
    businessOutcomes: [
      { label: 'Resolution consistency', value: 'Standard paths across the desk' },
      { label: 'Agent ramp', value: 'Structured training without shadowing bottlenecks' },
      { label: 'Customer trust', value: 'Instructions that match the product' },
    ],
    icon: Headphones,
    accentGradient: 'from-teal-500 to-emerald-700',
    iconBg: 'bg-teal-500/10 text-teal-800',
  },
  {
    slug: 'new-hires',
    title: 'New Hires & Onboarding',
    shortTitle: 'New Hires',
    tagline: 'Give every cohort the same clear path in — at any hiring volume.',
    summary:
      'Task-level flow docs for discrete internal jobs, plus structured onboarding journeys that mirror your checklist across tools and teams.',
    whoTheyAre:
      'New hires must become productive across internal systems quickly. Without reusable assets, managers and buddies repeat the same orientation for every start date.',
    bestFitWhen: [
      'Hiring spikes overwhelm live orientation capacity',
      'Week one delivers dozens of links with no clear sequence',
      'Managers repeat the same tool walkthroughs for every new starter',
    ],
    primaryChallenges: [
      {
        title: 'Orientation does not scale',
        description:
          'Live walkthrough capacity breaks when headcount grows. Ramp quality varies by team and start week.',
      },
      {
        title: 'No sequenced path through tools',
        description:
          'Handbooks, videos, and tool help arrive without order. Hires save everything and finish little with confidence.',
      },
      {
        title: 'Managers as default trainers',
        description:
          'Leads lose calendar to repeat demos that should exist as authoritative references.',
      },
    ],
    flowDocuments: {
      headline: 'Task guides hires complete independently',
      description:
        'One flow doc per job — request access, submit expenses, run a report. Hires execute the task by following steps until it sticks.',
      benefits: [
        {
          title: 'Repeat until confident',
          description: 'Self-paced playback until the task is muscle memory.',
        },
        {
          title: 'Library of how work happens here',
          description: 'All onboarding flows discoverable from one place.',
        },
        {
          title: 'Current when tools change',
          description: 'Update the capture; cohorts always get the right version.',
        },
      ],
    },
    productTours: {
      headline: 'Onboarding journeys with a deliberate arc',
      description:
        'Week-by-week tours aligned to your checklist — structured adoption through internal tools, not a pile of orientation recordings.',
      benefits: [
        {
          title: 'Sequence that matches your program',
          description: 'Intro, essentials, role depth, and completion — in the order you intend.',
        },
        {
          title: 'Revisit the right topic at the right moment',
          description: 'Hires return to the module when that workflow appears in their actual job.',
        },
        {
          title: 'Cohorts by function',
          description: 'Separate journeys for engineering, GTM, and operations paths.',
        },
      ],
    },
    whyPeacock: {
      headline: 'Onboarding built on how work actually happens',
      differentiators: [
        {
          title: 'Recorded from your internal stack',
          description:
            'Peacock captures real workflows in the tools hires will use — not generic handbook prose.',
        },
        {
          title: 'Self-directed ramp through the program',
          description:
            'Hires access the module they need when that workflow surfaces — not hour-long orientation sessions.',
        },
        {
          title: 'Managers point, not repeat',
          description: 'Live time shifts to questions and context — not re-demonstrating the same clicks.',
        },
      ],
    },
    useCases: [
      {
        title: 'Week-one platform essentials',
        description: 'Core internal tools every hire must know before role-specific depth.',
      },
      {
        title: 'Function-specific ramp',
        description: 'Dedicated journey per business unit or job family.',
      },
      {
        title: 'Buddy program accelerator',
        description: 'Docs and tours handle walkthroughs; buddies handle nuance and culture.',
      },
    ],
    businessOutcomes: [
      { label: 'Ramp consistency', value: 'Same curriculum every cohort' },
      { label: 'Manager leverage', value: 'Reusable assets over live repetition' },
      { label: 'Time to productivity', value: 'Clear path through internal work' },
    ],
    icon: GraduationCap,
    accentGradient: 'from-rose-500 to-pink-600',
    iconBg: 'bg-rose-500/10 text-rose-700',
  },
  {
    slug: 'sales',
    title: 'Sales, Pre-sales & Solution Consultants',
    shortTitle: 'Sales & Pre-sales',
    tagline: 'Win the room once. Let every rep — and every prospect — replay it.',
    summary:
      'Capability-level flow docs for precise demo execution, and buyer-matched tours for live presentation and post-call momentum.',
    whoTheyAre:
      'Revenue teams demo under pressure across deal stages and buyer types. Without standard assets, top performers carry the org and new reps take too long to sound credible.',
    bestFitWhen: [
      'Demo quality swings depending on who is presenting',
      'Reps lose selling time rebuilding environments before calls',
      'Prospects have nothing substantive to revisit after the meeting',
    ],
    primaryChallenges: [
      {
        title: 'Messaging variance costs deals',
        description:
          'Without a canonical demo narrative, pipeline quality depends on individual performance on a given day.',
      },
      {
        title: 'Prep competes with pipeline',
        description:
          'Reps hunt for screens and rehearse ad hoc instead of delivering a proven story.',
      },
      {
        title: 'Follow-up fails to extend the conversation',
        description:
          'Generic decks do not replay what the prospect saw. Momentum fades between touchpoints.',
      },
    ],
    flowDocuments: {
      headline: 'Capability demos reps execute with precision',
      description:
        'Record tight workflows — integration, security, reporting — as reusable references with click-accurate steps for live calls.',
      benefits: [
        {
          title: 'Never miss a step on a live call',
          description: 'Follow the doc as your guide when the room is watching.',
        },
        {
          title: 'Answer branching questions cleanly',
          description: 'Admin vs user, plan tier, configuration path — from one asset.',
        },
        {
          title: 'Extend the meeting after it ends',
          description: 'Share a readonly link that recaps exactly what you demonstrated.',
        },
      ],
    },
    productTours: {
      headline: 'Buyer-matched narratives that close the story',
      description:
        'Compose tours for enterprise vs mid-market, technical vs economic buyer — the journey prospects explore after discovery and during evaluation.',
      benefits: [
        {
          title: 'Prospect sees their role first',
          description: 'Open with the buyer context so capability depth lands with relevance.',
        },
        {
          title: 'Consistent story across the revenue org',
          description: 'New reps deliver the same proven narrative from early tenure.',
        },
        {
          title: 'Built for live delivery and async follow-up',
          description: 'One asset for the call and the inbox — no duplicate production.',
        },
      ],
    },
    whyPeacock: {
      headline: 'Demo assets anchored in the product, not the slide deck',
      differentiators: [
        {
          title: 'Truth from the application',
          description:
            'Demos are captured from the actual product — grounded in what you show in market.',
        },
        {
          title: 'Buying conversations that continue after the call',
          description:
            'Prospects revisit the evaluation story independently — sustaining engagement between meetings.',
        },
        {
          title: 'Keep pace with product velocity',
          description: 'Update a capability capture; the tour your team relies on stays aligned.',
        },
      ],
    },
    useCases: [
      {
        title: 'Discovery-to-demo handoff',
        description: 'Buyer-matched tour sent after the first call to maintain momentum.',
      },
      {
        title: 'Enterprise evaluation package',
        description: 'Security, SSO, and admin workflows sequenced for technical buyers.',
      },
      {
        title: 'Event and field demo loop',
        description: 'Flagship tour running on a reliable, repeatable narrative.',
      },
    ],
    businessOutcomes: [
      { label: 'Pipeline quality', value: 'Consistent demo narratives across reps' },
      { label: 'Deal momentum', value: 'Stronger post-call engagement' },
      { label: 'Revenue ramp', value: 'Credible delivery from early tenure' },
    ],
    icon: Presentation,
    accentGradient: 'from-indigo-500 to-blue-800',
    iconBg: 'bg-indigo-500/10 text-indigo-700',
  },
  {
    slug: 'customer-success',
    title: 'Customer Success & Account Management',
    shortTitle: 'Customer Success',
    tagline: 'Accelerate time-to-value between the calls you can’t scale.',
    summary:
      'Milestone flow docs customers execute until tasks are done, plus adoption journeys mapped to purchased scope and first-value goals.',
    whoTheyAre:
      'CSMs drive retention and expansion across growing books. They need enablement that scales between touchpoints — not live walkthroughs for every milestone on every account.',
    bestFitWhen: [
      'Kickoff and onboarding cannot scale with portfolio growth',
      'Customers forget steps shown once on a crowded call',
      'Enablement content ignores what the account actually purchased',
    ],
    primaryChallenges: [
      {
        title: 'High-touch onboarding hits a ceiling',
        description:
          'Growing books force tradeoffs. Smaller accounts wait longer; CSMs sacrifice strategic work for repeat demos.',
      },
      {
        title: 'Training evaporates after kickoff',
        description:
          'Users return alone and cannot reconstruct what was shown in a single session.',
      },
      {
        title: 'Generic content misaligns with scope',
        description:
          'Customers receive guidance for modules they do not own. CSMs manually curate links per account.',
      },
    ],
    flowDocuments: {
      headline: 'Milestone tasks customers execute on their own',
      description:
        'First dashboard, invite the team, connect the integration — each milestone is a flow doc customers replay until the job is done.',
      benefits: [
        {
          title: 'Progress between CSM touchpoints',
          description: 'Customers advance without waiting for the next scheduled session.',
        },
        {
          title: 'Scoped to what they bought',
          description: 'One guide per purchased capability — no noise from unused modules.',
        },
        {
          title: 'Leave-behinds that travel',
          description: 'Attach to welcome sequences and QBR prep with export support.',
        },
      ],
    },
    productTours: {
      headline: 'Adoption journeys tied to customer outcomes',
      description:
        'Sequence milestones toward first value — framed for the user’s role, scoped to their modules, designed for the first 30 days and beyond.',
      benefits: [
        {
          title: 'Clear path to first value',
          description: 'Customers understand what to do next and why it matters.',
        },
        {
          title: 'Expansion-ready storytelling',
          description: 'Introduce unused modules through structured adoption narratives.',
        },
        {
          title: 'Expansion paths surfaced before the upsell conversation',
          description: 'Introduce underused modules through structured adoption narratives tied to account goals.',
        },
      ],
    },
    whyPeacock: {
      headline: 'Customer enablement that scales with the book',
      differentiators: [
        {
          title: 'Guides from the product customers use',
          description:
            'Peacock captures the customer-facing UI — an authoritative reference for how they should work in your platform.',
        },
        {
          title: 'Adoption milestones between CSM touchpoints',
          description:
            'Accounts progress through first-value tasks on their own — improving time-to-value across the book.',
        },
        {
          title: 'Renewal conversations grounded in demonstrated use',
          description:
            'QBR and renewal discussions reference what customers actually completed — not what was shown once on kickoff.',
        },
      ],
    },
    useCases: [
      {
        title: 'Welcome and kickoff package',
        description: 'Role-matched tour in the welcome sequence on day one.',
      },
      {
        title: 'Module adoption campaign',
        description: 'Structured journey introducing an expansion capability to target accounts.',
      },
      {
        title: 'Pre-renewal value review',
        description: 'Tour replay anchoring the business case before the renewal conversation.',
      },
    ],
    businessOutcomes: [
      { label: 'Time to value', value: 'Faster path to first meaningful outcome' },
      { label: 'CS leverage', value: 'Scaled enablement between touchpoints' },
      { label: 'Customer experience', value: 'Consistent guidance across accounts' },
    ],
    icon: HeartHandshake,
    accentGradient: 'from-fuchsia-500 to-purple-700',
    iconBg: 'bg-fuchsia-500/10 text-fuchsia-700',
  },
  {
    slug: 'executives',
    title: 'Executives & Leadership',
    shortTitle: 'Executives',
    tagline: 'See where product investment lands — before the board asks.',
    summary:
      'Curated product narratives for leadership forums. Understand strategic alignment, customer outcomes, and release direction without operational deep dives.',
    whoTheyAre:
      'Executives decide where capital goes and what the organization communicates externally. They need high-signal product understanding — consistent across forums — not feature tours that read like engineering documentation.',
    bestFitWhen: [
      'Product briefings either oversimplify or overrun leadership calendars',
      'All-hands and board segments tell different stories about the same roadmap',
      'It is hard to connect shipped work to customer and market outcomes',
    ],
    primaryChallenges: [
      {
        title: 'Wrong altitude in every briefing',
        description:
          'Updates swing between bullet lists and feature minutiae. Neither supports investment or communication decisions.',
      },
      {
        title: 'Narrative depends on who presents',
        description:
          'Employees and directors receive mixed signals when the company story changes with the speaker.',
      },
      {
        title: 'Strategy hidden inside release lists',
        description:
          'Individual shipments do not compose into a platform story without manual synthesis each quarter.',
      },
    ],
    flowDocuments: {
      headline: 'Depth available when questions require it',
      description:
        'Flagship workflow captures exist for optional drill-down — execution detail on demand, not loaded into every leadership session.',
      benefits: [
        {
          title: 'Answer specifics without a PM briefing',
          description: 'Directors follow a linked flow when a capability warrants scrutiny.',
        },
        {
          title: 'Leave-behind for board materials',
          description: 'Professional exports when appendix detail is appropriate.',
        },
      ],
    },
    productTours: {
      headline: 'Strategic narratives for decision forums',
      description:
        'Condensed journeys connecting customer outcomes, market positioning, and shipped capability — built for all-hands, board segments, and partner reviews.',
      benefits: [
        {
          title: 'Leadership aligns before major decisions',
          description: 'One product narrative reviewed async — not reconstructed in every prep cycle.',
        },
        {
          title: 'Consistent company story',
          description: 'The same strategic arc whether product, CEO, or GM presents.',
        },
        {
          title: 'Respect for executive time',
          description: 'Duration and scope designed for how leaders actually consume information.',
        },
      ],
    },
    whyPeacock: {
      headline: 'Investment visibility without dependency on live briefings',
      differentiators: [
        {
          title: 'Outcomes over feature inventory',
          description:
            'Tours connect shipped work to customer and market impact — how leaders evaluate return on product investment.',
        },
        {
          title: 'Self-serve strategic review',
          description:
            'Directors and VPs replay the canonical narrative before board and all-hands — not during them.',
        },
        {
          title: 'Organizational consistency',
          description:
            'One canonical narrative for how the company explains product direction and customer impact.',
        },
      ],
    },
    useCases: [
      {
        title: 'All-hands product segment',
        description: 'Strategic tour replacing slide-only product sections.',
      },
      {
        title: 'Board quarterly review',
        description: 'Readonly journey with optional appendix flows.',
      },
      {
        title: 'M&A and partnership diligence',
        description: 'Platform overview for evaluators who need speed and clarity.',
      },
    ],
    businessOutcomes: [
      { label: 'Decision confidence', value: 'Clear view of product direction' },
      { label: 'Strategic alignment', value: 'Consistent narrative across forums' },
      { label: 'Investment visibility', value: 'Outcomes connected to shipped work' },
    ],
    icon: Briefcase,
    accentGradient: 'from-slate-600 to-slate-900',
    iconBg: 'bg-slate-500/10 text-slate-700',
  },
  {
    slug: 'security-compliance',
    title: 'Security, Compliance & Audit',
    shortTitle: 'Security & Compliance',
    tagline: 'Collect control evidence without exposing what must stay protected.',
    summary:
      'Capture approved workflows with built-in sensitive-data safeguards and environment metadata — then guide reviewers through control domains in structured tours.',
    whoTheyAre:
      'Security and compliance teams must prove approved procedures are followed and documented. Auditors expect attributable evidence; teams should not trade data protection for documentation speed.',
    bestFitWhen: [
      'Audits require recurring evidence collection from production systems',
      'Sensitive data cannot appear in screenshots or recordings',
      'Approved workflows evolve faster than control documentation stays current',
    ],
    primaryChallenges: [
      {
        title: 'Evidence fragmented across the org',
        description:
          'Control proof lives in drives, email, and individual machines — no authoritative, indexed library.',
      },
      {
        title: 'Manual collection every audit cycle',
        description:
          'Teams re-walk systems to assemble screenshots by hand — repetitive work that delays remediation.',
      },
      {
        title: 'Documentation trails production',
        description:
          'Approved-path evidence falls behind UI changes, surfacing findings that continuous alignment would prevent.',
      },
    ],
    flowDocuments: {
      headline: 'Audit-ready captures with built-in safeguards',
      description:
        'Record approved workflows as step-by-step execution references. Password fields are automatically excluded. Sensitive inputs are never captured. Environment metadata is recorded with every session.',
      benefits: [
        {
          title: 'Password fields excluded automatically',
          description: 'Credential inputs never appear in snapshots — guaranteed by design.',
        },
        {
          title: 'Sensitive inputs never captured',
          description: 'Protected field types are excluded from recording and export.',
        },
        {
          title: 'Environment metadata on every capture',
          description: 'Browser, OS, and session context attached for attributable evidence.',
        },
        {
          title: 'Control packages for reviewers',
          description: 'Export step instructions and visuals formatted for audit submission.',
        },
      ],
    },
    productTours: {
      headline: 'Control domain journeys for structured review',
      description:
        'Guide auditors through access provisioning, change management, and log review as a navigable narrative — not a folder assembled under deadline.',
      benefits: [
        {
          title: 'Reviewers self-pace with readonly access',
          description: 'Auditors explore control domains without edit rights to source assets.',
        },
        {
          title: 'Domains mapped to control frameworks',
          description: 'Journey structure aligns to how reviewers evaluate the environment.',
        },
      ],
    },
    whyPeacock: {
      headline: 'Evidence collection designed for regulated environments',
      differentiators: [
        {
          title: 'Capture without credential exposure',
          description:
            'Password fields are automatically excluded. Sensitive inputs are never captured. Documentation speed does not compromise data protection.',
        },
        {
          title: 'Metadata-rich, attributable records',
          description:
            'Environment context on every capture supports audit trails that informal screenshots cannot provide.',
        },
        {
          title: 'Living control library',
          description:
            'An authoritative index of approved workflows — maintained as procedures evolve, not assembled under deadline.',
        },
      ],
    },
    useCases: [
      {
        title: 'SOC 2 access provisioning evidence',
        description: 'Approved admin workflow with metadata-rich export for auditor review.',
      },
      {
        title: 'Annual control evidence index',
        description: 'Library of flow docs linked from the compliance portal.',
      },
      {
        title: 'Enterprise customer security review',
        description: 'Readonly control journey shared during vendor assessment.',
      },
    ],
    businessOutcomes: [
      { label: 'Evidence integrity', value: 'Metadata-rich, attributable captures' },
      { label: 'Data protection', value: 'Sensitive fields excluded by default' },
      { label: 'Audit readiness', value: 'Continuous alignment with approved paths' },
    ],
    icon: Shield,
    accentGradient: 'from-emerald-600 to-teal-800',
    iconBg: 'bg-emerald-500/10 text-emerald-800',
  },
];

export function getSolutionRoleBySlug(slug: string | undefined): SolutionRole | undefined {
  return SOLUTION_ROLES.find((role) => role.slug === slug);
}

export const SOLUTION_ROLE_GROUPS = [
  {
    label: 'Build & ship',
    slugs: ['developers', 'product-owners', 'business-analysts'],
  },
  {
    label: 'Validate & assure',
    slugs: ['testers', 'security-compliance'],
  },
  {
    label: 'Enable & adopt',
    slugs: ['helpdesk', 'new-hires', 'customer-success'],
  },
  {
    label: 'Revenue & leadership',
    slugs: ['sales', 'executives'],
  },
] as const;
