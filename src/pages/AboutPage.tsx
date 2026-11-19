import { Link } from 'react-router-dom'
import { PageHeader, SectionLabel } from '../components/signage/Signage'

const STEPS = [
  'Sign up and get 1,000 play credits.',
  'Find a train. Filter by line, search for your station, or sort by what\'s near you.',
  'Make your call: on time, late, or very late. Pick how many credits to put on it.',
  'When the train arrives, we check the real arrival time and pay out if you were right.',
  'Climb the leaderboard. Or don\'t. It\'s a game.',
]

const FAQ: { q: string; a: string }[] = [
  {
    q: 'What is this?',
    a: 'A small game built on live NYC subway data. You guess how late a train will be and win play credits if you\'re right. It started as a way to make waiting on the platform a little more fun.',
  },
  {
    q: 'What counts as on time, late, and very late?',
    a: 'On time means the train got there within 5 minutes of schedule. Late is 5 to 20 minutes behind. Very late is anything past 20 minutes.',
  },
  {
    q: 'Why do payouts change from train to train?',
    a: 'Every station and line has its own track record. If a train is usually on time at a stop, calling "on time" there pays less, and calling "very late" pays more. Payouts are set when the train first appears and don\'t move after that.',
  },
  {
    q: 'When can I make a call?',
    a: 'Up until 2 minutes before the train is scheduled to arrive. After that the doors close, but you can still watch how it turns out.',
  },
  {
    q: 'What if a train gets cancelled?',
    a: 'If a train is cancelled, or the feed goes quiet and we can\'t tell when it arrived, everyone gets their credits back.',
  },
  {
    q: 'Where does the train data come from?',
    a: 'The MTA publishes live arrival data for every subway line. We check it about every 30 seconds.',
  },
  {
    q: 'What if I run out of credits?',
    a: 'It happens. Send us a note and we\'ll top you up.',
  },
  {
    q: 'Is this real gambling?',
    a: 'No. Credits are play money. They aren\'t worth anything and you can\'t buy or cash them out.',
  },
]

export default function AboutPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-10">
      <section>
        <PageHeader kicker="About" title="How it works" />
        <p className="text-[15px] text-sp-dim leading-relaxed max-w-[52ch]">
          Signal Problems is a guessing game for people waiting on the subway. Pick a train, call
          when it'll really show up, and see if you got it right.
        </p>
      </section>

      <section>
        <SectionLabel>How to play</SectionLabel>
        <ol className="card divide-y divide-sp-edge">
          {STEPS.map((step, i) => (
            <li key={step} className="flex items-start gap-4 px-4 py-3.5 text-sm">
              <span className="w-6 h-6 rounded-full border-2 border-sp-led text-sp-led inline-flex items-center justify-center text-[11px] font-bold shrink-0">
                {i + 1}
              </span>
              <span className="pt-0.5 leading-relaxed">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section>
        <SectionLabel>Questions</SectionLabel>
        <div className="card divide-y divide-sp-edge">
          {FAQ.map(({ q, a }) => (
            <details key={q} className="group">
              <summary className="flex items-center justify-between gap-4 px-4 py-3.5 cursor-pointer select-none text-sm font-medium list-none [&::-webkit-details-marker]:hidden hover:text-sp-accent transition-colors">
                {q}
                <span className="text-sp-dim transition-transform group-open:rotate-180">▾</span>
              </summary>
              <p className="px-4 pb-4 -mt-1 text-sm text-sp-dim leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section>
        <SectionLabel>The fine print</SectionLabel>
        <div className="card px-4 py-4 text-sm text-sp-dim space-y-2 leading-relaxed">
          <p>
            Train data comes from the{' '}
            <a
              href="https://mta.info/developers"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-sp-text"
            >
              MTA's developer feeds
            </a>
            . Sometimes the feed is wrong or goes down, just like the trains.
          </p>
          <p>Signal Problems is a fan project. It isn't connected to the MTA in any way.</p>
        </div>
      </section>

      <section className="text-center pb-4">
        <p className="text-sm text-sp-dim">
          Found a bug or have an idea?{' '}
          <a href="mailto:hello@signalproblems.app" className="text-sp-accent underline underline-offset-2">
            Say hi
          </a>
          .
        </p>
        <Link to="/" className="btn-primary mt-6 px-6 py-3">
          Go find a train
        </Link>
      </section>
    </div>
  )
}
