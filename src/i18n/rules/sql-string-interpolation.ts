import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'A database query is built by pasting values into text',
    why: 'In {file} (line {line}) a value is glued into the query string itself. If that value ever comes from a visitor — a search box, a URL, a form field — they are not filling in a blank, they are finishing your query. That is how whole tables get read or deleted by someone typing into a search box.',
    how: 'Pass values as parameters instead of pasting them in: placeholders in the query text and the values as a separate argument, which is what every database driver supports. Your database library almost certainly has a safe form already — the parameterised call, or a tagged template.',
    check: 'Find the input that reaches this query and type a single apostrophe into it. If the app returns a database error rather than "no results", the input is being read as part of the query.',
    fixedWhen: 'The query text in your code contains no interpolated values at all — every value arrives as a parameter — and the apostrophe test returns an ordinary empty result.',
  },
  vi: {
    title: 'Một câu truy vấn database đang được dựng bằng cách dán giá trị vào chuỗi',
    why: 'Trong {file} (dòng {line}), một giá trị được dán thẳng vào chuỗi query. Nếu giá trị đó đến từ người dùng — ô tìm kiếm, URL, một field trong form — thì họ không phải đang điền vào chỗ trống, họ đang viết nốt câu query của bạn. Đó là cách cả một bảng bị đọc sạch hoặc bị xoá chỉ bằng việc gõ vào ô tìm kiếm.',
    how: 'Truyền giá trị dưới dạng parameter thay vì dán vào: dùng placeholder trong câu query và đưa giá trị qua một tham số riêng — mọi database driver đều hỗ trợ. Thư viện database bạn đang dùng gần như chắc chắn đã có sẵn dạng an toàn: lời gọi có parameter, hoặc tagged template.',
    check: 'Tìm ô nhập liệu dẫn tới câu query này và gõ vào đó một dấu nháy đơn. Nếu app trả về lỗi database thay vì "không có kết quả" thì dữ liệu nhập đang được đọc như một phần của câu query.',
    fixedWhen: 'Chuỗi query trong code không còn giá trị nào được nội suy vào — mọi giá trị đều đi vào dưới dạng parameter — và phép thử dấu nháy đơn chỉ trả về kết quả rỗng bình thường.',
  },
};
