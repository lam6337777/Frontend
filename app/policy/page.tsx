import React from "react";
import styles from "./policy.module.css";
import { Truck, RotateCcw, ShieldCheck, Mail } from "lucide-react";

/**
 * Trang Chính sách của PF. Shoes
 * Bao gồm các quy định về Giao hàng, Đổi trả và Bảo mật
 */
export default function PolicyPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Chính sách cửa hàng</h1>
        <p className={styles.subtitle}>
          Cam kết minh bạch và đảm bảo quyền lợi tốt nhất cho khách hàng.
        </p>
      </header>

      {/* Shipping Policy */}
      <section className={styles.policySection}>
        <div className={styles.sectionHeader}>
          <Truck size={32} strokeWidth={1.5} />
          <h2 className={styles.sectionTitle}>Chính sách Giao hàng</h2>
        </div>
        <div className={styles.content}>
          <p>
            Chúng tôi nỗ lực để đơn hàng của bạn được giao tới tay sớm nhất có thể.
          </p>
          <ul>
            <li><strong>Thời gian xử lý:</strong> Đơn hàng sẽ được xác nhận và đóng gói trong vòng 24h.</li>
            <li><strong>Thời gian vận chuyển:</strong> 
              <ul>
                <li>Khu vực nội thành Sài Gòn: 1-2 ngày làm việc.</li>
                <li>Các tỉnh thành khác: 3-5 ngày làm việc.</li>
              </ul>
            </li>
            <li><strong>Phí vận chuyển:</strong> Miễn phí toàn quốc cho mọi đơn hàng.</li>
          </ul>
        </div>
      </section>

      {/* Return Policy */}
      <section className={styles.policySection}>
        <div className={styles.sectionHeader}>
          <RotateCcw size={32} strokeWidth={1.5} />
          <h2 className={styles.sectionTitle}>Chính sách Đổi trả</h2>
        </div>
        <div className={styles.content}>
          <p>
            Sự hài lòng của khách hàng là ưu tiên hàng đầu. Nếu sản phẩm không vừa hoặc có lỗi, chúng tôi sẵn sàng hỗ trợ bạn.
          </p>
          <ul>
            <li><strong>Thời hạn đổi trả:</strong> Trong vòng 7 ngày kể từ ngày nhận hàng thành công.</li>
            <li><strong>Điều kiện:</strong> Sản phẩm còn nguyên tem mác, hộp giày không bị móp méo và chưa qua sử dụng.</li>
            <li><strong>Sản phẩm lỗi:</strong> Miễn phí hoàn toàn chi phí vận chuyển đổi trả nếu sản phẩm có lỗi từ nhà sản xuất.</li>
          </ul>
        </div>
      </section>

      {/* Warranty & Security */}
      <section className={styles.policySection}>
        <div className={styles.sectionHeader}>
          <ShieldCheck size={32} strokeWidth={1.5} />
          <h2 className={styles.sectionTitle}>Bảo hành & Bảo mật</h2>
        </div>
        <div className={styles.content}>
          <p>
            PF. Shoes cam kết bảo vệ dữ liệu cá nhân của bạn và cung cấp dịch vụ hậu mãi đáng tin cậy.
          </p>
          <ul>
            <li><strong>Bảo hành:</strong> Tất cả sản phẩm được bảo hành lỗi keo, chỉ trong 6 tháng.</li>
            <li><strong>Bảo mật thông tin:</strong> Chúng tôi chỉ thu thập thông tin cần thiết cho việc giao hàng và không chia sẻ cho bên thứ ba vì mục đích thương mại.</li>
          </ul>
        </div>
      </section>

      {/* Contact Section */}
      <div className={styles.contactBox}>
        <h3 className={styles.contactTitle}>Bạn còn thắc mắc?</h3>
        <p>Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giải đáp mọi câu hỏi của bạn qua email hoặc hotline.</p>
        <a href="mailto:support@pfshoes.vn" className={styles.contactButton}>
           Liên hệ ngay
        </a>
      </div>
    </div>
  );
}
