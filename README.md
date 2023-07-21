# QQNTim 模板插件

## 开发

### 配置环境

请先下载安装 [Node.js 18](https://nodejs.org/)，并在本项目下打开终端，运行：

```bash
# 启用 Corepack 以使用 Yarn 3
corepack enable
# 配置项目依赖
yarn
```

之后，用你的代码编辑器打开此项目（推荐使用 [VSCode](https://code.visualstudio.com/) 进行开发）。

### 编写代码

可参考 QQNTim 内置的[设置界面插件](https://github.com/Flysoft-Studio/QQNTim/tree/dev/src/builtins/settings)进行编写。

### 调试插件

如果你使用的是 Windows，请使用终端运行：

```bash
yarn dev && yarn start:win
```

如果你使用的是 Linux，请使用终端运行：

```bash
yarn dev && yarn start:linux
```

运行后，将会自动启动 QQ，你可以在 QQ 内按下 `F12` 打开开发者工具。

### 构建并发布插件

请使用终端运行：

```bash
yarn build
```

运行后，将会在 `dist` 文件下生成最终的插件。

此模板项目同时也包含了一个 [GitHub Actions Workflow 示例](.github/workflows/build.yml)。你可以使用它来自动化你的插件构建。

## 附录

### 可用命令

| 命令                     | 说明                                            |
| ------------------------ | ----------------------------------------------- |
| `yarn build`             | 构建插件                                        |
| `yarn dev`               | 构建开发版本插件（包含 SourceMap）              |
| `yarn start:win`         | 安装你的插件并启动 QQNT（Windows 下请使用此项） |
| `yarn start:linux`       | 安装你的插件并启动 QQNT（Linux 下请使用此项）   |
| `yarn lint`              | 对代码进行检查                                  |
| `yarn lint:apply`        | 应用推荐的代码修改                              |
| `yarn lint:apply-unsafe` | 应用推荐的代码修改（包括不安全的修复）          |
| `yarn format`            | 格式化代码                                      |
