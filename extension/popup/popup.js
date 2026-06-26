document
  .getElementById("open-linkedin")
  .addEventListener("click", async () => {
    await chrome.tabs.create({ url: "https://www.linkedin.com/feed/" });
    window.close();
  });
