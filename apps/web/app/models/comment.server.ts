import { eq, desc } from "drizzle-orm";
import { db } from "../db/client";
import { comments, activityLog } from "../db/schema";
import type { comments as CommentType } from "../db/schema";

export type Comment = typeof CommentType.$inferSelect;
export type NewComment = typeof CommentType.$inferInsert;

/**
 * Create a new comment
 */
export async function createComment(
  issueId: number,
  content: string,
  authorId: string,
  authorName: string,
  data?: {
    authorAvatar?: string;
  },
  projectId?: number
) {
  const newComment = await db.insert(comments).values({
    issueId,
    content,
    authorId,
    authorName,
    authorAvatar: data?.authorAvatar,
  }).returning();

  if (newComment.length > 0 && projectId) {
    await logActivity({
      projectId,
      issueId,
      action: "commented",
      actionType: "comment",
      entityType: "Comment",
      entityId: newComment[0].id,
      performedBy: authorId,
      performedByName: authorName,
      performedByAvatar: data?.authorAvatar,
      description: `${authorName} commented on issue`,
    });
  }

  return newComment[0];
}

/**
 * Get all comments for an issue
 */
export async function getIssueComments(issueId: number) {
  return await db.select()
    .from(comments)
    .where(eq(comments.issueId, issueId))
    .orderBy(desc(comments.createdAt));
}

/**
 * Get a single comment by ID
 */
export async function getCommentById(commentId: number) {
  const result = await db.select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);
  return result[0] || null;
}

/**
 * Update a comment
 */
export async function updateComment(
  commentId: number,
  content: string,
  updatedBy: string,
  projectId?: number,
  issueId?: number
) {
  const existing = await getCommentById(commentId);
  if (!existing) return null;

  // Only allow update by author
  if (existing.authorId !== updatedBy) {
    throw new Error("Unauthorized: Can only update own comments");
  }

  const updated = await db.update(comments)
    .set({
      content,
      updatedAt: new Date(),
    })
    .where(eq(comments.id, commentId))
    .returning();

  if (updated.length > 0 && projectId && issueId) {
    await logActivity({
      projectId,
      issueId,
      action: "updated",
      actionType: "comment",
      entityType: "Comment",
      entityId: commentId,
      performedBy: updatedBy,
      performedByName: updatedBy,
      description: `${existing.authorName} edited their comment`,
    });
  }

  return updated[0] || null;
}

/**
 * Delete a comment
 */
export async function deleteComment(
  commentId: number,
  deletedBy: string,
  projectId?: number,
  issueId?: number
) {
  const existing = await getCommentById(commentId);
  if (!existing) return null;

  // Only allow deletion by author or admin
  if (existing.authorId !== deletedBy) {
    throw new Error("Unauthorized: Can only delete own comments");
  }

  // Cascade delete is handled by DB foreign keys
  if (projectId && issueId) {
    await logActivity({
      projectId,
      issueId,
      action: "deleted",
      actionType: "comment",
      entityType: "Comment",
      entityId: commentId,
      performedBy: deletedBy,
      performedByName: deletedBy,
      description: `Deleted comment`,
    });
  }

  return existing;
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
