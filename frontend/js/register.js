// ==========================
// register.js
// ==========================

// Initialize Lucide icons
lucide.createIcons();

// GSAP Page Entry Animation
gsap.to("#register-card", {
  opacity: 1,
  y: 0,
  duration: 0.8,
  ease: "power3.out"
});

// -------------------------
// Elements
// -------------------------
const registerForm = document.getElementById("registerForm");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const passwordInput = document.getElementById("password");
const togglePasswordBtn = document.getElementById("togglePassword");
const eyeIcon = document.getElementById("eyeIcon");

// -------------------------
// Password Toggle
// -------------------------
togglePasswordBtn.addEventListener("click", () => {
  const isPassword = passwordInput.type === "password";
  passwordInput.type = isPassword ? "text" : "password";
  eyeIcon.setAttribute("data-lucide", isPassword ? "eye-off" : "eye");
  lucide.createIcons();
});

// -------------------------
// Register Form Submission
// -------------------------
registerForm.onsubmit = async (e) => {
  e.preventDefault();

  const fullName = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const role = document.getElementById("role").value.toLowerCase();
  const password = passwordInput.value;

  if (password.length < 8) {
    alert("Password must be at least 8 characters.");
    return;
  }

  submitBtn.disabled = true;
  btnText.innerText = "Creating Account...";

  try {
    const data = await apiRequest("/auth/register", "POST", { name: fullName, email, password, role });

    localStorage.setItem(
      "placementor_session",
      JSON.stringify({ token: data.token, user: data.user })
    );

    if (data.user.role === "admin") {
      window.location.href = "/frontend/admin/admin-dashboard.html";
    } else if (data.user.role === "recruiter") {
      window.location.href = "/frontend/recruiter/recruiter-dashboard.html";
    } else {
      window.location.href = "/frontend/student/student-dashboard.html";
    }

  } catch (err) {
    alert(err.message || "Server error. Try again later.");
    console.error("Registration Error:", err);
    submitBtn.disabled = false;
    btnText.innerText = "Create Account";
  }
};
