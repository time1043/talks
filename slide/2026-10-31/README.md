# 月饼出炉 · 御牌坊

《叫我万岁爷》中秋限时 7 日商业化活动玩法 —— 点触科技 × 厦门理工「AI 游戏工坊」参赛分享。

## 使用

```bash
pnpm install
pnpm dev        # 本地演示，http://localhost:3030
pnpm build      # 静态构建到 dist/（netlify.toml / vercel.json 已配好）
pnpm export     # 导出 PDF（依赖 playwright-chromium）
```

## 目录

```
slides.md          # 全部幻灯片内容（29 页）
styles/deck.css    # 宫墙暗金主题样式（.dy-* / .g-* / .kicker / .bar 等）
setup/main.ts      # Slidev setup 入口，负责提前注入 deck.css
public/images/     # 全部图片，slides.md 里统一以 /images/xxx 引用
```

- 图片只有一处：`public/images/`。新增图片直接放这里，用 `/images/文件名` 引用。
- 样式必须在 `setup/main.ts` 里先行 import：Slidev 自动加载的样式排在主题之后，
  会覆盖主题的同名规则（例如 `h1` 的 `margin-bottom`），导致版式与既有版本不一致。

## 内容结构

| 幕 | 页 | 内容 |
| --- | --- | --- |
| 开场 | 封面 · 三幕目录 | 点触科技 × 厦门理工，三幕概览 |
| 壹 | PART 1 游戏总览 | 故事逻辑、一局怎么玩、倍率、经营、渐进式披露 |
| 贰 | PART 2 对照交卷 | 命题原文、付费对赌 SKU、五榜、游戏贴合、完整度、素材合规 |
| 叁 | PART 3 AI 分享 | git 工作流、三次探索、教训、感悟、在线试玩 |
