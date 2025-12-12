import type { Route } from "../+types/root";
import { AppLayout } from "../components/layout/AppLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";

export async function loader() {
  return {
    stats: {
      projectsCount: 0,
      issuesCount: 0,
      completedIssues: 0,
    },
  };
}

export default function DashboardPage() {
  return (
    <AppLayout
      activeRoute="dashboard"
      topbarTitle="Dashboard"
      topbarSubtitle="Welcome back"
    >
      <div className="h-full p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card variant="glass" padding="lg">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Total Projects
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                0
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                No projects yet
              </p>
            </div>
          </Card>

          <Card variant="glass" padding="lg">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Active Issues
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                0
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                All caught up
              </p>
            </div>
          </Card>

          <Card variant="glass" padding="lg">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">
                Completed
              </p>
              <p className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                0
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                This week
              </p>
            </div>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Get Started
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card variant="glass" padding="lg" className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                  Create Your First Project
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Start organizing your work
                </p>
              </div>
              <Button variant="primary" size="sm">
                Create Project
              </Button>
            </Card>

            <Card variant="glass" padding="lg" className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-slate-900 dark:text-slate-100">
                  Create an Issue
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                  Track your tasks
                </p>
              </div>
              <Button variant="primary" size="sm">
                New Issue
              </Button>
            </Card>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Recent Activity
          </h2>
          <Card variant="glass" padding="lg">
            <p className="text-slate-600 dark:text-slate-400 text-center py-8">
              No activity yet. Create a project to get started!
            </p>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
