# UniMate --- Technical Requirements Document (TRD)

**Document status:** Proposed technical baseline; validate against the
actual repository before implementation.

------------------------------------------------------------------------

## 1. Purpose

This document describes the intended technical structure, service
boundaries, data responsibilities, security expectations, and
verification approach for UniMate.

It is not permission to replace an existing working architecture. Phase
1 must inspect the current codebase and report differences between the
actual implementation and this target direction before making structural
changes.

## 2. Proposed technology stack

  -----------------------------------------------------------------------
  Area                    Proposed technology     Responsibility
  ----------------------- ----------------------- -----------------------
  Frontend                React + Vite            Application UI

  Styling                 Tailwind CSS            Design tokens and
                                                  responsive styling

  Routing                 React Router            Client-side navigation

  HTTP client             Axios or existing       API communication
                          standard client         

  Core backend            Node.js + Express       Authentication,
                                                  authorization, business
                                                  APIs

  AI backend              Python + FastAPI        AI assistant and NLP
                                                  integration

  Database                MySQL                   Persistent relational
                                                  data

  Version control         Git + GitHub            Source history and
                                                  collaboration

  API testing             Postman                 Endpoint verification
  -----------------------------------------------------------------------

Use the versions and package manager already present in the repository
unless a compatibility or security reason requires a change. Pin
dependencies appropriately and avoid unnecessary package churn.

## 3. Logical architecture

``` text
Browser
  |
  v
React + Vite
  |
  | HTTPS / REST JSON
  v
Node.js + Express API
  |             \
  |              \ Internal service request
  v               v
MySQL          Python + FastAPI
                   |
                   v
              AI model/provider
```

### 3.1 Frontend responsibilities

-   Render public landing page (`/`) accessible without authentication, guiding visitors to login or registration.
-   Provide role-appropriate navigation and protected routing (`/dashboard`, `/assistant`, `/navigation`, `/canteen`, `/printing`, `/lost-found`, `/admin`).
-   Enforce client session guards via `ProtectedRoute` and `RoleRoute`.
-   Validate inputs for usability; never rely on client validation for
    security.
-   Call backend APIs.
-   Present loading, empty, success, and error states.
-   Keep sensitive secrets out of browser code.
-   Follow `UI_UX.md`.

### 3.2 Express backend responsibilities

-   Authenticate users and manage sessions/tokens according to the
    selected auth design.
-   Enforce role-based and record-ownership authorization.
-   Validate request payloads.
-   Implement core module workflows.
-   Coordinate database operations.
-   Handle file upload metadata and secure file access where applicable.
-   Call the AI service through a controlled internal API.
-   Return consistent API responses and appropriate HTTP status codes.

### 3.3 FastAPI service responsibilities

-   Provide a clearly defined API for AI assistant operations.
-   Validate incoming requests.
-   Integrate with the selected model/provider.
-   Use approved campus information sources when configured.
-   Handle timeouts, provider errors, and rate limits.
-   Return structured results and source references where supported.
-   Avoid making direct privileged changes to core application records.

The AI provider, model, retrieval approach, and campus knowledge corpus
are open decisions. Do not hardcode a provider or claim
retrieval-grounded answers until the source pipeline is implemented and
tested.

### 3.4 Database responsibilities

MySQL is the proposed relational database. Use migrations or a
repeatable schema-management process. Enforce constraints and indexes
where appropriate. Store timestamps consistently and define the timezone
policy.

## 4. Suggested domain model

