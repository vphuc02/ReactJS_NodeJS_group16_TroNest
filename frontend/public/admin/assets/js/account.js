// Login Form
const loginForm = document.querySelector("#login-form");
if (loginForm) {
  const validation = new JustValidate("#login-form");

  validation
    .addField("#email", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập email của bạn!",
      },
      {
        rule: "email",
        errorMessage: "Email không đúng định dạng!",
      },
    ])
    .addField("#password", [
      {
        rule: "required",
        errorMessage: "Vui lòng nhập mật khẩu!",
      },
    ])
    .onSuccess((event) => {
      const email = event.target.email.value;
      const password = event.target.password.value;
      const rememberPassword = event.target.rememberPassword.checked;

      const finalData = {
        email: email,
        password: password,
        rememberPassword: rememberPassword,
      };

      fetch("/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(finalData),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.code === 200) {
            notyf.success(data.message);
            setTimeout(() => {
              window.location.href = "/admin/dashboard";
            }, 1200);
          } else {
            notyf.error(data.message);
          }
        })
        .catch(() => {
          notyf.error("Lỗi kết nối máy chủ, vui lòng thử lại sau!");
        });
    });
}
// End Login Form
