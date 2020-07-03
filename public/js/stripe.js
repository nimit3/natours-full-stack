import axios from 'axios';
import { showAlert } from './alerts';

const stripe = Stripe(
  'pk_test_51H0We0A9rCo3UqY6ZLnsbO6GjFlAeceF4UzvnXoPWKonWngdV9ieymNhHlhnnv1EfZiyyTQHcAMDgBoTNU2YeTTJ00SsbQS1N6'
);

export const bookTour = async (tourId) => {
  try {
    // 1) Get checkout session from endpoint of API
    const session = await axios(`/api/v1/bookings/checkout-session/${tourId}`);
    // console.log(session);
    //2) Create checkout form + charge credit card
    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    // console.log(err);
    showAlert('error', err);
  }
};
