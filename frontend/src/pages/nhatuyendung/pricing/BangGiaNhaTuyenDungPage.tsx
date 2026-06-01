import { CheckCircle } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Page, Panel } from '../shared/NtdAtoms'

export default function BangGiaNhaTuyenDungPage() {
  return (
    <Page title="Bảng giá" desc="Gói dịch vụ tuyển dụng dành cho doanh nghiệp CNTT.">
      <div className="grid gap-4 md:grid-cols-3">
        {['Starter', 'Growth', 'Enterprise'].map((name, index) => (
          <Panel key={name} title={name}>
            <strong className="text-3xl font-black text-sky-800">{index === 0 ? '0đ' : index === 1 ? '2.990.000đ' : 'Liên hệ'}</strong>
            <ul className="mt-4 grid gap-2 text-sm font-semibold text-slate-600">
              <li className="flex gap-2"><CheckCircle size={16} className="text-emerald-600" /> Đăng tin tuyển dụng</li>
              <li className="flex gap-2"><CheckCircle size={16} className="text-emerald-600" /> Quản lý pipeline ứng viên</li>
              <li className="flex gap-2"><CheckCircle size={16} className="text-emerald-600" /> Thông báo realtime</li>
            </ul>
            <Button className="mt-4 w-full" variant={index === 1 ? 'primary' : 'secondary'}>Chọn gói</Button>
          </Panel>
        ))}
      </div>
    </Page>
  )
}
