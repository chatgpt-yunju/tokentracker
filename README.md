# Token Tracker

Claude Code Token 使用追踪与成本监控工具

## 快速开始

```bash
# 安装（已安装可跳过）
git clone https://github.com/chatgpt-yunju/tokentracker.git
cd tokentracker
sudo ln -sf $(pwd)/tt /usr/local/bin/tt
```

## 使用方法

### 查看统计
```bash
tt
```

### 记录任务
```bash
# 自动提示输入 token 数
tt '修复登录bug'

# 直接指定 token 数
tt '写文档' 2000 500
```

### 帮助
```bash
tt -h
```

## 价格配置

- **模型**: claude-sonnet-4.6
- **输入**: $3 / M tokens
- **输出**: $15 / M tokens
- **预算**: $7 / 5小时 ($1.40/小时)

## 输出示例

```
📊 Token 统计
────────────────────
任务数:   5
总成本:   $0.1234
预算:     1.8% ($0.1234 / $7.0000)
使用时长: 0.09 小时

最近记录 (最后5条)
  [2026-03-05T...] 修复登录bug - Input: 1500, Output: 800, Cost: $0.0195
```

---

**网站**: http://cc.yunjunet.cn | **GitHub**: https://github.com/chatgpt-yunju/tokentracker
