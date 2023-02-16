import {
  AGGIETIME_URI,
  AGGIETIME_DOMAIN,
  USER_PATH,
  USER_CACHE_EXP_SEC,
  CLOCKIN_PATH,
} from "./constants.js";

import { client } from "./axios_client.js";

import expireCache from "expire-cache";

const replace_path_args = (path, map) =>
  path.replaceAll(/:([a-zA-Z0-9_]+)/g, (_, key) => map[key]);

const get_user_position_or_specified = async (position) => {
  const { positions } = await get_user_info();

  if (!position && positions.length != 1) {
    throw "Must specify a position when there's not only one to choose from";
  } else if (!position) {
    position = positions[0];
  }

  return position;
};

export const get_user_info = async () => {
  if (!expireCache.get("user")) {
    const user = await client
      .get(`${AGGIETIME_URI}/${USER_PATH}`)
      .then(({ data, config }) => {
        const csrf_token = config.jar
          .toJSON()
          .cookies.find(
            ({ domain, key }) =>
              domain === AGGIETIME_DOMAIN && key === "XSRF-TOKEN"
          ).value;
        expireCache.set("aggietime-csrf", csrf_token);
        return data;
      });

    expireCache.set("user", user, USER_CACHE_EXP_SEC);
  }
  return expireCache.get("user");
};

export const clock_in = async ({ position } = {}) => {
  position = await get_user_position_or_specified(position);

  return await client.post(
    `${AGGIETIME_URI}/${replace_path_args(CLOCKIN_PATH, { position })}`,
    {
      comment: "",
    },
    {
      headers: {
        "X-XSRF-TOKEN": expireCache.get("aggietime-csrf"),
      },
    }
  );
};
