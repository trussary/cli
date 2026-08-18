import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Files uploaded to "{bucket}" are readable by anyone with the link',
    why: 'The bucket {bucket} is created public in {file}. Every file in it is a plain URL — no login, no expiry — and those URLs are usually easy to guess from a user id or a file name. That is fine for a logo and serious for anything a user uploaded about themselves.',
    how: 'Make the bucket private and serve its files through signed URLs that expire (createSignedUrl), plus storage policies that say who may read what. Keep a separate public bucket for genuinely public assets if you need one.',
    check: 'Open one of the uploaded files’ URLs in a private browser window where you are not logged in. If it loads, that file is public to the whole internet — including to anyone who guesses a neighbouring file name.',
    fixedWhen: 'Opening a file URL from that bucket while signed out returns an error, and your app still shows the file to the person who owns it — through a signed URL, not a public one.',
  },
  vi: {
    title: 'File upload vào bucket "{bucket}" ai có link cũng đọc được',
    why: 'Bucket {bucket} được tạo ở chế độ public trong {file}. Mọi file trong đó là một URL trần — không cần đăng nhập, không hết hạn — và URL thường dễ đoán từ user id hay tên file. Với logo thì không sao, nhưng với thứ người dùng tự upload về bản thân họ thì rất nghiêm trọng.',
    how: 'Chuyển bucket sang private và phục vụ file qua signed URL có hạn (createSignedUrl), kèm storage policy quy định ai được đọc gì. Nếu cần, giữ riêng một bucket public cho những asset thật sự công khai.',
    check: 'Mở một file đã upload bằng cửa sổ ẩn danh, chưa đăng nhập. Nếu file vẫn hiện ra thì nó công khai với cả internet — kể cả với người đoán ra tên file bên cạnh.',
    fixedWhen: 'Mở URL file trong bucket đó lúc chưa đăng nhập thì báo lỗi, còn app vẫn hiển thị file cho đúng người sở hữu — qua signed URL, không phải URL public.',
  },
};
