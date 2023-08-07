import { NextRequest } from "next/server";
import { getServerSideConfig } from "../config/server";
import md5 from "spark-md5";
import { ACCESS_CODE_PREFIX } from "../constant";
import { Auth } from "./my_auth";
import { setBASE_URL } from "./common";
import { useAccessStore } from "../store";
import tr from "../locales/tr";

function getIP(req: NextRequest) {
  let ip = req.ip ?? req.headers.get("x-real-ip");
  const forwardedFor = req.headers.get("x-forwarded-for");

  if (!ip && forwardedFor) {
    ip = forwardedFor.split(",").at(0) ?? "";
  }

  return ip;
}

function parseApiKey(bearToken: string) {
  const token = bearToken.trim().replaceAll("Bearer ", "").trim();
  const isOpenAiKey = !token.startsWith(ACCESS_CODE_PREFIX);

  return {
    accessCode: isOpenAiKey ? "" : token.slice(ACCESS_CODE_PREFIX.length),
    apiKey: isOpenAiKey ? token : "",
  };
}

export async function auth(req: NextRequest) {
  const authToken = req.headers.get("Authorization") ?? "";

  // check if it is openai api key or user token
  const { accessCode, apiKey: token } = parseApiKey(authToken);
  const hashedCode = md5.hash(accessCode ?? "").trim();

  const serverConfig = getServerSideConfig();
  console.log("[Auth] allowed hashed codes: ", [...serverConfig.codes]);
  console.log("[Auth] got access code:", accessCode);
  console.log("[Auth] hashed access code:", hashedCode);
  console.log("[User IP] ", getIP(req));
  console.log("[Time] ", new Date().toLocaleString());

  const ma = await Auth(
    accessCode,
    req.nextUrl.searchParams.get("login") === "true" || false,
  );
  console.log("ma ", ma);

  if (!ma.sk && !token) {
    return {
      error: true,
      msg: !accessCode ? "empty access code" : "wrong access code",
      expiredAt: ma.expiredAt,
    };
  }

  // if user does not provide an api key, inject system api key
  if (!token) {
    const apiKey = ma.sk;
    setBASE_URL(ma.baseUrl);
    // getServerSideConfig().baseUrl = ma.baseUrl;
    if (apiKey) {
      console.log("[Auth] use system api key");
      req.headers.set("Authorization", `Bearer ${apiKey}`);
    } else {
      console.log("[Auth] admin did not provide an api key");
    }
  } else {
    console.log("[Auth] use user api key");
  }
  return {
    error: false,
    expiredAt: ma.expiredAt,
    trail: ma.trail,
  };
}
