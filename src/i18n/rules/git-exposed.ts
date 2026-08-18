import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Your entire source repository is downloadable from your website',
    why: 'A request to {url} returned git data. That folder holds every file and every past version of your project, so anyone who finds it can download the lot — including keys you committed once, noticed, and removed. Taking a secret out of the current code does not take it out of the history.',
    how: 'Stop the .git folder being served: it should not be inside the folder your host publishes. Check what your build actually uploads, and add a deny rule for /.git at your host or CDN as the backstop. Then rotate every key that has ever appeared in the repository, because the history has been readable for as long as this has been live.',
    check: 'Open {url} in a private browser window. If you see text rather than a not-found page, the whole repository is downloadable by anyone who tries the same address.',
    fixedWhen: 'That URL returns 404 on the deployed site, and every credential that ever appeared in the repository has been rotated at its provider.',
    beforeApplying: 'Rotation is the slow half of this fix and the half that matters. Blocking the path stops new copies; it does nothing about the copies already taken.',
  },
  vi: {
    title: 'Toàn bộ source repository của bạn có thể tải về từ chính website',
    why: 'Một request tới {url} trả về dữ liệu git. Thư mục đó chứa mọi file và mọi phiên bản cũ của project, nên ai tìm ra là tải được sạch — kể cả những key bạn từng commit, phát hiện ra rồi xoá. Gỡ secret khỏi code hiện tại không gỡ được nó khỏi history.',
    how: 'Đừng để thư mục .git được phục vụ: nó không nên nằm trong thư mục mà host của bạn publish. Kiểm tra xem bản build thực sự upload những gì, và thêm luật chặn /.git ở host hoặc CDN như lớp phòng cuối. Sau đó rotate mọi key từng xuất hiện trong repository, vì history đã đọc được suốt thời gian site chạy như thế này.',
    check: 'Mở {url} bằng cửa sổ ẩn danh. Nếu bạn thấy nội dung chữ thay vì trang not-found thì cả repository đang tải về được bởi bất kỳ ai thử đúng địa chỉ đó.',
    fixedWhen: 'URL đó trả về 404 trên site đã deploy, và mọi thông tin đăng nhập từng xuất hiện trong repository đã được rotate ở provider tương ứng.',
    beforeApplying: 'Rotate mới là phần chậm và cũng là phần quan trọng của việc sửa này. Chặn đường dẫn chỉ ngăn được bản sao mới; nó không làm gì được với những bản đã bị lấy đi.',
  },
};
