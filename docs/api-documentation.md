# API接口文档 - 食刻 (NutriBit)

## 📋 API概览

食刻后端采用RESTful API设计，提供统一的接口标准和响应格式。所有API均采用HTTPS协议，支持JSON格式的请求和响应。

### 基础信息
- **Base URL**: `https://api.nutribit.com/v1`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token (JWT)
- **API版本**: v1.0

### 统一响应格式
```typescript
interface ApiResponse<T> {
  code: number;        // 状态码 (200=成功, 4xx=客户端错误, 5xx=服务器错误)
  message: string;     // 响应消息
  data: T;            // 响应数据
  timestamp: number;   // 时间戳
  requestId: string;   // 请求ID (用于问题追踪)
}

// 成功响应示例
{
  "code": 200,
  "message": "success",
  "data": { /* 具体数据 */ },
  "timestamp": 1694352000000,
  "requestId": "req_123456789"
}

// 错误响应示例
{
  "code": 400,
  "message": "参数验证失败",
  "data": {
    "errors": [
      {
        "field": "email",
        "message": "邮箱格式不正确"
      }
    ]
  },
  "timestamp": 1694352000000,
  "requestId": "req_123456789"
}
```

## 🔐 认证授权

### 用户注册
```http
POST /auth/register
```

**请求参数:**
```json
{
  "username": "string",     // 用户名 (3-20字符)
  "email": "string",        // 邮箱
  "password": "string",     // 密码 (8-32字符)
  "phone": "string?",       // 手机号 (可选)
  "inviteCode": "string?"   // 邀请码 (可选)
}
```

**响应数据:**
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 1001,
      "username": "user123",
      "email": "user@example.com",
      "avatar": "https://cdn.example.com/avatar/default.jpg",
      "createdAt": "2024-09-10T10:00:00Z"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "expiresIn": 7200
    }
  }
}
```

### 用户登录
```http
POST /auth/login
```

**请求参数:**
```json
{
  "email": "string",        // 邮箱
  "password": "string"      // 密码
}
```

### 刷新Token
```http
POST /auth/refresh
```

**请求参数:**
```json
{
  "refreshToken": "string"  // 刷新令牌
}
```

### 退出登录
```http
POST /auth/logout
Authorization: Bearer {accessToken}
```

## 👤 用户管理

### 获取当前用户信息
```http
GET /users/me
Authorization: Bearer {accessToken}
```

**响应数据:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1001,
    "username": "user123",
    "email": "user@example.com",
    "phone": "13800138000",
    "avatar": "https://cdn.example.com/avatar/user123.jpg",
    "profile": {
      "height": 170.5,        // 身高 (cm)
      "weight": 65.0,         // 体重 (kg)
      "age": 28,              // 年龄
      "gender": "male",       // 性别: male/female/other
      "activityLevel": "moderate",  // 活动水平: low/moderate/high
      "healthGoal": "maintain",     // 健康目标: lose/gain/maintain
      "targetCalories": 2000,       // 目标卡路里
      "targetProtein": 150,         // 目标蛋白质 (g)
      "targetCarbs": 250,           // 目标碳水化合物 (g)
      "targetFat": 67               // 目标脂肪 (g)
    },
    "createdAt": "2024-09-10T10:00:00Z",
    "updatedAt": "2024-09-10T15:30:00Z"
  }
}
```

### 更新用户信息
```http
PUT /users/me
Authorization: Bearer {accessToken}
```

**请求参数:**
```json
{
  "username": "string?",
  "phone": "string?",
  "avatar": "string?"
}
```

### 更新健康档案
```http
PUT /users/me/profile
Authorization: Bearer {accessToken}
```

**请求参数:**
```json
{
  "height": "number?",
  "weight": "number?",
  "age": "number?",
  "gender": "string?",
  "activityLevel": "string?",
  "healthGoal": "string?"
}
```

## 🍽️ 营养识别

