import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Your .env file — the one holding your keys — is committed to git',
    why: 'A committed {file} travels with every copy of the repository, forever. Push it anywhere public, share the repo with anyone, and every key inside is theirs — deleting the file later does not remove it from history.',
    how: 'Add {file} to .gitignore and remove it from tracking (git rm --cached {file}). Then rotate every key that file has ever held — git history keeps old versions, so treat all of them as exposed.',
    check: 'Look at your repository on GitHub (or wherever it lives) in a private browser window. If you can see {file} in the file list, so can anyone you have ever shared the repo with.',
    fixedWhen: 'The file no longer appears in git (git ls-files shows nothing), .gitignore prevents it coming back, and every key it ever contained has been rotated at its provider.',
    beforeApplying: 'Removing the file from tracking does not remove it from history, and rewriting history breaks every existing clone. Rotate the keys first; treat the history rewrite as optional tidying afterwards.',
    notes: {
      'git-unavailable': 'A {file} file exists but git was not available to confirm whether it is committed. Check your repository file list yourself.',
    },
  },
  vi: {
    title: 'File .env — nơi giữ các key của bạn — đang bị commit vào git',
    why: 'File {file} đã commit sẽ đi theo mọi bản copy của repository, mãi mãi. Push lên nơi công khai, hoặc chia sẻ repo cho ai đó, là toàn bộ key bên trong thuộc về họ — xoá file sau đó cũng không xoá được khỏi history.',
    how: 'Thêm {file} vào .gitignore và gỡ khỏi tracking (git rm --cached {file}). Sau đó rotate tất cả key mà file này từng chứa — git history giữ lại các phiên bản cũ, nên coi như tất cả đều đã lộ.',
    check: 'Mở repository của bạn trên GitHub (hoặc nơi bạn lưu) bằng cửa sổ ẩn danh. Nếu bạn thấy {file} trong danh sách file, thì ai từng được chia sẻ repo cũng thấy.',
    fixedWhen: 'File không còn trong git (git ls-files không hiện nữa), .gitignore chặn nó quay lại, và mọi key file này từng chứa đã được rotate ở provider.',
    beforeApplying: 'Gỡ file khỏi tracking không gỡ được nó khỏi history, còn viết lại history sẽ làm hỏng mọi bản clone đang có. Hãy rotate key trước; việc viết lại history coi như dọn dẹp thêm sau đó.',
    notes: {
      'git-unavailable': 'Có file {file} nhưng không gọi được git để xác nhận nó đã commit hay chưa. Bạn tự kiểm tra danh sách file trong repository nhé.',
    },
  },
};
