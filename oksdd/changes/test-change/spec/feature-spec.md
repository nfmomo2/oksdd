# ADDED

## ### Requirement: 用户可以初始化新的变更提案

#### Scenario: 用户运行初始化命令创建新变更提案
**WHEN** 用户执行 `oksdd init my-new-feature` 命令
**THEN** 系统应在 oksdd/changes 目录下创建 my-new-feature 文件夹，包含 proposal.md、tasks.md 和 spec 目录