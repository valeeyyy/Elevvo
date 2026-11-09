import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { AppRoutes } from "../App";

const renderAt = (path = "/") =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  );

describe("dashboard", () => {
  it("shows 3 notifications and closes on Escape", async () => {
    const user = userEvent.setup();
    renderAt();
    await user.click(screen.getByRole("button", { name: /^Notifications/ }));
    const panel = screen.getByRole("region", { name: "Recent notifications" });
    expect(within(panel).getAllByRole("listitem")).toHaveLength(3);
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("region", { name: "Recent notifications" })).not.toBeInTheDocument();
  });

  it("navigates between pages", async () => {
    const user = userEvent.setup();
    renderAt();
    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    await user.click(within(nav).getByRole("link", { name: "Projects" }));
    expect(screen.getByRole("heading", { level: 1, name: "Projects" })).toBeInTheDocument();
    await user.click(within(nav).getByRole("link", { name: "Profile Settings" }));
    expect(screen.getByRole("heading", { level: 1, name: "Profile settings" })).toBeInTheDocument();
  });

  it("filters projects by status", async () => {
    const user = userEvent.setup();
    renderAt("/projects");
    await user.click(screen.getByRole("button", { name: /^Completed/ }));
    const rows = within(screen.getByRole("table")).getAllByRole("row");
    expect(rows).toHaveLength(1 + 2); // header + 2 completed
  });

  it("edits the profile and updates it across the app", async () => {
    const user = userEvent.setup();
    renderAt("/settings");
    await user.click(screen.getByRole("button", { name: "Edit profile" }));
    const name = screen.getByLabelText("Full name");
    await user.clear(name);
    await user.type(name, "Rina Putri");
    await user.click(screen.getByRole("button", { name: "Save changes" }));

    expect(screen.getByText("Profile updated")).toBeInTheDocument();
    expect(screen.queryByLabelText("Full name")).not.toBeInTheDocument();
    expect(screen.getAllByText("Rina Putri").length).toBeGreaterThanOrEqual(2); // header + profile
    expect(screen.getAllByText("RP").length).toBeGreaterThanOrEqual(2);

    const nav = screen.getByRole("navigation", { name: "Main navigation" });
    await user.click(within(nav).getByRole("link", { name: "Overview" }));
    expect(await screen.findByRole("heading", { level: 1, name: /, Rina$/ })).toBeInTheDocument();
  });
});
