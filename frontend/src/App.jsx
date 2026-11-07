import { useCallback, useEffect, useMemo, useState } from 'react'
import { api } from './api'
import { emptyFilters, matchesFilters } from './columns'
import FilterBar from './components/FilterBar'
import ScheduleInput from './components/ScheduleInput'
import ScheduleTable from './components/ScheduleTable'
import ScheduleCalendar from './components/ScheduleCalendar'

const TABS = [
  { key: 'input', label: '일정 입력' },
  { key: 'table', label: '일정 테이블' },
  { key: 'calendar', label: '캘린더' },
]

// 새로고침해도 보던 탭 유지 (URL #table, #calendar ...)
const tabFromHash = () => {
  const key = window.location.hash.slice(1)
  return TABS.some((t) => t.key === key) ? key : 'input'
}

export default function App() {
  const [tab, setTab] = useState(tabFromHash)
  const changeTab = (key) => {
    setTab(key)
    window.history.replaceState(null, '', `#${key}`)
  }

  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  // 테이블 / 캘린더 탭이 함께 쓰는 필터
  const [filters, setFilters] = useState(emptyFilters)

  const load = useCallback(async () => {
    try {
      setSchedules(await api.list())
      setError('')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(
    () => schedules.filter((s) => matchesFilters(s, filters)),
    [schedules, filters],
  )

  // 같은 state 를 쓰므로 입력/수정 즉시 테이블과 캘린더에 반영됨
  const handleCreate = async (payload) => {
    const created = await api.create(payload)
    setSchedules((prev) => [...prev, created])
  }

  const handleUpdate = async (id, payload) => {
    const updated = await api.update(id, payload)
    setSchedules((prev) => prev.map((s) => (s.id === id ? updated : s)))
  }

  const handleDelete = async (id) => {
    await api.remove(id)
    setSchedules((prev) => prev.filter((s) => s.id !== id))
  }

  // 캘린더에서 일정을 클릭하면 테이블 탭으로 전환 후 해당 행으로 이동
  const handleSelect = (id) => {
    setSelectedId(id)
    changeTab('table')
  }

  useEffect(() => {
    if (tab === 'table' && selectedId != null) {
      document.getElementById(`row-${selectedId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [tab, selectedId])

  return (
    <div className="app">
      <header className="app-header">
        <h1>일정 관리</h1>
        <button className="btn" onClick={load}>새로고침</button>
      </header>

      <nav className="tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={`tab ${tab === t.key ? 'active' : ''}`}
            onClick={() => changeTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {error && <div className="alert">⚠ {error}</div>}

      {tab === 'input' && (
        <section className="card">
          <ScheduleInput onCreate={handleCreate} onError={setError} />
        </section>
      )}

      {tab === 'table' && (
        <section className="card">
          <FilterBar filters={filters} onChange={setFilters} />
          {loading ? (
            <p className="muted">불러오는 중…</p>
          ) : (
            <ScheduleTable
              schedules={filtered}
              total={schedules.length}
              selectedId={selectedId}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
              onError={setError}
            />
          )}
        </section>
      )}

      {tab === 'calendar' && (
        <section className="card">
          <FilterBar filters={filters} onChange={setFilters} />
          <ScheduleCalendar schedules={filtered} onSelect={handleSelect} />
        </section>
      )}
    </div>
  )
}
