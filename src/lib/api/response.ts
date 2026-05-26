import { NextResponse } from "next/server";

import type { ApiErrorCode } from "@/types/domain";

export type ApiSuccess<T> = {
  code: 0;
  message: "success";
  data: T;
};

export type ApiFailure = {
  code: ApiErrorCode;
  message: string;
  data: null;
};

export function ok<T>(data: T, init?: ResponseInit) {
  return NextResponse.json<ApiSuccess<T>>(
    {
      code: 0,
      message: "success",
      data,
    },
    init,
  );
}

export function fail(code: ApiErrorCode, message: string, init?: ResponseInit) {
  const status = typeof code === "number" ? code : 400;

  return NextResponse.json<ApiFailure>(
    {
      code,
      message,
      data: null,
    },
    {
      status,
      ...init,
    },
  );
}

export function notImplemented(feature: string) {
  return fail(404, `${feature} is scaffolded but not implemented yet`);
}
