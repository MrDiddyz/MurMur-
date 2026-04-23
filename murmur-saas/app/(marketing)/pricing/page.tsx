export default function PricingPage() {
  return (
    <section id="pricing" className="anchor">
      <div className="container">
        <h2>Priser</h2>
        <p className="small">
          Abonnement håndteres via Stripe (kort/Apple Pay). Vipps brukes som lavterskel startpakke (engang).
        </p>

        <div className="pricing">
          <div className="price-card">
            <h3>Starter</h3>
            <p className="price">€49 / mnd</p>
            <p>Grunnmodul + struktur for læring og overlevering.</p>
            <div style={{ marginTop: '1rem' }}>
              <a href="DIN_STRIPE_LINK_STARTER" className="button" target="_blank" rel="noopener noreferrer">
                Start abonnement
              </a>
            </div>
            <p className="small" style={{ marginTop: '0.8rem' }}>
              Avslutt når som helst. Kvittering på e-post.
            </p>
          </div>

          <div className="price-card featured">
            <h3>Growth</h3>
            <p className="price">€149 / mnd</p>
            <p>Flere moduler + teamstøtte og prioritet.</p>
            <div style={{ marginTop: '1rem' }}>
              <a href="DIN_STRIPE_LINK_GROWTH" className="button" target="_blank" rel="noopener noreferrer">
                Start abonnement
              </a>
            </div>
            <p className="small" style={{ marginTop: '0.8rem' }}>
              Avslutt når som helst. Kvittering på e-post.
            </p>
          </div>

          <div className="price-card">
            <h3>Enterprise</h3>
            <p className="price">Kontakt oss</p>
            <p>Skreddersydd leveranse, scope og innkjøpsvennlig pakke.</p>
            <div style={{ marginTop: '1rem' }}>
              <a href="#kontakt" className="button">
                Kontakt
              </a>
            </div>
          </div>
        </div>

        <div className="note" style={{ marginTop: '1.5rem' }}>
          <strong>Vipps Startpakke (engang):</strong> NOK 1490 – rask oppstart, onboarding og første anbefaling.
          <div style={{ marginTop: '0.8rem' }}>
            <a href="DIN_VIPPS_STARTPAKKE_LENKE" className="button" target="_blank" rel="noopener noreferrer">
              Betal Startpakke med Vipps (NOK 1490)
            </a>
          </div>
          <p className="small" style={{ marginTop: '0.8rem' }}>
            Etter startpakken aktiverer du abonnement i Stripe for løpende tilgang.
          </p>
        </div>
      </div>
    </section>
  );
}
