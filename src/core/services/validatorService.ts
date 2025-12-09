import { readdirSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';
import fg from 'fast-glob';
import { ValidationResult } from '../../types';

/**
 * 验证器服务，负责校验各类文档的格式和内容规范性
 */
export class ValidatorService {
  /**
   * 校验proposal.md
   * @param content 文件内容
   * @param changeId 变更标识
   */
  validateProposal(content: string, changeId: string): ValidationResult {
    const errors: string[] = [];
    
    // 1. 校验变更标题格式
    if (!/^# Change:/.test(content)) {
      errors.push('变更标题格式错误，应为：# Change: [简明描述]');
    }
    
    // 2. 校验Why章节
    if (!/## Why/.test(content)) {
      errors.push('缺少Why章节');
    }
    
    // 3. 校验What Changes章节
    if (!/## What Changes/.test(content)) {
      errors.push('缺少What Changes章节');
    }
    
    // 4. 校验Impact章节
    if (!/## Impact/.test(content)) {
      errors.push('缺少Impact章节');
    }
    
    // 5. 检查内容是否为空
    const sections = content.split(/## /);
    for (const section of sections) {
      const lines = section.trim().split('\n');
      if (lines.length <= 1) {
        continue;
      }
      
      const sectionName = lines[0].trim();
      const sectionContent = lines.slice(1).join('\n').trim();
      
      if (['Why', 'What Changes', 'Impact'].includes(sectionName) && sectionContent === '') {
        errors.push(`${sectionName}章节内容不能为空`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 校验tasks.md
   * @param content 文件内容
   */
  validateTasks(content: string): ValidationResult {
    const errors: string[] = [];
    
    // 1. 校验任务分类覆盖度
    const requiredCategories = [
      '1. 需求分析',
      '2. 方案设计',
      '3. 开发实现',
      '4. 测试验证'
    ];
    
    for (const category of requiredCategories) {
      if (!content.includes(`## ${category}`)) {
        errors.push(`缺少任务分类：${category}`);
      }
    }
    
    // 2. 校验任务项格式
    const taskLines = content.split('\n').filter(line => line.trim().startsWith('- ['));
    for (const line of taskLines) {
      if (!/^- \[\s?\] .+ - 可交付物：/.test(line)) {
        errors.push(`任务项格式错误：${line.trim()}`);
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 校验spec目录下的所有spec.md文件
   * @param specDir spec目录路径
   */
  validateSpecs(specDir: string): ValidationResult {
    const errors: string[] = [];
    
    // 获取所有spec.md文件
    const specFiles = fg.sync('**/*.md', { cwd: specDir, absolute: true });
    
    if (specFiles.length === 0) {
      errors.push('spec目录下没有找到spec.md文件');
      return { valid: false, errors };
    }
    
    // 逐个校验spec.md文件
    for (const specFile of specFiles) {
      const content = readFileSync(specFile, 'utf8');
      const specErrors = this.validateSpec(content, specFile);
      if (specErrors.length > 0) {
        errors.push(...specErrors.map(err => `${specFile}: ${err}`));
      }
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 校验单个spec.md文件
   * @param content 文件内容
   * @param filePath 文件路径
   */
  private validateSpec(content: string, filePath: string): string[] {
    const errors: string[] = [];
    
    // 1. 校验关键字正确性
    const validKeywords = ['ADDED', 'MODIFIED', 'REMOVED'];
    const keywordRegex = /^# (\w+)/gm;
    let match;
    const foundKeywords: string[] = [];
    
    while ((match = keywordRegex.exec(content)) !== null) {
      const keyword = match[1];
      if (!validKeywords.includes(keyword)) {
        errors.push(`无效的关键字：${keyword}，应为ADDED、MODIFIED或REMOVED`);
      }
      foundKeywords.push(keyword);
    }
    
    if (foundKeywords.length === 0) {
      errors.push('缺少关键字（ADDED、MODIFIED或REMOVED）');
    }
    
    // 2. 校验Requirement格式
    const requirementRegex = /^## ### Requirement: /gm;
    let requirementMatch;
    const requirementPositions: number[] = [];
    
    while ((requirementMatch = requirementRegex.exec(content)) !== null) {
      requirementPositions.push(requirementMatch.index);
    }
    
    if (requirementPositions.length === 0) {
      errors.push('缺少Requirement章节');
    }
    
    // 3. 校验每个Requirement对应的Scenario
    const scenarioRegex = /^#### Scenario: /gm;
    let scenarioMatch;
    const scenarioPositions: number[] = [];
    
    while ((scenarioMatch = scenarioRegex.exec(content)) !== null) {
      scenarioPositions.push(scenarioMatch.index);
    }
    
    // 确保每个Requirement至少有一个Scenario
    if (requirementPositions.length > scenarioPositions.length) {
      errors.push('每个Requirement必须对应至少一个Scenario');
    }
    
    // 4. 校验Scenario内容完整性
    const scenarioLines = content.split('\n').filter(line => line.trim().startsWith('#### Scenario:'));
    for (const line of scenarioLines) {
      const scenarioIndex = content.indexOf(line);
      const scenarioContent = content.substring(scenarioIndex).split(/#### Scenario:|# |## /)[1] || '';
      
      if (!scenarioContent.includes('**WHEN**')) {
        errors.push(`Scenario缺少WHEN条件：${line.trim()}`);
      }
      
      if (!scenarioContent.includes('**THEN**')) {
        errors.push(`Scenario缺少THEN结果：${line.trim()}`);
      }
    }
    
    return errors;
  }
}

// 单例实例
export const validatorService = new ValidatorService();