import { useEffect, useMemo, useState } from 'react'
import { COLUMNS, toDraft, toPayload } from '../columns'
import CellInput from './CellInput'

// 입력된 일정 조회 테이블 (셀 수정 / 삭제 가능)
export default function ScheduleTable({ schedules, total, selectedId, onUpdate, onDelete, onError }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState({ key: 'id', dir: 'asc' })

  const rows = useMemo(() => {
    const q = search.trim().toLowerCase()
    const filtered = q
      ? schedules.filter((s) =>
          COLUMNS.some((c) => String(s[c.key] ?? '').toLowerCase().includes(q)),
        )
      : schedules
    return [...filtered].sort((a, b) => {
      const av = a[sort.key]
      const bv = b[sort.key]
      if (av == null && bv == null) return 0
      if (av == null) return 1 // 빈 값은 항상 뒤로
      if (bv == null) return -1
      const cmp = typeof av === 'number' ? av - bv : String(av).localeCompare(String(bv), 'ko')
      return sort.dir === 'asc' ? cmp : -cmp
    })
  }, [schedules, search, sort])

  const toggleSort = (key) =>
    setSort((prev) => (prev.key === key ? { key, dir: prev.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: 'asc' }))

  const arrow = (key) => sort.key === key && (sort.dir === 'asc' ? ' ▲' : ' ▼')

  return (
    <div>
      <div className="toolbar">
        <input
          className="search"
          placeholder="검색 (전체 컬럼)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="muted">
          {rows.length}건 / 전체 {total}건 · 셀을 수정하고 다른 곳을 클릭하면 자동 저장됩니다
        </span>
      </div>

      <div className="table-wrap">
        <table className="schedule-table">
          <thead>
            <tr>
              <th className="col-no" onClick={() => toggleSort('id')}>No{arrow('id')}</th>
              {COLUMNS.map((c) => (
                <th key={c.key} onClick={() => toggleSort(c.key)}>
                  {c.label}{arrow(c.key)}
                </th>
              ))}
              <th className="col-action no-sort"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <EditableRow
                key={row.id}
                no={idx + 1}
                row={row}
                selected={row.id === selectedId}
                onUpdate={onUpdate}
                onDelete={onDelete}
                onError={onError}
              />
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={COLUMNS.length + 2} className="empty">
                  {total === 0 ? '등록된 일정이 없습니다. [일정 입력] 탭에서 추가해 주세요.' : '조건에 맞는 일정이 없습니다.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function EditableRow({ no, row, selected, onUpdate, onDelete, onError }) {
  const [draft, setDraft] = useState(() => toDraft(row))
  const [saving, setSaving] = useState(false)

  // 서버 데이터가 바뀌면 입력값 동기화
  useEffect(() => {
    setDraft(toDraft(row))
  }, [row])

  const save = async (next) => {
    const payload = toPayload(next)
    const changed = Object.keys(payload).some((k) => payload[k] !== (row[k] ?? null))
    if (!changed) return
    if (!payload.product_name) {
      onError('상품명은 비울 수 없습니다.')
      setDraft(toDraft(row))
      return
    }
    setSaving(true)
    try {
      await onUpdate(row.id, payload)
      onError('')
    } catch (e) {
      onError(e.message)
      setDraft(toDraft(row))
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (column, value) => {
    const next = { ...draft, [column.key]: value }
    setDraft(next)
    // 선택형(범주형)은 고르는 즉시 저장
    if (column.type === 'category') save(next)
  }

  const handleDelete = async () => {
    if (!window.confirm(`'${row.product_name}' 일정을 삭제할까요?`)) return
    try {
      await onDelete(row.id)
    } catch (e) {
      onError(e.message)
    }
  }

  return (
    <tr id={`row-${row.id}`} className={`${selected ? 'selected' : ''} ${saving ? 'saving' : ''}`}>
      <td className="col-no">{no}</td>
      {COLUMNS.map((c) => (
        <td key={c.key}>
          <CellInput
            column={c}
            value={draft[c.key]}
            onChange={(v) => handleChange(c, v)}
            onBlur={c.type === 'category' ? undefined : () => save(draft)}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
          />
        </td>
      ))}
      <td className="col-action">
        <button className="btn btn-danger" onClick={handleDelete}>삭제</button>
      </td>
    </tr>
  )
}
