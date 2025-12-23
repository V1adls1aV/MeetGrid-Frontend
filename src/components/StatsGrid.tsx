import React, { useMemo } from "react";
import { Typography, Empty } from "antd";
import { TopicStats, StatsInterval } from "../types/topic";
import { getResourceTheme, CalendarResourceId } from "../theme/calendarTokens";
import styles from "./StatsGrid.module.css";

interface StatsGridProps {
  stats: TopicStats | null;
}

interface FlatStatItem extends StatsInterval {
  type: "stats90" | "stats70" | "stats50";
  label: string;
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("ru-RU", {
    weekday: "short",
    month: "long",
    day: "numeric",
  });
};

const formatTimeRange = (startStr: string, endStr: string) => {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  return `${start.toLocaleTimeString("ru-RU", options)} — ${end.toLocaleTimeString("ru-RU", options)}`;
};

const formatDuration = (startStr: string, endStr: string) => {
  const start = new Date(startStr);
  const end = new Date(endStr);
  const diffMs = end.getTime() - start.getTime();
  const diffMins = Math.round(diffMs / 60000);

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;

  if (hours > 0) {
    return mins > 0 ? `${hours}ч ${mins}м` : `${hours}ч`;
  }
  return `${mins}м`;
};

const getParticipantSuffix = (count: number) => {
  const lastDigit = count % 10;
  const lastTwoDigits = count % 100;

  if (lastTwoDigits >= 11 && lastTwoDigits <= 14) {
    return "участников";
  }
  if (lastDigit === 1) {
    return "участник";
  }
  if (lastDigit >= 2 && lastDigit <= 4) {
    return "участника";
  }
  return "участников";
};

const getParticipantText = (min: number, max: number) => {
  const isSingle = min === max;
  const countStr = isSingle ? `${min}` : `${min}-${max}`;
  const suffix = isSingle ? getParticipantSuffix(min) : "участников";
  return `${countStr} ${suffix}`;
};

const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  const items = useMemo(() => {
    if (!stats) return [];

    const flat: FlatStatItem[] = [
      ...stats.blocks_90.map((i) => ({
        ...i,
        type: "stats90" as const,
        label: "90%",
      })),
      ...stats.blocks_70.map((i) => ({
        ...i,
        type: "stats70" as const,
        label: "70%",
      })),
      ...stats.blocks_50.map((i) => ({
        ...i,
        type: "stats50" as const,
        label: "50%",
      })),
    ];

    // Sort: People count DESC, then Date/Time ASC
    return flat.sort((a, b) => {
      // Compare by max people count first (descending)
      if (b.people_max !== a.people_max) {
        return b.people_max - a.people_max;
      }
      // Then by start time (ascending)
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });
  }, [stats]);

  if (!items.length) {
    return (
      <div className={styles.emptyContainer}>
        <Empty description="Пока недостаточно данных для статистики" />
      </div>
    );
  }

  return (
    <div className={styles.grid}>
      {items.map((item, index) => {
        const theme = getResourceTheme(item.type as CalendarResourceId);
        return (
          <div
            key={`${item.type}-${index}-${item.start}`}
            className={styles.card}
            style={{
              backgroundColor: theme.fill,
              borderColor: theme.border,
            }}
          >
            <div className={styles.cardHeader}>
              <span
                className={styles.participantsBadge}
                style={{ backgroundColor: theme.border, color: "#fff" }}
              >
                {getParticipantText(item.people_min, item.people_max)}
              </span>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.dateRow} style={{ color: theme.text }}>
                {formatDate(item.start)}
              </div>
              <div className={styles.bottomRow}>
                <span
                  className={styles.timeRow}
                  style={{ color: theme.text, opacity: 0.9 }}
                >
                  {formatTimeRange(item.start, item.end)}
                </span>
                <span
                  className={styles.duration}
                  style={{ color: theme.text, opacity: 0.6 }}
                >
                  {formatDuration(item.start, item.end)}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsGrid;
