import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { fetchTopicThunk, saveVoteThunk } from "../store/topicSlice";
import { setUsername } from "../store/userSlice";
import { useLocalStorage } from "./useLocalStorage";
import {
  VoteSlot,
  intervalsToSlots,
  slotsEqual,
  slotsToIntervals,
} from "../utils/voteHelpers";
import { getAvailableDates } from "../utils/calendarEventHelpers";
import type { VotingEvent } from "../types/calendar";
import { USER_RESOURCE_ID } from "../constants/votingResources";

const findEarliestStatStart = (stats: any) => {
  if (!stats) return null;
  const pool = [...stats.blocks_50, ...stats.blocks_70, ...stats.blocks_90];
  if (!pool.length) return null;
  const first = pool.reduce((earliest: any, interval: any) =>
    new Date(interval.start) < new Date(earliest.start) ? interval : earliest,
  );
  return new Date(first.start);
};

const slotToEvent = (slot: VoteSlot): VotingEvent => ({
  id: slot.id,
  title: "Моё окно",
  start: new Date(slot.start),
  end: new Date(slot.end),
  resourceId: USER_RESOURCE_ID,
  isEditable: true,
});

export const useTopicVoting = () => {
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

  const draftKey = useMemo(
    () =>
      topicId && username ? `meetgrid-draft-${topicId}-${username}` : null,
    [topicId, username],
  );

  useEffect(() => {
    dataLoadedRef.current = false;
  }, [topicId, username]);

  useEffect(() => {
    if (dataLoadedRef.current && draftKey && userSlots) {
      localStorage.setItem(draftKey, JSON.stringify(userSlots));
    }
  }, [draftKey, userSlots]);

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
    setInitialSlots(slots);

    if (!dataLoadedRef.current) {
      let draftSlots: VoteSlot[] | null = null;
      if (draftKey) {
        try {
          const stored = localStorage.getItem(draftKey);
          if (stored) draftSlots = JSON.parse(stored);
        } catch (e) {
          console.error("Failed to parse draft", e);
        }
      }

      if (draftSlots) {
        setUserSlots(draftSlots);
        dataLoadedRef.current = true;
      } else if (topic) {
        setUserSlots(slots);
        dataLoadedRef.current = true;
      }
    }
  }, [topic?.votes, username, draftKey, topic]);

  useEffect(() => {
    if (initialDateApplied.current) return;
    const earliest = findEarliestStatStart(stats);
    if (earliest) {
      setCurrentDate(earliest);
      initialDateApplied.current = true;
    }
  }, [stats]);

  const availableDates = useMemo(
    () => getAvailableDates(topic?.constraints ?? []),
    [topic?.constraints],
  );

  const userEvents = useMemo(() => userSlots.map(slotToEvent), [userSlots]);
  const hasChanges = useMemo(
    () => !slotsEqual(userSlots, initialSlots),
    [initialSlots, userSlots],
  );

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
    if (!topicId || !username) return;
    dispatch(
      saveVoteThunk({
        topicId,
        username,
        payload: { intervals: slotsToIntervals(userSlots) },
      }),
    );
  }, [dispatch, topicId, userSlots, username]);

  const handleConfirmName = useCallback(
    (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      setStoredName(trimmed);
      dispatch(setUsername(trimmed));
    },
    [dispatch, setStoredName],
  );

  useEffect(() => {
    if (!topicId || !username || !hasChanges) return;
    const timer = setTimeout(() => handleSave(), 1000);
    return () => clearTimeout(timer);
  }, [userSlots, hasChanges, topicId, username, handleSave]);

  return {
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
    hasChanges,
  };
};
