# Changelog

All notable changes to the Emerald Timer project will be documented in this file.

## [1.5.0-beta.1] - 2026-02-21

### Intelligent Insight Engine (Test Beta)
- **Personalized Insights**: Introduced a dynamic "Whisper Insight" system that provides context-aware greetings, productivity tips, and personal habit analysis.
- **Data-Driven Analysis**: Summarizes peak focus hours and weekly average focus time directly from local log history.
- **Muse Reflection**: Randomly surfacing snippets from your "Inspirations" to keep your creative goals top of mind.
- **Context Awareness**: Heuristic mood detection based on manual log descriptions (e.g., providing care tips when descriptors like "tired" or "stress" are used).
- **Aesthetic Integration**: Implemented "Ghost Whisper" typography—a minimalist, low-contrast italic font style that floats naturally within the timer's focus area.
- **Timed Refresh**: Insights now automatically rotate every 30 minutes or upon each app launch to ensure fresh inspiration throughout the day.

## [1.4.0] - 2026-02-21

### Desktop & Mini Mode Optimizations
- **Mini Mode Memory**: Fixed an issue where the mini mode window position was not remembered after being dragged. Now, if you drag the mini window and then expand it (e.g., to edit a session or view logs), it will return to your preferred desktop location when switching back to mini mode.
- **Production Readiness**: Removed all built-in demo data to provide a clean, production-ready recording environment for new users.

### Professional Dark Mode Overhaul
- **Dedicated Dark/Zinc Theme**: Implemented "Deep Dark Zinc" (Zinc-950) as the system default for professional use.
- **Aesthetic Refinement**: Migrated from "Neon Emerald" to a more focused and reduced eye-strain color palette.
- **UI Standardized**: Implemented `zinc-950` foundation with `zinc-900` elevated cards and `zinc-800` interactive base.
- **Shadow System**: Replaced glow effects with deep black shadows (`shadow-black/70`) for professional depth.
- **Dark Mode Support**: Comprehensive Dark/Zinc mode support with improved backdrop blurs (`backdrop-blur-3xl`).
- **Glow Optimization**: Refined timer ring glows to be non-obtrusive and more professional.
- **Notification Design**: Overhauled all "Prompt" modals (Phase Complete, Log Decision, etc.) to be borderless with high-contrast button states.

### Interactive & Visual Enhancements
- **Timer Controls**: Start (Green) and Pause (Orange) buttons are now permanently colored for instant recognition.
- **Header Optimization**: Removed redundant Settings icon from the top header to prioritize the "Mini Mode" toggle and clean up the interface.
- **Mini Mode Polishing**: Added high-visibility "White-Highlight" hover states for all mini-buttons.
- **Edit Mode Feedback**: Redesigned "Save Changes" and "Cancel" buttons with clear semantic color hover states.
- **Visualization Fixes**: Categorical breakdown tooltips in StatsBoard now have forced high-contrast styling for perfect readability in dark mode.
- **Global Stylistic Purge**: Removed legacy emerald-based translucent backgrounds and glow effects across all boards.

## [1.3.9] - 2026-02-21

### Visual & UX Refinements
- **Window Rendering**: Fixed "black rectangular shadow" artifacts on Windows by removing outermost CSS shadows and background blur from the root container.
- **Micro-interactions**: Accelerated transition speed to 200ms when entering Mini Mode for an instant "shrinking" feel.
- **UI Scaling**: Enhanced flexibility with support for up to 300% (3.0) scale for accessibility.
- **Glassmorphism**: Unified card styles with 1.4rem (24px) corners across Logs, Journal, and Stats boards.
- **Button Icons**: Replaced complex icons with cleaner alternatives (`Library`) for better clarity at small scales.

## [1.3.8] - 2026-02-21

### Optimized (Android specific)
- **UI Centering**: Centered the focus timer board vertically on Android for better ergonomics.
- **Stats Navigation**: Set the timeline calendar to be collapsed by default on Android to maximize space.
- **Touch Support**: Added native touch and swipe interaction for the horizontal timeline in the Stats view.
- **Visual Cleanup**: Removed the "Display Zoom" setting on Android as it's not applicable to the native platform.
- **UI Artifact Fixes**: Fixed a white border issue on the left side of the Stats view when the calendar drawer is collapsed.
- **Persistent Notification**: Implemented a sticky notification for the Android status bar that updates when the timer is running in the background. Added "Play/Pause" and "Skip" quick actions.
- **Flicker Reduction**: Optimized background update logic to reduce notification bar flashing and battery drain by removing periodic per-second updates.
- **Background Persistence**: Implemented a Date-based timer logic to prevent time drift when the JS engine is suspended by Android.
- **Pre-scheduled Alarms**: Added pre-scheduled future notifications for phase completion, ensuring the user is alerted with sound and vibration even if the app process is frozen.

