import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'An endpoint saves whatever it is sent, without checking it first',
    why: 'In {file} (line {line}) the body of the request goes straight into your database, and nothing in that file checks what arrived. Your form sends the fields you expect; a script can send any fields it likes — including ones you never meant callers to set, such as a role or a price. If your database or ORM enforces this, you are covered; we cannot see those rules from your code.',
    how: 'Describe what the endpoint accepts and reject anything else: a schema (zod and friends do this in a few lines) or explicit checks on each field. Pick the fields you want out of the body by name rather than passing the whole object through to the database.',
    check: 'Send a request to this endpoint with an extra field that should not be settable — role, isAdmin, credits, price — and then look at the saved row. If your extra field is there, the endpoint is accepting whatever it is given.',
    fixedWhen: 'A request carrying unexpected or wrongly-typed fields is rejected with a clear error and saves nothing, while your own form still works unchanged.',
  },
  vi: {
    title: 'Một endpoint lưu thẳng mọi thứ nhận được mà không kiểm tra trước',
    why: 'Trong {file} (dòng {line}), body của request đi thẳng vào database, và trong file đó không có gì kiểm tra dữ liệu vừa đến. Form của bạn gửi đúng những field bạn mong đợi; nhưng một script có thể gửi bất kỳ field nào nó muốn — kể cả những field bạn không bao giờ định cho người gọi set, như role hay price. Nếu database hoặc ORM của bạn đã ràng buộc việc này thì bạn ổn; từ code chúng tôi không thấy được các ràng buộc đó.',
    how: 'Mô tả rõ endpoint chấp nhận những gì và từ chối phần còn lại: một schema (zod và các thư viện tương tự chỉ mất vài dòng) hoặc kiểm tra tường minh từng field. Hãy lấy ra đúng những field cần theo tên, thay vì đẩy nguyên object xuống database.',
    check: 'Gửi tới endpoint này một request kèm thêm field lẽ ra không được phép set — role, isAdmin, credits, price — rồi mở dòng dữ liệu vừa lưu ra xem. Nếu field thêm đó có mặt thì endpoint đang nhận mọi thứ được đưa cho nó.',
    fixedWhen: 'Request mang field lạ hoặc sai kiểu bị từ chối kèm lỗi rõ ràng và không lưu gì cả, trong khi form của chính bạn vẫn chạy y như cũ.',
  },
};
