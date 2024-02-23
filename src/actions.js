import * as aggietime from "./aggietime.js";

export const ACTIONS = {
  "clock-in": aggietime.clock_in,
  "clock-out": aggietime.clock_out,
  "current-shift": aggietime.current_shift,
  "current-user": aggietime.get_user_info,
  "status-line": aggietime.get_status_line,
  "past-week": aggietime.last_week,
};

export const do_action = async (body) => {
  const { action, rest } = body;

  return await ACTIONS[action](rest);
};
