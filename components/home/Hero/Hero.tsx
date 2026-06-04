import Image from 'next/image';
import styles from './Hero.module.css';

const Hero = () => {
    return (
        <section className={styles.hero}>
            <div className={styles.container}>
                <div className={styles.content}>
                    <span className={styles.subtitle}>Phiên bản giới hạn</span>
                    <h1 className={styles.title}>
                        Vượt mọi <br />
                        <span className={styles.outline}>giới hạn</span>
                    </h1>
                    <p className={styles.description}>
                        Trải nghiệm đỉnh cao của thiết kế tối giản và kiến trúc giày dép. 
                        Được chế tác dành riêng cho phong cách hiện đại.
                    </p>
                    <button className={styles.button}>Mua ngay</button>
                </div>
                <div className={styles.imageWrapper}>
                    <div className={styles.imageContainer}>
                        <Image 
                            src="/images/hero-shoe.png" 
                            alt="Premium Sneaker" 
                            fill
                            priority
                            className={styles.heroImage}
                        />
                        <div className={styles.glow}></div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Hero;
