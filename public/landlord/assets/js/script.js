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

// Notification Bell dropdown
const btnNotify = document.getElementById("btn-landlord-notify");
const notifyMenu = document.getElementById("landlord-notify-menu");

if (btnNotify && notifyMenu) {
  btnNotify.addEventListener("click", (e) => {
    e.stopPropagation();
    notifyMenu.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!notifyMenu.contains(e.target) && e.target !== btnNotify) {
      notifyMenu.classList.add("hidden");
    }
  });
}
