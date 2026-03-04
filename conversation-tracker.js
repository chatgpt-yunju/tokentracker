// 对话Token追踪与优化建议系统
class ConversationTracker {
    constructor() {
        this.currentSession = {
            startTime: new Date(),
            messages: [],
            totalInputTokens: 0,
            totalOutputTokens: 0,
            totalCost: 0,
            optimizationTips: []
        };

        // 从localStorage加载历史数据
        this.loadHistory();

        // 初始化
        this.init();
    }

    init() {
        // 监听用户输入（模拟）
        this.setupInputListeners();

        // 每5秒更新一次统计
        setInterval(() => this.updateStats(), 5000);

        // 显示实时统计
        this.displayRealtimeStats();
    }

    // 加载历史数据
    loadHistory() {
        const saved = localStorage.getItem('claudeConversationHistory');
        if (saved) {
            this.history = JSON.parse(saved);
        } else {
            this.history = [];
        }
    }

    // 保存历史数据
    saveHistory() {
        localStorage.setItem('claudeConversationHistory', JSON.stringify(this.history));
    }

    // 设置输入监听器（实际使用时需要集成到Claude Code）
    setupInputListeners() {
        // 这里只是示例，实际需要通过API或集成方式获取真实的token数据
        console.log('Token追踪系统已启动');
    }

    // 模拟添加一条消息记录
    addMessage(role, content, inputTokens = 0, outputTokens = 0) {
        const message = {
            timestamp: new Date(),
            role,
            content: content.substring(0, 100) + (content.length > 100 ? '...' : ''), // 只保存前100字符
            inputTokens,
            outputTokens,
            cost: this.calculateCost(inputTokens, outputTokens)
        };

        this.currentSession.messages.push(message);
        this.currentSession.totalInputTokens += inputTokens;
        this.currentSession.totalOutputTokens += outputTokens;
        this.currentSession.totalCost += message.cost;

        // 触发优化建议
        this.generateOptimizationTips();

        // 保存到历史
        if (role === 'user') {
            this.history.push({
                date: new Date().toISOString(),
                inputTokens,
                outputTokens,
                cost: message.cost,
                sessionLength: this.currentSession.messages.length
            });
            this.saveHistory();
        }
    }

    // 计算成本（使用Claude Sonnet 4.6的价格）
    calculateCost(inputTokens, outputTokens) {
        const inputRate = 3 / 1000000;  // $3 per 1M tokens
        const outputRate = 15 / 1000000; // $15 per 1M tokens
        return (inputTokens * inputRate) + (outputTokens * outputRate);
    }

    // 生成优化建议
    generateOptimizationTips() {
        const tips = [];
        const totalTokens = this.currentSession.totalInputTokens + this.currentSession.totalOutputTokens;

        // 检查Token使用量
        if (totalTokens > 100000) {
            tips.push({
                type: 'warning',
                message: '当前对话Token使用量较大，建议分段处理任务',
                action: 'compressPrompt'
            });
        }

        if (this.currentSession.totalOutputTokens > this.currentSession.totalInputTokens * 2) {
            tips.push({
                type: 'info',
                message: '输出Token明显高于输入，建议提供更具体的指导',
                action: 'provideGuidance'
            });
        }

        // 检查成本
        const hourlyBudget = 7 / 5; // $7 per 5 hours = $1.4 per hour
        const currentHourlyRate = this.currentSession.totalCost /
            ((new Date() - this.currentSession.startTime) / (1000 * 60 * 60));

        if (currentHourlyRate > hourlyBudget * 0.8) {
            tips.push({
                type: 'danger',
                message: `当前使用速率 $${currentHourlyRate.toFixed(2)}/小时，接近预算限制`,
                action: 'reduceUsage'
            });
        }

        // 检查消息长度
        const lastUserMessage = this.currentSession.messages
            .filter(m => m.role === 'user')
            .pop();

        if (lastUserMessage && lastUserMessage.content.length > 2000) {
            tips.push({
                type: 'info',
                message: '您的输入较长，可以考虑使用智能压缩功能',
                action: 'useCompression'
            });
        }

        this.currentSession.optimizationTips = tips;
    }

