import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "../+types/root";
import { AppLayout } from "../components/layout/AppLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Avatar } from "../components/ui/Avatar";

export async function loader() {
  try {
    // Placeholder for board data
    return {
      columns: {
        todo: { title: "Todo", issues: [] },
        in_progress: { title: "In Progress", issues: [] },
        done: { title: "Done", issues: [] },
      },
    };
  } catch (error) {
    console.error("Failed to load board:", error);
    return {
      columns: {
        todo: { title: "Todo", issues: [] },
        in_progress: { title: "In Progress", issues: [] },
        done: { title: "Done", issues: [] },
      },
    };
  }
}

interface DraggableIssue {
  id: number;
  title: string;
  status: string;
  priority: string;
  assigneeId?: string;
  assigneeName?: string;
}

interface ColumnData {
  title: string;
  issues: DraggableIssue[];
}

export default function BoardPage({ loaderData }: Route.ComponentProps) {
  const [columns, setColumns] = useState<Record<string, ColumnData>>(loaderData?.columns || {
    todo: { title: "Todo", issues: [] },
    in_progress: { title: "In Progress", issues: [] },
    done: { title: "Done", issues: [] },
  });

  const [draggedIssue, setDraggedIssue] = useState<{ issue: DraggableIssue; fromColumn: string } | null>(null);

  const handleDragStart = (issue: DraggableIssue, columnId: string) => {
    setDraggedIssue({ issue, fromColumn: columnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.currentTarget.classList.add("bg-blue-50", "dark:bg-blue-900/20");
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.currentTarget.classList.remove("bg-blue-50", "dark:bg-blue-900/20");
  };

  const handleDrop = (e: React.DragEvent, toColumn: string) => {
    e.preventDefault();
    e.currentTarget.classList.remove("bg-blue-50", "dark:bg-blue-900/20");

    if (!draggedIssue) return;

    const { issue, fromColumn } = draggedIssue;

    if (fromColumn === toColumn) return;

    // Update columns
    setColumns((prev) => ({
      ...prev,
      [fromColumn]: {
        ...prev[fromColumn],
        issues: prev[fromColumn].issues.filter((i) => i.id !== issue.id),
      },
      [toColumn]: {
        ...prev[toColumn],
        issues: [...prev[toColumn].issues, { ...issue, status: toColumn }],
      },
    }));

    // In production, call API to update issue status
    setDraggedIssue(null);
  };

  const statusOptions = ["todo", "in_progress", "done"];

  return (
    <AppLayout
      activeRoute="board"
      topbarTitle="Board"
      topbarSubtitle="Kanban view"
      topbarActions={
        <Button variant="primary" size="sm">
          + New Issue
        </Button>
      }
    >
      <div className="h-full p-6 overflow-x-auto">
        <div className="flex gap-4 min-w-full">
          {statusOptions.map((columnId) => (
            <div
              key={columnId}
              className="flex-shrink-0 w-80 flex flex-col"
            >
              {/* Column Header */}
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-1">
                  {columnId === "todo"
                    ? "Todo"
                    : columnId === "in_progress"
                      ? "In Progress"
                      : "Done"}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {columns[columnId]?.issues.length || 0} issue
                  {columns[columnId]?.issues.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Column Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, columnId)}
                className="flex-1 space-y-3 rounded-lg p-4 min-h-96 transition-colors border-2 border-dashed border-transparent hover:border-slate-200 dark:hover:border-slate-800"
              >
                {columns[columnId]?.issues.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <p className="text-slate-400 dark:text-slate-500 text-sm">
                      No issues in {columnId.replace(/_/g, " ")}
                    </p>
                  </div>
                ) : (
                  columns[columnId]?.issues.map((issue) => (
                    <div
                      key={issue.id}
                      draggable
                      onDragStart={() => handleDragStart(issue, columnId)}
                      className="cursor-move"
                    >
                      <Link to={`/app/issues/${issue.id}`}>
                        <Card
                          variant="glass"
                          padding="md"
                          interactive
                          className="group hover:shadow-lg transition-all"
                        >
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-medium text-slate-900 dark:text-slate-100 flex-1 group-hover:text-blue-600 transition-colors">
                                {issue.title}
                              </h4>
                              <span
                                className={`flex-shrink-0 px-2 py-1 rounded text-xs font-semibold ${
                                  issue.priority === "urgent"
                                    ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                    : issue.priority === "high"
                                      ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                      : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                                }`}
                              >
                                {issue.priority}
                              </span>
                            </div>
                            {issue.assigneeId && (
                              <div className="flex items-center gap-2">
                                <Avatar
                                  initials={issue.assigneeName?.slice(0, 2).toUpperCase() || "?"}
                                  size="xs"
                                />
                                <span className="text-xs text-slate-600 dark:text-slate-400">
                                  {issue.assigneeName}
                                </span>
                              </div>
                            )}
                          </div>
                        </Card>
                      </Link>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
