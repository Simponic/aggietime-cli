import { login } from "./session.js";
import * as dotenv from "dotenv";

dotenv.config();

(async () => {
  await login(process.env.A_NUMBER, process.env.PASSWORD);
})();
