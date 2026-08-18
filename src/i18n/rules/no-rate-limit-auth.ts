import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'We found no limit in your code on how often someone can try to sign in',
    why: 'Your sign-in path ({file}) can be called as fast as a script can call it, as far as your code is concerned. That allows password guessing at machine speed, and — where each attempt sends an email or an SMS — it turns your login form into someone else’s spam service, billed to you. If you set a limit at your host or in your auth provider, you are covered; we cannot see those from files.',
    how: 'Add a limit at the sign-in endpoint: a handful of attempts per email address and per IP address per minute, then a pause. Your auth provider may offer this as a setting — Supabase and Clerk both do — which is less code to maintain than writing it yourself.',
    check: 'Try your own login form with the wrong password ten times quickly. If the tenth attempt behaves exactly like the first, with no delay and no lockout, nothing is limiting it.',
    fixedWhen: 'Repeated failed attempts from the same source start being refused after a small number of tries, and the refusal is measured in the response — not just a message in the interface.',
    beforeApplying: 'Set the limit high enough that a real person retyping a password is not locked out. Per-address limits also hit a whole office behind one address, so count per account as well.',
    notes: {
      'not-in-code': 'no rate limiter found anywhere in your code, next to the sign-in path in {file} — a limit set at your host or auth provider dashboard would not be visible here',
    },
  },
  vi: {
    title: 'Chúng tôi không thấy giới hạn nào trong code về số lần thử đăng nhập',
    why: 'Theo những gì code của bạn thể hiện, đường đăng nhập ({file}) có thể bị gọi nhanh đúng bằng tốc độ một script gọi được. Như vậy mật khẩu có thể bị dò ở tốc độ máy móc, và — nếu mỗi lần thử đều gửi email hoặc SMS — form login của bạn thành dịch vụ spam cho người khác, hoá đơn bạn trả. Nếu bạn đã đặt limit ở host hoặc ở auth provider thì bạn ổn; từ file thì không thấy được.',
    how: 'Thêm giới hạn ngay tại endpoint đăng nhập: vài lần thử mỗi phút cho mỗi email và mỗi địa chỉ IP, rồi tạm dừng. Auth provider của bạn có thể đã có sẵn tuỳ chọn này — Supabase và Clerk đều có — dùng nó sẽ đỡ phải tự viết và tự bảo trì.',
    check: 'Thử nhập sai mật khẩu trên chính form login của bạn mười lần thật nhanh. Nếu lần thứ mười hoạt động y hệt lần đầu, không chậm lại, không khoá tạm, thì không có gì đang giới hạn cả.',
    fixedWhen: 'Các lần thử sai liên tiếp từ cùng một nguồn bắt đầu bị từ chối sau một số lần nhỏ, và việc từ chối thể hiện ngay trong response — không chỉ là một dòng thông báo trên giao diện.',
    beforeApplying: 'Hãy đặt mức giới hạn đủ rộng để người dùng thật gõ lại mật khẩu không bị khoá. Giới hạn theo địa chỉ IP cũng ảnh hưởng cả một văn phòng dùng chung một IP, nên hãy đếm theo cả tài khoản.',
    notes: {
      'not-in-code': 'không tìm thấy rate limiter nào trong code của bạn, ngay cạnh đường đăng nhập trong {file} — limit đặt ở host hay dashboard của auth provider thì ở đây không thấy được',
    },
  },
};
