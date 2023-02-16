import * as aggietime from "./aggietime.js";

const ACTIONS = {
  "clock-in": aggietime.clock_in,
};

export const do_action = async (body) => {
  const { action, rest } = body;

  return await ACTIONS[action](rest);
};
