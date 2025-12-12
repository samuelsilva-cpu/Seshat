import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "../+types/root";
import { AppLayout } from "../components/layout/AppLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { getProjectIssues } from "../models/issue.server";

export async function loader() {
  try {
    // For now, fetch all issues from all projects
    // In production, filter by current workspace/project
    const issues = await getProjectIssues(1); // Placeholder project ID
    return { issues: [] }; // Return empty for now
  } catch (error) {
    console.error("Failed to load issues:", error);
    return { issues: [] };
  }
}

export default function IssuesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const issues: any[] = [];

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch = issue.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || issue.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || issue.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <AppLayout
      activeRoute="issues"
      topbarTitle="Issues"
      topbarSubtitle={`${filteredIssues.length} issue${filteredIssues.length !== 1 ? "s" : ""}`}
      topbarActions={
        <Button variant="primary">
          + New Issue
        </Button>
      }
    >
      <div className="h-full p-6 space-y-6 overflow-y-auto">
        {/* Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:gap-4">
          <Input
            placeholder="Search issues..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            }
            className="flex-1"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="all">All Status</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
          >
            <option value="all">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>

        {/* Issues List */}
        {filteredIssues.length === 0 ? (
          <Card variant="glass" padding="lg" className="text-center py-12">
            <div className="space-y-4">
              <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
                {issues.length === 0 ? "No issues yet" : "No issues match your filters"}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                {issues.length === 0
                  ? "Create your first issue to get started"
                  : "Try adjusting your filters"}
              </p>
            </div>
          </Card>
        ) : (
          <div className="space-y-2">
            {filteredIssues.map((issue) => (
              <Link key={issue.id} to={`/app/issues/${issue.id}`}>
                <Card variant="glass" padding="md" interactive className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-slate-900 dark:text-slate-100">
                      {issue.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-2 text-sm">
                      <span className="text-slate-500 dark:text-slate-400">
                        {issue.projectName}
                      </span>
                      {issue.assigneeId && (
                        <span className="text-slate-500 dark:text-slate-400">
                          • Assigned
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      issue.status === "done"
                        ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                        : issue.status === "in_progress"
                          ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                          : "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400"
                    }`}>
                      {issue.status}
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
