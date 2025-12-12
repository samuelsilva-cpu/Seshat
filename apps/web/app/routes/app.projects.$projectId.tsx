import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "../+types/root";
import { AppLayout } from "../components/layout/AppLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Tab } from "../components/ui/Tab";
import { Avatar } from "../components/ui/Avatar";
import { getProjectById, updateProject } from "../models/project.server";
import { getProjectIssues } from "../models/issue.server";
import { getProjectLabels } from "../models/label.server";

export async function loader({ params }: Route.LoaderArgs) {
  const projectId = parseInt(params.projectId as string);

  try {
    const project = await getProjectById(projectId);
    if (!project) {
      throw new Response("Project not found", { status: 404 });
    }

    const issues = await getProjectIssues(projectId);
    const labels = await getProjectLabels(projectId);

    return { project, issues, labels };
  } catch (error) {
    throw new Response("Failed to load project", { status: 500 });
  }
}

export default function ProjectDetailPage({ loaderData, params }: Route.ComponentProps) {
  const { project, issues, labels } = loaderData;
  const [activeTab, setActiveTab] = useState("issues");

  const issuesByStatus = {
    todo: issues.filter(i => i.status === "todo"),
    in_progress: issues.filter(i => i.status === "in_progress"),
    done: issues.filter(i => i.status === "done"),
  };

  return (
    <AppLayout
      activeRoute="projects"
      topbarTitle={project.name}
      topbarSubtitle={project.description}
      topbarActions={
        <Button variant="secondary" size="sm">
          Settings
        </Button>
      }
    >
      <div className="h-full p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card variant="glass" padding="md">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Total Issues
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {issues.length}
              </p>
            </div>
          </Card>
          <Card variant="glass" padding="md">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Todo
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {issuesByStatus.todo.length}
              </p>
            </div>
          </Card>
          <Card variant="glass" padding="md">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                In Progress
              </p>
              <p className="text-2xl font-bold text-yellow-600">
                {issuesByStatus.in_progress.length}
              </p>
            </div>
          </Card>
          <Card variant="glass" padding="md">
            <div className="space-y-1">
              <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
                Done
              </p>
              <p className="text-2xl font-bold text-green-600">
                {issuesByStatus.done.length}
              </p>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="space-y-4">
          <div className="flex gap-4 border-b border-slate-200 dark:border-slate-800">
            <button
              onClick={() => setActiveTab("issues")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "issues"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 dark:text-slate-400"
              }`}
            >
              Issues
            </button>
            <button
              onClick={() => setActiveTab("labels")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "labels"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 dark:text-slate-400"
              }`}
            >
              Labels
            </button>
            <button
              onClick={() => setActiveTab("activity")}
              className={`px-4 py-3 font-medium border-b-2 transition-colors ${
                activeTab === "activity"
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-600 dark:text-slate-400"
              }`}
            >
              Activity
            </button>
          </div>

          {/* Issues Tab */}
          {activeTab === "issues" && (
            <div className="space-y-4">
              {issues.length === 0 ? (
                <Card variant="glass" padding="lg" className="text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400">
                    No issues yet. Create one to get started.
                  </p>
                </Card>
              ) : (
                <div className="space-y-2">
                  {issues.map((issue) => (
                    <Link key={issue.id} to={`/app/issues/${issue.id}`}>
                      <Card variant="glass" padding="md" interactive>
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-slate-900 dark:text-slate-100">
                              {issue.title}
                            </h4>
                            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                              {issue.description?.substring(0, 100)}
                              {issue.description && issue.description.length > 100 ? "..." : ""}
                            </p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              issue.status === "done"
                                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                                : issue.status === "in_progress"
                                  ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                  : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
                            }`}>
                              {issue.status}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              issue.priority === "urgent"
                                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                                : issue.priority === "high"
                                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400"
                                  : "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                            }`}>
                              {issue.priority}
                            </span>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Labels Tab */}
          {activeTab === "labels" && (
            <div className="space-y-4">
              {labels.length === 0 ? (
                <Card variant="glass" padding="lg" className="text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400">
                    No labels created yet.
                  </p>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {labels.map((label) => (
                    <Card key={label.id} variant="glass" padding="md">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: label.color }}
                        />
                        <div className="flex-1">
                          <h4 className="font-medium text-slate-900 dark:text-slate-100">
                            {label.name}
                          </h4>
                          {label.description && (
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                              {label.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Activity Tab */}
          {activeTab === "activity" && (
            <Card variant="glass" padding="lg" className="text-center py-8">
              <p className="text-slate-600 dark:text-slate-400">
                Activity log coming soon
              </p>
            </Card>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
