# Azure / Infrastructure-as-Code Stack Standards

Stack-specific conventions for Azure infrastructure and deployment. Loaded when
the **azure** stack overlay is selected at download. These extend the
language-agnostic `rules/security.md` and `rules/git-workflow.md`. Deeper
patterns and worked examples live in the `infrastructure-as-code` skill.

## Infrastructure as Code (mandatory)

- All Azure resources are defined in **Bicep** and deployed through CI/CD.
  No manual resource creation in the portal.
- Structure modules by concern; one parameter file per environment:
  ```
  infrastructure/
    main.bicep
    modules/{appService,database,keyVault,monitoring}.bicep
    parameters/{dev,prod}.bicepparam
  ```
- Review every generated/edited template before deploy; keep dev and prod
  parameters separate.

## Secrets & identity

- Platform secrets live in **Azure Key Vault**; reference them from config —
  never hardcode, never commit.
- Services authenticate with **managed identities**, not connection strings or
  client secrets, wherever supported.
- Give each identity least-privilege RBAC scoped to the resource group it needs.

## Containers & deployment

- Multi-stage Docker builds; keep images minimal. Docker Compose for local dev.
- Deploy by explicit image tag (build id) — never `latest`.
- CI/CD via Azure DevOps or GitHub Actions; promotion is automated, not manual.

## Observability

- Application Insights (or equivalent) wired in every service; ensure the cloud
  role name is set so traces attribute correctly.

## Cost & regions

- Confirm the target subscription/region before running `az` — dev and prod are
  often separate subscriptions. Set `--subscription` explicitly.
