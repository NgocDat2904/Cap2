

// ==============================CONFIG==============================

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:8000";

const AI_BASE = `${API_BASE}/learner/ai`;


// ==============================HELPER==============================

const getToken = () => {
  return (
    localStorage.getItem("token") ||
    sessionStorage.getItem("token")
  );
};

const request = async (endpoint, body = {}) => {
  try {
    const token = getToken();

    const response = await fetch(`${AI_BASE}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token && {
          Authorization: `Bearer ${token}`,
        }),
      },
      body: JSON.stringify(body),
    });

    // Parse error text
    if (!response.ok) {
      let errorMessage = `API Error ${response.status}`;

      try {
        const errorData = await response.json();

        errorMessage =
          errorData?.detail ||
          errorData?.message ||
          errorMessage;
      } catch {
        errorMessage = await response.text();
      }

      throw new Error(errorMessage);
    }

    return await response.json();
  } catch (error) {
    console.error(`AI API ERROR (${endpoint}):`, error);
    throw error;
  }
};


// ==============================CHAT==============================

export const chatByVideo = async (
  video_id,
  messages = []
) => {
  return request("/chat-by-video", {
    video_id,
    messages,
  });
};


// ==============================SUMMARY==============================

export const summaryByVideo = async (
  video_id,
  language = "vi"
) => {
  return request("/summary-by-video", {
    video_id,
    language,
  });
};


// ==============================QUIZ==============================

export const quizByVideo = async (
  video_id,
  num_questions = 5,
  language = "vi"
) => {
  return request("/quiz-by-video", {
    video_id,
    num_questions,
    language,
  });
};


// ==============================MINDMAP==============================

export const mindmapByVideo = async (
  video_id,
  language = "vi"
) => {
  return request("/mindmap-by-video", {
    video_id,
    language,
  });
};


// ==============================TIMELINE==============================

export const timelineByVideo = async (
  video_id,
  language = "vi"
) => {
  return request("/timeline-by-video", {
    video_id,
    language,
  });
};


// ==============================NORMAL AI APIs==============================

export const generateSummary = async (
  context,
  language = "vi"
) => {
  return request("/summary", {
    context,
    language,
  });
};

export const generateQuiz = async (
  context,
  num_questions = 5,
  language = "vi"
) => {
  return request("/quiz", {
    context,
    num_questions,
    language,
  });
};

export const generateMindmap = async (
  context,
  language = "vi"
) => {
  return request("/mindmap", {
    context,
    language,
  });
};

export const generateTimeline = async (
  context,
  language = "vi"
) => {
  return request("/timeline", {
    context,
    language,
  });
};

export const chatAI = async (
  context,
  messages = []
) => {
  return request("/chat", {
    context,
    messages,
  });
};


// ==============================DEFAULT EXPORT==============================

const aiAPI = {
  chatByVideo,
  summaryByVideo,
  quizByVideo,
  mindmapByVideo,
  timelineByVideo,

  generateSummary,
  generateQuiz,
  generateMindmap,
  generateTimeline,
  chatAI,
};

export default aiAPI;