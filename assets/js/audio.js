/**
 * Our Story — Global Audio Engine
 * ─────────────────────────────────────────────────────────
 * Features:
 *   01. Web Audio API — two ping-pong <audio> sources through
 *       GainNodes for smooth crossfading between chapters.
 *   02. IntersectionObserver — detects which chapter is in
 *       the center of the viewport and triggers crossfade.
 *   03. Sound-wave visualizer — animated SVG bars in the
 *       bottom-right corner act as a Mute / Unmute toggle.
 *   04. Graceful fail — missing audio files are silently
 *       skipped; no errors are thrown.
 *
 * Audio files expected at:
 *   assets/audio/chapter-01.mp3 … chapter-12.mp3
 *
 * Load order: after chapters.js (chapters must be in DOM)
 * ─────────────────────────────────────────────────────────
 */

(function () {
    'use strict';

    // ─────────────────────────────────────────────────────────
    // CONFIG
    // ─────────────────────────────────────────────────────────
    const CROSSFADE_DURATION = 0.9;   // seconds
    const START_VOLUME = 0.55;  // ambient — not loud
    const FADE_INTERVAL_MS = 16;    // ~60fps for gain ramp

    // Center-detection margin: chapter must occupy the middle
    // 30% of the viewport to be considered "active"
    const CENTER_MARGIN = '-35% 0px -35% 0px';

    // ─────────────────────────────────────────────────────────
    // STATE
    // ─────────────────────────────────────────────────────────
    let audioCtx = null;
    let masterGain = null;
    let isMuted = false;
    let isUnlocked = false;
    let currentUrl = null;

    // Two ping-pong slots
    const slots = [
        { audio: null, gain: null, active: false },
        { audio: null, gain: null, active: false },
    ];
    let activeSlot = 0; // index of currently playing slot

    // ─────────────────────────────────────────────────────────
    // 01. AUDIO CONTEXT SETUP
    // ─────────────────────────────────────────────────────────
    function initAudioContext() {
        if (audioCtx) return;

        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(START_VOLUME, audioCtx.currentTime);
        masterGain.connect(audioCtx.destination);

        // Create two slots
        slots.forEach((slot, i) => {
            const audio = new Audio();
            audio.loop = true;
            audio.crossOrigin = 'anonymous';
            audio.preload = 'auto';

            let source;
            try {
                source = audioCtx.createMediaElementSource(audio);
            } catch (e) {
                console.warn('[audio.js] Could not create media element source:', e);
                return;
            }

            const gain = audioCtx.createGain();
            gain.gain.setValueAtTime(0, audioCtx.currentTime);
            source.connect(gain);
            gain.connect(masterGain);

            slot.audio = audio;
            slot.gain = gain;
        });
    }

    // ─────────────────────────────────────────────────────────
    // 02. USER GESTURE UNLOCK
    // Browsers require a user gesture before AudioContext runs.
    // We listen for the first interaction and resume the context.
    // ─────────────────────────────────────────────────────────
    function unlockAudio() {
        if (isUnlocked) return;

        const unlock = () => {
            if (isUnlocked) return;
            initAudioContext();

            if (audioCtx.state === 'suspended') {
                audioCtx.resume().then(() => {
                    isUnlocked = true;
                    // Start playing from the chapter currently in view
                    if (currentUrl) {
                        _startPlayback(currentUrl);
                    }
                    // Stop listening once unlocked
                    UNLOCK_EVENTS.forEach((evt) =>
                        window.removeEventListener(evt, unlock)
                    );
                });
            } else {
                isUnlocked = true;
                if (currentUrl) _startPlayback(currentUrl);
                UNLOCK_EVENTS.forEach((evt) =>
                    window.removeEventListener(evt, unlock)
                );
            }
        };

        const UNLOCK_EVENTS = ['click', 'keydown', 'touchstart', 'scroll'];
        UNLOCK_EVENTS.forEach((evt) =>
            window.addEventListener(evt, unlock, { once: false, passive: true })
        );
    }

    // ─────────────────────────────────────────────────────────
    // 03. CROSSFADE ENGINE
    // ─────────────────────────────────────────────────────────

    /**
     * Smoothly ramp a GainNode from `from` to `to` over `duration` seconds.
     */
    function rampGain(gainNode, from, to, duration) {
        const now = audioCtx.currentTime;
        gainNode.gain.cancelScheduledValues(now);
        gainNode.gain.setValueAtTime(from, now);
        gainNode.gain.linearRampToValueAtTime(to, now + duration);
    }

    /**
     * Internal: actually start a URL playing (called after unlock).
     */
    function _startPlayback(url) {
        if (!audioCtx || !isUnlocked) return;

        const incoming = slots[activeSlot];
        if (!incoming.audio) return;

        incoming.audio.src = url;
        incoming.audio.currentTime = 0;

        const playPromise = incoming.audio.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // File not found — silent fail
            });
        }

        rampGain(incoming.gain, 0, 1, CROSSFADE_DURATION);
    }

    /**
     * Public: crossfade to a new URL.
     * If the URL is unchanged, does nothing.
     * If context is not yet unlocked, stores the URL for later.
     */
    function crossfadeTo(url) {
        if (!url || url === currentUrl) return;
        currentUrl = url;

        if (!isUnlocked) return; // will play after first gesture

        const outgoingIdx = activeSlot;
        const incomingIdx = (activeSlot + 1) % 2;
        activeSlot = incomingIdx;

        const outgoing = slots[outgoingIdx];
        const incoming = slots[incomingIdx];

        if (!incoming.audio) return;

        // Set up incoming track
        incoming.audio.src = url;
        incoming.audio.currentTime = 0;

        const playPromise = incoming.audio.play();
        if (playPromise !== undefined) {
            playPromise
                .then(() => {
                    // Crossfade: outgoing fades out, incoming fades in
                    if (outgoing.audio && !outgoing.audio.paused) {
                        rampGain(outgoing.gain, outgoing.gain.gain.value, 0, CROSSFADE_DURATION);
                        setTimeout(() => {
                            outgoing.audio.pause();
                            outgoing.gain.gain.setValueAtTime(0, audioCtx.currentTime);
                        }, CROSSFADE_DURATION * 1000);
                    }
                    rampGain(incoming.gain, 0, 1, CROSSFADE_DURATION);
                })
                .catch(() => {
                    // File not yet added — skip silently
                    currentUrl = null;
                });
        }
    }

    // ─────────────────────────────────────────────────────────
    // 04. MUTE / UNMUTE
    // ─────────────────────────────────────────────────────────
    function setMuted(muted) {
        isMuted = muted;
        if (!masterGain) return;
        const now = audioCtx.currentTime;
        masterGain.gain.cancelScheduledValues(now);
        masterGain.gain.setValueAtTime(masterGain.gain.value, now);
        masterGain.gain.linearRampToValueAtTime(
            muted ? 0 : START_VOLUME,
            now + 0.4
        );
    }

    // ─────────────────────────────────────────────────────────
    // 05. CHAPTER OBSERVER
    // Watches each rendered chapter and crossfades when the
    // chapter hits the center 30% of the viewport.
    // ─────────────────────────────────────────────────────────
    function initChapterObserver() {
        const chapters = window.relationshipChapters;
        if (!chapters || !chapters.length) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) return;
                    const chapterNum = entry.target.getAttribute('data-chapter');
                    const chapterData = chapters.find(
                        (c) => c.chapterNumber === chapterNum
                    );
                    if (chapterData && chapterData.songUrl) {
                        crossfadeTo(chapterData.songUrl);
                    }
                });
            },
            {
                rootMargin: CENTER_MARGIN,
                threshold: 0,
            }
        );

        // Observe each rendered chapter article
        const observeChapters = () => {
            document.querySelectorAll('.chapter[data-chapter]').forEach((el) => {
                observer.observe(el);
            });
        };

        // Chapters might not be in DOM yet — wait a tick
        if (document.querySelectorAll('.chapter').length > 0) {
            observeChapters();
        } else {
            setTimeout(observeChapters, 300);
        }
    }

    // ─────────────────────────────────────────────────────────
    // 06. SOUND-WAVE VISUALIZER BUTTON
    // ─────────────────────────────────────────────────────────
    function buildVisualizerButton() {
        const btn = document.getElementById('sound-toggle');
        if (!btn) return;

        btn.setAttribute('aria-label', 'Toggle ambient audio');
        btn.setAttribute('aria-pressed', 'false');
        btn.title = 'Toggle ambient music';

        // Add click handler
        btn.addEventListener('click', () => {
            isMuted = !isMuted;
            setMuted(isMuted);
            btn.setAttribute('aria-pressed', String(isMuted));
            btn.classList.toggle('is-muted', isMuted);

            // Show tooltip briefly
            const tip = btn.querySelector('.sound-toggle__tip');
            if (tip) {
                tip.textContent = isMuted ? 'Muted' : 'Playing';
                tip.classList.add('is-visible');
                setTimeout(() => tip.classList.remove('is-visible'), 1600);
            }
        });
    }

    // ─────────────────────────────────────────────────────────
    // INIT
    // ─────────────────────────────────────────────────────────
    function init() {
        unlockAudio();
        initChapterObserver();
        buildVisualizerButton();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for external use
    window.audioEngine = { crossfadeTo, setMuted };

})();
