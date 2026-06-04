import React from 'react';
import styles from './Promotions.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button/Button';

const Promotions = () => {
    const router = useRouter();

    // Dữ liệu quảng cáo mẫu
    const promos = [
        {
            id: 1,
            title: 'Nike Air Series',
            subtitle: 'Bộ sưu tập mới',
            description: 'Khám phá sự kết hợp hoàn hảo giữa công nghệ đệm khí và phong cách tối giản.',
            image: '/images/promotions/promo1.png',
            link: '/products',
            light: false
        },
        {
            id: 2,
            title: 'Adidas Originals',
            subtitle: 'Phong cách kinh điển',
            description: 'Vẻ đẹp vượt thời gian cho mọi hoạt động hàng ngày của bạn.',
            image: '/images/promotions/promo2.png',
            link: '/products',
            light: true
        }
    ];

    return (
        <section className={styles.promotions}>
            <div className={styles.container}>
                {promos.map((promo) => (
                    <div key={promo.id} className={styles.promoCard}>
                        <div className={styles.imageWrapper}>
                            <Image 
                                src={promo.image} 
                                alt={promo.title} 
                                fill 
                                className={styles.image}
                                style={{ objectFit: 'cover' }}
                            />
                            <div className={styles.overlay} />
                        </div>
                        <div className={styles.content}>
                            <span className={styles.subtitle}>{promo.subtitle}</span>
                            <h2 className={styles.title}>{promo.title}</h2>
                            <p className={styles.description}>{promo.description}</p>
                            <Button
                                variant="outline"
                                className={styles.button}
                                onClick={() => router.push(promo.link)}
                            >
                                Khám phá ngay
                            </Button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default Promotions;
