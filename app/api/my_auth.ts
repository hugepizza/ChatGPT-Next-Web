import { getServerSideConfig } from "../config/server";

// secret=username+code
export async function Auth(secret: string) {
  console.log("secret" + secret);
  console.log(getServerSideConfig().myAuthUrl);

  const res = await fetch(getServerSideConfig().myAuthUrl || "", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ secret: secret }),
  });
  const j = await res.json();
  return j as { sk: string; baseUrl: string };
}
