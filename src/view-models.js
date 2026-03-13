import { quickActionModules, ROLE_LABELS, schoolBrand } from "./data.js";
import { listDevicesForAccount } from "./session.js";

function placeholder(label) {
  return {
    value: "Unavailable",
    detail: label
  };
}

function formatDevice(device) {
  return {
    ...device,
    lastActiveLabel: new Date(device.lastActiveAt).toLocaleString("en-GB", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  };
}

function initialsFromName(name) {
  return String(name ?? "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function behaviorStars(rating = 0) {
  const fullStars = Math.max(0, Math.min(5, Number(rating) || 0));
  return `${"?".repeat(fullStars)}${"?".repeat(5 - fullStars)}`;
}

function transportToneLabel(transport) {
  if (!transport?.tone) {
    return "Status pending";
  }

  if (transport.tone === "live") {
    return "Live tracking";
  }

  if (transport.tone === "confirmed") {
    return "Confirmed";
  }

  return "Awaiting assignment";
}

export function buildParentDashboardView(account, selectedChildId, storage = globalThis.localStorage) {
  const summary = account?.dashboardSummary ?? {};
  const children = Array.isArray(account?.children) ? account.children : [];
  const complaints = Array.isArray(account?.complaints) ? account.complaints : [];
  const recentUpdates = Array.isArray(account?.recentUpdates) ? account.recentUpdates : [];
  const activeChild = children.find((child) => child.id === selectedChildId) ?? children[0] ?? null;

  return {
    roleLabel: ROLE_LABELS[account?.role] ?? "Parent",
    school: account?.school ?? schoolBrand,
    linkedSchools: account?.linkedSchools ?? [account?.school ?? schoolBrand],
    displayName: account?.profile?.displayName ?? "Parent",
    greeting: summary.latestStatus ?? "Your school updates will appear here as soon as the first records arrive.",
    hasChildren: children.length > 0,
    activeChild,
    activeChildId: activeChild?.id ?? null,
    childTabs: children.map((child) => ({
      id: child.id,
      fullName: child.fullName,
      gradeLabel: child.gradeLabel,
      schoolName: child.school?.name ?? account?.school?.name ?? "School",
      initials: initialsFromName(child.fullName),
      isActive: child.id === activeChild?.id
    })),
    devices: listDevicesForAccount(account, storage).map(formatDevice),
    quickStats: activeChild
      ? [
          {
            label: "Average",
            value: activeChild.averageScore ?? placeholder("Average pending").value,
            detail: activeChild.averageLabel ?? "Latest academic average"
          },
          {
            label: "Attendance",
            value: activeChild.attendanceRate ?? placeholder("Attendance sync pending").value,
            detail: activeChild.attendanceSummary ?? "Monthly attendance status"
          },
          {
            label: "Behavior",
            value: behaviorStars(activeChild.behaviorRating),
            detail: activeChild.behaviorLabel ?? "Behavior insights will appear here"
          }
        ]
      : [
          {
            label: "Average",
            value: placeholder("Academic data pending").value,
            detail: "No linked child yet"
          },
          {
            label: "Attendance",
            value: placeholder("Attendance sync pending").value,
            detail: "No linked child yet"
          },
          {
            label: "Behavior",
            value: placeholder("Behavior insights pending").value,
            detail: "No linked child yet"
          }
        ],
    alerts:
      activeChild?.alerts?.length > 0
        ? activeChild.alerts
        : [
            {
              id: "alerts-empty",
              tone: "calm",
              title: "No urgent actions right now",
              detail: "School alerts and required actions will appear here when they need attention."
            }
          ],
    schedule: activeChild?.schedule ?? [],
    transport: activeChild
      ? {
          status: activeChild.transport?.status ?? "Transport details pending",
          detail: activeChild.transport?.detail ?? "The school will publish route updates soon.",
          toneLabel: transportToneLabel(activeChild.transport)
        }
      : {
          status: "No transport data available",
          detail: "Link a child profile to start receiving route information.",
          toneLabel: "Pending"
        },
    latestNews:
      activeChild?.news ?? recentUpdates[0]?.title ?? "School news will appear here once the first update is published.",
    achievement:
      activeChild?.achievement ?? activeChild?.latestHighlight ?? "Achievements and milestones will appear here once available.",
    complaintState:
      complaints.length > 0
        ? {
            empty: false,
            title: "Current issues",
            description: "Open items are tracked here until the school closes them.",
            items: complaints
          }
        : {
            empty: true,
            title: "No current issues",
            description: "There are no active complaints or reclamations at the moment.",
            items: []
          },
    recentUpdates:
      recentUpdates.length > 0
        ? recentUpdates
        : [
            {
              id: "update-empty",
              title: "No notices yet",
              body: "New communications from the school will appear here once shared."
            }
          ],
    quickActions: quickActionModules,
    summaryStrip: {
      fees: summary.fees?.dueLabel ?? summary.fees?.paidLabel ?? "Finance details pending",
      events: `${summary.upcomingEvents ?? 0} upcoming activities`,
      transport: summary.transportStatus ?? "Transport details pending"
    }
  };
}

export function buildRoleWorkspaceView(account, storage = globalThis.localStorage) {
  const summary = account?.workspaceSummary ?? {};

  return {
    roleLabel: ROLE_LABELS[account?.role] ?? "Workspace",
    displayName: account?.profile?.displayName ?? "User",
    school: account?.school ?? schoolBrand,
    title: summary.title ?? "Workspace overview",
    description: summary.description ?? "This role workspace is ready for the next implementation step.",
    devices: listDevicesForAccount(account, storage).map(formatDevice),
    metrics:
      summary.metrics ?? [
        { label: "Readiness", value: "Ready", detail: "Foundation in place" },
        { label: "Access", value: "Secured", detail: "Role guard active" },
        { label: "Next step", value: "Module", detail: "Feature work can start cleanly" }
      ],
    priorities: summary.priorities ?? ["Define the first operational flow for this role."]
  };
}
