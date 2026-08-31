## 1. Inventory and policy

- [x] 1.1 Define protected categories, placeholder conventions, external configuration channels, and scan boundaries in project documentation; verify the policy covers tracked files, generated output, asset metadata, and reachable file-content history.
- [x] 1.2 Run a redacted audit of the current checkout and reachable Git history, recording only category and path findings; verify the audit output never prints a full credential, UUID, username, or email address.

## 2. Remediate current repository content

- [x] 2.1 Move the Reading source identifier and any other operational identifiers from source-controlled code into documented environment variables or external configuration; verify missing values fail clearly and no hard-coded fallback remains.
- [x] 2.2 Replace sensitive values in README, deployment documentation, workflow/configuration examples, snapshots, and OpenSpec planning artifacts with safe placeholders; verify the current tracked tree passes the sensitive-data check.
- [x] 2.3 Audit committed asset filenames, metadata, and inspectable binary strings; rename or regenerate affected assets and update all references; verify the site builds and no asset reference is broken.

## 3. Implement validation

- [x] 3.1 Add the repository-local sensitive-data validator with high-confidence credential, UUID, and email detection plus environment-supplied protected usernames; verify findings report category and location without exposing full values.
- [x] 3.2 Add passing and failing fixtures for placeholders, real protected values, binary/asset metadata, and generated output; verify the validator returns success only for safe content and a nonzero status for each finding.
- [ ] 3.3 Add a history-scan mode for reachable Git refs and document safe handling of any detected credential; verify the cleaned repository history reports no protected-value finding.
- [x] 3.4 Expose one package command for local validation and document its use before commit and publication; verify a clean checkout can run the command without private values committed locally.

## 4. Integrate publication gates

- [x] 4.1 Run the validator in pull-request CI against tracked content before the build; verify a fixture or temporary test branch containing a protected value fails the workflow step without printing the value.
- [x] 4.2 Run the validator against `dist` after the Astro build and before artifact upload or deployment; verify generated output is blocked when an external value is accidentally rendered.
- [x] 4.3 Update sync, deployment, publishing, and contributor documentation with external configuration requirements and safe examples; verify documentation itself passes the validator.

## 5. Clean public history and verify behavior

- [ ] 5.1 Rewrite public Git file-content history for all identified findings, remove temporary backup refs, and update the remote with a lease; verify public refs contain no historical protected-value finding.
- [ ] 5.2 Run `npm run check` and `npm run build`, then verify existing Things, Reading, and Travel routes and static output remain available apart from intended redactions.
- [ ] 5.3 Review the final diff and scan report for accidental value exposure; verify the working tree is clean and the documented rollback/re-clone guidance matches the resulting history.
