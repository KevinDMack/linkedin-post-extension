# linkedin-post-extension

A Microsoft Edge extension for quick LinkedIn posting workflows — share the current page with commentary directly from your browser, or schedule the post for later.

## What's included

- `extension/` with a Manifest V3 setup, popup UI, background service worker, OAuth helper, and LinkedIn API client
- `scripts/` with validation and packaging scripts
- `.devcontainer/` for a ready-to-use local development environment

## Develop locally

1. Install Node.js 22 or open the repository in the included devcontainer.
2. Run `npm test` to validate the scaffold.
3. Run `npm run package` when you want a packaged build.
4. Open Microsoft Edge and browse to `edge://extensions`.
5. Enable **Developer mode**.
6. Select **Load unpacked** and choose the `extension/` directory from this repository.

The popup lets you sign in with LinkedIn, fill in commentary for the current page, and post immediately or schedule for later.

## LinkedIn Developer App setup

### 1. Create a LinkedIn App

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/apps) and click **Create app**.
2. Fill in the app name, associate it with a LinkedIn Page, and complete the form.
3. On the **Auth** tab, note the **Client ID**.

### 2. Add required OAuth scopes

On the **Products** tab, request access to:
- **Share on LinkedIn** — grants `w_member_social`
- **Sign In with LinkedIn using OpenID Connect** — grants `r_liteprofile` (or use the **Profile API** product)

Wait for approval (usually instant for development apps).

### 3. Set the redirect URI

On the **Auth** tab, under **OAuth 2.0 settings → Authorized redirect URLs**, add:

```
https://<extension-id>.chromiumapp.org/
```

Replace `<extension-id>` with your extension's ID, which is shown on the `edge://extensions` page after loading the unpacked extension.

### 4. Put the Client ID in the extension

Open `extension/oauth.js` and replace the placeholder on line 1:

```js
const CLIENT_ID = "YOUR_LINKEDIN_CLIENT_ID";
```

> **Keep your Client ID out of public source control.** For a production build, load it from a build-time environment variable or a private configuration file excluded by `.gitignore`.

## How the schedule feature works

1. In the popup, toggle **Schedule** instead of **Post Now**.
2. A datetime picker appears — choose a future date and time.
3. Click **Schedule Post**. The extension:
   - Saves `{ url, title, commentary, personUrn, fireAt }` to `chrome.storage.local` under the `scheduledPosts` array.
   - Creates a `chrome.alarms` entry named `linkedin-post-<fireAt>` to fire at that timestamp.
4. When the alarm fires, `background.js` reads the matching entry, calls the LinkedIn UGC Posts API, and removes the entry from storage.

Scheduled posts persist across browser restarts because both `chrome.storage.local` and `chrome.alarms` survive browser restarts.

## Devcontainer

The devcontainer uses the Microsoft JavaScript/Node image and installs `zip` so packaging works from inside the container. After the container is created it automatically runs `npm run validate`.

## Publish the extension

1. Update the extension metadata in `extension/manifest.json`, add production icons, and make any final feature changes.
2. Run `npm run package` to generate `dist/linkedin-post-extension.zip`.
3. Sign in to the [Microsoft Edge Add-ons Developer Dashboard](https://partner.microsoft.com/dashboard/microsoftedge/overview).
4. Create a new submission, upload the generated zip file, and complete the listing details.
5. Submit the package for review and publish once Microsoft approves it.

