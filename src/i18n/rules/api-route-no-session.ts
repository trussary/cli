import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'An API endpoint that {action} never asks who is calling',
    why: 'Nothing in {file} checks for a signed-in user before it {action}. Your app may only call this endpoint from a page behind a login, but the endpoint itself is a URL on the open internet: anyone can call it directly, with no browser, no button and no login.',
    how: 'Get the current user at the top of the handler and stop early when there is not one. With Supabase that is a getUser() call on a server client; with NextAuth or Clerk it is the server-side session helper. Then also make sure the query only returns that user rows — the check and the filter are two different jobs.',
    check: 'Sign out, then open the endpoint URL directly in your browser (or use a private window). If you get data back rather than an error, the endpoint is answering strangers.',
    fixedWhen: 'Calling the endpoint with no session returns an authorisation error and no data, and calling it as one signed-in user returns only that user’s own rows.',
  },
  vi: {
    title: 'Một API endpoint có hành vi {action} nhưng không hề hỏi ai đang gọi',
    why: 'Không có gì trong {file} kiểm tra người dùng đã đăng nhập trước khi nó {action}. App của bạn có thể chỉ gọi endpoint này từ một trang sau màn hình login, nhưng bản thân endpoint là một URL nằm ngoài internet: ai cũng gọi trực tiếp được, không cần trình duyệt, không cần bấm nút, không cần đăng nhập.',
    how: 'Lấy user hiện tại ngay đầu handler và dừng sớm nếu không có. Với Supabase là gọi getUser() trên server client; với NextAuth hay Clerk là helper session phía server. Sau đó vẫn phải đảm bảo query chỉ trả về dữ liệu của chính user đó — kiểm tra danh tính và lọc dữ liệu là hai việc khác nhau.',
    check: 'Đăng xuất, rồi mở thẳng URL của endpoint trong trình duyệt (hoặc cửa sổ ẩn danh). Nếu vẫn nhận về dữ liệu thay vì lỗi thì endpoint đang trả lời người lạ.',
    fixedWhen: 'Gọi endpoint khi chưa đăng nhập thì nhận lỗi authorisation và không có dữ liệu, còn gọi với tư cách một user đã đăng nhập thì chỉ nhận về dữ liệu của chính user đó.',
  },
};
