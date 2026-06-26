import { postToLinkedIn } from "./api.js";

chrome.runtime.onInstalled.addListener(() => {
  console.log("linkedin-post-extension installed");
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (!alarm.name.startsWith("linkedin-post-")) return;

  const fireAt = parseInt(alarm.name.replace("linkedin-post-", ""), 10);

  const { scheduledPosts = [], linkedinToken: token } =
    await chrome.storage.local.get(["scheduledPosts", "linkedinToken"]);

  const postIndex = scheduledPosts.findIndex((p) => p.fireAt === fireAt);
  if (postIndex === -1) return;

  const { url, title, commentary, personUrn } = scheduledPosts[postIndex];

  try {
    await postToLinkedIn({ token, personUrn, url, title, commentary });
    console.log(`Scheduled post fired at ${new Date(fireAt).toISOString()}`);
  } catch (err) {
    console.error("Scheduled post failed:", err.message);
  }

  // Remove the fired post regardless of outcome
  scheduledPosts.splice(postIndex, 1);
  await chrome.storage.local.set({ scheduledPosts });
});

