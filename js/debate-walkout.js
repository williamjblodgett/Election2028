/**
 * Election 2028 — 2D debate walkout.
 * Portrait-driven broadcast animation with no WebGL dependency.
 */
window.DebateWalkout = {
    APPEARANCES: {}, // retained for old custom saves and legend registration
    _state: null,

    play(container, playerCand, oppCand, onDone) {
        let finished = false;
        const finish = () => {
            if (finished) return;
            finished = true;
            this._cleanup();
            if (typeof onDone === 'function') onDone();
        };
        if (!container) return finish();
        const pLast = playerCand.name.split(' ').pop();
        const oLast = oppCand.name.split(' ').pop();
        container.innerHTML = `
            <div class="walkout-2d-stage">
                <div class="walkout-2d-lights"></div>
                <div class="walkout-bug"><span class="walkout-live"><span class="walkout-live-dot"></span>LIVE</span> DECISION 2028 · DEBATE STAGE</div>
                <button class="walkout-skip" id="walkout-2d-skip">SKIP INTRO ⏭</button>
                <div class="walkout-2d-title"><span>PRESIDENTIAL DEBATE</span><strong>THE CANDIDATES TAKE THE STAGE</strong></div>
                <div class="walkout-2d-candidate player" style="--walkout-accent:${playerCand.color || '#2166d4'}">
                    <div class="walkout-portrait">${window.Portraits.html(playerCand)}</div>
                    <div class="walkout-name">${pLast.toUpperCase()}<small>${playerCand.title || 'PRESIDENTIAL CANDIDATE'}</small></div>
                </div>
                <div class="walkout-2d-candidate opponent" style="--walkout-accent:${oppCand.color || '#d42121'}">
                    <div class="walkout-portrait">${window.Portraits.html(oppCand)}</div>
                    <div class="walkout-name">${oLast.toUpperCase()}<small>${oppCand.title || 'PRESIDENTIAL CANDIDATE'}</small></div>
                </div>
                <div class="walkout-2d-podium left"></div><div class="walkout-2d-podium right"></div>
                <div class="walkout-fade"></div>
            </div>`;
        container.querySelector('#walkout-2d-skip').onclick = finish;
        const stage = container.querySelector('.walkout-2d-stage');
        requestAnimationFrame(() => stage && stage.classList.add('is-live'));
        const finishTimer = setTimeout(() => {
            if (stage) stage.classList.add('is-ending');
            setTimeout(finish, 550);
        }, 4600);
        this._state = { container, finishTimer };
    },

    _cleanup() {
        if (!this._state) return;
        clearTimeout(this._state.finishTimer);
        this._state = null;
    },
};
