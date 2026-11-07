import { useState } from 'react'
import { COLUMNS, emptyDraft, toPayload } from '../columns'
import CellInput from './CellInput'

// 신규 일정 입력 전용
export default function ScheduleInput({ onCreate, onError }) {
  const [draft, setDraft] = useState(emptyDraft)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  const handleAdd = async () => {
    if (!draft.product_name.trim()) {
      onError('상품명은 필수 입력입니다.')
      return
    }
    setSaving(true)
    try {
      await onCreate(toPayload(draft))
      setMessage(`'${draft.product_name.trim()}' 일정이 추가되었습니다.`)
      setDraft(emptyDraft())
      onError('')
    } catch (e) {
      onError(e.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <p className="muted">값을 입력한 후 [추가] 버튼이나 Enter를 누르면 등록됩니다. (<span className="req">*</span> 필수)</p>

      <div className="table-wrap">
        <table className="schedule-table">
          <thead>
            <tr>
              {COLUMNS.map((c) => (
                <th key={c.key} className="no-sort">
                  {c.label}
                  {c.required && <span className="req">*</span>}
                </th>
              ))}
              <th className="col-action no-sort"></th>
            </tr>
          </thead>
          <tbody>
            <tr className="new-row">
              {COLUMNS.map((c) => (
                <td key={c.key}>
                  <CellInput
                    column={c}
                    value={draft[c.key]}
                    placeholder={c.label}
                    onChange={(v) => {
                      setMessage('')
                      setDraft((d) => ({ ...d, [c.key]: v }))
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                  />
                </td>
              ))}
              <td className="col-action">
                <button className="btn btn-primary" onClick={handleAdd} disabled={saving}>추가</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {message && <div className="success">✓ {message}</div>}
    </div>
  )
}
