import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/client";
import { issues, activityLog } from "../db/schema";
import type { issues as IssueType } from "../db/schema";

export type Issue = typeof IssueType.$inferSelect;
export type NewIssue = typeof IssueType.$inferInsert;

/**
 * Create a new issue
 */
export async function createIssue(
  projectId: number,
  title: string,
  createdBy: string,
  data?: {
    description?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: Date;
  }
) {
  const newIssue = await db.insert(issues).values({
    projectId,
    title,
    createdBy,
    description: data?.description,
    status: data?.status || "todo",
    priority: data?.priority || "medium",
    assigneeId: data?.assigneeId,
    dueDate: data?.dueDate,
    order: 0,
  }).returning();

  if (newIssue.length > 0) {
    await logActivity({
      projectId,
      issueId: newIssue[0].id,
      action: "created",
      actionType: "issue",
      entityType: "Issue",
      entityId: newIssue[0].id,
      entityName: title,
      performedBy: createdBy,
      performedByName: createdBy,
      description: `Created issue "${title}"`,
    });
  }

  return newIssue[0];
}

/**
 * Get all issues for a project
 */
export async function getProjectIssues(projectId: number) {
  return await db.select()
    .from(issues)
    .where(eq(issues.projectId, projectId))
    .orderBy(desc(issues.createdAt));
}

/**
 * Get a single issue by ID
 */
export async function getIssueById(issueId: number) {
  const result = await db.select()
    .from(issues)
    .where(eq(issues.id, issueId))
    .limit(1);
  return result[0] || null;
}

/**
 * Get issues filtered by status and priority
 */
export async function getFilteredIssues(
  projectId: number,
  filters?: {
    status?: string;
    priority?: string;
    assigneeId?: string;
  }
) {
  let query = db.select().from(issues).where(eq(issues.projectId, projectId));

  if (filters?.status) {
    query = query.where(and(eq(issues.projectId, projectId), eq(issues.status, filters.status)));
  }

  if (filters?.priority) {
    query = query.where(and(eq(issues.projectId, projectId), eq(issues.priority, filters.priority)));
  }

  if (filters?.assigneeId) {
    query = query.where(and(eq(issues.projectId, projectId), eq(issues.assigneeId, filters.assigneeId)));
  }

  return query.orderBy(desc(issues.createdAt));
}

/**
 * Update an issue
 */
export async function updateIssue(
  issueId: number,
  data: {
    title?: string;
    description?: string;
    status?: string;
    priority?: string;
    assigneeId?: string;
    dueDate?: Date | null;
    order?: number;
  },
  updatedBy: string
) {
  const existing = await getIssueById(issueId);
  if (!existing) return null;

  const updated = await db.update(issues)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(issues.id, issueId))
    .returning();

  if (updated.length > 0) {
    const changes = JSON.stringify(data);
    const changeLog = [];

    if (data.status && data.status !== existing.status) {
      changeLog.push(`status changed to "${data.status}"`);
    }
    if (data.priority && data.priority !== existing.priority) {
      changeLog.push(`priority changed to "${data.priority}"`);
    }
    if (data.assigneeId && data.assigneeId !== existing.assigneeId) {
      changeLog.push(`assigned to ${data.assigneeId}`);
    }

    await logActivity({
      projectId: existing.projectId,
      issueId,
      action: "updated",
      actionType: "issue",
      entityType: "Issue",
      entityId: issueId,
      entityName: updated[0].title,
      performedBy: updatedBy,
      performedByName: updatedBy,
      description: changeLog.length > 0
        ? `Updated issue: ${changeLog.join(", ")}`
        : `Updated issue "${updated[0].title}"`,
      changes,
    });
  }

  return updated[0] || null;
}

/**
 * Delete an issue
 */
export async function deleteIssue(issueId: number, deletedBy: string) {
  const existing = await getIssueById(issueId);
  if (!existing) return null;

  // Cascade delete is handled by DB foreign keys
  // We could implement soft delete instead
  return existing;
}

/**
 * Move issue to different status (Kanban board)
 */
export async function moveIssueToStatus(
  issueId: number,
  newStatus: string,
  updatedBy: string
) {
  return await updateIssue(issueId, { status: newStatus }, updatedBy);
}

/**
 * Log activity for audit trail
 */
async function logActivity(data: {
  projectId: number;
  issueId?: number;
  action: string;
  actionType: string;
  entityType: string;
  entityId?: number;
  entityName?: string;
  performedBy: string;
  performedByName: string;
  performedByAvatar?: string;
  description: string;
  changes?: string;
}) {
  try {
    await db.insert(activityLog).values({
      ...data,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
}
