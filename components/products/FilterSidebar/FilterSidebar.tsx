'use client';

import React from 'react';
import styles from './FilterSidebar.module.css';
import { formatVND } from '@/lib/utils';

interface FilterSidebarProps {
    availableCategories: string[];
    maxPrice: number;
    selectedCategory: string | null;
    selectedSize: string | null;
    priceRange: [number, number];
    onCategoryChange: (category: string) => void;
    onSizeChange: (size: string) => void;
    onPriceChange: (value: number) => void;
    onReset: () => void;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
    availableCategories,
    maxPrice,
    selectedCategory,
    selectedSize,
    priceRange,
    onCategoryChange,
    onSizeChange,
    onPriceChange,
    onReset
}) => {
    return (
        <aside className={styles.sidebar}>
            <div className={styles.section}>
                <h3 className={styles.title}>Danh mục</h3>
                <ul className={styles.list}>
                    {availableCategories.map(category => (
                        <li key={category}>
                            <button
                                className={`${styles.filterBtn} ${selectedCategory === category ? styles.activeFilter : ''}`}
                                onClick={() => onCategoryChange(category)}
                            >
                                {category.toLowerCase()}
                            </button>
                        </li>
                    ))}
                </ul>
            </div>



            <div className={styles.section}>
                <h3 className={styles.title}>Kích thước (EU)</h3>
                <div className={styles.grid}>
                    {['38', '39', '40', '41', '42', '43', '44'].map(size => (
                        <button
                            key={size}
                            className={`${styles.sizeBtn} ${selectedSize === size ? styles.activeSize : ''}`}
                            onClick={() => onSizeChange(size)}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

                <div className={styles.priceInputs}>
                    <input
                        type="range"
                        min="0"
                        max={maxPrice || 50000}
                        step={Math.ceil((maxPrice || 50000) / 40) || 1}
                        value={priceRange[1] ?? 0}
                        onChange={(e) => onPriceChange(Number(e.target.value))}
                        className={styles.range}
                    />
                    <div className={styles.priceLabels}>
                        <span>{formatVND(0)}</span>
                        <span>{formatVND(priceRange[1] ?? 0)}</span>
                    </div>
                </div>

            <button className={styles.resetBtn} onClick={onReset}>Xóa tất cả bộ lọc</button>
        </aside>
    );
};

export default FilterSidebar;
