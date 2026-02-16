"use client";
import { SessionProvider } from "next-auth/react";

export default function Providers({ children }) {
  return (
    <SessionProvider
      // refetchInterval={5 * 60} // Refresh every 5 minutes
      refetchOnWindowFocus={true}
      refetchOnMount={true} //   Fetch session when component mounts
      basePath="/api/auth" // Ensure correct API path
    >
      {children}
    </SessionProvider>
  );
}
