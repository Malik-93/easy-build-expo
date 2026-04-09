export enum BuildStatus {
  QUEUED = 'QUEUED',
  RUNNING = 'RUNNING',
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export enum BuildProfile {
  development = 'development',
  preview = 'preview',
  production = 'production',
}

export interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  githubLogin?: string;
  role: string;
}

export interface Project {
  id: string;
  slug: string;
  name: string;
  packageName?: string;
  githubRepo?: string;
  ownerId: string;
  createdAt: string;
}

export interface Build {
  id: string;
  projectId: string;
  profile: BuildProfile;
  platform: string;
  status: BuildStatus;
  triggeredBy?: string;
  artifactUrl?: string;
  durationMs?: number;
  startedAt?: string;
  completedAt?: string;
  createdAt: string;
}
