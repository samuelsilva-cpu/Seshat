import { eq, desc } from "drizzle-orm";
import { db } from "../db/client";
import { projects, activityLog } from "../db/schema";
import type { projects as ProjectType } from "../db/schema";

export type Project = typeof ProjectType.$inferSelect;
export type NewProject = typeof ProjectType.$inferInsert;

/**
 * Create a new project
 */
export async function createProject(
  name: string,
  slug: string,
  createdBy: string,
  data?: {
    description?: string;
    color?: string;
    icon?: string;
  }
) {
  const newProject = await db.insert(projects).values({
    name,
    slug,
    description: data?.description,
    color: data?.color || "#3B82F6",
    icon: data?.icon,
    createdBy,
    status: "active",
  }).returning();

  if (newProject.length > 0) {
    // Log activity
    await logActivity({
      projectId: newProject[0].id,
      action: "created",
      actionType: "project",
      entityType: "Project",
      entityId: newProject[0].id,
      entityName: name,
      performedBy: createdBy,
      performedByName: createdBy,
      description: `Created project "${name}"`,
    });
  }

  return newProject[0];
}

/**
 * Get all projects
 */
export async function getAllProjects() {
  return await db.select().from(projects).orderBy(desc(projects.createdAt));
}

/**
 * Get a single project by ID
 */
export async function getProjectById(projectId: number) {
  const result = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  return result[0] || null;
}

/**
 * Get a single project by slug
 */
export async function getProjectBySlug(slug: string) {
  const result = await db.select().from(projects).where(eq(projects.slug, slug)).limit(1);
  return result[0] || null;
}

/**
 * Update a project
 */
export async function updateProject(
  projectId: number,
  data: {
    name?: string;
    description?: string;
    color?: string;
    icon?: string;
    status?: string;
  },
  updatedBy: string
) {
  const existing = await getProjectById(projectId);
  if (!existing) return null;

  const updated = await db.update(projects)
    .set({
      ...data,
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();

  if (updated.length > 0) {
    const changes = JSON.stringify(data);
    await logActivity({
      projectId,
      action: "updated",
      actionType: "project",
      entityType: "Project",
      entityId: projectId,
      entityName: updated[0].name,
      performedBy: updatedBy,
      performedByName: updatedBy,
      description: `Updated project "${updated[0].name}"`,
      changes,
    });
  }

  return updated[0] || null;
}

/**
 * Delete a project (soft delete via status)
 */
export async function deleteProject(projectId: number, deletedBy: string) {
  const existing = await getProjectById(projectId);
  if (!existing) return null;

  const updated = await db.update(projects)
    .set({
      status: "archived",
      updatedAt: new Date(),
    })
    .where(eq(projects.id, projectId))
    .returning();

  if (updated.length > 0) {
    await logActivity({
      projectId,
      action: "updated",
      actionType: "project",
      entityType: "Project",
      entityId: projectId,
      entityName: updated[0].name,
      performedBy: deletedBy,
      performedByName: deletedBy,
      description: `Archived project "${updated[0].name}"`,
    });
  }

  return updated[0] || null;
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
