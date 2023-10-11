import { Builder, Browser, By, Key, until } from "selenium-webdriver";
import { Cookie } from "tough-cookie";

import {
  AGGIETIME_AUTH_COOKIE_NAME,
  AGGIETIME_DOMAIN,
  AGGIETIME_URI,
  AGGIETIME_URL_CONTAINS_SIGNIFIES_AUTH_COMPLETE,
  LOGIN_PATH,
  SAML_SIGN_IN_TITLE,
  SAML_SUBMIT_SELECTOR,
  SAML_EMAIL_SELECTOR,
  SAML_PASSWORD_SELECTOR,
} from "./constants.js";
import { jar } from "./axios_client.js";
import * as aggietime from "./aggietime.js";

export const refresh_jwt = () => {
  console.log("Refreshing JWT...");

  return aggietime.get_user_info();
};

export const setCookie = (jwt) =>
  jar.setCookie(`${AGGIETIME_AUTH_COOKIE_NAME}=${jwt}`, AGGIETIME_URI);

export const logout = () => client.get(`${AGGIETIME_URI}/${LOGOUT_PATH}`);

export const login = async (a_number, password) => {
  const driver = await new Builder().forBrowser(Browser.CHROME).build();
  let cookie;

  try {
    console.log("Navigating to login path...");
    await driver.get(`${AGGIETIME_URI}/${LOGIN_PATH}`);

    if (a_number && password) {
      console.log("Waiting until we eventually redirect to SAML...");
      await driver.wait(until.titleIs(SAML_SIGN_IN_TITLE));

      console.log("Waiting until email field is located...");
      await driver.wait(until.elementLocated(By.css(SAML_EMAIL_SELECTOR)));

      console.log("Filling email field...");
      await driver
        .findElement(By.css(SAML_EMAIL_SELECTOR))
        .sendKeys(`${a_number}@usu.edu`);
      await driver.findElement(By.css(SAML_SUBMIT_SELECTOR)).click();

      console.log("Waiting until password field is located...");
      await Promise.all(
        [SAML_PASSWORD_SELECTOR, SAML_SUBMIT_SELECTOR].map((selector) =>
          driver.wait(until.elementLocated(By.css(selector))),
        ),
      );

      console.log("Filling password...");
      await driver
        .findElement(By.css(SAML_PASSWORD_SELECTOR))
        .sendKeys(password);

      console.log("Debouncing a bit...");
      await new Promise((res) => setTimeout(res, 500));

      console.log("Submit!");
      await driver
        .wait(until.elementLocated(By.css(SAML_SUBMIT_SELECTOR)))
        .then(() => driver.findElement(By.css(SAML_SUBMIT_SELECTOR)).click());
    }

    await driver.wait(
      until.urlContains(AGGIETIME_URL_CONTAINS_SIGNIFIES_AUTH_COMPLETE),
    );

    console.log("Retrieving cookie...");
    cookie = await driver.manage().getCookie(AGGIETIME_AUTH_COOKIE_NAME);

    await jar.setCookie(
      new Cookie({
        ...cookie,
        key: cookie.name,
      }),
      AGGIETIME_URI,
    );
    console.log("Got it!");
  } finally {
    await driver.quit();
  }

  return cookie;
};
