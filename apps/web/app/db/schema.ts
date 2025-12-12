import { sql } from "drizzle-orm";
import { pgTable, serial, text, varchar, timestamp, integer, boolean, foreignKey, uniqueIndex } from "drizzle-orm/pg-core";

// Projects Table
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  status: varchar("status", { length: 50 }).default("active").notNull(), // active, archived
  color: varchar("color", { length: 7 }).default("#3B82F6"), // HEX color code
  icon: varchar("icon", { length: 50 }), // Emoji or icon name
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  createdBy: varchar("created_by", { length: 255 }),
});

// Issues Table
export const issues = pgTable(
  "issues",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: varchar("status", { length: 50 }).default("todo").notNull(), // todo, in_progress, done
    priority: varchar("priority", { length: 50 }).default("medium").notNull(), // low, medium, high, urgent
    assigneeId: varchar("assignee_id", { length: 255 }), // User ID
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
    createdBy: varchar("created_by", { length: 255 }).notNull(),
    dueDate: timestamp("due_date", { withTimezone: true }),
    order: integer("order").default(0),
  },
  (table) => ({
    projectIdIdx: foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "fk_issues_project_id",
    }),
  })
);

// Comments Table
export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    issueId: integer("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    authorId: varchar("author_id", { length: 255 }).notNull(),
    authorName: varchar("author_name", { length: 255 }).notNull(),
    authorAvatar: text("author_avatar"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    issueIdIdx: foreignKey({
      columns: [table.issueId],
      foreignColumns: [issues.id],
      name: "fk_comments_issue_id",
    }),
  })
);

// Labels Table
export const labels = pgTable(
  "labels",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    color: varchar("color", { length: 7 }).notNull(), // HEX color code
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdIdx: foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "fk_labels_project_id",
    }),
    uniqueLabel: uniqueIndex("unique_label_per_project").on(table.projectId, table.name),
  })
);

// Issue-Label Junction Table (Many-to-Many)
export const issueLabelMapping = pgTable(
  "issue_label_mapping",
  {
    id: serial("id").primaryKey(),
    issueId: integer("issue_id")
      .notNull()
      .references(() => issues.id, { onDelete: "cascade" }),
    labelId: integer("label_id")
      .notNull()
      .references(() => labels.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    issueIdIdx: foreignKey({
      columns: [table.issueId],
      foreignColumns: [issues.id],
      name: "fk_issue_label_issue_id",
    }),
    labelIdIdx: foreignKey({
      columns: [table.labelId],
      foreignColumns: [labels.id],
      name: "fk_issue_label_label_id",
    }),
  })
);

// Activity Log Table
export const activityLog = pgTable(
  "activity_log",
  {
    id: serial("id").primaryKey(),
    projectId: integer("project_id").notNull(),
    issueId: integer("issue_id"),
    action: varchar("action", { length: 50 }).notNull(), // created, updated, status_changed, priority_changed, assigned, commented, label_added, label_removed
    actionType: varchar("action_type", { length: 50 }).notNull(), // issue, project, comment, label
    entityType: varchar("entity_type", { length: 50 }).notNull(), // Project, Issue, Comment, Label
    entityId: integer("entity_id"),
    entityName: varchar("entity_name", { length: 255 }),
    changes: text("changes"), // JSON string for detailed changes
    performedBy: varchar("performed_by", { length: 255 }).notNull(),
    performedByName: varchar("performed_by_name", { length: 255 }).notNull(),
    performedByAvatar: text("performed_by_avatar"),
    description: text("description").notNull(), // "User X changed status to In Progress"
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    projectIdIdx: foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "fk_activity_project_id",
    }),
    issueIdIdx: foreignKey({
      columns: [table.issueId],
      foreignColumns: [issues.id],
      name: "fk_activity_issue_id",
    }),
  })
);

// Export all tables for Drizzle ORM
export const schema = {
  projects,
  issues,
  comments,
  labels,
  issueLabelMapping,
  activityLog,
};