## [1.3.5] - 2026-02-20

### Changed
- **Default Scaling**: Set the initial UI scale for PC releases to **130%** (1.3) to provide better accessibility and utilization of high-resolution monitors.

## [1.3.4] - 2026-02-20

### Added
- **Global Design Refinement**: Implemented a unified "Mature Bold Tight" typography system (`font-bold tracking-tight`) across all components (Setting, Stats, Log Viewers).
- **Settings Architecture**: Swapped the positions of "Display Zoom" (now on the primary left column) and "Notifications" (now secondary bottom-right) for better ergonomic flow.
- **Visual Smoothness**: Fixed "invisible" entry animations and restored transition speeds to 500ms (Window) and 200ms (Tabs) for a snappier, more professional feel.
- **Android Support**: Integrated the Android build (APK) into the official release cycle.

### Changed
- **Stats Unification**: Standardized the Month and Week view layouts to use the high-density grid pattern from the Year view, maximizing screen utility on wide monitors.
- **Logging Interface**: Refactored labels and inputs in manual and automatic logging modals for better readability and consistent design.

### Fixed
- **Runtime Error**: Fixed `ReferenceError: Bell is not defined` in the Setup modal notification section.
- **Component Stability**: Ensured all icons and state variables in the Settings panel are properly synchronized with the core application state.

## [1.3.3] - 2026-02-20

### Added
- **UI Responsiveness**: Removed fixed maximum width limits (`max-w-7xl`, `max-w-5xl`, etc.) from StatsBoard, SetupModal, and LogsBoard. The app now fully utilizes available window space in fullscreen mode.
- **Dynamic Grid Layout**: Enhanced LogsBoard to support up to 5 columns on ultra-wide screens for better information density.
- **Success Notifications**: Added a persistent "Preferences Saved Successfully!" notice after saving settings.

### Changed
- **Settings UX**: Consolidated "Save Changes" and "Save Preferences" into a single, prominent action button at the bottom of the Settings page.
- **Navigation Logic**: Saving settings no longer automatically navigates the user back to the Focus view, allowing for contiguous configuration.

### Fixed
- **Layout Clipping**: Fixed an issue where the Settings content could be partially cut off or centered awkwardly on very large windows.

## [1.3.2] - 2026-02-20

### Added
- **Dynamic UI Scaling**: Now supports a numeric zoom scaling input field (10%-300%) with "Enter-to-apply" logic. 
- **Stats Board Grid Optimization**: 
  - Redesigned the Month/Week view layout. 
  - Month view now features a side-by-side layout (Data Grid & Category Stats) to eliminate white space on wide monitors.
  - Week view now utilizes rectangular cards (`1.8:1`) for better horizontal density.
  - Increased font sizes in grid cards for improved visibility on high-resolution screens.
- **Ergonomics**: Repositioned the TimerBoard and StatsBoard views to stay near the top/center of the screen on ultra-wide monitors.

### Fixed
- **MiniCalendar Syntax**: Fixed a redundant tag error causing Babel compilation failure.
- **Release Workflow**: Cleaned up duplicated fields in `release.yml` causing inconsistent CI releases.
- **File Consolidation**: Synchronized `main.cjs` and `preload.cjs` as the primary entry points.

---

## [1.3.0] - 2026-02-19

### Added
- **Dynamic Category Management**: Full CRUD support for timer categories. You can now customize category names, icons, and colors directly from the Settings page.
- **Improved Journal Sidebar**: The Focus timer board now automatically shifts to the left when the Journal sidebar is opened, allowing for a side-by-side view without overlaying.
- **Enhanced Muse (Inspiration) Module**: 
  - Support for multiple image attachments per inspiration note.
  - Added clipboard support for pasting images directly into Inspiration notes.
  - Inspiration cards now display image thumbnails and clickable reference links.
  - Direct preview for images on inspiration cards without opening the full edit modal.
- **UI Polishing**: Added hover states for category management, improved card designs, and smoother transitions.

### Changed
- Refactored category state from hardcoded constants to dynamic root state stored in localStorage.
- Updated all modals (Logging, Manual Log, View Log) to use the new dynamic category system.

### Fixed
- Resolved `ReferenceError: categoryColors is not defined` after the category state migration.

---

## [1.2.0] - 2026-02-18
- Initial stable release with basic Pomodoro features and GitLab sync.
