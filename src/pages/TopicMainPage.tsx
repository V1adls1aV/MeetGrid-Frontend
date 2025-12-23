import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { Alert, Button, Spin, Typography } from "antd";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchTopicThunk, saveVoteThunk } from "../store/topicSlice";
import { setUsername } from "../store/userSlice";
import UsernameModal from "../components/UsernameModal";
import VotingCalendar from "../components/VotingCalendar";
import StatsLadder from "../components/StatsLadder";
import CalendarControls from "../components/CalendarControls";
import { StatsInterval, TopicStats } from "../types/topic";
import { USER_RESOURCE_ID } from "../constants/votingResources";
import type { VotingEvent } from "../types/calendar";
import { useLocalStorage } from "../hooks/useLocalStorage";
import {
  VoteSlot,
  intervalsToSlots,
  slotsEqual,
  slotsToIntervals,
} from "../utils/voteHelpers";
import { getAvailableDates } from "../utils/calendarEventHelpers";

const { Title, Paragraph, Text } = Typography;

const formatTimeRange = (start: string, end: string) => {
  const options: Intl.DateTimeFormatOptions = {
    hour: "2-digit",
    minute: "2-digit",
  };
  return `${new Date(start).toLocaleTimeString("ru-RU", options)} — ${new Date(end).toLocaleTimeString("ru-RU", options)}`;
};

const mapBlocks = (label: string, intervals: StatsInterval[]) =>
  intervals.map((interval, index) => ({
    label: `${interval.people_min}-${interval.people_max} участников ${label}`,
    range: formatTimeRange(interval.start, interval.end),
    key: `${label}-${index}-${interval.start}`,
  }));

const statsToEvents = (stats?: TopicStats): VotingEvent[] => {
  if (!stats) {
    return [];
  }

  const build = (
    resourceId: VotingEvent["resourceId"],
    intervals: StatsInterval[],
  ) =>
    intervals.map((interval, index) => ({
      id: `${resourceId}-${index}-${interval.start}`,
      title: `${interval.people_min}-${interval.people_max} чел.`,
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

const slotToEvent = (slot: VoteSlot): VotingEvent => ({
  id: slot.id,
  title: "Моё окно",
  start: new Date(slot.start),
  end: new Date(slot.end),
  resourceId: USER_RESOURCE_ID,
  isEditable: true,
});

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
  const { topicId } = useParams<{ topicId: string }>();
  const dispatch = useAppDispatch();
  const username = useAppSelector((state) => state.user.username);
  const { topic, stats, loading, error } = useAppSelector(
    (state) => state.topic,
  );
  const [storedName, setStoredName] = useLocalStorage("meetgrid-username", "");
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [userSlots, setUserSlots] = useState<VoteSlot[]>([]);
  const [initialSlots, setInitialSlots] = useState<VoteSlot[]>([]);
  const initialDateApplied = useRef(false);
  const dataLoadedRef = useRef(false);

  // Reset data loaded flag when context changes
  useEffect(() => {
    dataLoadedRef.current = false;
  }, [topicId, username]);

  useEffect(() => {
    if (storedName && storedName !== username) {
      dispatch(setUsername(storedName));
    }
  }, [dispatch, storedName, username]);

  useEffect(() => {
    if (topicId && username) {
      dispatch(fetchTopicThunk({ topicId, username }));
    }
  }, [dispatch, topicId, username]);

  useEffect(() => {
    if (!username) {
      setUserSlots([]);
      setInitialSlots([]);
      return;
    }

    const intervals = topic?.votes?.[username] ?? [];
    const slots = intervalsToSlots(intervals);

    // Always update baseline to detect changes against server state
    setInitialSlots(slots);

    // Only update user slots on initial load to avoid overwriting ongoing edits
    if (!dataLoadedRef.current) {
      setUserSlots(slots);
      dataLoadedRef.current = true;
    }
  }, [topic?.votes, username]);

  useEffect(() => {
    if (initialDateApplied.current) {
      return;
    }
    const earliest = findEarliestStatStart(stats ?? undefined);
    if (earliest) {
      setCurrentDate(earliest);
      initialDateApplied.current = true;
    }
  }, [stats]);

  const statsEvents = useMemo(() => statsToEvents(stats ?? undefined), [stats]);
  const availableDates = useMemo(
    () => getAvailableDates(topic?.constraints ?? []),
    [topic?.constraints],
  );
  const userEvents = useMemo(() => userSlots.map(slotToEvent), [userSlots]);
  const ladderBlocks = useMemo(() => {
    if (!stats) {
      return [];
    }
    return [
      ...mapBlocks("— 90%", stats.blocks_90),
      ...mapBlocks("— 70%", stats.blocks_70),
      ...mapBlocks("— 50%", stats.blocks_50),
    ];
  }, [stats]);

  const handleUserEventsChange = useCallback((nextEvents: VotingEvent[]) => {
    const sorted = [...nextEvents].sort(
      (a, b) => a.start.getTime() - b.start.getTime(),
    );
    setUserSlots(
      sorted.map((event) => ({
        id: event.id,
        start: event.start.toISOString(),
        end: event.end.toISOString(),
      })),
    );
  }, []);

  const handleSave = useCallback(() => {
    if (!topicId || !username) {
      return;
    }

    dispatch(
      saveVoteThunk({
        topicId,
        username,
        payload: { intervals: slotsToIntervals(userSlots) },
      }),
    );
  }, [dispatch, topicId, userSlots, username]);

  const handleConfirm = useCallback(
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

  const refresh = useCallback(async () => {
    if (topicId && username) {
      const action = await dispatch(fetchTopicThunk({ topicId, username }));
      if (fetchTopicThunk.fulfilled.match(action)) {
        const intervals = action.payload.topic.votes?.[username] ?? [];
        setUserSlots(intervalsToSlots(intervals));
      }
    }
  }, [dispatch, topicId, username]);

  const hasChanges = useMemo(
    () => !slotsEqual(userSlots, initialSlots),
    [initialSlots, userSlots],
  );

  // Auto-save effect
  useEffect(() => {
    if (!topicId || !username || !hasChanges) {
      return;
    }

    const timer = setTimeout(() => {
      handleSave();
    }, 1000);

    return () => clearTimeout(timer);
  }, [userSlots, hasChanges, topicId, username, handleSave]);

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
        onConfirm={handleConfirm}
        onCancel={() => {
          // оставляем модалку открытой
        }}
      />
    </section>
  );
};

export default TopicMainPage;
