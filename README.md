# Token Tracker

A token usage tracker for Claude Code to optimize token consumption and monitor costs.

## Features

- 📊 Track token usage and costs
- 💰 Monitor budget usage with warnings
- 📈 Analyze usage trends
- 🛠️ Generate optimization suggestions
- 📝 Easy to use CLI interface

## Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/token-tracker.git
cd token-tracker

# Install dependencies
npm install
```

## Usage

### Record Token Usage

```bash
# Record a task
node index.js record "任务名称" 输入token数 输出token数 "优化措施"

# Example
node index.js record "修复登录bug" 1500 800 "使用limit参数读取文件"
```

### Analyze Usage Trends

```bash
# Analyze recent trends
node index.js analyze
```

### Show Help

```bash
# Display help
node index.js help
```

## Configuration

The tool uses the following default configuration:

- **Model**: claude-sonnet-4.6
- **Input Pricing**: $3 per M tokens
- **Output Pricing**: $15 per M tokens
- **Budget**: $7 for 5 hours ($1.40 per hour)

You can customize these settings by modifying the `index.js` file.

## Budget Monitoring

The tool provides automatic budget monitoring:

- **80% Budget**: Warning - Consider optimizing token usage
- **100% Budget**: Critical - Must optimize token usage immediately

## Optimization Suggestions

The tool automatically generates optimization suggestions based on your token usage:

1. Simplify request content
2. Simplify response output
3. Use `/compact` to clean conversation history
4. Optimize file reading with limit/offset parameters
5. Use `files_with_matches` mode for Grep
6. Parallelize independent tool calls

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the [GitHub repository](https://github.com/yourusername/token-tracker/issues).