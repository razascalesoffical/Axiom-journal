import React, { useCallback, useState } from 'react';
import { Experience } from './webgl/Experience';
import { Navigation } from './components/Navigation';
import { FeatureDeck } from './components/FeatureDeck';
import { PolicyModals } from './components/PolicyModals';
import {
  DISCORD_INVITE_URL,
  FAQ_ENTRIES,
  FOOTER_LINKS,
  FooterLink,
  ModalKind,
  NavAction,
  PAYMENT_STEPS,
  SUPPORT_EMAIL
} from './data/content';
import { sanitizeExternalUrl } from './lib/navigation';

export default function App() {
  const [activeNavId, setActiveNavId] = useState<string>('about');
  const [activeModal, setActiveModal] = useState<ModalKind | null>(null);

  const openModal = useCallback((modal: ModalKind) => {
    setActiveModal(modal);
  }, []);

  const closeModal = useCallback(() => {
    setActiveModal(null);
  }, []);

  const selectNavAction = useCallback((action: NavAction) => {
    setActiveNavId(action.id);
  }, []);

  const safeDiscordHref = sanitizeExternalUrl(DISCORD_INVITE_URL) ?? '#';

  const renderFooterLink = (link: FooterLink) => {
    if (link.kind === 'external') {
      const isInternal = link.href.startsWith('/');
      const href = isInternal ? link.href : sanitizeExternalUrl(link.href);
      if (!href) return null;

      return (
        <a
          key={link.id}
          href={href}
          target={isInternal ? undefined : '_blank'}
          rel={isInternal ? undefined : 'noopener noreferrer'}
          className="underline transition-colors hover:text-white focus-visible:outline-1 focus-visible:outline-[#ea1e33]"
        >
          {link.label}
        </a>
      );
    }

    return (
      <button
        key={link.id}
        type="button"
        onClick={() => openModal(link.modal)}
        className="text-left underline transition-colors hover:text-white focus-visible:outline-1 focus-visible:outline-[#ea1e33]"
      >
        {link.label}
      </button>
    );
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-black text-[#f5f2eb] selection:bg-[#ea1e33] selection:text-[#f6eedb]">
      <Experience />

      <div className="ui">
        <header className="brand absolute top-5 left-6 flex items-center gap-4 ui-active">
          <img
            src="/Axiom_Cooperation.jpg-removebg-preview.png"
            alt="Axiom Cooperation official emblem"
            className="w-auto h-16 object-contain drop-shadow-[0_0_16px_rgba(234,30,51,0.45)] md:h-20"
          />
          <div className="flex flex-col">
            <span className="text-[20px] font-extrabold leading-tight tracking-tight text-[#f6eedb] md:text-[22px]">
              AXIOM COOPERATION
            </span>
            <span className="mt-0.5 text-[11px] font-semibold tracking-widest uppercase text-[#ea1e33] md:text-[12px]">
              Trading Journal
            </span>
          </div>
        </header>

        <Navigation
          activeId={activeNavId}
          ariaLabel="Desktop Navigation"
          onSelectAction={selectNavAction}
          onOpenModal={openModal}
          className="hidden absolute top-[120px] left-6 w-[320px] flex-wrap gap-1.5 ui-active md:flex"
        />

        <FeatureDeck className="list hidden absolute top-[250px] left-6 bottom-0 w-[320px] pb-12 overflow-y-auto scroll-smooth ui-active md:block" />

        <main
          id="main-content"
          className="about absolute right-6 top-0 bottom-0 flex flex-col gap-[3.5em] w-full max-w-[320px] px-6 pt-[120px] pb-24 overflow-y-auto overflow-x-hidden scroll-smooth ui-active mix-blend-plus-lighter md:right-[90px] md:max-w-[420px] md:px-0"
        >
          <section className="pt-24 md:hidden" aria-label="Mobile Navigation">
            <Navigation
              activeId={activeNavId}
              ariaLabel="Mobile Navigation"
              onSelectAction={selectNavAction}
              onOpenModal={openModal}
              className="flex flex-wrap gap-1.5"
            />
          </section>

          <section aria-labelledby="hero-heading">
            <div className="flex items-center gap-2 mb-2 text-[11px] font-medium tracking-widest text-[#ea1e33]">
              <span
                className="inline-block w-1.5 h-1.5 rounded-full bg-[#ea1e33] animate-pulse"
                aria-hidden="true"
              />
              <span className="text-[#f6eedb]">FREE FOREX TRADING JOURNAL</span>
            </div>
            <h1
              id="hero-heading"
              className="mb-[0.8em] text-[24px] font-bold leading-[1.1] text-[#f6eedb] md:text-[32px]"
            >
              Free Forex Trading Journal for Disciplined Traders
            </h1>
            <p className="mb-[1.5em] text-justify leading-[1.45] text-[#dddddd]">
              Axiom Trading Journal is a free online trading journal built for Forex and financial traders in Pakistan and worldwide. Log every trade, track your psychology and discipline, and turn raw trade data into clear performance analytics.
            </p>
            <div className="flex gap-4">
              <a
                href="/app/"
                className="inline-block px-4 py-2 text-[11px] font-bold text-white bg-[#ea1e33] transition-colors hover:bg-[#f6eedb] hover:text-black focus-visible:outline-1 focus-visible:outline-[#f6eedb]"
              >
                LOG IN / SIGN UP FREE
              </a>
              <button
                type="button"
                onClick={() => openModal('about')}
                className="px-4 py-2 text-[11px] font-bold text-[#f6eedb] border border-[#f6eedb]/40 transition-colors hover:border-[#ea1e33] hover:text-[#ea1e33] focus-visible:outline-1 focus-visible:outline-[#ea1e33]"
              >
                LEARN MORE
              </button>
            </div>
          </section>

          <div className="md:hidden">
            <FeatureDeck className="flex flex-col gap-4" />
          </div>

          <section aria-labelledby="community-heading">
            <h2
              id="community-heading"
              className="mb-[1em] text-[13px] font-medium tracking-widest text-[#ea1e33]"
            >
              [COMMUNITY]
            </h2>
            <h3 className="mb-4 text-[18px] text-[#f6eedb]">
              Join the Axiom Cooperation Community
            </h3>
            <p className="mb-6 text-[#8a8a8a]">
              Talk trading, share your journal habits, and help shape what we build next.
            </p>
            <a
              href={safeDiscordHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 font-mono text-[11px] font-bold tracking-wider text-white bg-[#5865F2] transition-colors hover:bg-[#4752C4] focus-visible:outline-1 focus-visible:outline-white"
            >
              <span>JOIN DISCORD</span>
              <span aria-hidden="true">&rarr;</span>
            </a>
          </section>

          <section aria-labelledby="payments-heading">
            <h2
              id="payments-heading"
              className="mb-[1em] text-[13px] font-medium tracking-widest text-[#ea1e33]"
            >
              [MEMBERSHIP &amp; UPGRADES]
            </h2>
            <p className="mb-6 text-justify leading-[1.45]">
              Axiom Trading Journal is free to use. An optional monthly subscription unlocks unlimited accounts, advanced psychological metrics, and automated risk diagnostics.
            </p>
            <ol className="flex flex-col gap-4 list-decimal list-inside text-[11px] text-[#8a8a8a]">
              {PAYMENT_STEPS.map((step, idx) => (
                <li key={idx} className="leading-relaxed">
                  <span className="font-bold text-[#f6eedb]">Step {idx + 1}:</span> {step}
                </li>
              ))}
            </ol>
          </section>

          <section aria-labelledby="business-heading">
            <h2
              id="business-heading"
              className="mb-[1em] text-[13px] font-medium tracking-widest text-[#ea1e33]"
            >
              [BUSINESS MODEL]
            </h2>
            <p className="mb-4 text-justify leading-[1.45]">
              Axiom Trading Journal is operated as an individual software business by Ali Raza, based in Pakistan. Revenue comes entirely from optional monthly subscription payments.
            </p>
            <button
              type="button"
              onClick={() => openModal('business')}
              className="text-left text-[11px] text-[#8a8a8a] underline transition-colors hover:text-[#ea1e33] focus-visible:outline-1 focus-visible:outline-[#ea1e33]"
            >
              Read the full explanation on our Business Model page.
            </button>
          </section>

          <section aria-labelledby="faq-heading">
            <h2
              id="faq-heading"
              className="mb-[1em] text-[13px] font-medium tracking-widest text-[#ea1e33]"
            >
              [FAQ]
            </h2>
            <dl className="flex flex-col gap-6">
              {FAQ_ENTRIES.map(faq => (
                <div key={faq.question}>
                  <dt className="mb-1 font-bold text-[#f6eedb]">
                    <h3>{faq.question}</h3>
                  </dt>
                  <dd className="text-[12px] text-[#8a8a8a]">{faq.answer}</dd>
                </div>
              ))}
            </dl>
          </section>

          <footer className="flex flex-col gap-6 pt-12 border-t border-[#2a2a2a]">
            <div className="flex items-center gap-4">
              <img
                src="/Black_and_White_Minimalist_Initials_Logo-removebg-preview.png"
                alt="Axiom Cooperation minimalist initials emblem"
                className="w-auto h-16 object-contain drop-shadow-[0_0_16px_rgba(234,30,51,0.3)] md:h-20"
              />
              <div className="flex flex-col">
                <span className="font-bold leading-tight text-[#f6eedb]">AXIOM COOPERATION</span>
                <span className="mt-0.5 text-[11px] font-semibold tracking-wider uppercase text-[#ea1e33]">
                  Trading Journal
                </span>
                <span className="mt-1 text-[11px] text-[#999388]">{SUPPORT_EMAIL}</span>
              </div>
            </div>
            <nav
              aria-label="Footer Links"
              className="flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-[#8a8a8a]"
            >
              {FOOTER_LINKS.map(renderFooterLink)}
            </nav>
          </footer>
        </main>
      </div>

      <PolicyModals activeModal={activeModal} onClose={closeModal} />
    </div>
  );
}
