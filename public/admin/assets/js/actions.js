(function () {
  const reloadSoon = () => setTimeout(() => location.reload(), 1200);

  const postJson = async (url, body) => {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined
    });
    return response.json();
  };

  const notifyResult = (data) => {
    if (data.code === 200) {
      window.notyf.success(data.message);
      reloadSoon();
    } else {
      window.notyf.error(data.message);
    }
  };

  const actionHandlers = {
    "approve-landlord": async (id) => {
      if (!window.confirm("Xác nhận phê duyệt tài khoản Chủ trọ này?")) return;
      notifyResult(await postJson(`/admin/landlords/approve/${id}`));
    },
    "reject-landlord": async (id) => {
      const reason = window.prompt("Nhập lý do từ chối tài khoản Chủ trọ:");
      if (reason === null) return;
      notifyResult(await postJson(`/admin/landlords/reject/${id}`, { reason }));
    },
    "approve-room": async (id) => {
      if (!window.confirm("Xác nhận duyệt bài đăng phòng này và công khai trên website?")) return;
      notifyResult(await postJson(`/admin/rooms/approve/${id}`));
    },
    "reject-room": async (id) => {
      const reason = window.prompt("Nhập lý do từ chối bài đăng phòng trọ:");
      if (reason === null) return;
      notifyResult(await postJson(`/admin/rooms/reject/${id}`, { reason }));
    },
    "delete-room": async (id) => {
      if (!window.confirm("Bạn có chắc chắn muốn xóa bài đăng này khỏi hệ thống?")) return;
      notifyResult(await postJson(`/admin/rooms/delete/${id}`));
    },
    "delete-category": async (id) => {
      if (!window.confirm("Bạn có chắc muốn xóa loại phòng này?")) return;
      notifyResult(await postJson(`/admin/categories/delete/${id}`));
    },
    "toggle-user-status": async (id) => {
      if (!window.confirm("Bạn có chắc chắn muốn thay đổi trạng thái hoạt động của tài khoản này?")) return;
      notifyResult(await postJson(`/admin/users/toggle-status/${id}`));
    }
  };

  document.addEventListener("click", async (event) => {
    const button = event.target.closest("[data-admin-action]");
    if (!button) return;

    const handler = actionHandlers[button.dataset.adminAction];
    if (!handler) return;

    event.preventDefault();
    try {
      await handler(button.dataset.id);
    } catch (error) {
      console.error(error);
      window.notyf.error("Không thể xử lý thao tác, vui lòng thử lại!");
    }
  });

  const formCat = document.querySelector("#form-create-cat");
  if (formCat) {
    formCat.addEventListener("submit", async (event) => {
      event.preventDefault();

      try {
        const data = await postJson("/admin/categories/create", {
          title: formCat.title.value,
          icon: formCat.icon.value,
          description: formCat.description.value
        });
        notifyResult(data);
      } catch (error) {
        console.error(error);
        window.notyf.error("Không thể tạo loại phòng, vui lòng thử lại!");
      }
    });
  }
})();
