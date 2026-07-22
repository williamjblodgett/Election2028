/**
 * Election 2028 — deterministic random number generator.
 * The seed and cursor live in the serialized game state, so reloading a save
 * never silently changes the outcome stream.
 */
window.GameRandom = {
    createSeed() {
        const now = Date.now() >>> 0;
        const entropy = (typeof crypto !== 'undefined' && crypto.getRandomValues)
            ? crypto.getRandomValues(new Uint32Array(1))[0]
            : Math.floor(Math.random() * 0xffffffff);
        return (now ^ entropy) >>> 0 || 0x6d2b79f5;
    },

    next(state) {
        if (!state) return Math.random();
        state.seed = (state.seed >>> 0) || 0x6d2b79f5;
        state.cursor = (state.cursor || 0) + 1;
        let t = state.seed += 0x6d2b79f5;
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    },

    int(state, min, max) {
        return Math.floor(this.next(state) * (max - min + 1)) + min;
    },

    pick(state, items) {
        return items && items.length ? items[Math.floor(this.next(state) * items.length)] : null;
    },
};
