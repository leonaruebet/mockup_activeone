/**
 * Get User Default Redirect
 * Determines where to redirect user after login based on their projects
 */

import { create_logger } from '@shared/utils/logger';

const logger = create_logger({ request_id: 'get_user_default_redirect' });

/**
 * Get redirect URL for user after login
 * If user has projects: redirect to first project
 * If no projects: redirect to overview (which will auto-create project)
 *
 * @param userId - User ID
 * @param locale - User's locale
 * @returns redirect URL
 */
export async function get_user_default_redirect(
  userId: string,
  locale: string
): Promise<string> {
  try {
    logger.info('[get_user_default_redirect] Getting user redirect', {
      userId,
      locale,
      timestamp: new Date().toISOString()
    });

    // Import here to avoid circular dependencies
    const { list_projects } = await import('@shared/db/repositories/project/project_repo');
    const { to_object_id } = await import('@shared/db/client');

    // Get user's projects
    const projects = await list_projects({ user_id: to_object_id(userId) });

    if (projects && projects.length > 0) {
      const firstProjectId = projects[0]._id.toString();
      logger.info('[get_user_default_redirect] Redirecting to first project', {
        userId,
        projectId: firstProjectId,
        projectCount: projects.length
      });
      return `/${locale}/project/${firstProjectId}/overview`;
    }

    // No projects - redirect to overview which will auto-create
    logger.info('[get_user_default_redirect] No projects, redirecting to overview for auto-creation', {
      userId
    });
    return `/${locale}/overview`;
  } catch (error) {
    logger.error('[get_user_default_redirect] Error getting redirect', {
      error: error instanceof Error ? error.message : String(error),
      userId
    });
    // Fallback to overview
    return `/${locale}/overview`;
  }
}
