import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CoachPanelProvider, useCoachPanel as publicHook } from "./CoachPanelContext";
import { useCoachPanel as storeHook } from "./coachPanelStore";

function Consumer() {
  const publicState = publicHook();
  const storeState = storeHook();
  return <button onClick={() => publicState.openChat("ana")}>{storeState.activeChat ?? "closed"}</button>;
}

describe("Valmentajapaneelin yhteinen konteksti", () => {
  it("provider ja molemmat tuontipolut käyttävät samaa kontekstia myös uudelleenrenderöinnissä", () => {
    expect(publicHook).toBe(storeHook);
    const view = render(<CoachPanelProvider><Consumer /></CoachPanelProvider>);
    fireEvent.click(screen.getByRole("button", { name: "closed" }));
    expect(screen.getByRole("button", { name: "ana" })).toBeInTheDocument();
    view.rerender(<CoachPanelProvider><Consumer /></CoachPanelProvider>);
    expect(screen.getByRole("button", { name: "ana" })).toBeInTheDocument();
  });
});