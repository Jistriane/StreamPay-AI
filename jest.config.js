/**
 * Root Jest configuration to support VS Code Jest Test Explorer.
 * It delegates to project-level configs in frontend and backend.
 */
module.exports = {
  projects: [
    '<rootDir>/frontend',
    '<rootDir>/backend'
  ],
};