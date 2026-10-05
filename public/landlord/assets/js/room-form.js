(function () {
  const configElement = document.querySelector("#room-form-config");
  if (!configElement) return;

  const config = JSON.parse(configElement.textContent);
  const form = document.querySelector(config.formSelector);
  if (!form) return;

  const elements = {
    fileInput: document.querySelector("#fileInput"),
    btnUploadComputer: document.querySelector("#btnUploadComputer"),
    btnToggleUrlInput: document.querySelector("#btnToggleUrlInput"),
    urlInputBox: document.querySelector("#urlInputBox"),
    customImageUrl: document.querySelector("#customImageUrl"),
    btnAddUrlImage: document.querySelector("#btnAddUrlImage"),
    btnToggleSampleBox: document.querySelector("#btnToggleSampleBox"),
    sampleImagesBox: document.querySelector("#sampleImagesBox"),
    imagePreviewGrid: document.querySelector("#imagePreviewGrid"),
    addMoreSlot: document.querySelector("#addMoreSlot"),
    countText: document.querySelector("#countText"),
    imageCounter: document.querySelector("#imageCounter"),
    uploadProgressBox: document.querySelector("#uploadProgressBox"),
    uploadProgressText: document.querySelector("#uploadProgressText")
  };

  const actions = config.mode === "edit"
    ? {
        draftButton: document.querySelector("#btn-save"),
        submitButton: document.querySelector("#btn-resubmit"),
        draftStatus: config.statuses.DRAFT,
        submitStatus: config.statuses.PENDING
      }
    : {
        draftButton: document.querySelector("#btn-draft"),
        submitButton: document.querySelector("#btn-submit"),
        draftStatus: config.statuses.DRAFT,
        submitStatus: config.statuses.PENDING
      };

  let roomImages = Array.isArray(config.images) && config.images.length
    ? [...config.images]
    : ["/client/assets/images/product-1.jpg"];
  let mainThumbnail = config.thumbnail || roomImages[0] || "";

  const isSafeImagePath = (value) => {
    return /^\/uploads\/rooms\/room-[a-zA-Z0-9-]+\.(jpe?g|png|webp|gif)$/i.test(value)
      || /^\/client\/assets\/images\/[a-zA-Z0-9._-]+\.(jpe?g|png|webp|gif)$/i.test(value);
  };

  const showError = (message) => window.notyf?.error(message);
  const showSuccess = (message) => window.notyf?.success(message);
  const setHidden = (element, hidden) => {
    element.classList.toggle("is-hidden", hidden);
  };

  const createButton = ({ className, title, html, onClick }) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className;
    button.title = title;
    button.innerHTML = html;
    button.addEventListener("click", onClick);
    return button;
  };

  const updatePreviewGrid = () => {
    elements.imagePreviewGrid
      .querySelectorAll(".img-preview-card")
      .forEach((element) => element.remove());

    if (!mainThumbnail && roomImages.length > 0) {
      mainThumbnail = roomImages[0];
    }

    elements.countText.innerText = roomImages.length;
    const isFull = roomImages.length >= 6;
    elements.imageCounter.classList.toggle("image-counter-full", isFull);
    elements.imageCounter.classList.toggle("image-counter-available", !isFull);
    setHidden(elements.addMoreSlot, isFull);

    roomImages.forEach((url, idx) => {
      const isMain = url === mainThumbnail;
      const card = document.createElement("div");
      card.className = `img-preview-card room-image-preview-card${isMain ? " is-main" : ""}`;

      const image = document.createElement("img");
      image.src = url;
      image.title = "Bấm để chọn làm ảnh đại diện";
      image.className = "room-image-preview";
      image.addEventListener("click", () => {
        mainThumbnail = url;
        updatePreviewGrid();
      });
      card.appendChild(image);

      if (isMain) {
        const badge = document.createElement("span");
        badge.className = "room-image-main-badge";
        badge.innerHTML = '<i class="fa-solid fa-star image-main-icon"></i> Ảnh chính';
        card.appendChild(badge);
      } else {
        card.appendChild(createButton({
          className: "btn-select-main room-image-select-button",
          title: "Chọn làm ảnh chính",
          html: "Chọn làm ảnh chính",
          onClick: () => {
            mainThumbnail = url;
            updatePreviewGrid();
          }
        }));
      }

      const removeButton = createButton({
        className: "btn-remove-image room-image-remove-button",
        title: "Xóa ảnh này",
        html: "x",
        onClick: () => {
          const removed = roomImages.splice(idx, 1)[0];
          if (mainThumbnail === removed) {
            mainThumbnail = roomImages[0] || "";
          }
          updatePreviewGrid();
        }
      });
      card.appendChild(removeButton);

      elements.imagePreviewGrid.insertBefore(card, elements.addMoreSlot);
    });
  };

  const addImage = (url) => {
    if (!isSafeImagePath(url)) {
      showError("Đường dẫn ảnh phải thuộc /uploads/rooms hoặc /client/assets/images.");
      return;
    }
    if (roomImages.length >= 6) {
      showError("Bạn chỉ có thể chọn tối đa 6 hình ảnh!");
      return;
    }
    if (roomImages.includes(url)) {
      showError("Ảnh này đã có trong danh sách!");
      return;
    }

    roomImages.push(url);
    updatePreviewGrid();
    showSuccess("Đã thêm ảnh!");
  };

  elements.addMoreSlot.addEventListener("click", () => elements.fileInput.click());
  elements.btnUploadComputer.addEventListener("click", () => {
    if (roomImages.length >= 6) {
      showError("Bạn đã chọn đủ tối đa 6 hình ảnh!");
      return;
    }
    elements.fileInput.click();
  });

  elements.fileInput.addEventListener("change", async (event) => {
    const files = Array.from(event.target.files);
    if (!files.length) return;

    const remaining = 6 - roomImages.length;
    const filesToUpload = files.slice(0, remaining);
    if (files.length > remaining) {
      showError(`Chỉ còn ${remaining} vị trí ảnh, hệ thống sẽ tải lên ${remaining} ảnh đầu tiên!`);
    }

    const formData = new FormData();
    filesToUpload.forEach((file) => formData.append("images", file));

    setHidden(elements.uploadProgressBox, false);
    elements.uploadProgressText.innerText = `Đang tải ${filesToUpload.length} ảnh lên máy chủ...`;

    try {
      const response = await fetch("/landlord/rooms/upload-images", {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (data.code === 200 && Array.isArray(data.urls)) {
        data.urls.forEach((url) => {
          if (roomImages.length < 6) roomImages.push(url);
        });
        mainThumbnail = mainThumbnail || roomImages[0] || "";
        updatePreviewGrid();
        showSuccess(data.message || "Đã tải ảnh thành công!");
      } else {
        showError(data.message || "Tải ảnh thất bại!");
      }
    } catch (error) {
      console.error(error);
      showError("Không thể kết nối đến máy chủ khi tải ảnh!");
    } finally {
      setHidden(elements.uploadProgressBox, true);
      elements.fileInput.value = "";
    }
  });

  elements.btnToggleUrlInput.addEventListener("click", () => {
    const shouldShow = elements.urlInputBox.classList.contains("is-hidden");
    setHidden(elements.urlInputBox, !shouldShow);
    if (shouldShow) elements.customImageUrl.focus();
  });

  elements.btnAddUrlImage.addEventListener("click", () => {
    const url = elements.customImageUrl.value.trim();
    addImage(url);
    elements.customImageUrl.value = "";
  });

  elements.btnToggleSampleBox.addEventListener("click", () => {
    setHidden(elements.sampleImagesBox, !elements.sampleImagesBox.classList.contains("is-hidden"));
  });

  elements.sampleImagesBox.querySelectorAll("[data-image-url]").forEach((sample) => {
    sample.addEventListener("click", () => addImage(sample.dataset.imageUrl));
  });

  const collectPayload = (actionStatus) => {
    const checkedAmenities = [];
    form.querySelectorAll('input[name="amenities"]:checked').forEach((checkbox) => {
      checkedAmenities.push(checkbox.value);
    });

    return {
      title: form.title.value,
      categoryId: form.categoryId.value,
      price: form.price.value,
      deposit: form.deposit.value,
      area: form.area.value,
      capacity: form.capacity.value,
      district: form.district.value,
      ward: form.ward.value,
      address: form.address.value,
      thumbnail: mainThumbnail || roomImages[0],
      images: roomImages,
      electricityPrice: form.electricityPrice.value,
      waterPrice: form.waterPrice.value,
      servicePrice: form.servicePrice.value,
      description: form.description.value,
      amenities: checkedAmenities,
      actionStatus
    };
  };

  const submitRoom = async (actionStatus) => {
    if (!form.reportValidity()) return;
    if (roomImages.length === 0) {
      showError("Vui lòng thêm ít nhất 1 hình ảnh phòng trọ!");
      return;
    }

    actions.draftButton.disabled = true;
    actions.submitButton.disabled = true;

    try {
      const response = await fetch(config.submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(collectPayload(actionStatus))
      });
      const data = await response.json();

      if (data.code === 200) {
        showSuccess(data.message);
        setTimeout(() => {
          window.location.href = "/landlord/rooms";
        }, 1500);
      } else {
        showError(data.message);
      }
    } catch (error) {
      console.error(error);
      showError(config.mode === "edit" ? "Lỗi cập nhật!" : "Lỗi gửi dữ liệu!");
    } finally {
      actions.draftButton.disabled = false;
      actions.submitButton.disabled = false;
    }
  };

  actions.draftButton.addEventListener("click", () => submitRoom(actions.draftStatus));
  actions.submitButton.addEventListener("click", () => submitRoom(actions.submitStatus));

  updatePreviewGrid();
})();
