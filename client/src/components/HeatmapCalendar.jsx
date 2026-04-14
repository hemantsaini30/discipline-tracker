import { statusColor } from '../utils/scoreColors.js';
import { formatShortDate } from '../utils/formatters.js';

export default function HeatmapCalendar({ data = [] }) {
  // data: [{ date, status }]
  const weeks = [];
  for (let i = 0; i < data.length; i += 7) {
    weeks.push(data.slice(i, i + 7));
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-1">
            {week.map((day, di) => (
              <div
                key={di}
                className="w-3.5 h-3.5 rounded-sm cursor-default group relative"
                style={{ backgroundColor: statusColor(day.status) }}
                title={`${formatShortDate(day.date)}: ${day.status}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-3">
        {[['completed', 'On time'], ['late', 'Late'], ['missed', 'Missed'], ['pending', 'Upcoming']].map(([s, l]) => (
          <div key={s} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: statusColor(s) }} />
            <span className="text-text-muted text-xs">{l}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
