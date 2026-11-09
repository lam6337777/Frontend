/**
 * 34 đơn vị hành chính cấp tỉnh sau sắp xếp, hiệu lực từ 01/07/2025
 * (6 thành phố trực thuộc trung ương + 28 tỉnh). Cấp huyện đã được bãi bỏ,
 * địa chỉ chỉ còn 2 cấp: Tỉnh/Thành → Phường/Xã.
 * Tên phải khớp với cột `province` trong bảng shipping_rates của backend.
 */
export const PROVINCES: string[] = [
    // Thành phố trực thuộc trung ương
    'Hà Nội',
    'Hồ Chí Minh',
    'Hải Phòng',
    'Đà Nẵng',
    'Cần Thơ',
    'Huế',
    // Tỉnh
    'An Giang',
    'Bắc Ninh',
    'Cà Mau',
    'Cao Bằng',
    'Đắk Lắk',
    'Điện Biên',
    'Đồng Nai',
    'Đồng Tháp',
    'Gia Lai',
    'Hà Tĩnh',
    'Hưng Yên',
    'Khánh Hòa',
    'Lai Châu',
    'Lạng Sơn',
    'Lào Cai',
    'Lâm Đồng',
    'Nghệ An',
    'Ninh Bình',
    'Phú Thọ',
    'Quảng Ngãi',
    'Quảng Ninh',
    'Quảng Trị',
    'Sơn La',
    'Tây Ninh',
    'Thái Nguyên',
    'Thanh Hóa',
    'Tuyên Quang',
    'Vĩnh Long',
];
