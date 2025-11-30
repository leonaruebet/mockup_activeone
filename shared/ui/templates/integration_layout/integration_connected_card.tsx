'use client';

/**
 * Generic Integration Connected State Card
 * Purpose: Reusable component for displaying connection status across all integrations
 * Used by: LINE, Telegram, Messenger, Instagram integrations
 *
 * Features:
 * - Connection status display
 * - Edit/Disconnect actions
 * - Credential management with show/hide
 * - Webhook URL display with copy functionality
 * - Test connection button
 */

import { useState, type ReactNode } from 'react';
import {
  CheckCircle,
  Lock,
  Edit,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  Save,
  X,
  Key,
  Webhook,
  ExternalLink,
  AlertCircle,
  Zap,
  Loader2,
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

export interface IntegrationCredentialField {
  /** Unique key for the field */
  key: string;
  /** Display label for the field */
  label: string;
  /** Current value */
  value: string;
  /** Update handler */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether this field is a secret (masked by default) */
  isSecret?: boolean;
}

export interface IntegrationConnectedCardProps {
  /** Platform name (e.g., 'LINE', 'Telegram', 'Instagram') */
  platformName: string;
  /** Platform icon */
  platformIcon: ReactNode;
  /** Icon background color (e.g., 'bg-green-50') */
  iconBgColor: string;
  /** Primary brand color for buttons (e.g., 'bg-green-600') */
  brandColor: string;
  /** Hover state for brand color (e.g., 'hover:bg-green-700') */
  brandColorHover: string;
  /** Connected timestamp */
  connectedAt: string | Date;
  /** Array of credential fields to display */
  credentialFields: IntegrationCredentialField[];
  /** Webhook URL (optional) */
  webhookUrl?: string;
  /** External console URL (optional, e.g., LINE Developer Console) */
  consoleUrl?: string;
  /** Console button label */
  consoleButtonLabel?: string;
  /** Whether currently in edit mode */
  isEditMode: boolean;
  /** Edit mode toggle handler */
  onToggleEditMode: (editMode: boolean) => void;
  /** Save handler */
  onSave: () => void;
  /** Disconnect handler */
  onDisconnect: () => void;
  /** Test webhook handler (optional) */
  onTestWebhook?: () => void;
  /** Whether save/disconnect is in progress */
  isLoading: boolean;
  /** Whether disconnect is in progress */
  isDisconnecting: boolean;
  /** Whether webhook test is in progress */
  isTestingWebhook?: boolean;
  /** Webhook test result */
  webhookTestResult?: {
    success: boolean;
    message: string;
  } | null;
  /** Error message to display */
  errorMessage?: string;
  /** Custom labels/translations */
  labels?: {
    connectedTitle?: string;
    connectedDescription?: string;
    connectedBadge?: string;
    connectedSince?: string;
    editButton?: string;
    disconnectButton?: string;
    disconnecting?: string;
    credentialsTitle?: string;
    credentialsDescription?: string;
    credentialsEditDescription?: string;
    editModeBadge?: string;
    lockedBadge?: string;
    tokenMasked?: string;
    hideToken?: string;
    showToken?: string;
    saveButton?: string;
    saving?: string;
    cancelButton?: string;
    webhookTitle?: string;
    webhookDescription?: string;
    webhookBadge?: string;
    webhookUrlLabel?: string;
    webhookCopied?: string;
    testConnectionButton?: string;
    testing?: string;
    testSuccessTitle?: string;
    testFailureTitle?: string;
    openConsoleButton?: string;
  };
}

/**
 * Generic integration connected state card component.
 * Displays connection status, credentials (with edit mode), webhook URL, and test functionality.
 *
 * @param props IntegrationConnectedCardProps
 * @returns React component
 */
export function IntegrationConnectedCard(props: IntegrationConnectedCardProps) {
  const {
    platformName,
    platformIcon,
    iconBgColor,
    brandColor,
    brandColorHover,
    connectedAt,
    credentialFields,
    webhookUrl,
    consoleUrl,
    consoleButtonLabel,
    isEditMode,
    onToggleEditMode,
    onSave,
    onDisconnect,
    onTestWebhook,
    isLoading,
    isDisconnecting,
    isTestingWebhook = false,
    webhookTestResult,
    errorMessage,
    labels = {},
  } = props;

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [visibleFields, setVisibleFields] = useState<Record<string, boolean>>({});

  // Default labels
  const defaultLabels = {
    connectedTitle: `${platformName} Connected`,
    connectedDescription: `Your ${platformName} integration is active and ready to receive messages.`,
    connectedBadge: 'Connected',
    connectedSince: 'Connected since:',
    editButton: 'Edit',
    disconnectButton: 'Disconnect',
    disconnecting: 'Disconnecting...',
    credentialsTitle: 'Credentials',
    credentialsDescription: 'Your credentials are securely stored.',
    credentialsEditDescription: 'Update your credentials below.',
    editModeBadge: 'Editing',
    lockedBadge: 'Locked',
    tokenMasked: 'For security, only first 20 characters are shown.',
    hideToken: 'Hide',
    showToken: 'Show',
    saveButton: 'Save Changes',
    saving: 'Saving...',
    cancelButton: 'Cancel',
    webhookTitle: 'Webhook Configuration',
    webhookDescription: 'Use this webhook URL to receive events.',
    webhookBadge: 'Active',
    webhookUrlLabel: 'Webhook URL',
    webhookCopied: 'Copied to clipboard!',
    testConnectionButton: 'Test Connection',
    testing: 'Testing...',
    testSuccessTitle: 'Success!',
    testFailureTitle: 'Failed',
    openConsoleButton: consoleButtonLabel || `Open ${platformName} Console`,
  };

  const t = { ...defaultLabels, ...labels };

  const connectedAtFormatted =
    typeof connectedAt === 'string'
      ? new Date(connectedAt).toLocaleString()
      : connectedAt.toLocaleString();

  /**
   * Copy text to clipboard and show feedback
   */
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  /**
   * Toggle field visibility (show/hide password)
   */
  const toggleFieldVisibility = (fieldKey: string) => {
    setVisibleFields((prev) => ({ ...prev, [fieldKey]: !prev[fieldKey] }));
  };

  /**
   * Handle save in edit mode
   */
  const handleSave = () => {
    onSave();
    onToggleEditMode(false);
  };

  /**
   * Cancel edit mode
   */
  const handleCancelEdit = () => {
    onToggleEditMode(false);
  };

  return (
    <div className="space-y-6">
      {/* Success Status Card */}
      <ProjectCard
        title={t.connectedTitle}
        description={t.connectedDescription}
        icon={platformIcon}
        iconBgColor={iconBgColor}
        statusBadge={<Tag variant="stem-green">{t.connectedBadge}</Tag>}
        footerInfo={
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 flex-1">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-green-800 dark:text-green-200 text-xs">
                  <strong>{t.connectedSince}</strong> {connectedAtFormatted}
                </AlertDescription>
              </Alert>

              {!isEditMode && (
                <div className="flex gap-2 flex-shrink-0">
                  <Button size="sm" variant="outline" onClick={() => onToggleEditMode(true)}>
                    <Edit className="h-4 w-4 mr-2" />
                    {t.editButton}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onDisconnect}
                    disabled={isDisconnecting}
                    className="text-red-600 hover:bg-red-50 border-red-200"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {isDisconnecting ? t.disconnecting : t.disconnectButton}
                  </Button>
                </div>
              )}
            </div>
          </div>
        }
      />

      {/* Credentials Card */}
      <ProjectCard
        title={t.credentialsTitle}
        description={isEditMode ? t.credentialsEditDescription : t.credentialsDescription}
        icon={<Key className="h-6 w-6 text-gray-700" />}
        iconBgColor="bg-gray-50"
        statusBadge={
          <Tag variant={isEditMode ? 'stem-green' : 'gray'}>
            {isEditMode ? t.editModeBadge : t.lockedBadge}
          </Tag>
        }
        footerInfo={
          <div className="space-y-4">
            {/* Error Message */}
            {errorMessage && (
              <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-red-800 dark:text-red-200 text-xs">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}

            {/* Credentials Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {credentialFields.map((field) => {
                const isVisible = visibleFields[field.key];
                return (
                  <div key={field.key} className="space-y-2">
                    <Label className="flex items-center gap-2">
                      {field.label}
                      {!isEditMode && field.isSecret && <Lock className="h-3 w-3 text-gray-400" />}
                    </Label>
                    <div className="relative">
                      <Input
                        type={field.isSecret && !isVisible ? 'password' : 'text'}
                        value={field.value}
                        onChange={(e) => field.onChange(e.target.value)}
                        disabled={!isEditMode}
                        placeholder={field.placeholder}
                        className="w-full font-mono text-sm pr-10"
                      />
                      {field.isSecret && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                          <button
                            type="button"
                            onClick={() => toggleFieldVisibility(field.key)}
                            className="p-1.5 hover:bg-gray-100 rounded"
                            title={isVisible ? t.hideToken : t.showToken}
                          >
                            {isVisible ? (
                              <EyeOff className="h-4 w-4 text-gray-500" />
                            ) : (
                              <Eye className="h-4 w-4 text-gray-500" />
                            )}
                          </button>
                        </div>
                      )}
                    </div>
                    {!isEditMode && field.isSecret && (
                      <Typography variant="body-s" className="text-xs text-gray-500">
                        {t.tokenMasked}
                      </Typography>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Edit Mode Actions */}
            {isEditMode && (
              <div className="flex gap-2 pt-2">
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isLoading}
                  className={`flex-1 ${brandColor} ${brandColorHover}`}
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? t.saving : t.saveButton}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCancelEdit}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <X className="h-4 w-4 mr-2" />
                  {t.cancelButton}
                </Button>
              </div>
            )}
          </div>
        }
      />

      {/* Webhook Configuration Card (Optional) */}
      {webhookUrl && (
        <ProjectCard
          title={t.webhookTitle}
          description={t.webhookDescription}
          icon={<Webhook className="h-6 w-6 text-gray-700" />}
          iconBgColor="bg-gray-50"
          statusBadge={<Tag variant="stem-green">{t.webhookBadge}</Tag>}
          footerInfo={
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>{t.webhookUrlLabel}</Label>
                <div className="relative">
                  <Input
                    type="text"
                    value={webhookUrl}
                    readOnly
                    className="w-full font-mono text-xs pr-10 bg-gray-50"
                  />
                  <button
                    type="button"
                    onClick={() => copyToClipboard(webhookUrl, 'webhook')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded"
                  >
                    <Copy
                      className={`h-4 w-4 ${
                        copiedField === 'webhook' ? 'text-green-500' : 'text-gray-500'
                      }`}
                    />
                  </button>
                </div>
                {copiedField === 'webhook' && (
                  <Typography variant="body-s" className="text-xs text-green-600">
                    {t.webhookCopied}
                  </Typography>
                )}
              </div>

              {/* Test Webhook Results */}
              {webhookTestResult && (
                <Alert
                  className={
                    webhookTestResult.success
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                  }
                >
                  {webhookTestResult.success ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription
                    className={
                      webhookTestResult.success
                        ? 'text-green-800 dark:text-green-200 text-xs'
                        : 'text-red-800 dark:text-red-200 text-xs'
                    }
                  >
                    <strong>
                      {webhookTestResult.success ? t.testSuccessTitle : t.testFailureTitle}
                    </strong>{' '}
                    {webhookTestResult.message}
                  </AlertDescription>
                </Alert>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2">
                {onTestWebhook && (
                  <Button
                    size="sm"
                    className={`flex-1 ${brandColor} ${brandColorHover}`}
                    onClick={onTestWebhook}
                    disabled={isTestingWebhook}
                  >
                    {isTestingWebhook ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        {t.testing}
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        {t.testConnectionButton}
                      </>
                    )}
                  </Button>
                )}

                {consoleUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(consoleUrl, '_blank')}
                    className="flex-1"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {t.openConsoleButton}
                  </Button>
                )}
              </div>
            </div>
          }
        />
      )}
    </div>
  );
}
