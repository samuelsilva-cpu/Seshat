import { eq, and, desc } from "drizzle-orm";
import { db } from "../db/client";
import { labels, issueLabelMapping, activityLog } from "../db/schema";
import type { labels as LabelType } from "../db/schema";

export type Label = typeof LabelType.$inferSelect;
export type NewLabel = typeof LabelType.$inferInsert;

/**
 * Create a new label
 */
export async function createLabel(
  projectId: number,
  name: string,
  color: string,
  createdBy: string,
  data?: {
    description?: string;
  }
) {
  const newLabel = await db.insert(labels).values({
    projectId,
    name,
    color,
    description: data?.description,
  }).returning();

  if (newLabel.length > 0) {
    await logActivity({
      projectId,
      action: "created",
      actionType: "label",
      entityType: "Label",
      entityId: newLabel[0].id,
      entityName: name,
      performedBy: createdBy,
      performedByName: createdBy,
      description: `Created label "${name}"`,
    });
  }

  return newLabel[0];
}

/**
 * Get all labels for a project
 */
export async function getProjectLabels(projectId: number) {
  return await db.select()
    .from(labels)
    .where(eq(labels.projectId, projectId))
    .orderBy(desc(labels.createdAt));
}

/**
 * Get a single label by ID
 */
export async function getLabelById(labelId: number) {
  const result = await db.select()
    .from(labels)
    .where(eq(labels.id, labelId))
    .limit(1);
  return result[0] || null;
}

/**
 * Update a label
 */
export async function updateLabel(
  labelId: number,
  data: {
    name?: string;
    color?: string;
    description?: string;
  },
  updatedBy: string
) {
  const existing = await getLabelById(labelId);
  if (!existing) return null;

  const updated = await db.update(labels)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(labels.id, labelId))
    .returning();

  if (updated.length > 0) {
    await logActivity({
      projectId: existing.projectId,
      action: "updated",
      actionType: "label",
      entityType: "Label",
      entityId: labelId,
      entityName: updated[0].name,
      performedBy: updatedBy,
      performedByName: updatedBy,
      description: `Updated label "${updated[0].name}"`,
      changes: JSON.stringify(data),
    });
  }

  return updated[0] || null;
}

/**
 * Delete a label
 */
export async function deleteLabel(labelId: number, deletedBy: string) {
  const existing = await getLabelById(labelId);
  if (!existing) return null;

  // Delete mapping entries first
  await db.delete(issueLabelMapping).where(eq(issueLabelMapping.labelId, labelId));

  // Then delete label
  // Cascade delete is handled by DB foreign keys

  if (existing) {
    await logActivity({
      projectId: existing.projectId,
      action: "deleted",
      actionType: "label",
      entityType: "Label",
      entityId: labelId,
      entityName: existing.name,
      performedBy: deletedBy,
      performedByName: deletedBy,
      description: `Deleted label "${existing.name}"`,
    });
  }

  return existing;
}

/**
 * Add label to issue
 */
export async function addLabelToIssue(
  issueId: number,
  labelId: number,
  projectId: number,
  userId: string
) {
  const newMapping = await db.insert(issueLabelMapping).values({
    issueId,
    labelId,
  }).returning();

  if (newMapping.length > 0) {
    const label = await getLabelById(labelId);
    await logActivity({
      projectId,
      issueId,
      action: "label_added",
      actionType: "issue",
      entityType: "Issue",
      entityId: issueId,
      entityName: label?.name,
      performedBy: userId,
      performedByName: userId,
      description: `Added label "${label?.name}" to issue`,
    });
  }

  return newMapping[0];
}

/**
 * Remove label from issue
 */
export async function removeLabelFromIssue(
  issueId: number,
  labelId: number,
  projectId: number,
  userId: string
) {
  const label = await getLabelById(labelId);

  await db.delete(issueLabelMapping).where(
    and(
      eq(issueLabelMapping.issueId, issueId),
      eq(issueLabelMapping.labelId, labelId)
    )
  );

  if (label) {
    await logActivity({
      projectId,
      issueId,
      action: "label_removed",
      actionType: "issue",
      entityType: "Issue",
      entityId: issueId,
      entityName: label.name,
      performedBy: userId,
      performedByName: userId,
      description: `Removed label "${label.name}" from issue`,
    });
  }

  return label;
}

/**
 * Get labels for an issue
 */
export async function getIssueLabels(issueId: number) {
  const mappings = await db.select()
    .from(issueLabelMapping)
    .where(eq(issueLabelMapping.issueId, issueId));

  const labelIds = mappings.map(m => m.labelId);
  if (labelIds.length === 0) return [];

  return await db.select()
    .from(labels)
    .where(eq(labels.id, labelIds[0]));
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
