const buttonMenuMobile = document.querySelector(".header .inner-menu-mobile");

if (buttonMenuMobile) {
  const menu = document.querySelector(".header .inner-menu");

  buttonMenuMobile.addEventListener("click", () => {
    menu?.classList.add("active");
  });

  menu?.querySelector(".inner-overlay")?.addEventListener("click", () => {
    menu.classList.remove("active");
  });

  menu?.querySelector(".inner-menu-close")?.addEventListener("click", () => {
    menu.classList.remove("active");
  });

  menu?.querySelectorAll("ul > li > i").forEach((button) => {
    button.addEventListener("click", () => {
      button.parentNode.classList.toggle("active");
    });
  });
}

if (window.AOS) {
  window.AOS.init();
}

const boxImages = document.querySelector(".box-images");
if (boxImages && window.Swiper) {
  const swiperBoxImagesThumb = new Swiper(".swiper-box-images-thumb", {
    spaceBetween: 5,
    slidesPerView: 4,
    breakpoints: {
      576: {
        spaceBetween: 10
      }
    }
  });

  new Swiper(".swiper-box-images-main", {
    spaceBetween: 0,
    thumbs: {
      swiper: swiperBoxImagesThumb
    }
  });
}

const boxImagesMain = document.querySelector(".box-images .inner-images-main");
if (boxImagesMain && window.Viewer) {
  new Viewer(boxImagesMain);
}

document.addEventListener("click", (event) => {
  const thumbnail = event.target.closest("[data-gallery-thumb]");
  if (thumbnail) {
    const gallery = thumbnail.closest(".room-gallery");
    const mainImage = gallery?.querySelector(".main-image img");
    if (mainImage) {
      mainImage.src = thumbnail.src;
    }
    return;
  }

  const btnFav = event.target.closest(".btn-fav");
  if (!btnFav) return;

  event.preventDefault();
  const roomId = btnFav.getAttribute("data-room-id");

  fetch(`/favorites/toggle/${roomId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json"
    }
  })
    .then((res) => {
      if (res.status === 401) {
        window.location.href = `/login?redirect=${window.encodeURIComponent(window.location.pathname)}`;
        return null;
      }

      return res.json();
    })
    .then((data) => {
      if (!data) return;

      if (data.code === 200) {
        const icon = btnFav.querySelector("i");
        const added = data.action === "added";
        btnFav.classList.toggle("active", added);
        if (icon) {
          icon.className = added ? "fa-solid fa-heart" : "fa-regular fa-heart";
        }
        window.notyf?.success(data.message);
        return;
      }

      window.notyf?.error(data.message);
    })
    .catch(() => {
      window.notyf?.error("Khong the cap nhat phong yeu thich.");
    });
});
