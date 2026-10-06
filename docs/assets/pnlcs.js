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

  function init() {
    initVars();
    initFeedback();
    initHeroSearch();
  }

  if (window.document$ && window.document$.subscribe) {
    window.document$.subscribe(init);
  } else {
    document.addEventListener("DOMContentLoaded", init);
  }
})();
