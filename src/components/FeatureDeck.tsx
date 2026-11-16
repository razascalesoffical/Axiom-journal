import React from 'react';
import { FEATURE_PAIRS, FeaturePair } from '../data/content';

const IMAGE_PATTERN = /\.(webp|jpe?g|png)$/i;

function FeatureMedia({ src, alt }: { readonly src: string; readonly alt: string }) {
  if (IMAGE_PATTERN.test(src)) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
      />
    );
  }

  return (
    <video
      src={src}
      aria-label={alt}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
    />
  );
}

function FeatureCard({ pair }: { readonly pair: FeaturePair }) {
  return (
    <article className="flex flex-col gap-4 py-[18px] border-t border-[#2a2a2a]">
      <div className="h-[160px] rounded-[2px] overflow-hidden bg-[#0a0a0a]">
        <FeatureMedia src={pair.mediaSrc} alt={pair.mediaAlt} />
      </div>
      <div className="flex flex-col gap-6 px-1">
        <div className="flex justify-between gap-4 text-[12px]">
          <h3 className="text-[#f6eedb] font-bold whitespace-pre-line">{pair.primary.title}</h3>
          <p className="text-[11px] text-right text-[#8a8a8a] whitespace-pre-line">
            {pair.primary.subtitle}
          </p>
        </div>
        <div className="flex justify-between gap-4 pt-4 border-t border-[#1c1c1c] text-[12px]">
          <h3 className="text-[#f6eedb] font-bold whitespace-pre-line">{pair.secondary.title}</h3>
          <p className="text-[11px] text-right text-[#8a8a8a] whitespace-pre-line">
            {pair.secondary.subtitle}
          </p>
        </div>
      </div>
    </article>
  );
}

export function FeatureDeck({ className = '' }: { readonly className?: string }) {
  return (
    <section className={className} aria-label="Core Features">
      <h2 className="mb-4 text-[11px] tracking-wider uppercase text-[#8a8a8a]">Core Features</h2>
      {FEATURE_PAIRS.map(pair => (
        <FeatureCard key={pair.id} pair={pair} />
      ))}
    </section>
  );
}
