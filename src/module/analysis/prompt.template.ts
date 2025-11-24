export class PromptTemplate {
  static generateAnalysisPrompt(
    commitMessage: string,
    diff: string,
    files: FileChange[],
  ): string {
    const fileList = files
      .map((f) => `- ${f.filename} (${f.status})`)
      .join('\n');

    return `你是一位资深的代码审查专家。请对以下代码提交进行全面的分析，重点关注代码复杂度、可行性和安全性。请以 JSON 格式输出分析结果。

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

### 4. 总体评价
- 综合评分和建议
- 整体代码质量评估

### 5. 行级评论
如果发现代码错误、潜在问题或需要改进的地方，请在 lineComments 数组中添加评论。每个评论需要包含：
- path: 文件路径
- line: 行号（从 diff 中提取）
- comment: 具体的评论内容
- severity: 严重程度（"error" | "warning" | "info"）

## JSON 输出格式示例
请严格按照以下 JSON 格式输出：

\`\`\`json
{
  "analysisReport": "请在此处输出完整的代码审查结果，包含以下部分：\\n\\n## 代码复杂度分析\\n[你的复杂度分析内容]\\n\\n## 可行性评估\\n[你的可行性分析内容]\\n\\n## 安全性检查\\n[你的安全性检查内容]\\n\\n## 总体评价\\n[你的总体评价内容]",
  "lineComments": [
    {
      "path": "src/example.ts",
      "line": 42,
      "comment": "这里可能存在空指针异常，建议添加空值检查",
      "severity": "warning"
    }
  ]
}
\`\`\`

注意：
- analysisReport 是一个字符串，包含完整的代码审查结果，需要包含复杂度分析、可行性评估、安全性检查和总体评价四个部分
- 如果代码没有问题，lineComments 可以为空数组 []
- severity 只能是 "error"、"warning" 或 "info" 之一
- 请确保输出的 JSON 格式完全合法，可以被 JSON.parse() 解析`;
  }
}
