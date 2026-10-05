const buttonMenuMobile = document.querySelector(".header .inner-button-menu");

if (buttonMenuMobile) {
  const sider = document.querySelector(".sider");
  const siderOverlay = document.querySelector(".sider-overlay");

  buttonMenuMobile.addEventListener("click", () => {
    sider?.classList.add("active");
    siderOverlay?.classList.add("active");
  });

  siderOverlay?.addEventListener("click", () => {
    sider?.classList.remove("active");
    siderOverlay.classList.remove("active");
  });
}
