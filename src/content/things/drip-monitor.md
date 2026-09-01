---
title: Drip Monitor
titleZh: 点滴计时器
summary: A small mobile tool that estimates an IV drip’s remaining time from visible drops and remaining bag volume.
summaryZh: 一个移动端小工具，通过观察点滴速度和剩余液量，估算大致还需要多久。
type: project
status: ongoing
started: 2026-06-01
updated: 2026-09-01
featured: true
draft: false
language: en
themes: [健康, 小工具, 移动网页]
mark: 滴
tone: green
links: []
related: []
---

## 它是什么

输液监测把一段简单的观察变成粗略的时间估算。选择滴速类型和剩余液量，在 20 秒测量过程中看到一滴就点一下，页面便会估算每分钟滴数、剩余时间和可能结束的时间。

最新的 Web MVP 已经可以在浏览器中走完设置、测量、倒计时和重新测量的流程：支持 50 / 100 / 250 / 500 mL 及自定义液量，也会在预计结束前 10 分钟用页面状态、震动和声音做出原型提示。正在进行的倒计时保存在本地，重新打开页面时可以恢复。

[打开 Web 原型](/things/drip-monitor/prototype/index.html)

## 为什么做它

守在点滴旁边时，人很自然会问：*大概还要多久？* 与其反复猜测，这个工具至少能给出一个更有依据的参考。

## 重要边界

它只是估算工具，不是医疗仪器，也不能替代医护人员、临床判断或受监管的输液设备。绝不能据此调整输液速度；发现任何异常时，应检查输液袋或立即通知医护人员。锁屏状态下能否收到提示，也取决于操作系统、浏览器权限以及后续通知能力。

这个个人主页中的原型只用于展示和本地体验，不保存患者信息，也不宣称具备临床可靠性。

## 怎么估算

每分钟滴数 = 20 秒内记录的滴数 ÷ 20 × 60；每分钟毫升数 = 每分钟滴数 × 每滴毫升数；剩余分钟数 = 剩余液量 ÷ 每分钟毫升数。成人、标准 / 不确定和儿童使用不同的每滴毫升数；记录的滴数过少时，页面会提示重新测量。
