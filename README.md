# 📝 我的博客系统

一个基于 **Node.js + Express + MySQL** 的全栈博客平台，采用 MVC 架构，支持用户注册登录、文章发布与管理、分类标签、评论互动、点赞、搜索、归档等功能。

## ✨ 功能特性

### 用户模块
- 注册 / 登录（JWT 认证）
- 个人信息管理（修改昵称、简介）
- 修改密码

### 文章模块
- 文章 CRUD（创建、编辑、删除）
- 富文本 Markdown 编辑 + 实时预览
- 文章分类 & 标签（多对多关系）
- 封面图上传（URL）
- 草稿自动保存（localStorage）
- 文章浏览计数
- 文章列表分页、分类/标签筛选、关键词搜索、排序（最新/最热）
- 文章归档（按月统计）

### 互动模块
- 文章评论 & 回复（楼中楼）
- 评论删除（作者可删）
- 文章点赞 / 取消点赞

### 前端界面
- 首页文章列表（统计卡片、标签云）
- 文章详情页（目录、作者卡片、相关文章）
- 登录注册页（表单校验、密码显隐）
- 发布/编辑文章页（工具栏、字数统计）
- 个人中心（统计概览、我的文章管理）

### 后端架构
- MVC 分层（routes / controllers / services）
- 统一 JSON 响应格式 `{ success, data, error, message }`
- 全局错误处理中间件 + 404 处理
- JWT 身份认证中间件
- 参数校验（必填、长度、格式）
- 数据库连接池、事务处理

## 🛠️ 技术栈

| 层级 | 技术 |
|:---|:---|
| 前端 | HTML5 + CSS3 + JavaScript（原生） |
| 后端 | Node.js + Express |
| 数据库 | MySQL |
| 认证 | JWT（jsonwebtoken） |
| 密码加密 | bcryptjs |
| 跨域 | CORS |
| 环境变量 | dotenv |

## 📁 项目结构
blog-system/
├── blog-server/ # 后端服务
│ ├── config/
│ │ └── db.js # 数据库连接池配置
│ ├── controllers/ # 控制器层
│ │ ├── articleController.js
│ │ ├── categoryController.js
│ │ ├── commentController.js
│ │ ├── tagController.js
│ │ └── userController.js
│ ├── middleware/ # 中间件
│ │ ├── auth.js # JWT 认证中间件
│ │ ├── errorHandler.js # 全局错误处理
│ │ ├── notFound.js # 404 处理
│ │ └── validate.js # 参数校验
│ ├── routes/ # 路由层
│ │ ├── index.js
│ │ ├── articleRoutes.js
│ │ ├── categoryRoutes.js
│ │ ├── commentRoutes.js
│ │ ├── tagRoutes.js
│ │ └── userRoutes.js
│ ├── services/ # 服务层（核心业务逻辑）
│ │ ├── articleService.js
│ │ ├── categoryService.js
│ │ ├── commentService.js
│ │ ├── tagService.js
│ │ └── userService.js
│ ├── utils/
│ │ └── responseHelper.js # 统一响应格式工具
│ ├── database/
│ │ └── init.sql # 数据库初始化脚本（含测试数据）
│ ├── .env # 环境变量（需自行配置）
│ ├── app.js # 应用入口
│ └── package.json
│
├── blog-client/ # 前端页面
│ ├── css/
│ │ └── style.css # 全局样式
│ ├── js/
│ │ ├── api.js # API 请求封装
│ │ └── utils.js # 工具函数（Toast、头像、时间等）
│ ├── index.html # 首页（文章列表）
│ ├── detail.html # 文章详情
│ ├── login.html # 登录注册
│ ├── publish.html # 发布/编辑文章
│ └── profile.html # 个人中心

## 🗄️ 数据库设计

共 7 张表，关系如下：
users (1) ────< articles (N)
│ │
│ ├──< comments (N)
│ ├──< article_likes (N)
│ └──< article_tags (N) >── tags (N)
│
└──< comments (N)

categories (1) ──< articles (N)


- **users**：用户表
- **articles**：文章表（含浏览数、点赞数）
- **categories**：分类表
- **tags**：标签表
- **article_tags**：文章-标签关联表（多对多）
- **comments**：评论表（支持 parent_id 楼中楼）
- **article_likes**：文章点赞表（联合唯一约束防重复）
