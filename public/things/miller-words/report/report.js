(() => {
  const root = document.querySelector('.mw-report');
  if (!root) return;
  const search = root.querySelector('#mw-search');
  const week = root.querySelector('#mw-week-filter');
  const groups = [...root.querySelectorAll('.mw-day-words')];
  const count = root.querySelector('#mw-filter-count');
  const empty = root.querySelector('#mw-empty');
  function filter() {
    const query = search.value.trim().toLocaleLowerCase();
    let entries = 0;
    groups.forEach(group => {
      const selected = !week.value || group.dataset.week === week.value;
      let matches = 0;
      group.querySelectorAll('tbody tr').forEach(row => {
        const visible = selected && (!query || row.textContent.toLocaleLowerCase().includes(query));
        row.hidden = !visible;
        if (visible) matches++;
      });
      group.hidden = matches === 0;
      if (query && matches) group.open = true;
      entries += matches;
    });
    count.textContent = `显示 ${entries} 条词条记录`;
    empty.hidden = entries > 0;
  }
  search.addEventListener('input', filter);
  week.addEventListener('change', filter);
  root.querySelector('#mw-show-all').addEventListener('click', () => {
    const open = groups.some(group => !group.hidden && !group.open);
    groups.forEach(group => { if (!group.hidden) group.open = open; });
    root.querySelector('#mw-show-all').textContent = open ? '收起词表' : '展开词表';
  });
  function showDay() {
    const id = location.hash.slice(1);
    const group = groups.find(group => group.id === id);
    if (group) {search.value = ''; week.value = ''; filter(); group.open = true; group.scrollIntoView();}
  }
  addEventListener('hashchange', showDay);
  filter();
  showDay();
})();
