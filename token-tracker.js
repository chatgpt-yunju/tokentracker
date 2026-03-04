#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class TokenTracker {
  constructor() {
    this.tokenFile = path.join(__dirname, 'token.txt');
    this.pricing = {
      sonnet: {
        input: 3,    // $3 per M tokens
        output: 15   // $15 per M tokens
      }
    };
    this.budget = {
      hours: 5,
      total: 7,     // $7 for 5 hours
      hourly: 1.4   // $1.40 per hour
    };
  }

  /**
   * 记录新的token使用情况
   * @param {Object} task - 任务信息
   * @param {string} task.name - 任务名称
   * @param {number} task.inputTokens - 输入token数
   * @param {number} task.outputTokens - 输出token数
   * @param {string} task.date - 日期
   * @param {string} task.optimizations - 优化措施
   */
  recordTask(task) {
    const cost = this.calculateCost(task.inputTokens, task.outputTokens);
    const record = this.formatRecord(task, cost);

    // 读取现有内容
    let content = '';
    if (fs.existsSync(this.tokenFile)) {
      content = fs.readFileSync(this.tokenFile, 'utf8');
    }

    // 添加新记录
    content += record + '\n';

    // 写入文件
    fs.writeFileSync(this.tokenFile, content);

    // 检查预算
    this.checkBudget(cost);
  }

  /**
   * 计算token成本
   * @param {number} inputTokens - 输入token数
   * @param {number} outputTokens - 输出token数
   * @returns {number} 成本（美元）
   */
  calculateCost(inputTokens, outputTokens) {
    const inputCost = (inputTokens / 1000000) * this.pricing.sonnet.input;
    const outputCost = (outputTokens / 1000000) * this.pricing.sonnet.output;
    return inputCost + outputCost;
  }

  /**
   * 格式化记录
   * @param {Object} task - 任务信息
   * @param {number} cost - 成本
   * @returns {string} 格式化后的记录
   */
  formatRecord(task, cost) {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] ${task.name} - Input: ${task.inputTokens} tokens, Output: ${task.outputTokens} tokens, Cost: $${cost.toFixed(4)}`;
  }

  /**
   * 检查预算使用情况
   * @param {number} currentCost - 当前任务成本
   */
  checkBudget(currentCost) {
    const content = fs.readFileSync(this.tokenFile, 'utf8');
    const records = content.split('\n').filter(line => line.trim());

    // 计算总成本
    let totalCost = 0;
    records.forEach(record => {
      const match = record.match(/Cost: \$(\d+\.\d{4})/);
      if (match) {
        totalCost += parseFloat(match[1]);
      }
    });

    // 添加当前任务成本
    totalCost += currentCost;

    // 计算预算使用百分比
    const budgetPercentage = (totalCost / this.budget.total) * 100;

    console.log(`\n📊 Token 使用分析:`);
    console.log(`- 当前任务成本: $${currentCost.toFixed(4)}`);
    console.log(`- 累计总成本: $${totalCost.toFixed(4)}`);
    console.log(`- 预算使用: ${budgetPercentage.toFixed(1)}%`);

    if (budgetPercentage > 80) {
      console.log('⚠️ 预算警告: 已使用超过80%预算，请考虑优化token使用！');
    }

    if (budgetPercentage > 100) {
      console.log('❗ 严重警告: 已超出预算！请立即优化token使用！');
    }
  }

  /**
   * 生成优化建议
   * @param {Object} task - 任务信息
   * @returns {string} 优化建议
   */
  generateOptimizations(task) {
    const suggestions = [];

    // 检查输入token是否过大
    if (task.inputTokens > 5000) {
      suggestions.push('1. 输入内容过大，考虑精简请求内容');
    }

    // 检查输出token是否过大
    if (task.outputTokens > 3000) {
      suggestions.push('2. 输出内容过大，考虑简化响应');
    }

    // 基础优化建议
    suggestions.push('3. 使用 /compact 命令清理对话历史');
    suggestions.push('4. 优化文件读取，使用 limit/offset 参数');
    suggestions.push('5. Grep 优先使用 files_with_matches 模式');
    suggestions.push('6. 并行调用独立工具减少往返');

    return suggestions.join('\n');
  }

  /**
   * 分析token使用趋势
   */
  analyzeTrends() {
    if (!fs.existsSync(this.tokenFile)) {
      console.log('没有找到token记录文件');
      return;
    }

    const content = fs.readFileSync(this.tokenFile, 'utf8');
    const records = content.split('\n').filter(line => line.trim());

    if (records.length <= 1) {
      console.log('记录不足，无法分析趋势');
      return;
    }

    // 提取最近5条记录
    const recentRecords = records.slice(-5);
    const recentCosts = [];

    recentRecords.forEach(record => {
      const match = record.match(/Cost: \$(\d+\.\d{4})/);
      if (match) {
        recentCosts.push(parseFloat(match[1]));
      }
    });

    // 计算平均成本
    const avgCost = recentCosts.reduce((sum, cost) => sum + cost, 0) / recentCosts.length;

    console.log('\n📈 最近5次任务成本趋势:');
    recentCosts.forEach((cost, index) => {
      console.log(`- 任务${index + 1}: $${cost.toFixed(4)}`);
    });

    console.log(`平均成本: $${avgCost.toFixed(4)}`);

    // 成本趋势分析
    if (recentCosts.length >= 2) {
      const lastCost = recentCosts[recentCosts.length - 1];
      const prevCost = recentCosts[recentCosts.length - 2];
      const change = ((lastCost - prevCost) / prevCost) * 100;

      if (change > 20) {
        console.log(`⚠️ 成本上升: 比上次增加 ${change.toFixed(1)}%`);
      } else if (change < -20) {
        console.log(`✅ 成本下降: 比上次减少 ${Math.abs(change).toFixed(1)}%`);
      }
    }
  }
}

// 命令行接口
if (require.main === module) {
  const tracker = new TokenTracker();

  const args = process.argv.slice(2);
  const command = args[0];

  switch (command) {
    case 'record':
      if (args.length < 4) {
        console.log('用法: node token-tracker.js record <任务名称> <输入token> <输出token> [优化措施]');
        process.exit(1);
      }

      const taskName = args[1];
      const inputTokens = parseInt(args[2]);
      const outputTokens = parseInt(args[3]);
      const optimizations = args[4] || '';

      tracker.recordTask({
        name: taskName,
        inputTokens,
        outputTokens,
        date: new Date().toISOString().split('T')[0],
        optimizations
      });
      break;

    case 'analyze':
      tracker.analyzeTrends();
      break;

    case 'help':
    default:
      console.log('可用命令:');
      console.log('  record <任务名称> <输入token> <输出token> [优化措施] - 记录token使用');
      console.log('  analyze - 分析token使用趋势');
      console.log('  help - 显示帮助');
      break;
  }
}

module.exports = TokenTracker;