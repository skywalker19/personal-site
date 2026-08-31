## Context

This is a static Astro site with committed JSON data, repository-local sync and publishing scripts, deployment workflow configuration, and an existing Git history that contains at least one previously exposed Notion identifier. The current Reading sync also has a source identifier in code, while deployment values are already supplied through GitHub secrets. See `proposal.md` for motivation and `specs/sensitive-data-protection/spec.md` for the behavior contract.

## Goals / Non-Goals

**Goals:**

- Establish one protected-data boundary for tracked files, generated output, and reachable file-content history.
- Make operational identifiers configurable without placing their real values in source control.
- Detect high-confidence credentials, UUIDs, usernames, and email addresses before they reach publication.
- Keep scan failures safe: report category and location, avoid echoing the value, and prevent partial publication.
- Preserve current site routes, public content structure, and static deployment behavior.

**Non-Goals:**

- Removing personal names or ordinary prose that is not an account username or email address.
- Rewriting local Git author configuration or provider-side audit records.
- Building a general-purpose secrets-management service.
- Automatically rotating credentials; suspected credentials must be revoked or rotated through the owning provider.

## Decisions

### 1. Use a repository-local policy and scanner with environment-supplied known values

Add a small, dependency-light validation command that scans tracked text, staged changes, and the generated `dist` directory. It will combine high-confidence format rules for credentials, UUIDs, and email addresses with an optional set of protected usernames supplied through the environment or CI secret context. Findings will be classified and reported as redacted snippets containing only the path and category.

This avoids committing a second inventory of real values merely to detect the first inventory. A generic regex-only scanner is insufficient for usernames, while a hard-coded allowlist would recreate the leakage risk. A large third-party secret scanner is deferred because the site has a small surface and the first requirement is deterministic project-specific coverage.

### 2. Externalize operational identifiers through named environment variables

Required Notion and deployment identifiers will be read from named environment variables or the existing external secret store. `.env.example`, README, and deployment setup documentation may describe variable names and use unmistakable dummy placeholders only. The sync command will validate that required values exist and have the expected shape before making a request; it will never silently use a source-controlled fallback.

This keeps local development, CI, and production configuration compatible while removing hard-coded values from source. A committed configuration file was rejected because it would only move the leak to another tracked format.

### 3. Apply the same check to source, build output, and asset metadata

The validation command will inspect all tracked publishable files, including Markdown, Astro/JavaScript/TypeScript, JSON, workflow/configuration files, and metadata or filenames associated with committed assets. After `npm run build`, it will scan `dist` as a publication boundary. Binary payloads will be handled by extracting inspectable strings or metadata where practical; opaque media whose filename or metadata contains a finding will be renamed or regenerated.

This is stricter than scanning only source text because the site publishes generated HTML and committed media. It also prevents a safe source tree from producing an unsafe artifact through interpolation or copied metadata.

### 4. Separate current-tree remediation from history remediation

First remove or externalize findings in the current checkout, including the Reading sync identifier, deployment documentation examples, asset identifiers, and old planning artifacts that are still tracked. Then scan all file-content revisions reachable from public refs. If a finding exists, perform a coordinated history rewrite with a purpose-built history-filtering tool, remove temporary backup refs, expire local reflogs/prune unreachable objects, and force-update the remote using a lease.

The migration will preserve each commit’s unrelated tree content and verify route/build behavior afterward. Deleting the affected file’s entire history was rejected because it loses useful project provenance and is not required to remove the value.

### 5. Gate pull requests and publication, with one shared command

Expose one documented check command for local use and invoke it in the pull-request workflow before the build. The same command or its publication mode will run against `dist` after building. A finding fails the job; it cannot be silenced with an allowlist containing the real value. CI receives any protected-value inventory through secret variables and does not print those variables in logs.

Using one command avoids drift between local and CI policy. A pre-commit-only hook was rejected because hooks are optional and do not protect pull requests or server-generated output.

## Risks / Trade-offs

- [Username detection can produce false positives] → Restrict automatic matching to configured protected usernames and high-confidence account-handle contexts; report a redacted location for review rather than permitting a real-value allowlist.
- [Existing public-facing copy may be mistaken for an identifier] → Treat ordinary names as outside the protected categories, while requiring account handles and email addresses to be externalized or represented by placeholders.
- [History rewriting disrupts clones and open branches] → Announce the rewrite, use `--force-with-lease`, record the new base commit, and provide re-clone/rebase instructions.
- [Build-time external values could be copied into output] → Scan `dist` after every build and fail before artifact upload or deployment.
- [Binary scanning is incomplete] → Inspect filenames and extractable metadata/strings, require manual review for opaque assets, and keep sensitive operational data out of asset generation inputs.
- [A leaked credential may remain valid outside Git] → Treat every credential finding as a rotation/revocation incident in addition to repository cleanup.

## Migration Plan

1. Inventory protected findings in the current checkout and reachable Git history without printing full values.
2. Externalize operational identifiers, replace documentation examples, and remediate source, snapshots, planning artifacts, generated files, and asset metadata.
3. Add the scanner, local command, CI gate, and publication-output check with safe fixtures for both passing and failing cases.
4. Rewrite and verify public Git history, remove temporary local recovery refs, and update the remote with a lease.
5. Run the normal type check/build and confirm routes and generated output remain unchanged apart from redactions.

Rollback of the code/configuration portion is a normal Git revert. History remediation is intentionally not rolled back after the remote update; any later correction must be another forward rewrite, because restoring the old refs would restore the leak.
