import CvStudio from '../CvStudio'
import { ErrorState, Page } from '../shared/UngVienAtoms'
import { useUngVienData } from '../shared/useUngVienData'

export default function HoSoUngVienPage() {
  const data = useUngVienData()

  return (
    <Page title="Ho so nang luc" desc="Tao CV IT day du, upload file CV goc, preview va in PDF. Section nao bo trong se khong hien trong CV xuat ra.">
      <ErrorState message={data.error} />
      <CvStudio data={data} onReload={data.reload} />
    </Page>
  )
}
