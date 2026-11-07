import { useMemo, useState } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import listPlugin from '@fullcalendar/list'
import koLocale from '@fullcalendar/core/locales/ko'
import { DATE_COLORS, DATE_COLUMNS } from '../columns'

export default function ScheduleCalendar({ schedules, onSelect }) {
  // 날짜형 컬럼별 표시 on/off
  const [visible, setVisible] = useState(() =>
    Object.fromEntries(DATE_COLUMNS.map((c) => [c.key, true])),
  )

  // 일정 1건의 날짜형 컬럼 각각을 캘린더 이벤트 1개로 변환
  const events = useMemo(
    () =>
      schedules.flatMap((s) =>
        DATE_COLUMNS.filter((c) => visible[c.key] && s[c.key]).map((c) => ({
          id: `${s.id}-${c.key}`,
          title: `${s.product_name} · ${c.label}`,
          start: s[c.key],
          allDay: true,
          backgroundColor: DATE_COLORS[c.key],
          borderColor: DATE_COLORS[c.key],
          extendedProps: { scheduleId: s.id, retail: s.retail, status: s.status, category: s.category },
        })),
      ),
    [schedules, visible],
  )

  return (
    <div>
      <div className="legend">
        {DATE_COLUMNS.map((c) => (
          <label key={c.key} className="legend-item">
            <input
              type="checkbox"
              checked={visible[c.key]}
              onChange={() => setVisible((v) => ({ ...v, [c.key]: !v[c.key] }))}
            />
            <span className="swatch" style={{ background: DATE_COLORS[c.key] }} />
            {c.label}
          </label>
        ))}
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, listPlugin]}
        initialView="dayGridMonth"
        locale={koLocale}
        height="auto"
        headerToolbar={{ left: 'prev,next today', center: 'title', right: 'dayGridMonth,listMonth' }}
        buttonText={{ listMonth: '목록' }}
        dayMaxEvents={4}
        events={events}
        eventDisplay="block"
        eventClick={(info) => onSelect(info.event.extendedProps.scheduleId)}
        eventDidMount={(info) => {
          const { retail, status, category } = info.event.extendedProps
          info.el.title = [
            info.event.title,
            retail && `리테일: ${retail}`,
            category && `종류: ${category}`,
            status && `상태: ${status}`,
          ]
            .filter(Boolean)
            .join('\n')
        }}
      />
    </div>
  )
}
