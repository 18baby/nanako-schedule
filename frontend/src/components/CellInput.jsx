import { CATEGORY_OPTIONS } from '../columns'

// 컬럼 타입에 맞는 입력 컴포넌트
export default function CellInput({ column, value, onChange, onBlur, onKeyDown, placeholder }) {
  const common = {
    className: `cell-input cell-${column.type}`,
    value: value ?? '',
    onChange: (e) => onChange(e.target.value),
    onBlur,
    onKeyDown,
  }

  switch (column.type) {
    case 'date':
      return <input type="date" {...common} />
    case 'number':
      return <input type="number" min="0" step="1" placeholder={placeholder} {...common} />
    case 'category': {
      const options = CATEGORY_OPTIONS[column.key] || []
      // 목록에 없는 기존 값도 사라지지 않도록 표시
      const all = value && !options.includes(value) ? [value, ...options] : options
      return (
        <select {...common}>
          <option value="">{placeholder ? `${placeholder} 선택` : '-'}</option>
          {all.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      )
    }
    default:
      return <input type="text" placeholder={placeholder} {...common} />
  }
}
