const params = new URLSearchParams(window.location.search);
const pageName = window.location.pathname.split("/").pop();
const inferredYear = pageName === "year2.html" || pageName === "branch.html" ? "2nd Year" : "1st Year";
const year = params.get("year") || inferredYear;
const exam = params.get("exam") || "Your exam";
const subject = params.get("subject") || "Your subject";
const branch = params.get("branch") || "";
const selectedTime = params.get("time") || "Your time left";

const yearElement = document.querySelector("#selected-year");
const examElement = document.querySelector("#selected-exam");
const subjectElement = document.querySelector("#selected-subject");
const branchElement = document.querySelector("#selected-branch");
const timeElement = document.querySelector("#selected-time");
const subjectBackLink = document.querySelector("#subject-back-link");
const yearBackLink = document.querySelector("#year-back-link");
const branchBackLink = document.querySelector("#branch-back-link");
const materialBackLink = document.querySelector("#material-back-link");
const materialDescription = document.querySelector("#material-description");
const probabilityLegend = document.querySelector("#probability-legend");
const materialGrid = document.querySelector("#material-grid");
const message = document.querySelector("#selection-message");
const buildUrl = (page, values = {}) => {
  const urlParams = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value) urlParams.set(key, value);
  });
  const query = urlParams.toString();
  return query ? `${page}?${query}` : page;
};

if (yearElement) yearElement.textContent = year;
if (examElement) examElement.textContent = exam;
if (subjectElement) subjectElement.textContent = subject;
if (timeElement) timeElement.textContent = selectedTime;

if (branchElement && branch) {
  branchElement.textContent = branch;
  document.title = `${branch} Subjects — OneNight.Prep`;
}

if (yearBackLink) {
  yearBackLink.href = buildUrl("exam-type.html", { year });
}

if (branchBackLink) {
  branchBackLink.href = buildUrl("year2.html", { year: "2nd Year", exam });
}

if (subjectBackLink) {
  const backPage = year.startsWith("2") && branch ? "branch.html" : year.startsWith("2") ? "year2.html" : "year1.html";
  subjectBackLink.href = buildUrl(backPage, { year, exam, branch });
}

if (materialBackLink) {
  materialBackLink.href = buildUrl("time.html", { year, exam, branch, subject });
}

const renderPaperSection = (title, papers) => `
  <article class="subject-card material-card paper-section">
    <span>${title}</span>
    <ul>
      ${papers.map((paper) => `<li>${paper}</li>`).join("")}
    </ul>
  </article>
`;

if (materialDescription) {
  materialDescription.classList.toggle("night-intro", selectedTime === "Just Tonight");
  materialDescription.classList.toggle("study-intro", selectedTime !== "Just Tonight");

  if (selectedTime === "2+ Days Left") {
    materialDescription.textContent = "Build a complete, steady revision plan.";
  } else if (selectedTime === "1 Day Left") {
    materialDescription.textContent = "Prioritize the concepts that matter most.";
  } else if (selectedTime === "Just Tonight") {
    materialDescription.innerHTML = "Bhai, bharosa kar.<br>Bas itna kar le...<br>Paper acha jayega. ❤️";
  }
}

if (materialGrid && selectedTime === "2+ Days Left") {
  materialGrid.innerHTML = [
    renderPaperSection("Professor Solved Papers", [
      "Solved Paper 1",
      "Solved Paper 2",
      "Solved Paper 3",
      "Solved Paper 4",
      "Solved Paper 5",
    ]),
    renderPaperSection("Practice Papers", [
      "Unsolved Paper 1",
      "Unsolved Paper 2",
      "Unsolved Paper 3",
    ]),
  ].join("");
}

if (materialGrid && selectedTime === "1 Day Left") {
  materialGrid.innerHTML = renderPaperSection("Professor Solved Papers", [
    "Solved Paper 1",
    "Solved Paper 2",
    "Solved Paper 3",
  ]);
}

if (probabilityLegend && selectedTime === "Just Tonight") {
  probabilityLegend.hidden = false;
  probabilityLegend.innerHTML = `
    <span>Probability Meter</span>
    <div>
      <span>Extremely High</span>
      <span>High</span>
      <span>Medium</span>
    </div>
  `;
}

if (materialGrid && selectedTime === "Just Tonight") {
  const imagePlaceholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='420' viewBox='0 0 640 420'%3E%3Crect width='640' height='420' rx='24' fill='%230d1321'/%3E%3Crect x='36' y='36' width='568' height='348' rx='18' fill='%23111a2c' stroke='%23202c42'/%3E%3Ctext x='320' y='188' text-anchor='middle' fill='%2364a5ff' font-family='Arial, sans-serif' font-size='26' font-weight='700'%3EUploaded Image%3C/text%3E%3Ctext x='320' y='228' text-anchor='middle' fill='%238c9ab1' font-family='Arial, sans-serif' font-size='18'%3EQuestion %2B Solution in one image%3C/text%3E%3C/svg%3E";
  const questions = ["Extremely High", "High", "Medium"];

  materialGrid.innerHTML = questions.map((probability) => `
    <article class="subject-card material-card question-card">
      <span>${probability}</span>
      <img class="question-image" src="${imagePlaceholder}" alt="${probability} probability question and solution image">
    </article>
  `).join("");
}


document.querySelectorAll(".exam-card").forEach((card) => {
  const targetPage = year.startsWith("2") ? "year2.html" : "year1.html";
  card.href = buildUrl(targetPage, { year, exam: card.dataset.exam });
});

document.querySelectorAll(".branch-card[data-branch]").forEach((card) => {
  card.href = buildUrl("branch.html", { year: "2nd Year", exam, branch: card.dataset.branch });
});

document.querySelectorAll(".subject-card[data-subject]").forEach((card) => {
  card.href = buildUrl("time.html", { year, exam, branch, subject: card.dataset.subject });
});

document.querySelectorAll(".time-card").forEach((button) => {
  button.addEventListener("click", () => {
    const isJustTonight = button.dataset.time === "Just Tonight";

    document.querySelectorAll(".time-card").forEach((card) => {
      card.classList.remove("selected");
    });

    button.classList.add("selected");

    if (isJustTonight) {
      if (message) {
        message.textContent = window.OneNightAuth?.getCurrentUser()
          ? `Just Tonight access is not available yet for ${subject}.`
          : `Sign in to continue with Just Tonight for ${subject}.`;
      }

      if (!window.OneNightAuth?.getCurrentUser()) {
        window.OneNightAuth?.signIn();
      }
      return;
    }

    const materialUrl = buildUrl("study-material.html", {
      year,
      exam,
      branch,
      subject,
      time: button.dataset.time,
    });

    if (message) {
      message.textContent = `${button.dataset.time} selected — opening your ${subject} material.`;
    }

    window.open(materialUrl, "_blank", "noopener");
  });
});
