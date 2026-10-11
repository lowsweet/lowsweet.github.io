# 首页 Beautiful UI 控件

来源：2026-10-09 检查 https://www.beautifului.dev/ 的深色模式、确认卡片与推荐卡片，并读取公开组件 registry。源码保存在 docs/research/beautiful-ui，原始许可见 THIRD_PARTY_NOTICES.md。

目标文件：components/beautiful-ui/primitives.tsx、beautiful-ui.css、components/landing/landing-page.tsx、landing.css。

## 设计值

- 深色 surface：oklch(0.26 0.006 271.191)，canvas：oklch(0.231 0.004 264.487)。
- ink：oklch(0.964 0.002 247.839)，次文字：oklch(0.731 0.008 260.731)，辅助文字：oklch(0.541 0.01 264.484)。
- chip 6px、control 8px、card 10px、window 14px；按钮为 pill。
- button 阴影：0 0 0 1px oklch(1 0 0 / .1), 0 1px 2px oklch(0 0 0 / .3)。
- card 阴影：0 0 0 1px oklch(1 0 0 / .11), 0 1px 2px oklch(0 0 0 / .2), 0 2px 6px oklch(0 0 0 / .2)。
- overlay 阴影：0 0 0 1px oklch(1 0 0 / .15), 0 8px 28px oklch(0 0 0 / .34)。
- 正常按钮 md：14px 字体，500 字重，左右16px、上下9px；sm：13px 字体，27px 高，左右12px。手机增加触屏目标。
- 字体：本地 Inter variable；中文使用系统字体。控件不加载远程字体。

## 本次用户指定的覆盖

- 全部首页控件为黑白灰，不使用蓝色强调；主操作使用原版 primary（白底深字），次操作使用 secondary（灰底、细描边阴影）。
- 按钮只显示文字，不显示箭头、星星、爱心、菜单或关闭等图标。
- 标题第二行继承第一行白色。
- 去除“本地演示”badge及面向用户的模拟/演示说明，底层仍保持本地 mock。
- 所有弹窗关闭操作位于底部，与主操作并排并靠右；包括表单、成功状态、语言、关于、隐私、协议、作品详情。
- 后续语言识别改进：语言入口单独允许功能性的单色地球图标，桌面及手机直接可见；菜单语言项也显示该标识。语言选择弹窗使用中英双语标题、说明、当前状态及底部关闭文案。
- 导航、四能力卡、图库标签、翻页按钮、加载更多、注册入口、页脚、输入框及错误状态使用统一基础层。

## 交互

- Button hover 使用原版 surface→inset、primary opacity .9；active scale .96，150ms ease-out。
- GlideMenu 背景在菜单项之间移动：top/height 220ms cubic-bezier(.23,1,.32,1)、opacity150ms；鼠标与键盘均可触发。
- Radix Dialog 保留焦点限制、Escape、外部点击关闭；关闭后回到打开按钮。关闭是普通 type=button，不提交表单。
- 表单、收藏、语言与图库交互继续调用现有 MockService。银河与内容区块布局不接入组件主题。
- 减少动态偏好关闭控件过渡/弹出动画；手机表单字为16px。

## 响应式

- 1440：导航横排、4能力卡、图库横向滚动、作品详情两列。
- 768：2能力卡，作品详情两列；所有弹窗限宽与限高。
- 390：文字菜单、2能力卡、作品详情一列；操作可换行，弹窗内容可滚动。
