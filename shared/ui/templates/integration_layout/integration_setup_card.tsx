'use client';

/**
 * Generic Integration Setup Card
 * Purpose: Reusable component for integration setup forms
 * Used by: Telegram, Messenger, Instagram integrations
 *
 * Features:
 * - Setup instructions with numbered steps
 * - Credential input form
 * - Connect/Validate buttons
 * - Error display
 * - Loading states
 */

import { type ReactNode } from 'react';
import {
  Loader2,
  AlertCircle,
  Info,
  ExternalLink,
  Key,
  Shield,
} from 'lucide-react';
import {
  Alert,
  AlertDescription,
  Button,
  Input,
  Label,
  Tag,
  Typography,
} from '@shared/ui';
import { ProjectCard } from '@shared/ui/molecules/project-card';

export interface IntegrationSetupStep {
  /** Step number (1, 2, 3, etc.) */
  number: number;
  /** Step title */
  title: string;
  /** Step description (can include links) */
  description: ReactNode;
}

export interface IntegrationSetupField {
  /** Unique field key */
  key: string;
  /** Field label */
  label: string;
  /** Current value */
  value: string;
  /** Update handler */
  onChange: (value: string) => void;
  /** Field type */
  type?: 'text' | 'password' | 'email';
  /** Placeholder */
  placeholder?: string;
  /** Helper text */
  helperText?: string;
  /** Required field */
  required?: boolean;
}

export interface IntegrationSetupCardProps {
  /** Platform name (e.g., 'Telegram', 'Instagram') */
  platformName: string;
  /** Platform icon */
  platformIcon: ReactNode;
  /** Icon background color */
  iconBgColor: string;
  /** Primary brand color for buttons */
  brandColor: string;
  /** Hover state for brand color */
  brandColorHover: string;
  /** Setup instructions (array of steps) */
  setupSteps: IntegrationSetupStep[];
  /** Form fields */
  formFields: IntegrationSetupField[];
  /** Connect handler */
  onConnect: () => void;
  /** Optional validate handler */
  onValidate?: () => void;
  /** Whether connection is in progress */
  isConnecting: boolean;
  /** Error message to display */
  errorMessage?: string;
  /** Custom labels/translations */
  labels?: {
    instructionsTitle?: string;
    connectFormTitle?: string;
    connectButton?: string;
    connecting?: string;
    validateButton?: string;
    validating?: string;
  };
}

/**
 * Generic integration setup card component.
 * Displays setup instructions and connection form.
 *
 * @param props IntegrationSetupCardProps
 * @returns React component
 */
export function IntegrationSetupCard(props: IntegrationSetupCardProps) {
  const {
    platformName,
    platformIcon,
    iconBgColor,
    brandColor,
    brandColorHover,
    setupSteps,
    formFields,
    onConnect,
    onValidate,
    isConnecting,
    errorMessage,
    labels = {},
  } = props;

  const defaultLabels = {
    instructionsTitle: 'Setup Instructions',
    connectFormTitle: `Connect ${platformName}`,
    connectButton: `Connect ${platformName}`,
    connecting: 'Connecting...',
    validateButton: 'Validate',
    validating: 'Validating...',
  };

  const t = { ...defaultLabels, ...labels };

  // Check if all required fields are filled
  const requiredFields = formFields.filter((f) => f.required !== false);
  const allRequiredFilled = requiredFields.every((f) => f.value.trim().length > 0);

  return (
    <div className="space-y-6">
      {/* Setup Instructions Card */}
      <ProjectCard
        title={t.instructionsTitle}
        description={`Follow these steps to connect your ${platformName} integration`}
        icon={<Info className="h-6 w-6 text-blue-600" />}
        iconBgColor="bg-blue-50"
        statusBadge={<Tag variant="happy-orange">Guide</Tag>}
        footerInfo={
          <div className="space-y-4">
            {setupSteps.map((step) => (
              <div key={step.number} className="flex items-start gap-3">
                <div
                  className={`w-6 h-6 ${brandColor.replace('bg-', 'bg-')} rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold`}
                >
                  {step.number}
                </div>
                <div className="flex-1">
                  <Typography variant="body-s" className="font-semibold">
                    {step.title}
                  </Typography>
                  <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                    {step.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      />

      {/* Connection Form Card */}
      <ProjectCard
        title={t.connectFormTitle}
        description="Enter your credentials to connect"
        icon={<Key className="h-6 w-6 text-gray-700" />}
        iconBgColor="bg-gray-50"
        statusBadge={<Tag variant="gray">Not Connected</Tag>}
        footerInfo={
          <div className="space-y-4">
            {/* Form Fields */}
            <div className="space-y-4">
              {formFields.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={field.key}>
                    {field.label} {field.required !== false && <span className="text-red-500">*</span>}
                  </Label>
                  <Input
                    id={field.key}
                    type={field.type || 'text'}
                    placeholder={field.placeholder}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    disabled={isConnecting}
                    className="w-full"
                  />
                  {field.helperText && (
                    <Typography variant="body-s" className="text-xs text-gray-500">
                      {field.helperText}
                    </Typography>
                  )}
                </div>
              ))}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800 dark:text-red-200 text-xs">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={onConnect}
                disabled={!allRequiredFilled || isConnecting}
                className={`flex-1 ${brandColor} ${brandColorHover}`}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t.connecting}
                  </>
                ) : (
                  <>
                    {platformIcon}
                    <span className="ml-2">{t.connectButton}</span>
                  </>
                )}
              </Button>

              {onValidate && (
                <Button
                  variant="outline"
                  onClick={onValidate}
                  disabled={!allRequiredFilled || isConnecting}
                >
                  <Shield className="h-4 w-4 mr-2" />
                  {t.validateButton}
                </Button>
              )}
            </div>
          </div>
        }
      />
    </div>
  );
}
