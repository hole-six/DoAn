import { Bell } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { NotificationInbox } from '../../../components/NotificationInbox'
import { ErrorState, Page } from '../shared/UngVienAtoms'
import { useUngVienData } from '../shared/useUngVienData'

export default function ThongBaoUngVienPage() {
  const data = useUngVienData()
  return (
    <Page title="Thong bao" desc="Inbox xu ly nhanh lich phong van, ho so, ket qua, tin nhan va he thong." action={<Button icon={<Bell size={16} />} onClick={() => void data.reload()}>Lam moi</Button>}>
      <ErrorState message={data.error} />
      <NotificationInbox items={data.thongBao} onReload={data.reload} />
    </Page>
  )
}
