# Changelog

All notable changes to the Emerald Timer project will be documented in this file.

## [1.3.4] - 2026-02-20

### Added
- **Global Design Refinement**: Implemented a unified "Mature Bold Tight" typography system (`font-bold tracking-tight`) across all components (Setting, Stats, Log Viewers).
- **Settings Architecture**: Swapped the positions of "Display Zoom" (now on the primary left column) and "Notifications" (now secondary bottom-right) for better ergonomic flow.
- **Visual Smoothness**: Fixed "invisible" entry animations and restored transition speeds to 500ms (Window) and 200ms (Tabs) for a snappier, more professional feel.

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
