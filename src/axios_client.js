import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";
import axios from "axios";

export const jar = new CookieJar();
export const client = wrapper(axios.create({ jar, withCredentials: true }));
