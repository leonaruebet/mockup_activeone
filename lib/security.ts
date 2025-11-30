/**
 * Next.js Security Integration
 * Purpose: Security utilities for Next.js API routes and middleware
 */

import { NextRequest, NextResponse } from 'next/server';
import { create_logger } from '@shared/utils/logger';
import {
  create_rate_limiter,
  get_client_identifier,
  RATE_LIMIT_CONFIGS,
  create_error_handler,
  apply_nextjs_security_headers,
  validate_object,
  AUTH_SCHEMAS,
  create_csrf_middleware,
  extract_csrf_token,
  generate_csrf_token,
  type ValidationSchema
} from '@shared/security';

/**
 * NextSecurityOptions - Configuration for Next.js security middleware
 * Purpose: Configure security options for API routes
 */
export type NextSecurityOptions = {
  rate_limit?: keyof typeof RATE_LIMIT_CONFIGS | false;
  csrf_protection?: boolean;
  validation_schema?: ValidationSchema;
  require_auth?: boolean;
  security_headers?: boolean;
};

/**
 * create_secure_api_handler
 * Purpose: Create secured API handler with all security middleware
 * @param handler - Original API handler function
 * @param options - Security configuration options
 * @returns Secured API handler
 */
export function create_secure_api_handler<T = any>(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  options: NextSecurityOptions = {}
) {
  const log = create_logger();
  const error_handler = create_error_handler(log);

  // Initialize middleware components
  const rate_limiter = options.rate_limit !== false
    ? create_rate_limiter(RATE_LIMIT_CONFIGS[options.rate_limit || 'general_api'], log)
    : null;

  const csrf_middleware = options.csrf_protection
    ? create_csrf_middleware(log)
    : null;

  return async function secured_handler(req: NextRequest, context?: any): Promise<NextResponse> {
    const request_id = Math.random().toString(36).substring(2) + Date.now().toString(36);

    log.info('secure_api_handler_enter', {
      method: req.method,
      url: req.url,
      request_id,
      options
    });

    try {
      // Apply rate limiting
      if (rate_limiter) {
        const client_id = get_client_identifier({ headers: req.headers });
        const rate_limit_result = rate_limiter(client_id);

        if (!rate_limit_result.allowed) {
          log.warn('rate_limit_exceeded', {
            client_id,
            blocked_until: rate_limit_result.blocked_until,
            request_id
          });

          const response = NextResponse.json(
            {
              error: 'Too many requests. Please try again later.',
              retry_after: rate_limit_result.blocked_until?.toISOString(),
              retry_after_seconds: rate_limit_result.blocked_until
                ? Math.ceil((rate_limit_result.blocked_until.getTime() - Date.now()) / 1000)
                : undefined
            },
            { status: 429 }
          );

          // Add Retry-After header as per HTTP spec
          if (rate_limit_result.blocked_until) {
            const retryAfterSeconds = Math.ceil((rate_limit_result.blocked_until.getTime() - Date.now()) / 1000);
            response.headers.set('Retry-After', retryAfterSeconds.toString());
          }

          if (options.security_headers !== false) {
            apply_nextjs_security_headers(response);
          }

          return response;
        }

        log.info('rate_limit_passed', {
          client_id,
          remaining: rate_limit_result.remaining,
          request_id
        });
      }

      // Apply CSRF protection for non-safe methods
      if (csrf_middleware && !['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        const session_id = req.cookies.get('session_id')?.value;

        // Read body once and store it for later use
        const body = await get_request_body(req);
        (req as any)._parsed_body = body;

        const csrf_result = csrf_middleware({
          method: req.method,
          headers: req.headers,
          body: body,
          session_id
        });

        if (!csrf_result.valid) {
          log.warn('csrf_validation_failed', {
            error: csrf_result.error,
            request_id
          });

          const response = NextResponse.json(
            { error: csrf_result.error || 'Invalid CSRF token' },
            { status: 403 }
          );

          if (options.security_headers !== false) {
            apply_nextjs_security_headers(response);
          }

          return response;
        }

        log.info('csrf_validation_passed', { request_id });
      }

      // Apply input validation
      if (options.validation_schema && req.method !== 'GET') {
        // Use the already-parsed body from CSRF validation, or parse it now
        const body = (req as any)._parsed_body || await get_request_body(req);

        // Body parsed successfully for validation

        // Store the original body for later use
        (req as any)._original_body = body;

        const validation_result = validate_object(body, options.validation_schema, log);

        if (!validation_result.valid) {
          log.warn('input_validation_failed', {
            error: validation_result.error,
            request_id
          });

          const response = NextResponse.json(
            { error: 'Invalid input provided' },
            { status: 400 }
          );

          if (options.security_headers !== false) {
            apply_nextjs_security_headers(response);
          }

          return response;
        }

        // Replace request body with sanitized version
        if (validation_result.sanitized) {
          (req as any)._sanitized_body = validation_result.sanitized;
        } else {
          // If no sanitization occurred, use the original body
          (req as any)._sanitized_body = body;
        }

        log.info('input_validation_passed', { request_id });
      }

      // Call original handler
      const response = await handler(req, context);

      // Apply security headers to response
      if (options.security_headers !== false) {
        apply_nextjs_security_headers(response);
      }

      log.info('secure_api_handler_success', {
        status: response.status,
        request_id
      });

      return response;

    } catch (error) {
      const forwarded_for = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
      const real_ip = req.headers.get('x-real-ip');
      const resolved_ip = forwarded_for || real_ip || 'unknown';

      const { response, status_code } = error_handler(error, {
        request_id,
        endpoint: req.url,
        method: req.method,
        ip_address: resolved_ip
      });

      const error_response = NextResponse.json(response, { status: status_code });

      if (options.security_headers !== false) {
        apply_nextjs_security_headers(error_response);
      }

      return error_response;
    }
  };
}

/**
 * get_request_body
 * Purpose: Safely extract request body for validation
 * @param req - Next.js request object
 * @returns Request body as object
 */
async function get_request_body(req: NextRequest): Promise<Record<string, unknown>> {
  try {
    const contentType = req.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      return await req.json();
    }

    if (contentType.includes('application/x-www-form-urlencoded')) {
      const formData = await req.formData();
      const body: Record<string, unknown> = {};

      for (const [key, value] of formData.entries()) {
        body[key] = value;
      }

      return body;
    }

    return {};
  } catch {
    return {};
  }
}

