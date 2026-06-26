const CLIENT_ID = "YOUR_LINKEDIN_CLIENT_ID";
const SCOPES = "w_member_social r_liteprofile";
const REDIRECT_URI = `https://${chrome.runtime.id}.chromiumapp.org/`;

const AUTH_URL =
  "https://www.linkedin.com/oauth/v2/authorization" +
  `?response_type=code` +
  `&client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&scope=${encodeURIComponent(SCOPES)}`;

export async function login() {
  const responseUrl = await chrome.identity.launchWebAuthFlow({
    url: AUTH_URL,
    interactive: true,
  });

  const url = new URL(responseUrl);
  const code = url.searchParams.get("code");
  if (!code) throw new Error("No auth code returned from LinkedIn.");

  // Exchange code for access token via background fetch
  const tokenResponse = await fetch(
    "https://www.linkedin.com/oauth/v2/accessToken",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
        client_id: CLIENT_ID,
        // client_secret must be supplied at runtime via storage or build config;
        // leave blank here and handle server-side if needed.
      }),
    }
  );

  if (!tokenResponse.ok) {
    const text = await tokenResponse.text();
    throw new Error(`Token exchange failed: ${text}`);
  }

  const { access_token } = await tokenResponse.json();

  // Fetch the member's profile to get their URN
  const profileResponse = await fetch(
    "https://api.linkedin.com/v2/me?projection=(id)",
    { headers: { Authorization: `Bearer ${access_token}` } }
  );

  if (!profileResponse.ok) {
    const text = await profileResponse.text();
    throw new Error(`Profile fetch failed: ${text}`);
  }

  const { id: personId } = await profileResponse.json();
  const personUrn = `urn:li:person:${personId}`;

  await chrome.storage.local.set({ linkedinToken: access_token, personUrn });
  return { token: access_token, personUrn };
}

export async function logout() {
  await chrome.storage.local.remove(["linkedinToken", "personUrn"]);
}

export async function getAccessToken() {
  const { linkedinToken } = await chrome.storage.local.get("linkedinToken");
  return linkedinToken ?? null;
}

export async function getPersonUrn() {
  const { personUrn } = await chrome.storage.local.get("personUrn");
  return personUrn ?? null;
}
