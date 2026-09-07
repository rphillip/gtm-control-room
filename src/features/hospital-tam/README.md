# Hospital TAM entity-resolution artifact

“5,000 Hospitals Doesn’t Mean 5,000 Prospects” is an independent portfolio exercise inspired by a hypothetical provider-side healthcare pricing and payer-contracting motion. It was not performed for, sponsored by, or endorsed by Turquoise Health, CMS, AHRQ, Clay, LinkedIn, or any depicted organization.

The page follows Maya, a fictional seller trying to turn a hospital file into a trustworthy list of potential customers. A recurring hospital → health system → sales account legend establishes the three identity layers, while the red data ball carries one record through joining, grouping, qualification, and counting machines. Every major section begins with Maya’s question and an expandable short answer; motion remains static when reduced motion is requested.

## Business problem

The source system and a GTM team may describe different entities. CMS Hospital General Information lists hospitals registered with Medicare and uses a six-character Facility ID. The AHRQ Compendium Hospital Linkage File maps hospital identifiers into health systems under AHRQ’s documented definition. Company and domain enrichment introduces another identity layer, while a sales team still needs to choose the organization it believes controls the relevant buying decision.

The artifact teaches that entity resolution changes the modeled addressable market; it is not merely cleanup.

## Data model

```text
Facility
- facility_id (source string; keep leading zeroes)
- facility_name
- system_id (resolved, unresolved, or ambiguous)

System
- system_id (source-vintage key)
- system_name
- parent_company_id (resolved, unresolved, or ambiguous)

Company
- company_id
- company_name
- domain (optional and probabilistic)
```

The public interaction uses ten invented `DEMO##` rows, four fictional systems, three fictional companies, and `.demo` domains. No source rows, patient information, contacts, proprietary project records, workspace identifiers, analytics, or remote API calls are included.

## Resolution model and limitations

1. Treat CMS Facility ID and the AHRQ linkage CCN as text, normalize them deliberately, and preserve the original values for lineage.
2. Resolve facilities to the AHRQ system key for the selected source vintage; retain unmatched and ambiguous records.
3. Deduplicate by system only after inspecting the crosswalk.
4. Resolve system entities to a chosen company/account identity with confidence and evidence.
5. Deduplicate again at the company layer because multiple system identities can share one parent.
6. Score the account and seek buyer-function evidence only after the identity layer is stable enough for the use case.

Real resolution is not deterministic. Public data can be stale, hospitals may be acquired, source periods differ, multiple facilities can share an identifier, domains may be absent or shared, corporate-parent relationships can be ambiguous, and titles do not prove purchasing authority. Filtering and scoring model a GTM thesis; they do not establish the objective market size or predict purchase intent.

## Primary references

- [CMS Hospital General Information](https://data.cms.gov/provider-data/dataset/xubh-q36u)
- [AHRQ Compendium of U.S. Health Systems, 2023, Hospital Linkage File technical documentation](https://www.ahrq.gov/sites/default/files/wysiwyg/chsp/compendium/2023-hospital-linkage-techdoc.pdf)

Another practitioner can adapt the method with SQL, dbt, Python, Clay, spreadsheets, APIs, enrichment providers, and a CRM. The important contracts are the unit of record, crosswalk key, deduplication key, lineage, unresolved state, and human-review policy—not the tool selection.
