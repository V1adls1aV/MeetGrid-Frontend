import React, { useMemo } from "react";
import { Alert, Typography } from "antd";
import UsernameModal from "../components/UsernameModal";
import VotingCalendar from "../components/VotingCalendar";
import StatsLadder from "../components/StatsLadder";
import CalendarControls from "../components/CalendarControls";
import { StatsInterval, TopicStats } from "../types/topic";
import type { VotingEvent } from "../types/calendar";
import { useTopicVoting } from "../hooks/useTopicVoting";

const { Title, Paragraph, Text } = Typography;

const formatTimeRange = (start: string, end: string) => {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  return `${new Date(start).toLocaleTimeString("ru-RU", options)} — ${new Date(end).toLocaleTimeString("ru-RU", options)}`;
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

const formatPeopleCount = (min: number, max: number, useShort = false) => {
  const isSingle = min === max;
  const countStr = isSingle ? `${min}` : `${min}-${max}`;

  if (useShort) {
    return `${countStr} чел.`;
  }

  // Для диапазонов всегда используем "участников" (напр. 2-5 участников)
  const suffix = isSingle ? getParticipantSuffix(min) : "участников";
  return `${countStr} ${suffix}`;
};

const mapBlocks = (label: string, intervals: StatsInterval[]) =>
  intervals.map((interval, index) => ({
    label: `${formatPeopleCount(interval.people_min, interval.people_max)} ${label}`,
    range: formatTimeRange(interval.start, interval.end),
    key: `${label}-${index}-${interval.start}`,
  }));

const statsToEvents = (stats?: TopicStats): VotingEvent[] => {
  if (!stats) return [];

  const build = (
    resourceId: VotingEvent["resourceId"],
    intervals: StatsInterval[],
  ) =>
    intervals.map((interval, index) => ({
      id: `${resourceId}-${index}-${interval.start}`,
      title: formatPeopleCount(interval.people_min, interval.people_max, true),
      start: new Date(interval.start),
      end: new Date(interval.end),
      resourceId,
    }));

  return [
    ...build("stats50", stats.blocks_50),
    ...build("stats70", stats.blocks_70),
    ...build("stats90", stats.blocks_90),
  ];
};

const findEarliestStatStart = (stats?: TopicStats) => {
  if (!stats) {
    return null;
  }

  const pool = [...stats.blocks_50, ...stats.blocks_70, ...stats.blocks_90];
  if (!pool.length) {
    return null;
  }

  const first = pool.reduce((earliest, interval) =>
    new Date(interval.start) < new Date(earliest.start) ? interval : earliest,
  );
  return new Date(first.start);
};

const TopicMainPage: React.FC = () => {
  const {
    topic,
    stats,
    loading,
    error,
    username,
    currentDate,
    setCurrentDate,
    userEvents,
    availableDates,
    handleUserEventsChange,
    handleConfirmName,
  } = useTopicVoting();

  const statsEvents = useMemo(() => statsToEvents(stats ?? undefined), [stats]);

  const ladderBlocks = useMemo(() => {
    if (!stats) return [];
    return [
      ...mapBlocks("— 90%", stats.blocks_90),
      ...mapBlocks("— 70%", stats.blocks_70),
      ...mapBlocks("— 50%", stats.blocks_50),
    ];
  }, [stats]);

  return (
    <section
      style={{
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
      }}
    >
      <header
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <div
          style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}
        >
          <Title level={2} style={{ marginBottom: 0 }}>
            Выбор времени
          </Title>
        </div>
        <CalendarControls
          date={currentDate}
          onChange={setCurrentDate}
          availableDates={availableDates}
        />
      </header>

      {error && (
        <Alert
          message="Не удалось загрузить данные"
          description={error}
          type="error"
          showIcon
        />
      )}

      <VotingCalendar
        date={currentDate}
        statsEvents={statsEvents}
        userEvents={userEvents}
        onUserEventsChange={handleUserEventsChange}
        onDateChange={setCurrentDate}
        constraints={topic?.constraints ?? []}
        loading={loading}
      />

      <div>
        <Paragraph style={{ marginBottom: "0.5rem" }}>
          Лучшие окна по статистике:
        </Paragraph>
        <StatsLadder blocks={ladderBlocks} />
      </div>

      <UsernameModal
        visible={!username}
        onConfirm={handleConfirmName}
        onCancel={() => {
          // оставляем модалку открытой
        }}
      />
    </section>
  );
};

export default TopicMainPage;
