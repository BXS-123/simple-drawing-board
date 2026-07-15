# 简易画板工具 (Simple Drawing Board)
一个基于 HTML5 Canvas 的在线绘图工具，支持用户注册登录、作品管理和云端保存。







## ✨ 功能特性
### 用户模块
- 用户注册 / 登录（JWT 认证）
- 修改密码 / 注销账号
- 权限控制（未登录仅可访问登录页）

### 作品管理
- 新建 / 查看 / 编辑 / 删除作品
- 作品列表按时间排序
- 缩略图预览

### 绘图功能
| 工具 | 说明 |
|------|------|
| 画笔 | 自由绘制 |
| 橡皮擦 | 擦除内容 |
| 矩形 / 圆形 / 直线 / 三角形 | 几何图形绘制 |
| 文字 | 文本输入 |

- 自定义颜色选择器
- 可调线宽、透明度、笔触样式
- 撤销 / 重做（Ctrl+Z / Ctrl+Y）
- 画布缩放、全屏显示、网格辅助线
- 创作计时器

### 快捷键
| 快捷键 | 功能 |
|--------|------|
| `B` | 画笔 |
| `E` | 橡皮擦 |
| `R` | 矩形 |
| `C` | 圆形 |
| `L` | 直线 |
| `T` | 文字 |
| `Ctrl+Z` | 撤销 |
| `Ctrl+Y` | 重做 |
| `Ctrl+S` | 保存到本地 |
| `Ctrl+Shift+S` | 保存到云端 |
| `Ctrl+N` | 新建画布 |

## 🏗 技术栈
### 后端
- **框架**: Spring Boot 3.1.5
- **ORM**: MyBatis-Plus 3.5.6
- **安全**: Spring Security + JWT (jjwt 0.12.5)
- **数据库**: MySQL 8.0
- **构建**: Maven

### 前端
- **核心技术**: HTML5 Canvas + Vanilla JavaScript
- **构建工具**: Vite 5
- **样式**: CSS3
- **HTTP 通信**: Fetch API

## 📁 项目结构
```
simple-drawing-board/
├── huabu-backend/          # 后端服务 (Spring Boot)
│   ├── pom.xml
│   ├── src/
│   │   ├── main/java/com/example/huabu/
│   │   │   ├── HuabuApplication.java     # 启动类
│   │   │   ├── config/                   # 配置类
│   │   │   ├── controller/               # REST API 控制器
│   │   │   ├── dto/                      # 数据传输对象
│   │   │   ├── entity/                   # 实体类
│   │   │   ├── filter/                   # JWT 过滤器
│   │   │   ├── mapper/                   # MyBatis Mapper
│   │   │   ├── service/                  # 业务逻辑
│   │   │   └── util/                     # 工具类 (JWT)
│   │   └── resources/
│   │       ├── application.yml           # 应用配置
│   │       └── mapper/                   # XML Mapper
│   ├── init-db.sql                       # 数据库初始化脚本
│   └── reset_admin.sql                   # 重置管理员密码脚本
├── huabu-frontend/          # 前端应用 (HTML5 Canvas)
│   ├── index.html                     # 画板主页面
│   ├── login.html                     # 登录页
│   ├── register.html                  # 注册页
│   ├── dashboard.html                 # 仪表盘
│   ├── my-works.html                  # 我的作品页
│   ├── user-center.html               # 个人中心页
│   ├── app.js                         # 画布核心逻辑
│   ├── auth.js                        # 认证模块
│   ├── dashboard.js                   # 仪表盘逻辑
│   ├── main.js                        # 主入口
│   ├── works.js                       # 作品管理逻辑
│   ├── user-center.js                 # 个人中心逻辑
│   ├── advanced-features.js           # 高级功能
│   ├── styles.css                     # 全局样式
│   ├── package.json                   # 前端依赖
│   └── vite.config.js                 # Vite 配置
├── .gitignore
└── README.md
```

## 🚀 快速开始
### 环境要求
| 环境 | 版本 |
|------|------|
| JDK | 17+ |
| Maven | 3.8+ |
| Node.js | 18+ |
| MySQL | 8.0+ |

### 1. 数据库初始化
```bash
# 登录 MySQL
mysql -u root -p

# 执行初始化脚本
source huabu-backend/init-db.sql

# (可选) 重置管理员密码
source huabu-backend/reset_admin.sql
```
默认管理员账号：
- 用户名：`admin`
- 密码：`abc123`

### 2. 启动后端
```bash
cd huabu-backend

# 复制配置模板
cp src/main/resources/application-example.yml src/main/resources/application.yml
# 编辑 application.yml，填写你的数据库连接信息

# 编译并启动
mvn spring-boot:run
```
后端默认运行在 `http://localhost:3001`

### 3. 启动前端
```bash
cd huabu-frontend

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 或构建生产版本
npm run build
```
前端默认运行在 `http://localhost:5173`

> **注意**: 开发时需要在后端 `application.yml` 中配置跨域，或将前端代理指向后端地址。

### 4. 环境变量配置
后端通过环境变量覆盖默认配置：
| 变量名 | 默认值 | 说明 |
|--------|--------|------|
| `DB_HOST` | localhost | 数据库地址 |
| `DB_PORT` | 3306 | 数据库端口 |
| `DB_NAME` | huabu_db | 数据库名 |
| `DB_USERNAME` | root | 数据库用户名 |
| `DB_PASSWORD` | 123456 | 数据库密码 |
| `JWT_SECRET` | huabu_jwt_secret_key_... | JWT 密钥 |
| `JWT_EXPIRATION` | 86400000 | Token 过期时间(ms) |

## 📡 API 接口
| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| POST | `/api/auth/register` | 用户注册 | ❌ |
| POST | `/api/auth/login` | 用户登录 | ❌ |
| POST | `/api/auth/change-password` | 修改密码 | ✅ |
| POST | `/api/auth/logout` | 注销登录 | ✅ |
| GET | `/api/works` | 获取我的作品列表 | ✅ |
| POST | `/api/works` | 新建作品 | ✅ |
| PUT | `/api/works/{id}` | 更新作品 | ✅ |
| DELETE | `/api/works/{id}` | 删除作品 | ✅ |

所有认证接口请求需携带 `Authorization: Bearer <token>` Header。

## 🛠 开发说明
### 后端架构
```
Controller → Service → Mapper → Database
     ↓          ↓         ↓
   DTO/Entity   JWT Filter   MyBatis XML
```

### 前端页面路由
```
login.html → register.html → my-works.html → index.html (画板)
                                        ↘ user-center.html
```

## 📄 许可证
MIT License

## 👥 作者
白锡山
