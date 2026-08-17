/**
 * Sakib — proxy that verifies a Firebase-signed-in caller, then forwards
 * their question (plus a trimmed summary of their own tracker data) to
 * the Gemini API. The Gemini key lives only in this Worker's secrets,
 * never in the client-side app.
 */

const SYSTEM_PROMPT = `You are Sakib, a friendly assistant embedded inside a personal study-abroad application tracker.
Answer questions using ONLY the JSON data provided below (the user's own applications, deadlines, scholarships and spending) plus general knowledge about studying abroad (visas, SOPs, test prep, etc).
If the data doesn't contain something needed to answer, say so plainly instead of guessing.
Keep answers concise and practical.`;

function corsHeaders(origin, allowedOrigins) {
  const headers = { Vary: "Origin" };
  if (origin && allowedOrigins.includes(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
  }
  return headers;
}

async function verifyIdToken(idToken, apiKey) {
  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ idToken }),
    }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return data.users && data.users[0] ? data.users[0] : null;
}

export default {
  async fetch(request, env) {
    const allowedOrigins = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
    const origin = request.headers.get("Origin") || "";
    const cors = corsHeaders(origin, allowedOrigins);

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }
    if (!allowedOrigins.includes(origin)) {
      return new Response(JSON.stringify({ error: "Origin not allowed" }), {
        status: 403,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "Bad request body" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }
    const { idToken, message, context, history } = body || {};
    if (!idToken || !message) {
      return new Response(JSON.stringify({ error: "idToken and message are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const user = await verifyIdToken(idToken, env.FIREBASE_WEB_API_KEY);
    if (!user) {
      return new Response(JSON.stringify({ error: "Not signed in" }), {
        status: 401,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const contents = [];
    (Array.isArray(history) ? history : []).forEach((h) => {
      if (!h || !h.text) return;
      contents.push({ role: h.role === "sakib" ? "model" : "user", parts: [{ text: String(h.text).slice(0, 4000) }] });
    });
    contents.push({
      role: "user",
      parts: [{ text: `My tracker data (JSON):\n${JSON.stringify(context || {})}\n\nQuestion: ${String(message).slice(0, 2000)}` }],
    });

    let geminiRes;
    try {
      geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents,
            generationConfig: { temperature: 0.4, maxOutputTokens: 800 },
          }),
        }
      );
    } catch (e) {
      return new Response(JSON.stringify({ error: "Could not reach Gemini" }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    if (!geminiRes.ok) {
      const errText = await geminiRes.text().catch(() => "");
      return new Response(JSON.stringify({ error: "Gemini request failed", detail: errText.slice(0, 500) }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...cors },
      });
    }

    const data = await geminiRes.json();
    const reply =
      data &&
      data.candidates &&
      data.candidates[0] &&
      data.candidates[0].content &&
      data.candidates[0].content.parts &&
      data.candidates[0].content.parts.map((p) => p.text || "").join("");

    return new Response(JSON.stringify({ reply: reply || "I couldn't come up with an answer to that — try rephrasing?" }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...cors },
    });
  },
};
