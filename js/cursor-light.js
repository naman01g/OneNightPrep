const page = document.body;
const hasFinePointer = window.matchMedia("(pointer: fine)").matches;

if (hasFinePointer) {
  let animationFrame;

  window.addEventListener("pointermove", (event) => {
    if (event.pointerType && event.pointerType !== "mouse") return;

    window.cancelAnimationFrame(animationFrame);
    animationFrame = window.requestAnimationFrame(() => {
      page.style.setProperty("--cursor-x", `${event.clientX}px`);
      page.style.setProperty("--cursor-y", `${event.clientY}px`);
      page.classList.add("cursor-active");
    });
  });

  document.addEventListener("mouseleave", () => {
    page.classList.remove("cursor-active");
  });
}
