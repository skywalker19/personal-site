const escape = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));

export function renderReport(report, {site = false} = {}) {
  const e = escape;
  const rich = value => e(value).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  const episodeUrl = story => site ? `/things/miller-words/episodes/${story.id}/html/${story.id}.html` : `${story.id}.html`;
  const pictureUrl = (story, filename) => site ? `/things/miller-words/episodes/${story.id}/cartoon/${filename}` : `../../cartoon/${filename}`;
  const pdfUrl = story => site ? `/things/miller-words/episodes/${story.id}/pdf/${story.id}.pdf` : `../pdf/${story.id}.pdf`;
  const examWords = [...new Map(report.words.map(word => [word.word.toLocaleLowerCase(), word])).keys()].map(key => {
    const records = report.words.filter(word => word.word.toLocaleLowerCase() === key);
    return {id: `word:${key}`, word: records[0].word, meaning: records[0].meaning,
      pending: records.some(word => word.pending), origins: records.map(({day, week}) => ({day, week}))};
  });
  const examData = JSON.stringify(examWords).replace(/</g, '\\u003c');
  const inferred = week => week?.inferred ? '（推定）' : '';
  const inferredWeekLabels = report.weeks.filter(week => week.inferred).map(week => `第 ${week.number} 周`).join('、') || '无';
  const confirmedWeekLabels = report.weeks.filter(week => !week.inferred).map(week => `第 ${week.number} 周`).join('、') || '无';
  const hasStoryOnePdf = report.stories.some(story => story.id === 'story-001' && story.hasPdf);
  const weeks = report.weeks.map(week => `<article class="mw-week"><h3>第 ${week.number} 周</h3><small>${week.inferred ? '周次推定' : '照片明确标注'}</small><strong class="mw-amount">${week.entryCount}<small> 条记录</small></strong><small>Day ${week.startDay}–${week.endDay} · ${week.dayCount} 天</small></article>`).join('');
  const weekTable = report.weeks.map(week => `<tr><th scope="row">第 ${week.number} 周${inferred(week)}</th><td>Day ${week.startDay}–${week.endDay}</td><td class="mw-number">${week.entryCount}</td><td class="mw-number">${week.uniqueWords}</td></tr>`).join('');
  const stories = report.stories.map(story => `<article class="mw-story">
    <a class="mw-story-thumbnail" href="${episodeUrl(story)}" aria-label="打开${e(story.titleZh)}"><img src="${pictureUrl(story, story.cover)}" alt="${e(story.coverAlt)}" width="1536" height="1024" loading="lazy"></a>
    <div class="mw-story-body"><small>${e(story.id.toUpperCase().replace('-', ' '))} · DAY ${story.startDay}–${story.endDay}</small><h3>${e(story.titleZh)}</h3><p class="mw-story-title-en" lang="en">${e(story.title)}</p>
    <div class="mw-story-preview"><span class="mw-story-preview-label">故事前引</span><p class="mw-story-intro" lang="en">${rich(story.intro)}</p></div>
    <p class="mw-story-details">第 ${story.week} 周${inferred(report.weeks.find(week => week.number === story.week))} · ${story.entryCount} 条词条 · ${story.sceneCount} 个场景</p><nav class="mw-actions" aria-label="${e(story.titleZh)}的练习入口"><a class="mw-primary" href="${episodeUrl(story)}">继续读故事 →</a><a href="?exam-story=${story.week}#memory-exam">Memory Exam</a>${story.hasPdf ? `<a href="${pdfUrl(story)}">打印版 PDF</a>` : ''}</nav></div></article>`).join('');
  const maximum = Math.max(...report.sessions.map(day => day.entryCount));
  const daily = report.weeks.map(week => {
    const days = report.sessions.filter(day => day.week === week.number);
    const bars = days.map(day => `<a class="mw-bar-column" href="#day-${day.day}" aria-label="Day ${day.day}，${day.entryCount} 条记录，查看单词"><span class="mw-bar-value">${day.entryCount}</span><span class="mw-bar-track" aria-hidden="true"><span class="mw-bar" style="height:${day.entryCount / maximum * 100}%"></span></span><span class="mw-bar-label">Day ${day.day}</span></a>`).join('');
    const table = days.map(day => `<tr><th scope="row"><a href="#day-${day.day}">Day ${day.day}</a></th><td class="mw-number">${day.entryCount}</td><td class="mw-number">${day.newWords}</td><td class="mw-number">${day.cumulativeEntries}</td></tr>`).join('');
    return `<article class="mw-day-group"><div class="mw-day-heading"><h3>第 ${week.number} 周${inferred(week)}</h3><span>Day ${week.startDay}–${week.endDay} · ${week.entryCount} 条记录</span></div><div class="mw-bars">${bars}</div><details><summary>查看这周的每日统计明细</summary><table class="mw-table"><caption>新词形数按全词表中首次出现计算</caption><thead><tr><th scope="col">Day</th><th scope="col" class="mw-number">记录数</th><th scope="col" class="mw-number">新词形</th><th scope="col" class="mw-number">累计记录</th></tr></thead><tbody>${table}</tbody></table></details></article>`;
  }).join('');
  const wordBank = report.sessions.map(day => `<details class="mw-day-words" id="day-${day.day}" data-week="${day.week}"><summary>第 ${day.week} 周 · Day ${day.day}<small>${day.entryCount} 条记录 · 累计 ${day.cumulativeEntries} 条</small></summary><table class="mw-table"><caption class="mw-sr">Day ${day.day} 单词，按当天原始序号排列</caption><thead><tr><th scope="col">序号</th><th scope="col">英文</th><th scope="col">中文释义</th></tr></thead><tbody>${report.words.filter(word => word.day === day.day).map(word => `<tr><td>${word.ordinal}</td><td class="mw-word" lang="en">${e(word.word)}${word.pending ? '<span class="mw-pending" lang="zh-CN">待确认</span>' : ''}</td><td>${e(word.meaning)}</td></tr>`).join('')}</tbody></table></details>`).join('');
  return `<article class="mw-report">
  <nav class="mw-nav" aria-label="单词本导航"><a href="#stories">故事练习</a><a href="#memory-exam">Memory Exam</a><a href="#weeks">每周统计</a><a href="#days">每日统计</a><a href="#word-bank">完整词表</a>${site ? '<a href="/things/miller-words/">项目介绍 ↗</a>' : ''}</nav>
  <header class="mw-hero"><div><p class="mw-eyebrow">MILLER WORDS / WORD NOTEBOOK</p><h1>Miller 的单词本</h1><p class="mw-lead">把阅读中遇到的单词收进故事。从这里按周、按 Day 查看积累，打开配图练习，再用自己的话复述。</p><p class="mw-meta">Day ${report.sessions[0]?.day ?? 0}–${report.sessions.at(-1)?.day ?? 0} · ${report.stories.length} 篇故事 · 报告更新 ${e(report.updated)}</p><a class="mw-primary" href="#stories">选一篇故事开始</a></div>${report.stories[0] ? `<figure class="mw-cover"><a href="${episodeUrl(report.stories[0])}"><img src="${pictureUrl(report.stories[0], report.stories[0].cover)}" alt="${e(report.stories[0].coverAlt)}" width="1536" height="1024"></a><figcaption>${e(report.stories[0].titleZh)} · Day ${report.stories[0].startDay}</figcaption></figure>` : ''}</header>
  <section class="mw-stats" aria-label="单词本总体统计">${[[report.totalEntries,'词条记录'],[report.uniqueWords,'不同词形'],[report.sessions.length,'学习 Day'],[report.weeks.length,'周次'],[report.stories.length,'记忆故事']].map(([count,label])=>`<div class="mw-stat"><strong>${count}</strong><span>${label}</span></div>`).join('')}</section>
  <div class="mw-summary"><p><strong>记录与词形：</strong>重复学习仍保留记录；大小写合并，不同词形分别计数。</p><p><strong>时间与周次：</strong>Day 是累计学习序号。${e(confirmedWeekLabels)}由照片明确标注，${e(inferredWeekLabels)}按照片分隔推定；不换算成日历日期。</p></div>
  <section class="mw-section" id="stories"><div class="mw-heading"><h2>${report.stories.length} 篇故事，从这里进入</h2><span class="mw-meta">${report.sceneCount} 个场景 · ${report.imageCount} 张配图</span></div><p class="mw-caption">每次练习约 5–8 个词。先读英文，再查看中文，最后遮住图片复述。${hasStoryOnePdf ? 'Story 001 提供打印版 PDF。' : '有打印版的故事会提供 PDF 入口。'}</p><div class="mw-stories">${stories}</div></section>
  <section class="mw-section mw-exam" id="memory-exam" aria-labelledby="mw-exam-title">
    <p class="mw-eyebrow">MEMORY EXAM / DAY ${report.sessions[0]?.day ?? 0}–${report.sessions.at(-1)?.day ?? 0}</p><h2 id="mw-exam-title">Memory Exam · 单词配对</h2>
    <p class="mw-caption">先选英文，再选对应中文。每轮最多 8 对，优先练习还没有配对正确的词；重复出现的 dig 合并为一题。待确认词形会保留标记。</p>
    <div class="mw-filters"><label>故事 / 周次<select id="mw-exam-story"><option value="">全部故事 · 第 1–${report.weeks.length} 周</option>${report.stories.map(story => `<option value="${story.week}">${e(story.id.toUpperCase().replace('-', ' '))} · 第 ${story.week} 周${inferred(report.weeks.find(week => week.number === story.week))} · Day ${story.startDay}–${story.endDay}</option>`).join('')}</select></label><label>Day<select id="mw-exam-day"><option value="">全部 Day</option></select></label></div>
    <div class="mw-exam-meter"><div><strong id="mw-exam-remembered">0 / ${examWords.length}</strong><span>本范围已配对正确</span></div><progress id="mw-exam-progress" max="${examWords.length}" value="0" aria-label="本范围配对记录"></progress><p id="mw-exam-total">全部词表：0 / ${examWords.length}</p></div>
    <div class="mw-exam-toolbar"><p id="mw-exam-scope" class="mw-meta">全部故事 · ${examWords.length} 个不同词形</p><button type="button" class="mw-primary" id="mw-exam-new">换一轮</button></div>
    <div class="mw-exam-heading"><h3>英文</h3><h3>中文释义</h3></div><div class="mw-match-board" id="mw-match-board"></div>
    <p class="mw-exam-message" id="mw-exam-message" role="status" aria-live="polite">选择一张英文卡片和一张中文卡片。</p>
    <div class="mw-exam-footer"><p id="mw-exam-score">本轮 0 / 8</p><button type="button" id="mw-exam-reset">重置本范围记录</button></div>
    <p class="mw-caption" id="mw-exam-storage">配对记录仅保存在当前浏览器。配对正确后，也请试着读出这个词、复述故事或造句。</p>
    <noscript><p>请启用 JavaScript 进行配对，也可以使用下方完整词表遮住中文自测。</p></noscript><script id="mw-exam-data" type="application/json">${examData}</script><script src="${site ? '/things/miller-words/report/memory-exam.js' : 'memory-exam.js'}" defer></script>
  </section>
  <section class="mw-section" id="weeks"><h2>按周看积累</h2><p class="mw-caption">周次沿用照片分隔和词表顺序；尚未配故事的周次仍会保留在统计中。</p><div class="mw-weeks">${weeks}</div><table class="mw-table"><caption>各周词条记录与不同词形</caption><thead><tr><th scope="col">周次</th><th scope="col">Day 范围</th><th scope="col" class="mw-number">记录数</th><th scope="col" class="mw-number">不同词形</th></tr></thead><tbody>${weekTable}</tbody><tfoot><tr><th scope="row">全词表</th><td>Day ${report.sessions[0]?.day ?? 0}–${report.sessions.at(-1)?.day ?? 0}</td><td class="mw-number">${report.totalEntries}</td><td class="mw-number">${report.uniqueWords}</td></tr></tfoot></table></section>
  <section class="mw-section" id="days"><h2>按 Day 看积累</h2><p class="mw-caption">柱高表示当天记录数。点 Day 可直接查看当天单词；展开明细可查看新词形和累计记录。</p>${daily}</section>
  <section class="mw-section" id="word-bank"><h2>完整单词本</h2><p class="mw-caption">保持“周次 → Day → 当天序号”的原始顺序。待确认的手写词形仍保留标记。</p><div class="mw-filters"><label>搜索英文或中文<input id="mw-search" type="search" placeholder="例如 scales / 鳞片" autocomplete="off"></label><label>筛选周次<select id="mw-week-filter"><option value="">全部周次</option>${report.weeks.map(week=>`<option value="${week.number}">第 ${week.number} 周${inferred(week)}</option>`).join('')}</select></label></div><div class="mw-heading"><p class="mw-meta" id="mw-filter-count" role="status" aria-live="polite">显示 ${report.totalEntries} 条词条记录</p><button type="button" id="mw-show-all">展开词表</button></div><p class="mw-empty" id="mw-empty" hidden>没有找到匹配的单词。请换个词或选择全部周次。</p>${wordBank}</section>
  <footer class="mw-note"><p>统计来自已整理的单词记录，按词条计算，不代表已掌握数量。复习间隔从实际首次练习日开始：第 1、3、7、14 天。</p><p>${e(report.sourceNote)}</p></footer>
  </article>`;
}
