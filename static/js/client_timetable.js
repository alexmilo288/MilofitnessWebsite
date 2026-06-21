document.addEventListener('DOMContentLoaded', function () {

  let currentWeek = null;

  const calendarGrid = document.getElementById('calendarGrid');
  const weekLabel = document.getElementById('weekLabel');
  const prevWeekBtn = document.getElementById('prevWeekBtn');
  const nextWeekBtn = document.getElementById('nextWeekBtn');
  const noSlotsMsg = document.getElementById('noSlotsMsg');

  function loadTimetable(weekIso) {
    let url = '/api/client/timetable';
    if (weekIso) url += '?week=' + encodeURIComponent(weekIso);

    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (data) {
        if (data.error) {
          calendarGrid.innerHTML = '';
          noSlotsMsg.textContent = data.error;
          noSlotsMsg.style.display = 'block';
          return;
        }
        renderTimetable(data);
      })
      .catch(function (err) { console.error('Failed to load timetable:', err); });
  }

  function renderTimetable(data) {
    weekLabel.textContent = data.week_label;
    prevWeekBtn.dataset.week = data.prev_week;
    nextWeekBtn.dataset.week = data.next_week;

    calendarGrid.innerHTML = '';

    const gutter = document.createElement('div');
    gutter.className = 'calendar-gutter';

    const gutterSpacer = document.createElement('div');
    gutterSpacer.className = 'calendar-gutter__spacer';
    gutter.appendChild(gutterSpacer);

    const gutterTimes = document.createElement('div');
    gutterTimes.className = 'calendar-gutter__times';
    gutterTimes.style.height = data.total_grid_height + 'px';

    data.time_labels.forEach(function (label) {
      const labelEl = document.createElement('div');
      labelEl.className = 'calendar-time-label';
      labelEl.style.top = label.top_px + 'px';
      labelEl.textContent = label.text;
      gutterTimes.appendChild(labelEl);
    });

    gutter.appendChild(gutterTimes);
    calendarGrid.appendChild(gutter);

    let totalSlots = 0;

    data.week_days.forEach(function (day) {
      const dayCol = document.createElement('div');
      dayCol.className = 'calendar-day';

      const header = document.createElement('div');
      header.className = 'calendar-day__header';

      const dayName = document.createElement('div');
      dayName.className = 'calendar-day__name';
      dayName.textContent = day.day_name;

      const dayNum = document.createElement('div');
      dayNum.className = 'calendar-day__date';
      dayNum.textContent = day.day_num;

      header.appendChild(dayName);
      header.appendChild(dayNum);
      dayCol.appendChild(header);

      const body = document.createElement('div');
      body.className = 'calendar-day__body';
      body.style.height = data.total_grid_height + 'px';

      const daySlots = data.grid_slots[day.iso] || [];
      totalSlots += daySlots.length;
      daySlots.forEach(function (slot) { body.appendChild(buildSlotBlock(slot)); });

      dayCol.appendChild(body);
      calendarGrid.appendChild(dayCol);
    });

    noSlotsMsg.style.display = totalSlots === 0 ? 'block' : 'none';
    noSlotsMsg.textContent = "You don't have any sessions booked this week.";
  }

  function buildSlotBlock(slot) {
    const el = document.createElement('div');
    el.className = 'calendar-slot';
    el.style.top = slot.top_px + 'px';
    el.style.height = slot.height_px + 'px';
    el.title = slot.slot_info;

    const time = document.createElement('span');
    time.className = 'calendar-slot__time';
    time.textContent = slot.start_time + '\u2013' + slot.end_time;
    el.appendChild(time);

    const label = document.createElement('span');
    label.className = 'calendar-slot__label';
    label.textContent = slot.label || 'Session';
    el.appendChild(label);

    return el;
  }

  if (prevWeekBtn) {
    prevWeekBtn.addEventListener('click', function () {
      currentWeek = prevWeekBtn.dataset.week;
      loadTimetable(currentWeek);
    });
  }
  if (nextWeekBtn) {
    nextWeekBtn.addEventListener('click', function () {
      currentWeek = nextWeekBtn.dataset.week;
      loadTimetable(currentWeek);
    });
  }

  loadTimetable(null);

});