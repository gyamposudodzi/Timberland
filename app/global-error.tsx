"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body style={{ fontFamily: "system-ui, sans-serif", padding: "3rem", textAlign: "center" }}>
        <h1>Something went wrong</h1>
        <p>A critical error occurred. Please reload the page.</p>
        <button onClick={reset}>Reload</button>
        {error.digest ? <p style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>ref: {error.digest}</p> : null}
      </body>
    </html>
  );
}
