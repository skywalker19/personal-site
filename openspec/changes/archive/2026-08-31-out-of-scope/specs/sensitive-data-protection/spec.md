## Purpose

Protect the public repository and generated site from exposing credentials or identifying values by requiring safe external configuration, detectable repository boundaries, and clean Git history.

## ADDED Requirements

### Requirement: Publishable repository content contains no sensitive identifiers

Tracked source, documentation, configuration, data snapshots, generated publishable output, and asset metadata MUST NOT contain real credentials, UUIDs, usernames, or email addresses. Values required for operation or publication MUST be masked with neutral placeholders or supplied from external storage at use time.

#### Scenario: Existing sensitive value is found
- **WHEN** a repository audit finds a credential, UUID, username, or email address in publishable content
- **THEN** the value is removed or replaced with a neutral placeholder, and any required real value is relocated to external configuration

#### Scenario: Generated site is inspected
- **WHEN** the site is built from a clean checkout
- **THEN** the generated output contains no real credential, UUID, username, or email address from the protected inventory

### Requirement: Operational values are externally supplied

Synchronization, deployment, and other operational workflows MUST read required sensitive values from environment variables or an approved external secret/configuration store. The repository MAY contain variable names, setup instructions, and unmistakably dummy examples, but MUST NOT contain usable values.

#### Scenario: Workflow runs with external configuration
- **WHEN** an operator supplies the required value through the documented external channel
- **THEN** the workflow can use it without requiring a sensitive value in tracked project content

#### Scenario: Workflow runs without required configuration
- **WHEN** a required external value is absent
- **THEN** the workflow fails clearly before making a partial publication or silently falling back to a hard-coded value

### Requirement: New leaks are detected before publication

The project MUST provide a repeatable validation check for tracked content, staged changes, and generated publishable output. The check MUST identify the protected category and location without printing the full sensitive value, and MUST return a failing status for an unmasked finding.

#### Scenario: Safe change passes validation
- **WHEN** validation scans content containing only placeholders and documented variable names
- **THEN** validation succeeds

#### Scenario: New sensitive value fails validation
- **WHEN** validation scans a staged or publishable file containing a real protected value
- **THEN** validation fails, identifies the file and category, and prevents the change from being treated as publication-ready

### Requirement: Historical repository content is remediated

Reachable Git history for publishable files MUST be audited for protected values. When a finding exists, the affected history MUST be rewritten or otherwise removed from the public repository references, and the cleaned history MUST be verified before publication.

#### Scenario: Historical finding is cleaned
- **WHEN** a reachable historical revision contains a protected value
- **THEN** the public repository references no longer expose that value in file contents, and the verification check reports no historical finding

#### Scenario: History cleanup preserves site behavior
- **WHEN** historical content is rewritten for sensitive-data remediation
- **THEN** unrelated files, published routes, and current site behavior remain unchanged
