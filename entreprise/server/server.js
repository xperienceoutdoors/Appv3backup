import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Créer une intention de paiement
app.post('/api/create-payment-intent', async (req, res) => {
  try {
    const { amount, reservationId, paymentMethod } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'eur',
      metadata: {
        reservationId,
        paymentMethod,
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Webhook pour gérer les événements Stripe
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Gérer les différents événements
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      // Envoyer un email de confirmation
      // Note: Implémenter l'envoi d'email ici
      console.log('PaymentIntent succeeded:', paymentIntent.id);
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      // Envoyer une notification d'échec
      console.log('Payment failed:', failedPayment.id);
      break;
  }

  res.json({ received: true });
});

// Endpoint pour compléter un paiement partiel
app.post('/api/complete-payment', async (req, res) => {
  try {
    const { reservationId, amount } = req.body;

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency: 'eur',
      metadata: {
        reservationId,
        paymentType: 'completion'
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint pour récupérer les informations de paiement d'une réservation
app.get('/api/reservation-payments/:reservationId', async (req, res) => {
  try {
    const { reservationId } = req.params;

    const paymentIntents = await stripe.paymentIntents.list({
      metadata: {
        reservationId,
      },
    });

    const payments = paymentIntents.data.map(pi => ({
      id: pi.id,
      amount: pi.amount / 100,
      status: pi.status,
      paymentMethod: pi.metadata.paymentMethod,
      created: new Date(pi.created * 1000),
    }));

    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
