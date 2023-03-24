export const DEFAULT_SOCKET_PATH = "/tmp/aggietimed.sock";
export const KILL_SIGNALS = ["SIGINT", "SIGTERM", "SIGQUIT"];

export const AGGIETIME_DOMAIN = "aggietimeultra.usu.edu";
export const AGGIETIME_URI = `https://${AGGIETIME_DOMAIN}`;
export const AGGIETIME_AUTH_COOKIE_NAME = "access_token_cookie";
export const AGGIETIME_URL_CONTAINS_SIGNIFIES_AUTH_COMPLETE = "employee";

export const REFRESH_JWT_MS = 5 * 1000 * 60;
export const LOGIN_PATH = "api/v1/auth/login";
export const CLOCKIN_PATH = "api/v1/positions/:position/clock_in";
export const CLOCKOUT_PATH = "api/v1/positions/:position/clock_out";
export const USER_PATH = "api/v1/auth/get_user_info";
export const OPEN_SHIFT_PATH = "api/v1/users/:anumber/open_shift";
export const OPEN_SHIFT_EXP_SEC = 60;

export const USER_CACHE_EXP_SEC = 30;

export const SAML_SIGN_IN_TITLE = "Sign in to your account";
export const SAML_SUBMIT_SELECTOR = "input[type=submit]";
export const SAML_EMAIL_SELECTOR = "input[type=email]";
export const SAML_PASSWORD_SELECTOR = "input[type=password]";

export const MAX_DEFAULT_RETRY_AMOUNT = 3;
export const WAIT_MS = 2000;
export const RETRY_EXPONENT = 1.2;
export const RETRY_EXPONENTIAL_FACTOR = 1.1;

export const DEFAULT_PASS_CMD = "pass usu.edu";
