document.addEventListener("DOMContentLoaded", function () {
    const lookupForm = document.getElementById("lookupForm");
    const appointmentList = document.getElementById("appointmentList");
    const list = document.getElementById("list");
    const saveBtn = document.getElementById("saveImage");

    let selectedAppointment = null; // ⭐ lịch được chọn để lưu ảnh

    lookupForm.addEventListener("submit", async function (e) {
        e.preventDefault();

        const phone = document.getElementById("phone").value.trim();
        const date = document.getElementById("date").value;

        if (!phone || !date) {
            alert("Vui lòng nhập đầy đủ số điện thoại và ngày khám");
            return;
        }

        list.innerHTML = "";
        appointmentList.style.display = "none";
        document.getElementById("lookupActions").style.display = "none";
        selectedAppointment = null;

        try {
            const res = await fetch("https://localhost:7100/api/lichkham/tracuu", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    dienThoai: phone,
                    ngayKham: date
                })
            });

            if (!res.ok) throw new Error("API lỗi");

            const result = await res.json();

            if (!result.success || result.total === 0) {
                list.innerHTML = `<li>❌ Không tìm thấy lịch hẹn</li>`;
                appointmentList.style.display = "block";
                return;
            }

            result.data.forEach((item, index) => {
                const li = document.createElement("li");
                li.className = "appointment-item";

                li.innerHTML = `
                    <div class="appointment-header">
                        🔢 <span class="label">Mã khám bệnh:</span>
                        <span class="code">${item.maRutGon}</span>
                    </div>

                    <div class="appointment-row">
                        👶 <strong>Trẻ:</strong> ${item.hoTenTre}
                    </div>

                    <div class="appointment-row">
                        👨‍👩‍👧 <strong>Người đặt:</strong> ${item.tenNguoiDat}
                    </div>

                    <div class="appointment-row">
                        👨‍⚕️ <strong>Bác sĩ:</strong> ${item.bacSi}
                    </div>

                    <div class="appointment-row highlight">
                        ⏰ <strong>Giờ khám:</strong> ${item.gio} (${item.ca})
                    </div>

                    ${item.lyDoKham
                        ? `<div class="appointment-row note">
                            📝 <strong>Lý do khám:</strong> ${item.lyDoKham}
                        </div>`
                        : ""
                    }

                    <div style="margin-top:12px; text-align:center;">
                        <button class="btn btn--secondary select-btn">
                            ✅ Chọn lịch này
                        </button>
                    </div>
                `;

                // 👉 xử lý chọn lịch
                li.querySelector(".select-btn").addEventListener("click", () => {
                    document
                        .querySelectorAll(".appointment-item")
                        .forEach(el => el.classList.remove("selected"));

                    li.classList.add("selected");
                    selectedAppointment = item;

                    document.getElementById("lookupActions").style.display = "flex";
                });

                list.appendChild(li);
            });

            appointmentList.style.display = "block";

        } catch (err) {
            console.error(err);
            alert("Có lỗi xảy ra khi tra cứu. Vui lòng thử lại.");
        }
    });

    // =========================
    // 📸 LƯU ẢNH LỊCH ĐÃ CHỌN
    // =========================
    saveBtn.addEventListener("click", async function () {
        if (!selectedAppointment) {
            alert("Vui lòng chọn một lịch trước khi lưu ảnh");
            return;
        }

        const wrapper = document.getElementById("capture-wrapper");

        renderTicket(selectedAppointment);

        wrapper.style.display = "block";

        await new Promise(r => setTimeout(r, 50));

        const canvas = await html2canvas(wrapper, {
            scale: 2,
            backgroundColor: "#ffffff",
            useCORS: true
        });

        const link = document.createElement("a");
        link.href = canvas.toDataURL("image/png");
        link.download = "phieu-kham.png";
        link.click();

        wrapper.style.display = "none";
    });

    // =========================
    // RENDER PHIẾU (FORMAT GIỐNG SUCCESS)
    // =========================
    function renderTicket(item) {
        document.getElementById("createdAt").innerText =
            new Date().toLocaleString("vi-VN");

        document.getElementById("ticketCapture").innerHTML = `
            <div class="success">
                <h1>✅ Xác nhận lịch khám</h1>

                <div class="summary">
                    <p><strong>🎫 Mã lịch hẹn:</strong> ${item.maRutGon}</p>
                    <p><strong>👶 Trẻ:</strong> ${item.hoTenTre}</p>
                    <p><strong>👨‍👩‍👧 Phụ huynh:</strong> ${item.tenNguoiDat}</p>
                    <p><strong>🧑‍⚕️ Bác sĩ:</strong> ${item.bacSi}</p>
                    <p><strong>🕒 Giờ khám:</strong> ${item.gio}</p>
                    <p><strong>🩺 Buổi:</strong> ${item.ca}</p>
                    ${item.lyDoKham
                ? `<p><strong>📝 Lý do khám:</strong> ${item.lyDoKham}</p>`
                : ""
            }
                </div>

                <p class="note">
                    📌 Vui lòng đưa trẻ đến trước giờ hẹn 10 phút
                </p>
            </div>
        `;
    }
});
