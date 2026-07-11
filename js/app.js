const params = new URLSearchParams(window.location.search);
const pageName = window.location.pathname.split("/").pop();
const inferredYear = pageName === "year2.html" || pageName === "branch.html" ? "2nd Year" : "1st Year";
const year = params.get("year") || inferredYear;
const exam = params.get("exam") || "";
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
    if (value !== null && value !== undefined) {
      urlParams.set(key, value);
    }
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

document.querySelectorAll(".branch-card[data-branch]").forEach((card) => {
  card.href = buildUrl("branch.html", { year: "2nd Year", exam, branch: card.dataset.branch });
});

const syncSubjectCardLinks = () => {
  document.querySelectorAll(".subject-card[data-subject]").forEach((card) => {
    card.href = buildUrl("time.html", {
      year,
      exam,
      branch,
      subject: card.dataset.subject,
    });
  });
};

syncSubjectCardLinks();

const subjectGrid = document.querySelector("#subject-grid");
if (subjectGrid) {
  new MutationObserver(syncSubjectCardLinks).observe(subjectGrid, {
    childList: true,
    subtree: true,
  });
}

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