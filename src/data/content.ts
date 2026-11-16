export type ModalKind =
  | 'about'
  | 'business'
  | 'privacy'
  | 'terms'
  | 'refund'
  | 'shipping'
  | 'instagram'
  | 'blog';

export interface FeatureSpec {
  readonly title: string;
  readonly subtitle: string;
}

export interface FeaturePair {
  readonly id: string;
  readonly mediaSrc: string;
  readonly mediaAlt: string;
  readonly primary: FeatureSpec;
  readonly secondary: FeatureSpec;
}

export interface InstagramAccount {
  readonly handle: string;
  readonly name: string;
  readonly description: string;
  readonly url: string;
}

export interface FaqEntry {
  readonly question: string;
  readonly answer: string;
}

export type NavAction =
  | { readonly id: string; readonly label: string; readonly kind: 'external'; readonly href: string }
  | { readonly id: string; readonly label: string; readonly kind: 'modal'; readonly modal: ModalKind }
  | { readonly id: string; readonly label: string; readonly kind: 'view' };

export type FooterLink =
  | { readonly id: string; readonly label: string; readonly kind: 'external'; readonly href: string }
  | { readonly id: string; readonly label: string; readonly kind: 'modal'; readonly modal: ModalKind };

export const SUPPORT_EMAIL = 'axiomcorp1@gmail.com' as const;
export const DISCORD_INVITE_URL = 'https://discord.com/invite/QmE5Ujv5J' as const;

export const NAV_ACTIONS: readonly NavAction[] = [
  { id: 'discord', label: 'Discord', kind: 'external', href: DISCORD_INVITE_URL },
  { id: 'instagram', label: 'Instagram (3)', kind: 'modal', modal: 'instagram' },
  { id: 'blog', label: 'Blog', kind: 'modal', modal: 'blog' },
  { id: 'about', label: 'About', kind: 'modal', modal: 'about' },
  { id: 'business', label: 'Business Model', kind: 'modal', modal: 'business' },
  { id: 'privacy', label: 'Privacy', kind: 'modal', modal: 'privacy' },
  { id: 'terms', label: 'Terms', kind: 'modal', modal: 'terms' }
] as const;

export const FOOTER_LINKS: readonly FooterLink[] = [
  { id: 'footer-discord', label: 'Discord', kind: 'external', href: DISCORD_INVITE_URL },
  { id: 'footer-instagram', label: 'Instagram (3)', kind: 'modal', modal: 'instagram' },
  { id: 'footer-blog', label: 'Blog', kind: 'modal', modal: 'blog' },
  { id: 'footer-business', label: 'Business Model', kind: 'modal', modal: 'business' },
  { id: 'footer-privacy', label: 'Privacy Policy', kind: 'modal', modal: 'privacy' },
  { id: 'footer-terms', label: 'Terms & Conditions', kind: 'modal', modal: 'terms' },
  { id: 'footer-refund', label: 'Refund Policy', kind: 'modal', modal: 'refund' },
  { id: 'footer-shipping', label: 'Shipping Policy', kind: 'modal', modal: 'shipping' }
] as const;

export const INSTAGRAM_ACCOUNTS: readonly InstagramAccount[] = [
  {
    handle: '@axiomcooperation',
    name: 'Axiom Cooperation',
    description: 'Official corporate parent company & technology division.',
    url: 'https://instagram.com/axiomcooperation'
  },
  {
    handle: '@myaxiomjournal',
    name: 'Axiom Trading Journal',
    description: 'Trading journal updates, analytics features, & trade reviews.',
    url: 'https://instagram.com/myaxiomjournal'
  },
  {
    handle: '@axiommarketingaganecy',
    name: 'Axiom Marketing Agency',
    description: 'Digital branding, growth, and media marketing.',
    url: 'https://instagram.com/axiommarketingaganecy'
  }
] as const;

export const FEATURE_PAIRS: readonly FeaturePair[] = [
  {
    id: 'logging-psychology',
    mediaSrc: '/1782052202366-motion_59.mp4',
    mediaAlt: 'Axiom Trading Journal trade logging and psychology tracking preview',
    primary: {
      title: 'Trade Logging',
      subtitle: 'Record entry/exit, strategy, and session automatically.'
    },
    secondary: {
      title: 'Psychology Tracking',
      subtitle: 'Log mindset and discipline for every trade.'
    }
  },
  {
    id: 'analytics-sizing',
    mediaSrc: '/2.webp',
    mediaAlt: 'Performance analytics equity curve and position size calculator interface',
    primary: {
      title: 'Performance Analytics',
      subtitle: 'Win/loss ratio and equity curve calculations.'
    },
    secondary: {
      title: 'Position Size Calculator',
      subtitle: 'Risk-based lot size suggestions instantly.'
    }
  },
  {
    id: 'accounts-security',
    mediaSrc: '/1.webp',
    mediaAlt: 'Multi-account dashboard and encrypted cloud storage overview',
    primary: {
      title: 'Multi-Account Support',
      subtitle: 'Track demo, live, and prop-firm accounts.'
    },
    secondary: {
      title: 'Secure Cloud Storage',
      subtitle: 'Encrypted data accessible from any device.'
    }
  }
] as const;

export const PAYMENT_STEPS: readonly string[] = [
  'Create a free account and start journaling at no cost.',
  'Click "Upgrade" to view paid-plan features and pricing.',
  'Redirected to secure checkout via our payment partner.',
  'Gateway confirms transaction and notifies our server.',
  'Account upgraded instantly with unlocked premium features.'
] as const;

export const FAQ_ENTRIES: readonly FaqEntry[] = [
  {
    question: 'Is Axiom Trading Journal free to use?',
    answer: 'Yes. Core trade-logging and analytics are free at no cost.'
  },
  {
    question: 'Can Forex traders in Pakistan use this journal?',
    answer: 'Yes. Built and operated in Pakistan for traders worldwide.'
  },
  {
    question: 'What does it calculate automatically?',
    answer: 'Pip movement, risk-to-reward, P&L, and hold time.'
  },
  {
    question: 'Can I track multiple trading accounts?',
    answer: 'Yes. Demo, live, and prop-firm accounts in one login.'
  }
] as const;
