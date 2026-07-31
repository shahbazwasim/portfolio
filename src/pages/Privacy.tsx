import { Seo } from '@/lib/seo'
import { SITE } from '@/data/site'
import { Reveal } from '@/components/ui/Reveal'

const SECTIONS = [
  {
    heading: 'What this site collects',
    body: [
      'This site has no accounts, no logins and no tracking cookies. There are two ways information reaches me:',
    ],
    list: [
      'The contact form. Whatever you type into it — your name, email, company, project details — is sent to me by email. Nothing else is captured.',
      'Anonymous analytics, if enabled. Page views and referrers only, in aggregate. No personal identifiers, no cross-site tracking, no advertising profiles.',
    ],
  },
  {
    heading: 'Where contact form data goes',
    body: [
      `Form submissions are processed by Netlify Forms, the hosting platform for this site, and forwarded to my email inbox. Netlify stores a copy in their dashboard, subject to their own privacy policy.`,
      'I use what you send solely to reply to you and, if we work together, to deliver that work. It is never sold, never shared with third parties for marketing, and never added to a mailing list — there is no mailing list.',
    ],
  },
  {
    heading: 'How long it is kept',
    body: [
      'Enquiries that do not lead to work are deleted within 12 months. Correspondence relating to actual projects is kept for as long as needed for that engagement plus any period required for tax and legal records.',
    ],
  },
  {
    heading: 'Third-party services',
    body: ['This site relies on a small number of external services:'],
    list: [
      'Netlify — hosting, form handling and CDN delivery.',
      'Fontshare — serves the display and body typefaces.',
      'Google Analytics — only if an analytics ID has been configured; it is off by default.',
    ],
  },
  {
    heading: 'Your rights',
    body: [
      'You can ask me at any time to tell you what data of yours I hold, correct it, or delete it entirely. Email me and I will action it — no forms, no process.',
    ],
  },
  {
    heading: 'The demos on this site',
    body: [
      'The interactive demos run entirely in your browser. Any data you enter into them — deals, invoices, blog posts, cart contents — is stored in your own browser\'s local storage and is never transmitted anywhere. Clearing your browser data removes it. I cannot see it.',
    ],
  },
]

export default function Privacy() {
  return (
    <>
      <Seo
        title="Privacy"
        description={`How ${SITE.name} handles data submitted through this website.`}
        path="/privacy"
      />

      <section className="container-page pt-32 pb-20 lg:pt-40">
        <Reveal>
          <div className="max-w-3xl">
            <span className="text-subtle font-mono text-xs tracking-[0.2em] uppercase">Legal</span>
            <h1 className="mt-5 text-[clamp(2rem,5vw,3.5rem)] leading-[1.05]">Privacy</h1>
            <p className="text-muted mt-6 text-lg leading-relaxed">
              The short version: this is a personal portfolio. It collects almost nothing, and what
              it does collect is only used to reply to you.
            </p>
          </div>
        </Reveal>

        <div className="mt-14 flex max-w-3xl flex-col gap-10">
          {SECTIONS.map((s, i) => (
            <Reveal key={s.heading} delay={i * 0.03}>
              <section>
                <h2 className="text-ink text-xl sm:text-2xl">{s.heading}</h2>
                <div className="mt-4 flex flex-col gap-4">
                  {s.body.map((p) => (
                    <p key={p} className="text-muted leading-relaxed">
                      {p}
                    </p>
                  ))}
                  {s.list && (
                    <ul className="flex flex-col gap-3">
                      {s.list.map((item) => (
                        <li key={item} className="text-muted flex gap-3 leading-relaxed">
                          <span className="from-cyan to-violet mt-[0.65em] h-px w-3 shrink-0 bg-gradient-to-r" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </section>
            </Reveal>
          ))}

          <Reveal>
            <div className="border-line rounded-panel border p-6">
              <h2 className="text-ink text-lg">Questions</h2>
              <p className="text-muted mt-2 leading-relaxed">
                Anything at all about how your data is handled — email{' '}
                <a
                  href={`mailto:${SITE.email}`}
                  className="text-cyan underline underline-offset-4"
                >
                  {SITE.email}
                </a>
                .
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  )
}
