/**
 * Posts an article share to LinkedIn via the UGC Posts API.
 *
 * @param {object} params
 * @param {string} params.token      - LinkedIn OAuth access token
 * @param {string} params.personUrn  - Full URN, e.g. "urn:li:person:abc123"
 * @param {string} params.url        - URL of the article to share
 * @param {string} params.title      - Title of the article
 * @param {string} params.commentary - Text commentary for the post
 * @returns {Promise<object>} The parsed JSON response from the API
 */
export async function postToLinkedIn({ token, personUrn, url, title, commentary }) {
  const payload = {
    author: personUrn,
    lifecycleState: "PUBLISHED",
    specificContent: {
      "com.linkedin.ugc.ShareContent": {
        shareCommentary: { text: commentary },
        shareMediaCategory: "ARTICLE",
        media: [
          {
            status: "READY",
            originalUrl: url,
            title: { text: title },
          },
        ],
      },
    },
    visibility: {
      "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC",
    },
  };

  const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      "X-Restli-Protocol-Version": "2.0.0",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`LinkedIn API error ${response.status}: ${text}`);
  }

  return response.json();
}
