import type { Core } from '@strapi/strapi';

export default {
  register() {},

  /**
   * Grant public read access to the portfolio content API so the
   * frontend can list team members and fetch individual portfolios
   * without authentication. Admin writes happen through the admin panel.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    const publicRole = await strapi.db
      .query('plugin::users-permissions.role')
      .findOne({ where: { type: 'public' } });

    if (!publicRole) {
      strapi.log.warn('No public role found; skipping public API permissions.');
      return;
    }

    const actions = [
      'api::portfolio.portfolio.find',
      'api::portfolio.portfolio.findOne',
      // Public form submissions create entries via the API.
      'api::contact-submission.contact-submission.create',
      // Public read access to the country profiles list and detail pages.
      'api::country.country.find',
      'api::country.country.findOne',
    ];

    const permissionUid = 'plugin::users-permissions.permission';

    for (const action of actions) {
      const existing = await strapi.db.query(permissionUid).findOne({
        where: { action, role: publicRole.id },
      });
      if (!existing) {
        await strapi.db.query(permissionUid).create({
          data: { action, role: publicRole.id },
        });
        strapi.log.info(`Granted public permission: ${action}`);
      }
    }
  },
};