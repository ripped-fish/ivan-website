(() => {
  const forms = document.querySelectorAll("[data-kit-background-form]");

  forms.forEach((form) => {
    if (form.dataset.kitFormReady === "true") return;
    form.dataset.kitFormReady = "true";

    const button = form.querySelector('button[type="submit"]');
    const message = form.querySelector("[data-form-message]");
    const defaultButtonText = button?.textContent || "Subscribe";
    const successMessage =
      form.getAttribute("data-success-message") ||
      "thank you for subscribing! check your email to confirm your subscription";
    const errorMessage =
      form.getAttribute("data-error-message") ||
      "Something went wrong. Please try again in a moment.";

    const setMessage = (state, text) => {
      if (!message) return;
      message.textContent = text;
      message.dataset.state = state;
    };

    form.addEventListener("submit", async (event) => {
      if (!form.checkValidity()) return;

      event.preventDefault();

      const controller = new AbortController();
      const timeoutId = window.setTimeout(() => controller.abort(), 12000);

      setMessage("pending", "Sending...");
      if (button) {
        button.disabled = true;
        button.textContent = "Sending...";
      }

      try {
        const formData = new FormData(form);

        await fetch(form.action, {
          method: "POST",
          mode: "no-cors",
          body: new URLSearchParams(formData),
          signal: controller.signal,
        });

        setMessage("success", successMessage);
        form.reset();
      } catch {
        setMessage("error", errorMessage);
      } finally {
        window.clearTimeout(timeoutId);
        if (button) {
          button.disabled = false;
          button.textContent = defaultButtonText;
        }
      }
    });
  });
})();
