import CvStudio from '../CvStudio'
import { ErrorState, Page } from '../shared/UngVienAtoms'
import { useUngVienData } from '../shared/useUngVienData'

export default function HoSoUngVienPage() {
  const data = useUngVienData()

  return (
    <Page title="Hồ sơ năng lực" desc="Quản lý CV IT, nội dung hồ sơ ứng tuyển và các tài liệu bạn dùng để nộp cho nhà tuyển dụng.">
      <ErrorState message={data.error} />
      <CvStudio data={data} onReload={data.reload} />
    </Page>
  )
}
