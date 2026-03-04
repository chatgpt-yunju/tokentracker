// Token监控脚本 - 集成到Claude Code对话中
class TokenMonitor {
    constructor() {
        this.conversationTracker = window.tracker || new ConversationTracker();
        this.isMonitoring = false;
        this.currentInputTokens = 0;
        this.currentOutputTokens = 0;
    }

    // 开始监控对话
    startMonitoring() {
        if (this.isMonitoring) return;

        this.isMonitoring = true;
        console.log('🔍 Token监控已启动');

        // 监控用户输入（需要根据Claude Code的具体实现调整）
        this.setupMessageListeners();
    }

    // 设置消息监听器
    setupMessageListeners() {
        // 这里需要根据Claude Code的实现方式来添加监听器
        // 例如监听输入事件、响应事件等

        // 示例：监听键盘输入来估算token
        let inputBuffer = '';
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT') {
                inputBuffer = e.target.value;
            }
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && (e.target.tagName === 'TEXTAREA' || e.target.tagName === 'INPUT')) {
                // 估算输入token
                this.estimateInputTokens(inputBuffer);
            }
        });
    }

    // 估算输入token数量
    estimateInputTokens(text) {
        // 简单的token估算：1个token约等于4个字符（英文）
        const estimatedTokens = Math.ceil(text.length / 4);
        this.currentInputTokens = estimatedTokens;

        // 记录用户输入
        this.conversationTracker.addMessage('user', text, estimatedTokens, 0);

        console.log(`📤 输入Token: ${estimatedTokens}`);
    }

    // 记录输出
    recordOutput(content, actualTokens) {
        this.currentOutputTokens = actualTokens;

        // 记录AI输出
        this.conversationTracker.addMessage('assistant', content, 0, actualTokens);

        console.log(`📥 输出Token: ${actualTokens}`);

        // 显示优化建议
        this.displayOptimizationTips();
    }

    // 显示优化建议（创建浮动提示）
    displayOptimizationTips() {
        // 移除已存在的提示
        const existingTips = document.getElementById('tokenTips');
        if (existingTips) {
            existingTips.remove();
        }

        // 获取建议
        const tips = this.conversationTracker.currentSession.optimizationTips;
        if (tips.length === 0) return;

        // 创建提示容器
        const tipsContainer = document.createElement('div');
        tipsContainer.id = 'tokenTips';
        tipsContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            z-index: 10000;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 15px;
            max-height: 400px;
            overflow-y: auto;
        `;

        // 添加标题
        const title = document.createElement('div');
        title.innerHTML = '💡 Token优化建议';
        title.style.cssText = `
            font-weight: 600;
            color: #8b5cf6;
            margin-bottom: 10px;
            font-size: 1.1rem;
        `;
        tipsContainer.appendChild(title);

        // 添加建议
        tips.forEach(tip => {
            const tipDiv = document.createElement('div');
            tipDiv.className = `alert alert-${tip.type}`;
            tipDiv.style.margin = '10px 0';
            tipDiv.innerHTML = `
                <div style="font-size: 0.9rem;">${tip.message}</div>
                <button onclick="this.parentElement.remove(); document.getElementById('tokenTips').remove()"
                        style="float: right; background: none; border: none; color: #8b5cf6; cursor: pointer;">
                    ✕
                </button>
            `;
            tipsContainer.appendChild(tipDiv);
        });

        // 添加查看详情按钮
        const detailsBtn = document.createElement('button');
        detailsBtn.className = 'button button-secondary';
        detailsBtn.style.cssText = 'width: 100%; margin-top: 10px;';
        detailsBtn.textContent = '查看详细分析';
        detailsBtn.onclick = () => {
            window.open('token-dashboard.html', '_blank');
        };
        tipsContainer.appendChild(detailsBtn);

        // 添加到页面
        document.body.appendChild(tipsContainer);

        // 5秒后自动移除
        setTimeout(() => {
            tipsContainer.remove();
        }, 5000);
    }

    // 获取当前使用情况
    getCurrentUsage() {
        return {
            inputTokens: this.currentInputTokens,
            outputTokens: this.currentOutputTokens,
            totalTokens: this.currentInputTokens + this.currentOutputTokens,
            cost: this.conversationTracker.currentSession.totalCost
        };
    }

    // 检查预算使用情况
    checkBudget() {
        const hourlyBudget = 1.40; // $1.4 per hour
        const duration = (new Date() - this.conversationTracker.currentSession.startTime) / (1000 * 60 * 60);
        const currentHourlyRate = this.conversationTracker.currentSession.totalCost / duration;

        if (currentHourlyRate > hourlyBudget * 0.9) {
            return {
                status: 'critical',
                message: `⚠️ 当前使用速率 $${currentHourlyRate.toFixed(2)}/小时，接近预算限制！`,
                percentage: Math.min((currentHourlyRate / hourlyBudget) * 100, 100)
            };
        } else if (currentHourlyRate > hourlyBudget * 0.7) {
            return {
                status: 'warning',
                message: `⚡ 当前使用速率 $${currentHourlyRate.toFixed(2)}/小时，请关注使用量`,
                percentage: Math.min((currentHourlyRate / hourlyBudget) * 100, 100)
            };
        } else {
            return {
                status: 'normal',
                message: `✅ 使用良好，当前速率 $${currentHourlyRate.toFixed(2)}/小时`,
                percentage: Math.min((currentHourlyRate / hourlyBudget) * 100, 100)
            };
        }
    }

    // 获取优化建议
    getOptimizationTips() {
        const tips = [];
        const usage = this.getCurrentUsage();
        const budget = this.checkBudget();

        // 检查消息长度
        if (this.currentInputTokens > 2000) {
            tips.push({
                type: 'info',
                message: '输入较长，考虑使用智能压缩功能',
                action: 'compression'
            });
        }

        // 检查输出比例
        if (this.currentOutputTokens > this.currentInputTokens * 3) {
            tips.push({
                type: 'warning',
                message: '输出量较大，建议提供更具体的指导',
                action: 'guidance'
            });
        }

        // 预算建议
        if (budget.status === 'critical') {
            tips.push({
                type: 'danger',
                message: budget.message,
                action: 'reduceUsage'
            });
        }

        return tips;
    }

    // 显示监控状态
    showStatus() {
        const usage = this.getCurrentUsage();
        const budget = this.checkBudget();

        const statusDiv = document.createElement('div');
        statusDiv.id = 'tokenMonitorStatus';
        statusDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(255, 255, 255, 0.95);
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            font-size: 0.9rem;
            z-index: 10000;
        `;

        statusDiv.innerHTML = `
            <div style="display: flex; align-items: center; gap: 20px;">
                <div>📊 ${usage.totalTokens.toLocaleString()} tokens</div>
                <div>💰 $${usage.cost.toFixed(4)}</div>
                <div style="color: ${budget.status === 'critical' ? '#e74c3c' : budget.status === 'warning' ? '#f39c12' : '#50c878'}">
                    ${budget.message}
                </div>
            </div>
        `;

        // 移除旧的状态
        const oldStatus = document.getElementById('tokenMonitorStatus');
        if (oldStatus) oldStatus.remove();

        // 添加新状态
        document.body.appendChild(statusDiv);
    }
}

// 创建全局监控实例
const tokenMonitor = new TokenMonitor();

// 如果在Claude Code环境中，自动启动监控
if (typeof window !== 'undefined') {
    window.tokenMonitor = tokenMonitor;
    window.addEventListener('load', () => {
        tokenMonitor.startMonitoring();

        // 定期更新状态
        setInterval(() => {
            tokenMonitor.showStatus();
        }, 3000);
    });
}

// 如果是Node.js环境，导出模块
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TokenMonitor;
}