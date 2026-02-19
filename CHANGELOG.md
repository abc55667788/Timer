# Changelog

All notable changes to the Emerald Timer project will be documented in this file.

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
