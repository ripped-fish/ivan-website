(() => {
  const productionEndpoint = "https://dashboard.ivanpkchan.com/api/funnel/events";
  const endpoint = window.__IVAN_FUNNEL_ENDPOINT__ || (location.hostname === "ivanpkchan.com" || location.hostname === "www.ivanpkchan.com" ? productionEndpoint : null);
  const storage = {
    visitor: "ivan_funnel_visitor_v1",
    session: "ivan_funnel_session_v1",
    firstTouch: "ivan_funnel_first_touch_v1",
    latestTouch: "ivan_funnel_latest_touch_v1"
  };

  const randomId = () => {
    if (crypto.randomUUID) return crypto.randomUUID().replaceAll("-", "");
    const bytes = crypto.getRandomValues(new Uint8Array(16));
    return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  };

  const getOrCreate = (store, key) => {
    try {
      const current = store.getItem(key);
      if (current) return current;
      const created = randomId();
      store.setItem(key, created);
      return created;
    } catch {
      return randomId();
    }
  };

  const clean = (value, max = 200) => (typeof value === "string" && value.trim() ? value.trim().slice(0, max) : undefined);
  const readJson = (key) => {
    try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
  };
  const writeJson = (key, value) => {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* Analytics remains best-effort. */ }
  };
  const referrerHost = (() => {
    try { return document.referrer ? new URL(document.referrer).hostname : undefined; } catch { return undefined; }
  })();

  const params = new URLSearchParams(location.search);
  const isInternalReferrer = referrerHost === location.hostname || (referrerHost === "www.ivanpkchan.com" && location.hostname === "ivanpkchan.com") || (referrerHost === "ivanpkchan.com" && location.hostname === "www.ivanpkchan.com");
  const campaignTouch = {
    source: clean(params.get("utm_source"), 100),
    medium: clean(params.get("utm_medium"), 100),
    campaign: clean(params.get("utm_campaign")),
    content: clean(params.get("utm_content"))
  };
  const inferredTouch = (() => {
    if (!referrerHost) return { source: "direct", medium: "none" };
    if (/(^|\.)instagram\.com$/.test(referrerHost)) return { source: "instagram", medium: "organic_social" };
    if (/(^|\.)tiktok\.com$/.test(referrerHost)) return { source: "tiktok", medium: "organic_social" };
    if (/(^|\.)(youtube\.com|youtu\.be)$/.test(referrerHost)) return { source: "youtube", medium: "video" };
    if (isInternalReferrer) return readJson(storage.latestTouch) || { source: "direct", medium: "none" };
    return { source: referrerHost, medium: "referral" };
  })();
  const currentTouch = campaignTouch.source ? campaignTouch : inferredTouch;
  const firstTouch = readJson(storage.firstTouch) || currentTouch;
  const hasNewTouch = Boolean(campaignTouch.source || (referrerHost && !isInternalReferrer));
  const latestTouch = hasNewTouch ? currentTouch : (readJson(storage.latestTouch) || currentTouch);
  if (!readJson(storage.firstTouch)) writeJson(storage.firstTouch, firstTouch);
  writeJson(storage.latestTouch, latestTouch);

  const visitorId = getOrCreate(localStorage, storage.visitor);
  const sessionId = getOrCreate(sessionStorage, storage.session);
  const observedForms = new WeakSet();

  const formId = (form) => form.getAttribute("data-sv-form") || form.getAttribute("data-uid") || form.action?.match(/\/forms\/(\d+)\//)?.[1] || "unknown";
  const isWaitlistForm = (form) => Boolean(form.closest(".kit-waitlist-embed")) || (location.pathname === "/course/" && form.closest("#waitlist"));
  const analyticsContent = (element) => clean(element?.closest?.("[data-analytics-content]")?.getAttribute("data-analytics-content"), 100);

  const track = (eventName, details = {}) => {
    const link = details.link instanceof URL ? details.link : null;
    const payload = {
      id: randomId(),
      eventName,
      visitorId,
      sessionId,
      occurredAt: new Date().toISOString(),
      pageHost: location.hostname,
      pagePath: location.pathname,
      referrerHost,
      formId: clean(details.formId, 100),
      linkHost: link?.hostname,
      linkPath: link?.pathname,
      verificationStatus: details.verificationStatus,
      attribution: campaignTouch.source ? campaignTouch : latestTouch,
      firstTouch,
      latestTouch,
      metadata: details.metadata
    };

    if (!endpoint) {
      if (params.get("analytics_debug") === "1") console.info("[funnel]", payload);
      return;
    }

    fetch(endpoint, {
      method: "POST",
      mode: "cors",
      credentials: "omit",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }).catch(() => { /* Never interrupt the visitor experience for analytics. */ });
  };

  const observeForm = (form) => {
    if (!(form instanceof HTMLFormElement) || observedForms.has(form)) return;
    observedForms.add(form);
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      track("view_signup_form", { formId: formId(form), metadata: { placement: analyticsContent(form) || location.pathname } });
      observer.disconnect();
    }, { threshold: 0.35 });
    observer.observe(form);
  };

  const scanForms = () => document.querySelectorAll("form").forEach(observeForm);
  scanForms();
  new MutationObserver(scanForms).observe(document.body, { childList: true, subtree: true });

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    const id = formId(form);
    const placement = analyticsContent(form);
    track("newsletter_signup", { formId: id, verificationStatus: "submitted_unverified", metadata: { placement } });
    if (isWaitlistForm(form)) track("join_waitlist", { formId: id, verificationStatus: "submitted_unverified", metadata: { placement } });
  }, true);

  document.addEventListener("click", (event) => {
    const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
    if (!(anchor instanceof HTMLAnchorElement)) return;
    let destination;
    try { destination = new URL(anchor.href, location.href); } catch { return; }
    const placement = analyticsContent(anchor);
    const isExternalWebLink = /^https?:$/.test(destination.protocol) && destination.hostname !== location.hostname;
    if (placement || isExternalWebLink) {
      track("outbound_link_click", {
        link: /^https?:$/.test(destination.protocol) ? destination : undefined,
        metadata: { label: clean(anchor.textContent), placement }
      });
    }
  }, true);

  track("page_view");
  if (location.pathname === "/course/") track("view_course");
  window.ivanAnalytics = Object.freeze({ track });
})();
