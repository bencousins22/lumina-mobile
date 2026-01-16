"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Plus,
  FolderKanban,
  Search,
  MoreVertical,
  FileText,
  Key,
  Brain,
  Clock,
  Trash2,
  Settings2,
  Play,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

interface Project {
  id: string
  name: string
  description: string
  memoriesCount: number
  secretsCount: number
  filesCount: number
  lastActive: Date
  isActive: boolean
}

const mockProjects: Project[] = [
  {
    id: "1",
    name: "Data Analysis",
    description: "Machine learning and data visualization projects",
    memoriesCount: 24,
    secretsCount: 3,
    filesCount: 12,
    lastActive: new Date(Date.now() - 3600000),
    isActive: true,
  },
  {
    id: "2",
    name: "Web Development",
    description: "Frontend and backend web applications",
    memoriesCount: 18,
    secretsCount: 5,
    filesCount: 28,
    lastActive: new Date(Date.now() - 86400000),
    isActive: false,
  },
  {
    id: "3",
    name: "Automation Scripts",
    description: "System automation and DevOps tasks",
    memoriesCount: 9,
    secretsCount: 2,
    filesCount: 7,
    lastActive: new Date(Date.now() - 172800000),
    isActive: false,
  },
]

function ProjectsPanel() {
  const [searchQuery, setSearchQuery] = useState("")
  const [projects] = useState<Project[]>(mockProjects)

  const filteredProjects = projects.filter(
    (project) =>
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <header className="px-4 py-3 border-b border-border bg-card/50 backdrop-blur-sm safe-top">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h1 className="text-lg font-semibold">Projects</h1>
            <p className="text-xs text-muted-foreground">
              {projects.length} project{projects.length !== 1 ? "s" : ""}
            </p>
          </div>
          <Button size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">New Project</span>
          </Button>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10 bg-input/50"
          />
        </div>
      </header>

      <div className="flex-1 scrollbar-thin overflow-y-auto">
        <div className="p-4 space-y-3">
          {filteredProjects.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <FolderKanban className="h-8 w-8 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">No projects found</p>
                <p className="text-xs text-muted-foreground/70 mt-1">Create a project to organize your work</p>
                <Button variant="outline" size="sm" className="mt-4 gap-2 bg-transparent">
                  <Plus className="h-4 w-4" />
                  Create Project
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredProjects.map((project) => (
              <Card
                key={project.id}
                className={cn(
                  "border-border/50 transition-colors",
                  project.isActive && "border-primary/50 bg-primary/5",
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-lg flex items-center justify-center",
                          project.isActive ? "bg-primary/10 border border-primary/20" : "bg-muted",
                        )}
                      >
                        <FolderKanban
                          className={cn("h-5 w-5", project.isActive ? "text-primary" : "text-muted-foreground")}
                        />
                      </div>
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          {project.name}
                          {project.isActive && (
                            <Badge variant="secondary" className="text-[10px] font-normal">
                              Active
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="text-xs mt-0.5">{project.description}</CardDescription>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Project options</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Play className="h-4 w-4 mr-2" />
                          Set as Active
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Settings2 className="h-4 w-4 mr-2" />
                          Configure
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <Brain className="h-4 w-4 text-chart-1" />
                      <div>
                        <p className="text-sm font-medium">{project.memoriesCount}</p>
                        <p className="text-[10px] text-muted-foreground">Memories</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <Key className="h-4 w-4 text-chart-2" />
                      <div>
                        <p className="text-sm font-medium">{project.secretsCount}</p>
                        <p className="text-[10px] text-muted-foreground">Secrets</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                      <FileText className="h-4 w-4 text-chart-3" />
                      <div>
                        <p className="text-sm font-medium">{project.filesCount}</p>
                        <p className="text-[10px] text-muted-foreground">Files</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 mt-3 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Last active: {project.lastActive.toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}


export default ProjectsPanel
