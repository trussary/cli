import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Your upload accepts any file, of any size, as far as your code says',
    why: 'The upload in {file} (line {line}) sets no limit on file size and no list of allowed file types anywhere in that file. That is how a storage bill turns into a surprise overnight, and how an HTML or script file ends up served from your own domain. If you set a limit in your bucket settings or at your host, you are covered — we cannot see those from your code.',
    how: 'State the limits in the code that accepts the upload: a maximum size, and an explicit list of allowed types (images only, for example). Check both on the server, not just in the file picker — the file picker is a suggestion, not a rule.',
    check: 'Try uploading a large file — a few hundred megabytes — and then a file with an unexpected extension, like .html or .svg. If both go through and the .html one opens as a page on your domain, that is the gap.',
    fixedWhen: 'An oversized file and a disallowed file type are both rejected by the server with a clear message, even when the request does not come from your own upload form.',
  },
  vi: {
    title: 'Theo những gì code của bạn nói, upload đang nhận mọi file với mọi dung lượng',
    why: 'Phần upload trong {file} (dòng {line}) không đặt giới hạn dung lượng và không liệt kê kiểu file được phép ở bất kỳ đâu trong file đó. Đây là cách hoá đơn storage tăng vọt sau một đêm, và cách một file HTML hay script được phục vụ ngay từ domain của bạn. Nếu bạn đã đặt limit trong cấu hình bucket hoặc ở host thì bạn ổn — code thì không cho chúng tôi thấy điều đó.',
    how: 'Ghi rõ giới hạn ngay trong code nhận upload: dung lượng tối đa và danh sách kiểu file được phép (ví dụ chỉ ảnh). Kiểm tra ở server chứ không chỉ ở ô chọn file — ô chọn file chỉ là gợi ý, không phải luật.',
    check: 'Thử upload một file lớn — vài trăm MB — rồi thử một file có đuôi lạ như .html hay .svg. Nếu cả hai đều lọt và file .html mở ra như một trang trên domain của bạn thì đó chính là lỗ hổng.',
    fixedWhen: 'File quá lớn và file sai kiểu đều bị server từ chối kèm thông báo rõ ràng, kể cả khi request không đến từ form upload của chính bạn.',
  },
};
