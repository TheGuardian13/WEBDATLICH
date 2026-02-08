document.addEventListener("DOMContentLoaded", () => {

    const API_BASE = "https://localhost:7100";

    // =============================
    // ELEMENTS
    // =============================
    const bookingForm = document.getElementById("bookingForm");

    const doctorSelect = document.getElementById("doctorSelect");
    const dateInput = document.getElementById("appointmentDate");
    const timeSlots = document.getElementById("time-slots");
    const hiddenSlotId = document.getElementById("selectedSlotId");

    const hoTenTre = document.getElementById("hoTenTre");
    const ngaySinh = document.getElementById("ngaySinh");
    const gioiTinh = document.getElementById("gioiTinh");

    const tenNguoiDat = document.getElementById("tenNguoiDat");
    const dienThoai = document.getElementById("dienThoai");
    const lyDoKham = document.getElementById("lyDoKham");

    const caRadios = {
        1: document.getElementById("ca-sang"),
        2: document.getElementById("ca-chieu"),
        3: document.getElementById("ca-toi")
    };

    // =============================
    // CONFIG
    // =============================
    const CA_CONFIG = {
        1: { start: "08:00", end: "11:00", startId: 1 },
        2: { start: "13:30", end: "17:00", startId: 19 },
        3: { start: "17:00", end: "20:00", startId: 40 }
    };

    const BUFFER_MINUTES = 20;


    const today = new Date().toISOString().split("T")[0];
    ngaySinh.max = today;
    dateInput.min = today;

    let caLamViec = [];
    let choPhepChonCa = false;
    let choPhepChonBacSi = false;
    let slotActiveMap = [];

    // =============================
    // 1. KHAI BÁO BIẾN – ELEMENT
    // =============================
    const hoTenTreInput = document.getElementById("hoTenTre");
    const tenNguoiDatInput = document.getElementById("tenNguoiDat");
    const dienThoaiInput = document.getElementById("dienThoai");

    // chỉ cho nhập số
    dienThoaiInput.addEventListener("input", () => {
        dienThoaiInput.value =
            dienThoaiInput.value.replace(/\D/g, "");
    });

    // kiểm tra đủ 10 số khi rời ô
    dienThoaiInput.addEventListener("blur", () => {

        const sdt = dienThoaiInput.value.trim();

        if (!sdt) return; // chưa nhập thì bỏ qua

        if (sdt.length !== 10) {
            alert("⚠️ Số điện thoại phải đủ 10 chữ số");
            dienThoaiInput.value = "";
        }
    });
    // =============================
    // 2. HÀM DÙNG CHUNG
    // =============================
    function normalizeVietnameseName(value) {
        if (!value) return "";

        // bỏ khoảng trắng thừa
        value = value.trim().replace(/\s+/g, " ");

        // không cho ký tự lạ
        if (!/^[a-zA-ZÀ-ỹ\s]+$/.test(value)) {
            return null; // báo sai
        }

        // viết hoa chữ cái đầu mỗi từ
        return value
            .toLowerCase()
            .split(" ")
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");
    }
    // =============================
    // KIỂM TRA KHI RỜI Ô (blur)
    // =============================
    hoTenTreInput.addEventListener("blur", () => {
        const result = normalizeVietnameseName(hoTenTreInput.value);

        if (result === null) {
            alert("⚠️ Họ tên trẻ chỉ được chứa chữ cái và khoảng trắng.");
            hoTenTreInput.value = "";
            return;
        }

        hoTenTreInput.value = result;
    });

    tenNguoiDatInput.addEventListener("blur", () => {
        const result = normalizeVietnameseName(tenNguoiDatInput.value);

        if (result === null) {
            alert("⚠️ Họ tên người đặt chỉ được chứa chữ cái và khoảng trắng.");
            tenNguoiDatInput.value = "";
            return;
        }

        tenNguoiDatInput.value = result;
    });

    // =============================
    // KIỂM TRA NGÀY SINH
    // =============================
    ngaySinh.addEventListener("blur", () => {

        if (!ngaySinh.value) return;

        const selected = new Date(ngaySinh.value);
        selected.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selected > today) {
            alert("⚠️ Ngày sinh đã bị nhập sai. Vui lòng nhập lại");
            ngaySinh.value = "";

            // focus lại ô ngày sinh
            setTimeout(() => {
                ngaySinh.focus();
            }, 0);
        }
    });
    // =============================
    // DATE UTILS
    // =============================
    function isPastDate(dateStr) {
        const d = new Date(dateStr);
        d.setHours(0, 0, 0, 0);

        const t = new Date();
        t.setHours(0, 0, 0, 0);

        return d < t;
    }

    function isToday(dateStr) {
        return new Date(dateStr).toDateString() === new Date().toDateString();
    }

    function isSlotValidToday(timeStr) {
        const now = new Date();
        now.setMinutes(now.getMinutes() + BUFFER_MINUTES);

        const [h, m] = timeStr.split(":").map(Number);
        const slot = new Date();
        slot.setHours(h, m, 0, 0);

        return slot >= now;
    }

    // =============================
    // INIT
    // =============================
    resetAll();

    // =============================
    // BLOCK DOCTOR WHEN NO DATE
    // =============================
    doctorSelect.addEventListener("mousedown", e => {
        if (!choPhepChonBacSi) {
            e.preventDefault();
            alert("⚠️ Vui lòng chọn ngày khám trước");
        }
    });

    // =============================
    // CHỌN NGÀY
    // =============================
    dateInput.addEventListener("change", () => {

        const ngay = dateInput.value;
        if (!ngay) return;

        const selected = new Date(ngay);
        if (isNaN(selected.getTime())) return;

        const year = selected.getFullYear();
        const currentYear = new Date().getFullYear();

        // năm quá nhỏ → bỏ qua (đang nhập dở)
        if (year < 2000) {
            return;
        }

        // năm quá lớn → báo lỗi ngay
        if (year > currentYear + 1) {
            alert("⚠️ Bạn đã nhập sai năm đặt lịch, vui lòng nhập lại");
            dateInput.value = "";
            resetAfterDate();
            return;
        }

        selected.setHours(0, 0, 0, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const maxDate = new Date(today);
        maxDate.setDate(today.getDate() + 6); // Không cho đặt quá 7 ngày

        // 1. Không cho đặt ngày đã qua
        if (selected < today) {
            alert("⚠️ Không thể đặt lịch cho ngày đã qua");
            dateInput.value = "";
            resetAfterDate();
            return;
        }

        // 2. Không cho đặt quá 7 ngày
        if (selected > maxDate) {
            alert("⚠️ Chỉ được đặt lịch trong vòng 7 ngày tới");
            dateInput.value = "";
            resetAfterDate();
            return;
        }

        // hợp lệ → load bác sĩ
        resetAfterDoctor();

        choPhepChonBacSi = true;
        doctorSelect.classList.remove("select-disabled");
        doctorSelect.innerHTML = `<option>Đang tải bác sĩ...</option>`;

        fetch(`${API_BASE}/api/lichkham/bacsi?ngay=${ngay}`)
            .then(r => r.json())
            .then(data => {

                doctorSelect.innerHTML = `<option value="">-- Chọn bác sĩ --</option>`;

                data.forEach(bs => {
                    const opt = document.createElement("option");
                    opt.value = bs.idBacSi;
                    opt.textContent = `${bs.moTa} (${bs.chuyenKhoa})`;
                    doctorSelect.appendChild(opt);
                });
            });
    });

    // =============================
    // CHỌN BÁC SĨ
    // =============================
    doctorSelect.addEventListener("change", () => {

        resetAfterDoctor();

        const idBacSi = doctorSelect.value;
        if (!idBacSi) return;

        choPhepChonCa = true;

        fetch(`${API_BASE}/api/lichkham/cakham?ngay=${dateInput.value}&idBacSi=${idBacSi}`)
            .then(r => r.json())
            .then(data => {
                caLamViec = data.map(c => c.idCaKham);
                setCaVisual();
            });
    });

    // =============================
    // CLICK CA
    // =============================
    Object.entries(caRadios).forEach(([idCa, radio]) => {

        radio.addEventListener("click", e => {
            if (!choPhepChonCa) {
                e.preventDefault();
                alert("⚠️ Vui lòng chọn bác sĩ trước");
            }
        });

        radio.addEventListener("change", () => {

            resetSlot();

            const ca = Number(idCa);
            const config = CA_CONFIG[ca];
            if (!config) return;

            const allSlots = generateSlots(
                config.start,
                config.end,
                config.startId
            );

            if (!caLamViec.includes(ca)) {
                renderSlot(allSlots, []);
                return;
            }

            fetch(`${API_BASE}/api/lichkham/slot?ngay=${dateInput.value}&idBacSi=${doctorSelect.value}&idCa=${ca}`)
                .then(r => r.json())
                .then(data => {

                    slotActiveMap = (data.data ?? data).map(s => ({
                        idSlot: s.idSlot,
                        idKhungGio: s.idKhungGio
                    }));

                    renderSlot(allSlots, slotActiveMap);
                });
        });
    });

    // =============================
    // RENDER SLOT
    // =============================
    function renderSlot(allSlots, activeMap) {

        timeSlots.innerHTML = "";
        const today = isToday(dateInput.value);

        allSlots.forEach(slot => {

            let invalid = false;

            if (today && !isSlotValidToday(slot.gio)) {
                invalid = true;
            }

            const found = activeMap.find(a => a.idKhungGio === slot.idKhungGio);
            const selectable = found && !invalid;

            timeSlots.innerHTML += `
                <input type="radio"
                       name="slot"
                       id="slot_${slot.idKhungGio}"
                       ${selectable ? "" : "disabled"}
                       data-slot-id="${selectable ? found.idSlot : ""}">

                <label for="slot_${slot.idKhungGio}"
                       class="${selectable ? "" : "disabled"}">
                    ${slot.gio}
                </label>
            `;
        });

        document.querySelectorAll("input[name='slot']").forEach(r => {
            r.addEventListener("change", () => {
                hiddenSlotId.value = r.dataset.slotId;
            });
        });
    }

    function generateSlots(start, end, startId) {

        const slots = [];
        let current = new Date(`2000-01-01T${start}`);
        const endTime = new Date(`2000-01-01T${end}`);
        let id = startId;

        while (current < endTime) {
            const h = String(current.getHours()).padStart(2, "0");
            const m = String(current.getMinutes()).padStart(2, "0");

            slots.push({
                idKhungGio: id,
                gio: `${h}:${m}`
            });

            id++;
            current.setMinutes(current.getMinutes() + 10);
        }

        return slots;
    }

    // =============================
    // SUBMIT
    // =============================
    bookingForm.addEventListener("submit", e => {
        e.preventDefault();


        if (!hiddenSlotId.value) {
            alert("⚠️ Vui lòng chọn giờ khám");
            return;
        }

        const data = {
            idSlot: Number(hiddenSlotId.value),
            hoTenTre: hoTenTre.value.trim(),
            gioiTinh: gioiTinh.value,
            ngaySinh: ngaySinh.value || null,
            tenNguoiDat: tenNguoiDat.value.trim(),
            dienThoai: dienThoai.value.trim(),
            lyDoKham: lyDoKham.value.trim()
        };

        fetch(`${API_BASE}/api/lichkham/lichhen`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        })
            .then(r => r.json())
            .then(res => {

                if (!res.success) {
                    alert("❌ " + res.message);
                    return;
                }

                sessionStorage.setItem(
                    "lichhen",
                    JSON.stringify(res.data)
                );

                window.location.href = "success.html";
            })
            .catch(() => {
                alert("❌ Không kết nối được máy chủ");
            });
    });

    // =============================
    // RESET
    // =============================
    function resetAll() {
        dateInput.value = "";
        resetAfterDate();
    }

    function resetAfterDate() {
        choPhepChonBacSi = false;
        doctorSelect.innerHTML = `<option>-- Chọn bác sĩ --</option>`;
        doctorSelect.classList.add("select-disabled");
        resetAfterDoctor();
    }

    function resetAfterDoctor() {
        choPhepChonCa = false;
        caLamViec = [];
        Object.values(caRadios).forEach(r => r.checked = false);
        setCaVisual();
        resetSlot();
    }

    function resetSlot() {
        timeSlots.innerHTML = "";
        hiddenSlotId.value = "";
    }

    function setCaVisual() {
        Object.entries(caRadios).forEach(([idCa, radio]) => {

            const label = document.querySelector(
                `label[for="${radio.id}"]`
            );

            if (!choPhepChonCa) {
                label.classList.add("disabled");
                return;
            }

            if (caLamViec.includes(Number(idCa))) {
                label.classList.remove("disabled");
            } else {
                label.classList.add("disabled");
            }
        });
    }



});
