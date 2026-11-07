import { ALL, ALL_LABEL, CATEGORY_OPTIONS, FILTER_KEYS, columnByKey, emptyFilters } from '../columns'

// 리테일 / 종류 / 상태 필터
export default function FilterBar({ filters, onChange }) {
  const active = FILTER_KEYS.some((k) => filters[k] !== ALL)

  return (
    <div className="filter-bar">
      {FILTER_KEYS.map((key) => (
        <label key={key} className="filter">
          <span>{columnByKey[key].label}</span>
          <select
            value={filters[key]}
            className={filters[key] !== ALL ? 'on' : ''}
            onChange={(e) => onChange({ ...filters, [key]: e.target.value })}
          >
            <option value={ALL}>{ALL_LABEL}</option>
            {CATEGORY_OPTIONS[key].map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
      ))}
      {active && (
        <button className="btn" onClick={() => onChange(emptyFilters())}>필터 초기화</button>
      )}
    </div>
  )
}
