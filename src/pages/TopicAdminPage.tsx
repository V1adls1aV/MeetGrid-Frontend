import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Button, Typography } from "antd";
import StatsLadder from "../components/StatsLadder";
import ConstraintsCalendar, {
  ConstraintEvent,
} from "../components/ConstraintsCalendar";
import CalendarControls from "../components/CalendarControls";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchTopicThunk, updateConstraintsThunk } from "../store/topicSlice";
import { Interval } from "../types/topic";
import UsernameModal from "../components/UsernameModal";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { setUsername } from "../store/userSlice";

const { Title, Paragraph } = Typography;

const formatTimeRange = (start: string, end: string) =>
  `${new Date(start).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })} — ${new Date(
    end,
  ).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`;

const buildBlocks = (
  label: string,
  intervals: {
    start: string;
    end: string;
    people_min: number;
    people_max: number;
  }[],
) =>
  intervals.map((interval, index) => ({
    key: `${label}-${index}-${interval.start}`,
    label: `${interval.people_min}-${interval.people_max} ${label}`,
    range: formatTimeRange(interval.start, interval.end),
  }));

/**
 * Converts backend intervals to calendar events so drag handlers stay simple.
 */
const intervalToEvent = (interval: Interval): ConstraintEvent => ({
  id: `${interval.start}-${interval.end}`,
  title: "Окно",
  start: new Date(interval.start),
  end: new Date(interval.end),
});

/**
 * Converts a calendar event back to an Interval payload for the API.
 */
const eventToInterval = (event: ConstraintEvent): Interval => ({
  start: event.start.toISOString(),
  end: event.end.toISOString(),
});

/**
 * Creates a shallow copy to avoid mutating data that came from Redux.
 */
const cloneIntervals = (intervals?: Interval[]) =>
  intervals?.map((interval) => ({ ...interval })) ?? [];

/**
 * Detects whether two constraint lists represent identical payloads.
 */
const constraintsEqual = (a: Interval[], b: Interval[]) =>
  a.length === b.length &&
  a.every(
    (interval, index) =>
      interval.start === b[index].start && interval.end === b[index].end,
  );

const TopicAdminPage: React.FC = () => {
  const { topicId } = useParams<{ topicId: string }>();
  const dispatch = useAppDispatch();
  const { topic, stats, loading, error } = useAppSelector(
    (state) => state.topic,
  );
  const username = useAppSelector((state) => state.user.username);
  const [storedName, setStoredName] = useLocalStorage("meetgrid-username", "");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [localConstraints, setLocalConstraints] = useState<Interval[]>([]);

  useEffect(() => {
    if (storedName && storedName !== username) {
      dispatch(setUsername(storedName));
    }
  }, [dispatch, storedName, username]);

  useEffect(() => {
    if (topicId) {
      dispatch(fetchTopicThunk({ topicId }));
    }
  }, [dispatch, topicId]);

  useEffect(() => {
    if (topic?.constraints) {
      setLocalConstraints(cloneIntervals(topic.constraints));
    }
  }, [topic?.constraints]);

  const ladderBlocks = useMemo(() => {
    if (!stats) {
      return [];
    }

    return [
      ...buildBlocks("— 90%", stats.blocks_90),
      ...buildBlocks("— 70%", stats.blocks_70),
    ];
  }, [stats]);

  const calendarEvents = useMemo(
    () => localConstraints.map(intervalToEvent),
    [localConstraints],
  );

  const hasChanges = useMemo(() => {
    if (!topic?.constraints) {
      return localConstraints.length > 0;
    }

    return !constraintsEqual(localConstraints, topic.constraints);
  }, [localConstraints, topic?.constraints]);

  const handleEventsChange = useCallback((next: ConstraintEvent[]) => {
    const sorted = [...next].sort(
      (first, second) => first.start.getTime() - second.start.getTime(),
    );
    setLocalConstraints(sorted.map(eventToInterval));
  }, []);

  const handleSave = useCallback(() => {
    if (!topicId || !username) {
      return;
    }

    dispatch(
      updateConstraintsThunk({
        topicId,
        username,
        payload: { constraints: localConstraints },
      }),
    );
  }, [dispatch, localConstraints, topicId, username]);

  const handleNameConfirm = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) {
        return;
      }

      setStoredName(trimmed);
      dispatch(setUsername(trimmed));
    },
    [dispatch, setStoredName],
  );

  const canSave = Boolean(topicId && username && hasChanges && !loading);

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
          alignItems: "center",
          gap: "1rem",
        }}
      >
        <div>
          <Title level={2} style={{ marginBottom: "0.25rem" }}>
            {topic?.topic_name ?? "Администрирование"}
          </Title>
          {topic && (
            <Paragraph style={{ margin: 0 }}>
              Админ: <strong>{topic.admin_name}</strong>
            </Paragraph>
          )}
        </div>
        <CalendarControls date={currentDate} onChange={setCurrentDate} />
      </header>

      {error && (
        <Alert message="Ошибка" description={error} type="error" showIcon />
      )}

      <ConstraintsCalendar
        date={currentDate}
        events={calendarEvents}
        onEventsChange={handleEventsChange}
        loading={loading}
      />

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="primary"
          onClick={handleSave}
          disabled={!canSave}
          loading={loading}
        >
          Сохранить изменения
        </Button>
      </div>

      <div>
        <Paragraph>Статистика ограничения: отображается топ-2 блока.</Paragraph>
        <StatsLadder blocks={ladderBlocks} />
      </div>

      <UsernameModal
        visible={!username}
        onConfirm={handleNameConfirm}
        onCancel={() => {
          // держим модалку открытой до ввода имени
        }}
      />
    </section>
  );
};

export default TopicAdminPage;
