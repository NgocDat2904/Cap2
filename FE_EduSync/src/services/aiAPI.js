const BASE_URL = "http://localhost:8000";

async function parseError(res, fallback) {
  try {
    const data = await res.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) return data.detail.map((d) => d.msg || d).join(" ");
  } catch {
    // ignore
  }
  return fallback;
}

/**
 * @param {string} token - Bearer access_token (learner)
 * @param {{ title: string, description?: string, transcript?: string }} context
 * @param {{ is_ai: boolean, text: string }[]} messages
 */
export async function aiChatAPI(token, context, messages) {
  const res = await fetch(`${BASE_URL}/learner/ai/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ context, messages }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Không gọi được AI chat"));
  return res.json();
}

export async function aiSummaryAPI(token, context, language = "vi") {
  const res = await fetch(`${BASE_URL}/learner/ai/summary`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ context, language }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Không tạo được tóm tắt"));
  return res.json();
}

export async function aiQuizAPI(token, context, numQuestions = 5, language = "vi") {
  const res = await fetch(`${BASE_URL}/learner/ai/quiz`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      context,
      num_questions: numQuestions,
      language,
    }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Không tạo được quiz"));
  return res.json();
}

export async function aiChatByVideoAPI(token, videoId, messages) {
  const res = await fetch(`${BASE_URL}/learner/ai/chat-by-video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ video_id: videoId, messages }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Không gọi được AI chat"));
  return res.json();
}

export async function aiSummaryByVideoAPI(token, videoId, language = "vi") {
  const res = await fetch(`${BASE_URL}/learner/ai/summary-by-video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ video_id: videoId, language }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Không tạo được tóm tắt"));
  return res.json();
}

export async function aiQuizByVideoAPI(token, videoId, numQuestions = 5, language = "vi") {
  const res = await fetch(`${BASE_URL}/learner/ai/quiz-by-video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      video_id: videoId,
      num_questions: numQuestions,
      language,
    }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Không tạo được quiz"));
  return res.json();
}

export async function aiMindmapAPI(token, context, language = "vi") {
  const res = await fetch(`${BASE_URL}/learner/ai/mindmap`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ context, language }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Không tạo được mindmap"));
  return res.json();
}

export async function aiMindmapByVideoAPI(token, videoId, language = "vi") {
  const res = await fetch(`${BASE_URL}/learner/ai/mindmap-by-video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ video_id: videoId, language }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Không tạo được mindmap"));
  return res.json();
}

export async function generateVideoTranscriptAPI(
  token,
  videoId,
  { language = "vi", force = false } = {},
) {
  const res = await fetch(`${BASE_URL}/instructor/videos/${videoId}/transcript`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ language, force }),
  });
  if (!res.ok) throw new Error(await parseError(res, "Không tạo được transcript"));
  return res.json();
}