### 图片识别菜品
```http
POST /nutrition/recognize
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**请求参数:**
```
image: File              // 图片文件 (支持 jpg, png, webp)
mealType?: string        // 餐次类型: breakfast/lunch/dinner/snack
location?: string        // 用餐地点: home/restaurant/canteen
```

**响应数据:**
```json
{
  "code": 200,
  "message": "识别成功",
  "data": {
    "recognitionId": "rec_123456789",
    "confidence": 0.92,    // 识别置信度
    "foods": [
      {
        "name": "宫保鸡丁",
        "category": "川菜",
        "confidence": 0.94,
        "weight": 200,      // 估算重量 (g)
        "nutrition": {
          "calories": 280,
          "protein": 25.6,
          "carbs": 12.8,
          "fat": 16.4,
          "fiber": 2.1,
          "sodium": 850
        },
        "adjustOptions": {  // 微调选项
          "cookingStyle": ["home", "restaurant", "canteen"],
          "taste": ["light", "normal", "heavy"],
          "portion": ["small", "medium", "large"]
        }
      },
      {
        "name": "米饭",
        "category": "主食",
        "confidence": 0.98,
        "weight": 150,
        "nutrition": {
          "calories": 195,
          "protein": 4.2,
          "carbs": 43.5,
          "fat": 0.3,
          "fiber": 0.4,
          "sodium": 1
        }
      }
    ],
    "totalNutrition": {
      "calories": 475,
      "protein": 29.8,
      "carbs": 56.3,
      "fat": 16.7,
      "fiber": 2.5,
      "sodium": 851
    },
    "suggestions": [
      "蛋白质含量充足，符合您的健身目标",
      "钠含量偏高，建议搭配清淡蔬菜"
    ]
  }
}
```

### 确认识别结果
```http
POST /nutrition/records
Authorization: Bearer {accessToken}
```

**请求参数:**
```json
{
  "recognitionId": "string",      // 识别ID
  "mealTime": "string",           // ISO 8601时间格式
  "mealType": "string",           // 餐次类型
  "foods": [
    {
      "name": "string",
      "weight": "number",          // 调整后的重量
      "cookingStyle": "string?",   // 烹饪方式
      "taste": "string?",          // 口味偏好
      "portion": "string?"         // 份量大小
    }
  ],
  "notes": "string?"              // 备注
}
```

**响应数据:**
```json
{
  "code": 200,
  "message": "记录成功",
  "data": {
    "recordId": 12345,
    "mealTime": "2024-09-10T12:30:00Z",
    "mealType": "lunch",
    "totalNutrition": {
      "calories": 480,
      "protein": 30.2,
      "carbs": 55.8,
      "fat": 17.1
    },
    "dailyProgress": {
      "calories": {
        "consumed": 1250,
        "target": 2000,
        "remaining": 750
      },
      "protein": {
        "consumed": 85.5,
        "target": 150,
        "remaining": 64.5
      }
    }
  }
}
```

## 📊 营养记录

### 获取营养记录列表
```http
GET /nutrition/records
Authorization: Bearer {accessToken}
```

**查询参数:**
```
startDate?: string     // 开始日期 (YYYY-MM-DD)
endDate?: string       // 结束日期 (YYYY-MM-DD)
mealType?: string      // 餐次类型筛选
page?: number          // 页码 (默认1)
limit?: number         // 每页数量 (默认20)
```

**响应数据:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "records": [
      {
        "id": 12345,
        "mealTime": "2024-09-10T12:30:00Z",
        "mealType": "lunch",
        "foods": [
          {
            "name": "宫保鸡丁",
            "weight": 200,
            "nutrition": { /* 营养数据 */ }
          }
        ],
        "totalNutrition": { /* 总营养数据 */ },
        "notes": "今天的午餐很美味",
        "createdAt": "2024-09-10T12:35:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 156,
      "totalPages": 8
    }
  }
}
```

### 获取每日营养汇总
```http
GET /nutrition/daily-summary
Authorization: Bearer {accessToken}
```

**查询参数:**
```
date?: string          // 日期 (YYYY-MM-DD, 默认今天)
```

