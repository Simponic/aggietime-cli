import {
  AGGIETIME_URI,
  LOGIN_PATH,
  USER_PATH,
  DUO_IFRAME_SELECTOR,
  DUO_FACTOR,
  DUO_INPUT_FIELD_SELECTORS,
  EXECUTION_SELECTOR,
} from "./constants.js";

import { client } from "./axios_client.js";

import { parse } from "node-html-parser";
//import axios from "axios";

const make_auth_params = (username, password, execution) =>
  new URLSearchParams({
    username,
    password,
    execution,
    _eventId: "submit",
    geolocation: "",
  });

const push_duo_get_cookie = async (
  duo_iframe_obj,
  response_url,
  username,
  password,
  execution
) => {
  const [duo_host, duo_sig, duo_src] = [
    "data-host",
    "data-sig-request",
    "src",
  ].map((attr) => duo_iframe_obj.getAttribute(attr));
  const transaction_id = duo_sig.split(":").at(0);
  const app = duo_sig.split(":APP").at(-1);

  const duo = client.create({
    baseURL: `https://${duo_host}`,
  });

  const duo_frame = await duo
    .post(
      `/frame/web/v1/auth?tx=${transaction_id}&parent=${response_url}&v=2.6`
    )
    .then(({ data }) => parse(data));

  const [sid, out_of_date, days_out_of_date, days_to_block, device] =
    DUO_INPUT_FIELD_SELECTORS.map((selector) =>
      duo_frame.querySelector(selector).getAttribute("value")
    );

  const push_params = new URLSearchParams({
    sid,
    out_of_date,
    days_out_of_date,
    days_to_block,
    device,
    factor: DUO_FACTOR,
  });

  const {
    response: { txid },
  } = await duo.post("/frame/prompt", push_params).then(({ data }) => data);

  const { cookie, parent } = await wait_approve_duo_cookie_resp(duo, sid, txid);
  return { duo_signed_resp: cookie + ":APP" + app, parent };
};

const wait_approve_duo_cookie_resp = async (duo, sid, txid) => {
  const status_params = new URLSearchParams({
    sid,
    txid,
  });

  // First status to confirm device was pushed to
  // Second to long-poll for approval :3
  const {
    response: { result_url },
  } = await duo.post("/frame/status", status_params).then(async ({ data }) => {
    if (data.stat === "OK" && data.response.status_code === "pushed")
      return await duo
        .post("/frame/status", status_params)
        .then(({ data }) => data);
    return data;
  });

  const {
    response: { cookie, parent },
  } = await duo
    .post(result_url, new URLSearchParams({ sid }))
    .then(({ data }) => data);

  return { cookie, parent };
};

const get_execution = (cas_root) => {};

export const login = async (username, password) => {
  const login_page_promise = client.get(`${AGGIETIME_URI}/${LOGIN_PATH}`);

  const {
    request: {
      res: { responseUrl: response_url },
    },
  } = await login_page_promise;
  let cas_root = await login_page_promise.then(({ data }) => parse(data));
  const login_execution = cas_root
    .querySelector(EXECUTION_SELECTOR)
    .getAttribute("value");

  cas_root = await client
    .post(response_url, make_auth_params(username, password, login_execution))
    .then(({ data }) => parse(data));
  const authed_execution = cas_root
    .querySelector(EXECUTION_SELECTOR)
    .getAttribute("value");

  const duo_iframe_obj = cas_root.querySelector(DUO_IFRAME_SELECTOR);

  const { duo_signed_resp, parent: signed_response_url } =
    await push_duo_get_cookie(
      duo_iframe_obj,
      response_url,
      username,
      password,
      login_execution
    );

  const jwt_cookie_set = await client.post(
    signed_response_url,
    new URLSearchParams({
      execution: authed_execution,
      signedDuoResponse: duo_signed_resp,
      _eventId: "submit",
    })
  );

  return jwt_cookie_set;
};
