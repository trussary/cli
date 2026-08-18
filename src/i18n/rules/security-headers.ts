import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Your live site is missing {count} security header(s)',
    why: 'We asked {url} for its home page and read the response: {missing} are not there. This is what your visitors’ browsers actually receive, whatever your config says. Without these, a browser will embed your site inside someone else’s page, guess file types, or run scripts that were injected into your content.',
    how: 'Set the missing headers where your site is served — next.config for Next.js, vercel.json on Vercel, a _headers file on Netlify, helmet in Express. Start the Content-Security-Policy in report-only mode so you can see what it would block before it blocks anything.',
    check: 'Open your site, open devtools → Network, click the first request and read Response Headers. The names listed above should be there and are not.',
    fixedWhen: 'The same request to the deployed site returns all of those headers — checked on the live URL rather than a local build, since your host can add or strip headers of its own.',
    beforeApplying: 'A strict Content-Security-Policy can break a working site by blocking a script you rely on. Start in report-only mode and read the reports before enforcing it.',
  },
  vi: {
    title: 'Site đang chạy của bạn thiếu {count} security header',
    why: 'Chúng tôi đã gọi trang chủ tại {url} và đọc response: {missing} không có mặt. Đây đúng là thứ trình duyệt của người dùng nhận được, bất kể config của bạn ghi gì. Thiếu chúng, trình duyệt sẽ nhúng site của bạn vào trang của người khác, tự đoán kiểu file, hoặc chạy script bị chèn vào nội dung.',
    how: 'Set các header còn thiếu ở nơi site được phục vụ — next.config với Next.js, vercel.json trên Vercel, file _headers trên Netlify, helmet trong Express. Hãy bật Content-Security-Policy ở chế độ report-only trước để thấy nó sẽ chặn gì trước khi thực sự chặn.',
    check: 'Mở site, mở devtools → Network, bấm vào request đầu tiên và đọc phần Response Headers. Những tên liệt kê ở trên đáng lẽ phải có mà hiện không có.',
    fixedWhen: 'Cùng request đó tới site đã deploy trả về đầy đủ các header — kiểm tra trên URL đang chạy chứ không phải bản build ở máy, vì host có thể tự thêm hoặc bỏ header.',
    beforeApplying: 'Content-Security-Policy chặt có thể làm hỏng site đang chạy vì chặn mất script bạn đang dùng. Hãy bắt đầu ở chế độ report-only và đọc report trước khi bật enforce.',
  },
};
