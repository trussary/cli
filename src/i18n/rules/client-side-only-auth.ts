import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'This page checks who you are in the browser, after the data has arrived',
    why: 'In {file} (line {line}) the page loads, asks the browser whether someone is signed in, and sends them to the login page if not. The redirect happens in the visitor’s own browser — which they control. Anyone can stop it, and the data the page already fetched is in the network tab either way. Hiding a button is not a permission check.',
    how: 'Move the check to the server: fetch the data in a server component, route handler or loader that verifies the session first, so the browser never receives anything a signed-out visitor should not have. Keep the redirect as well — it is good for the experience, just not as the protection.',
    check: 'Sign out. Open the protected page and immediately open devtools → Network before the redirect finishes. If you can see the real data in a response, the page never protected it. This one is worth doing by hand — we can only see the shape of the code, not what it returns.',
    fixedWhen: 'With no session, the network responses for that page contain no private data at all — not merely a page that redirects a moment after showing up.',
  },
  vi: {
    title: 'Trang này kiểm tra bạn là ai ở trình duyệt, sau khi dữ liệu đã về',
    why: 'Trong {file} (dòng {line}), trang được load, hỏi trình duyệt xem có ai đang đăng nhập không, rồi đẩy sang trang login nếu không có. Việc chuyển hướng diễn ra trong trình duyệt của chính người truy cập — thứ mà họ kiểm soát. Ai cũng chặn được, và dữ liệu trang đã fetch thì vẫn nằm trong network tab. Ẩn một cái nút không phải là kiểm tra quyền.',
    how: 'Chuyển bước kiểm tra về server: fetch dữ liệu trong server component, route handler hoặc loader có xác thực session trước, để trình duyệt không bao giờ nhận được thứ mà người chưa đăng nhập không được thấy. Vẫn giữ phần redirect — nó tốt cho trải nghiệm, chỉ là không được coi nó là lớp bảo vệ.',
    check: 'Đăng xuất. Mở trang cần bảo vệ rồi mở ngay devtools → Network trước khi redirect kịp hoàn tất. Nếu bạn thấy dữ liệu thật trong response thì trang đó chưa từng bảo vệ nó. Bước này nên tự làm tay — chúng tôi chỉ nhìn được hình dạng của code, không thấy được nó trả về gì.',
    fixedWhen: 'Khi không có session, các response mạng của trang đó hoàn toàn không chứa dữ liệu riêng tư — chứ không phải chỉ là trang hiện ra rồi một lát sau mới chuyển hướng.',
  },
};
