'use client';

import React, { useState } from 'react';
import { useSayPulse } from './SayPulseProvider';

const QUICK_TAGS_3_OR_LESS = ['Bug / Error', 'Slow / Laggy', 'Confusing UI', 'Missing Feature'];
const QUICK_TAGS_4_OR_5 = ['Loved the UX', 'Fast & Smooth', 'Helpful AI', 'Great Design'];

// ──────────────────────────────────────────────────────────────────────────────
// StarRatingPopover
// Rating popover: 1-5 stars, quick tags, and direct voice feedback prompt
// ──────────────────────────────────────────────────────────────────────────────
export function StarRatingPopover() {
  const {
    phase,
    setPhase,
    rating,
    setRating,
    setQuickTags,
  } = useSayPulse();

  const [hoveredStar, setHoveredStar] = useState(0);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  const handleStarClick = (star: number) => {
    setRating(star);
    if (star <= 3) {
      setPhase('sub_rating');
    }
  };

  const activeTags = rating >= 4 ? QUICK_TAGS_4_OR_5 : QUICK_TAGS_3_OR_LESS;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag],
    );
  };

  const proceedToMic = () => {
    setQuickTags(selectedTags);
    setPhase('recording');
  };

  const starColor = (i: number) => {
    const active = hoveredStar ? i <= hoveredStar : i <= rating;
    if (!active) return '#334155';
    return rating && rating <= 3 ? '#F59E0B' : '#10B981';
  };

  return (
    <div style={styles.popover}>
      {/* Header */}
      <p style={styles.title}>How's your experience? 🎯</p>
      <p style={styles.sub}>Tap a star to rate</p>

      {/* Stars */}
      <div style={styles.starRow} role="group" aria-label="Rating stars">
        {[1, 2, 3, 4, 5].map((i) => (
          <button
            key={i}
            aria-label={`${i} star${i > 1 ? 's' : ''}`}
            onClick={() => handleStarClick(i)}
            onMouseEnter={() => setHoveredStar(i)}
            onMouseLeave={() => setHoveredStar(0)}
            style={{ ...styles.starBtn, color: starColor(i) }}
          >
            ★
          </button>
        ))}
      </div>

      {/* Rating Label */}
      {rating > 0 && (
        <p style={{ ...styles.ratingLabel, color: rating <= 3 ? '#F59E0B' : '#10B981' }}>
          {rating === 1 && 'Very Unsatisfied'}
          {rating === 2 && 'Unsatisfied'}
          {rating === 3 && 'Neutral'}
          {rating === 4 && 'Satisfied'}
          {rating === 5 && 'Very Satisfied! 🎉'}
        </p>
      )}

      {/* Quick tags section */}
      {rating > 0 && (phase === 'sub_rating' || rating >= 4) && (
        <>
          <div style={styles.divider} />
          <p style={styles.tagsTitle}>
            {rating <= 3 ? 'What went wrong? (optional)' : 'What went well? (optional)'}
          </p>
          <div style={styles.tagRow}>
            {activeTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                style={{
                  ...styles.tagBtn,
                  background: selectedTags.includes(tag) ? '#06B6D4' : '#1E293B',
                  color: selectedTags.includes(tag) ? '#fff' : '#94A3B8',
                  border: selectedTags.includes(tag)
                    ? '1px solid #06B6D4'
                    : '1px solid #334155',
                }}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* Proceed to mic */}
          <button onClick={proceedToMic} style={styles.micBtn}>
            🎙️ Tell us more with voice
          </button>
          <button onClick={() => setPhase('idle')} style={styles.skipBtn}>
            Skip
          </button>
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  popover: {
    position: 'fixed',
    bottom: 96,
    right: 24,
    width: 310,
    background: '#0F172A',
    borderRadius: 18,
    padding: '20px 20px 16px',
    boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
    border: '1px solid #1E293B',
    zIndex: 10001,
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  title: {
    color: '#F1F5F9',
    fontSize: 15,
    fontWeight: 600,
    margin: '0 0 2px',
  },
  sub: {
    color: '#64748B',
    fontSize: 12,
    margin: '0 0 14px',
  },
  starRow: {
    display: 'flex',
    gap: 6,
    marginBottom: 8,
  },
  starBtn: {
    background: 'none',
    border: 'none',
    fontSize: 32,
    cursor: 'pointer',
    transition: 'color 0.12s, transform 0.1s',
    padding: 0,
    lineHeight: 1,
  },
  ratingLabel: {
    fontSize: 12,
    fontWeight: 600,
    margin: '4px 0 0',
  },
  divider: {
    height: 1,
    background: '#1E293B',
    margin: '14px -20px',
  },
  tagsTitle: {
    color: '#94A3B8',
    fontSize: 12,
    margin: '0 0 8px',
    fontWeight: 500,
  },
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  tagBtn: {
    fontSize: 12,
    borderRadius: 20,
    padding: '4px 12px',
    cursor: 'pointer',
    transition: 'all 0.15s',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
  micBtn: {
    width: '100%',
    padding: '10px 0',
    background: 'linear-gradient(135deg,#06B6D4,#6366F1)',
    border: 'none',
    borderRadius: 10,
    color: '#fff',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
    marginBottom: 8,
  },
  skipBtn: {
    width: '100%',
    padding: '6px 0',
    background: 'transparent',
    border: 'none',
    color: '#475569',
    fontSize: 12,
    cursor: 'pointer',
    fontFamily: 'Inter, system-ui, sans-serif',
  },
};
