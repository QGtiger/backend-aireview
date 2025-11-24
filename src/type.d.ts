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
  status:
    | 'added'
    | 'modified'
    | 'removed'
    | 'renamed'
    | 'copied'
    | 'changed'
    | 'unchanged';
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

// 行级评论接口
interface LineComment {
  path: string;
  line: number;
  comment: string;
  severity: 'error' | 'warning' | 'info';
}

// DeepSeek API 返回的 JSON 结构
interface DeepSeekAnalysisResponse {
  analysisReport: string; // 改为字符串，包含完整的代码审查结果
  lineComments: LineComment[];
}

// 最终返回的分析结果
interface AnalysisResult {
  analysisReport: string; // 改为字符串
  lineComments: LineComment[];
  rawResponse: string;
}
