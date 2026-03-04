# Token 使用追踪工具

## 功能说明

这个工具用于追踪 Claude Code 的 token 使用情况，帮助优化 token 消耗，控制成本。

## 安装和运行

```bash
# 直接运行（Node.js 环境）
node token-tracker.js
```

## 命令

### 1. 记录 token 使用

```bash
# 记录一次任务
node token-tracker.js record "任务名称" 输入token数 输出token数 "优化措施"
```

**示例:**
```bash
node token-tracker.js record "修复登录bug" 1500 800 "使用limit参数读取文件"
```

### 2. 分析使用趋势

```bash
# 分析最近5次任务的token使用趋势
node token-tracker.js analyze
```

### 3. 显示帮助

```bash
node token-tracker.js help
```

## 使用场景

### 日常使用
每次完成重要任务后，记录 token 使用情况：
```bash
node token-tracker.js record "完成用户认证功能" 3200 1800 "优化了API响应格式"
```

### 预算监控
定期运行分析命令查看成本趋势：
```bash
node token-tracker.js analyze
```

## 自动化建议

可以在 `.bashrc` 或 `.zshrc` 中添加别名：
```bash
alias token-record='node /path/to/token-tracker.js record'
alias token-analyze='node /path/to/token-tracker.js analyze'
```

## 预算设置

工具默认设置为：
- **总预算**: $7 (5小时)
- **每小时预算**: $1.40
- **模型**: claude-sonnet-4.6
  - 输入: $3/M tokens
  - 输出: $15/M tokens

## 警告级别

- **80% 预算**: 警告，建议优化
- **100% 预算**: 严重警告，必须优化

## 优化建议

工具会自动生成以下优化建议：
1. 精简请求内容
2. 简化响应输出
3. 使用 `/compact` 清理对话历史
4. 优化文件读取（limit/offset）
5. Grep 优先使用 files_with_matches
6. 并行调用工具

## 文件位置

- **记录文件**: `token.txt` - 存储所有 token 使用记录
- **工具文件**: `token-tracker.js` - 主程序

## 集成到工作流程

建议在每次重要任务完成后运行记录命令，这样可以：
1. 追踪成本使用情况
2. 获得优化建议
3. 监控预算消耗
4. 分析使用趋势

## 示例工作流程

```bash
# 开始任务
echo "开始处理用户认证功能..."

# 完成任务后记录
node token-tracker.js record "用户认证功能" 3200 1800 "优化了JWT验证逻辑"

# 查看趋势
node token-tracker.js analyze
```