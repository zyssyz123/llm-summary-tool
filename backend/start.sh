#!/bin/bash

# 加载环境变量（如果.env文件存在）
if [ -f .env ]; then
  echo "从.env文件加载环境变量..."
  export $(grep -v '^#' .env | xargs)
else
  # 设置默认环境变量
  echo "使用默认环境变量..."
  export DATABASE_URL="postgresql://postgres:postgres@localhost:5432/ai_content_assistant"
  export JWT_SECRET="homework"
  export JWT_ALGORITHM="HS256"
  export ACCESS_TOKEN_EXPIRE_MINUTES="60"
  # 注意：OPENAI_API_KEY 应该从环境变量或 .env 文件中设置
  export APP_NAME="AI Content Assistant"
  export ENVIRONMENT="development"
  export ALLOWED_ORIGINS="http://localhost:3000"
fi

# 检查OPENAI_API_KEY是否已设置
if [ -z "$OPENAI_API_KEY" ]; then
  echo "警告: OPENAI_API_KEY未设置。部分功能可能无法正常工作。"
  echo "请在环境变量或.env文件中设置OPENAI_API_KEY。"
fi

# 安装依赖
echo "安装依赖..."
pip install -r requirements.txt

# 启动后端服务器
echo "启动后端服务器..."
python run.py