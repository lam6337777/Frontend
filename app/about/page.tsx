import React from "react";
import styles from "./about.module.css";
import { History, Target, Gem, Layers, Zap, Leaf } from "lucide-react";

/**
 * Trang giới thiệu về công ty PF. Shoes
 * Tuân thủ phong cách Monochrome và các biến CSS từ globals.css
 */
export default function AboutPage() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <h1 className={styles.title}>Về PF. Shoes</h1>
        <p className={styles.subtitle}>
          Định nghĩa lại sự tối giản trong từng bước chân. 
          Chúng tôi tin rằng sự đơn giản là đỉnh cao của sự tinh tế.
        </p>
      </section>

      {/* Story Section */}
      <section className={styles.section}>
        <div className={styles.content}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <History size={24} />
            <h2 className={styles.sectionTitle}>Câu chuyện của chúng tôi</h2>
          </div>
          <p className={styles.text}>
            Khởi đầu từ năm 2024 tại Sài Gòn, PF. Shoes được thành lập bởi một nhóm những người yêu thích phong cách tối giản (Minimalism). 
            Chúng tôi nhận thấy thị trường đang thiếu đi những dòng giày tập trung hoàn toàn vào chất lượng và phom dáng mà không bị xao nhãng bởi các chi tiết thừa thãi.
          </p>
          <p className={styles.text}>
            Tại PF. Shoes, mỗi đôi giày không chỉ là một món đồ thời trang, mà là một tác phẩm nghệ thuật của sự tinh gọn. 
            Chúng tôi sử dụng bảng màu Monochrome làm kim chỉ nam, giúp bạn dễ dàng kết hợp với bất kỳ trang phục nào.
          </p>
        </div>
        <div className={styles.imageWrapper}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: 'var(--muted)', flexDirection: 'column', gap: '20px' }}>
             <Layers size={80} strokeWidth={1} />
             <span style={{ fontSize: '0.9rem', color: 'var(--muted-foreground)', letterSpacing: '0.1em' }}>MINIMALISM IS KEY</span>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className={styles.sectionReverse}>
        <div className={styles.content}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Target size={24} />
            <h2 className={styles.sectionTitle}>Tầm nhìn & Sứ mệnh</h2>
          </div>
          <p className={styles.text}>
            <strong>Sứ mệnh:</strong> Mang lại sự tự tin và thoải mái tuyệt đối cho khách hàng thông qua những thiết kế vượt thời gian.
          </p>
          <p className={styles.text}>
            <strong>Tầm nhìn:</strong> Trở thành biểu tượng của lối sống tối giản tại Việt Nam, nơi "Ít hơn là Nhiều hơn" (Less is More).
          </p>
        </div>
        <div className={styles.imageWrapper}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', backgroundColor: 'var(--foreground)', color: 'var(--background)', flexDirection: 'column', gap: '20px' }}>
             <Zap size={80} strokeWidth={1} />
             <span style={{ fontSize: '0.9rem', opacity: 0.8, letterSpacing: '0.1em' }}>EMPOWER YOUR STEPS</span>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section>
        <h2 className={styles.sectionTitle} style={{ textAlign: 'center', margin: '0 auto 40px', width: 'fit-content' }}>
          Giá trị cốt lõi
        </h2>
        <div className={styles.values}>
          <div className={styles.valueCard}>
            <Gem size={32} strokeWidth={1.5} />
            <h3 className={styles.valueTitle}>Chất lượng</h3>
            <p className={styles.valueDescription}>
              Sử dụng các loại vật liệu cao cấp nhất, từ da thật đến các dòng vải mesh thoáng khí, đảm bảo độ bền theo thời gian.
            </p>
          </div>
          <div className={styles.valueCard}>
            <Layers size={32} strokeWidth={1.5} />
            <h3 className={styles.valueTitle}>Tối giản</h3>
            <p className={styles.valueDescription}>
              Loại bỏ hoàn toàn các chi tiết rườm rà, tập trung vào phom dáng và sự tiện dụng hàng ngày.
            </p>
          </div>
          <div className={styles.valueCard}>
            <Leaf size={32} strokeWidth={1.5} />
            <h3 className={styles.valueTitle}>Bền vững</h3>
            <p className={styles.valueDescription}>
              Ưu tiên các quy trình sản xuất thân thiện với môi trường và thiết kế bền lâu, giảm thiểu rác thải thời trang.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

