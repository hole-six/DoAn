import { Bell } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { NotificationInbox } from '../../../components/NotificationInbox'
import { ErrorState, Page } from '../shared/NtdAtoms'
import { useEmployerData } from '../shared/useEmployerData'

export default function ThongBaoNhaTuyenDungPage() {
  const data = useEmployerData()
  return (
    <Page
      title="Thông báo nhà tuyển dụng"
      desc="Inbox xử lý hồ sơ mới, đổi lịch phỏng vấn, tin nhắn và cập nhật hệ thống."
      action={<Button icon={<Bell size={16} />} onClick={() => void data.reload()}>Làm mới</Button>}
    >
      <ErrorState message={data.error} />
      <NotificationInbox items={data.notifications} onReload={data.reload} />
    </Page>
  )
}
