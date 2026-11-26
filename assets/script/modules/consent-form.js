// Keeps the submit button disabled until the privacy consent checkbox is ticked.
export function initConsentForm() {
  document.querySelectorAll("form[data-consent-form]").forEach((form) => {
    const box = form.querySelector('input[name="privacy_consent"]');
    const submit = form.querySelector('button[type="submit"]');
    if (!box || !submit) return;
    const sync = () => {
      submit.disabled = !box.checked;
    };
    box.addEventListener("change", sync);
    form.addEventListener("reset", () => setTimeout(sync));
    sync();
  });
}
