// ===============================
// GHI CHÚ QUY TRÌNH GIT CƠ BẢN
// Dùng khi làm việc một mình (solo dev)
// ===============================

/*
MỖI NGÀY BẮT ĐẦU LÀM VIỆC

1. Mở terminal trong thư mục project
Ctrl + `
2. Cập nhật code mới nhất từ GitHub

   git pull

SAU KHI CODE XONG (QUY TRÌNH CHUẨN)
Bước 1: Kiểm tra file đã thay đổi
git status

Bước 2: Thêm tất cả file vào commit
git add .

Bước 3: Tạo commit (ghi chú thay đổi)
git commit -m "Mô tả thay đổi"

Ví dụ:
git commit -m "Sửa giao diện trang đặt lịch"

Bước 4: Đẩy code lên GitHub
git push

TÓM TẮT NHANH (3 LỆNH CHÍNH)
git add .
git commit -m "Mô tả thay đổi"
git push

MỘT SỐ LỖI THƯỜNG GẶP

1. Bị báo lỗi khi push
   → Chạy:
   git pull
   → Sau đó:
   git push

2. Muốn ghi đè toàn bộ GitHub (cẩn thận)
   git push --force

NGUYÊN TẮC VIẾT COMMIT MESSAGE

* Ngắn gọn, rõ ràng
* Mô tả đúng thứ đã sửa

Ví dụ tốt:
"Thêm chức năng hủy lịch"
"Sửa lỗi đăng nhập"
"Cập nhật giao diện dashboard"

Ví dụ không nên:
"update"
"fix"
"abc"
*/
