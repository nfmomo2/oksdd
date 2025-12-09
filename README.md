# OKSDD - 规范驱动开发工具

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)

OKSDD (Open Knowledge SDD) 是一个支持规范驱动开发(SDD)的实践辅助工具，旨在帮助团队建立从需求到代码的完整链路规范管理。

GitHub仓库: [https://github.com/yourusername/oksdd](https://github.com/yourusername/oksdd)

## 核心功能

1. **变更提案管理** - 通过标准化文档模板引导需求分析和设计方案
2. **文档规范校验** - 自动校验proposal.md、tasks.md、spec.md等文档的格式与内容规范性
3. **代码一致性检查** - 对比spec需求与代码实现的一致性（规划中）
4. **变更归档追踪** - 完整记录变更历史，形成可追溯的知识资产

## 安装方式

### 方法一：通过npm安装（推荐）

```bash
npm install -g oksdd
```

### 方法二：本地安装

1. 克隆项目到本地
2. 进入项目目录
3. 运行编译命令：
   ```bash
   node build.js
   ```
4. 全局链接：
   ```bash
   npm link
   ```

## 使用方法

### 1. 初始化项目或创建变更提案

```bash
# 项目首次初始化
oksdd init

# 创建新的变更提案
oksdd init [change-id]

# 示例
oksdd init add-user-login
```

### 2. 校验提案文档

```bash
# 校验指定变更提案
oksdd check [change-id]

# 严格模式校验
oksdd check [change-id] --strict

# 示例
oksdd check add-user-login
```

### 3. 校验代码实现与需求一致性

```bash
# 校验代码实现与spec需求的一致性
oksdd check-spec [change-id]

# 示例
oksdd check-spec add-user-login
```

### 4. 归档变更提案

```bash
# 归档已完成的变更提案
oksdd archive [change-id]

# 模拟归档操作（不实际执行）
oksdd archive [change-id] --dry-run

# 示例
oksdd archive add-user-login
```

## 项目编译

项目使用esbuild进行编译：

```bash
# 进入项目根目录
cd oksdd

# 运行编译命令
node build.js
```

编译后的文件位于`dist/`目录下。

## 开发指南

### 项目结构

```
oksdd/
├── src/              # TypeScript源代码
│   ├── cli/          # CLI入口
│   ├── commands/     # 命令实现
│   ├── core/         # 核心服务
│   ├── types/        # 类型定义
│   └── utils/        # 工具函数
├── dist/             # 编译后的JavaScript文件
├── oksdd/            # 生成的变更提案目录
└── build.js          # 编译配置文件
```

### 主要命令实现

1. `init` - 初始化项目或创建新变更提案
2. `check` - 校验提案文档的格式与内容规范性
3. `check-spec` - 校验代码实现与spec需求的一致性（框架已实现）
4. `archive` - 归档变更提案，迁移文档并更新主规范

## 发布为npm包

### 1. 配置package.json

确保以下字段正确配置：

```json
{
  "name": "oksdd",
  "version": "1.0.0",
  "description": "SDD实践辅助工具，支持规范驱动开发的流程管理和文档校验",
  "bin": {
    "oksdd": "./dist/index.js"
  },
  "files": [
    "dist/",
    "README.md",
    "OKSDD.md",
    "LICENSE"
  ],
  "preferGlobal": true
}
```

### 2. 发布到npm

```bash
# 登录npm账户
npm login

# 发布包
npm publish
```

### 3. 安装和使用

其他人就可以通过以下方式安装和使用：

```bash
# 全局安装
npm install -g oksdd

# 直接使用命令
oksdd --help
oksdd init my-feature
```

## 许可证

MIT License