The final schema must be derived from the actual requirements and
repository. The following is a logical starting point, not a finalized
SQL schema.

  ---------------------------------------------------------------------------
  Entity                      Purpose                 Example relationships
  --------------------------- ----------------------- -----------------------
  `users`                     User identity and       Has role/permissions;
                              account data            owns requests

  `roles` / permissions       Access control          Assigned to users

  `campus_locations`          Verified campus places  Searchable location
                                                      records

  `assistant_conversations`   Optional query history  Belongs to a user

  `assistant_messages`        Optional messages in a  Belongs to a
                              conversation            conversation

  `menu_items`                Canteen menu            Managed by authorized
                                                      operator

  `orders`                    Student pre-orders      Belongs to student

  `order_items`               Items and quantities in Belongs to an order
                              an order                

  `print_requests`            Xerox/printing jobs     Belongs to student

  `uploaded_files`            Private file metadata   Linked to an authorized
                                                      owner/request

  `lost_found_items`          Lost/found listings     Has reporter/owner and
                                                      status

  `status_history`            Auditable workflow      References relevant
                              changes                 service record
  ---------------------------------------------------------------------------

Technical requirements: - Use stable primary keys. - Add foreign keys
for relational integrity. - Index fields used frequently for lookup,
filtering, and ownership checks. - Avoid storing passwords in plaintext;
use a suitable password hashing algorithm if local password
authentication is used. - Do not store file contents in ordinary
relational columns unless there is a deliberate, justified design
decision. - Keep private file storage access-controlled. - Define
retention and deletion behavior for uploaded documents and personal
data.

## 5. API conventions

Use versioned REST routes if the repository does not already have an
established convention. Example route shapes below are illustrative, not
a promise that these exact endpoints already exist.

``` text
/api/v1/auth/...
/api/v1/users/...
/api/v1/assistant/...
/api/v1/locations/...
/api/v1/canteen/menu/...
/api/v1/canteen/orders/...
/api/v1/printing/requests/...
/api/v1/lost-found/items/...
/api/v1/admin/...
```

### 5.1 API behavior

-   Use correct HTTP methods and status codes.
-   Validate all input on the server.
-   Return consistent error objects.
-   Never trust a user ID or role supplied by the client as proof of
    authorization.
-   Enforce ownership in database queries or service logic.
-   Paginate potentially large listing endpoints.
-   Use filtering and sorting parameters with allowlists.
-   Avoid returning internal stack traces or secrets.

Illustrative response envelope:

``` json
{
  "success": true,
  "data": {},
  "message": "Request completed"
}
```

Illustrative error:

``` json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Please check the submitted information"
  }
}
```

Do not force these envelopes onto an existing API if it already has a
consistent convention; document and preserve the existing convention
unless a migration is approved.

## 6. Authentication and authorization

-   Authentication must be handled by a trusted backend mechanism.
-   Store credentials securely and hash passwords using a suitable
    algorithm.
-   Protect secrets and signing keys with environment variables.
-   Apply role-based access control and record-level ownership checks.
-   Use secure cookie settings if cookie-based sessions are selected.
-   If bearer tokens are used, define expiry, refresh, revocation, and
    storage behavior.
-   Apply rate limiting to authentication and abuse-prone endpoints.
-   Do not put privileged API keys in frontend environment variables.
-   Protect state-changing requests against the relevant web security
    risks.
-   Log security-relevant events without logging passwords, tokens, or
    sensitive document contents.

The exact authentication mechanism must be selected after repository
inspection. Do not implement multiple competing auth systems.

## 7. File upload and printing security

For Xerox/Printing uploads: - Allow only explicitly supported file
types. - Enforce a configurable maximum file size. - Validate actual
file content where practical, not only the filename extension. -
Generate safe storage names; do not trust user-supplied paths. - Keep
files private by default. - Authorize every download or preview. - Avoid
serving executable content. - Define retention/deletion behavior. -
Return clear errors for unsupported or failed uploads.

Do not invent file types, file size limits, pricing, or storage
provider. Record the agreed configuration.

## 8. AI service requirements

-   Keep provider credentials on the server.
-   Validate and bound prompt/input size.
-   Add request timeouts and graceful failure behavior.
-   Apply appropriate rate limiting.
-   Avoid sending unnecessary personal data to an external model.
-   Use verified campus sources for factual campus answers when
    available.
-   Provide a clear fallback when the assistant cannot answer reliably.
-   Do not let model output bypass application authorization or directly
    execute privileged actions.
