import { exec } from "node:child_process";

export default async (cmd) =>
  new Promise((res, rej) => {
    exec(cmd, (_err, stdout, _stderr) => {
      const [password, user_line] = stdout.split("\n");
      const [_anumber_specifier, anumber] = user_line.split("anumber: ");
      res({
        password,
        anumber,
      });
    });
  });