/**
 * get_sanitized_body
 * Purpose: Get sanitized request body from secured handler
 * @param req - Next.js request object
 * @returns Sanitized body or original body
 */
export function get_sanitized_body<T = Record<string, unknown>>(req: NextRequest): T {
  return (req as any)._sanitized_body || {};
}

/**
 * create_csrf_token_response
 * Purpose: Create response with CSRF token for forms
 * @param session_id - Optional session ID for token binding
 * @returns Response with CSRF token
 */
export function create_csrf_token_response(session_id?: string): NextResponse {
  const log = create_logger();
  const { token, expires_at } = generate_csrf_token(session_id, log);

  const response = NextResponse.json({
    csrf_token: token,
    expires_at: expires_at.toISOString()
  });

  apply_nextjs_security_headers(response);
  return response;
}

/**
 * Preconfigured security options for common use cases
 * Purpose: Ready-to-use security configurations
 */
export const SECURITY_PRESETS = {
  auth_login: {
    rate_limit: 'auth_login' as const,
    csrf_protection: true,
    validation_schema: AUTH_SCHEMAS.login,
    security_headers: true,
  },

  auth_register: {
    rate_limit: 'auth_register' as const,
    csrf_protection: true,
    validation_schema: AUTH_SCHEMAS.register,
    security_headers: true,
  },

  password_reset: {
    rate_limit: 'password_reset' as const,
    csrf_protection: true,
    validation_schema: AUTH_SCHEMAS.forgot_password,
    security_headers: true,
  },

  password_reset_confirm: {
    rate_limit: 'password_reset' as const,
    csrf_protection: false, // Disabled: password reset uses secure token-based authentication
    validation_schema: AUTH_SCHEMAS.reset_password,
    security_headers: true,
  },

  password_reset_resend: {
    rate_limit: 'password_reset_resend' as const,
    csrf_protection: true,
    validation_schema: AUTH_SCHEMAS.forgot_password,
    security_headers: true,
  },

  change_password: {
    rate_limit: 'password_reset' as const,
    csrf_protection: true,
    validation_schema: AUTH_SCHEMAS.change_password,
    security_headers: true,
  },

  protected_api: {
    rate_limit: 'general_api' as const,
    csrf_protection: true,
    require_auth: true,
    security_headers: true,
  },

  public_api: {
    rate_limit: 'general_api' as const,
    csrf_protection: false,
    security_headers: true,
  },
} as const;

/**
 * apply_security_to_route
 * Purpose: Quick security application for API routes
 * @param handler - API route handler
 * @param preset - Security preset name
 * @returns Secured API route
 */
export function apply_security_to_route(
  handler: (req: NextRequest, context?: any) => Promise<NextResponse>,
  preset: keyof typeof SECURITY_PRESETS
) {
  return create_secure_api_handler(handler, SECURITY_PRESETS[preset]);
}
