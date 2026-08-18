import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Your login tokens are signed with a guessable secret',
    why: 'The signing secret in {file} (line {line}) is {length} characters long and is one of the handful of placeholder values that generated code keeps choosing. That secret is the entire security of your login system: anyone who guesses it can write a token that says they are you, or the administrator, and your app will believe it.',
    how: 'Generate a long random value — 32 bytes or more, from a real random source, not typed by hand — put it in a server-only environment variable, and remove the literal from your code. Everyone signed in now will be signed out when the secret changes, which is the intended effect.',
    check: 'Open the file and read the secret. If you could say it out loud to someone and they could remember it, it is guessable — and every list a guesser would try starts with exactly these words.',
    fixedWhen: 'The secret exists only as an environment variable on the server, its value is long and random, and the old value appears nowhere in your code or your git history.',
  },
  vi: {
    title: 'Token đăng nhập của bạn được ký bằng một secret dễ đoán',
    why: 'Secret dùng để ký trong {file} (dòng {line}) dài {length} ký tự và nằm trong số ít giá trị placeholder mà code sinh tự động hay chọn. Secret đó chính là toàn bộ phần bảo mật của hệ thống đăng nhập: ai đoán ra nó đều có thể tự viết một token nói rằng họ là bạn, hoặc là admin, và app sẽ tin.',
    how: 'Sinh một giá trị ngẫu nhiên đủ dài — từ 32 byte trở lên, lấy từ nguồn ngẫu nhiên thật, không phải tự gõ ra — đặt vào environment variable chỉ dùng ở server, và xoá literal khỏi code. Mọi người đang đăng nhập sẽ bị đăng xuất khi secret đổi, đó là điều đúng như mong đợi.',
    check: 'Mở file ra và đọc secret. Nếu bạn có thể đọc to cho ai đó nghe và họ nhớ được thì nó dễ đoán — và mọi danh sách mà người đi đoán sẽ thử đều bắt đầu bằng đúng những từ này.',
    fixedWhen: 'Secret chỉ tồn tại dưới dạng environment variable trên server, giá trị dài và ngẫu nhiên, còn giá trị cũ không còn xuất hiện ở bất kỳ đâu trong code hay trong git history.',
  },
};
