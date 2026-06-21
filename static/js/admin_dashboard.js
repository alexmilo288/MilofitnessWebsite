document.addEventListener('DOMContentLoaded', function () {

  // ---------- Add Client modal open/close ----------
  const addClientModal = document.getElementById('addClientModal');
  const openAddClientBtn = document.getElementById('openAddClientBtn');
  const cancelAddClientBtn = document.getElementById('cancelAddClientBtn');

  if (openAddClientBtn) {
    openAddClientBtn.addEventListener('click', function () {
      addClientModal.classList.add('modal-overlay--open');
    });
  }
  if (cancelAddClientBtn) {
    cancelAddClientBtn.addEventListener('click', function () {
      addClientModal.classList.remove('modal-overlay--open');
    });
  }
  if (addClientModal) {
    addClientModal.addEventListener('click', function (e) {
      if (e.target === addClientModal) {
        addClientModal.classList.remove('modal-overlay--open');
      }
    });
  }

  // ---------- Add Client modal tabs ----------
  const tabs = document.querySelectorAll('.modal-tab');
  const panels = document.querySelectorAll('.modal-tab-panel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      const target = tab.getAttribute('data-tab');

      tabs.forEach(function (t) { t.classList.remove('modal-tab--active'); });
      panels.forEach(function (p) { p.classList.remove('modal-tab-panel--active'); });

      tab.classList.add('modal-tab--active');
      document.querySelector('.modal-tab-panel[data-panel="' + target + '"]').classList.add('modal-tab-panel--active');
    });
  });

  // ---------- View Details modal ----------
  const viewDetailsModal = document.getElementById('viewDetailsModal');
  const closeViewDetailsBtn = document.getElementById('closeViewDetailsBtn');
  const viewDetailsButtons = document.querySelectorAll('.view-details-btn');

  function fillField(className, value) {
    const el = document.querySelector('.' + className);
    if (!el) return;
    if (!value || value === 'None') {
      el.textContent = '—';
    } else {
      el.textContent = value;
    }
  }

  viewDetailsButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const data = btn.dataset;

      document.getElementById('viewDetailsName').textContent = data.name || 'Client Details';

      fillField('vd-email', data.email);
      fillField('vd-date_of_birth', data.dateOfBirth);
      fillField('vd-age', data.age);
      fillField('vd-phone', data.phone);
      fillField('vd-emergency_contact_name', data.emergencyContactName);
      fillField('vd-emergency_contact_phone', data.emergencyContactPhone);
      fillField('vd-notes', data.notes);
      fillField('vd-medical_conditions', data.medicalConditions);
      fillField('vd-injuries_surgeries', data.injuriesSurgeries);
      fillField('vd-medications', data.medications);
      fillField('vd-allergies', data.allergies);
      fillField('vd-doctor_notes', data.doctorNotes);
      fillField('vd-fitness_goals', data.fitnessGoals);
      fillField('vd-height', data.height);
      fillField('vd-weight', data.weight);
      fillField('vd-body_measurements', data.bodyMeasurements);
      fillField('vd-body_fat_percentage', data.bodyFatPercentage);
      fillField('vd-strength_test_notes', data.strengthTestNotes);
      fillField('vd-flexibility_test_notes', data.flexibilityTestNotes);
      fillField('vd-cardio_test_notes', data.cardioTestNotes);
      fillField('vd-mobility_assessment_notes', data.mobilityAssessmentNotes);
      fillField('vd-occupation', data.occupation);
      fillField('vd-activity_level', data.activityLevel);
      fillField('vd-sleep_habits', data.sleepHabits);
      fillField('vd-exercise_history', data.exerciseHistory);
      fillField('vd-dietary_habits', data.dietaryHabits);

      viewDetailsModal.classList.add('modal-overlay--open');
    });
  });

  if (closeViewDetailsBtn) {
    closeViewDetailsBtn.addEventListener('click', function () {
      viewDetailsModal.classList.remove('modal-overlay--open');
    });
  }
  if (viewDetailsModal) {
    viewDetailsModal.addEventListener('click', function (e) {
      if (e.target === viewDetailsModal) {
        viewDetailsModal.classList.remove('modal-overlay--open');
      }
    });
  }

});
