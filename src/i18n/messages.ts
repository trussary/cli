import type { Locale } from './types.js';

/**
 * Engine / UI strings (non-rule). Keys are flat: `engine.<name>`.
 * VI keeps English technical terms with Vietnamese around them, matching
 * the trussary.com house standard.
 */
export const engineMessages: Record<Locale, Record<string, string>> = {
  en: {
    'engine.scanning': 'Checking {path}',
    'engine.stacks': 'Detected: {stacks}',
    'engine.no-stacks': 'No known stack detected — running general checks only',
    'engine.no-findings': 'Nothing found at or above this level. That is not a guarantee — it means these specific checks passed.',
    'engine.summary': '{critical} critical · {high} high · {medium} medium · {low} low',
    'engine.suppressed-count': '{count} finding(s) suppressed (see --verbose or the markdown report)',
    'engine.evidence': 'Evidence',
    'engine.why': 'Why it matters',
    'engine.check': 'Check whether this is you',
    'engine.fixed-when': 'Fixed when',
    'engine.how': 'How to fix',
    'engine.possible-note': 'Marked "possible": we cannot be sure from files alone — use the check above to confirm.',
    'engine.absence-evidence': 'What we looked for and did not find',
    'engine.live-receipt': 'Live check: {requests} request(s) to {url} (GET/HEAD only), ownership self-asserted via --i-own-this-site',
    'engine.live-skipped': 'A URL was given but --i-own-this-site was not. Nothing was probed. Add the flag only for a site you own.',
    'engine.cta': 'Want a person to look at the full picture? trussary.com — free, no card, no catch.',
    'engine.rule-error': 'Check {ruleId} could not run: {message}',
    'engine.config-warning': 'Config: {message}',
    'engine.exit-explain': 'Exit code {code}: findings at or above --min-severity {min}',
    'engine.offline-skipped': 'Dependency advisory check skipped (offline)',
  },
  vi: {
    'engine.scanning': 'Đang kiểm tra {path}',
    'engine.stacks': 'Nhận diện: {stacks}',
    'engine.no-stacks': 'Không nhận diện được stack quen thuộc — chỉ chạy các kiểm tra chung',
    'engine.no-findings': 'Không phát hiện gì ở mức này trở lên. Đây không phải lời bảo đảm — chỉ có nghĩa là các kiểm tra cụ thể này đã qua.',
    'engine.summary': '{critical} critical · {high} high · {medium} medium · {low} low',
    'engine.suppressed-count': '{count} phát hiện đã bị tắt (xem --verbose hoặc báo cáo markdown)',
    'engine.evidence': 'Bằng chứng',
    'engine.why': 'Vì sao quan trọng',
    'engine.check': 'Tự kiểm tra xem có đúng không',
    'engine.fixed-when': 'Được coi là đã sửa khi',
    'engine.how': 'Cách sửa',
    'engine.possible-note': 'Đánh dấu "possible": chỉ đọc file thì chưa thể chắc — hãy dùng bước tự kiểm tra ở trên để xác nhận.',
    'engine.absence-evidence': 'Những gì chúng tôi đã tìm mà không thấy',
    'engine.live-receipt': 'Live check: {requests} request tới {url} (chỉ GET/HEAD), quyền sở hữu tự xác nhận qua --i-own-this-site',
    'engine.live-skipped': 'Có URL nhưng thiếu --i-own-this-site. Chưa gửi request nào. Chỉ thêm cờ này cho site của chính bạn.',
    'engine.cta': 'Muốn có người xem toàn cảnh giúp bạn? trussary.com — miễn phí, không cần thẻ, không ràng buộc.',
    'engine.rule-error': 'Kiểm tra {ruleId} không chạy được: {message}',
    'engine.config-warning': 'Config: {message}',
    'engine.exit-explain': 'Exit code {code}: có phát hiện từ mức --min-severity {min} trở lên',
    'engine.offline-skipped': 'Đã bỏ qua kiểm tra advisory của dependency (offline)',
  },
};
