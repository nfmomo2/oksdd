/**
 * 命令选项类型
 */
export interface CommandOptions {
  path?: string;
  update?: boolean;
  strict?: boolean;
  [key: string]: any;
}

/**
 * 配置类型
 */
export interface Config {
  templates: {
    proposal: string;
    tasks: string;
    spec: string;
  };
  validation: {
    strict: boolean;
  };
  paths: {
    oksddDir: string;
    changesDir: string;
    specsDir: string;
    archiveDir: string;
  };
}

/**
 * 验证结果类型
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * 变更信息类型
 */
export interface ChangeInfo {
  changeId: string;
  title: string;
  status: 'proposed' | 'approved' | 'implemented' | 'archived';
  createdAt: string;
  updatedAt: string;
}