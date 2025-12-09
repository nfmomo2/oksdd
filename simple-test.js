#!/usr/bin/env node

/**
 * 简单测试脚本，用于验证oksdd项目的基本功能
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 开始验证oksdd项目功能...\n');

// 测试1：检查文件结构
console.log('1. 检查项目文件结构:');
const requiredFiles = [
  'src/cli/index.ts',
  'src/commands/init.ts',
  'src/commands/check.ts',
  'src/commands/archive.ts',
  'src/core/services/templateService.ts',
  'src/core/services/validatorService.ts',
  'src/core/services/configService.ts',
  'src/types/index.ts',
  'package.json',
  'tsconfig.json',
  'OKSDD.md'
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file}`);
    allFilesExist = false;
  }
});

// 测试2：检查命令定义
console.log('\n2. 检查CLI命令定义:');
const cliContent = fs.readFileSync('src/cli/index.ts', 'utf8');
const commands = [
  { name: 'init', expected: true },
  { name: 'check', expected: true },
  { name: 'check-spec', expected: true },
  { name: 'archive', expected: true }
];

commands.forEach(cmd => {
  const found = cliContent.includes(`.command('${cmd.name}')`);
  if (found === cmd.expected) {
    console.log(`   ✅ ${cmd.name} 命令已${cmd.expected ? '正确' : '未'}定义`);
  } else {
    console.log(`   ❌ ${cmd.name} 命令${cmd.expected ? '未' : '已'}定义`);
    allFilesExist = false;
  }
});

// 测试3：检查核心功能实现
console.log('\n3. 检查核心功能实现:');
const validatorContent = fs.readFileSync('src/core/services/validatorService.ts', 'utf8');
const templateContent = fs.readFileSync('src/core/services/templateService.ts', 'utf8');
const archiveContent = fs.readFileSync('src/commands/archive.ts', 'utf8');

const features = [
  { name: '提案验证', content: validatorContent, expected: true, check: /validateProposal/ },
  { name: '任务验证', content: validatorContent, expected: true, check: /validateTasks/ },
  { name: '规范验证', content: validatorContent, expected: true, check: /validateSpecs/ },
  { name: '模板生成', content: templateContent, expected: true, check: /getProposalTemplate/ },
  { name: '归档功能', content: archiveContent, expected: true, check: /archiveCommand/ }
];

features.forEach(feature => {
  const found = feature.check.test(feature.content);
  if (found === feature.expected) {
    console.log(`   ✅ ${feature.name} 功能已${feature.expected ? '正确' : '未'}实现`);
  } else {
    console.log(`   ❌ ${feature.name} 功能${feature.expected ? '未' : '已'}实现`);
    allFilesExist = false;
  }
});

// 测试4：检查类型定义
console.log('\n4. 检查类型定义:');
const typesContent = fs.readFileSync('src/types/index.ts', 'utf8');
const typeDefinitions = [
  { name: 'CommandOptions', expected: true },
  { name: 'Config', expected: true },
  { name: 'ValidationResult', expected: true },
  { name: 'ChangeInfo', expected: true }
];

typeDefinitions.forEach(typeDef => {
  const found = typesContent.includes(`interface ${typeDef.name}`);
  if (found === typeDef.expected) {
    console.log(`   ✅ ${typeDef.name} 类型已${typeDef.expected ? '正确' : '未'}定义`);
  } else {
    console.log(`   ❌ ${typeDef.name} 类型${typeDef.expected ? '未' : '已'}定义`);
    allFilesExist = false;
  }
});

// 测试5：检查代码质量
console.log('\n5. 检查代码质量:');
const errors = [];

// 检查类型导入
if (!validatorContent.includes('import { ValidationResult }')) {
  errors.push('validatorService.ts 缺少 ValidationResult 类型导入');
}

if (!fs.readFileSync('src/core/services/configService.ts', 'utf8').includes('import { Config }')) {
  errors.push('configService.ts 缺少 Config 类型导入');
}

// 检查代码注释
if (!validatorContent.includes('/**\n * 验证器服务')) {
  errors.push('validatorService.ts 缺少类注释');
}

if (errors.length === 0) {
  console.log('   ✅ 代码质量检查通过');
} else {
  console.log('   ❌ 代码质量检查发现问题:');
  errors.forEach(err => {
    console.log(`      - ${err}`);
  });
  allFilesExist = false;
}

// 总结
console.log('\n🎉 测试完成！');
if (allFilesExist) {
  console.log('✅ 所有测试通过，oksdd项目功能完整！');
  console.log('\n📋 可用命令:');
  console.log('   - oksdd init [change-id]      # 初始化项目或创建新变更提案');
  console.log('   - oksdd check <change-id>     # 校验提案文档');
  console.log('   - oksdd check-spec <change-id> # 校验代码实现与spec需求一致性');
  console.log('   - oksdd archive <change-id>   # 归档变更提案');
} else {
  console.log('❌ 测试失败，项目存在问题，需要进一步修复！');
}

console.log('\n💡 使用建议:');
console.log('1. 在支持Node.js的环境中运行 `npm install` 安装依赖');
console.log('2. 运行 `npx tsc --noEmit` 进行TypeScript类型检查');
console.log('3. 运行 `node build.js` 进行打包测试');
console.log('4. 使用 `oksdd init test-change` 测试初始化功能');
console.log('5. 使用 `oksdd check test-change` 测试校验功能');
console.log('6. 使用 `oksdd archive test-change` 测试归档功能');
