(function () {
  const whatsappIcon =
    '<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488" /></svg>';

  if (!document.querySelector(".tg-whatsapp-popup")) {
    const floating = document.createElement("div");
    floating.className = "tg-whatsapp-popup";
    floating.innerHTML =
      '<a href="https://wa.me/15795011983" target="_blank" rel="noopener noreferrer" aria-label="Chat with us on WhatsApp">' +
      whatsappIcon +
      "</a>";
    document.body.appendChild(floating);
  }

  const storageKey = "tgWhatsappModalShown";
  let hasClosed = false;

  function closeModal() {
    const modal = document.querySelector(".tg-whatsapp-modal");
    if (!modal || hasClosed) return;
    hasClosed = true;
    try {
      sessionStorage.setItem(storageKey, "1");
    } catch (error) {}
    modal.classList.add("closing");
    modal.classList.remove("show");
    setTimeout(() => {
      modal.remove();
    }, 300);
  }

  function openWhatsApp() {
    const text = encodeURIComponent("Hi! I need help with my TEAS exam. Can you provide more information about your services?");
    window.open("https://wa.me/+15795011983?text=" + text, "_blank");
    closeModal();
  }

  function showModal() {
    if (hasClosed || document.querySelector(".tg-whatsapp-modal")) return;
    try {
      if (sessionStorage.getItem(storageKey) === "1") return;
    } catch (error) {}

    const modal = document.createElement("div");
    modal.className = "tg-whatsapp-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");
    modal.setAttribute("aria-labelledby", "tg-whatsapp-modal-title");
    modal.innerHTML = [
      '<div class="tg-whatsapp-modal-card">',
      '<button class="tg-whatsapp-modal-close" type="button" aria-label="Close popup">',
      '<svg fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>',
      "</button>",
      '<div class="tg-whatsapp-modal-header">',
      '<div class="tg-whatsapp-modal-icon-wrap"><div class="tg-whatsapp-modal-icon">',
      whatsappIcon,
      "</div></div>",
      '<h2 class="tg-whatsapp-modal-title" id="tg-whatsapp-modal-title">Need Help with Your TEAS Exam?</h2>',
      "</div>",
      '<div class="tg-whatsapp-modal-body">',
      '<div class="tg-whatsapp-modal-copy"><p>Ace your TEAS test from the comfort of home with our expert assistance&mdash;safe, secure, and guaranteed to pass.</p></div>',
      '<div class="tg-whatsapp-modal-note"><div class="tg-whatsapp-modal-note-inner">',
      '<div class="tg-whatsapp-modal-check"><svg viewBox="0 0 20 20" aria-hidden="true"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg></div>',
      '<p class="tg-whatsapp-modal-note-text">No upfront fees, guaranteed success!</p>',
      "</div></div>",
      '<button class="tg-whatsapp-modal-button" type="button">',
      whatsappIcon,
      "<span>Chat on WhatsApp</span>",
      "</button>",
      '<p class="tg-whatsapp-modal-dismiss">Click outside or press ESC to dismiss</p>',
      "</div>",
      "</div>"
    ].join("");

    modal.addEventListener("click", closeModal);
    modal.querySelector(".tg-whatsapp-modal-card").addEventListener("click", (event) => event.stopPropagation());
    modal.querySelector(".tg-whatsapp-modal-close").addEventListener("click", closeModal);
    modal.querySelector(".tg-whatsapp-modal-button").addEventListener("click", openWhatsApp);
    document.body.appendChild(modal);
    requestAnimationFrame(() => modal.classList.add("show"));
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });

  window.addEventListener("load", () => {
    setTimeout(showModal, 3000);
  });
})();
