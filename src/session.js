import {
  AGGIETIME_URI,
  LOGIN_PATH,
  DUO_IFRAME_SELECTOR,
  DUO_FACTOR,
  DUO_INPUT_FIELD_SELECTORS,
  EXECUTION_SELECTOR,
} from "./constants.js";

import { parse } from "node-html-parser";
import axios from "axios";

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
  const transaction_id = duo_sig.split(":")[0];

  const duo = axios.create({
    withCredentials: true,
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

  return await wait_approve_duo(duo, sid, txid);
};

const wait_approve_duo = async (duo, sid, txid) => {
  // First status to confirm device was pushed to
  // Second to long-poll for approval :3
  const status_params = new URLSearchParams({
    sid,
    txid,
  });

  const data = await duo
    .post("/frame/status", status_params)
    .then(async ({ data }) => {
      if (data.stat === "OK" && data.response.status_code === "pushed")
        return await duo
          .post("/frame/status", status_params)
          .then(({ data }) => data);
      return data;
    });

  const {
    response: { result_url },
  } = data;

  console.log(data);

  return await duo.post(result_url, new URLSearchParams({ sid }));
};

export const login = async (username, password) => {
  const login_page_promise = axios.get(`${AGGIETIME_URI}/${LOGIN_PATH}`);

  const {
    request: {
      res: { responseUrl: response_url },
    },
  } = await login_page_promise;
  const cas_root = await login_page_promise.then(({ data }) => parse(data));
  const execution = cas_root
    .querySelector(EXECUTION_SELECTOR)
    .getAttribute("value");

  const duo_iframe_obj = await axios
    .post(response_url, make_auth_params(username, password, execution))
    .then(({ data }) => parse(data).querySelector(DUO_IFRAME_SELECTOR));

  const cookie = await push_duo_get_cookie(
    duo_iframe_obj,
    response_url,
    username,
    password,
    execution
  );

  console.log(cookie);
  console.log(cookie.data);

  return cookie;
};
