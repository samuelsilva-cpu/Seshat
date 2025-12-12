import { useState } from "react";
import type { Route } from "../+types/root";
import { AppLayout } from "../components/layout/AppLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Input } from "../components/ui/Input";
import { Avatar } from "../components/ui/Avatar";
import { Tag } from "../components/ui/Tag";
import { getIssueById, updateIssue } from "../models/issue.server";
import { getIssueComments, createComment } from "../models/comment.server";
import { getIssueLabels } from "../models/label.server";

export async function loader({ params }: Route.LoaderArgs) {
  const issueId = parseInt(params.issueId as string);

  try {
    const issue = await getIssueById(issueId);
    if (!issue) {
      throw new Response("Issue not found", { status: 404 });
    }

    const comments = await getIssueComments(issueId);
    const labels = await getIssueLabels(issueId);

    return { issue, comments, labels };
  } catch (error) {
    throw new Response("Failed to load issue", { status: 500 });
  }
}

export async function action({ request, params }: Route.ActionArgs) {
  const issueId = parseInt(params.issueId as string);
  const formData = await request.formData();

  if (request.method === "POST") {
    const action = formData.get("_action") as string;

    if (action === "comment") {
      const content = formData.get("content") as string;
      if (!content) {
        return { error: "Comment content is required" };
      }

      try {
        const comment = await createComment(issueId, content, "current-user", "Current User");
        return { success: true, comment };
      } catch (error) {
        return { error: "Failed to post comment" };
      }
    }

    if (action === "update") {
      const status = formData.get("status") as string;
      const priority = formData.get("priority") as string;

      try {
        const updated = await updateIssue(issueId, {
          status: status || undefined,
          priority: priority || undefined,
        }, "current-user");
        return { success: true, issue: updated };
      } catch (error) {
        return { error: "Failed to update issue" };
      }
    }
  }

  return { error: "Invalid request" };
}

export default function IssueDetailPage({ loaderData, actionData, params }: Route.ComponentProps) {
  const { issue, comments, labels } = loaderData;
  const [commentText, setCommentText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setIsSubmitting(true);
    setCommentText("");
    // Form submission will be handled by React Router action
  };

  const statusOptions = ["todo", "in_progress", "done"];
  const priorityOptions = ["low", "medium", "high", "urgent"];

  return (
    <AppLayout
      activeRoute="issues"
      topbarTitle={issue.title}
      topbarSubtitle={`Created by ${issue.createdBy}`}
    >
      <div className="h-full p-6 overflow-y-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <Card variant="glass" padding="lg">
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Description
                </h3>
                <p className="text-slate-700 dark:text-slate-300">
                  {issue.description || "No description provided"}
                </p>
              </div>
            </Card>

            {/* Comments Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Comments
              </h3>

              {/* Add Comment */}
              <Card variant="glass" padding="lg">
                <form onSubmit={handleSubmitComment} className="space-y-3">
                  <div className="flex gap-3">
                    <Avatar initials="U" size="sm" />
                    <textarea
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      placeholder="Add a comment..."
                      className="flex-1 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={3}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      variant="primary"
                      size="sm"
                      disabled={!commentText.trim() || isSubmitting}
                      loading={isSubmitting}
                    >
                      Post Comment
                    </Button>
                  </div>
                </form>
              </Card>

              {/* Comments List */}
              {comments.length === 0 ? (
                <Card variant="glass" padding="lg" className="text-center py-8">
                  <p className="text-slate-600 dark:text-slate-400">
                    No comments yet. Be the first to comment!
                  </p>
                </Card>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <Card key={comment.id} variant="glass" padding="lg">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={comment.authorAvatar}
                            initials={comment.authorName.slice(0, 2).toUpperCase()}
                            size="sm"
                          />
                          <div>
                            <p className="font-medium text-slate-900 dark:text-slate-100">
                              {comment.authorName}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-slate-700 dark:text-slate-300">
                          {comment.content}
                        </p>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Status */}
            <Card variant="glass" padding="lg">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Status
                </h4>
                <select
                  defaultValue={issue.status}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            {/* Priority */}
            <Card variant="glass" padding="lg">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Priority
                </h4>
                <select
                  defaultValue={issue.priority}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100"
                >
                  {priorityOptions.map((priority) => (
                    <option key={priority} value={priority}>
                      {priority}
                    </option>
                  ))}
                </select>
              </div>
            </Card>

            {/* Labels */}
            {labels.length > 0 && (
              <Card variant="glass" padding="lg">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Labels
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {labels.map((label) => (
                      <Tag key={label.id} color={label.color}>
                        {label.name}
                      </Tag>
                    ))}
                  </div>
                </div>
              </Card>
            )}

            {/* Due Date */}
            {issue.dueDate && (
              <Card variant="glass" padding="lg">
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Due Date
                  </h4>
                  <p className="text-slate-700 dark:text-slate-300">
                    {new Date(issue.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
