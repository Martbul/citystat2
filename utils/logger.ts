// logger.js
const LOGTAIL_SOURCE_TOKEN = "YOUR_LOGTAIL_SOURCE_TOKEN"; // paste from Logtail
const LOGTAIL_URL = "https://in.logtail.com/";

export const logEvent = async (message, extra = {}) => {
  try {
    await fetch(LOGTAIL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOGTAIL_SOURCE_TOKEN}`,
      },
      body: JSON.stringify({
        dt: new Date().toISOString(),
        message,
        ...extra,
      }),
    });
  } catch (err) {
    if (__DEV__) console.error("Failed to send log to Logtail:", err);
  }
};
