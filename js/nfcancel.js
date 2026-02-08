document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    const msg = document.getElementById("cancelMessage");
    const btn = document.getElementById("confirmCancelBtn");

    if (!token) {
        msg.textContent = "❗ Không tìm thấy thông tin lịch hẹn.";
        btn.style.display = "none";
        return;
    }

    btn.addEventListener("click", async () => {
        btn.disabled = true;
        btn.textContent = "Đang xử lý...";

        try {
            // ===== GỌI API BACKEND (sau này gắn thật) =====
            // await fetch(`/api/cancel-appointment?token=${token}`, { method: "POST" });

            // DEMO FRONTEND
            msg.innerHTML = `
                ✅ Lịch khám đã được hủy thành công.<br><br>
                Cảm ơn anh/chị đã hủy sớm để phòng khám phục vụ bé khác ❤️ <br><br>
                Nếu muốn đặt lịch theo khung giờ khác, vui lòng vào trang đặt lịch.
            `;
            btn.style.display = "none";

        } catch (err) {
            msg.textContent = "❌ Có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ phòng khám.";
            btn.disabled = false;
            btn.textContent = "Xác nhận hủy lịch";
        }
    });
});
