import { login, logout, getAccessToken, getPersonUrn } from "../oauth.js";
import { postToLinkedIn } from "../api.js";

// ── DOM refs ──────────────────────────────────────────────────────────────────
const loggedOutEl  = document.getElementById("logged-out");
const loggedInEl   = document.getElementById("logged-in");
const userUrnEl    = document.getElementById("user-urn");
const loginBtn     = document.getElementById("login-btn");
const logoutLink   = document.getElementById("logout-link");
const postForm     = document.getElementById("post-form");
const pageUrlEl    = document.getElementById("page-url");
const pageTitleEl  = document.getElementById("page-title");
const commentaryEl = document.getElementById("commentary");
const scheduleField = document.getElementById("schedule-field");
const scheduleTime  = document.getElementById("schedule-time");
const submitBtn    = document.getElementById("submit-btn");
const statusMsg    = document.getElementById("status-msg");
const modeRadios   = document.querySelectorAll('input[name="post-mode"]');

// ── Helpers ───────────────────────────────────────────────────────────────────
function showStatus(msg, isError = false) {
  statusMsg.textContent = msg;
  statusMsg.className = isError ? "error" : "success";
  statusMsg.classList.remove("hidden");
}

function hideStatus() {
  statusMsg.classList.add("hidden");
}

function setAuthUI(isLoggedIn, personUrn) {
  if (isLoggedIn) {
    loggedOutEl.classList.add("hidden");
    loggedInEl.classList.remove("hidden");
    userUrnEl.textContent = personUrn ?? "Authenticated";
    postForm.classList.remove("hidden");
  } else {
    loggedOutEl.classList.remove("hidden");
    loggedInEl.classList.add("hidden");
    postForm.classList.add("hidden");
  }
}

function getSelectedMode() {
  for (const r of modeRadios) {
    if (r.checked) return r.value;
  }
  return "now";
}

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  // Fill current tab info
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab) {
    pageUrlEl.value   = tab.url   ?? "";
    pageTitleEl.value = tab.title ?? "";
  }

  // Check auth state
  const [token, personUrn] = await Promise.all([getAccessToken(), getPersonUrn()]);
  setAuthUI(!!token, personUrn);
}

// ── Mode toggle ───────────────────────────────────────────────────────────────
modeRadios.forEach((radio) => {
  radio.addEventListener("change", () => {
    const isSchedule = getSelectedMode() === "schedule";
    scheduleField.classList.toggle("hidden", !isSchedule);
    submitBtn.textContent = isSchedule ? "Schedule Post" : "Post";
  });
});

// ── Login ─────────────────────────────────────────────────────────────────────
loginBtn.addEventListener("click", async () => {
  hideStatus();
  loginBtn.disabled = true;
  try {
    const { personUrn } = await login();
    setAuthUI(true, personUrn);
  } catch (err) {
    showStatus(`Login failed: ${err.message}`, true);
  } finally {
    loginBtn.disabled = false;
  }
});

// ── Logout ────────────────────────────────────────────────────────────────────
logoutLink.addEventListener("click", async (e) => {
  e.preventDefault();
  await logout();
  setAuthUI(false, null);
  hideStatus();
});

// ── Submit ────────────────────────────────────────────────────────────────────
postForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  hideStatus();

  const commentary = commentaryEl.value.trim();
  if (!commentary) {
    showStatus("Commentary cannot be empty.", true);
    return;
  }

  const url        = pageUrlEl.value;
  const title      = pageTitleEl.value;
  const mode       = getSelectedMode();
  const [token, personUrn] = await Promise.all([getAccessToken(), getPersonUrn()]);

  if (!token || !personUrn) {
    showStatus("You are not signed in.", true);
    return;
  }

  submitBtn.disabled = true;

  try {
    if (mode === "now") {
      await postToLinkedIn({ token, personUrn, url, title, commentary });
      showStatus("Posted to LinkedIn successfully!");
      commentaryEl.value = "";
    } else {
      const fireAtValue = scheduleTime.value;
      if (!fireAtValue) {
        showStatus("Please select a date and time to schedule.", true);
        return;
      }

      const fireAt = new Date(fireAtValue).getTime();
      if (fireAt <= Date.now()) {
        showStatus("Scheduled time must be in the future.", true);
        return;
      }

      // Save to storage
      const { scheduledPosts = [] } = await chrome.storage.local.get("scheduledPosts");
      scheduledPosts.push({ url, title, commentary, personUrn, fireAt });
      await chrome.storage.local.set({ scheduledPosts });

      // Register alarm (alarm name = fireAt string for easy lookup)
      await chrome.alarms.create(`linkedin-post-${fireAt}`, { when: fireAt });

      showStatus(`Scheduled for ${new Date(fireAt).toLocaleString()}`);
      commentaryEl.value = "";
      scheduleTime.value = "";
    }
  } catch (err) {
    showStatus(`Error: ${err.message}`, true);
  } finally {
    submitBtn.disabled = false;
  }
});

init();

