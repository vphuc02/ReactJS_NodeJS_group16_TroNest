(function () {
  const postJson = async (url) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });
    return response.json();
  };

  const notifyResult = (data) => {
    if (data.code === 200) {
      window.notyf.success(data.message);
      setTimeout(() => location.reload(), 1200);
    } else {
      window.notyf.error(data.message);
    }
  };

  const handlers = {
    submit: async (id) => {
      if (!window.confirm("Bạn có chắc chắn muốn gửi bài đăng này để Admin phê duyệt?")) return;
      notifyResult(await postJson(`/landlord/rooms/submit/${id}`));
    },
    delete: async (id) => {
      if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng này vĩnh viễn?")) return;
      notifyResult(await postJson(`/landlord/rooms/delete/${id}`));
    }
  };

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-landlord-room-action]");
    if (!button) return;

    const handler = handlers[button.dataset.landlordRoomAction];
    if (!handler) return;

    event.preventDefault();
    try {
      await handler(button.dataset.id);
    } catch (error) {
      console.error(error);
      window.notyf.error("Không thể xử lý thao tác, vui lòng thử lại!");
    }
  });
})();
