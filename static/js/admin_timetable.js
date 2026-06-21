document.addEventListener('DOMContentLoaded', function () {

  let csrfToken = '';
  let currentWeek = null; // ISO date string of the Monday being viewed, or null = "this week"
  let allClients = []; // client list from the latest /api/admin/timetable response


  const calendarGrid = document.getElementById('calendarGrid');
  const weekLabel = document.getElementById('weekLabel');
  const prevWeekBtn = document.getElementById('prevWeekBtn');
  const nextWeekBtn = document.getElementById('nextWeekBtn');

  // ── Load and render everything for a given week ────────
  function loadTimetable(weekIso) {
    let url = '/api/admin/timetable';
    if (weekIso) {
      url += '?week=' + encodeURIComponent(weekIso);
    }

  fetch(url)
    .then(function (res) { return res.json(); })
    .then(function (data) {
      csrfToken = data.csrf_token;
      allClients = data.clients;
      renderTimetable(data);
    })

      .catch(function (err) {
        console.error('Failed to load timetable:', err);
      });
  }

  // ── Build the whole grid from JSON ─────────────────────
  function renderTimetable(data) {
    weekLabel.textContent = data.week_label;
    prevWeekBtn.dataset.week = data.prev_week;
    nextWeekBtn.dataset.week = data.next_week;

    calendarGrid.innerHTML = '';

    // Gutter
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

    // Day columns
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
      daySlots.forEach(function (slot) {
        body.appendChild(buildSlotBlock(slot));
      });

      dayCol.appendChild(body);
      calendarGrid.appendChild(dayCol);
    });
  }

  // ── Build one slot block button ─────────────────────────
  function buildSlotBlock(slot) {
    const bookedCount = slot.bookings.length;
    const isFull = bookedCount >= slot.capacity;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'calendar-slot';
    if (isFull) btn.classList.add('calendar-slot--full');
    if (!slot.is_recurring) btn.classList.add('calendar-slot--oneoff');

    btn.style.top = slot.top_px + 'px';
    btn.style.height = slot.height_px + 'px';
    btn.dataset.slotId = slot.slot_id;
    btn.dataset.slotInfo = slot.slot_info;
    btn.dataset.capacity = slot.capacity;

    const time = document.createElement('span');
    time.className = 'calendar-slot__time';
    time.textContent = slot.start_time + '\u2013' + slot.end_time;
    btn.appendChild(time);

    const label = document.createElement('span');
    label.className = 'calendar-slot__label';
    label.textContent = slot.label || 'Session';
    btn.appendChild(label);

    if (bookedCount > 0) {
      const clientsEl = document.createElement('span');
      clientsEl.className = 'calendar-slot__clients';
      clientsEl.textContent = slot.bookings.map(function (b) { return b.client_name; }).join(', ');
      btn.appendChild(clientsEl);
    }

    const capacityEl = document.createElement('span');
    capacityEl.className = 'calendar-slot__capacity';
    capacityEl.textContent = bookedCount + '/' + slot.capacity;
    btn.appendChild(capacityEl);

    btn.addEventListener('click', function () {
      openSlotModal(slot);
    });

    return btn;
  }

  // ── Week navigation ─────────────────────────────────────
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

  // ── Add Slot Modal ──────────────────────────────────────
  const addSlotModal = document.getElementById('addSlotModal');
  const openAddSlotBtn = document.getElementById('openAddSlotBtn');
  const cancelAddSlotBtn = document.getElementById('cancelAddSlotBtn');
  const addSlotForm = document.getElementById('addSlotForm');
  const addSlotError = document.getElementById('addSlotError');

  if (openAddSlotBtn) {
    openAddSlotBtn.addEventListener('click', function () {
      addSlotError.textContent = '';
      addSlotModal.classList.add('modal-overlay--open');
    });
  }
  if (cancelAddSlotBtn) {
    cancelAddSlotBtn.addEventListener('click', function () {
      addSlotModal.classList.remove('modal-overlay--open');
    });
  }
  if (addSlotModal) {
    addSlotModal.addEventListener('click', function (e) {
      if (e.target === addSlotModal) {
        addSlotModal.classList.remove('modal-overlay--open');
      }
    });
  }

  // Recurring / One-Off toggle
  const recurrenceBtns = document.querySelectorAll('.recurrence-toggle__btn');
  const isRecurringInput = document.getElementById('isRecurringInput');
  const dayOfWeekGroup = document.getElementById('dayOfWeekGroup');
  const specificDateGroup = document.getElementById('specificDateGroup');

  recurrenceBtns.forEach(function (btn) {
    btn.addEventListener('click', function () {
      recurrenceBtns.forEach(function (b) { b.classList.remove('recurrence-toggle__btn--active'); });
      btn.classList.add('recurrence-toggle__btn--active');

      const value = btn.dataset.value;
      isRecurringInput.value = value;

      if (value === '1') {
        dayOfWeekGroup.style.display = '';
        specificDateGroup.style.display = 'none';
      } else {
        dayOfWeekGroup.style.display = 'none';
        specificDateGroup.style.display = '';
      }
    });
  });

  if (addSlotForm) {
    addSlotForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const payload = {
        is_recurring: isRecurringInput.value,
        day_of_week: document.getElementById('dayOfWeek').value,
        specific_date: document.getElementById('specificDate').value,
        start_time: document.getElementById('startTime').value,
        end_time: document.getElementById('endTime').value,
        capacity: document.getElementById('capacity').value,
        label: document.getElementById('slotLabel').value
      };

      fetch('/api/admin/timetable/create_slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json(); })
        .then(function (result) {
          if (result.success) {
            addSlotModal.classList.remove('modal-overlay--open');
            addSlotForm.reset();
            loadTimetable(currentWeek);
          } else {
            addSlotError.textContent = result.message || 'Something went wrong.';
          }
        })
        .catch(function () {
          addSlotError.textContent = 'Network error. Please try again.';
        });
    });
  }

  // ── Slot Detail / Assign Client Modal ──────────────────
  const assignClientModal = document.getElementById('assignClientModal');
  const assignSlotInfo = document.getElementById('assignSlotInfo');
  const assignClientForm = document.getElementById('assignClientForm');
  const assignClientSelect = document.getElementById('assignClientSelect');
  const assignError = document.getElementById('assignError');
  const cancelAssignClientBtn = document.getElementById('cancelAssignClientBtn');
  const cancelSlotFromModalBtn = document.getElementById('cancelSlotFromModalBtn');

  let activeSlotId = null;

  function openSlotModal(slot) {
    activeSlotId = slot.slot_id;
    assignSlotInfo.textContent = slot.slot_info;
    assignError.textContent = '';

    assignClientSelect.innerHTML = '<option value="" disabled selected>Select a client...</option>';
    allClients.forEach(function (client) {
      const opt = document.createElement('option');
      opt.value = client.id;
      opt.textContent = client.name;
      assignClientSelect.appendChild(opt);
    });

  assignClientModal.classList.add('modal-overlay--open');
}
  if (cancelAssignClientBtn) {
    cancelAssignClientBtn.addEventListener('click', function () {
      assignClientModal.classList.remove('modal-overlay--open');
    });
  }
  if (assignClientModal) {
    assignClientModal.addEventListener('click', function (e) {
      if (e.target === assignClientModal) {
        assignClientModal.classList.remove('modal-overlay--open');
      }
    });
  }

  if (assignClientForm) {
    assignClientForm.addEventListener('submit', function (e) {
      e.preventDefault();

      const clientId = assignClientSelect.value;
      if (!clientId) {
        assignError.textContent = 'Please select a client.';
        return;
      }

      fetch('/api/admin/timetable/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ slot_id: activeSlotId, client_id: clientId })
      })
        .then(function (res) { return res.json(); })
        .then(function (result) {
          if (result.success) {
            assignClientModal.classList.remove('modal-overlay--open');
            loadTimetable(currentWeek);
          } else {
            assignError.textContent = result.message || 'Could not assign client.';
          }
        })
        .catch(function () {
          assignError.textContent = 'Network error. Please try again.';
        });
    });
  }

  if (cancelSlotFromModalBtn) {
    cancelSlotFromModalBtn.addEventListener('click', function () {
      if (!activeSlotId) return;

      fetch('/api/admin/timetable/cancel_slot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': csrfToken
        },
        body: JSON.stringify({ slot_id: activeSlotId })
      })
        .then(function (res) { return res.json(); })
        .then(function () {
          assignClientModal.classList.remove('modal-overlay--open');
          loadTimetable(currentWeek);
        });
    });
  }

  // ── Initial load ────────────────────────────────────────
  loadTimetable(null);

});