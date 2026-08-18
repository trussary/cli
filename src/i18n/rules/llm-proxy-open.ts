import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Anyone on the internet can spend your AI credits through this endpoint',
    why: 'The handler in {file} (line {line}) calls a paid model API and never checks who is calling — {limiter}. Endpoints like this get found by automated scanners within days of going live, and the first sign is usually the bill, not an outage. The people doing it are not attacking you; they are reselling your credits.',
    how: 'Require a signed-in user at the top of the handler and refuse everything else. Then add a per-user limit — a number of requests per minute and a cap on how long a prompt may be — and set a spending limit in your model provider’s dashboard as the backstop that works even when the code is wrong.',
    check: 'Sign out, then send a request to that endpoint from a terminal or a private browser window. If you get a model answer back, so does everyone else. Also open your provider’s usage dashboard and look for traffic at hours you were asleep.',
    fixedWhen: 'The endpoint refuses requests that carry no session, a signed-in user hits a limit after a sensible number of requests, and your provider account has a hard spending cap set.',
  },
  vi: {
    title: 'Bất kỳ ai trên internet cũng tiêu được credit AI của bạn qua endpoint này',
    why: 'Handler trong {file} (dòng {line}) gọi API model trả phí mà không kiểm tra ai đang gọi — {limiter}. Những endpoint kiểu này bị scanner tự động tìm ra chỉ vài ngày sau khi lên sóng, và dấu hiệu đầu tiên thường là hoá đơn chứ không phải sự cố. Người ta không tấn công bạn; họ đang bán lại credit của bạn.',
    how: 'Bắt buộc phải có user đã đăng nhập ngay đầu handler và từ chối mọi request còn lại. Sau đó thêm giới hạn theo từng user — số request mỗi phút và độ dài tối đa của prompt — rồi đặt spending limit trong dashboard của nhà cung cấp model, như lớp chặn cuối vẫn hiệu lực ngay cả khi code sai.',
    check: 'Đăng xuất, rồi gửi thử một request tới endpoint đó từ terminal hoặc cửa sổ ẩn danh. Nếu bạn nhận được câu trả lời từ model thì mọi người khác cũng vậy. Ngoài ra hãy mở dashboard usage của nhà cung cấp và xem có lưu lượng vào những giờ bạn đang ngủ không.',
    fixedWhen: 'Endpoint từ chối request không có session, user đã đăng nhập thì bị chặn sau một số lượng request hợp lý, và tài khoản nhà cung cấp của bạn đã đặt mức chi tiêu tối đa.',
  },
};
