import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Your app tells visitors more about itself than it should',
    why: 'The evidence above is development behaviour that stays switched on in a deployed app. Error details name your files, your libraries and often your database — a stranger reading them learns exactly what to try next.',
    how: 'Return a short, generic message to the caller and log the full error on the server where only you can read it. Tie any debug switch to an environment variable that is off in production, rather than hard-coding it on.',
    check: 'On your live site, ask for a page or an API path that does not exist, or submit a form with obviously wrong data. If what comes back mentions file paths, line numbers, or a library name, that is the leak.',
    fixedWhen: 'A deliberately broken request on the live site returns a plain message with no file paths, no stack trace and no library names — while the full error still appears in your server logs.',
  },
  vi: {
    title: 'App của bạn đang tiết lộ về chính nó nhiều hơn mức cần thiết',
    why: 'Bằng chứng ở trên là hành vi dành cho development nhưng vẫn bật khi app đã deploy. Chi tiết lỗi nêu ra tên file, thư viện và thường cả database của bạn — người lạ đọc được là biết ngay nên thử gì tiếp.',
    how: 'Trả về cho người gọi một message ngắn và chung chung, còn lỗi đầy đủ thì log ở server nơi chỉ bạn đọc được. Mọi công tắc debug nên gắn với environment variable và tắt ở production, thay vì hard-code là bật.',
    check: 'Trên site đang chạy, thử mở một trang hoặc một API path không tồn tại, hoặc gửi form với dữ liệu sai rõ ràng. Nếu phản hồi có đường dẫn file, số dòng hay tên thư viện thì đó chính là chỗ rò rỉ.',
    fixedWhen: 'Một request cố tình gây lỗi trên site đang chạy trả về message đơn giản, không có đường dẫn file, không stack trace, không tên thư viện — trong khi log ở server vẫn ghi đầy đủ lỗi.',
  },
};
