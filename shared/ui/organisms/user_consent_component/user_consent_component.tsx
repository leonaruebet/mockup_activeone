'use client';

import React, { useState, useEffect } from 'react';

// Conditional import with fallback for external data collector
let external_data_collector: any;
let User_Consent_Data: any;

try {
  const module = require('@irc/shared/analytics/external-data/external_data_collector');
  external_data_collector = module.external_data_collector;
  User_Consent_Data = module.User_Consent_Data;
} catch {
  // Fallback implementation when external module is not available
  console.warn('[User Consent Component] External data collector not available, using fallback');

  external_data_collector = {
    get_user_consent_data: () => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('user_consent_data');
        return stored ? JSON.parse(stored) : null;
      }
      return null;
    },
    store_user_consent_data: (data: any) => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('user_consent_data', JSON.stringify(data));
      }
      console.log('[Fallback] Stored user consent data:', data);
    },
    collect_all_external_data: () => {
      console.log('[Fallback] Collecting external data - fallback mode');
      return {
        timestamp: new Date().toISOString(),
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown',
        screen_resolution: typeof window !== 'undefined' && window.screen
          ? `${window.screen.width}x${window.screen.height}`
          : 'unknown',
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: typeof window !== 'undefined' ? window.navigator.language : 'unknown'
      };
    }
  };

  // Fallback type definition
  User_Consent_Data = {};
}

// Type definition for User_Consent_Data interface
interface User_Consent_Data {
  marketing_consent?: boolean;
  analytics_consent?: boolean;
  personalization_consent?: boolean;
  company_name?: string;
  company_size?: 'startup' | '1-10' | '11-50' | '51-200' | '201-1000' | '1000+';
  industry?: string;
  job_title?: string;
  use_case?: string;
  linkedin_profile?: string;
  twitter_handle?: string;
  github_username?: string;
}

/**
 * User Consent Data Collection Component
 * Collects additional user data with explicit consent for better analytics
 */

interface User_Consent_Props {
  onDataCollected?: (data: User_Consent_Data) => void;
  show_modal?: boolean;
  trigger_after_seconds?: number;
}

