document.addEventListener("DOMContentLoaded", function () {
    const lookupForm = document.getElementById("lookupForm");
    const appointmentList = document.getElementById("appointmentList");
    const list = document.getElementById("list");
    const saveBtn = document.getElementById("saveImage");
    const actionBox = document.getElementById("lookupActions");
    const dienThoaiInput = document.getElementById("phone");
    const dateInput = document.getElementById("date");
    const today = new Date().toISOString().split("T")[0];
    dateInput.setAttribute("min", today);
    const cancelBtn = document.getElementById("cancelAppointment");

    // chỉ cho nhập số
    dienThoaiInput.addEventListener("input", () => {
        dienThoaiInput.value =
            dienThoaiInput.value.replace(/\D/g, "");
    });


    let selectedAppointment = null;

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
        actionBox.style.display = "none";
        selectedAppointment = null;

        try {
            const res = await fetch("https://localhost:7100/api/lichkham/tracuu", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ dienThoai: phone, ngayKham: date })
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
                // 🔴 nếu không còn hiệu lực
                if (item.trangThai !== 1) {
                    li.classList.add("inactive");
                }

                li.innerHTML = `
                    <div class="appointment-check"></div>

                    <div class="appointment-header">
                        🎫 <span class="label">Mã khám bệnh:</span>
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
                     ${item.trangThai !== 1
                        ? `<div class="status-label cancelled">❌ Lịch đã hủy</div>`
                        : ""
                    }
                `;

                if (item.trangThai === 1) {
                    li.addEventListener("click", () => selectAppointment(li, item));
                }
                list.appendChild(li);
            });

            appointmentList.style.display = "block";

            // ⭐ Nếu chỉ có 1 lịch VÀ còn hiệu lực → auto chọn
            if (result.data.length === 1 && result.data[0].trangThai === 1) {
                const firstItem = list.querySelector(".appointment-item");
                selectAppointment(firstItem, result.data[0]);
            }

        } catch (err) {
            console.error(err);
            alert("Có lỗi xảy ra khi tra cứu. Vui lòng thử lại.");
        }
    });

    function selectAppointment(li, item) {
        document
            .querySelectorAll(".appointment-item")
            .forEach(el => el.classList.remove("selected"));

        li.classList.add("selected");
        selectedAppointment = item;
        actionBox.style.display = "flex";
    }

    // =====================
    // 📸 LƯU ẢNH
    // =====================
    saveBtn.addEventListener("click", async function () {
        if (!selectedAppointment) {
            alert("Vui lòng chọn một lịch trước khi lưu ảnh");
            return;
        }

        renderTicket(selectedAppointment);

        const wrapper = document.getElementById("capture-wrapper");
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

    function renderTicket(item) {


        document.getElementById("ticketCapture").innerHTML = `
            <div class="success">
                <h1>✅ Xác nhận lịch khám</h1>

                <div class="summary">
                    <p><strong>🎫 Mã lịch hẹn:</strong><span id="maHen"> ${item.maRutGon}</p>
                    <p><strong>👶 Trẻ:</strong> ${item.hoTenTre}</p>
                    <p><strong>👨‍👩‍👧 Phụ huynh:</strong> ${item.tenNguoiDat}</p>
                    <p><strong>🧑‍⚕️ Bác sĩ:</strong> ${item.bacSi}</p>
                    <p><strong>📅 Ngày khám:</strong> ${item.ngayKham}</p> 
                    <p><strong>🕒 Giờ khám:</strong> ${item.gio}</p>
                    <p><strong>🩺 Buổi:</strong> ${item.ca}</p>
                    ${item.lyDoKham
                ? `<p><strong>📝 Lý do khám:</strong> ${item.lyDoKham}</p>`
                : ""
            }
                </div>
            </div>
        `;
        document.getElementById("createdAt").innerText = item.ngayTao;
    }

    // Hủy lịch
    cancelBtn.addEventListener("click", async function () {
        if (!selectedAppointment) {
            alert("Vui lòng chọn lịch cần hủy");
            return;
        }

        const ok = confirm(
            `Bạn có chắc muốn hủy lịch khám mã ${selectedAppointment.maRutGon} không?`
        );
        if (!ok) return;

        try {
            const res = await fetch("https://localhost:7100/api/lichkham/huylich", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    idLichHen: selectedAppointment.idLichHen,
                    dienThoai: document.getElementById("phone").value.trim()
                })
            });

            // 🔑 đọc response an toàn
            let result = null;
            const text = await res.text();

            try {
                result = text ? JSON.parse(text) : null;
            } catch {
                result = null;
            }

            // ❌ lỗi nghiệp vụ (400 từ SQL RAISERROR)
            if (!res.ok) {
                alert(
                    result?.message ||
                    "Không thể hủy lịch (lịch có thể đã quá giờ hoặc không hợp lệ)"
                );
                return;
            }

            // ❌ API trả success=false
            if (!result?.success) {
                alert(result?.message || "Không thể hủy lịch");
                return;
            }

            // ✅ thành công
            alert("✅ Đã hủy lịch thành công");
            // chuyển trang & xóa lịch sử trang hiện tại
            window.location.replace("huythanhcong.html");

            list.innerHTML = "";
            appointmentList.style.display = "none";
            actionBox.style.display = "none";
            selectedAppointment = null;

        } catch (err) {
            console.error("Fetch error:", err);
            alert("❌ Lỗi kết nối hệ thống, vui lòng thử lại");
        }
    });



});
