# Fae — Client Agent

## Project

- **Customer:** Wizardworks (intern produkt)
- **Domain:** Multi-tenant orchestration framework för AI-driven mjukvaruleverans. Fae orkestrerar autonoma AI-agenter som bygger mjukvara åt Wizardworks kunder. Centralt styrd, dataisolerad, autonom leverans till flera kunder samtidigt.
- **Code repositories:**
  - `~/code/fae-gateway/` — .NET API + agent runtime
  - `~/code/fae-gateway/fae-agent/` — Agent-submodul
  - `~/code/fae-portal/` — React frontend (portal)
  - `~/code/fae-portal-template/` — Kundportal-template
  - `~/code/fae-common/` — Delad infra (Bicep), pipelines
  - `~/code/fae-architecture/` — Arkitekturdokumentation
- **Tech stack:** .NET 8, Azure Container Apps, Azure PostgreSQL Flexible, Azure Service Bus, React, Bicep
- **DevOps:** https://dev.azure.com/wizardworks/Fae
- **GitHub:** https://github.com/Wizardworks-AB/fae-gateway, fae-portal, fae-common

## Project-Specific Notes

### Agenter i Fae-ekosystemet
Kanoniska agent-typ-nycklar lever i `Fae.Api/Models/AgentTypes.cs` (machine keys); använd dem, inte de gamla kodnamnen. Kodnamns-schemat (cobalt/malah/wisp/…) är **utfasat** — kolonnen "Tidigare" finns bara för att äldre work items och graf-noder fortfarande refererar dem.

| Agent-typ (nyckel) | Roll | Beskrivning | Tidigare |
|--------------------|------|-------------|----------|
| `builder-agent` | Builder | Autonom byggar-agent. Skannar DevOps board, plockar tasks, kör agenten, committar, pushar, skapar PR. | cobalt |
| `pm-agent` | PO/PM | Produktägare/PM. GitHub App-permissions: contents:write, metadata:read, pull_requests:write. | malah |
| `knowledge-agent` | Knowledge | Fångar och kurerar kunskapsgrafen (capture + curator-pass). | librarian-agent (ursprl. sage) |
| `security-agent` | Security | Säkerhetsgranskare. | wisp |
| `budget-agent` | Cost/Budget | Kostnadsövervakning. | banshee |
| `compliance-agent` | Compliance | Regelefterlevnad. | brownie |
| `architect-agent` | Architecture | Arkitekturgranskning. | gargoyle |
| `reviewer-agent` | Reviewer | Kodgranskning. | critic |
| `tester-agent` | Tester | Testning. | puck |
| `investigator-agent` | Investigator | Felsökning/utredning. | cain |
| `planner-agent` | Planner | Nedbrytning/planering. | drognan |
| `monitor-agent` | Monitor | Övervakning. | sentinel |

### Git — KRITISKT
- **`builder-agent` (autonom byggar-agent) pushar till main kontinuerligt.** Kör ALLTID `git pull --rebase` innan `git push`.
- Mönster: `git pull --rebase && git push`
- Pipelines (fae-platform): Build = ID 65 (fae-platform-build-gateway), Deploy = ID 66 (fae-platform-deploy-gateway). Legacy #37/#38 är utfasade — använd dem INTE (deras test-stage skriver över submodule-pekaren).
- Använd ALLTID explicit image-tag (buildId), ALDRIG `latest`

### DevOps-auth
- Managed Identity (inte PAT)
- MI: `id-fae-dev-swedencentral` (client ID: `4e19e3df-06fd-4cf3-914a-884d8a5d80cf`)
- Config: `DevOps:UseManagedIdentity=true` + `DevOps:ManagedIdentityClientId=<client-id>`

### DevOps taggkonvention
- Rob (interaktiv): `agent:rob` + `agent-type:interactive`
- Autonom agent: `agent:<agent-type>` (t.ex. `agent:builder-agent`) + `agent-type:autonomous`
- Repo: `repo:fae-agent`
- Automation: `fae-auto`

### Arkitekturprinciper
1. Fae äger inte agenten — Fae styr vilken agent som jobbar, agenten kan vara Claude Code, Cursor, Devin etc.
2. Fae äger inte modellen — LLM-agnostiskt
3. Fae äger inte lagringen — pluggbart
4. Fae äger orkestreringsproblemet — tenant-isolering, credential management, kunskapskontext, jobb-routing, observability

### Fem lager
```
Interface Layer      — Teams, Portal, API, CLI, Slack
Orchestration Layer  — Tenant Registry, Job Router, Skill Engine
Knowledge Layer      — Context Builder, Knowledge Store, Insight Loop
Security Layer       — Credential Vault, Grant System, Audit Log
Provider Layer       — Agent Backends, PM Tools, SCM, LLMs, Storage
```

