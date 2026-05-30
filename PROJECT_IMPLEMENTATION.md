# Secrets Scanner — Standalone Real GUI Implementation

This folder is now its own runnable project app. It does not depend on the root all-project dashboard at runtime.

## Run

```bash
./run_gui.sh
```

Windows:

```powershell
.\run_gui_windows.ps1
```

Default URL: `http://127.0.0.1:9151`

## What is inside this project folder

- `app/` — FastAPI backend for this project.
- `static/` — elegant browser GUI.
- `plugins/secrets-scanner.json` — this project’s own feature/customization/input schema.
- `project_config.json` — readable copy of the same project-specific configuration.
- `data/` — local SQLite jobs, uploads, exports.
- `tests/` — verifies this project has a registered real local engine.

## Project-specific scope

- Domain: `Security / DevSecOps`
- Target user: `Domain operator, business owner, analyst, or team member who needs this workflow executed reliably.`
- Core job: Repo/code → secret findings and remediation
- Suite: `Security Suite`

## Deep features applied

- provider-specific detectors
- entropy scanning
- git history scan
- auto-redaction
- rotation checklist
- CI gate
- false-positive learning

## Customization controls

- `execution_mode` — Execution mode (select)
- `rulesets` — rulesets (textarea)
- `allowlist` — allowlist (textarea)
- `severity_policy` — severity policy (text)
- `branches` — branches (text)
- `notification_channels` — notification channels (textarea)
- `remediation_templates` — remediation templates (text)
- `output_format` — output format (select)
- `language` — language (select)
- `privacy_mode` — privacy mode (select)
- `confidence_threshold` — Confidence threshold (slider)

## Input fields

- `repo` — Repo (text) required
- `code` — code (text) required
- `work_brief` — Work brief / source text / URL / instructions (textarea) required

## External data policy

The local deterministic core is real and executable. Live external systems are not simulated. If Shopify, ATS, ERP, OCR/STT, maps, SERP, market data, medical databases, tax/customs databases, or other live systems are required, this project reports the missing connector/API requirement instead of inventing data.

---

## Final UX/UI Layer

This project now uses the **Security Response Console** pattern.

**UX workflow:** Signal intake → severity/risk → evidence → remediation → report

**Domain components:**
- Severity matrix
- Evidence/IOC panel
- Remediation checklist
- Timeline builder
- Policy/report export

**Quick actions:**
- Triage severity
- Extract indicators
- Build remediation plan
- Prepare incident report

**No fake-data policy:** external/live actions require real connectors or API keys. Missing connectors are reported instead of simulated.
