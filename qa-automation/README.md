# StudyNotion QA Automation

An isolated Playwright and TypeScript automation workspace with browser E2E tests for StudyNotion and API examples against JSONPlaceholder.

## Technology

- Playwright Test
- TypeScript
- Chromium for UI E2E tests
- Playwright `APIRequestContext` for public practice API tests

The automation package and its lockfile are independent of the frontend and backend npm packages.

## Requirements

- Node.js 20 or later
- npm
- The StudyNotion application running separately for UI E2E tests
- Internet access to `https://jsonplaceholder.typicode.com` for API tests

## Setup

From this directory:

```powershell
npm install
npx playwright install chromium
```

Set application URL variables in the current shell or CI environment when running UI tests. The defaults are shown below:

```powershell
$env:FRONTEND_URL = "http://localhost:3000"
$env:BACKEND_URL = "http://localhost:4000/api/v1"
```

`.env.example` documents the variables but is not automatically loaded. Supply values through your shell or CI; do not put credentials or secrets in source control.

API tests use JSONPlaceholder by default and do not call StudyNotion backend endpoints. Optional API settings:

```powershell
$env:API_BASE_URL = "https://jsonplaceholder.typicode.com"
$env:API_RESPONSE_TIME_LIMIT_MS = "10000"
```

## Commands

```powershell
npm test
npm run test:headed
npm run report
```

Run the API test suite:

```powershell
npx playwright test tests/api
npx playwright test tests/api --headed
npx playwright test tests/api --debug
npx tsc --noEmit
```

Run individual API specs:

```powershell
npx playwright test tests/api/get-post.spec.ts
npx playwright test tests/api/create-post.spec.ts
npx playwright test tests/api/update-post.spec.ts
npx playwright test tests/api/delete-post.spec.ts
npx playwright test tests/api/api-assertions.spec.ts
npx playwright test tests/api/request-chaining.spec.ts
npx playwright test tests/api/query-parameters.spec.ts
npx playwright test tests/api/headers.spec.ts
npx playwright test tests/api/schema-validation.spec.ts
npx playwright test tests/api/authentication-concepts.spec.ts
```

## Configuration

`playwright.config.ts` uses the frontend URL as the UI `baseURL` and exposes the frontend and backend URLs as configuration metadata. UI tests run in Chromium projects; API specs have their own `api` project. The config enables parallel execution, an HTML report, and screenshots, video, and traces retained on failure. On CI, retries are enabled and worker count is capped.

This configuration does not start the application server, connect to MongoDB, or call payment, upload, or email services.

## Artifacts

Playwright writes test artifacts to `test-results/` and the HTML report to `playwright-report/`. Both directories are ignored by git.

## API testing

API tests use Playwright's `APIRequestContext` to send HTTP requests and inspect status codes, response headers, and JSON response bodies without launching a browser UI. The custom `apiRequest` fixture creates a context with `API_BASE_URL` and disposes it after each test, keeping the examples isolated and avoiding repeated setup logic.

The examples demonstrate:

- **GET** requests to retrieve one or multiple posts and inspect a not-found response.
- **POST** to submit a new post payload and validate JSONPlaceholder's simulated response. JSONPlaceholder returns a generated ID but does not persist the post.
- **PUT** to submit a complete replacement payload and **PATCH** to update a title while checking other returned fields.
- **DELETE** to inspect the mock API's success response. This does not permanently delete remote data.
- Status and `response.ok()` assertions, JSON body shape and value assertions, content-type and security-header checks, and response duration measured with `Date.now()`.
- A configurable response time threshold of 10,000 ms by default via `API_RESPONSE_TIME_LIMIT_MS`. The threshold is intentionally generous; network latency can still affect public-service checks.

The missing-post endpoint `/posts/999999` was observed to return HTTP 404 with JSON body `{}`. The test asserts that observed behavior rather than assuming a generic API convention.

API tests use only `https://jsonplaceholder.typicode.com`; they do not modify StudyNotion data or contact its authentication, payment, enrollment, or user APIs. UI testing exercises rendered browser behavior; API testing exercises HTTP contracts directly and independently of the React presentation layer.

### Advanced API concepts

