# UI Fix & Verification Skill: 界面修复与视觉回归核验

## 目标
在进行 UI/UX 相关的代码修改（如版面重合、样式优化等）时，确保修改的视觉效果符合用户预期，并避免直接在未验证的情况下推送远程。

## 执行流程

### 1. 代码修复 (Fix)
- 根据用户反馈的 UI 问题，精确定位并修改相应的前端代码（CSS/TSX）。
- 确保代码在逻辑上是健壮的。

### 2. 本地构建与自动化核验 (Build & Verify)
- **执行构建**：在截图前，**必须执行 `npm run build`**，确保所有源码（TSX/CSS）已正确编译到生产环境。
- **环境自适应构建**：
    - 如果当前是在 Windows 环境下修改 Windows UI，在截图展示后且用户准备推送前，**必须先执行同步构建本地便携版**（如 `npm run build:portable`）。
- **运行核验**：执行对应的 Playwright 脚本（如 `screenshot.android.spec.ts` 或 `screenshot.spec.ts`）。
- **展示结果**：将生成的预览图展示给用户，并详细说明针对遮挡或样式的修复点。

### 3. 等待用户确认 (User Approval)
- **严禁擅自推送**：在用户明确表示“满意”或“可以推送”之前，禁止执行 `git push` 或 `git tag` 操作。
- 如果用户提出进一步修改建议，返回步骤 1 重新迭代。

### 4. 调用后期技能 (Release/Push)
- 仅在用户满意后，根据用户指令调用 **GitHub Release Skill** 进行：
    - 更新 `package.json` 版本。
    - 提交代码并推送。
    - 覆盖或创建新的 Tag/Release。
    - 附带截图作为 Release 描述中的视觉凭证。

---

## 指令触发示例
- "请按 UI Fix Skill 修复 EventsBoard 的遮挡问题，并给我截图。"
- "UI 效果可以了，现在按 Release Skill 发布 v1.6.2。"
