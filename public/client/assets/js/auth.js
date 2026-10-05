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
})();
