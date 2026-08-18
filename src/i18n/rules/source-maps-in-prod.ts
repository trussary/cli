import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Your built app ships a copy of its original source code',
    why: 'Source maps ({count} of them, starting at {file}) rebuild your original, commented code in any visitor’s browser. Anything you assumed was hidden by the build — internal comments, admin paths, the shape of your API — is readable.',
    how: 'Turn source maps off for production builds ({cause}), rebuild, and redeploy. If you want them for error tracking, upload them to your error tracker instead of serving them from the site.',
    check: 'Open your live site, open the browser devtools Sources panel, and look for a folder that shows your real file names (src/, app/) rather than minified bundles. If you can read your own code there, so can anyone.',
    fixedWhen: 'A fresh production build contains no .map files, and requesting one of the old .map URLs on your live site returns 404 — not just a new build sitting locally.',
  },
  vi: {
    title: 'Bản build của app đang ship kèm source code gốc',
    why: 'Source map ({count} file, bắt đầu từ {file}) dựng lại code gốc kèm comment ngay trong trình duyệt của người xem. Những gì bạn tưởng đã bị build che đi — comment nội bộ, đường dẫn admin, cấu trúc API — đều đọc được.',
    how: 'Tắt source map cho production build ({cause}), build lại và deploy lại. Nếu vẫn cần map để theo dõi lỗi, hãy upload lên error tracker thay vì để site phục vụ file đó.',
    check: 'Mở site đang chạy, mở devtools tab Sources, xem có thư mục hiện đúng tên file thật của bạn (src/, app/) thay vì bundle đã minify không. Bạn đọc được thì người lạ cũng đọc được.',
    fixedWhen: 'Bản production build mới không còn file .map nào, và mở lại URL .map cũ trên site đang chạy trả về 404 — chứ không chỉ là build mới nằm ở máy bạn.',
  },
};