export function User_Consent_Modal({ 
  onDataCollected, 
  show_modal = false, 
  trigger_after_seconds = 30 
}: User_Consent_Props) {
  const [is_visible, set_is_visible] = useState(false);
  const [form_data, set_form_data] = useState<Partial<User_Consent_Data>>({
    marketing_consent: false,
    analytics_consent: false,
    personalization_consent: false
  });
  const [step, set_step] = useState<'consent' | 'details' | 'social'>('consent');

  useEffect(() => {
    // Check if user has already provided consent
    const existing_data = external_data_collector.get_user_consent_data();
    if (existing_data) return; // Don't show if already completed

    // Show modal based on trigger
    if (show_modal) {
      set_is_visible(true);
    } else if (trigger_after_seconds > 0) {
      const timer = setTimeout(() => {
        set_is_visible(true);
      }, trigger_after_seconds * 1000);
      
      return () => clearTimeout(timer);
    }
  }, [show_modal, trigger_after_seconds]);

  const handle_consent_submit = () => {
    if (form_data.analytics_consent) {
      set_step('details');
    } else {
      // Just save consent preferences and close
      external_data_collector.store_user_consent_data(form_data);
      onDataCollected?.(form_data as User_Consent_Data);
      set_is_visible(false);
    }
  };

  const handle_details_submit = () => {
    if (form_data.marketing_consent) {
      set_step('social');
    } else {
      // Save data and close
      external_data_collector.store_user_consent_data(form_data);
      onDataCollected?.(form_data as User_Consent_Data);
      set_is_visible(false);
    }
  };

  const handle_final_submit = () => {
    external_data_collector.store_user_consent_data(form_data);
    onDataCollected?.(form_data as User_Consent_Data);
    set_is_visible(false);
  };

  const handle_skip = () => {
    external_data_collector.store_user_consent_data({
      marketing_consent: false,
      analytics_consent: false,
      personalization_consent: false
    });
    set_is_visible(false);
  };

  if (!is_visible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
        
        {/* Step 1: Basic Consent */}
        {step === 'consent' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Help Us Improve Your Experience</h2>
            <p className="text-gray-600 mb-6">
              We'd like to collect some additional information to provide you with better insights and personalized features.
            </p>
            
            <div className="space-y-4 mb-6">
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={form_data.analytics_consent || false}
                  onChange={(e) => set_form_data(prev => ({ ...prev, analytics_consent: e.target.checked }))}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Analytics & Performance</div>
                  <div className="text-sm text-gray-600">
                    Help us understand how you use our platform to improve performance and features
                  </div>
                </div>
              </label>
              
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={form_data.personalization_consent || false}
                  onChange={(e) => set_form_data(prev => ({ ...prev, personalization_consent: e.target.checked }))}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Personalization</div>
                  <div className="text-sm text-gray-600">
                    Customize your experience based on your preferences and usage patterns
                  </div>
                </div>
              </label>
              
              <label className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  checked={form_data.marketing_consent || false}
                  onChange={(e) => set_form_data(prev => ({ ...prev, marketing_consent: e.target.checked }))}
                  className="mt-1"
                />
                <div>
                  <div className="font-medium">Marketing & Communication</div>
                  <div className="text-sm text-gray-600">
                    Receive relevant updates, tips, and insights about data analytics
                  </div>
                </div>
              </label>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handle_consent_submit}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Continue
              </button>
              <button
                onClick={handle_skip}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Skip
              </button>
            </div>
          </div>
        )}
        
        {/* Step 2: Company & Role Details */}
        {step === 'details' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Tell Us About Your Work</h2>
            <p className="text-gray-600 mb-6">
              This helps us provide more relevant insights and features for your use case.
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">Company Name (Optional)</label>
                <input
                  type="text"
                  value={form_data.company_name || ''}
                  onChange={(e) => set_form_data(prev => ({ ...prev, company_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="Your company name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Company Size</label>
                <select
                  value={form_data.company_size || ''}
                  onChange={(e) => set_form_data(prev => ({ ...prev, company_size: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select company size</option>
                  <option value="startup">Startup (Pre-revenue)</option>
                  <option value="1-10">1-10 employees</option>
                  <option value="11-50">11-50 employees</option>
                  <option value="51-200">51-200 employees</option>
                  <option value="201-1000">201-1000 employees</option>
                  <option value="1000+">1000+ employees</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Industry</label>
                <input
                  type="text"
                  value={form_data.industry || ''}
                  onChange={(e) => set_form_data(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Technology, Marketing, Finance"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Job Title</label>
                <input
                  type="text"
                  value={form_data.job_title || ''}
                  onChange={(e) => set_form_data(prev => ({ ...prev, job_title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="e.g., Data Analyst, Marketing Manager"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Primary Use Case</label>
                <textarea
                  value={form_data.use_case || ''}
                  onChange={(e) => set_form_data(prev => ({ ...prev, use_case: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="What do you plan to use our platform for?"
                  rows={3}
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handle_details_submit}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                {form_data.marketing_consent ? 'Continue' : 'Finish'}
              </button>
              <button
                onClick={() => set_step('consent')}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </div>
        )}
        
        {/* Step 3: Social Connections (Only if marketing consent) */}
        {step === 'social' && (
          <div>
            <h2 className="text-xl font-bold mb-4">Connect Your Professional Profiles</h2>
            <p className="text-gray-600 mb-6">
              Optional: Connect your professional profiles to get personalized industry insights.
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1">LinkedIn Profile (Optional)</label>
                <input
                  type="text"
                  value={form_data.linkedin_profile || ''}
                  onChange={(e) => set_form_data(prev => ({ ...prev, linkedin_profile: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="https://linkedin.com/in/yourname"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Twitter/X Handle (Optional)</label>
                <input
                  type="text"
                  value={form_data.twitter_handle || ''}
                  onChange={(e) => set_form_data(prev => ({ ...prev, twitter_handle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="@yourusername"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">GitHub Username (Optional)</label>
                <input
                  type="text"
                  value={form_data.github_username || ''}
                  onChange={(e) => set_form_data(prev => ({ ...prev, github_username: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-blue-500"
                  placeholder="yourusername"
                />
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handle_final_submit}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Complete Setup
              </button>
              <button
                onClick={() => set_step('details')}
                className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
              >
                Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Hook for collecting external data
 */
export function use_external_data() {
  const [external_data, set_external_data] = useState<any>(null);
  
  useEffect(() => {
    // Collect external data on component mount
    const data = external_data_collector.collect_all_external_data();
    set_external_data(data);
    
    console.log('[External Data Hook] All external data collected:', data);
  }, []);
  
  const request_user_consent = (callback?: (data: User_Consent_Data) => void) => {
    // This would trigger the consent modal
    return { callback };
  };
  
  return {
    external_data,
    request_user_consent,
    store_consent_data: external_data_collector.store_user_consent_data.bind(external_data_collector),
    get_consent_data: external_data_collector.get_user_consent_data.bind(external_data_collector)
  };
}