- **Request chaining:** `request-chaining.spec.ts` gets a post, uses the returned ID to request `/posts/{id}/comments`, then checks every comment refers to that post and has the expected fields. The second request depends on data from the first; this differs from unrelated requests made in parallel.
- **Query parameters:** `query-parameters.spec.ts` passes `{ params: { userId: 1 } }` to Playwright's request API and checks that every returned post belongs to the requested user.
- **Headers:** `headers.spec.ts` sends `Accept`, `Content-Type`, and a custom client header, then validates actual response content-type and security headers. JSONPlaceholder is not treated as an echo server for arbitrary request headers.
- **Runtime schema validation:** `schema-validation.spec.ts` uses TypeScript type guards to inspect untrusted JSON at runtime. Static TypeScript types alone disappear at runtime and cannot validate a network response. The examples validate a single post, an array of posts, and controlled invalid values with missing or incorrectly typed fields. This demonstrates basic runtime validation without adding a schema library.
- **API authentication:** `authentication-concepts.spec.ts` constructs a Bearer authorization header with a synthetic token and verifies it reaches a Playwright-intercepted route. The route is a local browser-context mock; JSONPlaceholder does not validate the token and no real authentication occurs.
- **API-driven UI testing:** `tests/e2e/api-ui-integration.spec.ts` fetches a real public practice post through `APIRequestContext`, then renders its values into a controlled page and asserts the resulting UI. It demonstrates using API data in a browser test without modifying or depending on the StudyNotion application.

These are distinct techniques: chaining passes an earlier response value into a later request; API authentication demonstrates request-header formation/transport, not server-side identity validation; runtime schema validation checks response data's shape while the test runs; and API-driven UI testing uses API data as input to browser-rendered behavior.

## Advanced browser automation

The browser examples use controlled `page.setContent()` pages, locally fulfilled routes, or a temporary HTTP server bound only to loopback. They do not interact with StudyNotion's business workflows or upload personal files.

Run the browser examples:

```powershell
npx playwright test tests/e2e/advanced-locators-waits.spec.ts
npx playwright test tests/e2e/network-interception.spec.ts
npx playwright test tests/e2e/tabs-and-frames.spec.ts
npx playwright test tests/e2e/file-handling.spec.ts
npx playwright test tests/e2e/dialogs.spec.ts
npx playwright test tests/e2e/browser-contexts.spec.ts
```

### Locator strategies

`advanced-locators-waits.spec.ts` demonstrates accessible role, label, placeholder, and text locators; chaining locators; `filter()` with both `hasText` and `has`; and indexing duplicate matches with `first()`, `nth()`, and `last()`. The duplicate example first asserts the expected count so index-based selection is deliberate.

### Waiting strategies

Playwright actions and web-first assertions auto-wait for their target conditions. The waiting example also demonstrates `waitForSelector()` for a specific DOM condition, `waitForURL()` for navigation, `waitForResponse()` for a matching HTTP response, and `expect.poll()` for asynchronously changing state. It avoids fixed sleeps: waits are tied to an element, URL, response, or observable state.

### Network interception

`network-interception.spec.ts` uses a temporary loopback HTTP server, closed in `finally`, as a safe controlled upstream. It shows `page.route()` with `route.fulfill()` for successful and failing responses, `route.continue()` for a request that reaches the local server, and `route.abort()` for an intentionally blocked request. It also inspects a request header and observed browser response URL/status.

### Tabs, popups, and frames

`tabs-and-frames.spec.ts` waits for a new tab with `context.waitForEvent("page")`, captures a popup with `page.waitForEvent("popup")`, validates each page, and uses `frameLocator()` to interact with and assert content inside an `srcdoc` iframe.

### File handling

`file-handling.spec.ts` uploads only in-memory sample text using `setInputFiles()` and a `filechooser` event. Its download case intercepts a controlled route and validates the suggested filename and downloaded contents; it does not access user files or external downloads.

### Browser dialogs

`dialogs.spec.ts` installs a dialog listener before triggering each JavaScript alert, confirm, or prompt. It demonstrates `dialog.accept()` and `dialog.dismiss()` and checks the resulting browser return values.

### Browser contexts and isolation

`browser-contexts.spec.ts` explicitly creates two independent contexts, seeds different localStorage values and a cookie in only one, then verifies each context's session data remains isolated. The contexts are always closed in a `finally` block. Playwright's built-in per-test context isolation remains in effect for the rest of the suite.

## Debugging, tracing, and reporting

The diagnostics examples are local-only and use controlled page content. Playwright's existing config captures screenshots, videos, and traces on failure; the diagnostics example also saves full-page and element screenshots and records a video for that example on every run. Generated files live under `test-results/`, which is ignored by git.

### Inspector and interactive debugging

Use the Playwright Inspector to step through a test, inspect locators, and pause/resume execution:

```powershell
npx playwright test tests/e2e/debugging-reporting.spec.ts --debug
```

The example's `page.pause()` is gated by `PWDEBUG=1` so normal suite runs do not hang. To enter that explicit pause:

```powershell
$env:PWDEBUG = "1"
npx playwright test tests/e2e/debugging-reporting.spec.ts --debug
Remove-Item Env:PWDEBUG
```

`--debug` launches headed with Inspector-friendly settings. Use it with one focused test or spec while investigating.

### Screenshots, video, and traces

The diagnostics test writes `full-page.png` and `element.png` into its unique Playwright test output directory using `testInfo.outputPath()`. The spec enables video recording for its examples. In the shared config, screenshot, video, and trace capture are also set to `only-on-failure`/`retain-on-failure`, so a failing test retains its failure artifacts.

