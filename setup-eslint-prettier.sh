#!/usr/bin/env bash

echo "🔧 Instalando dependências do ESLint e Prettier..."

npm install --save-dev \
  eslint \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  prettier \
  eslint-config-prettier \
  eslint-plugin-prettier \
  prettier-plugin-tailwindcss

echo "✅ Dependências instaladas!"

# ================================
# Criando .eslintrc.json
# ================================
cat <<'EOF' > .eslintrc.json
{
  "root": true,
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "ecmaVersion": "latest",
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["@typescript-eslint", "prettier"],
  "rules": {
    "prettier/prettier": "error",
    "@typescript-eslint/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/no-explicit-any": "warn",
    "prefer-const": "error",
    "no-var": "error"
  },
  "env": {
    "browser": true,
    "es2021": true,
    "node": true
  },
  "ignorePatterns": [".next", "node_modules", "dist", "out", "build"]
}
EOF

echo "✅ Arquivo .eslintrc.json criado!"

# ================================
# Criando .prettierrc
# ================================
cat <<'EOF' > .prettierrc
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2,
  "useTabs": false,
  "bracketSpacing": true,
  "arrowParens": "avoid",
  "endOfLine": "auto",
  "plugins": ["prettier-plugin-tailwindcss"]
}
EOF

echo "✅ Arquivo .prettierrc criado!"

# ================================
# Criando .prettierignore
# ================================
cat <<'EOF' > .prettierignore
node_modules
.next
out
build
dist
*.log
.env*
public
coverage
EOF

echo "✅ Arquivo .prettierignore criado!"

# ================================
# Criando .vscode/settings.json
# ================================
mkdir -p .vscode

cat <<'EOF' > .vscode/settings.json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll": true,
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "typescript.organizeImports": true
}
EOF

echo "✅ Arquivo .vscode/settings.json criado!"

echo "🎉 Configuração finalizada!"
echo "➡️ Agora você pode rodar:"
echo "   npm run lint              # Verificar problemas"
echo "   npm run lint:fix          # Corrigir automaticamente"
echo "   npm run format            # Formatar tudo"
echo "   npm run format:check      # Verificar formatação"

# ================================
# Como usar
# ================================
# Dar permissão de execução ao script:
# chmod +x setup-eslint-prettier.sh
# Executar o script:
# ./setup-eslint-prettier.sh

# ================================
# Adicionar ao package.json
# ================================
# "scripts": {
#   "lint": "eslint . --ext .js,.jsx,.ts,.tsx",
#   "lint:fix": "eslint . --ext .js,.jsx,.ts,.tsx --fix",
#   "format": "prettier --write .",
#   "format:check": "prettier --check ."
# }
