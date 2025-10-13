# Dashboard Compatibility Facade

Legacy tooling still references the Angular dashboard application as
`apps/turbovets`. This directory re-exports the Nx-hosted implementation from
`apps/dashboard` so those imports resolve without duplicating source files.