-   Treat retrieved documents and user input as untrusted data.
-   Record source metadata/citations when the chosen AI design supports
    them.

AI response quality must be evaluated with a small, documented set of
representative campus questions, including questions for which the
correct behavior is to say that information is unavailable.

## 9. Configuration and environments

Use environment variables for configuration. Provide a safe
`.env.example` with placeholders, never real values.

Potential configuration categories: - Frontend API base URL. - Core
backend port and allowed origins. - Database host, port, database name,
username, and password. - Authentication secrets and expiry settings. -
AI service URL, provider key, model identifier, timeout. - Upload
storage configuration and size/type limits. - Logging level and
environment mode.

Validate required configuration at startup and fail with a safe,
actionable message. Never overwrite the user's existing `.env`.

## 10. Security and privacy baseline

-   Least privilege for all roles.
-   Backend authorization on every protected operation.
-   Input validation and output encoding.
-   Secure password handling.
-   Safe file upload and download controls.
-   CORS restricted to approved origins.
-   Rate limiting for sensitive endpoints.
-   Safe error messages.
-   No secrets in source control.
-   No private student records exposed in public listings.
-   No unnecessary personal data in AI prompts or logs.
-   Dependencies kept reasonably current and reviewed for known
    vulnerabilities.

## 11. Testing strategy

### Unit tests

-   Validation and business rules.
-   Status transition rules.
-   Authorization helpers.
-   Data transformation and service functions.

### API/integration tests

-   Authentication and role enforcement.
-   Create/read/update workflows for each module.
-   Ownership isolation.
-   Invalid payloads and missing records.
-   Database persistence.
-   AI service timeout and unavailable-provider behavior.
-   Upload validation and protected file access.

### End-to-end/manual tests

-   Student can complete the principal journey for each of the five
    modules.
-   Operator can process assigned work.
-   Admin can access permitted management screens.
-   Responsive layouts work at representative screen sizes.
-   Loading, empty, success, and failure states are visible and usable.

### Build and quality checks

Run the scripts actually defined in the repository, such as lint, test,
and build. Do not claim a check passed unless it was executed and its
result observed.

## 12. Observability and error handling

-   Use structured, appropriately leveled logs.
-   Include correlation/request IDs where practical.
-   Do not log secrets or sensitive file contents.
-   Handle database unavailability and AI provider errors gracefully.
-   Show user-safe messages in the UI while retaining useful diagnostic
    detail in protected server logs.
-   Provide health/readiness endpoints if appropriate to the existing
    deployment model.

## 13. Deployment direction

Deployment provider and topology are not yet confirmed. Before
deployment: - Separate development and production configuration. - Use
HTTPS. - Configure trusted origins. - Provision the database securely. -
Apply schema migrations. - Configure secrets through the hosting
platform. - Verify upload persistence and access controls. - Verify AI
provider connectivity and quotas. - Test health checks, logs, and
recovery behavior.

Do not assume a particular hosting platform or claim production
readiness before deployment verification.

## 14. Engineering constraints for Antigravity

1.  Inspect the repository before editing.
2.  Preserve existing working code and conventions.
3.  Do not replace the stack without explicit approval.
4.  Do not invent environment variables, scripts, API routes, or
    database state; inspect first.
5.  Make focused, reviewable changes.
6.  Do not silently delete files or reset configuration.
7.  Keep frontend and backend responsibilities clear.
8.  Add or update tests for changed behavior.
9.  Run relevant checks and report exact outcomes.
10. Stop at the current authorized phase and wait for approval.

## 15. Technical decisions register

Record each decision with date, decision, rationale, alternatives
considered, and impact.

Initial items requiring verification: - Actual repository structure and
package manager. - Existing frontend/backend framework and versions. -
Existing database and schema. - Authentication mechanism and role
model. - AI model/provider and grounding strategy. - File storage
provider and limits. - Campus map/location data source. - Hosting and
deployment target.
