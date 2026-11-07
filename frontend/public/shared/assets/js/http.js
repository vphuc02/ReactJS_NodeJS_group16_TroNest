(function () {
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length !== 2) return "";
    return decodeURIComponent(parts.pop().split(";").shift());
  };

  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, init = {}) => {
    const requestUrl = typeof input === "string" ? input : input.url;
    const url = new URL(requestUrl, window.location.origin);
    const method = (init.method || "GET").toUpperCase();

    if (url.origin === window.location.origin && !["GET", "HEAD", "OPTIONS"].includes(method)) {
      const headers = new Headers(init.headers || {});
      const token = getCookie("csrf_token");
      if (token && !headers.has("X-CSRF-Token")) {
        headers.set("X-CSRF-Token", token);
      }
      init.headers = headers;
    }

    return originalFetch(input, init);
  };

  document.addEventListener("click", async (event) => {
    const logoutLink = event.target.closest("[data-logout-url], .btn-logout, a[href$='/logout']");
    if (!logoutLink) return;

    event.preventDefault();
    const url = logoutLink.dataset.logoutUrl || logoutLink.getAttribute("href") || "/logout";

    try {
      const response = await window.fetch(url, {
        method: "POST",
        headers: {
          "Accept": "application/json"
        }
      });
      const data = await response.json();
      window.location.href = data.redirectUrl || (url.includes("/admin") ? "/admin/login" : "/login");
    } catch {
      window.location.href = url.includes("/admin") ? "/admin/login" : "/login";
    }
  });
})();
