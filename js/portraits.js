/**
 * Election 2028 — Portrait pipeline
 *
 * Real public-domain photos live in images/portraits/<id>.jpg (official
 * government portraits — see images/portraits/README.md for the exact
 * sources). The game works with zero photos present: every render point
 * falls back to the candidate's emoji automatically, and any photo dropped
 * into the folder lights up on the next load with no code changes.
 */
window.Portraits = {
    BASE: 'images/portraits/',

    // id → 'ok' | 'missing', learned at runtime so a missing file only
    // costs one 404 per session
    _status: {},
    // id → HTMLImageElement | null, for canvas draws (election-night wall)
    _images: {},

    url(id) { return this.BASE + id + '.jpg'; },

    /**
     * HTML for a portrait slot: the photo when it exists, the emoji when it
     * doesn't. Sized entirely by the wrapper it's placed in.
     */
    html(cand, cls) {
        if (!cand) return '';
        const emoji = cand.portraitEmoji || '🗳️';
        const id = cand.id || '';
        // Custom candidates never have photo files — skip the network probe
        if (!id || cand.isCustom || this._status[id] === 'missing') {
            return `<span class="portrait ${cls || ''} no-photo"><span class="portrait-emoji">${emoji}</span></span>`;
        }
        return `<span class="portrait ${cls || ''}">` +
            `<img src="${this.url(id)}" alt="" loading="lazy" draggable="false" ` +
            `onerror="Portraits.markMissing('${id}', this)">` +
            `<span class="portrait-emoji">${emoji}</span></span>`;
    },

    markMissing(id, imgEl) {
        this._status[id] = 'missing';
        if (imgEl) {
            const wrap = imgEl.closest('.portrait');
            if (wrap) wrap.classList.add('no-photo');
        }
    },

    /**
     * Async image load for canvas rendering. Resolves to the decoded image,
     * or null when no photo exists. Memoized per session.
     */
    load(id) {
        if (!id) return Promise.resolve(null);
        if (id in this._images) return Promise.resolve(this._images[id]);
        return new Promise(resolve => {
            const img = new Image();
            img.onload = () => { this._images[id] = img; this._status[id] = 'ok'; resolve(img); };
            img.onerror = () => { this._images[id] = null; this._status[id] = 'missing'; resolve(null); };
            img.src = this.url(id);
        });
    },

    /**
     * Draw a circular headshot onto a 2D canvas context, or nothing if the
     * photo isn't loaded yet / doesn't exist. Returns true if drawn.
     */
    drawCircle(ctx2d, id, x, y, r, ringColor) {
        const img = this._images[id];
        if (!img) return false;
        ctx2d.save();
        ctx2d.beginPath();
        ctx2d.arc(x, y, r, 0, Math.PI * 2);
        ctx2d.closePath();
        ctx2d.clip();
        // Cover-fit: crop to the top-center of the photo (faces sit high)
        const s = Math.max((r * 2) / img.width, (r * 2) / img.height);
        const w = img.width * s, h = img.height * s;
        ctx2d.drawImage(img, x - w / 2, y - r, w, h);
        ctx2d.restore();
        if (ringColor) {
            ctx2d.strokeStyle = ringColor;
            ctx2d.lineWidth = Math.max(2, r * 0.09);
            ctx2d.beginPath();
            ctx2d.arc(x, y, r, 0, Math.PI * 2);
            ctx2d.stroke();
        }
        return true;
    },
};