**响应数据:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "date": "2024-09-10",
    "summary": {
      "totalCalories": 1850,
      "totalProtein": 135.5,
      "totalCarbs": 220.8,
      "totalFat": 72.3,
      "totalFiber": 28.5,
      "totalSodium": 2100
    },
    "targets": {
      "calories": 2000,
      "protein": 150,
      "carbs": 250,
      "fat": 67
    },
    "progress": {
      "calories": 0.925,    // 完成度百分比
      "protein": 0.903,
      "carbs": 0.883,
      "fat": 1.079
    },
    "mealBreakdown": {
      "breakfast": { /* 早餐营养数据 */ },
      "lunch": { /* 午餐营养数据 */ },
      "dinner": { /* 晚餐营养数据 */ },
      "snack": { /* 加餐营养数据 */ }
    },
    "analysis": {
      "score": 85,          // 营养评分 (0-100)
      "highlights": [
        "蛋白质摄入充足",
        "膳食纤维达标"
      ],
      "suggestions": [
        "脂肪摄入略高，建议适当减少",
        "可以增加蔬菜摄入"
      ]
    }
  }
}
```

### 删除营养记录
```http
DELETE /nutrition/records/{recordId}
Authorization: Bearer {accessToken}
```

## 🎯 个性化推荐

### 获取个性化推荐
```http
GET /recommendations/meals
Authorization: Bearer {accessToken}
```

**查询参数:**
```
mealType?: string      // 推荐餐次: breakfast/lunch/dinner/snack
cuisineType?: string   // 菜系偏好: chinese/western/japanese等
difficulty?: string    // 制作难度: easy/medium/hard
```

**响应数据:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "recommendations": [
      {
        "id": "recipe_001",
        "name": "蒜蓉西兰花炒虾仁",
        "description": "高蛋白低脂，营养均衡",
        "image": "https://cdn.example.com/recipes/001.jpg",
        "difficulty": "easy",
        "cookingTime": 15,     // 制作时间(分钟)
        "servings": 2,         // 份数
        "nutrition": {
          "calories": 220,
          "protein": 28.5,
          "carbs": 8.2,
          "fat": 9.1
        },
        "ingredients": [
          {
            "name": "虾仁",
            "amount": 200,
            "unit": "g"
          },
          {
            "name": "西兰花",
            "amount": 300,
            "unit": "g"
          }
        ],
        "tags": ["高蛋白", "低卡路里", "减脂"],
        "score": 92,           // 推荐分数
        "reason": "根据您的健身目标，这道菜能提供优质蛋白质"
      }
    ],
    "totalNutritionGap": {   // 当日营养缺口
      "calories": 450,
      "protein": 25.5,
      "carbs": 60.2,
      "fat": 15.8
    }
  }
}
```

### 获取智能配餐
```http
GET /recommendations/meal-plan
Authorization: Bearer {accessToken}
```

**查询参数:**
```
date?: string          // 配餐日期 (YYYY-MM-DD)
budget?: number        // 预算限制
preferences?: string   // 饮食偏好 (vegetarian/vegan等)
```

## 👥 社区功能

### 获取动态列表
```http
GET /community/posts
Authorization: Bearer {accessToken}
```

**查询参数:**
```
type?: string          // 动态类型: meal/recipe/tip
sort?: string          // 排序: latest/popular/followed
page?: number
limit?: number
```

**响应数据:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "posts": [
      {
        "id": "post_001",
        "type": "meal",
        "user": {
          "id": 1001,
          "username": "健身达人小李",
          "avatar": "https://cdn.example.com/avatar/1001.jpg",
          "level": "营养师",
          "followers": 12560
        },
        "content": {
          "text": "今天的减脂午餐，营养满分！",
          "images": [
            "https://cdn.example.com/posts/001_1.jpg"
          ],
          "recipe": {
            "id": "recipe_001",
            "name": "蒜蓉西兰花炒虾仁"
          }
        },
        "nutrition": {
          "calories": 320,
          "protein": 35.2,
          "carbs": 12.8,
          "fat": 14.5
        },
        "stats": {
          "likes": 156,
          "comments": 23,
          "shares": 12,
          "follows": 45        // "一键跟吃"次数
        },
        "canFollow": true,     // 是否可以一键跟吃
        "followPrice": 28.80,  // 跟吃价格
        "createdAt": "2024-09-10T12:45:00Z"
      }
    ],
    "pagination": { /* 分页信息 */ }
  }
}
```

### 发布动态
```http
POST /community/posts
Authorization: Bearer {accessToken}
Content-Type: multipart/form-data
```

**请求参数:**
```
text: string           // 动态文字
images[]: File[]       // 图片文件
type: string           // 类型: meal/recipe/tip
recipeId?: string      // 关联菜谱ID
nutritionRecordId?: string  // 关联营养记录ID
```

### 一键跟吃
```http
POST /community/follow-meal
Authorization: Bearer {accessToken}
```

**请求参数:**
```json
{
  "postId": "string",          // 动态ID
  "deliveryType": "string",    // 配送类型: ingredients/cooked
  "servings": "number",        // 份数
  "deliveryAddress": "string", // 配送地址
  "deliveryTime": "string",    // 期望配送时间
  "notes": "string?"           // 特殊要求
}
```

## 🛒 订单管理

### 创建订单
```http
POST /orders
Authorization: Bearer {accessToken}
```

**请求参数:**
```json
{
  "type": "string",            // 订单类型: follow_meal/recipe_kit
  "items": [
    {
      "recipeId": "string",
      "quantity": "number",
      "specifications": {
        "servings": "number",
        "deliveryType": "string"
      }
    }
  ],
  "deliveryAddress": {
    "name": "string",
    "phone": "string",
    "address": "string",
    "coordinates": {
      "lat": "number",
      "lng": "number"
    }
  },
  "paymentMethod": "string",   // 支付方式
  "couponCode": "string?",     // 优惠券代码
  "notes": "string?"           // 订单备注
}
```

### 获取订单列表
```http
GET /orders
Authorization: Bearer {accessToken}
```

**查询参数:**
```
status?: string        // 订单状态: pending/paid/preparing/delivering/completed/cancelled
startDate?: string
endDate?: string
page?: number
limit?: number
```

### 获取订单详情
```http
GET /orders/{orderId}
Authorization: Bearer {accessToken}
```

### 取消订单
```http
PUT /orders/{orderId}/cancel
Authorization: Bearer {accessToken}
```

## 💳 支付相关

### 创建支付
```http
POST /payments
Authorization: Bearer {accessToken}
```

**请求参数:**
```json
{
  "orderId": "string",         // 订单ID
  "paymentMethod": "string",   // 支付方式: wechat/alipay/union
  "amount": "number",          // 支付金额
  "clientIp": "string"         // 客户端IP
}
```

**响应数据:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "paymentId": "pay_123456789",
    "prepayInfo": {
      "appId": "wx1234567890",
      "timeStamp": "1694352000",
      "nonceStr": "abc123",
      "package": "prepay_id=wx123456789",
      "signType": "MD5",
      "paySign": "signature"
    },
    "expiresAt": "2024-09-10T13:00:00Z"
  }
}
```

