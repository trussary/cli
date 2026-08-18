import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Your .env file — with your keys in it — is downloadable from your site',
    why: 'A request to {url} returned environment-variable content, starting with {name}. Every value in that file is public as of now, and has been for as long as the site has been live. Anyone scanning the internet for this exact path already has it, and scanners try /.env on new domains within hours.',
    how: 'Stop serving the file: environment variables belong in your host settings, not in a file inside the folder being published. Then rotate every key it holds — all of them, not only the ones that look important. A key that has been public stays public.',
    check: 'Open {url} in a private browser window. If you see lines like NAME=value, that is your live configuration being handed to anyone who asks for it.',
    fixedWhen: 'That URL returns 404 on the deployed site, and every key the file contained has been replaced with a new one and the old one revoked.',
    beforeApplying: 'Rotating every key will break anything still using the old ones, including other services of yours. Make the list first, then rotate and update together.',
  },
  vi: {
    title: 'File .env — nơi chứa các key của bạn — đang tải về được từ site',
    why: 'Một request tới {url} trả về nội dung environment variable, bắt đầu bằng {name}. Mọi giá trị trong file đó là công khai kể từ lúc này, và thực ra đã công khai suốt thời gian site chạy. Ai đang quét internet đúng đường dẫn này thì đã có nó rồi; scanner thử /.env với domain mới chỉ trong vài giờ.',
    how: 'Ngừng phục vụ file đó: environment variable nên nằm trong phần cấu hình của host, không nằm trong file bên trong thư mục được publish. Sau đó rotate mọi key trong file — tất cả, không chỉ những cái trông có vẻ quan trọng. Key đã công khai thì coi như công khai vĩnh viễn.',
    check: 'Mở {url} bằng cửa sổ ẩn danh. Nếu bạn thấy các dòng dạng NAME=value thì đó chính là cấu hình đang chạy của bạn đang được trao cho bất kỳ ai hỏi.',
    fixedWhen: 'URL đó trả về 404 trên site đã deploy, và mọi key file đó từng chứa đã được thay bằng key mới còn key cũ đã bị revoke.',
    beforeApplying: 'Rotate toàn bộ key sẽ làm hỏng mọi thứ còn dùng key cũ, kể cả các dịch vụ khác của chính bạn. Hãy lập danh sách trước, rồi rotate và cập nhật cùng lúc.',
  },
};
