# Cashflow Sentinel

## Current status

**Phase 2 MVP built:** Free Recovery Check.

The product is now a free-first commercial late-payment recovery tool. It requires no account to run the calculation and stores a minimal recovery-check record only when the user presses **Calculate recovery**.

### Current MVP

- Invoice amount
- Payment due date
- Paid date or current date
- Configurable interest rate
- Indicative overdue days
- Indicative statutory interest
- Fixed recovery-cost amount
- Total indicative recovery value
- Optional email capture
- Supabase persistence
- RLS and denied public database access
- Automated GitHub build workflow

### Current UK default

The MVP uses **11.75%** as the default rate: Bank Rate **3.75%** + 8 percentage points. The Bank of England reported Bank Rate at 3.75% on 17 September 2026, and GOV.UK states that statutory interest for qualifying late commercial payments is 8% plus the Bank of England base/reference rate. Fixed recovery costs are £40, £70 or £100 depending on debt size.

These figures are presented as an indicative calculation, not legal advice. The user can change the rate and must check the contract and applicable circumstances.

## Next phases

### Phase 3
Automated recovery workflow:
- saved cases
- recovery status
- reminder scheduling
- draft recovery notices
- optional email delivery
- follow-up history

### Phase 4
Money leakage expansion:
- duplicate invoice detection
- supplier overpayment
- price-change detection
- missed discounts
- renewal leakage
- quote-to-invoice discrepancies

### Phase 5
Commercial product:
- volume limits
- monitoring
- team access
- reporting
- paid automation

### Phase 6
Enterprise:
- API
- bulk processing
- white-label
- licensing/integration

## Zero-cost principle

No paid domain, advertising or infrastructure is required for the validation stage. Paid services should only be introduced after evidence of demand or revenue.

## Deployment note

The repository is ready for deployment, but deployment credentials/permissions must be available before a public production deployment can be performed. The existing Vercel connection currently does not grant deployment-list permissions, so no claim of live production deployment is made.

## Sources

- GOV.UK late commercial payments: https://www.gov.uk/late-commercial-payments-interest-debt-recovery/charging-interest-commercial-debt
- GOV.UK recovery costs: https://www.gov.uk/late-commercial-payments-interest-debt-recovery/claim-debt-recovery-costs
- Bank of England Bank Rate: https://www.bankofengland.co.uk/monetary-policy/the-interest-rate-bank-rate
