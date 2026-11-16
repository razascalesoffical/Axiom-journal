import React, { useState, useEffect } from 'react';
import { INSTAGRAM_ACCOUNTS, ModalKind, SUPPORT_EMAIL } from '../data/content';
import { sanitizeExternalUrl } from '../lib/navigation';
import { BLOG_POSTS, BlogPost } from '../data/blogPosts';

interface PolicyModalProps {
  readonly title: string;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly children: React.ReactNode;
}

function PolicyModal({ title, isOpen, onClose, children }: PolicyModalProps) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-[8px] animate-in fade-in duration-300"
    >
      <div
        onClick={event => event.stopPropagation()}
        className="relative w-full max-w-2xl max-h-[90vh] p-6 pt-12 overflow-y-auto bg-[#0d0d0d] border border-[#2a2a2a] shadow-2xl selection:bg-[#ea1e33] selection:text-[#f6eedb] md:p-12 md:pt-12"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-10 flex items-center justify-center w-8 h-8 text-[14px] text-[#f6eedb] bg-[#1a1a1a] hover:bg-[#ea1e33] hover:text-white border border-[#333] transition-colors rounded-sm"
        >
          &#x2715;
        </button>

        <article className="flex flex-col gap-8 mix-blend-plus-lighter">
          <header>
            <h2 className="mb-2 text-[13px] font-medium tracking-widest uppercase text-[#ea1e33]">
              {title}
            </h2>
            <p className="text-[11px] text-[#999388]">Last updated: 2026</p>
          </header>
          {children}
        </article>
      </div>
    </div>
  );
}

interface PolicyModalsProps {
  readonly activeModal: ModalKind | null;
  readonly onClose: () => void;
}

function BulletList({
  points,
  accented = true
}: {
  readonly points: readonly string[];
  readonly accented?: boolean;
}) {
  const bulletClass = accented ? 'shrink-0 text-[#ea1e33]' : 'shrink-0';

  return (
    <ul className="flex flex-col gap-3 text-[12px] text-[#8a8a8a]">
      {points.map(point => (
        <li key={point} className="flex gap-3">
          <span className={bulletClass} aria-hidden="true">
            &bull;
          </span>
          <span>{point}</span>
        </li>
      ))}
    </ul>
  );
}

function SectionHeading({
  children,
  variant = 'sub'
}: {
  readonly children: React.ReactNode;
  readonly variant?: 'primary' | 'sub';
}) {
  if (variant === 'primary') {
    return (
      <h3 className="mb-4 text-[13px] font-medium tracking-widest uppercase text-[#ea1e33]">
        {children}
      </h3>
    );
  }

  return (
    <h3 className="mb-3 text-[12px] font-bold tracking-wider uppercase text-[#f6eedb]">
      {children}
    </h3>
  );
}

const SHIPPING_DELIVERY_STEPS: readonly string[] = [
  'The customer completes payment through our payment gateway partner (card or other payment methods supported at checkout).',
  "Once the payment gateway confirms the transaction, the customer's account is automatically upgraded.",
  "Premium features are unlocked immediately in the customer's account — typically within seconds of a successful payment, with no manual handling or physical delivery required."
];

const GATEWAY_FLOW_STEPS: readonly string[] = [
  'The customer clicks "Upgrade" inside their account dashboard.',
  'They are taken to a secure checkout page powered by our payment gateway partner, where they can pay by card or other payment methods supported at checkout.',
  "Once payment is confirmed by the gateway, the customer's account is automatically upgraded and premium features are unlocked instantly — no manual steps, no physical delivery."
];

const PRIVACY_COLLECTED: readonly string[] = [
  'Account information: username, email address, and a securely hashed password (or your Google account ID if you sign in with Google).',
  'Trading data you enter: trade details, notes, screenshots you choose to attach, and performance figures.',
  'Payment information: when you subscribe to a paid plan, payment is processed by our payment gateway partner. We do not store your card details or other payment credentials on our own servers.'
];

