// columns.txt 기준 컬럼 정의 (표시 순서대로)
// type: text | number | date | category(범주형)
export const COLUMNS = [
  { key: 'retail', label: '리테일', type: 'category' },
  { key: 'category', label: '종류', type: 'category' },
  { key: 'product_name', label: '상품명', type: 'text', required: true },
  { key: 'launch_date', label: '전개일', type: 'date' },
  { key: 'quantity', label: '수량', type: 'text' },
  { key: 'moq', label: 'MOQ', type: 'number' },
  { key: 'apr_date', label: 'APR입고일', type: 'date' },
  { key: 'data_date', label: '데이터입고일', type: 'date' },
  { key: 'mass_production_date', label: '양산의뢰', type: 'date' },
  { key: 'status', label: '상태', type: 'category' },
  { key: 'lead_time', label: '생산리드타임', type: 'text' },
]

// 범주형 컬럼 선택지 (입력값으로 사용되는 값)
export const CATEGORY_OPTIONS = {
  retail: ['신상품', '돈키호테', '프라자', '로프트', '한즈', 'MCC', '그외'],
  category: ['신상품', '한정품', '선행품', '기획세트', '도덕세트'],
  status: ['기획안 작성', '양산의뢰', '디자인 제작중', '생산 중', 'APR입고 완료', '완료'],
}

// 필터로 사용할 컬럼
export const FILTER_KEYS = ['retail', 'category', 'status']
// 필터에서 "필터 없음"을 뜻하는 값
export const ALL = '__ALL__'
export const ALL_LABEL = '전체'
export const emptyFilters = () => Object.fromEntries(FILTER_KEYS.map((k) => [k, ALL]))
export const matchesFilters = (row, filters) =>
  FILTER_KEYS.every((k) => filters[k] === ALL || row[k] === filters[k])

// 캘린더에 표시할 날짜형 컬럼과 색상
export const DATE_COLORS = {
  launch_date: '#2563eb', // 전개일 - 파랑
  apr_date: '#16a34a', // APR입고일 - 초록
  data_date: '#d97706', // 데이터입고일 - 주황
  mass_production_date: '#dc2626', // 양산의뢰 - 빨강
}

export const DATE_COLUMNS = COLUMNS.filter((c) => c.type === 'date')
export const columnByKey = Object.fromEntries(COLUMNS.map((c) => [c.key, c]))

export const emptyDraft = () =>
  Object.fromEntries(COLUMNS.map((c) => [c.key, '']))

// 서버 데이터 -> 입력폼 값 (null -> '')
export const toDraft = (row) =>
  Object.fromEntries(COLUMNS.map((c) => [c.key, row[c.key] ?? '']))

// 입력폼 값 -> 서버 전송 값 ('' -> null, MOQ -> 숫자)
export const toPayload = (draft) =>
  Object.fromEntries(
    COLUMNS.map((c) => {
      const v = typeof draft[c.key] === 'string' ? draft[c.key].trim() : draft[c.key]
      if (v === '' || v == null) return [c.key, null]
      if (c.type === 'number') return [c.key, Number(v)]
      return [c.key, v]
    }),
  )
