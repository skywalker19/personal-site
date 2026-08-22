(function () {
  const story = window.PODCAST_STORY || {};
  const milestones = Array.isArray(story.milestones) ? story.milestones : [];
  const list = document.getElementById("timeline-list");
  const emptyState = document.getElementById("empty-state");

  const setText = (selector, value) => {
    document.querySelectorAll(selector).forEach((node) => {
      if (value) node.textContent = value;
    });
  };
  const setHtml = (selector, value) => {
    const node = document.querySelector(selector);
    if (node && value) node.innerHTML = value;
  };

  setText("[data-site-name]", story.siteName);
  setText("[data-eyebrow]", story.eyebrow);
  setText("[data-intro]", story.intro);
  setText("[data-section-intro]", story.sectionIntro);
  setText("[data-closing-copy]", story.closingCopy);
  setHtml("[data-title]", story.titleHtml);
  setHtml("[data-section-title]", story.sectionTitleHtml);
  setHtml("[data-closing-title]", story.closingTitleHtml);
  document.getElementById("footer-year").textContent = `© ${new Date().getFullYear()}`;

  const formatMetric = (value) => {
    if (value === null || value === undefined || value === "") return "待补充";
    if (typeof value === "number") return new Intl.NumberFormat("zh-CN").format(value);
    return String(value);
  };

  const makeMetric = (value, label) => {
    const item = document.createElement("div");
    item.className = "metric";
    const metricValue = document.createElement("span");
    metricValue.className = "metric-value";
    metricValue.textContent = formatMetric(value);
    const metricLabel = document.createElement("span");
    metricLabel.className = "metric-label";
    metricLabel.textContent = label;
    item.append(metricValue, metricLabel);
    return item;
  };

  const makeMedia = (milestone, index) => {
    const media = document.createElement("div");
    media.className = "milestone-media";
    const frameIndex = document.createElement("span");
    frameIndex.className = "frame-index";
    frameIndex.textContent = String(index + 1).padStart(2, "0");
    const frame = document.createElement("div");
    frame.className = "screenshot-frame";
    const placeholder = document.createElement("div");
    placeholder.className = "image-placeholder";
    placeholder.innerHTML = `<strong>放入这一刻的截图</strong><span>建议保留完整数据界面</span><code>assets/screenshots/your-image.png</code>`;

    if (milestone.image) {
      const image = document.createElement("img");
      image.src = milestone.image;
      image.alt = milestone.imageAlt || "播客数据截图";
      image.loading = "lazy";
      image.addEventListener("error", () => image.remove());
      image.addEventListener("load", () => placeholder.remove());
      frame.append(image, placeholder);
    } else {
      frame.append(placeholder);
    }
    media.append(frameIndex, frame);
    return media;
  };

  if (!milestones.length) {
    emptyState.hidden = false;
  } else {
    milestones.forEach((milestone, index) => {
      const article = document.createElement("article");
      article.className = "milestone reveal";
      if (milestone.kind) article.classList.add(`milestone-${milestone.kind}`);
      article.id = `milestone-${String(index + 1).padStart(2, "0")}`;
      const copy = document.createElement("div");
      copy.className = "milestone-copy";
      const date = document.createElement("p");
      date.className = "milestone-date";
      date.textContent = milestone.date || "日期待补充";
      const title = document.createElement("h3");
      title.textContent = milestone.title || "成长时刻";
      const metrics = document.createElement("div");
      metrics.className = "metrics";
      if (!milestone.hideMetrics) {
        if (!milestone.hideNullMetrics || milestone.subscribers !== null) {
          metrics.append(makeMetric(milestone.subscribers, "订阅者"));
        }
        if (!milestone.hideNullMetrics || milestone.listens !== null) {
          metrics.append(makeMetric(milestone.listens, "累计播放"));
        }
      }
      const description = document.createElement("p");
      description.className = "milestone-description";
      description.textContent = milestone.description || "";
      copy.append(date, title);
      if (metrics.childElementCount) copy.append(metrics);
      copy.append(description);
      if (milestone.metricNote) {
        const note = document.createElement("span");
        note.className = "metric-note";
        note.textContent = milestone.metricNote;
        copy.append(note);
      }
      if (milestone.isPlaceholder) {
        const chip = document.createElement("span");
        chip.className = "placeholder-chip";
        chip.textContent = "等待真实数据";
        copy.append(chip);
      }
      article.append(makeMedia(milestone, index), copy);
      list.append(article);
    });

    if (window.location.hash.startsWith("#milestone-")) {
      requestAnimationFrame(() => document.querySelector(window.location.hash)?.scrollIntoView());
    }
  }

})();
