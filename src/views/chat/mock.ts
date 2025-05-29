// 生成格式化的时间字符串
const formatDate = (date: Date): string => {
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}

// 生成最近三天的随机时间
const getRecentTime = (daysAgo: number) => {
  const date = new Date()
  date.setDate(date.getDate() - daysAgo)
  date.setHours(Math.floor(Math.random() * 24))
  date.setMinutes(Math.floor(Math.random() * 60))
  date.setSeconds(Math.floor(Math.random() * 60))
  return formatDate(date)
}

// 生成十天前的随机时间
const getOlderTime = () => {
  const date = new Date()
  date.setDate(date.getDate() - 10 - Math.floor(Math.random() * 5)) // 10-15天前的随机时间
  date.setHours(Math.floor(Math.random() * 24))
  date.setMinutes(Math.floor(Math.random() * 60))
  date.setSeconds(Math.floor(Math.random() * 60))
  return formatDate(date)
}

// 基础列表项接口
export interface BaseItem {
  id: string | number
  name: string
  icon: string
  content: string
  isTimeLabel?: boolean
}

// 聊天记录项接口
export interface ChatHistoryItem extends BaseItem {
  time: string
}

// 聊天记录
export const chatHistoryList: ChatHistoryItem[] = [
  {
    id: 'today',
    name: '今天',
    icon: '',
    content: '',
    time: getRecentTime(0),
    isTimeLabel: true
  },
  {
    id: 1,
    name: '',
    icon: '',
    content: 'Python爬虫开发咨询',
    time: getRecentTime(0) // 今天
  },
  {
    id: 'recent',
    name: '近3天',
    icon: '',
    content: '',
    time: getRecentTime(1),
    isTimeLabel: true
  },
  {
    id: 2,
    name: '',
    icon: '',
    content: 'React性能优化分析',
    time: getRecentTime(1)
  },
  {
    id: 3,
    name: '',
    icon: '',
    content: '数据库设计咨询',
    time: getRecentTime(2)
  },
  {
    id: 'ten_days_ago',
    name: '十天前',
    icon: '',
    content: '',
    time: getOlderTime(),
    isTimeLabel: true
  },
  {
    id: 4,
    name: '',
    icon: '',
    content: 'Docker容器化部署问题',
    time: getOlderTime()
  },
  {
    id: 5,
    name: '',
    icon: '',
    content: 'Vue3状态管理方案',
    time: getOlderTime()
  },
  {
    id: 6,
    name: '',
    icon: '',
    content: 'Kubernetes部署策略',
    time: getOlderTime()
  },
  {
    id: 7,
    name: '',
    icon: '',
    content: 'Redis缓存优化',
    time: getOlderTime()
  },
  {
    id: 8,
    name: '',
    icon: '',
    content: 'Flutter状态管理',
    time: getOlderTime()
  },
  {
    id: 9,
    name: '',
    icon: '',
    content: 'GraphQL性能优化',
    time: getOlderTime()
  },
  {
    id: 10,
    name: '',
    icon: '',
    content: 'Nginx负载均衡配置',
    time: getOlderTime()
  }
]

// 机器人列表
export const botList: BaseItem[] = [
  {
    id: 1,
    name: '审计数字人',
    icon: 'chat-bot-sj',
    content: '模型介绍模型介绍模型介绍模型介绍模型介绍。'
  },
  {
    id: 2,
    name: '安全数字人',
    icon: 'chat-bot-aq',
    content: '模型介绍模型介绍模型介绍模型介绍模型介绍。'
  },
  {
    id: 3,
    name: '资产数字人',
    icon: 'chat-bot-zc',
    content: '模型介绍模型介绍模型介绍模型介绍模型介绍。'
  },
  {
    id: 4,
    name: '真实数字人',
    icon: 'chat-bot-zs',
    content: '模型介绍模型介绍模型介绍模型介绍模型介绍。'
  }
]

// 风险列表
export const riskList: BaseItem[] = [
  {
    id: 1,
    name: '',
    icon: '',
    content: '3465: 未授权访问警告-发现非法尝试访问敏感数据库'
  },
  {
    id: 2,
    name: '',
    icon: '',
    content: '6219：加密勒索软件检测-检测到潜在勒索软件活动'
  },
  {
    id: 3,
    name: '',
    icon: '',
    content: '5536：木马警告：发现高风险木马'
  },
  {
    id: 4,
    name: '',
    icon: '',
    content: '5516：端口安全隐患：发现多个开放端口未加密'
  },
  {
    id: 5,
    name: '',
    icon: '',
    content: '5017：恶意软件入侵：检测到恶意软件在内部网络传播'
  },
  {
    id: 6,
    name: '',
    icon: '',
    content: '5508：未加密敏感通信-发现敏感数据通过未加密通道传输'
  },
  {
    id: 7,
    name: '',
    icon: '',
    content: '1027：数据泄露威胁：发现内部文件在网上出售'
  }
]

