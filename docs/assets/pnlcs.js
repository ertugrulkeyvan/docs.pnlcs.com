/* docs.pnlcs.com — small enhancements. Runs again after every instant navigation (document$). */
(function () {
  "use strict";

  var STORE = "pnlcs-docs-vars";
  var originals = new WeakMap();

  function load() {
    try { return JSON.parse(localStorage.getItem(STORE) || "{}"); } catch (e) { return {}; }
  }
  function save(values) {
    try { localStorage.setItem(STORE, JSON.stringify(values)); } catch (e) { /* private mode */ }
  }
  function track(event, data) {
    window.dataLayer = window.dataLayer || [];
    var payload = { event: event };
    for (var k in data) payload[k] = data[k];
    window.dataLayer.push(payload);
  }
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  /* Command variables: pages with `vars:` in their front matter get a small form.
     Each default value (e.g. example.com) in code is swapped for what the reader typed. */
  function initVars() {
    var form = document.querySelector("[data-pn-vars]");
    if (!form) return;
    var inputs = Array.prototype.slice.call(form.querySelectorAll("input[data-default]"));
    var stored = load();
    inputs.forEach(function (input) {
      if (stored[input.name]) input.value = stored[input.name];
    });

    var article = form.closest("article") || document;
    var codes = Array.prototype.slice.call(article.querySelectorAll("pre code, p code, li code, td code"));
    codes.forEach(function (code) {
      if (!originals.has(code)) originals.set(code, code.innerHTML);
    });

    function apply() {
      var pairs = inputs
        .map(function (i) { return { from: i.dataset.default, to: i.value.trim() || i.dataset.default, changed: !!i.value.trim() }; })
        .sort(function (a, b) { return b.from.length - a.from.length; });
      var re = new RegExp(pairs.map(function (p) { return escapeRe(escapeHtml(p.from)); }).join("|"), "g");
      codes.forEach(function (code) {
        var html = originals.get(code);
        /* Only replace text between tags, never inside the highlighter's markup. */
        code.innerHTML = html.replace(/(^|>)([^<]+)(?=<|$)/g, function (_, gt, text) {
          return gt + text.replace(re, function (match) {
            var pair = pairs.filter(function (p) { return escapeHtml(p.from) === match; })[0];
            if (!pair || !pair.changed) return match;
            return '<span class="pn-var">' + escapeHtml(pair.to) + "</span>";
          });
        });
      });
      /* Values are shared across pages: the domain typed on one install page fills the next. */
      var all = load();
      inputs.forEach(function (i) {
        if (i.value.trim()) all[i.name] = i.value.trim();
        else delete all[i.name];
      });
      save(all);
    }

    inputs.forEach(function (input) { input.addEventListener("input", apply); });
    form.querySelector("[data-pn-vars-reset]").addEventListener("click", function () {
      inputs.forEach(function (i) { i.value = ""; });
      apply();
    });
    apply();
  }

  /* "Did this page help?" goes to the dataLayer; GTM decides where it is stored. */
  function initFeedback() {
    var box = document.querySelector("[data-pn-feedback]");
    if (!box) return;
    box.querySelectorAll("button").forEach(function (button) {
      button.addEventListener("click", function () {
        track("docs_feedback", { feedback_value: button.dataset.value, page_path: location.pathname });
        box.querySelector(".pn-feedback__a").hidden = true;
        box.querySelector(".pn-feedback__q").hidden = true;
        box.querySelector(".pn-feedback__thanks").hidden = false;
      });
    });
  }

  /* The search box on the home page opens the real search. */
  function initHeroSearch() {
    var button = document.querySelector("[data-pn-open-search]");
    if (!button) return;
    button.addEventListener("click", function () {
      var search = document.querySelector(".md-search__button");
      if (search) search.click();
    });
  }

  /* Home hero: live contributor list from GitHub; the HTML carries a fallback. */
  function initContributors() {
    var faces = document.querySelector("[data-pn-contributors]");
    if (!faces || faces.dataset.loaded) return;
    faces.dataset.loaded = "1";
    fetch("https://api.github.com/repos/Panelica/pnlcs/contributors?per_page=100")
      .then(function (r) { return r.ok ? r.json() : []; })
      .then(function (list) {
        var people = (Array.isArray(list) ? list : []).filter(function (c) { return c.type === "User"; });
        if (!people.length) return;
        faces.innerHTML = people.slice(0, 12).map(function (c) {
          var login = escapeHtml(c.login);
          return '<a href="' + escapeHtml(c.html_url) + '" title="' + login + '"><img src="' + escapeHtml(c.avatar_url) +
            '&s=88" alt="' + login + '" width="44" height="44"></a>';
        }).join("");
        var count = document.querySelector("[data-pn-contributor-count]");
        if (count) count.textContent = String(people.length);
      })
      .catch(function () { /* keep the fallback */ });
  }

  /* Search: the dialog is empty until you type. Show popular pages and example
     queries there instead. Zensical renders search inside an open shadow root. */
  var SUGGEST = [
    ["Install on your own server", "install/native/"],
    ["Install with Docker", "install/docker/"],
    ["Setup checklist", "getting-started/setup-checklist/"],
    ["Your first sale", "getting-started/your-first-sale/"],
    ["Migrate from WHMCS", "guides/migrate-from-whmcs/"],
    ["Connect a server", "guides/connect-a-server/"],
    ["Payment gateways", "guides/payment-gateways/"],
    ["API reference", "api/"],
    ["Common issues", "troubleshooting/common-issues/"]
  ];
  var TRY = ["proxmox", "stripe", "cron", "hooks", "smtp", "tax"];

  function base() {
    var cfg = document.getElementById("__config");
    try { return new URL(JSON.parse(cfg.textContent).base, location.href).href; } catch (e) { return "/"; }
  }

  function decorateSearch(root) {
    if (root.querySelector(".pn-suggest")) return;
    var input = root.querySelector("input[role=combobox]");
    var results = root.querySelector("ol");
    if (!input || !results) return;
    var href = base();

    var style = document.createElement("style");
    style.textContent =
      ".pn-suggest{padding:14px 18px 18px;font-family:var(--font-family,inherit)}" +
      ".pn-suggest h3{margin:6px 0 8px;font-size:11px;font-weight:700;letter-spacing:.07em;text-transform:uppercase;opacity:.55}" +
      ".pn-suggest ul{list-style:none;margin:0 0 14px;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:2px 12px}" +
      ".pn-suggest a{display:block;padding:7px 10px;border-radius:8px;color:inherit;text-decoration:none;font-size:14px}" +
      ".pn-suggest a:hover,.pn-suggest a:focus-visible{background:rgba(64,81,137,.1);outline:none}" +
      ".pn-suggest .pn-try{display:flex;flex-wrap:wrap;gap:6px}" +
      ".pn-suggest button{font:inherit;font-size:13px;padding:4px 10px;border-radius:99px;cursor:pointer;" +
      "border:1px solid rgba(127,127,127,.3);background:none;color:inherit}" +
      ".pn-suggest button:hover{border-color:#0ab39c}" +
      "@media (max-width:600px){.pn-suggest ul{grid-template-columns:1fr}}";
    root.appendChild(style);

    var box = document.createElement("div");
    box.className = "pn-suggest";
    box.innerHTML =
      "<h3>Popular pages</h3><ul>" +
      SUGGEST.map(function (s) { return '<li><a href="' + href + s[1] + '">' + escapeHtml(s[0]) + "</a></li>"; }).join("") +
      "</ul><h3>Or try</h3><div class=\"pn-try\">" +
      TRY.map(function (t) { return '<button type="button">' + t + "</button>"; }).join("") +
      "</div>";
    results.parentNode.insertBefore(box, results);

    box.querySelectorAll("button").forEach(function (b) {
      b.addEventListener("click", function () {
        input.value = b.textContent;
        input.dispatchEvent(new Event("input", { bubbles: true, composed: true }));
        input.focus();
      });
    });
    function sync() { box.hidden = input.value.trim() !== ""; }
    input.addEventListener("input", sync);
    sync();
  }

  function initSearchSuggestions() {
    /* The host element appears before its shadow content is rendered, so watch inside it too. */
    var watched = new WeakSet();
    function scan() {
      document.querySelectorAll("body > div").forEach(function (el) {
        var root = el.shadowRoot;
        if (!root) return;
        decorateSearch(root);
        if (watched.has(root)) return;
        watched.add(root);
        new MutationObserver(function () { decorateSearch(root); }).observe(root, { childList: true, subtree: true });
      });
    }
    scan();
    new MutationObserver(scan).observe(document.body, { childList: true });
  }

  function init() {
    initVars();
    initFeedback();
    initHeroSearch();
    initContributors();
  }

  initSearchSuggestions();

  if (window.document$ && window.document$.subscribe) {
    window.document$.subscribe(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
