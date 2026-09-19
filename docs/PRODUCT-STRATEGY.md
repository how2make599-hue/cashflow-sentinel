# Money Recovery Sentinel - Product Strategy

Status: COMMITTED
Date: 2026-09-19
Owner: Product system operated by the project team

## Product decision

The project will focus on a free-first **Business Money Recovery Engine**.

The core promise is simple:

> Find money a business may be losing, failing to collect, overpaying, or leaving unclaimed, and turn the finding into an actionable recovery plan.

This is deliberately broader than a late-payment tool. Late invoices are the first high-value use case, but the architecture will support additional leakage categories without requiring a new product.

## Why this is the selected opportunity

Current research indicates a strong and persistent problem:

- UK Government says late payments cost the UK economy £11bn per year and the Commercial Payments Bill is intended to address the issue.
- UK businesses can already claim statutory interest and fixed debt-recovery costs on qualifying late commercial payments.
- OECD 2026 research says SMEs are rapidly adopting AI but implementation is uneven, with time constraints, maintenance costs, skills gaps and cybersecurity challenges.
- OECD UK research identifies cost and relevance of technology as important barriers to SME adoption.
- The product therefore targets a measurable financial outcome rather than selling AI for its own sake.

## Initial free product

### Recovery Check

A user can enter or upload a small set of invoice/payment information.

The tool will identify:

1. overdue invoices
2. days overdue
3. potential statutory interest
4. potential fixed recovery compensation where applicable
5. contractual payment terms requiring review
6. total cash currently outstanding
7. recovery priority
8. suggested next action
9. draft customer communication

The free result must be useful even if the user never buys anything.

## Product expansion

The same engine will progressively support:

- supplier overpayment detection
- duplicate invoice detection
- subscription/renewal leakage
- price-change detection
- missed discounts
- contract/payment-term anomalies
- recurring cost anomalies
- quote-to-invoice discrepancies
- procurement leakage

The product should never claim a financial, legal or compliance conclusion where the evidence only supports a flag. Findings are presented as items for review.

## Commercial ladder

Stage 1:
Free Recovery Check.

Stage 2:
Free user account and saved recovery cases.

Stage 3:
Paid small-business plan for larger volumes, history, automation and reporting.

Stage 4:
Business plan for teams and recurring monitoring.

Stage 5:
Enterprise/API/white-label capability.

Potential enterprise buyers include accounting platforms, finance teams, credit-control providers, procurement platforms, insurers, lenders and business software providers.

## Zero-upfront-cost principle

No paid domain, advertising or infrastructure is required for the initial validation.

Use existing connected infrastructure and free platform allowances wherever commercially permitted.

Do not purchase infrastructure until the product has demonstrated real user demand or revenue.

## Phased delivery

### Phase 1 - Foundation and market validation
- Commit to the product direction.
- Document market evidence and product assumptions.
- Define the minimum viable recovery calculation rules.
- Define data model.
- Define privacy and data-minimisation rules.
- Define success metrics.
- Identify legal/commercial claims that require cautious wording.

### Phase 2 - Free Recovery Check MVP
- Build the calculator/input flow.
- Produce recovery summary.
- Produce actionable next steps.
- Add lead capture only where useful and transparent.
- Add event tracking.
- Make the tool usable without payment.

### Phase 3 - Automated recovery workflow
- Saved cases.
- Reminder scheduling.
- Email draft generation.
- Recovery status.
- Follow-up sequence.
- Resend integration.
- Supabase persistence.

### Phase 4 - Leakage expansion
Add the highest-value additional leakage detector based on actual usage data, not assumptions.

### Phase 5 - Commercial product
Introduce paid volume, monitoring and team features only after evidence of recurring demand.

### Phase 6 - Enterprise proposition
Create API, bulk processing, private/controlled deployment and licensing options.

## Success gates

Do not spend money simply because a phase has been completed.

Advance based on evidence:

- users complete the tool
- users return
- users identify meaningful recoverable value
- users request additional functionality
- users consent to follow-up
- businesses ask for bulk/automated capability
- at least one credible paid use case emerges

## Product principle

We are not building an AI wrapper looking for a market.

We are building a financial problem detector first, then using automation and AI only where it materially improves the outcome.

The long-term asset is the workflow, detection logic, anonymised/consented usage insight, integrations and enterprise capability.
