import { Bell } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { NotificationInbox } from '../../../components/NotificationInbox'
import { ErrorState, Page } from '../shared/UngVienAtoms'
import { useUngVienData } from '../shared/useUngVienData'

export default function ThongBaoUngVienPage() {
  const data = useUngVienData()
  return (
    <Page
      title="Thông báo"
      desc="Inbox xử lý nhanh lịch phỏng vấn, hồ sơ, kết quả, tin nhắn và hệ thống."
      action={<Button icon={<Bell size={16} />} onClick={() => void data.reload()}>Làm mới</Button>}
    >
      <ErrorState message={data.error} />
      <NotificationInbox items={data.thongBao} onReload={data.reload} />
    </Page>
  )
}
