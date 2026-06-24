# Dynamic Premium Calculator — Architecture

CMS-managed, version-controlled premium calculation engine for Shiv Insurance products.

---

## 1. System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PUBLIC / CUSTOMER LAYER                              │
│  Product Detail Page · Quote Page · Homepage Calculator                      │
│  DynamicProductCalculator → POST /api/products/[slug]/calculate              │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PREMIUM ENGINE (src/lib/premium-engine)              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │
│  │   Queries    │  │  Evaluator   │  │  Mutations   │  │  Audit Logger   │ │
│  │ load config  │  │ run formula  │  │ versions     │  │ calc + CMS logs │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────────┘ │
└───────────────────────────────────┬─────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              PostgreSQL                                      │
│  premium_calculator_configs · premium_formula_versions                       │
│  premium_calculation_logs · audit_logs                                       │
└─────────────────────────────────────────────────────────────────────────────┘
                                    ▲
┌───────────────────────────────────┴─────────────────────────────────────────┐
│                         ADMIN CMS LAYER                                      │
│  /admin/premium-calculator                                                   │
│  · Select product · Edit fields & formula steps                              │
│  · Version history · Publish draft · Preview calculation                     │
│  · Calculation audit trail                                                   │
│  API: /api/admin/premium-calculator/*                                        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Principles

| Principle | Implementation |
|-----------|----------------|
| **CMS-driven** | Fields and formula steps stored as JSON in `premium_formula_versions` |
| **Version controlled** | Immutable version rows; publish promotes draft → active |
| **Auditable** | Every calculation logged; CMS changes in `audit_logs` |
| **Safe evaluation** | Declarative step DSL — no arbitrary code execution |
| **Category templates** | Motor, Medical, Travel, Business, Home, Life field presets |
| **Backward compatible** | Legacy `pricingFormula` + `premiumRules` still supported as fallback |

---

## 3. Data Model (ERD)

```
InsuranceProduct 1──1 PremiumCalculatorConfig
PremiumCalculatorConfig 1──* PremiumFormulaVersion
PremiumCalculatorConfig ──activeVersion──▶ PremiumFormulaVersion (published)
PremiumFormulaVersion 1──* PremiumCalculationLog
InsuranceProduct 1──* PremiumCalculationLog
User 1──* PremiumFormulaVersion (created / published)
User 1──* PremiumCalculationLog
User 1──* AuditLog (formula CMS actions)
```

### 3.1 `PremiumCalculatorConfig`

| Column | Purpose |
|--------|---------|
| `productId` | Links to insurance product (unique) |
| `category` | `motor`, `medical`, `travel`, `business`, `home`, `life` |
| `activeVersionId` | Currently published formula version |

### 3.2 `PremiumFormulaVersion`

| Column | Purpose |
|--------|---------|
| `version` | Monotonic integer per config (1, 2, 3…) |
| `status` | `DRAFT` · `PUBLISHED` · `ARCHIVED` |
| `basePremium` | Starting premium (KES) |
| `formula` | JSON array of calculation steps |
| `fields` | JSON array of input field definitions |
| `changelog` | Human-readable version notes |
| `publishedAt` | When this version went live |

### 3.3 `PremiumCalculationLog`

| Column | Purpose |
|--------|---------|
| `source` | `PREVIEW` (admin) · `PUBLIC` (website) · `API` |
| `input` | Submitted field values |
| `output` | Full evaluation result (breakdown) |
| `formulaVersionId` | Exact formula version used |

---

## 4. Formula DSL

Formulas are an ordered list of **steps**. The evaluator maintains a running `totalPremium`.

### 4.1 Step Types

| Type | Description | Example |
|------|-------------|---------|
| `base` | Set total to `basePremium` | `{ "type": "base", "label": "Base premium" }` |
| `multiply_field` | Add `field × rate` | Vehicle value × 2.5% |
| `per_unit` | Add `field × amount` per unit | KES 800 per dependant |
| `percent_of_field` | Add `%` of a numeric field | 1.5% of revenue |
| `condition` | If field matches operator, apply multiplier/fixed | Age > 65 → +15% |
| `lookup_multiplier` | Map select value → multiply total | SUV → ×1.1 |
| `lookup_add` | Map select value → add fixed amount | Schengen → +500 |
| `discount_per_unit` | Subtract per unit up to cap | 2% per year owned (max 5) |
| `floor` | Minimum premium | `{ "type": "floor", "value": 500 }` |

### 4.2 Condition Operators

`eq` · `neq` · `gt` · `gte` · `lt` · `lte` · `in`

### 4.3 Example — Motor

```json
{
  "steps": [
    { "type": "base", "label": "Base premium" },
    { "type": "multiply_field", "field": "vehicleValue", "rate": 0.025, "label": "Vehicle value (2.5%)" },
    { "type": "lookup_multiplier", "field": "vehicleType", "map": { "sedan": 1, "suv": 1.1, "truck": 1.25, "motorcycle": 0.85 }, "label": "Vehicle type" },
    { "type": "condition", "field": "usage", "operator": "eq", "value": "commercial", "multiplier": 1.25, "label": "Commercial usage" },
    { "type": "condition", "field": "age", "operator": "lt", "value": 25, "multiplier": 1.2, "label": "Young driver" },
    { "type": "condition", "field": "age", "operator": "gt", "value": 65, "multiplier": 1.15, "label": "Senior driver" },
    { "type": "discount_per_unit", "field": "yearsOwned", "ratePerUnit": 0.02, "maxUnits": 5, "label": "Loyalty discount" },
    { "type": "floor", "value": 1200 }
  ]
}
```

---

## 5. Category Field Templates

| Category | Fields |
|----------|--------|
| **Motor** | `vehicleValue`, `age`, `vehicleType`, `usage`, `yearsOwned` |
| **Medical** | `dependants`, `coverageLimit`, `age` |
| **Travel** | `destination`, `duration`, `travellers` |
| **Business** | `revenue`, `employees`, `industry` |
| **Home** | `propertyValue` |
| **Life** | `income`, `age`, `dependants` |

Templates live in `src/config/premium-calculator.defaults.ts` and seed into version 1 on `prisma db seed`.

---

## 6. Version Lifecycle

```
                    ┌─────────┐
    Create ────────▶│  DRAFT  │◀──── Save edits
                    └────┬────┘
                         │ publish()
                         ▼
              ┌──────────────────┐
              │    PUBLISHED     │──▶ activeVersionId on config
              └────────┬─────────┘
                       │ new publish (previous)
                       ▼
              ┌──────────────────┐
              │    ARCHIVED      │
              └──────────────────┘
```

**Rules:**
- Only one `PUBLISHED` version is active per product
- Publishing archives the previous active version
- Drafts can be previewed without affecting production
- Version numbers are never reused

---

## 7. API Surface

### Public

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/products/[slug]/calculator` | Active fields + metadata |
| `POST` | `/api/products/[slug]/calculate` | Run calculation (`source: PUBLIC`) |

### Admin (requires `products:manage`)

| Method | Route | Purpose |
|--------|-------|---------|
| `GET` | `/api/admin/premium-calculator` | List all configs |
| `GET` | `/api/admin/premium-calculator/[productId]` | Config + versions |
| `POST` | `/api/admin/premium-calculator/[productId]/versions` | Create draft from active |
| `PUT` | `/api/admin/premium-calculator/versions/[id]` | Update draft |
| `POST` | `/api/admin/premium-calculator/versions/[id]/publish` | Publish version |
| `POST` | `/api/admin/premium-calculator/versions/[id]/preview` | Preview calculation |
| `GET` | `/api/admin/premium-calculator/audit` | Calculation + CMS audit logs |

---

## 8. Audit Strategy

### 8.1 Calculation Audit (`premium_calculation_logs`)

Every evaluation records:
- Input factors
- Full output breakdown
- Formula version ID
- Source (`PREVIEW` / `PUBLIC` / `API`)
- User ID (admin preview) or anonymous (public)
- IP + user agent

### 8.2 CMS Audit (`audit_logs`)

Formula CMS actions:
- `premium_formula.created`
- `premium_formula.updated`
- `premium_formula.published`
- `premium_formula.archived`

Stores `oldData` / `newData` snapshots for compliance.

---

## 9. File Structure

```
src/
├── config/
│   └── premium-calculator.defaults.ts   # Category templates
├── lib/
│   ├── audit.ts                         # Shared audit log helper
│   └── premium-engine/
│       ├── types.ts                     # DSL + result types
│       ├── evaluator.ts                 # Step runner
│       ├── queries.ts                   # Load configs/versions
│       ├── mutations.ts                 # CRUD + publish
│       └── calculate.ts                 # Orchestrate calc + audit
├── validations/
│   └── premium-formula.ts               # Zod schemas
├── components/
│   ├── products/
│   │   └── dynamic-product-calculator.tsx
│   └── admin/
│       └── premium-calculator-admin.tsx
└── app/
    ├── api/admin/premium-calculator/...
    └── (admin)/admin/premium-calculator/page.tsx

prisma/
└── seed-premium-formulas.ts

docs/
└── PREMIUM-CALCULATOR.md                # This document
```

---

## 10. Security

- **No `eval()`** — formulas are JSON step arrays only
- **Admin routes** — session + `products:manage` permission
- **Input validation** — Zod validates field types, min/max before evaluation
- **Rate limiting** (recommended) — apply to public calculate endpoint in production

---

## 11. Extension Points

1. **New categories** — add template in `premium-calculator.defaults.ts`
2. **New step types** — extend `evaluator.ts` switch
3. **A/B testing** — support percentage rollout via config flags
4. **Quote integration** — pass calculation log ID into `Quote` record
5. **PDF export** — render breakdown from `PremiumCalculationResult`
