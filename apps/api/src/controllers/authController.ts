import { Request, Response } from 'express';
import { createAndDispatchOtp, verifyAndInvalidateOtp } from '../services/otpService';
import {
  getOrganizationByPhone,
  getOrganizationByEmail,
  createOrganization,
} from '../db/sqlite';

// Superadmin Master Phone Numbers
const SUPERADMIN_PHONES = ['9013793020', '919013793020'];

/**
 * Controller for handling authentication, MHC WhatsApp Gateway OTP, Superadmin, and Multi-Tenant Onboarding
 */
export class AuthController {
  /**
   * POST /saypulse/v1/auth/send-otp
   */
  static async sendOtp(req: Request, res: Response): Promise<void> {
    try {
      const { method = 'whatsapp', phone, email, target } = req.body;
      const destination = target || (method === 'whatsapp' ? phone : email);

      if (!destination) {
        res.status(400).json({
          success: false,
          error: `Missing required ${method === 'whatsapp' ? 'mobile number (e.g. 9013793020)' : 'email address'}`,
        });
        return;
      }

      const result = await createAndDispatchOtp(destination, method);

      res.status(200).json(result);
    } catch (err: any) {
      console.error('[AuthController.sendOtp Error]:', err.message);
      res.status(400).json({
        success: false,
        error: err.message || 'Failed to dispatch verification code',
      });
    }
  }

  /**
   * POST /saypulse/v1/auth/verify-otp
   */
  static async verifyOtp(req: Request, res: Response): Promise<void> {
    try {
      const { target, phone, email, otp } = req.body;
      const destination = target || phone || email;

      if (!destination || !otp) {
        res.status(400).json({
          success: false,
          error: 'Both recipient identifier and 6-digit OTP code are required',
        });
        return;
      }

      const verification = verifyAndInvalidateOtp(destination, String(otp));

      if (!verification.valid) {
        res.status(401).json({
          success: false,
          error: verification.error || 'Invalid or expired OTP code',
        });
        return;
      }

      const cleanDigits = destination.replace(/[^0-9]/g, '');
      const isSuperAdmin = SUPERADMIN_PHONES.some((p) => cleanDigits.endsWith(p));

      // 1. Superadmin Master Authentication (Vivek: 9013793020)
      if (isSuperAdmin) {
        const sessionToken = `sp_jwt_superadmin_${Date.now()}`;
        res.status(200).json({
          success: true,
          isSuperAdmin: true,
          isNewUser: false,
          message: 'Superadmin authentication successful',
          token: sessionToken,
          redirectUrl: '/admin/master',
          user: {
            id: 'user_superadmin_vivek',
            name: 'Vivek Mandal',
            role: 'superadmin',
            phone: '919013793020',
            email: 'vivek@saypulse.ai',
            organization: {
              id: 'org_master_platform',
              name: 'SayPulse Platform (Superadmin)',
              slug: 'master',
              plan: 'platform_owner',
            },
          },
        });
        return;
      }

      // 2. Regular Tenant Lookup
      const isEmail = destination.includes('@');
      const existingOrg = isEmail
        ? getOrganizationByEmail(destination)
        : getOrganizationByPhone(destination);

      const sessionToken = `sp_jwt_${Date.now()}_${Buffer.from(destination).toString('base64').substring(0, 16)}`;

      if (existingOrg) {
        res.status(200).json({
          success: true,
          isSuperAdmin: false,
          isNewUser: false,
          message: 'Authentication successful',
          token: sessionToken,
          redirectUrl: `/admin/${existingOrg.slug}`,
          user: {
            id: existingOrg.user?.id || 'user_tenant_owner',
            name: existingOrg.user?.full_name || 'Workspace Owner',
            role: existingOrg.user?.role || 'owner',
            phone: existingOrg.user?.phone || destination,
            email: existingOrg.user?.email || 'user@company.com',
            organization: {
              id: existingOrg.id,
              name: existingOrg.name,
              slug: existingOrg.slug,
              plan: existingOrg.plan,
            },
          },
        });
        return;
      }

      // 3. New User Registration Required
      res.status(200).json({
        success: true,
        isSuperAdmin: false,
        isNewUser: true,
        message: 'OTP verified. Please complete workspace setup.',
        token: sessionToken,
        phone: !isEmail ? destination : undefined,
        email: isEmail ? destination : undefined,
      });
    } catch (err: any) {
      console.error('[AuthController.verifyOtp Error]:', err.message);
      res.status(500).json({
        success: false,
        error: 'Internal server error during verification',
      });
    }
  }

  /**
   * POST /saypulse/v1/auth/register-org
   * Onboarding endpoint for new users after OTP verification
   */
  static async registerOrg(req: Request, res: Response): Promise<void> {
    try {
      const { companyName, websiteUrl, phone, email, ownerName } = req.body;

      if (!companyName || companyName.trim().length < 2) {
        res.status(400).json({ success: false, error: 'Please enter a valid company or product name' });
        return;
      }

      if (!phone && !email) {
        res.status(400).json({ success: false, error: 'Phone number or email is required' });
        return;
      }

      const org = createOrganization({
        name: companyName.trim(),
        websiteUrl: websiteUrl ? websiteUrl.trim() : undefined,
        ownerName: ownerName ? ownerName.trim() : companyName.trim(),
        ownerPhone: phone,
        ownerEmail: email,
        plan: 'pro',
      });

      const sessionToken = `sp_jwt_${Date.now()}_${Buffer.from(org.id).toString('base64').substring(0, 16)}`;

      res.status(201).json({
        success: true,
        message: 'Workspace created successfully',
        token: sessionToken,
        redirectUrl: `/admin/${org.slug}`,
        organization: {
          id: org.id,
          name: org.name,
          slug: org.slug,
          apiKey: org.apiKey,
        },
        user: org.user,
      });
    } catch (err: any) {
      console.error('[AuthController.registerOrg Error]:', err.message);
      res.status(500).json({
        success: false,
        error: err.message || 'Failed to create workspace',
      });
    }
  }

  /**
   * GET /saypulse/v1/auth/session
   */
  static getSession(_req: Request, res: Response): void {
    res.status(200).json({
      authenticated: true,
      user: {
        id: 'user_superadmin_vivek',
        name: 'Vivek Mandal',
        role: 'superadmin',
        phone: '919013793020',
        email: 'vivek@saypulse.ai',
        organization: {
          id: 'org_master_platform',
          name: 'SayPulse Platform (Superadmin)',
          slug: 'master',
          plan: 'platform_owner',
        },
      },
    });
  }
}
