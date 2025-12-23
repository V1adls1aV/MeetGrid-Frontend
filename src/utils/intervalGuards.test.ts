import { isWithinDayLimit, isLongEnough, hasOverlap } from "./intervalGuards";

describe("hasOverlap", () => {
  it("detects overlap on borders (start touch)", () => {
    const existing = [
      {
        id: "1",
        start: new Date(2025, 0, 1, 10, 0),
        end: new Date(2025, 0, 1, 10, 30),
      },
    ];
    const candidate = {
      start: new Date(2025, 0, 1, 10, 30),
      end: new Date(2025, 0, 1, 11, 0),
    };
    expect(hasOverlap(existing, candidate)).toBe(true);
  });

  it("detects overlap on borders (end touch)", () => {
    const existing = [
      {
        id: "1",
        start: new Date(2025, 0, 1, 10, 30),
        end: new Date(2025, 0, 1, 11, 0),
      },
    ];
    const candidate = {
      start: new Date(2025, 0, 1, 10, 0),
      end: new Date(2025, 0, 1, 10, 30),
    };
    expect(hasOverlap(existing, candidate)).toBe(true);
  });

  it("detects inside overlap", () => {
    const existing = [
      {
        id: "1",
        start: new Date(2025, 0, 1, 10, 0),
        end: new Date(2025, 0, 1, 11, 0),
      },
    ];
    const candidate = {
      start: new Date(2025, 0, 1, 10, 15),
      end: new Date(2025, 0, 1, 10, 45),
    };
    expect(hasOverlap(existing, candidate)).toBe(true);
  });

  it("allows non-overlapping", () => {
    const existing = [
      {
        id: "1",
        start: new Date(2025, 0, 1, 10, 0),
        end: new Date(2025, 0, 1, 10, 30),
      },
    ];
    const candidate = {
      start: new Date(2025, 0, 1, 11, 0),
      end: new Date(2025, 0, 1, 11, 30),
    };
    expect(hasOverlap(existing, candidate)).toBe(false);
  });
});

describe("isWithinDayLimit", () => {
  const createDate = (hours: number, minutes: number) => {
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d;
  };

  it("permits 23:45", () => {
    const end = createDate(23, 45);
    expect(isWithinDayLimit({ start: new Date(), end })).toBe(true);
  });

  it("permits 12:00", () => {
    const end = createDate(12, 0);
    expect(isWithinDayLimit({ start: new Date(), end })).toBe(true);
  });

  it("rejects 23:46", () => {
    const end = createDate(23, 46);
    expect(isWithinDayLimit({ start: new Date(), end })).toBe(false);
  });

  it("rejects 00:00 of next day (technically 24:00)", () => {
    const start = createDate(23, 0);
    const end = createDate(23, 59);
    end.setDate(end.getDate() + 1);
    end.setHours(0, 0, 0, 0);

    expect(isWithinDayLimit({ start, end })).toBe(false);
  });
});

describe("isLongEnough", () => {
  it("permits 30 minutes", () => {
    const start = new Date(2025, 0, 1, 10, 0);
    const end = new Date(2025, 0, 1, 10, 30);
    expect(isLongEnough({ start, end })).toBe(true);
  });

  it("permits more than 30 minutes", () => {
    const start = new Date(2025, 0, 1, 10, 0);
    const end = new Date(2025, 0, 1, 11, 0);
    expect(isLongEnough({ start, end })).toBe(true);
  });

  it("rejects less than 30 minutes", () => {
    const start = new Date(2025, 0, 1, 10, 0);
    const end = new Date(2025, 0, 1, 10, 29);
    expect(isLongEnough({ start, end })).toBe(false);
  });
});
