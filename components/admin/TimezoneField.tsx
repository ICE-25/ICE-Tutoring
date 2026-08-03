"use client";

import { useEffect, useState } from "react";
import { BUSINESS_TIMEZONE } from "@/lib/datetime";

/**
 * Reports the browser's IANA timezone alongside a `datetime-local` value.
 *
 * Without this the server has no idea what zone "14:00" meant and falls back
 * to its own — which is UTC on Vercel, three hours off Kampala.
 */
export function TimezoneField({ name = "client_timezone" }: { name?: string }) {
  const [tz, setTz] = useState(BUSINESS_TIMEZONE);

  useEffect(() => {
    const resolved = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (resolved) setTz(resolved);
  }, []);

  return <input type="hidden" name={name} value={tz} readOnly />;
}
