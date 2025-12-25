// Minimal v1 content script: detect job pages and send metadata to Aureo

function detectJobMetadata() {
  const title =
    document.querySelector("h1")?.innerText ||
    document.title ||
    undefined;

  const company =
    document
      .querySelector('meta[name="og:site_name"]')
      ?.getAttribute("content") || undefined;

  return {
    jobUrl: window.location.href,
    title,
    company,
  };
}

function sendToAureo() {
  const payload = detectJobMetadata();

  fetch("http://localhost:3000/api/extension/capture-application", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  }).catch(() => {
    // Best-effort only for local dev
  });
}

// Fire once shortly after load; more advanced heuristics can be added later.
setTimeout(sendToAureo, 3000);



