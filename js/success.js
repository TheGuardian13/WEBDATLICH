document.addEventListener("DOMContentLoaded", () => {

    const dataStr = sessionStorage.getItem("lichhen");

    if (!dataStr) {
        alert("Không tìm thấy thông tin lịch hẹn");
        window.location.href = "index.html";
        return;
    }

    const data = JSON.parse(dataStr);

    // =========================
    // HIỂN THỊ THÔNG TIN
    // =========================
    const maDayDu = data.maLichHen || "";
    const maRutGon = maDayDu.slice(-3); // lấy 3 số cuối

    document.getElementById("maHen").textContent = maRutGon;
    document.getElementById("childName").textContent = data.hoTenTre;
    document.getElementById("parentName").textContent = data.tenNguoiDat;
    document.getElementById("phone").textContent = data.dienThoai;
    document.getElementById("doctor").textContent = data.bacSi;
    document.getElementById("date").textContent = data.ngay;
    document.getElementById("time").textContent = data.gio;
    document.getElementById("session").textContent = data.ca;
    document.getElementById("reason").textContent = data.lyDoKham;
    // ⭐ THỜI ĐIỂM ĐẶT LỊCH – LẤY TỪ SQL
    const createdAtEl = document.getElementById("createdAt");
    if (createdAtEl) {
        createdAtEl.textContent = data.ngayTao || "—";
    }

    // =========================
    // NỘI DUNG ZALO
    // =========================
    const zaloMessage = `
🩺 PHÒNG KHÁM BÁC SĨ BÊN CON

🎫 Mã lịch hẹn: ${maRutGon}
👶 Bé: ${data.hoTenTre}
👨‍👩‍👧 Phụ huynh: ${data.tenNguoiDat}
📞 SĐT: ${data.dienThoai}
🧑‍⚕️ Bác sĩ khám: ${data.bacSi}

📅 Ngày khám: ${data.ngay}
🕒 Giờ khám: ${data.gio}
🩺 Buổi: ${data.ca}
📝 Lý do khám: ${data.lyDoKham}

📌 Vui lòng đến trước giờ hẹn 10 phút.
❤️ Xin cảm ơn gia đình đã tin tưởng phòng khám.
`;

    const zaloBtn = document.getElementById("zaloShareBtn");

    if (zaloBtn) {
        zaloBtn.href =
            "https://zalo.me/share?text=" +
            encodeURIComponent(zaloMessage);
    }

});


// =========================
// NỘI DUNG giờ tạo phiếu
// =========================
/*
function formatDateTimeVN(date) {
    const pad = n => n.toString().padStart(2, '0');

    const day = pad(date.getDate());
    const month = pad(date.getMonth() + 1);
    const year = date.getFullYear();

    const hour = pad(date.getHours());
    const minute = pad(date.getMinutes());

    return `${hour}:${minute} ${day}/${month}/${year}`;
}

document.addEventListener("DOMContentLoaded", () => {
    const createdAtEl = document.getElementById("createdAt");
    if (createdAtEl) {
        createdAtEl.textContent = formatDateTimeVN(new Date());
    }
});
*/


// Thêm thời điểm tạo lịch vào api lichhen