const chatHistories = {
  '[POST]/api/chat/history/1': () => ({
    code: 1,
    message: '',
    data: {
      id: 1,
      title: 'Python爬虫开发咨询',
      messages: [
        {
          id: 1,
          role: 'user',
          content: '你好，我想开发一个Python爬虫来抓取新闻网站的数据，有什么建议吗？'
        },
        {
          id: 2,
          role: 'assistant',
          content:
            '你好！开发新闻爬虫，我建议你可以考虑以下几点：\n\n1. 使用 requests 库发送HTTP请求，Beautiful Soup 解析HTML\n2. 考虑添加随机延迟，避免请求过于频繁\n3. 注意网站的robots.txt规则\n4. 保存数据建议使用MongoDB这类文档数据库\n\n需要我详细介绍某个部分吗？'
        },
        {
          id: 3,
          role: 'user',
          content: '能详细说说Beautiful Soup的用法吗？特别是如何定位和提取新闻标题、正文这些元素。'
        },
        {
          id: 4,
          role: 'assistant',
          content:
            '好的，我来介绍Beautiful Soup的主要用法：\n\n```python\nfrom bs4 import BeautifulSoup\n\n# 创建soup对象\nsoup = BeautifulSoup(html, "html.parser")\n\n# 查找元素的方法：\n# 1. 通过CSS选择器\ntitle = soup.select(".news-title")[0].text\n\n# 2. 通过find/find_all\ncontent = soup.find("div", class_="news-content").text\n\n# 3. 通过标签属性\ndate = soup.find("span", {"data-type": "publish-date"}).text\n```\n\n建议先用浏览器开发者工具分析网页结构，找到对应的CSS选择器或特征属性。'
        }
      ]
    }
  }),

  '[POST]/api/chat/history/2': () => ({
    code: 1,
    message: '',
    data: {
      id: 2,
      title: 'React性能优化分析',
      messages: [
        {
          id: 1,
          role: 'user',
          content: '我的React应用在处理大量数据时比较卡顿，有什么优化建议吗？'
        },
        {
          id: 2,
          role: 'assistant',
          content:
            '对于React应用的性能优化，我建议从以下几个方面入手：\n\n1. 使用React.memo()避免不必要的重渲染\n2. 使用useMemo缓存计算结果\n3. 使用useCallback缓存函数\n4. 实现虚拟列表处理大量数据\n5. 使用React.lazy进行代码分割\n\n你想先了解哪个部分？'
        },
        {
          id: 3,
          role: 'user',
          content: '能详细说说虚拟列表的实现方案吗？'
        },
        {
          id: 4,
          role: 'assistant',
          content:
            '虚拟列表（Virtual List）的核心实现思路是：\n\n1. 只渲染可视区域的内容\n2. 通过监听滚动位置动态更新显示的项目\n\n```jsx\nconst VirtualList = ({ items, itemHeight, windowHeight }) => {\n  const [scrollTop, setScrollTop] = useState(0);\n  \n  const visibleItems = items.slice(\n    Math.floor(scrollTop / itemHeight),\n    Math.ceil((scrollTop + windowHeight) / itemHeight)\n  );\n\n  return (\n    <div onScroll={e => setScrollTop(e.target.scrollTop)}>\n      {visibleItems.map(item => (\n        <div style={{ height: itemHeight }}>{item}</div>\n      ))}\n    </div>\n  );\n};\n```\n\n你也可以使用现成的库如react-window或react-virtualized。'
        }
      ]
    }
  }),

  '[POST]/api/chat/history/3': () => ({
    code: 1,
    message: '',
    data: {
      id: 3,
      title: '数据库设计咨询',
      messages: [
        {
          id: 1,
          role: 'user',
          content: '我正在设计一个电商系统的数据库，订单表和商品表的关系该如何设计？'
        },
        {
          id: 2,
          role: 'assistant',
          content:
            '对于电商系统，订单和商品的关系设计建议如下：\n\n1. 主要涉及的表：\n- orders（订单主表）\n- order_items（订单商品明细表）\n- products（商品表）\n\n2. 表结构示例：\n```sql\nCREATE TABLE orders (\n  id BIGINT PRIMARY KEY,\n  user_id BIGINT,\n  total_amount DECIMAL(10,2),\n  status VARCHAR(20),\n  created_at TIMESTAMP\n);\n\nCREATE TABLE order_items (\n  id BIGINT PRIMARY KEY,\n  order_id BIGINT,\n  product_id BIGINT,\n  quantity INT,\n  price DECIMAL(10,2)\n);\n```\n\n这样设计的好处是：\n1. 支持一个订单包含多个商品\n2. 保留下单时的商品价格\n3. 方便统计和查询'
        },
        {
          id: 3,
          role: 'user',
          content: '商品的价格和库存应该怎么设计？考虑到并发安全的问题。'
        },
        {
          id: 4,
          role: 'assistant',
          content:
            '商品价格和库存的设计需要特别注意并发控制：\n\n1. 库存建议单独建表：\n```sql\nCREATE TABLE product_inventory (\n  product_id BIGINT PRIMARY KEY,\n  quantity INT,\n  version INT,  -- 乐观锁版本号\n  updated_at TIMESTAMP\n);\n```\n\n2. 库存更新使用乐观锁：\n```sql\nUPDATE product_inventory \nSET quantity = quantity - 1, \n    version = version + 1,\n    updated_at = NOW()\nWHERE product_id = ? AND version = ?;\n```\n\n3. 价格历史建议也单独建表，便于追溯：\n```sql\nCREATE TABLE product_price_history (\n  id BIGINT PRIMARY KEY,\n  product_id BIGINT,\n  price DECIMAL(10,2),\n  start_time TIMESTAMP,\n  end_time TIMESTAMP\n);\n```'
        }
      ]
    }
  }),

  '[POST]/api/chat/history/4': () => ({
    code: 1,
    message: '',
    data: {
      id: 4,
      title: 'Docker容器化部署问题',
      messages: [
        {
          id: 1,
          role: 'user',
          content: '在Docker部署Node.js应用时遇到了内存占用过高的问题，如何优化？'
        },
        {
          id: 2,
          role: 'assistant',
          content:
            'Node.js应用在Docker中的内存优化，可以从以下几个方面入手：\n\n1. 容器配置优化：\n```dockerfile\nDOCKER_OPTS="--memory=1g --memory-swap=1g"\n```\n\n2. Node.js内存配置：\n```bash\nNODE_OPTIONS="--max-old-space-size=512"\n```\n\n3. 代码层面优化：\n- 使用stream处理大文件\n- 及时清理大对象引用\n- 使用PM2进行进程管理\n\n需要我详细解释某个部分吗？'
        },
        {
          id: 3,
          role: 'user',
          content: '能详细说说PM2的配置和使用吗？'
        },
        {
          id: 4,
          role: 'assistant',
          content:
            '好的，PM2的主要配置和使用方法如下：\n\n1. 配置文件示例(ecosystem.config.js)：\n```javascript\nmodule.exports = {\n  apps: [{\n    name: "app",\n    script: "./app.js",\n    instances: "max",\n    exec_mode: "cluster",\n    max_memory_restart: "300M",\n    env: {\n      NODE_ENV: "production"\n    }\n  }]\n}\n```\n\n2. 常用命令：\n```bash\n# 启动应用\npm2 start ecosystem.config.js\n\n# 查看状态\npm2 status\n\n# 查看日志\npm2 logs\n\n# 重启应用\npm2 restart app\n```\n\n3. 在Dockerfile中使用：\n```dockerfile\nRUN npm install pm2 -g\nCMD ["pm2-runtime", "ecosystem.config.js"]\n```'
        }
      ]
    }
  }),

  '[POST]/api/chat/history/5': () => ({
    code: 1,
    message: '',
    data: {
      id: 5,
      title: 'Vue3状态管理方案',
      messages: [
        {
          id: 1,
          role: 'user',
          content: '在Vue3项目中，Vuex和Pinia该选择哪个？为什么？'
        },
        {
          id: 2,
          role: 'assistant',
          content:
            '对于Vue3项目，我更推荐使用Pinia，原因如下：\n\n1. 更好的TypeScript支持\n2. 更简洁的API设计\n3. 不需要嵌套模块\n4. 更好的代码分割\n5. 不需要使用mutations\n\n来看一个Pinia的示例：\n```typescript\n// store/user.ts\nimport { defineStore } from "pinia"\n\nexport const useUserStore = defineStore("user", {\n  state: () => ({\n    name: "",\n    isLoggedIn: false\n  }),\n  actions: {\n    async login(username: string, password: string) {\n      // 直接修改state，不需要mutations\n      this.isLoggedIn = true\n      this.name = username\n    }\n  }\n})\n```'
        },
        {
          id: 3,
          role: 'user',
          content: 'Pinia的持久化存储怎么实现？'
        },
        {
          id: 4,
          role: 'assistant',
          content:
            'Pinia的持久化存储有两种实现方式：\n\n1. 使用插件 pinia-plugin-persistedstate：\n```typescript\nimport { createPinia } from "pinia"\nimport piniaPluginPersistedstate from "pinia-plugin-persistedstate"\n\nconst pinia = createPinia()\npinia.use(piniaPluginPersistedstate)\n\n// 在store中配置\ndefineStore({\n  persist: {\n    key: "user-store",\n    storage: localStorage,\n    paths: ["name", "isLoggedIn"]\n  }\n})\n```\n\n2. 自定义订阅实现：\n```typescript\nconst store = useUserStore()\nwatch(\n  () => store.$state,\n  (state) => {\n    localStorage.setItem("user-store", JSON.stringify(state))\n  },\n  { deep: true }\n)\n```'
        }
      ]
    }
  }),

  '[POST]/api/chat/history/6': () => ({
    code: 1,
    message: '',
    data: {
      id: 6,
      title: 'Kubernetes部署策略',
      messages: [
        {
          id: 1,
          role: 'user',
          content: '在K8s中如何实现零停机部署？'
        },
        {
          id: 2,
          role: 'assistant',
          content:
            'K8s中实现零停机部署主要有以下策略：\n\n1. Rolling Update（滚动更新）：\n```yaml\napiVersion: apps/v1\nkind: Deployment\nmetadata:\n  name: my-app\nspec:\n  replicas: 3\n  strategy:\n    type: RollingUpdate\n    rollingUpdate:\n      maxSurge: 1\n      maxUnavailable: 0\n```\n\n2. Blue-Green Deployment：\n使用Service切换流量：\n```yaml\napiVersion: v1\nkind: Service\nmetadata:\n  name: my-app\nspec:\n  selector:\n    version: v2  # 切换到新版本\n```\n\n3. Canary Deployment：\n使用Ingress进行流量分配。'
        },
        {
          id: 3,
          role: 'user',
          content: '能详细说说Canary部署的具体实现吗？'
        },
        {
          id: 4,
          role: 'assistant',
          content:
            'Canary部署的具体实现如下：\n\n1. 使用Ingress-Nginx配置：\n```yaml\napiVersion: networking.k8s.io/v1\nkind: Ingress\nmetadata:\n  annotations:\n    nginx.ingress.kubernetes.io/canary: "true"\n    nginx.ingress.kubernetes.io/canary-weight: "20"\nspec:\n  rules:\n  - host: my-app.com\n    http:\n      paths:\n      - path: /\n        pathType: Prefix\n        backend:\n          service:\n            name: my-app-canary\n            port:\n              number: 80\n```\n\n2. 使用Istio实现更细粒度的控制：\n```yaml\napiVersion: networking.istio.io/v1alpha3\nkind: VirtualService\nspec:\n  hosts:\n  - my-app.com\n  http:\n  - route:\n    - destination:\n        host: my-app-v1\n      weight: 80\n    - destination:\n        host: my-app-v2\n      weight: 20\n```'
        }
      ]
    }
  }),

  '[POST]/api/chat/history/7': () => ({
    code: 1,
    message: '',
    data: {
      id: 7,
      title: 'Redis缓存优化',
      messages: [
        {
          id: 1,
          role: 'user',
          content: '如何解决Redis缓存穿透和击穿问题？'
        },
        {
          id: 2,
          role: 'assistant',
          content:
            'Redis缓存问题的解决方案：\n\n1. 缓存穿透（查询不存在的数据）：\n- 布隆过滤器：\n```java\n@Bean\npublic BloomFilter<String> bloomFilter() {\n    return BloomFilter.create(\n        Funnels.stringFunnel(Charset.defaultCharset()),\n        1000000,  // 预计元素数量\n        0.01      // 误判率\n    );\n}\n```\n\n2. 缓存击穿（热点key过期）：\n- 使用互斥锁：\n```java\npublic String getData(String key) {\n    String value = redis.get(key);\n    if (value == null) {\n        String lockKey = "lock:" + key;\n        if (redis.setNx(lockKey, "1")) {\n            value = db.query(key);\n            redis.set(key, value, expireTime);\n            redis.del(lockKey);\n        } else {\n            Thread.sleep(50);\n            return getData(key);\n        }\n    }\n    return value;\n}\n```'
        },
        {
          id: 3,
          role: 'user',
          content: '布隆过滤器的误判率是什么意思？如何选择合适的参数？'
        },
        {
          id: 4,
          role: 'assistant',
          content:
            '布隆过滤器的误判率和参数选择：\n\n1. 误判率含义：\n- 可能会将不存在的元素误判为存在\n- 不会将存在的元素误判为不存在\n- 误判率越低，所需空间越大\n\n2. 参数计算公式：\n```python\n# n为元素数量，p为误判率\ndef calculate_bloom_filter_params(n, p):\n    m = -n * math.log(p) / (math.log(2) ** 2)  # 位数组大小\n    k = m / n * math.log(2)                    # 哈希函数个数\n    return int(m), int(k)\n```\n\n3. 常用参数参考：\n- 100万个元素，误判率0.01：需要9.6MB内存\n- 100万个元素，误判率0.001：需要14.4MB内存\n\n建议根据实际数据量和可接受的误判率来选择参数。'
        }
      ]
    }
  }),

  '[POST]/api/chat/history/8': () => ({
    code: 1,
    message: '',
    data: {
      id: 8,
      title: 'Flutter状态管理',
      messages: [
        {
          id: 1,
          role: 'user',
          content: '在Flutter中，Provider和Riverpod有什么区别？该如何选择？'
        },
        {
          id: 2,
          role: 'assistant',
          content:
            'Provider和Riverpod的主要区别：\n\n1. Provider：\n```dart\n// 定义状态\nclass CounterProvider extends ChangeNotifier {\n  int _count = 0;\n  int get count => _count;\n  \n  void increment() {\n    _count++;\n    notifyListeners();\n  }\n}\n\n// 使用状态\nMultiProvider(\n  providers: [\n    ChangeNotifierProvider(create: (_) => CounterProvider()),\n  ],\n  child: MyApp(),\n)\n```\n\n2. Riverpod优势：\n- 编译时安全\n- 无context依赖\n- 更好的测试支持\n- 自动缓存和依赖管理\n\n```dart\n// 定义状态\nfinal counterProvider = StateNotifierProvider<Counter, int>((ref) {\n  return Counter();\n});\n\n// 使用状态\nConsumer(\n  builder: (context, ref, child) {\n    final count = ref.watch(counterProvider);\n    return Text("$count");\n  },\n)\n```'
        },
        {
          id: 3,
          role: 'user',
          content: 'Riverpod如何处理异步数据和依赖关系？'
        },
        {
          id: 4,
          role: 'assistant',
          content:
            'Riverpod处理异步数据和依赖关系的方式：\n\n1. 异步数据处理：\n```dart\nfinal userProvider = FutureProvider.autoDispose.family<User, String>((ref, userId) async {\n  final repository = ref.watch(repositoryProvider);\n  return repository.fetchUser(userId);\n});\n\n// 使用时自动处理加载状态\nConsumer(\n  builder: (context, ref, child) {\n    return ref.watch(userProvider(userId)).when(\n      data: (user) => UserProfile(user: user),\n      loading: () => CircularProgressIndicator(),\n      error: (error, stack) => ErrorWidget(error),\n    );\n  },\n)\n```\n\n2. 依赖关系处理：\n```dart\nfinal cartTotalProvider = Provider<double>((ref) {\n  final cart = ref.watch(cartProvider);\n  final products = ref.watch(productsProvider);\n  \n  return cart.items.fold(\n    0,\n    (total, item) => total + (products[item.id]?.price ?? 0) * item.quantity,\n  );\n});\n```'
        }
      ]
    }
  }),

  '[POST]/api/chat/history/9': () => ({
    code: 1,
    message: '',
    data: {
      id: 9,
      title: 'GraphQL性能优化',
      messages: [
        {
          id: 1,
          role: 'user',
          content: '在GraphQL API中如何处理N+1查询问题？'
        },
        {
          id: 2,
          role: 'assistant',
          content:
            'GraphQL N+1查询问题的解决方案：\n\n1. 使用DataLoader批量加载：\n```javascript\nconst userLoader = new DataLoader(async (userIds) => {\n  const users = await User.findAll({\n    where: {\n      id: userIds\n    }\n  });\n  return userIds.map(id => \n    users.find(user => user.id === id)\n  );\n});\n\nconst resolvers = {\n  Post: {\n    author: async (post) => {\n      return userLoader.load(post.authorId);\n    }\n  }\n};\n```\n\n2. 使用字段级别的批处理：\n```javascript\nconst batchedResolver = createBatchResolver((sources) => {\n  const userIds = sources.map(post => post.authorId);\n  return User.findAll({ where: { id: userIds } });\n});\n```'
        },
        {
          id: 3,
          role: 'user',
          content: '如何实现GraphQL查询的缓存？'
        },
        {
          id: 4,
          role: 'assistant',
          content:
            'GraphQL查询缓存的实现方案：\n\n1. 客户端缓存（Apollo Client）：\n```typescript\nconst client = new ApolloClient({\n  cache: new InMemoryCache({\n    typePolicies: {\n      Query: {\n        fields: {\n          posts: {\n            merge(existing, incoming) {\n              return incoming;\n            },\n            read(existing) {\n              return existing;\n            }\n          }\n        }\n      }\n    }\n  })\n});\n```\n\n2. 服务端缓存：\n```javascript\nimport ResponsiveCachePlugin from "apollo-server-plugin-response-cache";\n\nconst server = new ApolloServer({\n  plugins: [\n    ResponsiveCachePlugin({\n      sessionId: (requestContext) => (\n        requestContext.request.http.headers.get("authorization") || null\n      ),\n      extraCacheKeyData: (requestContext) => ({\n        host: requestContext.request.http.headers.get("host")\n      })\n    })\n  ]\n});\n```'
        }
      ]
    }
  }),

  '[POST]/api/chat/history/10': () => ({
    code: 1,
    message: '',
    data: {
      id: 10,
      title: 'Nginx负载均衡配置',
      messages: [
        {
          id: 1,
          role: 'user',
          content: '如何在Nginx中实现权重负载均衡和健康检查？'
        },
        {
          id: 2,
          role: 'assistant',
          content:
            'Nginx负载均衡配置示例：\n\n1. 权重负载均衡：\n```nginx\nhttp {\n    upstream backend {\n        server backend1.example.com weight=3;\n        server backend2.example.com weight=2;\n        server backend3.example.com weight=1;\n    }\n\n    server {\n        listen 80;\n        location / {\n            proxy_pass http://backend;\n        }\n    }\n}\n```\n\n2. 健康检查配置：\n```nginx\nhttp {\n    upstream backend {\n        server backend1.example.com max_fails=3 fail_timeout=30s;\n        server backend2.example.com max_fails=3 fail_timeout=30s;\n        \n        check interval=3000 rise=2 fall=5 timeout=1000 type=http;\n        check_http_send "HEAD / HTTP/1.0\\r\\n\\r\\n";\n        check_http_expect_alive http_2xx http_3xx;\n    }\n}\n```'
        },
        {
          id: 3,
          role: 'user',
          content: '如何配置Nginx的缓存来提高性能？'
        },
        {
          id: 4,
          role: 'assistant',
          content:
            'Nginx缓存配置的最佳实践：\n\n1. 代理缓存配置：\n```nginx\nhttp {\n    # 设置缓存路径和参数\n    proxy_cache_path /path/to/cache levels=1:2 keys_zone=my_cache:10m max_size=10g inactive=60m use_temp_path=off;\n    \n    server {\n        location / {\n            proxy_cache my_cache;\n            proxy_cache_use_stale error timeout http_500 http_502 http_503 http_504;\n            proxy_cache_valid 200 302 10m;\n            proxy_cache_valid 404 1m;\n            \n            # 添加缓存标识头\n            add_header X-Cache-Status $upstream_cache_status;\n        }\n    }\n}\n```\n\n2. 静态文件缓存：\n```nginx\nlocation ~* \\.(jpg|jpeg|png|gif|ico|css|js)$ {\n    expires 30d;\n    add_header Cache-Control "public, no-transform";\n}\n```'
        }
      ]
    }
  })
}

export default chatHistories
