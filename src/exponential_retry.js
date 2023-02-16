import {
  MAX_DEFAULT_RETRY_AMOUNT,
  WAIT_MS,
  RETRY_EXPONENT,
  RETRY_EXPONENTIAL_FACTOR,
} from "./constants.js";

const wait_for = (ms) => new Promise((rs) => setTimeout(rs, ms));

export const with_exponential_retry = async (
  promise_fn,
  validation_fn = (x) => Promise.resolve(!!x),
  max_retries = MAX_DEFAULT_RETRY_AMOUNT,
  retries = 0
) => {
  try {
    if (retries)
      await wait_for(
        WAIT_MS * Math.pow(RETRY_EXPONENT, RETRY_EXPONENTIAL_FACTOR * retries)
      );

    const res = await promise_fn();
    if (await validation_fn(res)) return res;

    throw new Error("Validation predicate not satisfied");
  } catch (e) {
    if (retries >= max_retries) throw e;
    return with_exponential_retry(
      promise_fn,
      validation_fn,
      max_retries,
      retries + 1
    );
  }
};
