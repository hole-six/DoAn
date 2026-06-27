import type { SuggestionGroups, SuggestionItem } from './useSearchSuggestions'

type Props = {
  groups: SuggestionGroups
  loading: boolean
  query: string
  onSelect: (item: SuggestionItem) => void
  onClearQuery?: () => void
}

function Group(props: {
  title: string
  items: SuggestionItem[]
  onSelect: (item: SuggestionItem) => void
}) {
  if (!props.items.length) return null
  return (
    <section className="search-suggest-group">
      <p>{props.title}</p>
      {props.items.map(item => (
        <button
          type="button"
          className="search-suggest-item"
          key={`${item.type}-${item.id}`}
          aria-label={`Mở ${item.title}`}
          onClick={() => props.onSelect(item)}
        >
          <strong>{item.title}</strong>
          {(item.subtitle || item.meta) && (
            <span>{[item.subtitle, item.meta].filter(Boolean).join(' · ')}</span>
          )}
        </button>
      ))}
    </section>
  )
}

export default function SearchSuggestionPanel({ groups, loading, query, onSelect, onClearQuery }: Props) {
  const keyword = query.trim()
  if (!keyword) return null

  if (loading) {
    return (
      <div className="search-suggest-panel">
        <div className="search-suggest-loading">Đang tải gợi ý...</div>
      </div>
    )
  }

  const hasAny = groups.jobs.length || groups.companies.length || groups.skills.length
  if (!hasAny) return null

  return (
    <div className="search-suggest-panel">
      <Group title="Việc làm" items={groups.jobs} onSelect={onSelect} />
      <Group title="Công ty" items={groups.companies} onSelect={onSelect} />
      <Group title="Kỹ năng" items={groups.skills} onSelect={onSelect} />
      <div className="search-suggest-footer">
        <span>Nhấn gợi ý để mở nhanh</span>
        {onClearQuery && (
          <button type="button" className="search-suggest-clear" onClick={onClearQuery}>
            Xóa từ khóa
          </button>
        )}
      </div>
    </div>
  )
}
