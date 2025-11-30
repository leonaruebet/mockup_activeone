/**
 * Compatibility layer for atomic design components
 * Exports all working atomic design components
 */

// Working atomic design exports
export * as Atoms from './atoms';
export * as Molecules from './molecules';
export * as Organisms from './organisms';

// Note: Individual components are already exported via atomic design layers
// Use direct imports from atoms/molecules/organisms for better tree-shaking

// Migration tracking - Updated to reflect working components
export const MIGRATION_STATUS = {
  atoms: {
    button: 'completed',
    input: 'completed',
    label: 'completed',
    avatar: 'completed',
    loading_indicator: 'completed',
    sidebar_language_switcher: 'completed',
    spinner: 'completed',
    alert: 'completed',
    progress_bar: 'completed',
    skeleton: 'completed',
  },
  molecules: {
    card: 'completed',
    dropdown: 'completed',
    search_bar: 'completed',
    breadcrumb: 'pending',
    pagination: 'pending',
  },
  organisms: {
    dropdown_menu: 'completed',
    workspace_sidebar: 'completed',
    form: 'completed',
    data_table: 'pending',
  },
  templates: {
    dashboard_layout: 'pending',
    auth_layout: 'pending',
  }
};

// Helper function to check migration status
export const isMigrated = (component: string, level: 'atoms' | 'molecules' | 'organisms' | 'templates'): boolean => {
  return MIGRATION_STATUS[level][component as keyof typeof MIGRATION_STATUS[typeof level]] === 'completed';
};
