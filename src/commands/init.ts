import { CommandOptions } from '../types';
import { existsSync, mkdirSync, writeFileSync, copyFileSync } from 'fs';
import { join, resolve } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { templateService } from '../core/services/templateService';

/**
 * init命令实现
 * @param changeId 变更标识，可选
 * @param options 命令选项
 */
export const initCommand = async (changeId?: string, options: CommandOptions = {}) => {
  const spinner = ora('初始化中...').start();
  
  try {
    // 确定初始化路径
    const initPath = options.path ? resolve(options.path) : process.cwd();
    
    if (changeId) {
      // 场景1：新增变更提案
      await initChangeProposal(initPath, changeId);
      spinner.succeed(chalk.green(`变更提案初始化成功：${changeId}`));
    } else {
      // 场景2：项目首次初始化
      await initProject(initPath, options.update || false);
      spinner.succeed(chalk.green('项目初始化成功'));
    }
  } catch (error: any) {
    spinner.fail(chalk.red(`初始化失败：${error.message}`));
    process.exit(1);
  }
};

/**
 * 初始化项目
 * @param initPath 初始化路径
 * @param update 是否更新现有配置
 */
async function initProject(initPath: string, update: boolean) {
  // 创建oksdd目录结构
  const oksddDir = join(initPath, 'oksdd');
  const changesDir = join(oksddDir, 'changes');
  const specsDir = join(oksddDir, 'specs');
  const archiveDir = join(oksddDir, 'changes', 'archive');
  
  // 创建目录
  mkdirSync(changesDir, { recursive: true });
  mkdirSync(specsDir, { recursive: true });
  mkdirSync(archiveDir, { recursive: true });
  
  // 复制或更新OKSDD.md文件
  const oksddMdPath = join(initPath, 'OKSDD.md');
  const currentOksddMdPath = join(__dirname, '..', '..', 'OKSDD.md');
  
  if (!existsSync(oksddMdPath) || update) {
    if (existsSync(currentOksddMdPath)) {
      copyFileSync(currentOksddMdPath, oksddMdPath);
    } else {
      // 如果当前目录没有OKSDD.md，使用模板生成
      writeFileSync(oksddMdPath, templateService.getOksddTemplate());
    }
  }
  
  // 生成archive-history.md文件
  const archiveHistoryPath = join(oksddDir, 'archive-history.md');
  if (!existsSync(archiveHistoryPath)) {
    writeFileSync(archiveHistoryPath, templateService.getArchiveHistoryTemplate());
  }
  
  console.log(chalk.blue('项目初始化完成，创建了以下目录和文件：'));
  console.log(chalk.gray('- oksdd/'));
  console.log(chalk.gray('  - changes/           # 变更文档目录'));
  console.log(chalk.gray('    - archive/         # 归档目录'));
  console.log(chalk.gray('  - specs/             # 主规范目录'));
  console.log(chalk.gray('  - archive-history.md # 归档记录'));
  console.log(chalk.gray('- OKSDD.md             # 工具规范文档'));
}

/**
 * 初始化变更提案
 * @param initPath 初始化路径
 * @param changeId 变更标识
 */
async function initChangeProposal(initPath: string, changeId: string) {
  // 验证changeId格式
  if (!/^[a-z]+-[a-z0-9-]+$/.test(changeId)) {
    throw new Error('change-id格式错误，应为：动词前缀-描述性名称，例如 add-user-login-otp');
  }
  
  // 创建变更目录结构
  const changesDir = join(initPath, 'oksdd', 'changes');
  const changeDir = join(changesDir, changeId);
  const specDir = join(changeDir, 'spec');
  
  // 检查change-id是否已存在
  if (existsSync(changeDir)) {
    throw new Error(`变更标识 ${changeId} 已存在，请使用唯一的change-id`);
  }
  
  // 创建目录
  mkdirSync(specDir, { recursive: true });
  
  // 生成文档模板
  const proposalPath = join(changeDir, 'proposal.md');
  const tasksPath = join(changeDir, 'tasks.md');
  
  writeFileSync(proposalPath, templateService.getProposalTemplate(changeId));
  writeFileSync(tasksPath, templateService.getTasksTemplate());
  
  console.log(chalk.blue('变更提案初始化完成，创建了以下目录和文件：'));
  console.log(chalk.gray(`- oksdd/changes/${changeId}/`));
  console.log(chalk.gray(`  - proposal.md        # 变更提案文档`));
  console.log(chalk.gray(`  - tasks.md           # 任务清单`));
  console.log(chalk.gray(`  - spec/              # 规范增量目录`));
  console.log(chalk.blue(`\n下一步：`));
  console.log(chalk.gray(`1. 编辑 proposal.md，说明变更背景、内容和影响`));
  console.log(chalk.gray(`2. 编辑 tasks.md，拆解具体执行步骤`));
  console.log(chalk.gray(`3. 在 spec/ 目录下创建模块规范文档`));
}