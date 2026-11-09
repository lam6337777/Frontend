import { redirect } from 'next/navigation';

// Trang hồ sơ cũ đã được tách thành khu /account
export default function LegacyProfilePage() {
    redirect('/account');
}
