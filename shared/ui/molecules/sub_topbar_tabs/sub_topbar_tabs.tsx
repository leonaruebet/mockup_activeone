'use client';

/**
 * SubTopbarTabs Component
 * Purpose: Reusable tabbed navigation component for sub-pages
 * Location: shared/ui/molecules/sub_topbar_tabs/sub_topbar_tabs.tsx
 *
 * Features:
 * - Flexible tab configuration with icons and labels
 * - Active tab indicator with primary-600 bottom border
 * - Controlled component pattern for state management
 * - Renders children as tab content
 * - Clean, modern design with border separator
 *
 * Usage:
 * ```tsx
 * <SubTopbarTabs
 *   tabs={[
 *     { id: 'tab1', label: 'Tab 1', icon: Icon1 },
 *     { id: 'tab2', label: 'Tab 2', icon: Icon2 }
 *   ]}
 *   activeTab="tab1"
 *   onTabChange={(id) => setActiveTab(id)}
 * >
 *   {(activeTab) => (
 *     <>
 *       {activeTab === 'tab1' && <Tab1Content />}
 *       {activeTab === 'tab2' && <Tab2Content />}
 *     </>
 *   )}
 * </SubTopbarTabs>
 * ```
 */

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../organisms/tabs/tabs';
import type { LucideIcon } from 'lucide-react';

/**
 * TabConfig Interface
 * Purpose: Define structure for each tab
 */
export interface TabConfig {
  id: string;
  label: string;
  icon?: LucideIcon;
}

/**
 * SubTopbarTabsProps Interface
 * Purpose: Component props definition
 */
export interface SubTopbarTabsProps {
  /** Array of tab configurations */
  tabs: TabConfig[];
  /** Currently active tab ID */
  activeTab: string;
  /** Callback when tab changes */
  onTabChange: (tabId: string) => void;
  /** Children can be a render function that receives activeTab or React nodes */
  children: ((activeTab: string) => React.ReactNode) | React.ReactNode;
  /** Optional CSS class for container */
  className?: string;
}

/**
 * SubTopbarTabs Component
 * Purpose: Reusable tabbed navigation for sub-pages
 * Params:
 *   - tabs: Array of tab configurations
 *   - activeTab: Currently active tab ID
 *   - onTabChange: Callback when tab changes
 *   - children: Content to render (can be render function or nodes)
 *   - className: Optional container class
 * Returns: Tabbed navigation UI with content area
 */
export function SubTopbarTabs({
  tabs,
  activeTab,
  onTabChange,
  children,
  className = '',
}: SubTopbarTabsProps) {
  console.log('[SubTopbarTabs] Rendering with activeTab:', activeTab);
  console.log('[SubTopbarTabs] Available tabs:', tabs.map((t) => t.id));

  return (
    <div className={`flex flex-col h-full w-full ${className}`}>
      <Tabs
        value={activeTab}
        onValueChange={onTabChange}
        className="flex flex-col h-full w-full"
      >
        {/* Tab Navigation */}
        <div className="border-b border-noble-black-200 pt-6 -mx-6">
          <TabsList className="bg-transparent border-none px-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="data-[state=active]:border-b-2 data-[state=active]:border-primary-600 rounded-none px-4 py-2"
                >
                  {Icon && <Icon className="h-4 w-4 mr-2" />}
                  {tab.label}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-auto">
          {typeof children === 'function' ? (
            children(activeTab)
          ) : (
            tabs.map((tab) => (
              <TabsContent key={tab.id} value={tab.id} className="h-full m-0">
                {children}
              </TabsContent>
            ))
          )}
        </div>
      </Tabs>
    </div>
  );
}
