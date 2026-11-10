/**
 * Calorie Tracker - Pure Vanilla JavaScript
 * Persistent data storage via localStorage (no backend, no external dependencies)
 */

(function () {
  'use strict';

  // Storage key
  const STORAGE_KEY = 'nutritrack_calorie_tracker_data_v1';

  // Default initial configuration
  const DEFAULT_DATA = {
    settings: {
      dailyCalories: 2000,
      dailyProtein: 150,
      dailyCarbs: 200,
      dailyFat: 65
    },
    entries: []
  };

  // State
  let appData = loadData();
  let currentDate = getTodayDateString();

  // DOM Elements
  const datePicker = document.getElementById('date-picker');
  const prevDateBtn = document.getElementById('prev-date-btn');
  const nextDateBtn = document.getElementById('next-date-btn');
  const todayBtn = document.getElementById('today-btn');
  const selectedDateDisplay = document.getElementById('selected-date-display');

  // Stats Elements
  const totalConsumedDisplay = document.getElementById('total-consumed-calories');
  const targetCaloriesDisplay = document.getElementById('target-calories-display');
  const remainingCaloriesDisplay = document.getElementById('remaining-calories-display');
  const remainingLabel = document.getElementById('remaining-label');
  const calorieProgressFill = document.getElementById('calorie-progress-fill');
  const progressPercentageDisplay = document.getElementById('progress-percentage');
  const calorieStatusText = document.getElementById('calorie-status-text');

  // Macros Elements
  const proteinSummary = document.getElementById('protein-summary');
  const carbsSummary = document.getElementById('carbs-summary');
  const fatSummary = document.getElementById('fat-summary');
  const proteinProgressFill = document.getElementById('protein-progress-fill');
  const carbsProgressFill = document.getElementById('carbs-progress-fill');
  const fatProgressFill = document.getElementById('fat-progress-fill');

  // Food Form Elements
  const addFoodForm = document.getElementById('add-food-form');
  const foodNameInput = document.getElementById('food-name');
  const mealCategoryInput = document.getElementById('meal-category');
  const foodCaloriesInput = document.getElementById('food-calories');
  const foodProteinInput = document.getElementById('food-protein');
  const foodCarbsInput = document.getElementById('food-carbs');
  const foodFatInput = document.getElementById('food-fat');

  // Meal Lists
  const listBreakfast = document.getElementById('list-breakfast');
  const listLunch = document.getElementById('list-lunch');
  const listDinner = document.getElementById('list-dinner');
  const listSnacks = document.getElementById('list-snacks');
  const subtotalBreakfast = document.getElementById('subtotal-breakfast');
  const subtotalLunch = document.getElementById('subtotal-lunch');
  const subtotalDinner = document.getElementById('subtotal-dinner');
  const subtotalSnacks = document.getElementById('subtotal-snacks');
  const entriesCountDisplay = document.getElementById('entries-count');

  // Settings Modal Elements
  const settingsModal = document.getElementById('settings-modal');
  const openSettingsBtn = document.getElementById('open-settings-btn');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const settingsForm = document.getElementById('settings-form');
  const goalCaloriesInput = document.getElementById('goal-calories');
  const goalProteinInput = document.getElementById('goal-protein');
  const goalCarbsInput = document.getElementById('goal-carbs');
  const goalFatInput = document.getElementById('goal-fat');

  // Backup & Reset Elements
  const exportDataBtn = document.getElementById('export-data-btn');
  const importDataInput = document.getElementById('import-data-input');
  const clearAllDataBtn = document.getElementById('clear-all-data-btn');

  // Toast
  const toastElement = document.getElementById('toast');
  let toastTimeout = null;

  /* ==========================================================================
     Helper Functions: Date Formatting
     ========================================================================== */

  /**
   * Return YYYY-MM-DD for a given Date object (local timezone)
   */
  function formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  function getTodayDateString() {
    return formatDateKey(new Date());
  }

  function parseDateKey(dateKey) {
    const parts = dateKey.split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }

  function formatDisplayDate(dateKey) {
    const today = getTodayDateString();
    if (dateKey === today) {
      return 'Today';
    }

    const targetDate = parseDateKey(dateKey);
    const todayDate = parseDateKey(today);
    const diffDays = Math.round((targetDate - todayDate) / (1000 * 60 * 60 * 24));

    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';

    return targetDate.toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }

  /* ==========================================================================
     Storage & Data Management
     ========================================================================== */

  function loadData() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          settings: { ...DEFAULT_DATA.settings, ...(parsed.settings || {}) },
          entries: Array.isArray(parsed.entries) ? parsed.entries : []
        };
      }
    } catch (err) {
      console.error('Failed to load data from localStorage:', err);
    }

    // Seed friendly starter sample if brand new
    const seeded = JSON.parse(JSON.stringify(DEFAULT_DATA));
    const today = getTodayDateString();
    seeded.entries = [
      {
        id: 'seed_1',
        date: today,
        meal: 'breakfast',
        name: 'Avocado Toast with Poached Egg',
        calories: 380,
        protein: 14,
        carbs: 32,
        fat: 22
      },
      {
        id: 'seed_2',
        date: today,
        meal: 'lunch',
        name: 'Grilled Chicken Salad with Olive Oil',
        calories: 520,
        protein: 45,
        carbs: 18,
        fat: 28
      }
    ];
    saveDataDirect(seeded);
    return seeded;
  }

  function saveDataDirect(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
      showToast('Error saving data: Local storage might be full.');
    }
  }

  function persistData() {
    saveDataDirect(appData);
  }

  /* ==========================================================================
     UI Rendering
     ========================================================================== */

  function render() {
    // 1. Sync Date Navigator
    datePicker.value = currentDate;
    selectedDateDisplay.textContent = formatDisplayDate(currentDate);

    // 2. Filter entries for the selected day
    const dayEntries = appData.entries.filter(entry => entry.date === currentDate);
    entriesCountDisplay.textContent = `${dayEntries.length} ${dayEntries.length === 1 ? 'item' : 'items'} logged`;

    // 3. Compute totals
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;

    const mealsMap = {
      breakfast: { listEl: listBreakfast, subtotalEl: subtotalBreakfast, items: [], calories: 0 },
      lunch: { listEl: listLunch, subtotalEl: subtotalLunch, items: [], calories: 0 },
      dinner: { listEl: listDinner, subtotalEl: subtotalDinner, items: [], calories: 0 },
      snacks: { listEl: listSnacks, subtotalEl: subtotalSnacks, items: [], calories: 0 }
    };

    dayEntries.forEach(entry => {
      const cals = Number(entry.calories) || 0;
      const prot = Number(entry.protein) || 0;
      const carb = Number(entry.carbs) || 0;
      const fat = Number(entry.fat) || 0;

      totalCalories += cals;
      totalProtein += prot;
      totalCarbs += carb;
      totalFat += fat;

      const group = mealsMap[entry.meal] || mealsMap.snacks;
      group.items.push(entry);
      group.calories += cals;
    });

    // 4. Update Overview Calories
    const goalCalories = appData.settings.dailyCalories || 2000;
    const remainingCalories = goalCalories - totalCalories;
    const percentage = Math.round((totalCalories / goalCalories) * 100);

    totalConsumedDisplay.textContent = totalCalories.toLocaleString();
    targetCaloriesDisplay.textContent = goalCalories.toLocaleString();

    if (remainingCalories >= 0) {
      remainingLabel.textContent = 'Remaining';
      remainingCaloriesDisplay.textContent = remainingCalories.toLocaleString();
      remainingCaloriesDisplay.className = 'stat-value text-success';
      calorieProgressFill.classList.remove('exceeded');
      calorieProgressFill.style.width = `${Math.min(percentage, 100)}%`;
      calorieStatusText.textContent = remainingCalories === 0 ? 'Goal reached!' : `${remainingCalories} kcal left`;
    } else {
      const over = Math.abs(remainingCalories);
      remainingLabel.textContent = 'Over Goal';
      remainingCaloriesDisplay.textContent = `+${over.toLocaleString()}`;
      remainingCaloriesDisplay.className = 'stat-value text-danger';
      calorieProgressFill.classList.add('exceeded');
      calorieProgressFill.style.width = '100%';
      calorieStatusText.textContent = `${over} kcal over target`;
    }

    progressPercentageDisplay.textContent = `${percentage}% of daily goal`;

    // 5. Update Macros
    const goalProtein = appData.settings.dailyProtein || 150;
    const goalCarbs = appData.settings.dailyCarbs || 200;
    const goalFat = appData.settings.dailyFat || 65;

    proteinSummary.textContent = `${Math.round(totalProtein)}g / ${goalProtein}g`;
    carbsSummary.textContent = `${Math.round(totalCarbs)}g / ${goalCarbs}g`;
    fatSummary.textContent = `${Math.round(totalFat)}g / ${goalFat}g`;

    const proteinPercent = Math.min(100, Math.round((totalProtein / goalProtein) * 100));
    const carbsPercent = Math.min(100, Math.round((totalCarbs / goalCarbs) * 100));
    const fatPercent = Math.min(100, Math.round((totalFat / goalFat) * 100));

    proteinProgressFill.style.width = `${proteinPercent}%`;
    carbsProgressFill.style.width = `${carbsPercent}%`;
    fatProgressFill.style.width = `${fatPercent}%`;

    // 6. Render Meal Groups
    Object.keys(mealsMap).forEach(category => {
      const group = mealsMap[category];
      group.subtotalEl.textContent = `${group.calories.toLocaleString()} kcal`;

      if (group.items.length === 0) {
        group.listEl.innerHTML = `<li class="empty-meal-notice">No items logged for ${category}</li>`;
      } else {
        group.listEl.innerHTML = group.items.map(item => createEntryItemHtml(item)).join('');
      }
    });
  }

  function createEntryItemHtml(item) {
    const protein = Number(item.protein) || 0;
    const carbs = Number(item.carbs) || 0;
    const fat = Number(item.fat) || 0;

    let macroHtml = '';
    if (protein > 0 || carbs > 0 || fat > 0) {
      macroHtml = `
        <div class="entry-macros">
          ${protein > 0 ? `<span class="macro-tag-protein">P: ${protein}g</span>` : ''}
          ${carbs > 0 ? `<span class="macro-tag-carbs">C: ${carbs}g</span>` : ''}
          ${fat > 0 ? `<span class="macro-tag-fat">F: ${fat}g</span>` : ''}
        </div>
      `;
    }

    return `
      <li class="entry-item" data-id="${escapeHtml(item.id)}">
        <div class="entry-main">
          <span class="entry-name">${escapeHtml(item.name)}</span>
          ${macroHtml}
        </div>
        <div class="entry-aside">
          <span class="entry-calories">${Number(item.calories).toLocaleString()} kcal</span>
          <button type="button" class="entry-delete-btn" data-delete-id="${escapeHtml(item.id)}" title="Delete item" aria-label="Delete ${escapeHtml(item.name)}">
            &times;
          </button>
        </div>
      </li>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  /* ==========================================================================
     Actions: Add & Delete Entries
     ========================================================================== */

  function handleAddFood(e) {
    e.preventDefault();

    const name = foodNameInput.value.trim();
    const category = mealCategoryInput.value;
    const calories = parseFloat(foodCaloriesInput.value);

    if (!name) {
      showToast('Please enter a food name.');
      foodNameInput.focus();
      return;
    }

    if (isNaN(calories) || calories < 0) {
      showToast('Please enter a valid calorie amount.');
      foodCaloriesInput.focus();
      return;
    }

    const protein = parseFloat(foodProteinInput.value) || 0;
    const carbs = parseFloat(foodCarbsInput.value) || 0;
    const fat = parseFloat(foodFatInput.value) || 0;

    const newEntry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      date: currentDate,
      meal: category,
      name: name,
      calories: Math.round(calories),
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10
    };

    appData.entries.push(newEntry);
    persistData();
    render();

    // Reset inputs except meal category
    foodNameInput.value = '';
    foodCaloriesInput.value = '';
    foodProteinInput.value = '';
    foodCarbsInput.value = '';
    foodFatInput.value = '';
    foodNameInput.focus();

    showToast(`Added "${name}" (${newEntry.calories} kcal)`);
  }

  function handleQuickCalories(calories) {
    const newEntry = {
      id: 'entry_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
      date: currentDate,
      meal: 'snacks',
      name: `Quick Add (+${calories} kcal)`,
      calories: calories,
      protein: 0,
      carbs: 0,
      fat: 0
    };

    appData.entries.push(newEntry);
    persistData();
    render();
    showToast(`Quick added ${calories} kcal to Snacks`);
  }

  function handleDeleteEntry(entryId) {
    const index = appData.entries.findIndex(item => item.id === entryId);
    if (index !== -1) {
      const removed = appData.entries.splice(index, 1)[0];
      persistData();
      render();
      showToast(`Removed "${removed.name}"`);
    }
  }

  /* ==========================================================================
     Date Navigation
     ========================================================================== */

  function changeDateByOffset(offsetDays) {
    const date = parseDateKey(currentDate);
    date.setDate(date.getDate() + offsetDays);
    currentDate = formatDateKey(date);
    render();
  }

  function setTodayDate() {
    currentDate = getTodayDateString();
    render();
  }

  /* ==========================================================================
     Settings & Backups
     ========================================================================== */

  function openSettings() {
    goalCaloriesInput.value = appData.settings.dailyCalories;
    goalProteinInput.value = appData.settings.dailyProtein;
    goalCarbsInput.value = appData.settings.dailyCarbs;
    goalFatInput.value = appData.settings.dailyFat;
    settingsModal.classList.remove('hidden');
  }

  function closeSettings() {
    settingsModal.classList.add('hidden');
  }

  function handleSaveSettings(e) {
    e.preventDefault();

    const dailyCalories = parseInt(goalCaloriesInput.value, 10);
    const dailyProtein = parseInt(goalProteinInput.value, 10);
    const dailyCarbs = parseInt(goalCarbsInput.value, 10);
    const dailyFat = parseInt(goalFatInput.value, 10);

    if (isNaN(dailyCalories) || dailyCalories <= 0) {
      showToast('Please enter a valid calorie target.');
      return;
    }

    appData.settings = {
      dailyCalories,
      dailyProtein: isNaN(dailyProtein) ? 150 : dailyProtein,
      dailyCarbs: isNaN(dailyCarbs) ? 200 : dailyCarbs,
      dailyFat: isNaN(dailyFat) ? 65 : dailyFat
    };

    persistData();
    render();
    closeSettings();
    showToast('Nutrition targets updated!');
  }

  function exportData() {
    const jsonStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `calorie-tracker-backup-${getTodayDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Data exported successfully.');
  }

  function importData(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
      try {
        const parsed = JSON.parse(e.target.result);
        if (!parsed || typeof parsed !== 'object') {
          throw new Error('Invalid JSON');
        }

        appData = {
          settings: {
            ...DEFAULT_DATA.settings,
            ...(parsed.settings || {})
          },
          entries: Array.isArray(parsed.entries) ? parsed.entries : []
        };

        persistData();
        render();
        closeSettings();
        showToast('Data imported successfully!');
      } catch (err) {
        console.error(err);
        showToast('Error importing file: Invalid JSON format.');
      }
    };
    reader.readAsText(file);
  }

  function clearAllData() {
    const confirmed = window.confirm(
      'Are you sure you want to clear ALL logged data? This action cannot be undone.'
    );
    if (confirmed) {
      appData.entries = [];
      persistData();
      render();
      closeSettings();
      showToast('All logs have been cleared.');
    }
  }

  /* ==========================================================================
     Toast Notifications
     ========================================================================== */

  function showToast(message, duration = 3000) {
    if (toastTimeout) {
      clearTimeout(toastTimeout);
    }
    toastElement.textContent = message;
    toastElement.classList.remove('hidden');

    toastTimeout = setTimeout(() => {
      toastElement.classList.add('hidden');
    }, duration);
  }

  /* ==========================================================================
     Event Listeners Initialization
     ========================================================================== */

  function initEventListeners() {
    // Date Navigation
    datePicker.addEventListener('change', function () {
      if (this.value) {
        currentDate = this.value;
        render();
      }
    });

    prevDateBtn.addEventListener('click', () => changeDateByOffset(-1));
    nextDateBtn.addEventListener('click', () => changeDateByOffset(1));
    todayBtn.addEventListener('click', setTodayDate);

    // Add Food Form
    addFoodForm.addEventListener('submit', handleAddFood);

    // Quick Add Buttons
    document.querySelectorAll('[data-quick-calories]').forEach(btn => {
      btn.addEventListener('click', function () {
        const cals = parseInt(this.getAttribute('data-quick-calories'), 10);
        if (!isNaN(cals)) {
          handleQuickCalories(cals);
        }
      });
    });

    // Delete Item Delegate on meals container
    document.getElementById('meals-container').addEventListener('click', function (e) {
      const deleteBtn = e.target.closest('[data-delete-id]');
      if (deleteBtn) {
        const id = deleteBtn.getAttribute('data-delete-id');
        handleDeleteEntry(id);
      }
    });

    // Settings Modal
    openSettingsBtn.addEventListener('click', openSettings);
    closeSettingsBtn.addEventListener('click', closeSettings);
    settingsModal.addEventListener('click', function (e) {
      if (e.target === settingsModal) {
        closeSettings();
      }
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !settingsModal.classList.contains('hidden')) {
        closeSettings();
      }
    });

    settingsForm.addEventListener('submit', handleSaveSettings);

    // Backup & Data Actions
    exportDataBtn.addEventListener('click', exportData);
    importDataInput.addEventListener('change', function () {
      if (this.files && this.files[0]) {
        importData(this.files[0]);
        this.value = ''; // Reset input
      }
    });
    clearAllDataBtn.addEventListener('click', clearAllData);
  }

  // Initialize
  initEventListeners();
  render();

})();