### Infrastruktur
- **Dev** — subscription `Wizardworks Production (Partner Launch)`, RG `rg-fae-dev-swedencentral`, ACR `crfaedev`
- **Prod** — subscription `Fae Production`, RG `rg-fae-prod-swedencentral`, ACR `crfaeprod`
- Ingen staging — promotion går direkt dev → prod
- Gateway dev FQDN: `ca-fae-gateway-dev.salmonwave-72765d26.swedencentral.azurecontainerapps.io`
- Gateway prod FQDN: `fae.wizardworks.se` (custom domain)
- Portal prod FQDN: `fae-portal.wizardworks.se`
- PostgreSQL prod: `psql-fae-prod-swedencentral.postgres.database.azure.com`
- Deploy: `az containerapp update --subscription "<sub>" --resource-group <rg> --name <app> --image <acr>.azurecr.io/fae-gateway:<buildId>` — ALDRIG `latest`
- **Fotfallgrop:** dev och prod ligger i OLIKA subscriptions. Kör alltid `az account show` innan `az`-kommandon eller sätt `--subscription` explicit.

### Portal — Azure AD App Registrations
- fae-gateway-api: appId `4f067c79-2ba2-4d36-92eb-6ce47df80d3a`, scopes: `portal.read`, `portal.write`
- fae-portal-spa: appId `fb7f3085-24e4-4cb8-acd3-92a5a0556c8b`, auth code + PKCE

### Secrets — var de lagras (KRITISKT)
- **Per-org/tenant application-secrets** (LLM API-nycklar via `OrganizationApiKey`/`OrganizationLlmProvider`, connection-secrets via `OrganizationConnection`) lagras **envelope-krypterade i Postgres** (`secrets`-tabellen, `Secret`-entiteten, #1646) — AES-256-GCM med en per-org DEK som wrappas av KEK:en. **INTE i Key Vault.**
  - `SecretRef` (t.ex. `Secrets/{orgId}/llm-anthropic`) är en logisk pekare som resolvas av `ICredentialService`/`ISecretResolver` (`EnvelopeCredentialService`) mot DB-raden — samma sträng-form som de gamla KV-refsen, men det är **inte** KV. Den per-org KV-vägen (`KeyVaultCredentialService`) är bara en transitional fallback som tas bort (Phase 6).
  - "Seeda en nyckel" = portalens `POST /api/portal/{orgId}/api-keys` → skriver envelope-krypterad rad i `secrets` + `OrganizationApiKey`-pekare. Aldrig manuellt i KV.
- **Plattforms-secrets** (Postgres-conn, lease-HMAC, admin-service-token, connector client-secrets/cert-namn) ligger i `kv-fae-platform-{env}` + bicep-params/env. **KEK:en** ligger i `kv-fae-kek-{env}` (HSM) och wrappar org-DEK:arna.
- Tumregel: rör det en **organisation** → DB envelope-store. Rör det **plattformen** → KV. Lägg aldrig org-nycklar i KV och aldrig secrets i repo-filer.

### EF Core-migrationer — GRANSKA ALLTID
- Npgsql genererar quoted PascalCase kolumner ("Status", inte status)
- Partial index filters måste använda samma quoting
- Verifiera att Up()-metoden matchar migrationens syfte

### Key contacts
- **Daniel Berg** — CTO, produktägare
- **Magnus Weidmar** — Tech lead

## Template Variants

This is the **greenfield** template. For other project types, see `variants/`:
- `existing-codebase/` — Follow customer patterns, gradual improvement
- `maintenance/` — Bug-focused, fast cycles, minimal changes

## Reference

All Wizardworks standards, workflows, and tool guides are in `.claude/rules/` and `.claude/CONSTITUTION.md`. They load automatically in every session.

| Location | Contents |
|----------|----------|
| `.claude/CONSTITUTION.md` | Engineering principles, architectural standards, technology stack |
| `.claude/rules/workflow.md` | Development workflow |
| `.claude/rules/agents-and-commands.md` | 10 specialist agents, slash commands |
| `.claude/rules/fae.md` | Fae knowledge graph — Remindr MCP tools |
| `.claude/rules/hooks.md` | 14 automated quality hooks |
| `.claude/rules/coding-style.md` | Naming conventions, file organization |
| `.claude/rules/testing.md` | TDD workflow, coverage requirements |
| `.claude/rules/security.md` | Security guidelines, secret management |
| `.claude/rules/git-workflow.md` | Commits, branches, PRs |