// 知识库
export const knowledgeList: BaseItem[] = [
  {
    id: 1,
    name: '网络安全基础库',
    icon: 'knowledge',
    content: '网络安全的基本概念，常见的网络攻击类型以及安全框架'
  },
  {
    id: 2,
    name: '漏洞风险知识库',
    icon: 'knowledge',
    content: '常见漏洞分类以及CVE漏洞数据库（如CVE、CNVD）以及漏洞的详细信息和修复建议等'
  },
  {
    id: 3,
    name: '合规审计知识库',
    icon: 'knowledge',
    content: '网络安全相关的法律法规《网络安全法》《数据安全法》以及行业数据分类分级标准等'
  },
  {
    id: 4,
    name: '安全运维知识库',
    icon: 'knowledge',
    content: '常见厂商安全工具如防火墙，SIP和日志审计的操作手册和信息'
  },
  {
    id: 5,
    name: '代码审计知识库',
    icon: 'knowledge',
    content: '代码审计知识以及漏洞样本和对应的类型以及解读'
  },
  {
    id: 6,
    name: '日志分析知识库',
    icon: 'knowledge',
    content: '日志分析的知识例如如何识别木马特征和异常流量'
  },
  {
    id: 7,
    name: '邮件分析知识库',
    icon: 'knowledge',
    content: '钓鱼邮件识别和特征的知识'
  },
  {
    id: 8,
    name: 'Webshell分析知识库',
    icon: 'knowledge',
    content: 'webshell的识别和分析的知识'
  },
  {
    id: 9,
    name: '流量分析知识库',
    icon: 'knowledge',
    content: '流量分析相关的知识'
  },
  {
    id: 10,
    name: '报告模板库',
    icon: 'knowledge',
    content: '包含漏洞扫描，风险评估，渗透测试等报告的模板格式'
  }
]

