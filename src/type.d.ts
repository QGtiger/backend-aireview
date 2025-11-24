interface RepositoryInfo {
  name: string;
  fullName: string;
  owner: string;
  url: string;
  platform: 'github' | 'gitlab';
}

interface CommitInfo {
  sha: string;
  message: string;
  author: {
    name: string;
    email: string;
  };
  url: string;
  diff: string;
  files: FileChange[];
}

interface FileChange {
  filename: string;
  status: 'added' | 'modified' | 'removed' | 'renamed';
  additions: number;
  deletions: number;
  patch?: string;
}

interface CommitPayload {
  id: string;
  message: string;
  timestamp: string;
  url: string;
  author: {
    name: string;
    email: string;
  };
  added: string[];
  removed: string[];
  modified: string[];
}

interface PushEventPayload {
  before: string;
  after: string;
  ref: string;
  repository: {
    id: number;
    name: string;
    full_name: string;
    owner: {
      name: string;
    };
    html_url: string;
  };
  commits: CommitPayload[];
  head_commit: CommitPayload;
  pusher: {
    name: string;
    email: string;
  };
}
