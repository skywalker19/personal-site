---
title: Drip Monitor
titleZh: 点滴计时器
summary: A small mobile tool that estimates an IV drip’s remaining time from visible drops and remaining bag volume.
summaryZh: 一个移动端小工具，通过观察点滴速度和剩余液量，估算大致还需要多久。
type: project
status: maintained
started: 2026-06-01
updated: 2026-06-02
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

点滴计时器把一段简单的观察变成粗略的时间估算。选择点滴类型和剩余液量，在短暂测量过程中看到一滴就点一下，页面便会估算流速与可能结束的时间。

它刻意保持为一个很小的浏览器工具：不需要账号，不保存患者信息，也不需要安装。

## 为什么做它

守在点滴旁边时，人很自然会问：*大概还要多久？* 与其反复猜测，这个工具至少能给出一个更有依据的参考。

## 重要边界

它只是估算工具，不是医疗仪器，绝不能用于调整点滴速度。发现任何异常时，应检查输液袋或立即通知医护人员。

随着这个个人主页上线，工具会从服务器首页移到 `/drip-monitor/`。
