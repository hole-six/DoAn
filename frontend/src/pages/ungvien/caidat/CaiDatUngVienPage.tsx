import { Settings } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Page, Panel } from '../shared/UngVienAtoms'
import { useUngVienData } from '../shared/useUngVienData'

export default function CaiDatUngVienPage() {
  const data = useUngVienData()
  return (
    <Page title="Cài đặt ứng viên" desc="Thông tin tài khoản và tùy chọn nhận thông báo." action={<Button icon={<Settings size={16} />} onClick={() => void data.reload()}>Đồng bộ</Button>}>
      <Panel title="Tài khoản">
        <div className="grid gap-3 text-sm font-semibold text-slate-700 sm:grid-cols-2">
          <p><strong>Họ tên:</strong> {data.current?.hoTen ?? '-'}</p>
          <p><strong>Email:</strong> {data.current?.email ?? '-'}</p>
          <p><strong>Vai trò:</strong> Ứng viên</p>
          <p><strong>Trạng thái:</strong> {data.current?.trangThai ?? '-'}</p>
        </div>
      </Panel>
      <Panel title="Thông báo">
        <p className="text-sm font-semibold leading-relaxed text-slate-600">Bạn sẽ nhận thông báo khi nhà tuyển dụng xem hồ sơ, mời phỏng vấn, đổi lịch hoặc cập nhật kết quả.</p>
      </Panel>
    </Page>
  )
}
