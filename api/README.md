# API Compatibility Facade

This directory keeps backward-compatible TypeScript entry points for tooling that
expects the Nest API project to live at `api/*` rather than the Nx-native
`apps/api/*` location. Each source file re-exports the implementation from the
actual project so we avoid code duplication while restoring the original module
resolution roots used by older IDE configurations.
