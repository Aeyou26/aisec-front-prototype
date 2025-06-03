import { defineMock } from '@alova/mock'
import chatMock from './mock/chat'

export default defineMock({
  '[POST]/api/user/robot/page': () => {
    return {
      code: 1,
      message: '',
      data: [
        {
          id: '1',
          name: '安全运维数字人',
          useScene: '智能问答和安全咨询，7x24小时为您提供专业安全建议',
          prolog: '您好！我是您的专属安全助手，可以为您解答各种网络安全问题。',
          avatar: 'aq',
          img: '/src/assets/images/robot-1.png',
          abilityList: [
            { id: '1-1', name: '智能运维', agentId: '1', useScene: '提供专业安全建议' },
            { id: '1-2', name: '应急响应', agentId: '1', useScene: '分析安全威胁' },
            { id: '1-3', name: '流量分析', agentId: '1', useScene: '合规性检查' },
            { id: '1-4', name: '漏洞下发', agentId: '1', useScene: '安全风险评估' }
          ]
        },
        {
          id: '3',
          name: '安全分析数字人',
          useScene: '专业漏洞扫描、分析和修复建议，守护系统安全',
          prolog: '我专注于漏洞检测与分析，帮助您及时发现并修复安全漏洞。',
          avatar: 'hg',
          img: '/src/assets/images/robot-2.png',
          abilityList: [
            { id: '3-1', name: '钓鱼邮件', agentId: '3', useScene: '系统漏洞扫描' },
            { id: '3-2', name: 'WebShell', agentId: '3', useScene: '漏洞风险评级' },
            { id: '3-3', name: '日志分析', agentId: '3', useScene: '漏洞修复指导' },
            { id: '3-4', name: '漏洞检测', agentId: '3', useScene: '漏洞趋势分析' }
          ]
        },
        {
          id: '2',
          name: '资产监测数字人',
          useScene: 'IT资产全生命周期管理，让每一项资产都在掌控之中',
          prolog: '我是您的资产管家，为您提供全面的IT资产管理服务。',
          avatar: 'zc',
          img: '/src/assets/images/robot-3.png',
          abilityList: [
            { id: '2-1', name: '资产识别', agentId: '2', useScene: 'IT资产盘点' },
            { id: '2-2', name: '资产报告', agentId: '2', useScene: '资产配置管理' },
            { id: '2-3', name: '风险监测', agentId: '2', useScene: '资产状态监控' },
            { id: '2-4', name: '多维报告', agentId: '2', useScene: '资产生命周期管理' }
          ]
        },
        {
          id: '4',
          name: '源码审计数字人',
          useScene: '智能生成各类安全报告，数据可视化呈现',
          prolog: '我专注于生成专业的安全报告，让数据说话。',
          avatar: 'sj',
          img: '/src/assets/images/robot-5.png',
          abilityList: [
            { id: '4-1', name: '组件分析', agentId: '4', useScene: '自动生成安全报告' },
            { id: '4-2', name: '代码分析', agentId: '4', useScene: '安全数据分析' },
            { id: '4-3', name: '质量检查', agentId: '4', useScene: '数据可视化' },
            { id: '4-4', name: '合规检查', agentId: '4', useScene: '安全趋势预测' }
          ]
        },
        {
          id: '5',
          name: '分类分级数字人',
          useScene: '企业安全合规检查，确保符合各项安全标准',
          prolog: '我是合规顾问，帮助您的企业符合各项安全合规要求。',
          avatar: 'yw',
          img: '/src/assets/images/robot-6.png',
          abilityList: [
            { id: '5-1', name: '数据识别', agentId: '5', useScene: '安全合规审核' },
            { id: '5-2', name: '分类分级', agentId: '5', useScene: '标准符合性检查' },
            { id: '5-3', name: '合规评估', agentId: '5', useScene: '合规整改指导' },
            { id: '5-4', name: '审计报告', agentId: '5', useScene: '合规状态监控' }
          ]
        }
      ]
    }
  },
  '[GET]/api/model/select': () => {
    return {
      code: 1,
      message: '',
      data: [
        {
          id: 1,
          model_name: 'GPT-4',
          function_name: '智能对话模型',
          max_len_input: '8000',
          url: 'https://api.openai.com/v1/chat/completions',
          key: 'demo-key'
        }
      ]
    }
  },
  '[POST]/api/login': () => {
    return { code: 1, message: '', data: { token: '1234567890' } }
  },
  '[POST]/api/logout': () => {
    return { code: 1, message: '', data: { token: '' } }
  },
  '[POST]/api/test/uploadFile': () => {
    return { code: 1, message: '', data: { file: '' } }
  },
  '[POST]/api/assets/synchronous': () => {
    return { code: 1, message: '', data: {} }
  },
  '[POST]/api/user/asset/page1': () => {
    return {
      code: 1,
      message: '',
      data: [
        {
          id: 1,
          type: '业务服务器',
          name: '公网门户网站系统',
          description: '对外公示性网站，用于公布本单位最新工作动态等',
          domain: 'https://10.50.120.240/',
          os: 'Windows Server 2012 R2 Datacenter, 64-bit',
          database: 'MSSQL 2016',
          databaseVersion: 'MSSQL 2016',
          language: 'C#',
          middleware: 'IIS8.5 asp.net 3.5',
          ports: '80/443',
          developer: '深圳市医创联合科技有限公司',
          developerContact: '李广明',
          developerPhone: '0755-88601396 /15899568390',
          location: '虚拟机－１号楼负一楼总房',
          owner: '方程',
          isCore: true,
          status: 1,
          createTime: '2021-01-01 12:00:00'
        },
        {
          id: 2,
          type: '业务服务器',
          name: '产前诊断管理系统',
          description: '产前诊断管理系统',
          domain: 'http://10.50.120.9:8080/PDP/login.jsp',
          os: 'Windows Server 2008 R2 Enterprise, 64-bit',
          database: 'oracle',
          databaseVersion: '11.2.0.1.0',
          language: 'JAVA',
          middleware: 'tomcat 7.0.57 IREPORT 5.5.0',
          ports: '8080/1521',
          developer: '广州正翰计算机科技有限公司',
          developerContact: '曾卓君',
          developerPhone: '康涛 13924292886',
          location: '虚拟机－１号楼负一楼总房',
          owner: '方程',
          isCore: true,
          status: 1,
          createTime: '2021-01-01 12:00:00'
        },
        {
          id: 3,
          type: '业务服务器',
          name: '检验质控管理系统',
          description: '检验质控管理系统',
          domain: 'C/S',
          os: 'Windows Server 2008 R2 Enterprise, 64-bit',
          database: 'sql2008 R2',
          databaseVersion: 'sql2008 R2',
          language: 'C#',
          middleware: '.net4.0 office2010以上版本',
          ports: '8099/80/1433',
          developer: '广州翰宇计算机科技有限公司',
          developerContact: '罗剑东',
          developerPhone: '覃培峰 13558080894',
          location: '虚拟机－１号楼负一楼总房',
          owner: '方程',
          isCore: true,
          status: 1,
          createTime: '2021-01-01 12:00:00'
        },
        {
          id: 4,
          type: '业务服务器',
          name: '妇幼建档服务器',
          description: '妇幼孕妇建档',
          domain: 'https://10.50.120.20',
          os: 'Windows Server 2012 R2 Datacenter, 64-bit',
          database: 'MSSQL',
          databaseVersion: 'MSSQL',
          language: 'C#',
          middleware: 'IIS7 .NET4.0',
          ports: '443,21,8008,8087',
          developer: '南山妇幼保健院',
          developerContact: '',
          developerPhone: '87850088-60405',
          location: '虚拟机－１号楼负一楼总房',
          owner: '方程',
          isCore: true,
          status: 1,
          createTime: '2021-01-01 12:00:00'
        },
        {
          id: 5,
          type: '业务服务器',
          name: '安测体检服务器',
          description: '安测儿童体检',
          domain: 'https://10.50.120.26/access/login',
          os: 'Windows Server 2012 R2 Datacenter, 64-bit',
          database: 'SQL Server2014',
          databaseVersion: 'SQL Server2014',
          language: 'C#;.Net;netcore3.1',
          middleware: 'redis3.0.504; mongodb4.2.5 consul1.9.0 ;ocelot14.0.5',
          ports: '49819,49818,10047,5589,8899',
          developer: '深圳市安测健康信息技术有限公司',
          developerContact: '梁艳妮',
          developerPhone: '0755-86239437 0755-83209797',
          location: '虚拟机－１号楼负一楼总房',
          owner: '方程',
          isCore: true,
          status: 1,
          createTime: '2021-01-01 12:00:00'
        },
        {
          id: 6,
          type: '业务服务器',
          name: 'DNS及工号管理系统',
          description: 'DNS及工号管理',
          domain: 'C/S',
          os: 'Windows Server 2008 R2 Enterprise, 64-bit',
          database: 'MSSQL',
          databaseVersion: '10.50.1600.1',
          language: '/',
          middleware: '/',
          ports: '/',
          developer: '南山妇幼保健院',
          developerContact: '',
          developerPhone: '87850088-60405',
          location: '虚拟机－１号楼负一楼总房',
          owner: '方程',
          isCore: true,
          status: 1,
          createTime: '2021-01-01 12:00:00'
        },
        {
          id: 7,
          type: '业务服务器',
          name: '柯丽尔自助机2',
          description: '自助机前置机',
          domain: 'http://10.50.99.5:8003/Home/Index',
          os: 'Windows Server 2012 R2 Datacenter, 64-bit',
          database: 'mysql',
          databaseVersion: '5.6.21',
          language: 'java、.net',
          middleware: '无',
          ports: '8001、8002、8003、8004、8005、8006、8007、8008、8009、8010、8011、8012、8013、9998',
          developer: '深圳市巨鼎医疗设备有限公司',
          developerContact: '肖龙',
          developerPhone: '15989490020',
          location: '虚拟机－１号楼负一楼总房',
          owner: '方程',
          isCore: true,
          status: 1,
          createTime: '2021-01-01 12:00:00'
        },
        {
          id: 8,
          type: '业务服务器',
          name: '供应室管理系统',
          description: '供应室追溯',
          domain: 'http://10.50.120.203:8088',
          os: 'Windows Server 2008 R2 Standard, 64-bit',
          database: 'MSSQL',
          databaseVersion: '10.0.5500.0',
          language: '/',
          middleware: 'tomcat 7.0',
          ports: '8009/8088',
          developer: '/',
          developerContact: '/',
          developerPhone: '/',
          location: '虚拟机－１号楼负一楼总房',
          owner: '方程',
          isCore: true,
          status: 1,
          createTime: '2021-01-01 12:00:00'
        },
        {
          id: 9,
          type: '业务服务器',
          name: '人事系统',
          description: '院内人事及工号管理',
          domain: 'http://10.50.120.205/HRWEB/',
          os: 'Windows Server 2008 R2 Enterprise, 64-bit',
          database: '无',
          databaseVersion: '无',
          language: '/',
          middleware: '/',
          ports: '80',
          developer: '南山妇幼保健院',
          developerContact: '',
          developerPhone: '87850088-60405',
          location: '虚拟机－１号楼负一楼总房',
          owner: '方程',
          isCore: true,
          status: 1,
          createTime: '2021-01-01 12:00:00'
        },
        {
          id: 10,
          type: '业务服务器',
          name: '出生证扫描服务器',
          description: '出生证扫描服务器',
          domain: 'https://10.50.120.236:8080',
          os: 'Windows Server 2008 R2 Enterprise, 64-bit',
          database: 'MSSQL',
          databaseVersion: '10.50.1600.1',
          language: '/',
          middleware: '/',
          ports: '8080',
          developer: '/',
          developerContact: '/',
          developerPhone: '/',
          location: '虚拟机－１号楼负一楼总房',
          owner: '方程',
          isCore: true,
          status: 1,
          createTime: '2021-01-01 12:00:00'
        }
      ],
      total: 10
    }
  },
  '[POST]/api/user/loophole/threat/page1': () => {
    return {
      code: 1,
      message: '',
      data: [
        {
          id: 1,
          ip: '192.168.147.121',
          hostname: 'KM58AAD2',
          os: 'Olivetti 65C-9 printer',
          riskLevel: '非常危险',
          highRisk: 2,
          mediumRisk: 2,
          lowRisk: 12,
          total: 16,
          riskScore: 7.0
        },
        {
          id: 2,
          ip: '192.168.147.201',
          hostname: 'LRN842519G57F3A',
          os: 'embedded',
          riskLevel: '非常危险',
          highRisk: 1,
          mediumRisk: 1,
          lowRisk: 9,
          total: 11,
          riskScore: 7.5
        },
        {
          id: 3,
          ip: '192.168.147.122',
          hostname: 'FX-D2634D',
          os: 'OS 1.00',
          riskLevel: '非常危险',
          highRisk: 1,
          mediumRisk: 0,
          lowRisk: 10,
          total: 11,
          riskScore: 7.5
        },
        {
          id: 4,
          ip: '192.168.147.73',
          hostname: 'PB2-B73ZJY',
          os: 'Windows 10 Enterprise LTSC',
          riskLevel: '非常危险',
          highRisk: 1,
          mediumRisk: 0,
          lowRisk: 14,
          total: 15,
          riskScore: 7.5
        },
        {
          id: 5,
          ip: '192.168.147.69',
          hostname: 'PC2-Z69ZLL',
          os: 'Windows 10 Enterprise LTSC',
          riskLevel: '非常危险',
          highRisk: 1,
          mediumRisk: 0,
          lowRisk: 14,
          total: 15,
          riskScore: 7.5
        },
        {
          id: 6,
          ip: '192.168.147.21',
          hostname: 'PA2-B21WYJ',
          os: 'Windows 10 Enterprise LTSC',
          riskLevel: '非常危险',
          highRisk: 1,
          mediumRisk: 0,
          lowRisk: 14,
          total: 15,
          riskScore: 7.5
        },
        {
          id: 7,
          ip: '192.168.147.202',
          hostname: '',
          os: 'Linux',
          riskLevel: '比较危险',
          highRisk: 0,
          mediumRisk: 2,
          lowRisk: 5,
          total: 7,
          riskScore: 5
        },
        {
          id: 8,
          ip: '192.168.147.120',
          hostname: '',
          os: 'Linux 2.6.9 - 2.6.33',
          riskLevel: '比较危险',
          highRisk: 0,
          mediumRisk: 1,
          lowRisk: 7,
          total: 8,
          riskScore: 5
        },
        {
          id: 9,
          ip: '192.168.147.126',
          hostname: '',
          os: 'Linux',
          riskLevel: '比较安全',
          highRisk: 0,
          mediumRisk: 0,
          lowRisk: 4,
          total: 4,
          riskScore: 3
        },
        {
          id: 10,
          ip: '192.168.147.125',
          hostname: '',
          os: 'Linux',
          riskLevel: '比较安全',
          highRisk: 0,
          mediumRisk: 0,
          lowRisk: 16,
          total: 16,
          riskScore: 2.0
        }
      ],
      total: 10
    }
  },
  '[POST]/api/user/report/page1': () => {
    return {
      code: 1,
      message: '',
      data: [
        {
          id: 1,
          reportName: '2024年第一季度安全评估报告',
          createType: '定期评估',
          source: '系统自动生成',
          createTime: '2024-03-31 14:30:00'
        },
        {
          id: 2,
          reportName: '漏洞扫描月度报告',
          createType: '月度报告',
          source: '系统自动生成',
          createTime: '2024-03-28 09:15:00'
        },
        {
          id: 3,
          reportName: '资产安全评估报告',
          createType: '专项评估',
          source: '手动生成',
          createTime: '2024-03-25 16:45:00'
        },
        {
          id: 4,
          reportName: '系统安全基线检查报告',
          createType: '基线检查',
          source: '系统自动生成',
          createTime: '2024-03-20 11:20:00'
        },
        {
          id: 5,
          reportName: '网络安全事件分析报告',
          createType: '事件分析',
          source: '手动生成',
          createTime: '2024-03-15 13:40:00'
        },
        {
          id: 6,
          reportName: '安全漏洞修复跟踪报告',
          createType: '漏洞跟踪',
          source: '系统自动生成',
          createTime: '2024-03-10 10:30:00'
        },
        {
          id: 7,
          reportName: '系统安全配置评估报告',
          createType: '配置评估',
          source: '手动生成',
          createTime: '2024-03-05 15:25:00'
        },
        {
          id: 8,
          reportName: '安全运维月度总结报告',
          createType: '月度总结',
          source: '手动生成',
          createTime: '2024-03-01 09:00:00'
        },
        {
          id: 9,
          reportName: '应急响应演练报告',
          createType: '应急演练',
          source: '手动生成',
          createTime: '2024-02-28 14:15:00'
        },
        {
          id: 10,
          reportName: '安全培训效果评估报告',
          createType: '培训评估',
          source: '手动生成',
          createTime: '2024-02-25 16:50:00'
        }
      ],
      total: 10
    }
  },
  '[GET]/api/assets/list': () => {
    return {
      code: 1,
      message: '',
      data: [
        { id: 1, name: '资产1', ip: '192.168.1.1', port: 80, type: 'web', status: 1, createTime: '2021-01-01 12:00:00' },
        { id: 2, name: '资产2', ip: '192.168.1.2', port: 8080, type: 'page', status: 0, createTime: '2021-01-01 12:00:00' },
        { id: 3, name: '资产3', ip: '192.168.1.3', port: 8080, type: 'web', status: 1, createTime: '2021-01-01 12:00:00' },
        { id: 4, name: '资产4', ip: '192.168.1.4', port: 8080, type: 'web', status: 1, createTime: '2021-01-01 12:00:00' },
        { id: 5, name: '资产5', ip: '192.168.1.5', port: 8080, type: 'web', status: 1, createTime: '2021-01-01 12:00:00' },
        { id: 6, name: '资产6', ip: '192.168.1.6', port: 8080, type: 'web', status: 0, createTime: '2021-01-01 12:00:00' },
        { id: 7, name: '资产7', ip: '192.168.1.7', port: 8080, type: 'web', status: 1, createTime: '2021-01-01 12:00:00' },
        { id: 8, name: '资产8', ip: '192.168.1.8', port: 8080, type: 'web', status: 1, createTime: '2021-01-01 12:00:00' },
        { id: 9, name: '资产9', ip: '192.168.1.9', port: 8080, type: 'web', status: 1, createTime: '2021-01-01 12:00:00' },
        { id: 10, name: '资产10', ip: '192.168.1.10', port: 8080, type: 'web', status: 1, createTime: '2021-01-01 12:00:00' }
      ],
      total: 10
    }
  },
  '[POST]/api/role/page1': () => {
    return {
      code: 1,
      message: '',
      data: [
        {
          id: 1,
          name: 'admin',
          bot: ['1', '2', '3']
        },
        {
          id: 2,
          name: 'cnns',
          bot: ['5', '4', '3']
        },
        {
          id: 3,
          name: 'liugz',
          bot: ['2', '4', '3']
        },
        {
          id: 4,
          name: 'ougc',
          bot: ['1', '2', '3']
        }
      ],
      total: 10
    }
  },
  '[POST]/api/user/page1': () => {
    return {
      code: 1,
      message: '',
      data: [
        {
          id: 1,
          name: 'admin',
          role: 'admin',
          nickname: '管理员',
          phone: '12345678901',
          email: 'admin@example.com'
        },
        {
          id: 2,
          name: 'liugz',
          role: 'admin',
          nickname: '大佬',
          phone: '12345678901',
          email: 'admin@example.com'
        },
        {
          id: 3,
          name: 'ougc',
          role: 'admin',
          nickname: '小弟',
          phone: '12345678901',
          email: 'admin@example.com'
        }
      ],
      total: 3
    }
  },
  '[POST]/api/agent/page1': () => {
    return {
      code: 1,
      message: '',
      data: [
        {
          id: 1,
          name: '能力1',
          useScene: '场景1',
          abilityType: '类型1',
          inputPrompt: '提示词1',
          bot: ['1', '2', '3'],
          prolog: '开场白1',
          status: 1,
          createTime: '2025-03-01 12:00:00',
          updateTime: '2025-03-01 12:00:00'
        },
        {
          id: 2,
          name: '能力2',
          useScene: '场景2',
          abilityType: '类型2',
          inputPrompt: '提示词2',
          bot: ['1', '2', '3'],
          prolog: '开场白2',
          status: 0,
          createTime: '2025-03-01 12:00:00',
          updateTime: '2025-03-01 12:00:00'
        },
        {
          id: 3,
          name: '能力3',
          useScene: '场景3',
          abilityType: '类型3',
          inputPrompt: '提示词3',
          bot: ['1', '2', '3'],
          prolog: '开场白3',
          status: 1,
          createTime: '2025-03-01 12:00:00',
          updateTime: '2025-03-01 12:00:00'
        }
      ],
      total: 3
    }
  },
  '[POST]/api/model/list': () => {
    return {
      code: 1,
      message: '',
      data: [
        {
          id: 1,
          name: 'DeepSeek-R1',
          modelType: 'chat',
          modelVersion: '1.0.0',
          modelStatus: 1,
          createTime: '2025-03-01 12:00:00',
          updateTime: '2025-03-01 12:00:00'
        }
      ],
      total: 3
    }
  },
  '[POST]/api/task/page': () => {
    return {
      code: 1,
      message: '',
      data: [
        {
          addType: 1,
          analyzeSuccess: 6,
          analyzeTotal: 6,
          hostname: '资产管理系统',
          id: '1805185265694597122',
          ip: '10.12.21.21',
          propertyType: '业务系统',
          robots: '资产监测数字人',
          taskLogTotal: 1,
          taskName: '资产数据同步',
          updateBy: 'admin',
          updateTime: '2025-03-10 10:24:41'
        },
        {
          addType: 1,
          analyzeSuccess: 6,
          analyzeTotal: 6,
          hostname: 'HIS系统',
          id: '1805185265694597123',
          ip: '10.12.21.3',
          propertyType: '业务系统',
          robots: '合规审计数字人',
          taskLogTotal: 1,
          taskName: '业务系统合规评估',
          updateBy: 'admin',
          updateTime: '2025-03-05 09:32:21'
        },
        {
          addType: 1,
          analyzeSuccess: 80,
          analyzeTotal: 100,
          hostname: '日志管理服务器',
          id: '1805185265694597124',
          ip: '10.12.21.10',
          propertyType: '业务系统',
          robots: '安全分析数字人',
          taskLogTotal: 1,
          taskName: '日志采集',
          updateBy: 'admin',
          updateTime: '2025-03-01 10:22:31'
        },
        {
          addType: 1,
          analyzeSuccess: 6,
          analyzeTotal: 6,
          hostname: '就诊小程序',
          id: '1805185265694597125',
          ip: '10.12.21.11',
          propertyType: '业务系统',
          robots: '安全分析数字人',
          taskLogTotal: 1,
          taskName: '小程序漏洞扫描',
          updateBy: 'admin',
          updateTime: '2025-03-03 14:21:20'
        }
      ],
      total: 4
    }
  },
  '[POST]/api/user/report/template/page': () => {
    return {
      code: 1,
      message: '',
      data: [
        {
          id: '1',
          templateName: '对话输出安全报告模板',
          templateType: '1',
          createTime: '2025-05-24 14:44:45',
          description: '统计部门在一定期内资产的安全情况，包括资产数量、漏洞数量、漏洞修复情况等',
          content: `# **对话输出安全报告**

## 安安全全平平安安

{{mediumRiskVulnerabilityCount}} {{assetCount}} 是的发放 {{riskAssetCount}}`,
          status: '1'
        },
        {
          id: '2',
          templateName: '安全状况日报模板',
          templateType: '2',
          createTime: '2025-05-24 14:44:45',
          description: '日报日报日报',
          content: '',
          status: '1'
        },
        {
          id: '3',
          templateName: '安全状况周报模板',
          templateType: '3',
          createTime: '2025-05-24 14:44:45',
          description: '周报周报周报',
          content: '',
          status: '1'
        },
        {
          id: '4',
          templateName: '安全状况月报模板',
          templateType: '4',
          createTime: '2025-05-24 14:44:45',
          description: '月报月报月报',
          content: '',
          status: '1'
        },
        {
          id: '5',
          templateName: '安全状况季报模板',
          templateType: '5',
          createTime: '2025-05-24 14:44:45',
          content: '',
          description: '季报季报季报',
          status: '1'
        },
        {
          id: '6',
          templateName: '安全状况年报模板',
          templateType: '6',
          createTime: '2025-05-24 14:44:45',
          description: '年报年报年报',
          content: '',
          status: '1'
        },
        {
          id: '7',
          templateName: '旧版对话输出报告',
          templateType: '1',
          createTime: '2025-04-24 14:44:45',
          description: '旧版对话输出报告模板，已停用',
          content: '',
          status: '0'
        },
        {
          id: '8',
          templateName: '旧版日报模板',
          templateType: '2',
          createTime: '2025-04-24 14:44:45',
          description: '旧版日报模板，已停用',
          content: '',
          status: '0'
        },
        {
          id: '9',
          templateName: '草稿周报模板',
          templateType: '3',
          createTime: '2025-05-10 14:44:45',
          description: '草稿状态的周报模板，准备推出',
          content: '',
          status: '0'
        }
      ],
      total: 9
    }
  },
  ...chatMock
})
