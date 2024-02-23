import { DEFAULT_SOCKET_PATH, DEFAULT_PASS_CMD } from "./constants.js";
import { ACTIONS } from "./actions.js";
import * as argparse from "argparse";

export const build_args = () => {
  const parser = new argparse.ArgumentParser({ description: "AggieTime CLI" });

  parser.add_argument("-cos", "--cookie-on-stdin", {
    help: "set AggieTime cookie from stdin",
    action: argparse.BooleanOptionalAction,
    default: false,
  });

  parser.add_argument("-d", "--daemon", {
    help: "start server as a process blocking daemon",
    action: argparse.BooleanOptionalAction,
    default: false,
  });

  parser.add_argument("-pos", "--position-id", {
    help: "your AggieTime Position ID (for usage with --action clock_in or clock_out). (default: first returned by AggieTime)",
    default: undefined,
  });

  parser.add_argument("-s", "--socket_path", {
    default: DEFAULT_SOCKET_PATH,
    help: `set server socket path (default: ${DEFAULT_SOCKET_PATH})`,
  });

  parser.add_argument("-p", "--pass_cmd", {
    default: DEFAULT_PASS_CMD,
    help: `set anumber/password collection retrieval command (default: "${DEFAULT_PASS_CMD}")`,
  });

  parser.add_argument("-a", "--action", {
    help: `ignored when daemon flag is set. possible actions are: ${Array.from(
      Object.keys(ACTIONS),
    )
      .map((x) => `"${x}"`)
      .join(", ")}.`,
  });

  return parser.parse_args();
};
