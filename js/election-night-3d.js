/**
 * Election 2028 — 3D Election Night Cutscene
 * A cinematic GNN Decision Desk broadcast: two anchors at a studio desk in
 * front of a live video wall showing the real results — the national map
 * filling in, the electoral-vote race chart over time, and the road to 270.
 * Playable at 1x, fast-forwardable at 4x, or skippable. Always degrades to
 * onDone() (the 2D recap) if WebGL/Three isn't available.
 */
window.ElectionNight3D = {

    play(container, nightData, gs, onDone) {
        let finished = false;
        const finish = () => {
            if (finished) return;
            finished = true;
            try { this._cleanup(); } catch (e) { /* ignore */ }
            if (typeof onDone === 'function') onDone();
        };

        if (!window.THREE || !container || !nightData || !nightData.calls) return finish();
        const THREE = window.THREE;

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true });
            if (!renderer || !renderer.getContext()) throw new Error('no gl');
        } catch (e) {
            return finish();
        }

        const W = container.clientWidth || 1000;
        const H = container.clientHeight || 560;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(W, H);
        container.appendChild(renderer.domElement);

        // ── Broadcast data ──
        const results = nightData.results;
        const pLast = results.playerName.split(' ').pop();
        const oLast = results.opponentName.split(' ').pop();
        const pColor = gs.playerCandidate.color || '#2166d4';
        const oColor = gs.opponentCandidate.color || '#d42121';
        // Preload real headshots for the video wall (no-op when absent)
        const pId = gs.playerCandidate.id, oId = gs.opponentCandidate.id;
        if (window.Portraits) { window.Portraits.load(pId); window.Portraits.load(oId); }
        const anchors = (window.DebateContent && window.DebateContent.moderators) || [{ name: 'Dana Whitfield' }, { name: 'Marcus Cole' }];
        const anchorA = anchors[0].name, anchorB = (anchors[1] || anchors[0]).name;

        // ── Timeline: poll-close waves + projections, sorted by sim-minute ──
        const waveMinutes = { '7:00 PM': 0, '7:30 PM': 30, '8:00 PM': 60, '9:00 PM': 120, '10:00 PM': 180, '11:00 PM': 240, '1:00 AM': 360 };
        const timeline = [];
        timeline.push({ t: -1, type: 'open' });
        for (const [label, ids] of Object.entries(window.GameConstants.POLL_CLOSE_TIMES)) {
            timeline.push({ t: waveMinutes[label] || 0, type: 'wave', label, count: ids.length });
        }
        for (const call of nightData.calls) {
            if (call.tooCloseToCall) timeline.push({ t: call.closeMinutes + 5, type: 'tooclose', call });
            timeline.push({ t: call.callMinutes, type: 'call', call });
        }
        timeline.sort((a, b) => a.t - b.t);
        const lastT = timeline[timeline.length - 1].t + 20;

        // ── DOM overlays: controls, clock, captions, chyron ──
        const dom = {};
        const mk = (cls, html) => { const el = document.createElement('div'); el.className = cls; if (html) el.innerHTML = html; container.appendChild(el); return el; };
        dom.bug = mk('walkout-bug', '<span class="walkout-live"><span class="walkout-live-dot"></span>LIVE</span> GNN · ELECTION NIGHT IN AMERICA');
        dom.clock = mk('cutscene-clock', '7:00 PM ET');
        dom.caption = mk('cutscene-caption');
        dom.chyron = mk('cutscene-chyron');
        dom.controls = mk('cutscene-controls',
            '<button id="cut-speed" class="cutscene-btn">⏩ 4×</button>' +
            '<button id="cut-skip" class="cutscene-btn">⏭ SKIP TO RESULTS</button>');
        let speed = 1;
        dom.controls.querySelector('#cut-speed').onclick = (e) => {
            speed = speed === 1 ? 4 : 1;
            e.target.textContent = speed === 1 ? '⏩ 4×' : '▶ 1×';
        };
        dom.controls.querySelector('#cut-skip').onclick = finish;

        // ── Scene ──
        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x04060d);
        scene.fog = new THREE.Fog(0x04060d, 18, 45);

        const camera = new THREE.PerspectiveCamera(48, W / H, 0.1, 100);

        scene.add(new THREE.AmbientLight(0x3a4a6a, 0.8));
        const key = new THREE.DirectionalLight(0xfff2e0, 0.9);
        key.position.set(-3, 10, 12);
        scene.add(key);
        const blueRim = new THREE.PointLight(0x2166d4, 1.4, 30);
        blueRim.position.set(-10, 6, 2);
        scene.add(blueRim);
        const redRim = new THREE.PointLight(0xd42121, 1.4, 30);
        redRim.position.set(10, 6, 2);
        scene.add(redRim);

        // Floor
        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(60, 0.4, 40),
            new THREE.MeshStandardMaterial({ color: 0x0a1224, roughness: 0.25, metalness: 0.6 })
        );
        floor.position.y = -0.2;
        scene.add(floor);

        // Hanging studio light bars
        for (const x of [-8, 0, 8]) {
            const bar = new THREE.Mesh(
                new THREE.BoxGeometry(5, 0.18, 0.5),
                new THREE.MeshStandardMaterial({ color: 0x222c44, emissive: 0x8899ff, emissiveIntensity: 0.7 })
            );
            bar.position.set(x, 8.5, 2);
            scene.add(bar);
        }

        // ── Anchor desk: curved front, glass top, emissive brand strip ──
        const deskGroup = new THREE.Group();
        const deskMat = new THREE.MeshStandardMaterial({ color: 0x142038, roughness: 0.35, metalness: 0.5 });
        const deskFront = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.6, 1.15, 32, 1, true, Math.PI * 0.62, Math.PI * 0.76), deskMat);
        deskFront.position.y = 0.58;
        deskGroup.add(deskFront);
        const deskTop = new THREE.Mesh(
            new THREE.CylinderGeometry(3.5, 3.5, 0.09, 32, 1, false, Math.PI * 0.58, Math.PI * 0.84),
            new THREE.MeshStandardMaterial({ color: 0x1d3050, roughness: 0.15, metalness: 0.7 })
        );
        deskTop.position.y = 1.18;
        deskGroup.add(deskTop);
        // Brand strip on the desk front
        const brandCv = document.createElement('canvas');
        brandCv.width = 512; brandCv.height = 64;
        const bctx = brandCv.getContext('2d');
        bctx.fillStyle = '#0a1430'; bctx.fillRect(0, 0, 512, 64);
        bctx.fillStyle = '#e8ecf4'; bctx.font = 'bold 34px sans-serif'; bctx.textAlign = 'center'; bctx.textBaseline = 'middle';
        bctx.fillText('GNN  ·  DECISION DESK 2028', 256, 33);
        const brand = new THREE.Mesh(
            new THREE.PlaneGeometry(4.6, 0.55),
            new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(brandCv), emissive: 0xffffff, emissiveMap: new THREE.CanvasTexture(brandCv), emissiveIntensity: 0.55 })
        );
        brand.position.set(0, 0.62, 3.48);
        deskGroup.add(brand);
        deskGroup.position.set(0, 0, 3.2);
        scene.add(deskGroup);

        // ── Anchors (seated: torso up, arms on desk) ──
        const anchorL = this._buildAnchor(THREE, {
            skin: 0xdfae86, hair: 0x241a12, style: 'bob', jacket: 0x6b1f33, tie: null, pearls: true,
        });
        anchorL.position.set(-1.15, 0.45, 3.15);
        scene.add(anchorL);
        const anchorR = this._buildAnchor(THREE, {
            skin: 0xe6bd97, hair: 0xb9bdc4, style: 'side', jacket: 0x18223a, tie: 0xa01a1a, pearls: false,
        });
        anchorR.position.set(1.15, 0.45, 3.15);
        scene.add(anchorR);

        // ── Video wall with live canvas texture ──
        const wallCv = document.createElement('canvas');
        wallCv.width = 1024; wallCv.height = 512;
        const wctx = wallCv.getContext('2d');
        const wallTex = new THREE.CanvasTexture(wallCv);
        const wall = new THREE.Mesh(
            new THREE.PlaneGeometry(14, 7),
            new THREE.MeshStandardMaterial({ map: wallTex, emissive: 0xffffff, emissiveMap: wallTex, emissiveIntensity: 0.85, roughness: 0.6 })
        );
        wall.position.set(0, 4.4, -3.5);
        scene.add(wall);
        // Side dressing panels
        for (const [x, col] of [[-10.5, '#16295a'], [10.5, '#5a1620']]) {
            const cv = document.createElement('canvas');
            cv.width = 64; cv.height = 256;
            const c2 = cv.getContext('2d');
            const g = c2.createLinearGradient(0, 0, 0, 256);
            g.addColorStop(0, col); g.addColorStop(1, '#06090f');
            c2.fillStyle = g; c2.fillRect(0, 0, 64, 256);
            const panel = new THREE.Mesh(
                new THREE.PlaneGeometry(4, 7),
                new THREE.MeshStandardMaterial({ map: new THREE.CanvasTexture(cv), emissive: 0xffffff, emissiveMap: new THREE.CanvasTexture(cv), emissiveIntensity: 0.5 })
            );
            panel.position.set(x, 4.4, -3.2);
            panel.rotation.y = x < 0 ? 0.35 : -0.35;
            scene.add(panel);
        }

        // ── Wall painter: map + EV chart over time + road to 270 + ticker ──
        const called = {}; // stateId -> 'player' | 'opponent'
        const evSeries = [{ t: 0, p: 0, o: 0 }];
        let evP = 0, evO = 0, lastCallText = 'Polls are closing across the East…', flashState = null, flashUntil = 0;
        let projectionCard = null;

        const mapPaths = {};
        for (const [abbr, data] of Object.entries(window.USMapPaths.states)) {
            try { mapPaths[abbr] = new Path2D(data.d); } catch (e) { /* skip */ }
        }
        const partyFill = (winner) => winner === 'player'
            ? (gs.playerParty === 'democrat' ? '#2166d4' : '#d42121')
            : (gs.playerParty === 'democrat' ? '#d42121' : '#2166d4');

        const paintWall = (simMin) => {
            const w = wallCv.width, h = wallCv.height;
            wctx.fillStyle = '#060b18';
            wctx.fillRect(0, 0, w, h);

            if (projectionCard) {
                // Full-screen projection card at 270
                wctx.fillStyle = projectionCard.color;
                wctx.globalAlpha = 0.22; wctx.fillRect(0, 0, w, h); wctx.globalAlpha = 1;
                wctx.fillStyle = '#ff2a2a'; wctx.fillRect(0, 40, w, 54);
                wctx.fillStyle = '#fff'; wctx.font = 'bold 34px sans-serif'; wctx.textAlign = 'center';
                wctx.fillText('GNN PROJECTION', w / 2, 78);
                if (window.Portraits) {
                    const winId = projectionCard.name === results.playerName ? pId : oId;
                    window.Portraits.drawCircle(wctx, winId, w / 2, 148, 44, projectionCard.color);
                }
                wctx.fillStyle = '#fff'; wctx.font = 'bold 58px sans-serif';
                wctx.fillText(projectionCard.name.toUpperCase(), w / 2, 220);
                wctx.font = 'bold 40px sans-serif';
                wctx.fillText('ELECTED PRESIDENT', w / 2, 285);
                wctx.font = '28px monospace'; wctx.fillStyle = '#ffd75e';
                wctx.fillText(`${projectionCard.ev} ELECTORAL VOTES`, w / 2, 350);
                wallTex.needsUpdate = true;
                return;
            }

            // Header strip
            wctx.fillStyle = '#0d1834';
            wctx.fillRect(0, 0, w, 44);
            wctx.fillStyle = '#e8ecf4'; wctx.font = 'bold 24px sans-serif'; wctx.textAlign = 'left';
            wctx.fillText('ELECTION NIGHT IN AMERICA', 18, 30);
            wctx.textAlign = 'right'; wctx.fillStyle = '#ffd75e'; wctx.font = 'bold 22px monospace';
            wctx.fillText(this._clockLabel(simMin), w - 18, 30);

            // ── Left: national map (975x610 → fit 520x330) ──
            wctx.save();
            wctx.translate(10, 66);
            const sc = 520 / 975;
            wctx.scale(sc, sc);
            for (const [abbr, path] of Object.entries(mapPaths)) {
                const winner = called[abbr];
                wctx.fillStyle = winner
                    ? (flashState === abbr && simMin < flashUntil ? '#ffffff' : partyFill(winner))
                    : '#2a3550';
                wctx.fill(path);
                wctx.strokeStyle = 'rgba(255,255,255,0.18)';
                wctx.lineWidth = 1.5;
                wctx.stroke(path);
            }
            wctx.restore();

            // ── Right top: EV race chart over time ──
            const cx0 = 560, cy0 = 66, cw = 444, ch = 240;
            wctx.fillStyle = '#0a1226'; wctx.fillRect(cx0, cy0, cw, ch);
            wctx.strokeStyle = 'rgba(255,255,255,0.15)'; wctx.strokeRect(cx0, cy0, cw, ch);
            wctx.fillStyle = '#8899b3'; wctx.font = 'bold 15px sans-serif'; wctx.textAlign = 'left';
            wctx.fillText('ELECTORAL VOTES THROUGH THE NIGHT', cx0 + 10, cy0 + 20);
            const xFor = (t) => cx0 + 8 + (Math.min(t, lastT) / lastT) * (cw - 16);
            const yFor = (ev) => cy0 + ch - 10 - (ev / 538) * (ch - 40);
            // 270 line
            wctx.strokeStyle = '#ffd75e'; wctx.setLineDash([5, 5]);
            wctx.beginPath(); wctx.moveTo(cx0 + 8, yFor(270)); wctx.lineTo(cx0 + cw - 8, yFor(270)); wctx.stroke();
            wctx.setLineDash([]);
            wctx.fillStyle = '#ffd75e'; wctx.font = '12px monospace';
            wctx.fillText('270', cx0 + 12, yFor(270) - 4);
            // Stepped race lines
            const drawSeries = (keyName, color) => {
                wctx.strokeStyle = color; wctx.lineWidth = 3;
                wctx.beginPath();
                let px = xFor(0), py = yFor(0);
                wctx.moveTo(px, py);
                for (const pt of evSeries) {
                    const nx = xFor(pt.t), ny = yFor(pt[keyName]);
                    wctx.lineTo(nx, py); // step across
                    wctx.lineTo(nx, ny); // step up
                    px = nx; py = ny;
                }
                wctx.lineTo(xFor(simMin), py); // extend to "now"
                wctx.stroke();
            };
            drawSeries('p', pColor);
            drawSeries('o', oColor);
            wctx.lineWidth = 1;

            // ── Right bottom: road to 270 (with headshots when photos exist) ──
            const by = cy0 + ch + 24;
            const P = window.Portraits;
            const pShot = P && P.drawCircle(wctx, pId, cx0 + 20, by + 22, 22, pColor);
            const oShot = P && P.drawCircle(wctx, oId, cx0 + cw - 20, by + 22, 22, oColor);
            const pX = pShot ? cx0 + 52 : cx0;
            const oX = oShot ? cx0 + cw - 52 : cx0 + cw;
            wctx.fillStyle = '#e8ecf4'; wctx.font = 'bold 17px sans-serif'; wctx.textAlign = 'left';
            wctx.fillText(pLast.toUpperCase(), pX, by);
            wctx.textAlign = 'right';
            wctx.fillText(oLast.toUpperCase(), oX, by);
            wctx.textAlign = 'left'; wctx.font = 'bold 40px monospace';
            wctx.fillStyle = pColor; wctx.fillText(String(evP), pX, by + 42);
            wctx.textAlign = 'right';
            wctx.fillStyle = oColor; wctx.fillText(String(evO), oX, by + 42);
            // Bar
            const barY = by + 56, barH = 22;
            wctx.fillStyle = '#1a2440'; wctx.fillRect(cx0, barY, cw, barH);
            wctx.fillStyle = pColor; wctx.fillRect(cx0, barY, (evP / 538) * cw, barH);
            wctx.fillStyle = oColor; wctx.fillRect(cx0 + cw - (evO / 538) * cw, barY, (evO / 538) * cw, barH);
            wctx.fillStyle = '#ffd75e'; wctx.fillRect(cx0 + (270 / 538) * cw - 1, barY - 4, 3, barH + 8);

            // ── Ticker strip ──
            wctx.fillStyle = '#a01a1a'; wctx.fillRect(0, h - 40, w, 40);
            wctx.fillStyle = '#fff'; wctx.font = 'bold 20px sans-serif'; wctx.textAlign = 'left';
            wctx.fillText(lastCallText.toUpperCase().slice(0, 88), 16, h - 13);

            wallTex.needsUpdate = true;
        };
        paintWall(0);

        // ── Camera shot list (TV grammar: hard cuts, slow drift within shots) ──
        const SHOTS = {
            wide:    { pos: [0, 5.4, 16],   look: [0, 3, 0],      drift: [0, -0.35, -2.2] },
            twoShot: { pos: [0, 2.4, 8.6],  look: [0, 1.9, 3],    drift: [0.15, 0, -0.35] },
            anchorL: { pos: [-1.5, 2.2, 7], look: [-1.1, 1.9, 3.1], drift: [0.1, 0, -0.25] },
            anchorR: { pos: [1.5, 2.2, 7],  look: [1.1, 1.9, 3.1],  drift: [-0.1, 0, -0.25] },
            wall:    { pos: [0, 4.2, 6.5],  look: [0, 4.3, -3.5],   drift: [0, 0, -1.1] },
            push270: { pos: [0, 4.3, 9],    look: [0, 4.4, -3.5],   drift: [0, 0, -3.2] },
        };
        let shot = SHOTS.wide, shotStart = 0;
        const cutTo = (name, now) => { shot = SHOTS[name] || SHOTS.twoShot; shotStart = now; };

        // ── Captions / commentary ──
        let speakerFlip = false;
        let talkingUntil = 0;
        const say = (line, now) => {
            speakerFlip = !speakerFlip;
            const name = speakerFlip ? anchorA : anchorB;
            dom.caption.innerHTML = `<span class="caption-speaker">${name}:</span> ${line}`;
            dom.caption.style.opacity = '1';
            talkingUntil = now + 3.2;
            this._talking = speakerFlip ? anchorL : anchorR;
        };
        const chyron = (text, now) => {
            dom.chyron.innerHTML = `<div class="chyron-inner"><span class="chyron-tab">KEY RACE ALERT</span><span class="chyron-topic">${text}</span></div>`;
            clearTimeout(this._chyronTimer);
            this._chyronTimer = setTimeout(() => { dom.chyron.innerHTML = ''; }, 3800 / speed);
        };

        let evLeadSign = 0;
        const lineFor = (evt, simMin) => {
            if (evt.type === 'open') return `Good evening from the GNN Decision Desk — polls are about to close on the East Coast, and the road to 270 starts now.`;
            if (evt.type === 'wave') return `Polls have just closed in ${evt.count} more ${evt.count === 1 ? 'state' : 'states'} — ballots are being counted.`;
            if (evt.type === 'tooclose') return `${evt.call.stateName} — too close to call. We are not able to make a projection there yet.`;
            if (evt.type === 'call') {
                const c = evt.call;
                const who = c.winner === 'player' ? pLast : oLast;
                const st = window.StateData.find(s => s.id === c.stateId);
                const big = c.ev >= 15 ? ` That's a big one — ${c.ev} electoral votes.` : ` ${c.ev} electoral votes.`;
                if (st && st.isBattleground) return `GNN projects battleground ${c.stateName}: ${who} takes it by ${c.margin} points.${big}`;
                return `GNN projects ${c.stateName} for ${who}.${big}`;
            }
            return '';
        };

        // ── Confetti (built lazily on a win) ──
        let confetti = null;
        const startConfetti = () => {
            const geo = new THREE.BufferGeometry();
            const n = 160;
            const pos = new Float32Array(n * 3), vel = [];
            const colors = new Float32Array(n * 3);
            const palette = [new THREE.Color(pColor), new THREE.Color('#ffffff'), new THREE.Color('#ffd75e')];
            for (let i = 0; i < n; i++) {
                pos[i * 3] = (Math.random() - 0.5) * 16;
                pos[i * 3 + 1] = 8 + Math.random() * 4;
                pos[i * 3 + 2] = Math.random() * 8 - 1;
                vel.push(1.2 + Math.random() * 1.6);
                const c = palette[i % 3];
                colors[i * 3] = c.r; colors[i * 3 + 1] = c.g; colors[i * 3 + 2] = c.b;
            }
            geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
            geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            confetti = new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.16, vertexColors: true }));
            confetti.userData.vel = vel;
            scene.add(confetti);
        };

        // ── Main loop ──
        const clock = new THREE.Clock();
        let simMin = -6; // brief cold-open before 7:00 PM
        let idx = 0;
        let projected = false;
        let endAt = null;
        let lastPaint = 0;

        this._state = { renderer, scene, running: true, raf: 0, container, dom, safety: null };

        const animate = () => {
            if (!this._state || !this._state.running) return;
            this._state.raf = requestAnimationFrame(animate);
            const dt = Math.min(clock.getDelta(), 0.1);
            const now = clock.getElapsedTime();
            simMin += dt * 6 * speed; // 6 sim-minutes per second at 1x

            // Process due timeline events
            while (idx < timeline.length && timeline[idx].t <= simMin) {
                const evt = timeline[idx++];
                say(lineFor(evt, simMin), now);
                if (evt.type === 'open') cutTo('twoShot', now);
                else if (evt.type === 'wave') { cutTo('wall', now); lastCallText = `POLLS CLOSED IN ${evt.count} STATES`; }
                else if (evt.type === 'tooclose') { lastCallText = `${evt.call.stateName}: TOO CLOSE TO CALL`; }
                else if (evt.type === 'call') {
                    const c = evt.call;
                    called[c.stateId] = c.winner;
                    if (c.winner === 'player') evP += c.ev; else evO += c.ev;
                    evSeries.push({ t: Math.max(0, evt.t), p: evP, o: evO });
                    lastCallText = `GNN PROJECTS ${c.stateName.toUpperCase()}: ${(c.winner === 'player' ? pLast : oLast).toUpperCase()}`;
                    flashState = c.stateId; flashUntil = simMin + 14;
                    const st = window.StateData.find(s => s.id === c.stateId);
                    if (st && st.isBattleground) { chyron(`${c.stateName.toUpperCase()} → ${(c.winner === 'player' ? pLast : oLast).toUpperCase()} +${c.margin}`, now); cutTo('wall', now); }
                    else if (c.ev >= 15) cutTo(c.winner === 'player' ? 'anchorL' : 'anchorR', now);
                    // Lead change commentary
                    const sign = Math.sign(evP - evO);
                    if (sign !== 0 && sign !== evLeadSign && (evP > 60 || evO > 60)) {
                        evLeadSign = sign;
                        setTimeout(() => say(`And with that, ${sign > 0 ? pLast : oLast} takes the electoral-vote lead.`, now), 1600 / speed);
                    }
                    // The 270 moment
                    if (!projected && (evP >= 270 || evO >= 270)) {
                        projected = true;
                        const winnerIsPlayer = evP >= 270;
                        projectionCard = {
                            name: winnerIsPlayer ? results.playerName : results.opponentName,
                            ev: winnerIsPlayer ? evP : evO,
                            color: winnerIsPlayer ? pColor : oColor,
                        };
                        cutTo('push270', now);
                        say(`GNN can now project that ${projectionCard.name} will be the next President of the United States.`, now);
                        if (winnerIsPlayer) startConfetti();
                    }
                }
                paintWall(Math.max(0, simMin));
            }

            // Post-270: return to the map, then wrap up
            if (projected && projectionCard && simMin > (evSeries[evSeries.length - 1].t + 60)) {
                projectionCard = null;
                cutTo('wide', now);
                paintWall(simMin);
            }
            if (idx >= timeline.length && endAt === null) {
                endAt = now + 6 / speed;
                setTimeout(() => say(evP >= 270
                    ? `A historic night. From all of us at the Decision Desk — the ${pLast} era begins.`
                    : `A hard night for the ${pLast} campaign. From all of us at GNN — good night.`, now), 2500 / speed);
            }
            if (endAt !== null && now >= endAt) return finish();

            // Clock + wall refresh cadence (flash decay + chart "now" edge)
            dom.clock.textContent = this._clockLabel(Math.max(0, simMin)) + ' ET';
            if (flashState && simMin >= flashUntil) flashState = null;
            if (now - lastPaint > 0.5) { paintWall(Math.max(0, simMin)); lastPaint = now; }

            // Camera: hard-cut shot + slow eased drift
            const sRaw = Math.min((now - shotStart) / 9, 1);
            const sInto = sRaw * sRaw * (3 - 2 * sRaw); // smoothstep ease
            camera.position.set(
                shot.pos[0] + shot.drift[0] * sInto,
                shot.pos[1] + shot.drift[1] * sInto,
                shot.pos[2] + shot.drift[2] * sInto
            );
            camera.lookAt(shot.look[0], shot.look[1], shot.look[2]);

            // Anchor idle + talking animation
            for (const a of [anchorL, anchorR]) {
                a.position.y = 0.45 + Math.sin(now * 1.4 + (a === anchorL ? 0 : 1.7)) * 0.015; // breathing
                const head = a.userData.head;
                const talking = now < talkingUntil && this._talking === a;
                head.rotation.x = talking ? Math.sin(now * 7) * 0.05 : Math.sin(now * 0.8) * 0.02;
                head.rotation.y = talking ? Math.sin(now * 2.3) * 0.08 : (shot === SHOTS.wall ? -0.5 : 0) + Math.sin(now * 0.5 + 2) * 0.04;
                if (a.userData.foreArm) a.userData.foreArm.rotation.x = talking ? -0.5 + Math.sin(now * 5) * 0.18 : -0.45;
                if (window.DebateWalkout) window.DebateWalkout.animateFace(a, now, talking);
            }

            // Caption fade
            if (now > talkingUntil + 1.5) dom.caption.style.opacity = '0.35';

            // Confetti fall
            if (confetti) {
                const posAttr = confetti.geometry.getAttribute('position');
                const vel = confetti.userData.vel;
                for (let i = 0; i < vel.length; i++) {
                    let y = posAttr.getY(i) - vel[i] * dt;
                    if (y < 0) y = 8 + Math.random() * 3;
                    posAttr.setY(i, y);
                    posAttr.setX(i, posAttr.getX(i) + Math.sin(now * 2 + i) * 0.01);
                }
                posAttr.needsUpdate = true;
            }

            renderer.render(scene, camera);
        };
        animate();

        // Safety net: whole broadcast must end eventually no matter what
        this._state.safety = setTimeout(finish, 240000);

        this._state.onResize = () => {
            if (!this._state) return;
            const w = container.clientWidth || W, h = container.clientHeight || H;
            camera.aspect = w / h; camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', this._state.onResize);

        // Expose for tests
        this._debug = { getSim: () => simMin, getSeries: () => evSeries, setSpeed: (s) => { speed = s; } };
    },

    _clockLabel(simMin) {
        const total = 19 * 60 + Math.floor(simMin);
        const h24 = Math.floor(total / 60) % 24;
        const m = total % 60;
        const h12 = ((h24 + 11) % 12) + 1;
        return `${h12}:${String(m).padStart(2, '0')} ${h24 >= 12 ? 'PM' : 'AM'}`;
    },

    /**
     * Seated news anchor: torso, jacket + shirt (+tie or pearls), arms
     * resting forward on the desk, full face kit and hair. No legs — the
     * desk covers them, exactly like television.
     */
    _buildAnchor(THREE, A) {
        const g = new THREE.Group();
        const jacketMat = new THREE.MeshStandardMaterial({ color: A.jacket, roughness: 0.75 });
        const skinMat = new THREE.MeshStandardMaterial({ color: A.skin, roughness: 0.65 });
        const hairMat = new THREE.MeshStandardMaterial({ color: A.hair, roughness: 0.9 });
        const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.6 });

        // Torso
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.34, 0.4, 0.95, 12), jacketMat);
        torso.position.y = 0.85;
        g.add(torso);
        for (const sx of [-0.32, 0.32]) {
            const sh = new THREE.Mesh(new THREE.SphereGeometry(0.13, 10, 8), jacketMat);
            sh.position.set(sx, 1.3, 0);
            g.add(sh);
        }
        // Shirt + lapels
        const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 0.03), shirtMat);
        shirt.position.set(0, 1.06, 0.33);
        g.add(shirt);
        for (const side of [-1, 1]) {
            const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.42, 0.03), jacketMat);
            lapel.position.set(side * 0.13, 1.05, 0.34);
            lapel.rotation.z = -side * 0.22;
            g.add(lapel);
        }
        if (A.tie) {
            const tieMat = new THREE.MeshStandardMaterial({ color: A.tie, roughness: 0.5 });
            const tie = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.4, 0.025), tieMat);
            tie.position.set(0, 1.02, 0.35);
            g.add(tie);
            const knot = new THREE.Mesh(new THREE.BoxGeometry(0.075, 0.06, 0.03), tieMat);
            knot.position.set(0, 1.26, 0.35);
            g.add(knot);
        }
        if (A.pearls) {
            const pearls = new THREE.Mesh(
                new THREE.TorusGeometry(0.14, 0.02, 8, 20),
                new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.3 })
            );
            pearls.position.set(0, 1.3, 0.18);
            pearls.rotation.x = Math.PI / 2.4;
            g.add(pearls);
        }

        // Arms resting forward on the desk (upper arm angled, forearm forward)
        let foreArm = null;
        for (const side of [-1, 1]) {
            const upper = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.065, 0.5, 8), jacketMat);
            upper.position.set(side * 0.38, 1.05, 0.12);
            upper.rotation.z = side * 0.35;
            upper.rotation.x = 0.35;
            g.add(upper);
            const fore = new THREE.Group();
            const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.055, 0.45, 8), jacketMat);
            sleeve.rotation.x = Math.PI / 2 - 0.15;
            sleeve.position.z = 0.2;
            fore.add(sleeve);
            const hand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), skinMat);
            hand.position.set(0, -0.03, 0.42);
            fore.add(hand);
            fore.position.set(side * 0.42, 0.86, 0.28);
            fore.rotation.x = -0.45;
            g.add(fore);
            if (side === 1) foreArm = fore;
        }

        // Neck + head
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.1, 0.15, 8), skinMat);
        neck.position.y = 1.45;
        g.add(neck);
        const headG = new THREE.Group();
        headG.position.y = 1.76;
        g.add(headG);
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.31, 20, 18), skinMat);
        head.scale.set(0.95, 1.1, 0.92);
        headG.add(head);
        const eyelids = [];
        for (const side of [-1, 1]) {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 8), skinMat);
            ear.position.set(side * 0.29, 0, 0.02);
            headG.add(ear);
            const white = new THREE.Mesh(new THREE.SphereGeometry(0.046, 8, 8), new THREE.MeshBasicMaterial({ color: 0xf6f6f6 }));
            white.position.set(side * 0.105, 0.05, 0.25);
            white.scale.set(1, 0.8, 0.5);
            headG.add(white);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), new THREE.MeshBasicMaterial({ color: 0x1a120c }));
            pupil.position.set(side * 0.105, 0.05, 0.275);
            headG.add(pupil);
            const lid = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 0.012), skinMat);
            lid.position.set(side * 0.105, 0.055, 0.29);
            lid.scale.y = 0.01;
            headG.add(lid);
            eyelids.push(lid);
            const brow = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.02, 0.02), hairMat);
            brow.position.set(side * 0.105, 0.13, 0.265);
            brow.rotation.z = side * -0.12;
            headG.add(brow);
        }
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), skinMat);
        nose.position.set(0, -0.03, 0.285);
        nose.scale.set(0.8, 1.1, 1);
        headG.add(nose);
        const mouth = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.02, 0.012), new THREE.MeshStandardMaterial({ color: 0x8a5044 }));
        mouth.position.set(0, -0.135, 0.265);
        headG.add(mouth);
        // Earpiece
        const piece = new THREE.Mesh(new THREE.SphereGeometry(0.022, 6, 6), new THREE.MeshStandardMaterial({ color: 0x222222 }));
        piece.position.set(0.3, 0.01, 0.06);
        headG.add(piece);

        // Hair
        const dome = (scaleY, zOff, theta) => {
            const d = new THREE.Mesh(new THREE.SphereGeometry(0.335, 18, 12, 0, Math.PI * 2, 0, theta || Math.PI * 0.44), hairMat);
            d.scale.set(0.98, scaleY, 0.94);
            d.position.set(0, 0.035, zOff);
            headG.add(d);
        };
        if (A.style === 'bob') {
            dome(1.0, -0.01, Math.PI * 0.5);
            for (const side of [-1, 1]) {
                const curtain = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.36, 8), hairMat);
                curtain.position.set(side * 0.25, -0.1, -0.05);
                headG.add(curtain);
            }
            const back = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.36, 0.1), hairMat);
            back.position.set(0, -0.05, -0.22);
            headG.add(back);
        } else {
            dome(1.02, -0.015, Math.PI * 0.46);
        }

        g.userData = { head: headG, foreArm, mouth, eyelids, blinkSeed: Math.random() * 10 };
        return g;
    },

    _cleanup() {
        const s = this._state;
        if (!s) return;
        s.running = false;
        if (s.raf) cancelAnimationFrame(s.raf);
        if (s.safety) clearTimeout(s.safety);
        if (this._chyronTimer) clearTimeout(this._chyronTimer);
        if (s.onResize) window.removeEventListener('resize', s.onResize);
        try {
            s.scene.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                    mats.forEach(m => {
                        if (m.map) m.map.dispose();
                        if (m.emissiveMap) m.emissiveMap.dispose();
                        m.dispose();
                    });
                }
            });
            s.renderer.dispose();
            const gl = s.renderer.getContext();
            const lose = gl && gl.getExtension && gl.getExtension('WEBGL_lose_context');
            if (lose) lose.loseContext();
        } catch (e) { /* ignore */ }
        for (const el of Object.values(s.dom || {})) {
            if (el && el.parentNode) el.parentNode.removeChild(el);
        }
        if (s.renderer.domElement && s.renderer.domElement.parentNode) {
            s.renderer.domElement.parentNode.removeChild(s.renderer.domElement);
        }
        this._state = null;
        this._debug = null;
    },
};