const PRIVACY_USAGE: readonly string[] = [
  'To create and manage your account.',
  'To provide the trade-journaling and analytics features of the app.',
  'To process payments and manage your subscription status.',
  'To respond to support requests you send us.'
];

const TERMS_RESPONSIBILITIES: readonly string[] = [
  'You are responsible for keeping your login credentials confidential.',
  'You must provide accurate information when creating your account.',
  'You are responsible for the trading data you choose to enter into the Service.'
];

export function PolicyModals({ activeModal, onClose }: PolicyModalsProps) {
  return (
    <>
      <PolicyModal title="Shipping Policy" isOpen={activeModal === 'shipping'} onClose={onClose}>
        <div className="flex flex-col gap-8 text-[12px] leading-relaxed">
          <section>
            <SectionHeading>Digital Service — No Physical Shipping</SectionHeading>
            <p className="text-[#dddddd]">
              Axiom Trading Journal is a fully digital, web-based software service. We do not sell or ship any physical products.
            </p>
          </section>

          <section>
            <SectionHeading>Delivery of Paid Features</SectionHeading>
            <p className="mb-4 text-[#dddddd]">
              When a customer subscribes to a paid plan, &ldquo;delivery&rdquo; happens automatically and instantly within the web application:
            </p>
            <BulletList points={SHIPPING_DELIVERY_STEPS} />
          </section>

          <section>
            <SectionHeading>Delays</SectionHeading>
            <p className="text-[#dddddd]">
              In rare cases of a delayed webhook or processing issue, access is typically restored within a few hours. If a customer does not see their account upgraded after a successful payment, they can contact us using the details in the footer below.
            </p>
          </section>

          <section>
            <SectionHeading>Contact</SectionHeading>
            <p className="text-[#dddddd]">
              See the footer for our support email:{' '}
              <span className="text-[#ea1e33]">{SUPPORT_EMAIL}</span>
            </p>
          </section>
        </div>
      </PolicyModal>

      <PolicyModal title="Refund Policy" isOpen={activeModal === 'refund'} onClose={onClose}>
        <div className="flex flex-col gap-6 text-[12px] leading-relaxed">
          <p className="text-[#dddddd]">
            Axiom Cooperation wants customers to be confident in their purchase. The following refund policy applies to all paid subscriptions of Axiom Trading Journal.
          </p>

          <section>
            <SectionHeading>1. 7-Day Refund Window</SectionHeading>
            <p className="text-[#dddddd]">
              Customers may request a full refund within 7 days of their initial purchase if they are not satisfied with the premium features, provided the request is made in good faith.
            </p>
          </section>

          <section>
            <SectionHeading>2. After the 7-Day Window</SectionHeading>
            <p className="text-[#dddddd]">
              Refund requests made after the 7-day window are evaluated on a case-by-case basis — for example, in the case of an accidental duplicate charge or a verified technical failure that prevented the customer from using the paid features. Refunds are not provided for the unused portion of a subscription period after the 7-day window, except where required by applicable consumer protection law.
            </p>
          </section>

          <section>
            <SectionHeading>3. How to Request a Refund</SectionHeading>
            <p className="text-[#dddddd]">
              To request a refund, contact us by email at the address in the footer below, including your account username and the reason for your request.
            </p>
          </section>

          <section>
            <SectionHeading>4. Processing Time</SectionHeading>
            <p className="text-[#dddddd]">
              Approved refunds are processed back to the original payment method within 5–10 business days.
            </p>
          </section>

          <section>
            <SectionHeading>5. Contact</SectionHeading>
            <p className="text-[#dddddd]">
              See the footer for our support email:{' '}
              <span className="text-[#ea1e33]">{SUPPORT_EMAIL}</span>
            </p>
          </section>
        </div>
      </PolicyModal>

      <PolicyModal
        title="About & Business Model"
        isOpen={activeModal === 'about' || activeModal === 'business'}
        onClose={onClose}
      >
        <div className="flex flex-col gap-10 text-[12px] leading-relaxed">
          <section>
            <SectionHeading variant="primary">About Axiom Trading Journal</SectionHeading>
            <p className="text-[#f6eedb]">
              Operated by Axiom Cooperation (Ali Raza) — Islamabad, Pakistan
            </p>
          </section>

          <section>
            <SectionHeading variant="primary">What This Website Does</SectionHeading>
            <p className="text-justify text-[#dddddd]">
              Axiom Trading Journal is a web-based application for retail Forex and financial traders. It lets a trader log individual trades, record entry/exit prices and position size, and automatically calculates key figures such as pip movement, risk-to-reward ratio, and profit or loss. The app also tracks trading psychology and discipline, and presents performance analytics (win/loss ratio, equity curve, and monthly statistics) so a trader can review and improve their process over time.
            </p>
          </section>

          <section>
            <SectionHeading variant="primary">How the Payment Gateway Is Used</SectionHeading>
            <p className="mb-4 text-justify text-[#dddddd]">
              Axiom Trading Journal offers a free tier with core journaling features. Customers who want premium features (such as multiple trading accounts, extended history, advanced analytics, or data export) can subscribe to a paid plan directly inside the web application.
            </p>
            <BulletList points={GATEWAY_FLOW_STEPS} />
          </section>

          <section>
            <SectionHeading variant="primary">Business Model</SectionHeading>
            <p className="text-justify text-[#dddddd]">
              Axiom Trading Journal is operated as an individual/sole-proprietor software business by Ali Raza under Axiom Cooperation&apos;s Technology division, based in Pakistan. Revenue comes entirely from recurring monthly subscription payments made by customers through the in-app &ldquo;Upgrade&rdquo; flow described above. There are no physical products, no inventory, and no shipping involved — the service is delivered entirely online.
            </p>
          </section>

          <section>
            <SectionHeading variant="primary">Contact</SectionHeading>
            <p className="text-[#dddddd]">
              For questions about this business or how the payment gateway is used, contact us using the details in the footer:{' '}
              <span className="text-[#ea1e33]">{SUPPORT_EMAIL}</span>
            </p>
          </section>
        </div>
      </PolicyModal>

      <PolicyModal title="Privacy Policy" isOpen={activeModal === 'privacy'} onClose={onClose}>
        <div className="flex flex-col gap-8 text-[12px] leading-relaxed">
          <section>
            <SectionHeading>1. Information We Collect</SectionHeading>
            <p className="mb-4 text-[#dddddd]">
              When you create an account and use Axiom Trading Journal, we collect:
            </p>
            <BulletList points={PRIVACY_COLLECTED} accented={false} />
          </section>

          <section>
            <SectionHeading>2. How We Use Your Information</SectionHeading>
            <BulletList points={PRIVACY_USAGE} accented={false} />
          </section>

          <section>
            <SectionHeading>3. Data Storage & Security</SectionHeading>
            <p className="text-justify text-[#dddddd]">
              Your account and trading data are stored on secure, encrypted cloud infrastructure. Passwords are hashed before storage and are never stored in plain text. We do not sell or rent your personal information to third parties.
            </p>
          </section>

          <section>
            <SectionHeading>4. Third-Party Services</SectionHeading>
            <p className="text-justify text-[#dddddd]">
              We use trusted third-party providers to operate the service, including cloud hosting, our database provider, Google Sign-In (optional), Google Analytics for website usage statistics, and our payment gateway partner for processing subscription payments. Each of these providers has its own privacy and security practices.
            </p>
          </section>

          <section>
            <SectionHeading>5. Your Rights</SectionHeading>
            <p className="text-justify text-[#dddddd]">
              You can export your data at any time using the built-in export feature, or request account deletion by contacting us using the details below.
            </p>
          </section>

          <section>
            <SectionHeading>6. Analytics & Cookies</SectionHeading>
            <p className="text-justify text-[#dddddd]">
              We use Google Analytics to understand how visitors use our website and app, for example which pages are viewed and how people find us. Google Analytics uses cookies and similar technologies to collect non-identifying usage data such as pages visited, device and browser type, and approximate location (country or city level). We do not send your trading data, email address, or username to Google Analytics. You can opt out by using the Google Analytics opt-out browser add-on or by blocking cookies in your browser settings.
            </p>
          </section>

          <section>
            <SectionHeading>7. Contact</SectionHeading>
            <p className="text-[#dddddd]">
              Questions about this policy can be sent to our email address:{' '}
              <span className="text-[#ea1e33]">{SUPPORT_EMAIL}</span>
            </p>
          </section>
        </div>
      </PolicyModal>

      <PolicyModal title="Terms & Conditions" isOpen={activeModal === 'terms'} onClose={onClose}>
        <div className="flex flex-col gap-8 text-[12px] leading-relaxed">
          <section>
            <SectionHeading>1. Acceptance of Terms</SectionHeading>
            <p className="text-justify text-[#dddddd]">
              By creating an account or using Axiom Trading Journal (&ldquo;the Service&rdquo;), you agree to these Terms & Conditions. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <SectionHeading>2. Description of Service</SectionHeading>
            <p className="text-justify text-[#dddddd]">
              Axiom Trading Journal is a web-based tool that helps traders log trades and review their performance. It does not provide financial, investment, or trading advice, and does not execute trades on your behalf.
            </p>
          </section>

          <section>
            <SectionHeading>3. Account Responsibilities</SectionHeading>
            <BulletList points={TERMS_RESPONSIBILITIES} accented={false} />
          </section>

          <section>
            <SectionHeading>4. Paid Subscriptions</SectionHeading>
            <p className="text-justify text-[#dddddd]">
              Certain features require a paid subscription. Payments are processed securely through our payment gateway partner. Subscription pricing and included features are shown in the app at the time of purchase. See our Refund Policy for details on cancellations and refunds.
            </p>
          </section>

          <section>
            <SectionHeading>5. Acceptable Use</SectionHeading>
            <p className="text-justify text-[#dddddd]">
              You agree not to misuse the Service, attempt to gain unauthorized access to other users&apos; accounts or data, or use the Service for any unlawful purpose.
            </p>
          </section>

          <section>
            <SectionHeading>6. Limitation of Liability</SectionHeading>
            <p className="text-justify text-[#dddddd]">
              The Service is provided &ldquo;as is.&rdquo; Axiom Cooperation is not liable for any trading losses, decisions, or outcomes related to your use of the Service. The Service is a record-keeping and analytics tool only.
            </p>
          </section>

          <section>
            <SectionHeading>7. Changes to These Terms</SectionHeading>
            <p className="text-justify text-[#dddddd]">
              We may update these Terms from time to time. Continued use of the Service after changes are posted constitutes acceptance of the updated Terms.
            </p>
          </section>

          <section>
            <SectionHeading>8. Governing Law</SectionHeading>
            <p className="text-justify text-[#dddddd]">
              These Terms are governed by the laws of Pakistan.
            </p>
          </section>

          <section>
            <SectionHeading>9. Contact</SectionHeading>
            <p className="text-[#dddddd]">
              Questions about these Terms can be sent to the email address:{' '}
              <span className="text-[#ea1e33]">{SUPPORT_EMAIL}</span>
            </p>
          </section>
        </div>
      </PolicyModal>

      <PolicyModal
        title="Official Instagram Channels"
        isOpen={activeModal === 'instagram'}
        onClose={onClose}
      >
        <div className="flex flex-col gap-6 text-[12px] leading-relaxed">
          <p className="text-[#dddddd]">
            Connect with Axiom Cooperation across our three verified Instagram channels:
          </p>

          <div className="flex flex-col gap-4">
            {INSTAGRAM_ACCOUNTS.map(account => {
              const safeHref = sanitizeExternalUrl(account.url);
              if (!safeHref) return null;

              return (
                <a
                  key={account.handle}
                  href={safeHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex flex-col justify-between gap-3 p-4 bg-[#141414] border border-[#2a2a2a] transition-all sm:flex-row sm:items-center hover:border-[#ea1e33] focus-visible:outline-1 focus-visible:outline-[#ea1e33]"
                >
                  <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-[#f6eedb] transition-colors group-hover:text-white">
                      {account.name}
                    </span>
                    <span className="mt-0.5 font-mono text-[12px] font-medium text-[#ea1e33]">
                      {account.handle}
                    </span>
                    <span className="mt-1 text-[11px] text-[#8a8a8a]">{account.description}</span>
                  </div>
                  <div className="shrink-0 flex items-center gap-1.5 text-[11px] font-bold text-[#f6eedb] transition-colors group-hover:text-[#ea1e33]">
                    <span>FOLLOW</span>
                    <span aria-hidden="true">&rarr;</span>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </PolicyModal>

      <BlogModal isOpen={activeModal === 'blog'} onClose={onClose} />
    </>
  );
}

function BlogModal({
  isOpen,
  onClose
}: {
  readonly isOpen: boolean;
  readonly onClose: () => void;
}) {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  const handleClose = () => {
    setSelectedPost(null);
    onClose();
  };

  const title = selectedPost ? selectedPost.title : 'Trading Journal Blog & Articles';

  return (
    <PolicyModal title={title} isOpen={isOpen} onClose={handleClose}>
      {selectedPost ? (
        <div className="flex flex-col gap-6 text-[13px] leading-relaxed text-[#dddddd]">
          <div className="flex items-center justify-between pb-3 border-b border-[#2a2a2a]">
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-[#ea1e33] hover:text-[#f6eedb] transition-colors"
            >
              <span>&larr;</span>
              <span>All Articles</span>
            </button>
            <span className="text-[10px] tracking-wider uppercase text-[#999388]">
              {selectedPost.kicker}
            </span>
          </div>

          <div className="text-[11px] text-[#8a8a8a] italic">
            {selectedPost.meta}
          </div>

          <div
            className="blog-article-content flex flex-col gap-5"
            dangerouslySetInnerHTML={{ __html: selectedPost.contentHtml }}
          />

          <div className="pt-6 border-t border-[#2a2a2a] flex items-center justify-between">
            <button
              type="button"
              onClick={() => setSelectedPost(null)}
              className="text-[11px] font-bold text-[#ea1e33] hover:underline"
            >
              &larr; Back to all articles
            </button>
            <a
              href="/app/"
              className="px-4 py-2 text-[11px] font-bold text-white bg-[#ea1e33] hover:bg-[#f6eedb] hover:text-black transition-colors"
            >
              Open Trading Journal &rarr;
            </a>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 text-[12px] leading-relaxed">
          <p className="text-[#dddddd]">
            Practical guides and articles on Forex trading discipline, risk management, and trading psychology:
          </p>

          <div className="flex flex-col gap-4">
            {BLOG_POSTS.map(post => (
              <div
                key={post.slug}
                onClick={() => setSelectedPost(post)}
                className="group cursor-pointer flex flex-col gap-2 p-5 bg-[#141414] border border-[#2a2a2a] transition-all hover:border-[#ea1e33] focus-visible:outline-1 focus-visible:outline-[#ea1e33]"
              >
                <div className="flex items-center justify-between text-[10px] font-mono font-bold tracking-wider uppercase text-[#ea1e33]">
                  <span>{post.kicker}</span>
                  <span className="text-[#8a8a8a] group-hover:text-[#f6eedb] transition-colors flex items-center gap-1">
                    READ ARTICLE <span aria-hidden="true">&rarr;</span>
                  </span>
                </div>
                <h3 className="text-[14px] font-bold text-[#f6eedb] group-hover:text-white transition-colors">
                  {post.title}
                </h3>
                <p className="text-[11.5px] text-[#8a8a8a] line-clamp-2">
                  {post.meta}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </PolicyModal>
  );
}
