import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { auth, db } from "./firebase.js";

const provider = new GoogleAuthProvider();
provider.setCustomParameters({ prompt: "select_account" });

const createDefaultAvatar = () => `
  <svg viewBox="0 0 40 40" role="img" aria-label="Default profile avatar">
    <circle cx="20" cy="15" r="6.5"></circle>
    <path d="M9.5 32c2.1-6.1 6-9.1 10.5-9.1s8.4 3 10.5 9.1"></path>
  </svg>
`;

const createAuthShell = () => {
  const logo = document.querySelector(".mini-logo");
  if (!logo || document.querySelector(".auth-profile")) return null;

  const shell = document.createElement("div");
  shell.className = "brand-auth";
  logo.parentNode.insertBefore(shell, logo);
  shell.appendChild(logo);

  const authProfile = document.createElement("div");
  authProfile.className = "auth-profile";
  authProfile.innerHTML = `
    <button class="auth-avatar" type="button" aria-label="Sign in with Google">
      ${createDefaultAvatar()}
    </button>
    <div class="auth-menu" hidden>
      <button type="button">Logout</button>
    </div>
  `;
  shell.appendChild(authProfile);

  return {
    root: authProfile,
    avatar: authProfile.querySelector(".auth-avatar"),
    menu: authProfile.querySelector(".auth-menu"),
    logout: authProfile.querySelector(".auth-menu button"),
  };
};

const ensureUserDocument = async (user) => {
  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (snapshot.exists()) return;

  await setDoc(userRef, {
    uid: user.uid,
    displayName: user.displayName || null,
    email: user.email || null,
    photoURL: user.photoURL || null,
    provider: "google",
    role: "user",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

const setAvatarState = (ui, user) => {
  ui.menu.hidden = true;

  if (user?.photoURL) {
    ui.avatar.classList.add("is-signed-in");
    ui.avatar.setAttribute("aria-label", "Open profile menu");
    ui.avatar.innerHTML = `<img src="${user.photoURL}" alt="" referrerpolicy="no-referrer">`;
    return;
  }

  ui.avatar.classList.remove("is-signed-in");
  ui.avatar.setAttribute("aria-label", "Sign in with Google");
  ui.avatar.innerHTML = createDefaultAvatar();
};

const requestGoogleSignIn = async () => {
  try {
    return await signInWithPopup(auth, provider);
  } catch (error) {
    console.error("Google sign-in failed", error);
    return null;
  }
};

window.OneNightAuth = {
  getCurrentUser: () => auth.currentUser,
  signIn: requestGoogleSignIn,
  signOut: () => signOut(auth),
};

const initAuth = () => {
  const ui = createAuthShell();
  if (!ui) return;

  let currentUser = null;

  ui.avatar.addEventListener("click", async () => {
    if (currentUser) {
      ui.menu.hidden = !ui.menu.hidden;
      return;
    }

    await requestGoogleSignIn();
  });

  ui.logout.addEventListener("click", async () => {
    ui.menu.hidden = true;
    await window.OneNightAuth.signOut();
  });

  document.addEventListener("click", (event) => {
    if (!ui.root.contains(event.target)) {
      ui.menu.hidden = true;
    }
  });

  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    setAvatarState(ui, user);

    if (user) {
      try {
        await ensureUserDocument(user);
      } catch (error) {
        console.error("Unable to sync user document", error);
      }
    }
  });
};

initAuth();
