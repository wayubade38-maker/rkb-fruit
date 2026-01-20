// Подключаем Stripe SDK
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  // Только POST-запросы
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }

  try {
    // Получаем корзину из тела запроса
    const cart = JSON.parse(event.body);

    // Проверяем, что корзина — массив
    if (!Array.isArray(cart) || cart.length === 0) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Cart is empty or invalid' })
      };
    }

    // Преобразуем товары в формат line_items для Stripe
    const line_items = cart.map(item => ({
      price: item.priceId,     // Должен быть реальный Price ID из Stripe
      quantity: item.quantity
    }));

    // Создаём Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items,
      success_url: 'https://rkbltd.co.uk/success.html', // ← ЗАМЕНИ НА СВОЙ URL
      cancel_url: 'https://rkbltd.co.uk/cart.html'       // ← ЗАМЕНИ НА СВОЙ URL
    });

    // Возвращаем URL на клиент
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        // Разрешаем вызов с фронтенда
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ url: session.url })
    };

  } catch (error) {
    console.error('Stripe error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Internal Server Error' })
    };
  }
};