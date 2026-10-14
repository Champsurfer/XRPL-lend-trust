"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // Do not render on the server — the time would be
  // wrong by the time it reaches the browser.
  if (!now) {
    return (
      <div className="text-sm text-gray-500">
        Local time: loading…
      </div>
    );
  }

  const time = now.toLocaleTimeString("en-ZA", {
    hour12: false,
    timeZone: "Africa/Johannesburg",
  });
  const date = now.toLocaleDateString("en-ZA", {
    timeZone: "Africa/Johannesburg",
  });

  return (
    <div className="text-sm text-gray-500">
      Local time (ledger clock arrives in A2):{" "}
      <span className="font-mono text-gray-300">
        {date} {time} SAST
      </span>
    </div>
  );
}
