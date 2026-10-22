import { User, UserRoles } from '../models/User.js';
import { hashPassword } from '../services/authService.js';

export const ALLOWED_ADMINS = [
  {
    name: 'Bala (Admin)',
    email: 'bala@gmail.com',
  },
  {
    name: 'Guru (Admin)',
    email: 'guru@gmail.com',
  },
  {
    name: 'Abi (Admin)',
    email: 'abi@gmail.com',
  },
  {
    name: 'Dhandapani (Admin)',
    email: 'dhandapani@gmail.com',
  },
];

export const ADMIN_DEFAULT_PASSWORD = '12345';

/**
 * Seed or update the 4 authorized administrative accounts
 */
export const seedAdminUsers = async () => {
  try {
    const hashedPassword = await hashPassword(ADMIN_DEFAULT_PASSWORD);

    for (const admin of ALLOWED_ADMINS) {
      const normalizedEmail = admin.email.toLowerCase().trim();
      let user = await User.findOne({ email: normalizedEmail });

      if (user) {
        let needsSave = false;
        if (user.role !== UserRoles.SUPER_ADMIN) {
          user.role = UserRoles.SUPER_ADMIN;
          needsSave = true;
        }
        // Always ensure password matches the designated admin password
        user.password = hashedPassword;
        needsSave = true;

        if (needsSave) {
          await user.save();
          console.log(`🔐 Admin account verified & updated: ${normalizedEmail}`);
        }
      } else {
        await User.create({
          name: admin.name,
          email: normalizedEmail,
          password: hashedPassword,
          role: UserRoles.SUPER_ADMIN,
        });
        console.log(`✨ Created new admin account: ${normalizedEmail}`);
      }
    }
    console.log('✅ All 4 admin accounts initialized successfully.');
  } catch (error) {
    console.error('❌ Failed to seed admin accounts:', error.message);
  }
};

export default seedAdminUsers;
