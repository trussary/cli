import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'A password-level key is sitting in your app’s public files',
    why: 'Everything shipped to the browser is public. A {provider} key found in {file} can be used by anyone who opens your site — to spend your money or read your data.',
    how: 'Remove the key from client code and move it to a server-only environment variable (no VITE_ or NEXT_PUBLIC_ prefix). Then — the part almost everyone skips — rotate it: create a new key at the provider and revoke this one.',
    check: 'Open your live site, view the page source (right-click → View Page Source), and search for sk_, SECRET, SERVICE_ROLE. Anything a stranger can find there, a stranger already has.',
    fixedWhen: 'The key has been rotated — a brand-new key issued and the old one revoked at the provider. A key that was ever public stays compromised even after you move it, so moving it is not enough.',
    beforeApplying: 'Rotating the key breaks anything else that was using the old one — another app, a script, a teammate’s setup. List those first, then rotate and update them together.',
    doNotApplyIf: 'the value is a publishable key meant for the browser (Stripe pk_, a Supabase anon key). Those belong in client code, and RLS or Stripe’s own limits are what protect them.',
  },
  vi: {
    title: 'Có một key cấp độ mật khẩu đang nằm trong file public của app',
    why: 'Mọi thứ gửi xuống trình duyệt đều là công khai. Key {provider} nằm trong {file} thì ai mở site của bạn cũng lấy được — để tiêu tiền của bạn hoặc đọc dữ liệu của bạn.',
    how: 'Bỏ key khỏi code chạy trên trình duyệt, chuyển sang environment variable chỉ dùng ở server (không có prefix VITE_ hay NEXT_PUBLIC_). Rồi — bước mà hầu hết mọi người bỏ qua — rotate key: tạo key mới ở provider và revoke key này.',
    check: 'Mở site đang chạy, xem page source (chuột phải → View Page Source), tìm sk_, SECRET, SERVICE_ROLE. Thứ gì người lạ tìm thấy ở đó thì coi như họ đã có rồi.',
    fixedWhen: 'Key đã được rotate — key mới đã tạo và key cũ đã revoke ở provider. Key từng lộ một lần thì coi như mất, chỉ chuyển sang .env là chưa đủ.',
    beforeApplying: 'Rotate key sẽ làm hỏng mọi thứ khác đang dùng key cũ — app khác, script, máy của đồng đội. Hãy liệt kê những chỗ đó trước, rồi rotate và cập nhật cùng lúc.',
    doNotApplyIf: 'giá trị đó là publishable key vốn dành cho trình duyệt (pk_ của Stripe, anon key của Supabase). Những key đó nằm trong client code là đúng, và RLS hay giới hạn của chính Stripe mới là thứ bảo vệ chúng.',
  },
};
