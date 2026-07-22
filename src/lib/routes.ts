// Shared TanStack Router `to` targets, so every route path template lives in one
// place instead of being repeated across the app. Each is a navigation target (a
// path template with `$params`), NOT a route id: the file-based route *definitions*
// (`createFileRoute('...')`) must stay inline string literals for the router's
// codegen, so those are intentionally left as-is. Plain string-literal consts keep
// TanStack's typed `to`/`params` inference (they narrow to their literal type).

// Marketing / public
export const HOME_ROUTE = '/';
export const FEATURES_ROUTE = '/features';
export const PRICING_ROUTE = '/pricing';
// Competitor comparison pages live under /compare/* so more can be added later.
export const COMPARE_DATADOG_ROUTE = '/compare/datadog';
export const COMPARE_ALLURE_ROUTE = '/compare/allure';
export const COMPARE_REPORTPORTAL_ROUTE = '/compare/reportportal';
export const COMPARE_TESTRAIL_ROUTE = '/compare/testrail';
export const SECURITY_ROUTE = '/security';
export const SUPPORT_ROUTE = '/support';
export const PRIVACY_ROUTE = '/privacy';
export const TERMS_ROUTE = '/terms';

// Auth
export const LOGIN_ROUTE = '/login';
export const SIGNUP_ROUTE = '/signup';
export const FORGOT_PASSWORD_ROUTE = '/forgot-password';
export const INVITE_ROUTE = '/invite';

// Account
export const PROFILE_ROUTE = '/profile';
export const PROFILE_SECURITY_ROUTE = '/profile/security';
export const PROFILE_DANGER_ROUTE = '/profile/danger';

// Org
export const ORGS_ROUTE = '/orgs';
export const ORG_PROJECTS_ROUTE = '/orgs/$orgId/projects';
export const ORG_BILLING_ROUTE = '/orgs/$orgId/billing';
export const ORG_KEYS_ROUTE = '/orgs/$orgId/keys';
export const ORG_KEYS_INGESTION_ROUTE = '/orgs/$orgId/keys/ingestion';
export const ORG_KEYS_MCP_ROUTE = '/orgs/$orgId/keys/mcp';
export const ORG_INTEGRATIONS_ROUTE = '/orgs/$orgId/integrations';
export const ORG_INTEGRATIONS_GITHUB_ROUTE = '/orgs/$orgId/integrations/github';
export const ORG_INTEGRATIONS_SLACK_ROUTE = '/orgs/$orgId/integrations/slack';
export const ORG_SETTINGS_ROUTE = '/orgs/$orgId/settings';
export const ORG_SETTINGS_SSO_ROUTE = '/orgs/$orgId/settings/sso';
export const ORG_SETTINGS_USERS_ROUTE = '/orgs/$orgId/settings/users';
export const ORG_SETTINGS_DOMAINS_ROUTE = '/orgs/$orgId/settings/domains';
export const ORG_SETTINGS_BYOC_ROUTE = '/orgs/$orgId/settings/byoc';

// Project
export const RUNS_ROUTE = '/orgs/$orgId/projects/$projectId/runs';
export const RUN_ROUTE = '/orgs/$orgId/projects/$projectId/runs/$runId';
export const RUN_FILE_ROUTE = '/orgs/$orgId/projects/$projectId/runs/$runId/file';
export const EXPLORER_ROUTE = '/orgs/$orgId/projects/$projectId/explorer';
export const EXPLORER_TEST_ROUTE = '/orgs/$orgId/projects/$projectId/explorer/$testId';
export const FAILING_ROUTE = '/orgs/$orgId/projects/$projectId/failing';
export const FLAKY_ROUTE = '/orgs/$orgId/projects/$projectId/flaky';
export const PROJECT_SETTINGS_ROUTE = '/orgs/$orgId/projects/$projectId/settings';
