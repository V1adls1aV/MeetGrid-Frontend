import React, { useMemo, useState } from "react";
import { Alert, Typography, Button, FloatButton, TimePicker } from "antd";
import { CalendarOutlined, BarChartOutlined } from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import UsernameModal from "../components/UsernameModal";
import VotingCalendar from "../components/VotingCalendar";
import StatsGrid from "../components/StatsGrid";
import CalendarControls from "../components/CalendarControls";
import { StatsInterval, TopicStats } from "../types/topic";
import type { VotingEvent } from "../types/calendar";
import { useTopicVoting } from "../hooks/useTopicVoting";

const { Title } = Typography;

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

const formatPeopleCount = (min: number, max: number) => {
  const isSingle = min === max;
  const countStr = isSingle ? `${min}` : `${min}-${max}`;

  const suffix = isSingle ? getParticipantSuffix(min) : "участников";
  return `${countStr} ${suffix}`;
};

const statsToEvents = (stats?: TopicStats): VotingEvent[] => {
  if (!stats) return [];

  const build = (
    resourceId: VotingEvent["resourceId"],
    intervals: StatsInterval[],
  ) =>
    intervals.map((interval, index) => ({
      id: `${resourceId}-${index}-${interval.start}`,
      title: formatPeopleCount(interval.people_min, interval.people_max),
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

type ViewMode = "calendar" | "stats";

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

  const [viewMode, setViewMode] = useState<ViewMode>("calendar");
  const [minDuration, setMinDuration] = useState<Dayjs | null>(null);

  const filteredStats = useMemo(() => {
    if (!stats || !minDuration) return stats;

    const minMinutes = minDuration.hour() * 60 + minDuration.minute();
    if (minMinutes === 0) return stats;

    const filterBlocks = (blocks: StatsInterval[]) =>
      blocks.filter((block) => {
        const start = new Date(block.start).getTime();
        const end = new Date(block.end).getTime();
        const durationMinutes = (end - start) / (1000 * 60);
        return durationMinutes >= minMinutes;
      });

    return {
      ...stats,
      blocks_50: filterBlocks(stats.blocks_50),
      blocks_70: filterBlocks(stats.blocks_70),
      blocks_90: filterBlocks(stats.blocks_90),
    };
  }, [stats, minDuration]);

  const statsEvents = useMemo(() => statsToEvents(stats ?? undefined), [stats]);

  const toggleView = () => {
    setViewMode((prev) => (prev === "calendar" ? "stats" : "calendar"));
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        height: "100dvh",
        backgroundColor: "#f5f5f5",
        overflow: "hidden",
      }}
    >
      <section
        style={{
          width: "100%",
          maxWidth: "1024px",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          position: "relative",
          height: "100%",
        }}
      >
        <header
          style={{
            flexShrink: 0,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "1rem",
            background: "#fff",
            padding: "1rem",
            borderRadius: "12px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}
          >
            <Title level={3} style={{ marginBottom: 0 }}>
              {viewMode === "calendar" ? "Выбор времени" : "Статистика"}
            </Title>
            {viewMode === "stats" && stats?.vote_count !== undefined && (
              <Typography.Text type="secondary" style={{ fontSize: "14px" }}>
                Всего проголосовавших: {stats.vote_count}
              </Typography.Text>
            )}
          </div>
          {viewMode === "calendar" ? (
            <CalendarControls
              date={currentDate}
              onChange={setCurrentDate}
              availableDates={availableDates}
            />
          ) : (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <span style={{ fontSize: "14px", color: "rgba(0, 0, 0, 0.45)" }}>
                Мин. длительность:
              </span>
              <TimePicker
                value={minDuration}
                onChange={setMinDuration}
                format="HH:mm"
                minuteStep={15}
                showNow={false}
                placeholder="00:00"
                style={{ width: 100 }}
                allowClear
              />
            </div>
          )}
        </header>

        {error && (
          <Alert
            message="Не удалось загрузить данные"
            description={error}
            type="error"
            showIcon
            style={{ borderRadius: "8px" }}
          />
        )}

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            minHeight: 0 /* Crucial for nested flex scrolling */,
          }}
        >
          {viewMode === "calendar" ? (
            <VotingCalendar
              date={currentDate}
              statsEvents={statsEvents}
              userEvents={userEvents}
              onUserEventsChange={handleUserEventsChange}
              onDateChange={setCurrentDate}
              constraints={topic?.constraints ?? []}
              loading={loading}
            />
          ) : (
            <StatsGrid stats={filteredStats ?? null} />
          )}
        </div>

        <FloatButton
          icon={
            viewMode === "calendar" ? (
              <BarChartOutlined />
            ) : (
              <CalendarOutlined />
            )
          }
          type="primary"
          style={{
            position: "absolute",
            right: 38,
            bottom: 32,
            width: 56,
            height: 56,
          }}
          onClick={toggleView}
          tooltip={viewMode === "calendar" ? "Статистика" : "Календарь"}
        />

        <UsernameModal
          visible={!username}
          onConfirm={handleConfirmName}
          onCancel={() => {
            // оставляем модалку открытой
          }}
        />
      </section>
    </div>
  );
};

export default TopicMainPage;
