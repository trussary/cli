import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Your database tables are not protected by Row Level Security',
    why: 'The key your app ships to the browser (the anon key) can read any table that has no RLS policy — not only the rows the signed-in person is allowed to see. Affected here: {tables}. Hiding a button is not a permission check; the database has to say no.',
    how: 'For each table, switch RLS on (alter table {table} enable row level security) and then write the policies that say who may read and write which rows — usually auth.uid() = user_id. Do both: RLS with no policy denies everything, which looks like a broken app.',
    check: 'Open your Supabase dashboard → Table Editor and look at the tables list. Any table without the "RLS enabled" mark is readable by anyone holding the anon key — and the anon key is in your website source, by design.',
    fixedWhen: 'You can query each table with the anon key — never the service role key — and get back only what that person should see. RLS on with no policy denies everything and looks like a broken app; that is the cue to write policies, not to switch RLS back off.',
    notes: {
      'no-migrations': 'your app connects to Supabase in {file}, but this project has no migration files — we cannot see your table definitions or policies from here, only your Supabase dashboard can tell you whether RLS is on',
    },
  },
  vi: {
    title: 'Các bảng trong database của bạn chưa được bảo vệ bằng Row Level Security',
    why: 'Key mà app gửi xuống trình duyệt (anon key) đọc được mọi bảng không có RLS policy — chứ không chỉ những dòng mà người đang đăng nhập được phép xem. Bị ảnh hưởng ở đây: {tables}. Ẩn một cái nút không phải là kiểm tra quyền; database mới là nơi phải nói không.',
    how: 'Với mỗi bảng, bật RLS (alter table {table} enable row level security) rồi viết policy quy định ai được đọc, được ghi dòng nào — thường là auth.uid() = user_id. Phải làm cả hai: bật RLS mà không có policy thì chặn hết, trông y như app bị hỏng.',
    check: 'Mở Supabase dashboard → Table Editor và nhìn danh sách bảng. Bảng nào không có dấu "RLS enabled" thì bất kỳ ai cầm anon key đều đọc được — mà anon key thì nằm sẵn trong source website của bạn, theo đúng thiết kế.',
    fixedWhen: 'Bạn query từng bảng bằng anon key — tuyệt đối không dùng service role key — và chỉ nhận về đúng phần người đó được xem. Bật RLS mà chưa có policy thì chặn hết và trông như app hỏng; đó là dấu hiệu cần viết policy, không phải để tắt RLS đi.',
    notes: {
      'no-migrations': 'app của bạn kết nối Supabase trong {file}, nhưng project này không có file migration nào — từ đây chúng tôi không thấy được định nghĩa bảng hay policy, chỉ Supabase dashboard mới cho bạn biết RLS đã bật hay chưa',
    },
  },
};
