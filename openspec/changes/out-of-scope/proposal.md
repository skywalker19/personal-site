## Why

The recent Notion UUID leak showed that non-secret identifiers can still expose internal systems when they are committed to documentation or preserved in Git history. This project contains source code, deployment documentation, generated snapshots, public assets, and automation scripts, so it needs one repository-wide rule for credentials and identifying values before another value is published accidentally.

## What Changes

- Define a repository-wide handling policy for credentials, UUIDs, usernames, and email addresses.
- Remove or replace those values in tracked source, documentation, configuration, snapshots, generated output, and asset metadata with neutral placeholders.
- Move required operational values to environment variables or an approved external secret/configuration store; keep only safe example names and dummy values in the repository.
- Audit the existing working tree and reachable Git history, and remediate any findings without deleting unrelated content or routes.
- Add repeatable local and CI checks that fail when a new credential, UUID, username, or email is introduced into publishable repository content.
- Update contributor, sync, deployment, and publishing documentation so the safe storage boundary is explicit.

## Capabilities

### New Capabilities

- `sensitive-data-protection`: Repository-wide detection, masking, externalization, historical remediation, and regression prevention for credentials and identifying values.

### Modified Capabilities

None. There are no existing main specs; the current site behavior remains unchanged apart from removing sensitive values and enforcing the repository safety boundary.

## Impact

- Affects tracked Markdown, Astro/TypeScript/JavaScript source, JSON snapshots, deployment documentation, workflow configuration, scripts, and any generated files committed for publication.
- Adds a validation/check command and CI integration, with documented false-positive handling that never permits real credentials or personal identifiers to be committed.
- Changes sync and deployment configuration to read required values from environment or external storage rather than hard-coded project values.
- Requires a one-time scan of current files and reachable history, followed by a coordinated history rewrite and remote update where findings exist.
- The scope covers repository content, generated publishable output, and file contents in Git history. Machine-local `.git/config` identity metadata and hosting-provider records are outside the project artifact boundary.
