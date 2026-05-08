import axios from "axios";

const API_BASE =
  "http://localhost:8000/learner/ai";

// =========================================CHAT NORMAL=========================================

export const aiChatAPI = async (
  token,
  context,
  messages
) => {


  const response = await axios.post(

    `${API_BASE}/chat`,

    {
        context,
        messages: messages.map((m) => ({

            text: m.text,

            is_ai:Boolean(m.isAi),
        })),
    },

    {
      headers: {

        Authorization:
          `Bearer ${token}`,

        "Content-Type": "application/json",

        
      },
    }
  );

  return response.data;
};

// =========================================CHAT BY VIDEO=========================================

export const aiChatByVideoAPI =
  async (
    token,
    videoId,
    messages
  ) => {
    const payload = {
        video_id: String(videoId),
        messages: messages.map((msg) => ({
            is_ai: Boolean(msg.isAi),
            text: String(msg.text || ""),
        })),
    };

    console.log("CHAT PAYLOAD =",payload);

    const response =
      await axios.post(

        `${API_URL}/chat-by-video`, payload,

       

        {
          headers: {

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );

    return response.data;
  };

// =========================================SUMMARY NORMAL=========================================

export const aiSummaryAPI =
  async (
    token,
    context,
    language = "vi"
  ) => {

    const response =
      await axios.post(

        `${API_BASE}/summary`,

        {
          context,
          language,
        },

        {
          headers: {

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );

    return response.data;
  };

// =========================================SUMMARY BY VIDEO=========================================

export const getSummaryByVideoAPI =
  async (
    token,
    videoId,
    language = "vi"
  ) => {

    const response =
      await axios.post(

        `${API_BASE}/summary-by-video`,

        {
          video_id: videoId,
          language,
        },

        {
          headers: {

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );

    return response.data;
  };

// =========================================QUIZ NORMAL=========================================

export const aiQuizAPI =
  async (
    token,
    context,
    numQuestions = 5,
    language = "vi"
  ) => {

    const response =
      await axios.post(

        `${API_BASE}/quiz`,

        {
          context,

          num_questions:
            numQuestions,

          language,
        },

        {
          headers: {

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );

    return response.data;
  };

// =========================================QUIZ BY VIDEO=========================================

export const getQuizByVideoAPI =
  async (
    token,
    videoId,
    numQuestions = 5,
    language = "vi"
  ) => {

    const response =
      await axios.post(

        `${API_BASE}/quiz-by-video`,

        {
          video_id: videoId,

          num_questions:
            numQuestions,

          language,
        },

        {
          headers: {

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );

    return response.data;
  };

// ========================================= MINDMAP NORMAL =========================================

export const aiMindmapAPI =
  async (
    token,
    context,
    language = "vi"
  ) => {

    const response =
      await axios.post(

        `${API_BASE}/mindmap`,

        {
          context,
          language,
        },

        {
          headers: {

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );

    return response.data;
  };

// ========================================= MINDMAP BY VIDEO=========================================

export const aiMindmapByVideoAPI =
  async (
    token,
    videoId,
    language = "vi"
  ) => {

    const response =
      await axios.post(

        `${API_BASE}/mindmap-by-video`,

        {
          video_id: videoId,
          language,
        },

        {
          headers: {

            Authorization:
              `Bearer ${token}`,

            "Content-Type":
              "application/json",
          },
        }
      );

    return response.data;
  };