const FAQ: { q: string; a: string }[] = [
  {
    q: 'What is Signal Problems?',
    a: 'Signal Problems is a prediction game built on real-time NYC subway data. You wager virtual credits on whether trains will arrive on time or late — no real money involved.',
  },
  {
    q: 'How do I earn credits?',
    a: 'You start with 1,000 credits when you sign up. Correct predictions pay out 2× your wager. Incorrect predictions lose your stake. Credits are virtual and have no monetary value.',
  },
  {
    q: 'What counts as "on time"?',
    a: 'A train is considered on time if it arrives within 5 minutes of its scheduled arrival — the same threshold the MTA uses publicly.',
  },
  {
    q: 'When does a market close?',
    a: 'Betting closes 2 minutes before a train\'s scheduled arrival to prevent last-second gaming. You\'ll still be able to watch the outcome unfold in real time.',
  },
  {
    q: 'What happens if a train is cancelled?',
    a: 'If a train is cancelled or the MTA feed goes stale and we can\'t confirm the outcome, the market is cancelled and all wagers are refunded in full.',
  },
  {
    q: 'Where does the train data come from?',
    a: 'We use the MTA\'s GTFS-Realtime feeds, which update every 30 seconds. Historical on-time rates are computed from past arrivals logged by our system.',
  },
  {
    q: 'Can I lose all my credits?',
    a: 'Yes. If you lose all your credits, reach out and we can manually reset your balance — this is a game, not a financial product.',
  },
  {
    q: 'Is this real money gambling?',
    a: 'No. Credits are a fictional in-app currency with no monetary value. Signal Problems is a free-to-play prediction game.',
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-8">
      {/* Masthead */}
      <section className="border-b-2 border-sp-led pb-5">
        <h1 className="text-2xl font-bold tracking-tight">Signal Problems</h1>
        <p className="text-sm text-gray-600 mt-2 leading-relaxed">
          A real-time prediction market for NYC subway delays. Bet virtual credits on whether
          trains will arrive on time — powered by live MTA data, settled automatically.
        </p>
      </section>

      {/* How it works */}
      <section>
        <h2 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">
          How It Works
        </h2>
        <ol className="space-y-3">
          {[
            'Sign up and receive 1,000 starting credits.',
            'Browse upcoming train arrivals, filterable by line or station.',
            'Pick a market — wager credits on whether the train will be on time or late.',
            'After the train arrives, the market settles automatically and winners are credited.',
            "Climb the leaderboard. Don't lose all your credits.",
          ].map((step, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <li key={i} className="flex gap-3 text-sm">
              <span className="font-bold tabular-nums text-gray-400 shrink-0 w-4 text-right">
                {i + 1}
              </span>
              <span className="text-gray-700">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">FAQ</h2>
        <div className="card divide-y divide-gray-100">
          {FAQ.map(({ q, a }) => (
            <div key={q} className="px-4 py-4">
              <p className="text-sm font-medium mb-1">{q}</p>
              <p className="text-sm text-gray-500 leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Data attribution */}
      <section>
        <h2 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">
          Data & Attribution
        </h2>
        <div className="card px-4 py-4 text-sm text-gray-500 space-y-2 leading-relaxed">
          <p>
            Train data is sourced from the{' '}
            <a
              href="https://mta.info/developers"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-gray-700"
            >
              MTA Developer Resources
            </a>{' '}
            GTFS-Realtime feeds. Real-time accuracy is subject to feed availability and MTA system
            conditions.
          </p>
          <p>
            Signal Problems is not affiliated with or endorsed by the Metropolitan Transportation
            Authority.
          </p>
        </div>
      </section>

      {/* Contact */}
      <section>
        <h2 className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-3">Contact</h2>
        <div className="card px-4 py-4 text-sm text-gray-500">
          <p>
            Encountered a bug or have feedback?{' '}
            <a
              href="mailto:hello@signalproblems.app"
              className="underline hover:text-gray-700"
            >
              hello@signalproblems.app
            </a>
          </p>
        </div>
      </section>
    </div>
  )
}
