(() => {
  const root = document.querySelector('#memory-exam.mw-exam');
  if (!root) return;
  const bank = JSON.parse(root.querySelector('#mw-exam-data').textContent);
  const byId = new Map(bank.map(item => [item.id, item]));
  const storageKey = 'miller-words-memory-exam-v2';
  const get = id => root.querySelector(`#mw-exam-${id}`);
  const storySelect = get('story');
  const daySelect = get('day');
  const board = root.querySelector('#mw-match-board');
  const message = get('message');
  let remembered = new Set();
  let round = [], selectedWord = null, selectedMeaning = null;
  let matched = new Set();
  let available = [];

  function save() {
    try {
      localStorage.setItem(storageKey, JSON.stringify([...remembered]));
      get('storage').textContent = '配对记录仅保存在当前浏览器。配对正确后，也请试着读出这个词、复述故事或造句。';
    } catch {
      get('storage').textContent = '此浏览器无法保存记录，本次配对仍可继续；关闭页面后记录可能丢失。';
    }
  }
  try {
    const saved = localStorage.getItem(storageKey);
    if (saved !== null) {
      const ids = JSON.parse(saved);
      remembered = new Set(Array.isArray(ids) ? ids.filter(id => byId.has(id)) : []);
    } else {
      // Story 001 used index-word IDs; migrate by spelling, not by unstable index.
      const oldIds = JSON.parse(localStorage.getItem('miller-words-remembered-v1') || '[]');
      if (Array.isArray(oldIds)) {
        oldIds.filter(id => typeof id === 'string').forEach(id => {
          const word = id.slice(id.indexOf('-') + 1).toLocaleLowerCase();
          if (byId.has(`word:${word}`)) remembered.add(`word:${word}`);
        });
      }
      save();
    }
  } catch {
    get('storage').textContent = '未能读取浏览器中的旧记录；本次配对仍可继续。';
  }

  function shuffle(items) {
    const result = [...items];
    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }
  function origins(item) {
    return item.origins.filter(origin => (!storySelect.value || String(origin.week) === storySelect.value)
      && (!daySelect.value || String(origin.day) === daySelect.value));
  }
  function updateMeter() {
    const count = available.filter(item => remembered.has(item.id)).length;
    get('remembered').textContent = `${count} / ${available.length}`;
    get('progress').max = Math.max(available.length, 1);
    get('progress').value = count;
    get('total').textContent = `全部词表：${remembered.size} / ${bank.length}`;
    get('reset').disabled = !available.some(item => remembered.has(item.id));
  }
  function populateDays() {
    const current = daySelect.value;
    const days = [...new Set(bank.flatMap(item => item.origins)
      .filter(origin => !storySelect.value || String(origin.week) === storySelect.value)
      .map(origin => origin.day))].sort((a, b) => a - b);
    daySelect.replaceChildren(new Option('全部 Day', ''));
    days.forEach(day => daySelect.add(new Option(`Day ${day}`, String(day))));
    daySelect.value = days.some(day => String(day) === current) ? current : '';
  }
  function card(item, type) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mw-match-card';
    button.dataset.id = item.id;
    button.dataset.type = type;
    button.setAttribute('aria-pressed', 'false');
    const text = document.createElement('span');
    text.textContent = type === 'word' ? item.word : item.meaning;
    if (type === 'word') text.lang = 'en';
    button.append(text);
    if (type === 'word') {
      const label = document.createElement('small');
      label.textContent = `${origins(item).map(origin => `Day ${origin.day}`).join(' / ')}${item.pending ? ' · 词形待确认' : ''}`;
      button.append(label);
    }
    button.addEventListener('click', () => select(button));
    return button;
  }
  function select(button) {
    if (button.disabled) return;
    const type = button.dataset.type;
    board.querySelectorAll(`button[data-type="${type}"].selected`).forEach(previous => {
      previous.classList.remove('selected');
      previous.setAttribute('aria-pressed', 'false');
    });
    board.querySelectorAll('.wrong').forEach(previous => previous.classList.remove('wrong'));
    button.classList.add('selected');
    button.setAttribute('aria-pressed', 'true');
    if (type === 'word') selectedWord = button; else selectedMeaning = button;
    if (!selectedWord || !selectedMeaning) return;
    const word = byId.get(selectedWord.dataset.id);
    const meaning = byId.get(selectedMeaning.dataset.id);
    // Equivalent meanings remain valid even if future records share a translation.
    const correct = word.meaning === meaning.meaning;
    [selectedWord, selectedMeaning].forEach(selected => {
      selected.classList.remove('selected');
      selected.setAttribute('aria-pressed', 'false');
      selected.classList.add(correct ? 'matched' : 'wrong');
      if (correct) selected.disabled = true;
    });
    if (correct) {
      matched.add(word.id);
      remembered.add(word.id);
      save();
      updateMeter();
      get('score').textContent = `本轮 ${matched.size} / ${round.length}`;
      message.textContent = matched.size === round.length
        ? `本轮完成！${word.word} = ${word.meaning}。点“换一轮”继续。`
        : `配对正确：${word.word} = ${word.meaning}`;
    } else {
      message.textContent = '这两个词还不匹配，再选一次；可以回到故事里找线索。';
    }
    selectedWord = selectedMeaning = null;
  }
  function newRound() {
    available = bank.filter(item => origins(item).length);
    const due = shuffle(available.filter(item => !remembered.has(item.id)));
    const known = shuffle(available.filter(item => remembered.has(item.id)));
    const meanings = new Set();
    round = [...due, ...known].filter(item => {
      if (meanings.has(item.meaning)) return false;
      meanings.add(item.meaning);
      return true;
    }).slice(0, 8);
    matched = new Set();
    selectedWord = selectedMeaning = null;
    board.replaceChildren();
    for (const type of ['word', 'meaning']) {
      const column = document.createElement('div');
      column.className = 'mw-match-column';
      shuffle(round).forEach(item => column.append(card(item, type)));
      board.append(column);
    }
    const story = storySelect.value ? `Story ${storySelect.value.padStart(3, '0')}` : '全部故事';
    get('scope').textContent = `${story} · ${daySelect.value ? `Day ${daySelect.value}` : '全部 Day'} · ${available.length} 个不同词形`;
    get('score').textContent = `本轮 0 / ${round.length}`;
    get('new').disabled = !round.length;
    get('reset').disabled = !available.some(item => remembered.has(item.id));
    message.textContent = round.length ? `本轮 ${round.length} 对：选择一张英文卡片和一张中文卡片。` : '这个范围暂时没有单词，请选择其他范围。';
    updateMeter();
  }
  const requestedStory = new URLSearchParams(location.search).get('exam-story');
  if ([...storySelect.options].some(option => option.value === requestedStory)) storySelect.value = requestedStory;
  populateDays();
  storySelect.addEventListener('change', () => {populateDays(); newRound();});
  daySelect.addEventListener('change', newRound);
  get('new').addEventListener('click', newRound);
  get('reset').addEventListener('click', () => {
    available.forEach(item => remembered.delete(item.id));
    save();
    newRound();
    message.textContent = '已重置本范围的配对记录，其他范围的记录保留。';
  });
  newRound();
})();