### 支付结果查询
```http
GET /payments/{paymentId}
Authorization: Bearer {accessToken}
```

## 📈 数据统计

### 获取营养趋势
```http
GET /analytics/nutrition-trends
Authorization: Bearer {accessToken}
```

**查询参数:**
```
period?: string        // 统计周期: week/month/quarter/year
startDate?: string
endDate?: string
metric?: string        // 指标: calories/protein/carbs/fat/weight
```

**响应数据:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "period": "month",
    "trends": [
      {
        "date": "2024-09-01",
        "calories": 1950,
        "protein": 145.5,
        "carbs": 235.8,
        "fat": 68.2,
        "weight": 65.2,
        "score": 88
      }
    ],
    "summary": {
      "avgCalories": 1925,
      "avgScore": 86,
      "bestDay": "2024-09-15",
      "improvementTips": [
        "周末的饮食控制有待加强",
        "蛋白质摄入比较稳定，保持得很好"
      ]
    }
  }
}
```

### 获取达成报告
```http
GET /analytics/achievement-report
Authorization: Bearer {accessToken}
```

## 🔧 系统配置

### 获取应用配置
```http
GET /config/app
```

**响应数据:**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "version": "1.0.0",
    "features": {
      "aiRecognition": true,
      "followMeal": true,
      "community": true,
      "mealKit": true
    },
    "limits": {
      "maxDailyRecognitions": 50,
      "maxImageSize": 10485760,    // 10MB
      "supportedFormats": ["jpg", "png", "webp"]
    },
    "constants": {
      "cuisineTypes": ["chinese", "western", "japanese", "korean"],
      "mealTypes": ["breakfast", "lunch", "dinner", "snack"],
      "activityLevels": ["low", "moderate", "high"],
      "healthGoals": ["lose", "gain", "maintain"]
    }
  }
}
```

## ❌ 错误码说明

| 错误码 | 说明 | 解决方案 |
|--------|------|----------|
| 200 | 成功 | - |
| 400 | 请求参数错误 | 检查请求参数格式和必填字段 |
| 401 | 未授权 | 检查Token是否有效 |
| 403 | 权限不足 | 联系管理员开通权限 |
| 404 | 资源不存在 | 检查请求路径和资源ID |
| 409 | 资源冲突 | 检查是否存在重复数据 |
| 429 | 请求频率超限 | 降低请求频率 |
| 500 | 服务器内部错误 | 联系技术支持 |
| 503 | 服务不可用 | 稍后重试 |

### 业务错误码
| 错误码 | 说明 |
|--------|------|
| 10001 | 用户名已存在 |
| 10002 | 邮箱已注册 |
| 10003 | 密码格式不正确 |
| 20001 | 图片识别失败 |
| 20002 | 不支持的图片格式 |
| 20003 | 图片文件过大 |
| 30001 | 订单状态不正确 |
| 30002 | 库存不足 |
| 30003 | 配送地址超出范围 |

## 📝 更新日志

### v1.0.0 (2024-09-10)
- 初始版本发布
- 用户认证和授权功能
- AI图片识别功能
- 营养记录和分析功能
- 个性化推荐功能
- 社区动态功能
- 一键跟吃功能
- 订单和支付功能

---

*文档版本: v1.0*  
*最后更新: 2025年9月10日*
