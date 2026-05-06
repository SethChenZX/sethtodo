import { Router } from 'express';
import User from '../models/User.js';
import Stripe from 'stripe';

const router = Router();

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;
const CLIENT_URL = process.env.CLIENT_URL || 'https://todo.cshrpro.com';

const stripe = STRIPE_SECRET_KEY ? new Stripe(STRIPE_SECRET_KEY) : null;

if (!STRIPE_SECRET_KEY) {
  console.warn('STRIPE_SECRET_KEY is not set. Stripe features will be disabled.');
}

router.post('/create-checkout-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripeが設定されていません' });
    }

    const { firebaseUid, email } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ error: 'firebaseUidとemailが必要です' });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { firebaseUid }
      });
      customerId = customer.id;
      user.stripeCustomerId = customerId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_ID,
        quantity: 1
      }],
      mode: 'payment',
      success_url: `${CLIENT_URL}/subscription?success=true`,
      cancel_url: `${CLIENT_URL}/subscription?canceled=true`,
      metadata: { firebaseUid }
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/create-portal-session', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripeが設定されていません' });
    }

    const { firebaseUid } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ error: 'firebaseUidが必要です' });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user || !user.stripeCustomerId) {
      return res.status(404).json({ error: 'サブスクリプションが見つかりません' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${CLIENT_URL}/subscription`
    });

    res.json({ url: session.url });
  } catch (error) {
    console.error('Stripe portal error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/subscription-status', async (req, res) => {
  try {
    const { firebaseUid } = req.query;

    if (!firebaseUid) {
      return res.status(400).json({ error: 'firebaseUidが必要です' });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    res.json({
      isPro: user.subscriptionStatus === 'active',
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd
    });
  } catch (error) {
    console.error('Get subscription status error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/verify-payment', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripeが設定されていません' });
    }

    const { sessionId, firebaseUid } = req.body;

    if (!sessionId || !firebaseUid) {
      return res.status(400).json({ error: 'sessionIdとfirebaseUidが必要です' });
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status === 'paid') {
      const user = await User.findOneAndUpdate(
        { firebaseUid },
        {
          subscriptionStatus: 'active',
          subscriptionPlan: 'pro',
          stripeCustomerId: session.customer
        },
        { new: true }
      );

      res.json({
        success: true,
        paymentStatus: session.payment_status,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan
      });
    } else {
      res.json({
        success: false,
        paymentStatus: session.payment_status,
        message: '支払いが完了していません'
      });
    }
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/sync-subscription', async (req, res) => {
  try {
    if (!stripe) {
      return res.status(500).json({ error: 'Stripeが設定されていません' });
    }

    const { firebaseUid } = req.body;

    if (!firebaseUid) {
      return res.status(400).json({ error: 'firebaseUidが必要です' });
    }

    const user = await User.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ error: 'ユーザーが見つかりません' });
    }

    if (!user.stripeCustomerId) {
      return res.json({
        isPro: false,
        subscriptionStatus: user.subscriptionStatus,
        subscriptionPlan: user.subscriptionPlan
      });
    }

    const sessions = await stripe.checkout.sessions.list({
      customer: user.stripeCustomerId,
      limit: 1
    });

    if (sessions.data.length > 0) {
      const latestSession = sessions.data[0];
      
      if (latestSession.payment_status === 'paid') {
        const updatedUser = await User.findOneAndUpdate(
          { firebaseUid },
          {
            subscriptionStatus: 'active',
            subscriptionPlan: 'pro'
          },
          { new: true }
        );

        return res.json({
          isPro: true,
          subscriptionStatus: updatedUser.subscriptionStatus,
          subscriptionPlan: updatedUser.subscriptionPlan,
          subscriptionCurrentPeriodEnd: updatedUser.subscriptionCurrentPeriodEnd
        });
      }
    }

    res.json({
      isPro: user.subscriptionStatus === 'active',
      subscriptionStatus: user.subscriptionStatus,
      subscriptionPlan: user.subscriptionPlan,
      subscriptionCurrentPeriodEnd: user.subscriptionCurrentPeriodEnd
    });
  } catch (error) {
    console.error('Sync subscription error:', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    if (!STRIPE_WEBHOOK_SECRET) {
      return res.status(500).json({ error: 'STRIPE_WEBHOOK_SECRET is not configured' });
    }

    event = stripe.webhooks.constructEvent(req.body, sig, STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: 'Invalid signature' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const firebaseUid = session.metadata?.firebaseUid;

        if (firebaseUid) {
          await User.findOneAndUpdate(
            { firebaseUid },
            {
              subscriptionStatus: 'active',
              subscriptionPlan: 'pro'
            }
          );
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;

        await User.findOneAndUpdate(
          { stripeCustomerId: subscription.customer },
          {
            subscriptionStatus: subscription.status,
            subscriptionCurrentPeriodEnd: new Date(subscription.current_period_end * 1000)
          }
        );
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;

        await User.findOneAndUpdate(
          { stripeCustomerId: subscription.customer },
          {
            subscriptionStatus: 'canceled',
            subscriptionId: null
          }
        );
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;

        await User.findOneAndUpdate(
          { stripeCustomerId: invoice.customer },
          { subscriptionStatus: 'past_due' }
        );
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;