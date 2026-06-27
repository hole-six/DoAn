import { Bell } from 'lucide-react'
import { NotificationInbox } from '../../../components/NotificationInbox'
import { Button } from '../../../components/ui/Button'
import { useThongBao } from '../../../contexts/ThongBaoContext'
import { AdminPage, AdminPanel } from '../shared/AdminTable'

export default function ThongBaoAdminPage() {
  const { danhSach, taiThongBao, dangTai } = useThongBao()

  return (
    <AdminPage
      title="Thông báo hệ thống"
      desc="Theo dõi duyệt công ty, tin tuyển dụng, chat hỗ trợ và các cảnh báo quan trọng."
      action={
        <Button className="w-full sm:w-auto" icon={<Bell size={16} />} loading={dangTai} onClick={() => void taiThongBao()}>
          Làm mới
        </Button>
      }
    >
      <AdminPanel>
        <NotificationInbox items={danhSach as any} onReload={taiThongBao} />
      </AdminPanel>
    </AdminPage>
  )
}
