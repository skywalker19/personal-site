(function () {
  const raw = Array.isArray(window.PODCAST_GROWTH_DATA) ? window.PODCAST_GROWTH_DATA : [];
  const svg = document.getElementById("growth-chart");
  const tableBody = document.getElementById("growth-data-body");
  const countNode = document.getElementById("growth-observation-count");
  if (!svg || !raw.length) return;

  const data = raw.map(([timestamp, plays, subscribers, source]) => ({
    timestamp,
    time: new Date(timestamp).getTime(),
    plays,
    subscribers,
    source
  })).sort((a, b) => a.time - b.time);

  const W = 1040;
  const H = 650;
  const left = 104;
  const right = 34;
  const plotWidth = W - left - right;
  const panelHeight = 190;
  const playsTop = 66;
  const subscribersTop = 354;
  const NS = "http://www.w3.org/2000/svg";
  const minTime = data[0].time;
  const maxTime = data[data.length - 1].time;
  const formatNumber = new Intl.NumberFormat("zh-CN");
  const formatDate = new Intl.DateTimeFormat("zh-CN", { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });

  const make = (name, attrs = {}, text = "") => {
    const node = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
    if (text) node.textContent = text;
    return node;
  };
  const x = (time) => left + ((time - minTime) / (maxTime - minTime)) * plotWidth;
  const niceStep = (maximum) => {
    const rough = maximum / 4;
    const power = 10 ** Math.floor(Math.log10(rough));
    const normalized = rough / power;
    const factor = normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10;
    return factor * power;
  };
  const panelScale = (key, top) => {
    const maximum = Math.max(...data.map((point) => point[key]));
    const step = niceStep(maximum);
    const ceiling = Math.ceil(maximum / step) * step;
    return {
      ceiling,
      step,
      y: (value) => top + panelHeight - (value / ceiling) * panelHeight
    };
  };
  const plays = panelScale("plays", playsTop);
  const subscribers = panelScale("subscribers", subscribersTop);

  const title = make("title", { id: "growth-chart-title" }, "累计播放与订阅者增长折线图");
  const description = make("desc", { id: "growth-chart-description" }, `使用${data.length}个同时显示累计播放和订阅者的截图观测点。上方面板是累计播放，下方面板是订阅者，两者共用同一时间轴。`);
  svg.append(title, description);

  const defs = make("defs");
  const playGradient = make("linearGradient", { id: "play-area", x1: "0", y1: "0", x2: "0", y2: "1" });
  playGradient.append(make("stop", { offset: "0%", "stop-color": "#ff6b53", "stop-opacity": ".25" }), make("stop", { offset: "100%", "stop-color": "#ff6b53", "stop-opacity": "0" }));
  const subscriberGradient = make("linearGradient", { id: "subscriber-area", x1: "0", y1: "0", x2: "0", y2: "1" });
  subscriberGradient.append(make("stop", { offset: "0%", "stop-color": "#25a9c2", "stop-opacity": ".24" }), make("stop", { offset: "100%", "stop-color": "#25a9c2", "stop-opacity": "0" }));
  defs.append(playGradient, subscriberGradient);
  svg.append(defs);

  const drawPanel = (key, label, top, scale, color, gradientId) => {
    const group = make("g", { class: `chart-panel chart-panel-${key}` });
    group.append(make("text", { x: left, y: top - 25, class: "chart-panel-label" }, label));
    group.append(make("text", { x: W - right, y: top - 25, class: "chart-panel-total", "text-anchor": "end" }, formatNumber.format(data[data.length - 1][key])));

    for (let value = 0; value <= scale.ceiling; value += scale.step) {
      const y = scale.y(value);
      group.append(make("line", { x1: left, y1: y, x2: W - right, y2: y, class: "chart-grid-line" }));
      group.append(make("text", { x: left - 15, y: y + 4, class: "chart-axis-label", "text-anchor": "end" }, value >= 1000 ? `${value / 1000}k` : String(value)));
    }

    const linePoints = data.map((point) => `${x(point.time).toFixed(2)},${scale.y(point[key]).toFixed(2)}`);
    const linePath = `M${linePoints.join(" L")}`;
    const areaPath = `${linePath} L${x(data[data.length - 1].time).toFixed(2)},${top + panelHeight} L${x(data[0].time).toFixed(2)},${top + panelHeight} Z`;
    group.append(make("path", { d: areaPath, fill: `url(#${gradientId})`, class: "chart-area" }));
    group.append(make("path", { d: linePath, fill: "none", stroke: color, class: "chart-line" }));

    const highlighted = new Set(["IMG_0507.PNG", "IMG_1059.PNG", "IMG_2894.PNG", "IMG_3014.PNG", "IMG_7282.PNG"]);
    data.filter((point) => highlighted.has(point.source)).forEach((point) => {
      group.append(make("circle", { cx: x(point.time), cy: scale.y(point[key]), r: 5, fill: color, class: "chart-milestone-dot" }));
    });
    return group;
  };

  svg.append(
    drawPanel("plays", "累计播放", playsTop, plays, "#ff6b53", "play-area"),
    drawPanel("subscribers", "订阅者", subscribersTop, subscribers, "#25a9c2", "subscriber-area")
  );

  const tickDates = [
    [data[0].time, "2025.11"],
    [new Date("2026-01-01T00:00:00+08:00").getTime(), "2026.01"],
    [new Date("2026-03-01T00:00:00+08:00").getTime(), "03"],
    [new Date("2026-05-01T00:00:00+08:00").getTime(), "05"],
    [new Date("2026-07-01T00:00:00+08:00").getTime(), "07"],
    [data[data.length - 1].time, "08.23"]
  ];
  const axisY = subscribersTop + panelHeight + 34;
  tickDates.forEach(([time, label], index) => {
    const position = x(time);
    svg.append(make("line", { x1: position, y1: playsTop, x2: position, y2: subscribersTop + panelHeight, class: "chart-time-guide" }));
    svg.append(make("text", {
      x: position,
      y: axisY,
      class: "chart-time-label",
      "text-anchor": index === 0 ? "start" : index === tickDates.length - 1 ? "end" : "middle"
    }, label));
  });

  const noteY = H - 25;
  svg.append(make("text", { x: left, y: noteY, class: "chart-footnote" }, `共 ${data.length} 个可核对观测点 · 时间轴按实际间隔绘制`));
  countNode.textContent = `${data.length} 个截图观测点`;

  data.forEach((point) => {
    const row = document.createElement("tr");
    [formatDate.format(new Date(point.timestamp)), formatNumber.format(point.plays), formatNumber.format(point.subscribers)].forEach((value) => {
      const cell = document.createElement("td");
      cell.textContent = value;
      row.append(cell);
    });
    tableBody.append(row);
  });
})();
