import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Send, Sparkles, X } from 'lucide-react'
import mascotFrame1 from '../../../assets/anhdong1.png'
import mascotFrame2 from '../../../assets/anhdong2.png'
import mascotFrame3 from '../../../assets/anhdong3.png'
import { homeAiQuickPrompts } from '../../../data/trangChuData'
import { API_URL } from '../../../lib/env'

type HomeAiJobSuggestion = {
  id: string
  tieuDe: string
  congTy: string
  diaChi?: string
  luong?: string
  diem?: number
  lyDo?: string
  url: string
}

const mascotFrames = [mascotFrame1, mascotFrame2, mascotFrame3]

export function HomeAiMascotChat() {
  const [question, setQuestion] = useState('')
  const [answer, setAnswer] = useState('Xin chào, mình là trợ lý Effort Job. Bạn có thể hỏi mình về lộ trình nghề nghiệp, CV, phỏng vấn hoặc tìm việc trong database.')
  const [jobs, setJobs] = useState<HomeAiJobSuggestion[]>([])
  const [quickPrompts, setQuickPrompts] = useState(homeAiQuickPrompts)
  const [busy, setBusy] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [frameIndex, setFrameIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setFrameIndex(value => (value + 1) % mascotFrames.length)
    }, busy ? 420 : 650)
    return () => window.clearInterval(timer)
  }, [busy])

  const ask = async (nextQuestion?: string) => {
    const cauHoi = (nextQuestion ?? question).trim()
    if (!cauHoi || busy) return
    try {
      setBusy(true)
      const res = await fetch(`${API_URL}/ai/chatbot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cauHoi }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.thongBao ?? 'Không hỏi được AI lúc này.')
      const payload = data.duLieu ?? data
      setAnswer(payload.traLoi ?? 'Mình chưa có câu trả lời phù hợp, bạn thử hỏi cụ thể hơn nhé.')
      setJobs(Array.isArray(payload.goiYViecLam) ? payload.goiYViecLam : [])
      if (Array.isArray(payload.goiYCauHoi) && payload.goiYCauHoi.length) {
        setQuickPrompts(payload.goiYCauHoi.slice(0, 4))
      }
      setQuestion('')
    } catch (error) {
      setAnswer(error instanceof Error ? error.message : 'Không hỏi được AI lúc này.')
      setJobs([])
    } finally {
      setBusy(false)
    }
  }

  if (!expanded) {
    return (
      <button type="button" className="home-ai-mascot-fab" onClick={() => setExpanded(true)} aria-label="Mở trợ lý AI Effort Job">
        <span className="home-ai-mascot-glow" />
        <img src={mascotFrames[frameIndex]} alt="" />
        <span>Hỏi AI</span>
      </button>
    )
  }

  return (
    <section className="home-ai-panel" aria-label="Trợ lý AI Effort Job">
      <div className="home-ai-panel-header">
        <div className="home-ai-avatar">
          <img src={mascotFrames[frameIndex]} alt="Trợ lý Effort Job" />
        </div>
        <div className="min-w-0">
          <p>Effort Job AI</p>
          <h2>Trợ lý nghề nghiệp</h2>
        </div>
        <button type="button" className="home-ai-close" onClick={() => setExpanded(false)} aria-label="Đóng trợ lý AI">
          <X size={18} />
        </button>
      </div>

      <div className="home-ai-answer">
        <p>{answer}</p>
        {jobs.length > 0 && (
          <div className="home-ai-jobs">
            {jobs.map(job => (
              <Link key={job.id} to={job.url} className="home-ai-job-card">
                <span className="home-ai-score">{Math.round(Number(job.diem ?? 0)) || 'AI'}</span>
                <span className="home-ai-job-main">
                  <strong>{job.tieuDe}</strong>
                  <small>{job.congTy} · {job.diaChi || 'Đang cập nhật'} · {job.luong || 'Thỏa thuận'}</small>
                  {job.lyDo && <em>{job.lyDo}</em>}
                </span>
                <ArrowRight size={16} />
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="home-ai-prompts">
        {quickPrompts.map(prompt => (
          <button key={prompt} type="button" onClick={() => void ask(prompt)} disabled={busy}>
            {prompt}
          </button>
        ))}
      </div>

      <div className="home-ai-input-row">
        <input
          value={question}
          onChange={event => setQuestion(event.target.value)}
          onKeyDown={event => {
            if (event.key === 'Enter') void ask()
          }}
          placeholder="Hỏi AI về job, CV, phỏng vấn hoặc lộ trình nghề nghiệp..."
        />
        <button type="button" onClick={() => void ask()} disabled={busy || !question.trim()}>
          {busy ? <Sparkles size={18} /> : <Send size={18} />}
          {busy ? 'Đang trả lời' : 'Gửi'}
        </button>
      </div>
    </section>
  )
}
