import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { Alert, Button, Typography } from "antd";
import StatsGrid from "../components/StatsGrid";
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
          <div>
            <Title level={3} style={{ marginBottom: "0.25rem" }}>
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
          <Alert
            message="Ошибка"
            description={error}
            type="error"
            showIcon
            style={{ borderRadius: "8px", flexShrink: 0 }}
          />
        )}

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "1.5rem",
            minHeight: 0,
            paddingBottom: "2rem",
          }}
        >
          <div style={{ height: "600px", flexShrink: 0 }}>
            <ConstraintsCalendar
              date={currentDate}
              events={calendarEvents}
              onEventsChange={handleEventsChange}
              loading={loading}
            />
          </div>

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
            <Title level={4}>Статистика</Title>
            <StatsGrid stats={stats ?? null} />
          </div>
        </div>

        <UsernameModal
          visible={!username}
          onConfirm={handleNameConfirm}
          onCancel={() => {
            // держим модалку открытой до ввода имени
          }}
        />
      </section>
    </div>
  );
};

export default TopicAdminPage;
