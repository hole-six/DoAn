import { HeroTrangChu } from './components/HeroTrangChu'
import { SectionNhaTuyenDung } from './components/SectionNhaTuyenDung'
import { SectionTinTuyenDung } from './components/SectionTinTuyenDung'
import { SectionTechStack } from './components/SectionTechStack'
import { SectionLyDo } from './components/SectionLyDo'
import { SectionCTA } from './components/SectionCTA'
import { HomeAiMascotChat } from './components/HomeAiMascotChat'
import { useTrangChuData } from './hooks/useTrangChuData'

export default function TrangChu() {
  const data = useTrangChuData()

  return (
    <main className="app-page">
      <HeroTrangChu />
      <SectionNhaTuyenDung companies={data.companies} />
      <SectionTinTuyenDung jobs={data.jobs} />
      <HomeAiMascotChat />
      <SectionTechStack />
      <SectionLyDo />
      <SectionCTA />
      <div style={{ height: 80 }} />
    </main>
  )
}
