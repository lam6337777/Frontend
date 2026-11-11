/** Khai báo một nhóm từ điển: `en` bắt buộc có đúng các khóa của `vi`. */
type Dict<T> = { [K in keyof T]: T[K] extends string ? string : Dict<T[K]> };

export function define<T extends object>(vi: T, en: Dict<T>) {
    return { vi, en };
}
