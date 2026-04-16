import User from '../models/User.js';

export const isProUser = async (firebaseUid) => {
  try {
    const user = await User.findOne({ firebaseUid });
    return user?.subscriptionStatus === 'active';
  } catch (error) {
    console.error('isProUser error:', error);
    return false;
  }
};

export const getProUserEmails = async () => {
  try {
    const proUsers = await User.find({
      subscriptionStatus: 'active',
      stripeCustomerId: { $ne: null }
    }).select('email');
    return proUsers.map(u => u.email);
  } catch (error) {
    console.error('getProUserEmails error:', error);
    return [];
  }
};