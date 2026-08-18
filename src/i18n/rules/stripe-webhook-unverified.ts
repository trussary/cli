import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Your payment webhook believes whatever it is sent',
    why: 'The handler in {file} (line {line}) acts on a Stripe event — granting access, marking something paid — without verifying that Stripe actually sent it. The URL is public, so anyone can post their own event body to it and be treated as a paying customer.',
    how: 'Verify the signature before you trust the event: read the stripe-signature header and pass it, the raw request body and your webhook signing secret to constructEvent. The raw body matters — if your framework parses the JSON first, verification will fail, so use the raw-body option for this route.',
    check: 'Send a fake event to your webhook URL yourself: a plain POST with a JSON body that looks like a successful payment. If your app grants whatever that event claims, an unverified webhook is exactly what you have.',
    fixedWhen: 'An unsigned request to the webhook URL is rejected with an error and changes nothing, while real Stripe events still arrive and are processed — check the Stripe dashboard webhook log for successful deliveries after the change.',
  },
  vi: {
    title: 'Webhook thanh toán của bạn tin mọi thứ được gửi tới',
    why: 'Handler trong {file} (dòng {line}) hành động theo một Stripe event — mở quyền, đánh dấu đã thanh toán — mà không xác minh event đó có thật sự do Stripe gửi hay không. URL này công khai, nên ai cũng có thể tự POST một event body và được đối xử như khách đã trả tiền.',
    how: 'Xác minh signature trước khi tin event: đọc header stripe-signature rồi truyền nó, raw request body và webhook signing secret vào constructEvent. Raw body rất quan trọng — nếu framework parse JSON trước thì việc xác minh sẽ thất bại, nên hãy bật tuỳ chọn raw body cho route này.',
    check: 'Tự gửi một event giả tới URL webhook của bạn: một POST bình thường với JSON body trông như thanh toán thành công. Nếu app cấp quyền theo đúng những gì event đó nói thì webhook của bạn đúng là chưa xác minh.',
    fixedWhen: 'Request không có chữ ký gửi tới URL webhook bị từ chối kèm lỗi và không thay đổi gì, trong khi event thật từ Stripe vẫn tới và vẫn được xử lý — kiểm tra log webhook trong dashboard Stripe để thấy các lần gửi thành công sau khi sửa.',
  },
};
