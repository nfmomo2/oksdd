#!/usr/bin/env node

import { Command } from 'commander';
import chalk from 'chalk';
import { initCommand } from '../commands/init';
import { checkCommand } from '../commands/check';
import { archiveCommand } from '../commands/archive';

const program = new Command();

program
  .name('oksdd')
  .description('SDD实践辅助工具，支持规范驱动开发的流程管理和文档校验')
  .version('1.0.0', '-v, --version')
  .helpOption('-h, --help', '显示帮助信息');

// 初始化命令
program
  .command('init')
  .description('初始化项目或创建新变更提案')
  .argument('[change-id]', '变更标识，格式：动词前缀-描述性名称')
  .option('--path <path>', '指定初始化路径，默认项目根目录')
  .option('--update', '更新已存在的OKSDD.md及目录结构')
  .action(initCommand);

// 检查命令
program
  .command('check')
  .description('校验提案文档的格式与内容规范性')
  .argument('<change-id>', '变更标识，用于指定要校验的提案')
  .option('--strict', '启用严格校验模式')
  .action(checkCommand);

// 规范匹配度校验命令
program
  .command('check-spec')
  .description('校验代码实现与spec需求的一致性')
  .argument('<change-id>', '变更标识，用于指定要校验的提案')
  .option('--strict', '启用严格校验模式')
  .action((changeId: string, options: any) => {
    // 目前仅实现框架，后续可扩展代码扫描逻辑
    console.log(chalk.yellow(`规范匹配度校验功能正在开发中: ${changeId}`));
  });

// 归档命令
program
  .command('archive')
  .description('归档变更提案，迁移文档并更新主规范')
  .argument('<change-id>', '变更标识，用于指定要归档的提案')
  .option('--dry-run', '模拟归档操作，不实际执行')
  .action(archiveCommand);

// 处理未识别的命令
program.on('command:*', (operands: string[]) => {
  console.error(chalk.red(`错误：未识别的命令 '${operands[0]}'`));
  console.error(chalk.yellow('请使用 --help 查看可用命令'));
  process.exit(1);
});

// 执行命令
program.parseAsync(process.argv).catch((error: Error) => {
  console.error(chalk.red(`执行命令时出错：${error.message}`));
  process.exit(1);
});