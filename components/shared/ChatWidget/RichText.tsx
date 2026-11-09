import Link from 'next/link';
import { Fragment, ReactNode } from 'react';

/**
 * Hiển thị markdown tối giản (**đậm**, [link](/duong-dan), gạch đầu dòng, xuống dòng)
 * bằng phần tử React — không dùng innerHTML nên nội dung từ AI không thể chèn mã.
 * Chỉ link nội bộ (bắt đầu bằng "/") được render thành liên kết.
 */
function inline(text: string, keyPrefix: string): ReactNode[] {
    const out: ReactNode[] = [];
    const re = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
    let last = 0;
    let m: RegExpExecArray | null;
    let i = 0;
    while ((m = re.exec(text))) {
        if (m.index > last) out.push(text.slice(last, m.index));
        const key = `${keyPrefix}-${i++}`;
        if (m[1] !== undefined) {
            out.push(<strong key={key}>{m[1]}</strong>);
        } else if (m[3].startsWith('/') && !m[3].startsWith('//')) {
            out.push(
                <Link key={key} href={m[3]} className="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-600">
                    {m[2]}
                </Link>
            );
        } else {
            out.push(m[2]);
        }
        last = re.lastIndex;
    }
    if (last < text.length) out.push(text.slice(last));
    return out;
}

export function RichText({ text }: { text: string }) {
    const lines = text.replace(/\r/g, '').split('\n');
    const blocks: ReactNode[] = [];
    let list: string[] = [];
    const flush = (key: string) => {
        if (!list.length) return;
        blocks.push(
            <ul key={key} className="my-1 list-disc space-y-0.5 pl-4">
                {list.map((li, i) => (
                    <li key={i}>{inline(li, `${key}-${i}`)}</li>
                ))}
            </ul>
        );
        list = [];
    };
    lines.forEach((raw, idx) => {
        const line = raw.trimEnd();
        const item = line.match(/^\s*(?:[-*•]|\d+\.)\s+(.*)$/);
        if (item) {
            list.push(item[1]);
            return;
        }
        flush(`ul-${idx}`);
        if (line.trim() === '') {
            blocks.push(<div key={`sp-${idx}`} className="h-1.5" />);
        } else {
            blocks.push(<p key={`p-${idx}`}>{inline(line, `p-${idx}`)}</p>);
        }
    });
    flush('ul-end');
    return <Fragment>{blocks}</Fragment>;
}
