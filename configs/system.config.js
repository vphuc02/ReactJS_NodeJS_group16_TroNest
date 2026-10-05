require('dotenv').config();

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET || 'tronest_secret_key_default',
  PORT: process.env.PORT || 3000,
  ROLES: {
    ADMIN: 'ADMIN',
    LANDLORD: 'LANDLORD',
    CUSTOMER: 'CUSTOMER'
  },
  USER_STATUS: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    ACTIVE: 'ACTIVE',
    INACTIVE: 'INACTIVE'
  },
  ROOM_STATUS: {
    DRAFT: 'DRAFT',
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED'
  }
};
