import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Anyone can read your "{table}" table straight from the internet',
    why: 'We asked your database for a row from {table}, using only the public key that already ships inside your website, and it handed one back — columns: {columns}. No login, no app, no permission check. This is not a guess about your settings; it is the answer your database gave.',
    how: 'Switch Row Level Security on for {table} and write policies that say who may read which rows — typically matching the signed-in user id against the row owner. Then re-run this check: the same request should come back empty.',
    check: 'You can repeat exactly what we did: open your app, view the page source, find the anon key, and open the table URL with it. Anything that comes back is what a stranger sees.',
    fixedWhen: 'That same request with the anon key returns an empty result, while your app still shows each signed-in person their own rows.',
  },
  vi: {
    title: 'Bất kỳ ai cũng đọc được bảng "{table}" của bạn thẳng từ internet',
    why: 'Chúng tôi đã hỏi database của bạn một dòng trong {table}, chỉ dùng public key vốn đã nằm sẵn trong website của bạn, và nó trả về một dòng — các cột: {columns}. Không đăng nhập, không qua app, không có bước kiểm tra quyền nào. Đây không phải phỏng đoán về cấu hình; đây là câu trả lời chính database đưa ra.',
    how: 'Bật Row Level Security cho {table} và viết policy quy định ai được đọc dòng nào — thường là so id của user đang đăng nhập với chủ sở hữu của dòng đó. Sau đó chạy lại kiểm tra này: cùng request đó phải trả về rỗng.',
    check: 'Bạn có thể lặp lại đúng những gì chúng tôi làm: mở app, xem page source, tìm anon key, rồi mở URL của bảng kèm key đó. Thứ gì trả về chính là thứ người lạ nhìn thấy.',
    fixedWhen: 'Cùng request đó với anon key trả về kết quả rỗng, trong khi app vẫn hiển thị cho mỗi người đăng nhập đúng dữ liệu của họ.',
  },
};
