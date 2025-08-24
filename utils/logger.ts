const BETTERSTACK_SOURCE_TOKEN = "BS2RZYH8oZXYviBPShNuvSEMbJEiKa8C";
const BETTERSTACK_URL = "https://in.logs.betterstack.com";

export const logEvent = async (message:string, extra = {}) => {
  try {
    await fetch(BETTERSTACK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${BETTERSTACK_SOURCE_TOKEN}`,
      },
      body: JSON.stringify({
        dt: new Date().toISOString(),
        level: "info",
        message,
        ...extra,
      }),
    });
  } catch (err) {
    if (__DEV__) console.error("Failed to send log to Better Stack:", err);
  }
};
