import type { RuleBundle } from '../types.js';

export const bundle: RuleBundle = {
  en: {
    title: 'One of your packages has a known critical security problem',
    why: '{package} version {version} is listed with a critical advisory: {title}. This is not a guess — the package’s own maintainers or a security researcher published it, and the version you have is in the affected range ({fixedIn}).',
    how: 'Update the package to a version outside the affected range (`npm install {package}@latest`), then run your app and click through the main flows to confirm nothing broke. If no fixed version exists yet, the advisory at {url} says what to do instead.',
    check: 'Run `npm audit` in your project folder. Anything reported as "critical" is what this check found — you are looking for {package}.',
    fixedWhen: '`npm audit` reports no critical advisories, your lockfile records the updated version, and the updated app is deployed — a fix that only exists on your machine is not deployed.',
  },
  vi: {
    title: 'Một package bạn đang dùng có lỗ hổng bảo mật critical đã được công bố',
    why: '{package} phiên bản {version} có advisory ở mức critical: {title}. Đây không phải phỏng đoán — chính maintainer của package hoặc nhà nghiên cứu bảo mật đã công bố, và phiên bản bạn đang dùng nằm trong khoảng bị ảnh hưởng ({fixedIn}).',
    how: 'Cập nhật package lên phiên bản ngoài khoảng bị ảnh hưởng (`npm install {package}@latest`), rồi chạy app và bấm thử các luồng chính để chắc là không vỡ gì. Nếu chưa có bản vá, advisory ở {url} sẽ nói cần làm gì thay thế.',
    check: 'Chạy `npm audit` trong thư mục project. Những mục báo "critical" chính là thứ kiểm tra này tìm thấy — cụ thể ở đây là {package}.',
    fixedWhen: '`npm audit` không còn advisory critical nào, lockfile đã ghi phiên bản mới, và bản app đã cập nhật được deploy — bản vá chỉ nằm ở máy bạn thì chưa tính là đã sửa.',
  },
};
