import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Your site does not tell browsers how to protect your users',
    why: 'We read your config and server code ({count} files) and found no security headers set anywhere. Without them a browser will happily load your site inside someone else’s page, guess file types, or run scripts injected into your content — the defaults are permissive, and silence means default.',
    how: 'Add security headers where your app is served. On Next.js that is a `headers()` block in next.config; on Vercel a `headers` entry in vercel.json; on Express the `helmet` middleware. Start with Content-Security-Policy, X-Frame-Options, X-Content-Type-Options and Strict-Transport-Security.',
    check: 'Open your live site, open browser devtools → Network, click the first request, and read the Response Headers. If you see none of the names above, the browser is running your site with no instructions.',
    fixedWhen: 'A request to your live site returns those headers in the response — check the deployed site, not your local build, since your host may strip or add headers of its own.',
    notes: {
      'looked-in': 'no security headers in your config or server code ({count} files read) — headers set at your CDN or host dashboard are invisible to a file scan',
    },
  },
  vi: {
    title: 'Site của bạn chưa nói cho trình duyệt biết cách bảo vệ người dùng',
    why: 'Chúng tôi đã đọc config và code server của bạn ({count} file) và không thấy security header nào được set. Thiếu chúng, trình duyệt sẽ vô tư nhúng site của bạn vào trang của người khác, tự đoán kiểu file, hoặc chạy script bị chèn vào nội dung — mặc định vốn dễ dãi, và im lặng nghĩa là dùng mặc định.',
    how: 'Thêm security header ở nơi app được phục vụ. Với Next.js là block `headers()` trong next.config; với Vercel là mục `headers` trong vercel.json; với Express là middleware `helmet`. Bắt đầu với Content-Security-Policy, X-Frame-Options, X-Content-Type-Options và Strict-Transport-Security.',
    check: 'Mở site đang chạy, mở devtools → Network, bấm vào request đầu tiên và đọc phần Response Headers. Nếu không thấy tên nào ở trên, tức là trình duyệt đang chạy site của bạn mà không có chỉ dẫn nào.',
    fixedWhen: 'Request tới site đang chạy trả về các header đó trong response — kiểm tra trên site đã deploy, không phải bản build ở máy, vì host có thể tự thêm hoặc bỏ header.',
    notes: {
      'looked-in': 'không có security header nào trong config hay code server của bạn (đã đọc {count} file) — header set ở CDN hay dashboard của host thì scan file không thấy được',
    },
  },
};
