# Release Skill: 发布与回归监控（适用于本仓库）

## 目标
在 Node/Electron 应用开发过程中，自动完成以下事项：
1. 版本与 Tag 管理（覆盖当前版本或创建新版本）。
2. 触发 GitHub Release Action。
3. 监控构建与发布工作流结果，失败时持续修复并重试。
4. 生成清晰简洁的 Release 说明（含用户痛点与新功能价值）。
5. **引用效果截图**：在 Release 说明中，必须引用之前生成的 Playwright 效果截图（如 `assets/screenshots/` 下的文件）。如果当前 session 无法自动上传，请以图片 Markdown 链接形式在描述中展示（如 `![Android Portrait](https://github.com/abc55667788/Timer/blob/main/assets/screenshots/android-portrait-timer.png?raw=true)`）。
6. 将发布版本标记为 Latest、非 Draft，并清理同 Tag 的 Draft。

---

## 触发方式（对 Copilot 的自然语言指令模板）

### A. 覆盖当前版本（示例：v1.6.0）
请按 Release Skill 执行：覆盖发布 v1.6.0；
同步当前 main 代码，重建并推送同名 Tag；
清理同 Tag 的 Draft；
将 Release 设为非 Draft 且 Latest；
监控工作流直到成功，如失败请自动修复并继续。

### B. 新建版本（示例：v1.6.1）
请按 Release Skill 执行：发布新版本 v1.6.1；
更新 package.json 版本并推送 main 与 Tag；
触发 Release Action，清理 Draft，设为 Latest；
监控直到成功，失败自动修复重试。

### C. 带截图发布
请按 Release Skill 执行：发布 v1.6.x，先运行 Playwright 截图并附加到 Release 说明。

### D. 一句话触发（可直接复制）
1. 覆盖当前版本：
请按 Release Skill 执行：覆盖发布 v1.6.0，清理同 Tag Draft，设为 Latest 非 Draft，并监控到 publish 成功，失败自动修复后重试。

2. 新建版本：
请按 Release Skill 执行：发布新版本 v1.6.1（更新 package.json、推送 main 和 tag），清理 Draft，设为 Latest，监控到成功。

3. 带截图发布：
请按 Release Skill 执行：发布 v1.6.1，先运行 Playwright 截图保存到 assets/screenshots/v1.6.1-preview.png，将图片链接写入 Release 说明后发布并监控到成功。

---

## 执行标准（必须满足）
1. Release 必须为正式版：draft=false，prerelease=false。
2. 新发布必须标记 latest=true。
3. 若存在同 Tag Draft，先删除再发布。
4. 上传产物时必须兼容带空格文件名（Windows 安装包）。
5. 监控至少包含：build-windows、build-linux、build-android、publish。
6. 任一关键 Job 失败时，需给出根因并执行修复后重推 Tag。

---

## 监控与修复策略
1. 触发发布后启动后台会话，轮询 GitHub Actions 最新 run 状态。
2. 当 run 失败时：
   - 抽取失败 Job 日志关键行；
   - 修改工作流或脚本（最小修复）；
   - 提交修复并重推同 Tag；
   - 再次监控直到成功。
3. 成功标准：
   - publish Job 成功；
   - Release 页面可见对应 Tag；
   - 状态为正式版且为 Latest；
   - 附件包含本次构建产物。

---

## Release 说明模板（简明且清晰）

标题：Emerald Timer vX.Y.Z

内容结构：
1. 本次更新一句话总结（面向用户价值）。
2. 新功能与痛点对应关系（2-4 条）。
3. 稳定性/性能改进（1-2 条）。
4. 构建产物列表（Windows/Linux/Android）。
5. 预览图（可选）：
   ![Preview](https://github.com/abc55667788/Timer/raw/main/assets/screenshots/vX.Y.Z-preview.png)

---

## 本仓库当前约定
1. Release 工作流文件：.github/workflows/release.yml
2. 截图脚本：screenshot.spec.ts
3. 截图输出目录：assets/screenshots/
4. 版本来源：package.json

---

## 注意事项
1. 若本地未安装 gh CLI，则无法在本地直接改远程 Release；可改为只通过 Actions 云端执行。
2. 若产物路径结构变化，需优先使用递归查找并用数组传参上传。
3. 覆盖同版本发布时，必须删除远程旧 Tag 后重建推送。
