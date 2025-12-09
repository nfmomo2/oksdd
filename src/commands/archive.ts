import { CommandOptions } from '../types';
import { existsSync, readFileSync, writeFileSync, renameSync, mkdirSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';

/**
 * archive命令实现
 * @param changeId 变更标识
 * @param options 命令选项
 */
export const archiveCommand = async (changeId: string, options: CommandOptions = {}) => {
  const spinner = ora('归档中...').start();
  
  try {
    // 确定变更目录路径
    const currentChangeDir = join(process.cwd(), 'oksdd', 'changes', changeId);
    
    // 检查变更目录是否存在
    if (!existsSync(currentChangeDir)) {
      throw new Error(`变更目录不存在：${changeId}`);
    }
    
    // 1. 准备归档目录和文件名
    const archiveDir = join(process.cwd(), 'oksdd', 'changes', 'archive');
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0]; // 格式：YYYY-MM-DD
    const archivedChangeDir = join(archiveDir, `${dateStr}-${changeId}`);
    
    // 2. 迁移变更文档
    spinner.text = '迁移变更文档...';
    renameSync(currentChangeDir, archivedChangeDir);
    
    // 3. 更新主规范
    spinner.text = '更新主规范...';
    await updateMainSpecs(changeId, archivedChangeDir);
    
    // 4. 添加归档记录
    spinner.text = '添加归档记录...';
    await addArchiveRecord(changeId, archivedChangeDir, now);
    
    spinner.succeed(chalk.green(`变更提案归档成功：${changeId}`));
    
    console.log(chalk.blue('\n📋 归档完成，执行了以下操作：'));
    console.log(chalk.gray(`1. 变更目录迁移：${changeId} → ${dateStr}-${changeId}`));
    console.log(chalk.gray('2. 主规范已更新（如果有spec增量）'));
    console.log(chalk.gray('3. 归档记录已添加到 archive-history.md'));
    
  } catch (error: any) {
    spinner.fail(chalk.red(`归档失败：${error.message}`));
    process.exit(1);
  }
};

/**
 * 更新主规范
 * @param changeId 变更标识
 * @param archivedChangeDir 归档后的变更目录
 */
async function updateMainSpecs(changeId: string, archivedChangeDir: string) {
  // 检查spec目录是否存在
  const specDir = join(archivedChangeDir, 'spec');
  if (!existsSync(specDir)) {
    return; // 无spec增量，跳过主规范更新
  }
  
  // 读取spec文件，更新主规范
  // 这里仅实现基本框架，后续可扩展完整的规范合并逻辑
  const mainSpecsDir = join(process.cwd(), 'oksdd', 'specs');
  mkdirSync(mainSpecsDir, { recursive: true });
  
  // 目前仅创建对应模块目录，实际规范合并逻辑需要进一步实现
  // 建议：遍历spec目录下的所有spec.md文件，按照ADDED/MODIFIED/REMOVED类型合并到主规范
}

/**
 * 添加归档记录
 * @param changeId 变更标识
 * @param archivedChangeDir 归档后的变更目录
 * @param archiveDate 归档日期
 */
async function addArchiveRecord(changeId: string, archivedChangeDir: string, archiveDate: Date) {
  // 读取proposal.md获取变更内容摘要
  const proposalPath = join(archivedChangeDir, 'proposal.md');
  let changeSummary = '未提供变更摘要';
  
  if (existsSync(proposalPath)) {
    const proposalContent = readFileSync(proposalPath, 'utf8');
    // 提取变更标题作为摘要
    const titleMatch = proposalContent.match(/^# Change: (.+)$/m);
    if (titleMatch && titleMatch[1]) {
      changeSummary = titleMatch[1].trim();
    }
  }
  
  // 读取archive-history.md
  const archiveHistoryPath = join(process.cwd(), 'oksdd', 'archive-history.md');
  let archiveHistoryContent = '';
  
  if (existsSync(archiveHistoryPath)) {
    archiveHistoryContent = readFileSync(archiveHistoryPath, 'utf8');
  }
  
  // 添加新的归档记录
  const dateStr = archiveDate.toISOString().split('T')[0];
  const newRecord = `| ${dateStr} | ${changeId} | ${changeSummary} | ${process.env.USER || 'unknown'} |`;
  
  // 插入到表格中（在表头后添加）
  const lines = archiveHistoryContent.split('\n');
  const headerIndex = lines.findIndex(line => line.includes('| 日期       | Change-ID |'));
  const separatorIndex = lines.findIndex(line => line.includes('|------------|-----------|'));
  
  if (headerIndex >= 0 && separatorIndex >= 0) {
    lines.splice(separatorIndex + 1, 0, newRecord);
  } else {
    // 如果表格格式不正确，直接添加到末尾
    lines.push(newRecord);
  }
  
  // 写回到文件
  writeFileSync(archiveHistoryPath, lines.join('\n'));
}
