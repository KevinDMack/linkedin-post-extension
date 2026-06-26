# linkedin-post-extension

A scaffolded Microsoft Edge extension for quick LinkedIn posting workflows.

## What's included

- `extension/` with a Manifest V3 setup, popup UI, and background worker
- `scripts/` with validation and packaging scripts
- `.devcontainer/` for a ready-to-use local development environment

## Develop locally

1. Install Node.js 22 or open the repository in the included devcontainer.
2. Run `npm test` to validate the scaffold.
3. Run `npm run package` when you want a packaged build.
4. Open Microsoft Edge and browse to `edge://extensions`.
5. Enable **Developer mode**.
6. Select **Load unpacked** and choose the `extension/` directory from this repository.

The popup includes a starter action that opens the LinkedIn feed so you can verify the extension is wired up correctly before adding more functionality.

## Devcontainer

The devcontainer uses the Microsoft JavaScript/Node image and installs `zip` so packaging works from inside the container. After the container is created it automatically runs `npm run validate`.

## Publish the extension

1. Update the extension metadata in `extension/manifest.json`, add production icons, and make any final feature changes.
2. Run `npm run package` to generate `dist/linkedin-post-extension.zip`.
3. Sign in to the [Microsoft Edge Add-ons Developer Dashboard](https://partner.microsoft.com/dashboard/microsoftedge/overview).
4. Create a new submission, upload the generated zip file, and complete the listing details.
5. Submit the package for review and publish once Microsoft approves it.