    // 显示实时统计
    displayRealtimeStats() {
        const statsDiv = document.getElementById('conversationStats');
        if (!statsDiv) return;

        const duration = ((new Date() - this.currentSession.startTime) / 1000 / 60).toFixed(1);
        const totalTokens = this.currentSession.totalInputTokens + this.currentSession.totalOutputTokens;

        statsDiv.innerHTML = `
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; color: #8b5cf6; font-weight: 600;">
                        ${totalTokens.toLocaleString()}
                    </div>
                    <div style="font-size: 0.9rem; color: #666;">总Token</div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; color: #50c878; font-weight: 600;">
                        $${this.currentSession.totalCost.toFixed(4)}
                    </div>
                    <div style="font-size: 0.9rem; color: #666;">总成本</div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; color: #4a90e2; font-weight: 600;">
                        ${duration}m
                    </div>
                    <div style="font-size: 0.9rem; color: #666;">对话时长</div>
                </div>
                <div style="background: white; padding: 15px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 1.5rem; color: #f39c12; font-weight: 600;">
                        ${this.currentSession.messages.length}
                    </div>
                    <div style="font-size: 0.9rem; color: #666;">消息数</div>
                </div>
            </div>
            <div style="margin-top: 20px;">
                <h3>💡 实时优化建议</h3>
                <div id="optimizationTips"></div>
            </div>
        `;

        this.displayOptimizationTips();
    }

    // 显示优化建议
    displayOptimizationTips() {
        const tipsDiv = document.getElementById('optimizationTips');
        if (!tipsDiv) return;

        if (this.currentSession.optimizationTips.length === 0) {
            tipsDiv.innerHTML = '<p style="color: #666; padding: 10px;">当前使用良好，暂无优化建议</p>';
            return;
        }

        tipsDiv.innerHTML = this.currentSession.optimizationTips.map(tip => `
            <div class="alert alert-${tip.type}" style="margin: 10px 0;">
                <strong>${tip.type === 'danger' ? '⚠️' : tip.type === 'warning' ? '⚡' : '💡'}</strong>
                ${tip.message}
                <button onclick="tracker.handleOptimizationAction('${tip.action}')"
                        style="float: right; background: none; border: none; color: #8b5cf6; cursor: pointer; font-weight: 600;">
                    查看详情 →
                </button>
            </div>
        `).join('');
    }

    // 处理优化建议的操作
    handleOptimizationAction(action) {
        switch(action) {
            case 'compressPrompt':
                window.open('optimization-dashboard.html', '_blank');
                break;
            case 'provideGuidance':
                console.log('提供更具体的指导建议');
                break;
            case 'reduceUsage':
                console.log('减少使用量建议');
                break;
            case 'useCompression':
                window.open('optimization-dashboard.html#compression', '_blank');
                break;
        }
    }

    // 更新统计
    updateStats() {
        this.displayRealtimeStats();
    }

    // 获取历史统计
    getHistoricalStats() {
        if (this.history.length === 0) return null;

        const totalSessions = this.history.length;
        const totalTokens = this.history.reduce((sum, session) =>
            sum + session.inputTokens + session.outputTokens, 0);
        const totalCost = this.history.reduce((sum, session) => sum + session.cost, 0);
        const avgCostPerSession = totalCost / totalSessions;

        return {
            totalSessions,
            totalTokens,
            totalCost,
            avgCostPerSession,
            avgTokensPerSession: totalTokens / totalSessions
        };
    }

    // 导出报告
    exportReport() {
        const stats = this.getHistoricalStats();
        const report = {
            generatedAt: new Date().toISOString(),
            currentSession: {
                duration: ((new Date() - this.currentSession.startTime) / 1000 / 60).toFixed(1) + ' minutes',
                totalTokens: this.currentSession.totalInputTokens + this.currentSession.totalOutputTokens,
                totalCost: this.currentSession.totalCost,
                messagesCount: this.currentSession.messages.length
            },
            historical: stats,
            optimizationTips: this.currentSession.optimizationTips
        };

        // 创建并下载报告
        const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `claude-token-report-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }
}

// 初始化追踪器
let tracker;
document.addEventListener('DOMContentLoaded', function() {
    tracker = new ConversationTracker();

    // 添加测试数据（模拟）
    setTimeout(() => {
        tracker.addMessage('user', '你好，请帮我分析一下当前的市场趋势', 150, 300);
        tracker.addMessage('assistant', '好的，我来帮您分析市场趋势...', 300, 800);
    }, 1000);
});

// 如果在Node.js环境中，提供API
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ConversationTracker;
}