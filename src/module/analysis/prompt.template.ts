export class PromptTemplate {
  static generateAnalysisPrompt(
    commitMessage: string,
    diff: string,
    files: FileChange[],
  ): string {
    const fileList = files
      .map((f) => `- ${f.filename} (${f.status})`)
      .join('\n');

    return `你是一位资深的代码审查专家。请对以下代码提交进行全面的分析，重点关注代码复杂度、可行性和安全性。

## 提交信息
提交信息: ${commitMessage}

## 变更文件
${fileList || '无文件变更信息'}

## 代码变更 (Diff)
\`\`\`
${diff || '无 diff 信息'}
\`\`\`

## 分析要求
请从以下三个维度对本次提交进行详细分析：

### 1. 代码复杂度分析
- 代码结构的复杂程度
- 是否存在过度复杂的逻辑
- 可读性和可维护性评估
- 建议的简化方案（如有）

### 2. 可行性评估
- 代码实现的合理性
- 是否存在潜在的逻辑错误
- 边界情况处理是否完善
- 性能考虑是否充分

### 3. 安全性检查
- 是否存在安全漏洞（如 SQL 注入、XSS、CSRF 等）
- 敏感信息处理是否安全
- 权限验证是否充分
- 输入验证是否完善

## 输出格式
请使用 Markdown 格式输出，包含以下部分：
- **复杂度分析**: [你的分析]
- **可行性评估**: [你的评估]
- **安全性检查**: [你的检查结果]
- **总体评价**: [综合评分和建议]

请确保分析专业、客观、有建设性。`;
  }
}
