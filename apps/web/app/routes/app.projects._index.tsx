import { useState } from "react";
import { Link } from "react-router";
import type { Route } from "../+types/root";
import { AppLayout } from "../components/layout/AppLayout";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { getAllProjects, createProject } from "../models/project.server";

export async function loader() {
  try {
    const projects = await getAllProjects();
    return { projects };
  } catch (error) {
    console.error("Failed to load projects:", error);
    return { projects: [] };
  }
}

export async function action({ request }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return { error: "Method not allowed" };
  }

  const formData = await request.formData();
  const name = formData.get("name") as string;
  const slug = formData.get("slug") as string;

  if (!name || !slug) {
    return { error: "Name and slug are required" };
  }

  try {
    const project = await createProject(name, slug, "current-user");
    return { success: true, project };
  } catch (error) {
    return { error: "Failed to create project" };
  }
}

export default function ProjectsPage({ loaderData, actionData }: Route.ComponentProps) {
  const projects = loaderData?.projects || [];
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", slug: "" });

  const handleCreateProject = (e: React.FormEvent) => {
    e.preventDefault();
    // Form will be submitted via action
    setFormData({ name: "", slug: "" });
    setIsCreateModalOpen(false);
  };

  return (
    <AppLayout
      activeRoute="projects"
      topbarTitle="Projects"
      topbarSubtitle={`${projects.length} project${projects.length !== 1 ? "s" : ""}`}
      topbarActions={
        <Button
          variant="primary"
          onClick={() => setIsCreateModalOpen(true)}
        >
          + New Project
        </Button>
      }
    >
      <div className="h-full p-6 space-y-6">
        {projects.length === 0 ? (
          <Card variant="glass" padding="lg" className="text-center py-12">
            <div className="space-y-4">
              <p className="text-lg font-medium text-slate-900 dark:text-slate-100">
                No projects yet
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                Create your first project to get started
              </p>
              <Button
                variant="primary"
                onClick={() => setIsCreateModalOpen(true)}
              >
                Create Project
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <Link key={project.id} to={`/app/projects/${project.id}`}>
                <Card variant="glass" padding="lg" interactive className="h-full">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {project.description}
                          </p>
                        )}
                      </div>
                      {project.icon && (
                        <span className="text-2xl">{project.icon}</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <div
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: project.color }}
                      />
                      <span className="text-xs text-slate-500 dark:text-slate-400">
                        {project.slug}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create New Project"
        size="md"
        footer={
          <>
            <Button variant="ghost" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" form="create-project-form">
              Create
            </Button>
          </>
        }
      >
        <form
          id="create-project-form"
          onSubmit={handleCreateProject}
          className="space-y-4"
        >
          <Input
            label="Project Name"
            placeholder="My Project"
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
          />
          <Input
            label="Project Slug"
            placeholder="my-project"
            value={formData.slug}
            onChange={(e) =>
              setFormData({ ...formData, slug: e.target.value })
            }
            helperText="Used in URLs and identifiers"
          />
        </form>
      </Modal>
    </AppLayout>
  );
}
