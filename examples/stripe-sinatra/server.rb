require 'json'
require 'stripe'
require 'sinatra'

Stripe.api_key = ENV.fetch('STRIPE_SECRET_KEY')
Stripe.api_version = ENV.fetch('STRIPE_API_VERSION', '2026-02-25.clover')

set :static, true
set :port, ENV.fetch('PORT', 4242)

YOUR_DOMAIN = ENV.fetch('YOUR_DOMAIN', 'http://localhost:4242')
PRICE_ID = ENV.fetch('STRIPE_PRICE_ID')

post '/create-checkout-session' do
  content_type 'application/json'

  session = Stripe::Checkout::Session.create({
    ui_mode: 'custom',
    line_items: [{
      price: PRICE_ID,
      quantity: 1,
    }],
    mode: 'payment',
    return_url: "#{YOUR_DOMAIN}/complete.html?session_id={CHECKOUT_SESSION_ID}",
    automatic_tax: { enabled: true },
  })

  { clientSecret: session.client_secret }.to_json
end

get '/session-status' do
  content_type 'application/json'

  session = Stripe::Checkout::Session.retrieve({
    id: params[:session_id],
    expand: ['payment_intent'],
  })

  {
    status: session.status,
    payment_status: session.payment_status,
    payment_intent_id: session.payment_intent.id,
    payment_intent_status: session.payment_intent.status,
  }.to_json
end
