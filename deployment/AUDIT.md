# Security Audit Review

**Date:** 2025-08-22  
**Tool:** `npm audit`

---

## Findings

### Vulnerability: `xlsx`
- **Advisory:** [GHSA-4r6h-8v6p-xvw6](https://github.com/advisories/GHSA-4r6h-8v6p-xvw6), [GHSA-5pgg-2g8v-p4x9](https://github.com/advisories/GHSA-5pgg-2g8v-p4x9)  
- **Severity:** High  
- **Source:** Dependency chain → `node-nlp` → `@nlpjs/xtables` → `xlsx`  
- **Type:** Prototype Pollution / Regular Expression Denial of Service (ReDoS)  

### Risk Assessment
- This project **does not use XLSX parsing** or allow users to upload Excel files.  
- The vulnerable code paths are not executed in our application.  
- Exploitability is therefore **low / not applicable** in our context.  

### Decision
- No immediate remediation required.  
- Will monitor for patched releases of `node-nlp` and `xlsx`.  
- Re-evaluate if future features involve Excel file handling.

---

## Next Steps
- Check `npm audit` monthly.  
- If we add Excel processing features, revisit this issue.  
- Optionally apply an `overrides` fix in `package.json` if dependencies remain outdated.
