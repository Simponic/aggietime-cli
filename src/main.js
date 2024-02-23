#!/usr/bin/env node

import { KILL_SIGNALS, REFRESH_JWT_MS } from "./constants.js";

import { build_args } from "./args.js";
import * as actions from "./actions.js";
import * as session from "./session.js";
import retrieve_creds from "./retrieve_creds.js";
import * as net from "net";
import * as dotenv from "dotenv";
import * as fs from "fs";

const run_action = (args) => {
  const { socket_path, action, position_id } = args;
  const connection = net.connect(socket_path);

  connection.on("data", (data) => {
    if (Buffer.isBuffer(data)) {
      console.log(data.toString().trim());
    } else {
      console.log(data.trim());
    }
    connection.end();
  });

  connection.write(JSON.stringify({ action, rest: { position_id } }));
};

const kill_server = (server, socket_path) => {
  server.close();
  try {
    fs.unlinkSync(socket_path);
  } finally {
    process.exit();
  }
};

const start_server = async (
  { cookie_on_stdin, socket_path, pass_cmd },
  on_exit = () => {},
) => {
  if (fs.existsSync(socket_path)) {
    console.error(
      `ERR: Socket '${socket_path}' already exists.
If no server process is running, remove it (this should've been done automatically, except in the event of a catastrophic failure)
OR
specify another socket path with --socket_path`,
    );
    process.exit(1);
  }

  if (!cookie_on_stdin) {
    const { anumber, password } = await retrieve_creds(pass_cmd);
    await session.login(anumber, password);
  } else {
    let cookie = "";
    for await (const chunk of process.stdin) cookie += chunk;
    await session.setCookie(cookie);
  }

  session.refresh_jwt();
  setInterval(session.refresh_jwt, REFRESH_JWT_MS);

  const unix_server = net.createServer((client) => {
    client.on("data", (data) => {
      // 4096 byte limitation since we don't buffer here
      let body;
      try {
        body = JSON.parse(data);
      } catch {
        console.error("Client provided invalid JSON data");
        return;
      }

      actions
        .do_action(body)
        .then((resp) => {
          client.write(JSON.stringify(resp) + "\r\n");
        })
        .catch((e) => {
          console.error(e);
          console.log(e);

          client.write(JSON.stringify({ err: true }) + "\r\n");
        });
    });
  });

  unix_server.on("close", () => kill_server(unix_server, socket_path));

  console.log(`Server listening on socket ${socket_path}...`);
  unix_server.listen(socket_path);

  // Attempt to clean up socket before process gets killed
  KILL_SIGNALS.forEach((signal) =>
    process.on(signal, () => kill_server(unix_server, socket_path)),
  );
};

export default async () => {
  dotenv.config();
  const args = build_args();

  if (args.daemon) {
    try {
      start_server(args, session.logout);
    } catch (e) {
      console.error(e);
      if (fs.existsSync(args.socket_path)) {
        fs.unlinkSync(args.socket_path);
      }
    }
  } else if (args.action) {
    if (fs.existsSync(args.socket_path)) {
      run_action(args);
    } else {
      console.error(`ERR: No such socket '${args.socket_path}'`);
    }
  }
};
