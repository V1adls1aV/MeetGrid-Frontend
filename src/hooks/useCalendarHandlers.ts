import { useCallback } from "react";
import { SlotInfo } from "react-big-calendar";
import { Modal } from "antd";
import { USER_RESOURCE_ID } from "../constants/votingResources";
import {
  createEventId,
  ensureDuration,
  normalizeDate,
} from "../utils/calendarEventHelpers";
import {
  hasOverlap,
  fitsConstraints,
  isWithinDayLimit,
  isLongEnough,
  showValidationWarning,
} from "../utils/intervalGuards";
import type { VotingEvent } from "../types/calendar";
import type { Interval } from "../types/topic";

interface UseCalendarHandlersProps {
  userEvents: VotingEvent[];
  onUserEventsChange: (next: VotingEvent[]) => void;
  constraints: Interval[];
  onEditEvent: (event: VotingEvent) => void;
}

export const useCalendarHandlers = ({
  userEvents,
  onUserEventsChange,
  constraints,
  onEditEvent,
}: UseCalendarHandlersProps) => {
  const userTimedEvents = userEvents.map(({ id, start, end }) => ({
    id,
    start,
    end,
  }));

  const validateAndExecute = useCallback(
    (
      candidate: { id?: string; start: Date; end: Date },
      onSuccess: () => void,
    ) => {
      if (hasOverlap(userTimedEvents, candidate)) {
        showValidationWarning(
          "Можно выбрать только непересекающиеся интервалы.",
        );
        return;
      }
      if (!isWithinDayLimit(candidate)) {
        showValidationWarning("Слот не может заканчиваться позже 23:45.");
        return;
      }
      if (!isLongEnough(candidate)) {
        showValidationWarning("Минимальная длительность слота — 30 минут.");
        return;
      }
      if (!fitsConstraints(candidate, constraints)) {
        showValidationWarning(
          "Интервал должен полностью лежать в доступных окнах.",
        );
        return;
      }
      onSuccess();
    },
    [userTimedEvents, constraints],
  );

  const handleSelectSlot = useCallback(
    (slot: SlotInfo) => {
      if (slot.action !== "select" || slot.resourceId !== USER_RESOURCE_ID)
        return;

      const start = normalizeDate(slot.start as Date | string);
      const end = ensureDuration(
        start,
        normalizeDate(slot.end as Date | string),
      );

      validateAndExecute({ start, end }, () => {
        onUserEventsChange([
          ...userEvents,
          {
            id: createEventId(),
            title: "Доступен",
            start,
            end,
            resourceId: USER_RESOURCE_ID,
            isEditable: true,
          },
        ]);
      });
    },
    [userEvents, onUserEventsChange, validateAndExecute],
  );

  const handleEventChange = useCallback(
    ({ event, start, end }: any) => {
      if (event.resourceId !== USER_RESOURCE_ID) return;

      validateAndExecute(
        { id: event.id, start: start as Date, end: end as Date },
        () => {
          onUserEventsChange(
            userEvents.map((e) =>
              e.id === event.id
                ? { ...e, start: start as Date, end: end as Date }
                : e,
            ),
          );
        },
      );
    },
    [userEvents, onUserEventsChange, validateAndExecute],
  );

  const handleSelectEvent = useCallback(
    (event: any) => {
      if (event.isBackground || event.resourceId !== USER_RESOURCE_ID) return;
      onEditEvent(event);
    },
    [onEditEvent],
  );

  return {
    handleSelectSlot,
    handleEventDrop: handleEventChange,
    handleEventResize: handleEventChange,
    handleSelectEvent,
  };
};
