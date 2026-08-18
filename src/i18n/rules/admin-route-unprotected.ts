import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Your admin page is protected only by the fact that it is hard to guess',
    why: 'We read {file}, the layouts above it and your middleware, and found nothing that checks who the visitor is. An admin URL is not a secret: it appears in browser history, in shared links, in analytics, and /admin is the first thing anyone tries.',
    how: 'Check the visitor identity on the server before the page renders — and check that they are actually an admin, not merely signed in. In Next.js the durable place for that is middleware covering /admin plus a check in the admin layout, so a new page added later inherits the protection.',
    check: 'Open your live site in a private browser window, where you are not logged in, and go straight to the admin URL. If the page renders — even briefly before redirecting — the protection is not real.',
    fixedWhen: 'A signed-out visitor to the admin URL is sent to the login page with no admin content rendered at any point, and a signed-in non-admin user is refused as well.',
    notes: {
      'no-check': 'no identity check found in {file}, in any layout above it, or in your middleware',
    },
  },
  vi: {
    title: 'Trang admin của bạn chỉ đang được bảo vệ bằng việc URL khó đoán',
    why: 'Chúng tôi đã đọc {file}, các layout phía trên nó và middleware của bạn, và không thấy chỗ nào kiểm tra người truy cập là ai. URL admin không phải bí mật: nó nằm trong lịch sử trình duyệt, trong link được chia sẻ, trong analytics — và /admin là thứ đầu tiên ai cũng thử.',
    how: 'Kiểm tra danh tính người truy cập ở phía server trước khi trang render — và kiểm tra họ đúng là admin, chứ không chỉ là đã đăng nhập. Với Next.js, chỗ bền vững nhất là middleware phủ /admin cộng thêm một lần kiểm tra trong layout của admin, để trang mới thêm sau này tự động được bảo vệ.',
    check: 'Mở site đang chạy bằng cửa sổ ẩn danh, chưa đăng nhập, rồi vào thẳng URL admin. Nếu trang hiện ra — kể cả chỉ loé lên rồi mới chuyển hướng — thì lớp bảo vệ đó không có thật.',
    fixedWhen: 'Người chưa đăng nhập vào URL admin thì bị đưa về trang login mà không có nội dung admin nào kịp hiện ra, và người đã đăng nhập nhưng không phải admin cũng bị từ chối.',
    notes: {
      'no-check': 'không tìm thấy bước kiểm tra danh tính trong {file}, trong layout nào phía trên nó, hay trong middleware của bạn',
    },
  },
};
