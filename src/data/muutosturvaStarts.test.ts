import { describe, expect, it } from "vitest";
import { nextCourseStart, formatCourseDate } from "./muutosturvaStarts";

describe("Muutosturva starts", () => {
  it("selects nearest future date even when input is reversed", () => {
    expect(nextCourseStart(new Date("2026-09-19T13:30:00Z"))?.start).toBe("2026-10-13");
  });
  it("excludes a course on its start day in Finland", () => {
    expect(nextCourseStart(new Date("2026-10-12T21:01:00Z"))?.start).toBe("2026-11-10");
  });
  it("uses chronological order across years", () => {
    expect(nextCourseStart(new Date("2026-11-10T10:00:00Z"))?.start).toBe("2027-01-12");
  });
  it("has no next course when all have started", () => {
    expect(nextCourseStart(new Date("2027-01-12T10:00:00Z"))).toBeUndefined();
  });
  it("sorts dates rather than config positions", () => {
    expect(nextCourseStart(new Date("2026-09-19"), [
      { course: "B", start: "2027-01-12", deadline: "2027-01-04" },
      { course: "A", start: "2026-10-13", deadline: "2026-10-05" },
    ])?.course).toBe("A");
  });
  it("formats Finnish dates", () => expect(formatCourseDate("2026-10-13")).toBe("13.10.2026"));
});
