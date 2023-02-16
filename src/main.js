import {
  DEFAULT_SOCKET_PATH,
  KILL_SIGNALS,
  REFRESH_JWT_MS,
} from "./constants.js";
import * as actions from "./actions.js";
import * as session from "./session.js";
import * as argparse from "argparse";
import * as net from "net";
import * as dotenv from "dotenv";
import * as fs from "fs";

const main = async () => {
  dotenv.config();
  const args = build_args();

  if (args.daemon) {
    try {
      start_server(args.socket_path, session.logout);
    } catch {
      fs.unlinkSync(args.socket_path);
    }
  }
};

const build_args = () => {
  const parser = new argparse.ArgumentParser({ description: "AggieTime CLI" });

  parser.add_argument("-d", "--daemon", {
    help: "Start server as a process blocking daemon",
    action: argparse.BooleanOptionalAction,
    default: true,
  });

  parser.add_argument("-s", "--socket_path", {
    default: DEFAULT_SOCKET_PATH,
    help: `Set server socket path, defaults to ${DEFAULT_SOCKET_PATH}`,
  });

  return parser.parse_args();
};

const kill_server = (server, socket_path) => {
  server.close();

  try {
    fs.unlinkSync(socket_path);
  } finally {
    process.exit();
  }
};

const start_server = async (socket_path, on_exit = () => {}) => {
  if (fs.existsSync(socket_path)) {
    console.error(
      `ERR: Socket '${socket_path}' already exists.
If no server process is running, remove it (this should've been done automatically, except in the event of a catastrophic failure)
OR
specify another socket path with --socket_path`
    );
    process.exit(1);
  }

  await session.login(process.env.A_NUMBER, process.env.PASSWORD);
  session.refresh_jwt();
  setInterval(session.refresh_jwt, REFRESH_JWT_MS);

  const unix_server = net.createServer((client) => {
    client.on("data", (data) => {
      // 4096 byte limitation since we don't buffer here :3
      let body;
      try {
        body = JSON.parse(data);
      } catch {
        console.error("Client provided invalid JSON data");
        return;
      }

      actions.do_action(body);
    });
  });

  unix_server.on("close", () => kill_server(unix_server, socket_path));

  console.log(`Server listening on socket ${socket_path}...`);
  unix_server.listen(socket_path);

  // Attempt to clean up socket before process gets killed
  KILL_SIGNALS.forEach((signal) =>
    process.on(signal, () => kill_server(unix_server, socket_path))
  );
};

main();
