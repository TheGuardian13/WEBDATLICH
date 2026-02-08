document.addEventListener("DOMContentLoaded", function () {
    const lookupForm = document.getElementById("lookupForm");
    const appointmentList = document.getElementById("appointmentList");
    const list = document.getElementById("list");

    // Dữ liệu mẫu
    const fakeAppointments = [
        { id: 1, child: "Bé An", time: "09:00", session: "Buổi sáng" },
        { id: 2, child: "Bé Bình", time: "09:15", session: "Buổi sáng" }
    ];

    // Xem danh sách
    lookupForm.addEventListener("submit", function (e) {
        e.preventDefault();
        list.innerHTML = "";

        fakeAppointments.forEach(app => {
            const li = document.createElement("li");
            li.innerHTML = `
                👶 <strong>${app.child}</strong><br>
                ⏰ ${app.time} – ${app.session}<br>
                <button type="button" class="btn btn--danger cancel-btn" data-id="${app.id}">
                    ❌ Hủy lịch này
                </button>
            `;
            list.appendChild(li);
        });

        appointmentList.style.display = "block";
    });

    // ---- EVENT DELEGATION CHẮC CHẮN ----
    // Attach lên document để không bị wrapper chặn
    document.addEventListener("click", function (e) {
        if (!e.target.classList.contains("cancel-btn")) return;

        // Debug: kiểm tra nút click
        console.log("Click nút Hủy:", e.target);

        const ok = confirm("Anh/chị có chắc chắn muốn hủy lịch khám này?");
        if (!ok) return;

        window.location.href = "huythanhcong.html";
    });
});
