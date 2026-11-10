# Calorie Tracker

A lightweight, responsive calorie and nutrition tracker web application built entirely with **vanilla HTML, CSS, and JavaScript**.

No frameworks, no external CSS libraries, and no backend needed. All user logs and custom targets persist locally in the web browser via `localStorage`.

---

## Features

- **Daily Calorie Dashboard**:
  - Live progress tracking of consumed vs. daily target calories.
  - Automatic calculation of remaining or surplus calories.
- **Macronutrient Tracking**:
  - Track daily Protein, Carbohydrate, and Fat totals with individual visual progress meters.
- **Meal Grouping**:
  - Log food entries categorized under **Breakfast**, **Lunch**, **Dinner**, or **Snacks**.
  - Displays subtotals per meal category and supports one-click deletion with automatic recalculation.
- **Quick-Add Presets**:
  - Instant one-click calorie additions (+50, +100, +250, +500 kcal).
- **Date Navigation**:
  - Seamlessly switch between dates (previous/next day, date picker, or jump back to "Today").
- **Custom Goals & Data Management**:
  - Customizable daily calorie and macronutrient targets in Settings.
  - JSON data export and import for easy backups and transfers.
  - Option to clear all stored data.

---

## Getting Started

Simply open `index.html` in any modern web browser:

```bash
# Clone the repository
git clone https://github.com/<username>/calorie-tracker.git

# Navigate to the folder
cd calorie-tracker

# Open in browser (Windows PowerShell)
Start-Process index.html
```

Or double-click `index.html` directly from your file manager.

---

## Tech Stack

- **HTML5**: Semantic, accessible markup.
- **CSS3**: Pure vanilla styling, modern flexbox & grid, custom UI components without any external CSS dependencies.
- **JavaScript (ES6+)**: Vanilla state management, DOM manipulation, and Web Storage API (`localStorage`).
