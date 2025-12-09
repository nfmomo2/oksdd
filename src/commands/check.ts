import { CommandOptions } from '../types';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { validatorService } from '../core/services/validatorService';

/**
 * check命令实现
 * @param changeId 变更标识
 * @param options 命令选项
 */
export const checkCommand = async (changeId: string, options: CommandOptions = {}) => {
  const spinner = ora('校验中...').start();
  
  try {
    // 确定变更目录路径
    const changeDir = join(process.cwd(), 'oksdd', 'changes', changeId);
    
    // 检查变更目录是否存在
    if (!existsSync(changeDir)) {
      throw new Error(`变更目录不存在：${changeId}`);
    }
    
    // 校验结果存储
    const results = {
      proposal: { valid: true, errors: [] as string[] },
      tasks: { valid: true, errors: [] as string[] },
      specs: { valid: true, errors: [] as string[] }
    };
    
    // 1. 校验proposal.md
    const proposalPath = join(changeDir, 'proposal.md');
    if (existsSync(proposalPath)) {
      const proposalContent = readFileSync(proposalPath, 'utf8');
      const proposalResult = validatorService.validateProposal(proposalContent, changeId);
      results.proposal = proposalResult;
    } else {
      results.proposal.valid = false;
      results.proposal.errors.push('proposal.md文件不存在');
    }
    
    // 2. 校验tasks.md
    const tasksPath = join(changeDir, 'tasks.md');
    if (existsSync(tasksPath)) {
      const tasksContent = readFileSync(tasksPath, 'utf8');
      const tasksResult = validatorService.validateTasks(tasksContent);
      results.tasks = tasksResult;
    } else {
      results.tasks.valid = false;
      results.tasks.errors.push('tasks.md文件不存在');
    }
    
    // 3. 校验spec目录下的所有spec.md文件
    const specDir = join(changeDir, 'spec');
    if (existsSync(specDir)) {
      const specsResult = validatorService.validateSpecs(specDir);
      results.specs = specsResult;
    } else {
      results.specs.valid = false;
      results.specs.errors.push('spec目录不存在');
    }
    
    // 输出校验结果
    spinner.stop();
    printValidationResults(results, changeId, options.strict || false);
    
    // 检查是否全部通过
    const allValid = results.proposal.valid && results.tasks.valid && results.specs.valid;
    if (!allValid) {
      process.exit(1);
    }
    
    console.log(chalk.green('\n✅ 所有校验通过！'));
  } catch (error: any) {
    spinner.fail(chalk.red(`校验失败：${error.message}`));
    process.exit(1);
  }
};

/**
 * 输出校验结果
 * @param results 校验结果
 * @param changeId 变更标识
 * @param strict 是否严格模式
 */
function printValidationResults(
  results: any,
  changeId: string,
  strict: boolean
) {
  console.log(chalk.blue(`\n📋 变更提案校验结果：${changeId}`));
  console.log(chalk.gray('-' .repeat(50)));
  
  // 输出proposal校验结果
  console.log(chalk.yellow('\n1. Proposal.md 校验：'));
  if (results.proposal.valid) {
    console.log(chalk.green('   ✅ 格式完整，内容规范'));
  } else {
    console.log(chalk.red('   ❌ 存在问题：'));
    results.proposal.errors.forEach((error: string) => {
      console.log(chalk.gray(`      - ${error}`));
    });
  }
  
  // 输出tasks校验结果
  console.log(chalk.yellow('\n2. Tasks.md 校验：'));
  if (results.tasks.valid) {
    console.log(chalk.green('   ✅ 任务分类完整，格式规范'));
  } else {
    console.log(chalk.red('   ❌ 存在问题：'));
    results.tasks.errors.forEach((error: string) => {
      console.log(chalk.gray(`      - ${error}`));
    });
  }
  
  // 输出specs校验结果
  console.log(chalk.yellow('\n3. Spec 文档校验：'));
  if (results.specs.valid) {
    console.log(chalk.green('   ✅ 关键字正确，Scenario完整'));
  } else {
    console.log(chalk.red('   ❌ 存在问题：'));
    results.specs.errors.forEach((error: string) => {
      console.log(chalk.gray(`      - ${error}`));
    });
  }
  
  console.log(chalk.gray('\n' + '-' .repeat(50)));
}