(function () {
  const setButtonState = (button, disabled, text) => {
    if (!button) return;
    button.disabled = disabled;
    button.innerText = text;
  };

  const showError = (message) => {
    window.notyf?.error(message);
  };

  const showSuccess = (message) => {
    window.notyf?.success(message);
  };

  const loginForm = document.querySelector("#login-form");
  if (loginForm) {
    const button = document.querySelector("#btn-submit");
    const defaultText = button?.innerText || "Đăng nhập";

    loginForm.addEventListener("submit", (event) => {
      event.preventDefault();
      setButtonState(button, true, "Đang xử lý...");

      fetch("/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: loginForm.email.value,
          password: loginForm.password.value,
          rememberPassword: loginForm.rememberPassword.checked,
          redirectUrl: loginForm.redirectUrl.value
        })
      })
        .then((res) => res.json())
        .then((data) => {
          setButtonState(button, false, defaultText);
          if (data.code === 200) {
            showSuccess(data.message);
            window.setTimeout(() => {
              window.location.href = data.redirectUrl || "/";
            }, 1200);
            return;
          }

          showError(data.message);
        })
        .catch(() => {
          setButtonState(button, false, defaultText);
          showError("Lỗi kết nối máy chủ!");
        });
    });
  }

  const registerForm = document.querySelector("#register-form");
  if (registerForm) {
    const roleRadios = document.querySelectorAll('input[name="role"]');
    const landlordNotice = document.querySelector("#landlord-notice");
    const button = document.querySelector("#btn-submit");
    const customerText = button?.innerText || "Hoàn tất đăng ký";
    const landlordText = "Đăng ký làm Chủ trọ";

    const syncRoleState = () => {
      const selectedRole = registerForm.querySelector('input[name="role"]:checked')?.value;
      const isLandlord = selectedRole === "LANDLORD";

      if (landlordNotice) {
        landlordNotice.hidden = !isLandlord;
      }

      if (button) {
        button.classList.toggle("auth-submit-landlord", isLandlord);
        button.innerText = isLandlord ? landlordText : customerText;
      }
    };

    roleRadios.forEach((radio) => {
      radio.addEventListener("change", syncRoleState);
    });
    syncRoleState();

    registerForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const selectedRole = registerForm.querySelector('input[name="role"]:checked')?.value;
      const pendingText = selectedRole === "LANDLORD" ? "Đang đăng ký làm Chủ trọ..." : "Đang đăng ký...";
      setButtonState(button, true, pendingText);

      fetch("/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          fullName: registerForm.fullName.value,
          email: registerForm.email.value,
          phone: registerForm.phone.value,
          password: registerForm.password.value,
          address: registerForm.address.value,
          role: selectedRole
        })
      })
        .then((res) => res.json())
        .then((data) => {
          setButtonState(button, false, selectedRole === "LANDLORD" ? landlordText : customerText);
          if (data.code === 200) {
            showSuccess(data.message);
            window.setTimeout(() => {
              window.location.href = "/login";
            }, 2500);
            return;
          }

          showError(data.message);
        })
        .catch(() => {
          setButtonState(button, false, selectedRole === "LANDLORD" ? landlordText : customerText);
          showError("Lỗi kết nối máy chủ!");
        });
    });
  }

  // --- Luồng Quên mật khẩu 3 bước (/forgot-password) ---
  const forgotEmailForm = document.querySelector("#forgot-email-form");
  const forgotOtpForm = document.querySelector("#forgot-otp-form");
  const forgotResetForm = document.querySelector("#forgot-reset-form");

  if (forgotEmailForm && forgotOtpForm && forgotResetForm) {
    const subtitleEl = document.querySelector("#forgot-subtitle");
    const stepItems = document.querySelectorAll("#forgot-stepper .forgot-step");
    const emailInput = document.querySelector("#forgot-email");
    const otpInput = document.querySelector("#forgot-otp");
    const targetEmailEl = document.querySelector("#otp-target-email");
    const countdownEl = document.querySelector("#otp-countdown");
    const btnSendOtp = document.querySelector("#btn-send-otp");
    const btnVerifyOtp = document.querySelector("#btn-verify-otp");
    const btnResetPassword = document.querySelector("#btn-reset-password");
    const btnChangeEmail = document.querySelector("#btn-change-email");
    const btnResendOtp = document.querySelector("#btn-resend-otp");

    let currentEmail = "";
    let currentResetToken = "";
    let countdownTimer = null;

    const formatSeconds = (sec) => {
      const m = String(Math.floor(sec / 60)).padStart(2, "0");
      const s = String(sec % 60).padStart(2, "0");
      return `${m}:${s}`;
    };

    const startCountdown = (seconds = 300) => {
      if (countdownTimer) window.clearInterval(countdownTimer);
      let remaining = seconds;
      if (countdownEl) countdownEl.textContent = formatSeconds(remaining);

      countdownTimer = window.setInterval(() => {
        remaining -= 1;
        if (remaining <= 0) {
          window.clearInterval(countdownTimer);
          if (countdownEl) countdownEl.textContent = "Hết hạn";
          return;
        }
        if (countdownEl) countdownEl.textContent = formatSeconds(remaining);
      }, 1000);
    };

    const setStep = (stepNumber) => {
      forgotEmailForm.hidden = stepNumber !== 1;
      forgotOtpForm.hidden = stepNumber !== 2;
      forgotResetForm.hidden = stepNumber !== 3;

      stepItems.forEach((item) => {
        const s = Number(item.getAttribute("data-step"));
        item.classList.toggle("is-active", s === stepNumber);
        item.classList.toggle("is-done", s < stepNumber);
      });

      if (subtitleEl) {
        if (stepNumber === 1) {
          subtitleEl.textContent = "Nhập email đã đăng ký để nhận mã xác thực OTP 6 chữ số";
        } else if (stepNumber === 2) {
          subtitleEl.textContent = "Nhập mã xác thực OTP gồm 6 chữ số để tiếp tục";
        } else {
          subtitleEl.textContent = "Thiết lập mật khẩu mới an toàn cho tài khoản của bạn";
        }
      }
    };

    const requestOtp = (emailValue, triggerBtn, defaultBtnText) => {
      setButtonState(triggerBtn, true, "Đang gửi mã...");

      return fetch("/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email: emailValue })
      })
        .then((res) => res.json())
        .then((data) => {
          setButtonState(triggerBtn, false, defaultBtnText);
          if (data.code === 200) {
            currentEmail = data.email || emailValue;
            if (targetEmailEl) targetEmailEl.textContent = currentEmail;

            if (otpInput) otpInput.value = "";
            setStep(2);
            startCountdown(data.expiresIn || 300);
            showSuccess(data.message);
            otpInput?.focus();
            return;
          }

          showError(data.message || "Không thể gửi mã OTP!");
        })
        .catch(() => {
          setButtonState(triggerBtn, false, defaultBtnText);
          showError("Lỗi kết nối máy chủ!");
        });
    };

    forgotEmailForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const emailVal = emailInput?.value.trim() || "";
      requestOtp(emailVal, btnSendOtp, "Gửi mã xác thực OTP");
    });

    btnChangeEmail?.addEventListener("click", () => {
      if (countdownTimer) window.clearInterval(countdownTimer);
      setStep(1);
      emailInput?.focus();
    });

    btnResendOtp?.addEventListener("click", () => {
      if (!currentEmail) return;
      requestOtp(currentEmail, btnResendOtp, "Gửi lại mã OTP");
    });

    otpInput?.addEventListener("input", () => {
      otpInput.value = otpInput.value.replace(/[^0-9]/g, "").slice(0, 6);
    });

    forgotOtpForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const otpVal = otpInput?.value.trim() || "";
      setButtonState(btnVerifyOtp, true, "Đang xác thực...");

      fetch("/forgot-password/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: currentEmail,
          otp: otpVal
        })
      })
        .then((res) => res.json())
        .then((data) => {
          setButtonState(btnVerifyOtp, false, "Xác thực mã OTP");
          if (data.code === 200) {
            currentResetToken = data.resetToken || "";
            if (countdownTimer) window.clearInterval(countdownTimer);
            setStep(3);
            showSuccess(data.message);
            document.querySelector("#new-password")?.focus();
            return;
          }

          showError(data.message || "Mã xác thực OTP không hợp lệ!");
        })
        .catch(() => {
          setButtonState(btnVerifyOtp, false, "Xác thực mã OTP");
          showError("Lỗi kết nối máy chủ!");
        });
    });

    forgotResetForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const password = document.querySelector("#new-password")?.value || "";
      const confirmPassword = document.querySelector("#confirm-password")?.value || "";

      setButtonState(btnResetPassword, true, "Đang cập nhật...");

      fetch("/forgot-password/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: currentEmail,
          resetToken: currentResetToken,
          password,
          confirmPassword
        })
      })
        .then((res) => res.json())
        .then((data) => {
          setButtonState(btnResetPassword, false, "Cập nhật mật khẩu mới");
          if (data.code === 200) {
            showSuccess(data.message);
            window.setTimeout(() => {
              window.location.href = data.redirectUrl || "/login";
            }, 1400);
            return;
          }

          showError(data.message || "Không thể đặt lại mật khẩu!");
        })
        .catch(() => {
          setButtonState(btnResetPassword, false, "Cập nhật mật khẩu mới");
          showError("Lỗi kết nối máy chủ!");
        });
    });
  }
})();
