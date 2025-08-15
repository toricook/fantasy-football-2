"use client";

import { useSession } from "next-auth/react";

export default function DebugSession() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div>Loading...</div>;

  return (
    <div className="fixed top-4 right-4 bg-black text-white p-4 rounded text-xs max-w-sm overflow-auto max-h-96 z-50">
      <h3 className="font-bold mb-2">Debug Session:</h3>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}