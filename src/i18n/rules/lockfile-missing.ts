import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'Your project does not record which package versions it actually uses',
    why: 'There is no lockfile in this project. Every install picks versions afresh, so what runs in production is not necessarily what you tested — and any package name that does not exist yet can be registered by someone else and installed on your next deploy. AI assistants invent plausible package names often enough that people have built businesses on registering them.',
    how: 'Run an install once locally and commit the lockfile it produces ({names}) alongside package.json. Then check that every package in package.json is one you meant to add — search each unfamiliar name on npmjs.com and look at its age and download count before trusting it.',
    check: 'Look at the file list in your project folder for a lockfile. If there is none, ask yourself where each package in package.json came from — anything you do not recognise is worth searching for by name.',
    fixedWhen: 'A lockfile is committed to the repository, a fresh clone plus install produces the same versions you have now, and every dependency is one you recognise.',
    beforeApplying: 'Generating a lockfile now records whatever versions resolve today, which may not be the versions you tested months ago. Install, run the app, and check the main flows before committing it.',
    notes: {
      'none-found': 'no lockfile in this project — looked for {names}',
    },
  },
  vi: {
    title: 'Project của bạn không ghi lại chính xác đang dùng phiên bản package nào',
    why: 'Project này không có lockfile. Mỗi lần install lại chọn phiên bản mới, nên thứ chạy ở production không nhất thiết là thứ bạn đã test — và một tên package chưa tồn tại có thể được người khác đăng ký rồi cài vào lần deploy tiếp theo của bạn. Trợ lý AI bịa ra tên package nghe rất hợp lý đủ thường xuyên để có người kiếm sống bằng việc đăng ký sẵn những tên đó.',
    how: 'Chạy install một lần ở máy và commit lockfile sinh ra ({names}) cùng với package.json. Sau đó rà lại xem mọi package trong package.json có đúng là do bạn chủ ý thêm không — tên nào lạ thì tìm trên npmjs.com, xem tuổi đời và lượt download trước khi tin.',
    check: 'Nhìn danh sách file trong thư mục project xem có lockfile không. Nếu không có, hãy tự hỏi từng package trong package.json đến từ đâu — cái nào bạn không nhận ra thì nên tra tên.',
    fixedWhen: 'Lockfile đã được commit vào repository, clone mới rồi install ra đúng những phiên bản bạn đang có, và mọi dependency đều là thứ bạn nhận ra.',
    beforeApplying: 'Tạo lockfile bây giờ sẽ ghi lại đúng những phiên bản resolve ở hôm nay, có thể khác với phiên bản bạn từng test cách đây vài tháng. Hãy install, chạy app và kiểm tra các luồng chính trước khi commit.',
    notes: {
      'none-found': 'không có lockfile trong project này — đã tìm {names}',
    },
  },
};
