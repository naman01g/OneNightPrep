const params = new URLSearchParams(window.location.search);
const year = params.get("year") || "Your year";
const subject = params.get("subject") || "Your subject";
const branch = params.get("branch");

const yearElement = document.querySelector("#selected-year");
const subjectElement = document.querySelector("#selected-subject");
const branchElement = document.querySelector("#selected-branch");
const backLink = document.querySelector("#subject-back-link");
const message = document.querySelector("#selection-message");

if (yearElement) yearElement.textContent = year;
if (subjectElement) subjectElement.textContent = subject;
if (branchElement && branch) {
  branchElement.textContent = branch;
  document.title = `${branch} Subjects — OneNight.Prep`;
}

if (backLink) {
  backLink.href = year.startsWith("2") ? "year2.html" : "year1.html";
}

document.querySelectorAll(".time-card").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".time-card").forEach((card) => {
      card.classList.remove("selected");
    });
    button.classList.add("selected");
    message.textContent = `${button.dataset.time} selected — your ${subject} plan is ready to build.`;
  });
});
