export const DEFAULT_SOCKET_PATH = "/tmp/aggietimed.sock";
export const KILL_SIGNALS = ["SIGINT", "SIGTERM", "SIGQUIT"];

export const AGGIETIME_DOMAIN = "aggietimeultra.usu.edu";
export const AGGIETIME_URI = `https://${AGGIETIME_DOMAIN}`;
export const REFRESH_JWT_MS = 5 * 1000 * 60;
export const LOGIN_PATH = "api/v1/auth/login";
export const LOGOUT_PATH = "api/v1/auth/logout";
export const CLOCKIN_PATH = "api/v1/positions/:position/clock_in";
export const CLOCKOUT_PATH = "api/v1/positions/:position/clock_out";
export const USER_PATH = "api/v1/auth/get_user_info";
export const OPEN_SHIFT_PATH = "api/v1/users/:anumber/open_shift";
export const OPEN_SHIFT_EXP_SEC = 60;

export const EXECUTION_SELECTOR = "input[type=hidden][name=execution]";
export const DUO_IFRAME_SELECTOR = "#duo_iframe";
export const DUO_FACTOR = "Duo Push";
export const DUO_INPUT_FIELD_SELECTORS = [
  "input[type=hidden][name=sid]",
  "input[type=hidden][name=out_of_date]",
  "input[type=hidden][name=days_out_of_date]",
  "input[type=hidden][name=days_to_block]",
  "input[type=hidden][name=preferred_device]",
];

export const USER_CACHE_EXP_SEC = 30;

export const MAX_DEFAULT_RETRY_AMOUNT = 3;
export const WAIT_MS = 2000;
export const RETRY_EXPONENT = 1.2;
export const RETRY_EXPONENTIAL_FACTOR = 1.1;
