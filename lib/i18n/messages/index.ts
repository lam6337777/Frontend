/**
 * Gộp các nhóm từ điển. Thêm nhóm mới: tạo file dùng define(vi, en) rồi thêm vào danh sách dưới.
 */
import { common } from './common';
import { layout } from './layout';
import { chat } from './chat';
import { shop } from './shop';
import { checkout } from './checkout';
import { account } from './account';

const groups = [common, layout, chat, shop, checkout, account] as const;

type Merge<G extends readonly { vi: object; en: object }[]> = G extends readonly [infer H, ...infer R]
    ? H extends { vi: infer V }
        ? R extends readonly { vi: object; en: object }[]
            ? V & Merge<R>
            : V
        : never
    : unknown;

type ViMessages = Merge<typeof groups>;

function merge(lang: 'vi' | 'en') {
    return Object.assign({}, ...groups.map((g) => g[lang])) as ViMessages;
}

export const messages = { vi: merge('vi'), en: merge('en') };
