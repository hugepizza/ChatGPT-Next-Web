import { type OpenAIListModelResponse } from "@/app/client/platforms/openai";
import { getServerSideConfig } from "@/app/config/server";
import { OpenaiPath } from "@/app/constant";
import { prettyObject } from "@/app/utils/format";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "../auth";

async function handle(req: NextRequest) {
  const authResult = await auth(req);
  if (authResult.error) {
    return NextResponse.json(authResult, {
      status: 401,
    });
  }

  return NextResponse.json(
    { expiredAt: authResult.expiredAt, trail: authResult.trail },
    {
      status: 200,
    },
  );
}

export const GET = handle;

export const runtime = "edge";
