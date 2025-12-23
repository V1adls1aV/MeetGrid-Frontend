import { USER_RESOURCE_ID } from "../constants/votingResources";
import type { VotingEvent } from "../types/calendar";
import { buildResourceList, mapEventsToLayout } from "./calendarLayout";

const baseEvent: VotingEvent = {
  id: "evt",
  title: "Test",
  start: new Date("2024-01-01T09:00:00Z"),
  end: new Date("2024-01-01T10:00:00Z"),
  resourceId: "stats70",
};

describe("calendarLayout helpers", () => {
  it("builds desktop resources with all stats columns", () => {
    const resources = buildResourceList(false);
    expect(resources).toHaveLength(4);
    expect(resources.map((item) => item.id)).toEqual([
      "stats50",
      "stats70",
      "stats90",
      "user",
    ]);
  });

  it("builds compact resources with group + user", () => {
    const resources = buildResourceList(true);
    expect(resources).toHaveLength(2);
    expect(resources.map((item) => item.id)).toEqual([
      "others",
      USER_RESOURCE_ID,
    ]);
  });

  it("maps stats events to group in compact mode and keeps user events intact", () => {
    const statsEvent = { ...baseEvent };
    const userEvent: VotingEvent = {
      ...baseEvent,
      id: "user",
      resourceId: USER_RESOURCE_ID,
      isEditable: true,
    };

    const compactEvents = mapEventsToLayout([statsEvent, userEvent], true);
    expect(compactEvents[0].resourceId).toBe("others");
    expect(compactEvents[1].resourceId).toBe(USER_RESOURCE_ID);

    const desktopEvents = mapEventsToLayout([statsEvent, userEvent], false);
    expect(desktopEvents[0].resourceId).toBe("stats70");
    expect(desktopEvents[1].resourceId).toBe(USER_RESOURCE_ID);
  });
});
