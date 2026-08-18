import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Your API accepts requests from any website on the internet',
    why: 'The CORS setting in {file} allows every origin (`*`). Any site a logged-in user of yours visits can call your API from their browser and read the answer. Credentials in this file: {credentials}.',
    how: 'Replace `*` with the exact origins that need access — your own site’s domain, and your local development URL. Keep the list short and explicit; do not reflect back whatever origin sent the request, which is the same thing wearing a disguise.',
    check: 'You do not need a tool for this one: open {file} and read the CORS line. If it says `*`, or hands back whatever origin asked, every website can call this API.',
    fixedWhen: 'The deployed API answers with a named origin — your domain — in Access-Control-Allow-Origin, and a request from any other origin is refused by the browser.',
    beforeApplying: 'Naming specific origins will block anything you forgot — a staging domain, a mobile build, a partner’s site. Write the list from your own deployments before you change it.',
    doNotApplyIf: 'the endpoint is a genuinely public API with no cookies and no user data — a public price feed, say. Then a wildcard is a choice rather than an accident, and it should be written down as one.',
  },
  vi: {
    title: 'API của bạn đang nhận request từ bất kỳ website nào trên internet',
    why: 'Cấu hình CORS trong {file} cho phép mọi origin (`*`). Bất kỳ site nào mà người dùng đã đăng nhập của bạn ghé qua đều có thể gọi API của bạn từ trình duyệt và đọc kết quả. Credentials trong file này: {credentials}.',
    how: 'Thay `*` bằng đúng những origin cần truy cập — domain site của bạn và URL chạy local. Danh sách nên ngắn và rõ ràng; đừng phản chiếu (reflect) lại origin của request gửi tới, vì bản chất vẫn là cho phép tất cả.',
    check: 'Việc này không cần công cụ: mở {file} và đọc dòng CORS. Nếu là `*`, hoặc trả lại đúng origin vừa gọi, thì mọi website đều gọi được API này.',
    fixedWhen: 'API đang chạy trả về một origin cụ thể — domain của bạn — trong Access-Control-Allow-Origin, và request từ origin khác bị trình duyệt chặn.',
    beforeApplying: 'Liệt kê origin cụ thể sẽ chặn mất những chỗ bạn quên — domain staging, bản mobile, site của đối tác. Hãy dựng danh sách từ chính các bản deploy của bạn trước khi đổi.',
    doNotApplyIf: 'endpoint đó thật sự là API công khai, không dùng cookie và không có dữ liệu người dùng — ví dụ một feed giá công khai. Khi đó wildcard là lựa chọn có chủ ý, và nên được ghi lại rõ ràng như vậy.',
  },
};