Open a recorded trace with:

```powershell
npx playwright show-trace test-results/<test-output-folder>/trace.zip
```

Trace Viewer lets you inspect each action, before/after DOM snapshots, source locations, console output, and network requests/responses. Start with the failed action, compare snapshots around it, then inspect the request/response timeline for network-related failures.

### HTML report

The configured HTML reporter generates `playwright-report/` after a test run. Open it with:

```powershell
npx playwright show-report
```

The report summarizes pass/fail/skip status, durations, retries, and project; opening a test provides its error/stack, steps, and attached screenshots, video, or trace when available.

### Diagnosing common failures

- **Assertion or locator error:** read the expected/actual values and the locator call in the stack trace. Use role/label-based locators where possible; inspect the error context or trace snapshot before changing selectors.
- **Timeout:** identify which web-first condition did not become true. Check the URL, rendered state, and whether the test is waiting for the right event rather than adding a fixed sleep.
- **Network failure:** inspect the failing request and response in Trace Viewer. For isolated examples, intercept with `page.route()`; do not silently convert an unexpected service failure into success.
- **Custom diagnostics:** `debugging-reporting.spec.ts` logs concise browser details and attaches structured JSON through `testInfo.attach()`, making context available in the HTML report.

### Test annotations

`test-annotations.spec.ts` demonstrates `test.skip()` for a deliberately skipped example, `test.fixme()` for a known issue, and `test.fail()` for a controlled expected failure. The `test.fail()` expectation is intentionally wrong so Playwright can demonstrate expected-failure reporting; it does not weaken application assertions. `debugging-reporting.spec.ts` uses `test.slow()` to grant a test extra timeout headroom. Skipped/fixme examples are reported as skipped, and an expected failure is reported separately from unexpected failures.

Run the diagnostic examples:

```powershell
npx playwright test tests/e2e/debugging-reporting.spec.ts
npx playwright test tests/e2e/test-annotations.spec.ts
```

## Parallel execution, retries, and sharding

The shared config keeps `fullyParallel: true`, allowing independent tests—including tests within a file—to run concurrently. Playwright gives each test its own browser context and page; worker processes are separate execution slots, and `testInfo.workerIndex` / `parallelIndex` identify the executing worker and parallel slot. Keep state local to a test or provision unique data; do not make test results depend on execution order or shared mutable records.

The existing worker defaults are preserved: CI uses two workers; local runs use Playwright's default worker count. Override the count for a local run with a positive integer:

```powershell
$env:PLAYWRIGHT_WORKERS = "4"
npx playwright test
Remove-Item Env:PLAYWRIGHT_WORKERS
```

You can also override workers for one invocation with `--workers=4`. `fullyParallel` controls whether tests can be scheduled independently; `workers` limits how many worker processes run at once. Avoid serial mode for ordinary independent tests. Use serial grouping only when a workflow is inherently order-dependent and cannot be expressed as independent setup and teardown; usually the better fix is to isolate the test data.

### Retry behavior

The global config retains the prior policy: zero retries locally and two on CI. `parallel-retries.spec.ts` has a local one-retry override and a deterministic teaching example that fails only on its first attempt (`retry === 0`) and passes on retry. It is not a network-dependent flake and does not mask application behavior. The report marks it **flaky** because the initial attempt failed but the retry passed. A real flaky test has inconsistent results under the same conditions; a genuine defect should be investigated and fixed, not hidden by increasing retries.

```powershell
npx playwright test tests/e2e/parallel-retries.spec.ts
npx playwright test tests/e2e/parallel-retries.spec.ts --retries=0
```

The second command intentionally demonstrates that disabling retries exposes the controlled first-attempt failure.

### Tags and selective execution

Tests can be tagged in their title with markers such as `@smoke`, `@regression`, and `@api`. The execution example includes smoke/regression tags; `tests/api/execution-tags.spec.ts` includes an API tag.

```powershell
npx playwright test --grep "@smoke"
npx playwright test --grep "@regression"
npx playwright test --grep "@api"
npx playwright test --grep "@regression" --grep-invert "@smoke"
```

Tags are simple title filters, so combine them with a path or project selector to keep a run focused.

### Sharding and blob reports

Sharding splits the selected suite into balanced subsets across separate processes or CI jobs. Each shard should run with the same project/configuration; project dependencies such as `auth-setup` continue to provide required setup for dependent tests. Playwright `1.64.1` supports the blob reporter and `merge-reports`.

Run both shards into separate directories. Since `merge-reports` accepts one directory, copy both ZIP archives into a flat merge-input directory before generating the combined HTML report:

