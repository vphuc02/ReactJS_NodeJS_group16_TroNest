require('dotenv').config();

if (!process.env.JWT_SECRET) {
  throw new Error('Missing required environment variable JWT_SECRET');
}

module.exports = {
  JWT_SECRET: process.env.JWT_SECRET,
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
  },
  ROOM_DEFAULTS: {
    province: '\u0048\u00e0 \u004e\u1ed9\u0069',
    district: '\u0043\u1ea7\u0075 \u0047\u0069\u1ea5\u0079',
    ward: '\u0044\u1ecb\u0063\u0068 \u0056\u1ecd\u006e\u0067 \u0048\u1eadu',
    thumbnail: '/client/assets/images/product-1.jpg',
    images: ['/client/assets/images/product-1.jpg'],
    electricityPrice: '3.800 \u0111/kWh',
    waterPrice: '30.000 \u0111/m\u00b3',
    servicePrice: '100.000 \u0111/th\u00e1ng'
  },
  ROOM_DISTRICTS: [
    '\u0043\u1ea7\u0075 \u0047\u0069\u1ea5\u0079',
    '\u0110\u1ed1\u006e\u0067 \u0110\u0061',
    '\u0048\u0061\u0069 \u0042\u00e0 \u0054\u0072\u01b0\u006e\u0067',
    '\u0054\u0068\u0061\u006e\u0068 \u0058\u0075\u00e2\u006e',
    '\u004e\u0061\u006d \u0054\u1eeb \u004c\u0069\u00eam',
    '\u0042\u1eaf\u0063 \u0054\u1eeb \u004c\u0069\u00eam',
    '\u0042\u0061 \u0110\u00ec\u006e\u0068',
    '\u0048\u006f\u00e0\u006e\u0067 \u004d\u0061\u0069'
  ]
};