export const chatTestA = [
  `# SQL注入漏洞分析报告

## 告警详情
- **告警级别**: 高危
- **告警类型**: SQL注入漏洞
- **受影响资产**: web-server-01
- **告警时间**: 2024-03-15 14:30:45

## 漏洞分析
\`\`\`sql
SELECT * FROM users WHERE id = '$id' AND password = '$pwd'
\`\`\`

这段代码存在以下风险：
1. 未对用户输入进行过滤
2. 直接拼接SQL语句
3. 可能导致数据库被注入攻击

## 解决方案
\`\`\`php
$stmt = $pdo->prepare("SELECT * FROM users WHERE id = ? AND password = ?");
$stmt->execute([$id, $pwd]);
\`\`\`

## 防护建议
1. 使用参数化查询
2. 实施输入验证
3. 定期安全扫描
`,

  `# XSS跨站脚本攻击分析报告

## 漏洞详情
- **风险等级**: 高危
- **漏洞类型**: 存储型XSS
- **影响范围**: 评论功能
- **发现时间**: 2024-03-18 10:15:23

## 漏洞分析
\`\`\`javascript
// 不安全的实现
comment.innerHTML = userInput;
\`\`\`

## 解决方案
\`\`\`javascript
// 安全的实现
import DOMPurify from 'dompurify';
comment.innerHTML = DOMPurify.sanitize(userInput);
\`\`\`

## 防护建议
1. 输入过滤
2. 开启CSP
3. 设置Cookie安全属性
`,

  `# 文件上传漏洞分析报告

## 漏洞详情
- **风险等级**: 高危
- **漏洞类型**: 任意文件上传
- **影响范围**: 文件上传接口
- **发现时间**: 2024-03-19 09:45:12

## 漏洞分析
\`\`\`php
// 不安全的实现
move_uploaded_file($_FILES['file']['tmp_name'], $target_path);
\`\`\`

## 解决方案
\`\`\`php
// 安全的实现
$allowed = ['jpg', 'png', 'pdf'];
$ext = pathinfo($_FILES['file']['name'], PATHINFO_EXTENSION);
if (in_array($ext, $allowed)) {
    $target = $path . md5(uniqid()) . '.' . $ext;
    move_uploaded_file($_FILES['file']['tmp_name'], $target);
}
\`\`\`

## 防护建议
1. 文件类型验证
2. 文件名随机化
3. 存储路径限制
`,

  `# CSRF跨站请求伪造分析报告

## 漏洞详情
- **风险等级**: 中危
- **漏洞类型**: CSRF
- **影响范围**: 用户操作接口
- **发现时间**: 2024-03-20 15:30:00

## 漏洞分析
\`\`\`javascript
// 不安全的实现
fetch('/api/change-password', {
  method: 'POST',
  body: JSON.stringify({ newPassword })
});
\`\`\`

## 解决方案
\`\`\`javascript
// 安全的实现
fetch('/api/change-password', {
  method: 'POST',
  headers: {
    'X-CSRF-Token': csrfToken
  },
  body: JSON.stringify({ newPassword })
});
\`\`\`

## 防护建议
1. 使用CSRF令牌
2. 验证请求来源
3. SameSite Cookie
`,

  `# 权限提升漏洞分析报告

## 漏洞详情
- **风险等级**: 高危
- **漏洞类型**: 垂直越权
- **影响范围**: 管理接口
- **发现时间**: 2024-03-21 11:20:15

## 漏洞分析
\`\`\`javascript
// 不安全的实现
app.get('/admin/users', (req, res) => {
  db.query('SELECT * FROM users');
});
\`\`\`

## 解决方案
\`\`\`javascript
// 安全的实现
app.get('/admin/users', checkAdmin, (req, res) => {
  if (!req.user.isAdmin) {
    return res.status(403).json({ error: '无权限访问' });
  }
  db.query('SELECT * FROM users');
});
\`\`\`

## 防护建议
1. 角色权限控制
2. 接口鉴权
3. 操作日志记录
`,

  `# 敏感信息泄露分析报告

## 漏洞详情
- **风险等级**: 高危
- **漏洞类型**: 配置泄露
- **影响范围**: 配置文件
- **发现时间**: 2024-03-22 14:25:33

## 漏洞分析
\`\`\`yaml
# 不安全的配置
database:
  username: root
  password: 123456
  host: localhost
\`\`\`

## 解决方案
\`\`\`yaml
# 安全的配置
database:
  username: \${DB_USER}
  password: \${DB_PASS}
  host: \${DB_HOST}
\`\`\`

## 防护建议
1. 使用环境变量
2. 加密敏感信息
3. 访问权限控制
`,

  `# 密码安全分析报告

## 漏洞详情
- **风险等级**: 中危
- **漏洞类型**: 弱密码
- **影响范围**: 用户账户
- **发现时间**: 2024-03-23 16:40:18

## 漏洞分析
\`\`\`javascript
// 不安全的实现
const password = md5(userPassword);
\`\`\`

## 解决方案
\`\`\`javascript
// 安全的实现
import bcrypt from 'bcrypt';
const salt = await bcrypt.genSalt(10);
const password = await bcrypt.hash(userPassword, salt);
\`\`\`

## 防护建议
1. 使用强密码哈希
2. 加盐处理
3. 密码强度校验
`,

  `# API安全分析报告

## 漏洞详情
- **风险等级**: 高危
- **漏洞类型**: 接口未授权
- **影响范围**: REST API
- **发现时间**: 2024-03-24 09:15:42

## 漏洞分析
\`\`\`javascript
// 不安全的实现
app.get('/api/data', (req, res) => {
  return res.json(sensitiveData);
});
\`\`\`

## 解决方案
\`\`\`javascript
// 安全的实现
app.get('/api/data', verifyToken, (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: '未授权访问' });
  }
  return res.json(sensitiveData);
});
\`\`\`

## 防护建议
1. JWT认证
2. 接口限流
3. 请求加密
`,

  `# 服务器安全配置报告

## 配置详情
- **风险等级**: 中危
- **检查类型**: 安全基线
- **影响范围**: Web服务器
- **检查时间**: 2024-03-25 10:30:00

## 配置分析
\`\`\`nginx
# 不安全的配置
server {
    listen 80;
    server_name example.com;
}
\`\`\`

## 解决方案
\`\`\`nginx
# 安全的配置
server {
    listen 443 ssl http2;
    server_name example.com;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
}
\`\`\`

## 防护建议
1. 启用HTTPS
2. 配置安全头
3. 禁用危险方法
`,

  `# 容器安全分析报告

## 漏洞详情
- **风险等级**: 高危
- **漏洞类型**: 容器逃逸
- **影响范围**: Docker环境
- **发现时间**: 2024-03-26 13:20:55

## 漏洞分析
\`\`\`dockerfile
# 不安全的配置
FROM ubuntu:latest
RUN apt-get update
USER root
\`\`\`

## 解决方案
\`\`\`dockerfile
# 安全的配置
FROM ubuntu:22.04
RUN apt-get update && apt-get upgrade
RUN useradd -m appuser
USER appuser
\`\`\`

## 防护建议
1. 最小权限原则
2. 镜像漏洞扫描
3. 资源限制配置
`
]