```powershell
$env:PLAYWRIGHT_BLOB_OUTPUT_DIR = "blob-report/shard-1"
npx playwright test --shard=1/2 --reporter=blob
$env:PLAYWRIGHT_BLOB_OUTPUT_DIR = "blob-report/shard-2"
npx playwright test --shard=2/2 --reporter=blob
Remove-Item Env:PLAYWRIGHT_BLOB_OUTPUT_DIR
New-Item -ItemType Directory -Force "blob-report/merge-input" | Out-Null
Copy-Item "blob-report/shard-1/*.zip" -Destination "blob-report/merge-input"
Copy-Item "blob-report/shard-2/*.zip" -Destination "blob-report/merge-input"
npx playwright merge-reports --reporter html blob-report/merge-input
```

Blob archives and merged reports are generated artifacts under ignored `blob-report/` and `playwright-report/` directories. Shards may each run setup dependencies; setup should therefore remain isolated and safe to repeat.

### Useful execution commands

```powershell
npx playwright test tests/e2e --workers=4
npx playwright test tests/api --workers=4
npx playwright test --project=chromium
npx playwright test --project=chromium-authenticated
npx playwright test --list
```

Worker count is not the same as parallel eligibility: `fullyParallel` enables scheduling; workers cap simultaneous execution. Retries rerun failed tests in a fresh worker/context when possible, and reports show the initial failure, retry attempt, and flaky status. HTML reports and shard artifacts are ignored by git.

## GitHub Actions CI/CD

Continuous integration (CI) runs repeatable checks on changes; continuous delivery/deployment (CD) automates packaging or release after those checks. This workflow provides CI for the isolated Playwright suite. GitHub Actions reads `.github/workflows/playwright.yml` from the repository root and runs its configured jobs on GitHub-hosted Ubuntu runners.

The workflow runs on every push, pull request, and manual `workflow_dispatch`. Its single job runs on Node.js 20 and:

1. Checks out the repository and installs the existing frontend dependencies and the automation dependencies from their respective lockfiles.
2. Installs Chromium and its Linux system dependencies.
3. Starts the existing React frontend on the runner so the UI tests have a local page to visit. The test mocks remain in place; it does not start the Express backend or access MongoDB, Razorpay, or Cloudinary.
4. Runs TypeScript validation, then the complete Playwright suite once. The existing config provides two CI workers, two retries, project dependencies for mocked authentication setup, and the HTML reporter.
5. Uploads the HTML report and Playwright test diagnostics with a 14-day retention period, even when a prior step fails. Screenshots, traces, and videos retained by Playwright on failures are included in the diagnostics.

The workflow requests only `contents: read` permission and needs no GitHub secrets: API exercises use JSONPlaceholder, and authenticated UI state is synthetic. Workflow environment variables configure the local frontend address and startup; no `.env` values are read or copied.

### Enable and run the workflow

Commit/push the workflow file to a GitHub branch to enable push and pull-request runs. In the repository's **Actions** tab, choose **Playwright CI**, then **Run workflow** to start a manual run. The job consists of ordered steps on an ephemeral runner; a failed step fails the job and later ordinary steps are skipped.

Open a failed run in **Actions** and select the failed job/step to inspect its command output and stack traces. Download `playwright-report-and-diagnostics` from the run's **Artifacts** section, then open `playwright-report/index.html` locally or use `npx playwright show-report <downloaded-report-directory>`. The uploaded `test-results/` directory contains retained traces, screenshots, and videos for failed tests when available.

The workflow uses the existing CI retry policy. To retry a failed run, use **Re-run jobs** / **Re-run failed jobs** in the run UI; this re-executes the workflow and may help distinguish a transient failure from a repeatable defect. For local focused diagnosis, use `npx playwright test --last-failed` after a run or filter a specific test with `--grep`.

## Mocked authentication state

The `auth-setup` project writes a synthetic student UI state to `playwright/.auth/mock-student.json`, which is ignored by git. The `chromium-authenticated` project depends on that setup and loads the state for student dashboard UI tests. It contains mock localStorage values only: the token is not a valid JWT and no authenticated cookie is created. These tests exercise the React route guard and client-side logout behavior; they do not prove backend authentication, cookie persistence/revocation, or JWT expiry handling.

The unauthenticated dashboard test and the existing public/login tests run in the regular `chromium` project with a clean context. To run every configured project, use:

```powershell
npx playwright test
```

The authenticated test project can be run with:

```powershell
npx playwright test tests/e2e/student-dashboard.spec.ts --project=chromium-authenticated
```

## Scope and limitations

- Only Chromium is configured initially.
- Authenticated student dashboard tests use synthetic localStorage state only; no real user, backend session, or cookie is used.
- JWT expiry and server-side logout are not covered because the frontend route guard checks token presence only and the backend exposes no logout route.
- No CRUD, payment, upload, or email test cases are included.
- Application-specific tests must remain non-destructive and must not use production services or credentials.
