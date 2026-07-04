/**
 * Election 2028 — 3D Debate Walkout
 * A short Three.js intro: both candidates walk onto a lit debate stage before
 * the 2D broadcast debate UI takes over. Purely cosmetic — always degrades to
 * calling onDone() immediately if WebGL/Three isn't available.
 */
window.DebateWalkout = {

    /**
     * @param {HTMLElement} container  where the canvas mounts
     * @param {object} playerCand      { name, color, portraitEmoji }
     * @param {object} oppCand         { name, color, portraitEmoji }
     * @param {function} onDone        called exactly once when the intro ends
     */
    play(container, playerCand, oppCand, onDone) {
        let finished = false;
        const finish = () => {
            if (finished) return;
            finished = true;
            try { this._cleanup(); } catch (e) { /* ignore */ }
            if (typeof onDone === 'function') onDone();
        };

        // Hard guards — any failure just skips straight to the debate
        if (!window.THREE || !container) return finish();
        const THREE = window.THREE;

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
            if (!renderer || !renderer.getContext()) throw new Error('no gl');
        } catch (e) {
            return finish();
        }

        const W = container.clientWidth || 900;
        const H = container.clientHeight || 500;
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setSize(W, H);
        renderer.shadowMap.enabled = true;
        container.appendChild(renderer.domElement);

        // Skip button
        const skip = document.createElement('button');
        skip.className = 'walkout-skip';
        skip.textContent = 'SKIP INTRO ⏭';
        skip.onclick = finish;
        container.appendChild(skip);

        // Broadcast bug overlay
        const bug = document.createElement('div');
        bug.className = 'walkout-bug';
        bug.innerHTML = '<span class="walkout-live"><span class="walkout-live-dot"></span>LIVE</span> DECISION 2028 · DEBATE STAGE';
        container.appendChild(bug);

        // Fade overlay for the hand-off
        const fade = document.createElement('div');
        fade.className = 'walkout-fade';
        container.appendChild(fade);

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x05070f);
        scene.fog = new THREE.Fog(0x05070f, 14, 34);

        const camera = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
        camera.position.set(0, 4.2, 15);
        camera.lookAt(0, 2.2, 0);

        // ── Lighting ──
        const ambient = new THREE.AmbientLight(0x334466, 0.6);
        scene.add(ambient);
        const key = new THREE.DirectionalLight(0xffffff, 0.7);
        key.position.set(0, 12, 8);
        scene.add(key);

        const pColor = new THREE.Color(playerCand.color || '#2166d4');
        const oColor = new THREE.Color(oppCand.color || '#d42121');
        const spotL = new THREE.SpotLight(pColor.getHex(), 0, 40, Math.PI / 7, 0.4);
        spotL.position.set(-6, 12, 6);
        const spotR = new THREE.SpotLight(oColor.getHex(), 0, 40, Math.PI / 7, 0.4);
        spotR.position.set(6, 12, 6);
        scene.add(spotL, spotR, spotL.target, spotR.target);
        spotL.target.position.set(-3.2, 1, 0);
        spotR.target.position.set(3.2, 1, 0);

        // ── Stage floor ──
        const floor = new THREE.Mesh(
            new THREE.BoxGeometry(40, 0.4, 24),
            new THREE.MeshStandardMaterial({ color: 0x0c1526, roughness: 0.35, metalness: 0.5 })
        );
        floor.position.y = -0.2;
        scene.add(floor);

        // ── Backdrop with flag stripes (canvas texture) ──
        const bd = document.createElement('canvas');
        bd.width = 512; bd.height = 256;
        const bx = bd.getContext('2d');
        const grad = bx.createLinearGradient(0, 0, 0, 256);
        grad.addColorStop(0, '#0a1430'); grad.addColorStop(1, '#060a18');
        bx.fillStyle = grad; bx.fillRect(0, 0, 512, 256);
        const stripes = ['#1c3d8f', '#e8ecf4', '#a01a1a'];
        for (let i = 0; i < 3; i++) { bx.fillStyle = stripes[i]; bx.fillRect(0, 8 + i * 6, 512, 5); }
        bx.fillStyle = 'rgba(255,255,255,0.05)';
        bx.font = 'bold 44px sans-serif'; bx.textAlign = 'center';
        bx.fillText('DECISION 2028', 256, 150);
        const bdTex = new THREE.CanvasTexture(bd);
        const backdrop = new THREE.Mesh(
            new THREE.PlaneGeometry(40, 20),
            new THREE.MeshStandardMaterial({ map: bdTex, roughness: 0.9 })
        );
        backdrop.position.set(0, 8, -10);
        scene.add(backdrop);

        // ── Podium factory ──
        const makePodium = (x) => {
            const g = new THREE.Group();
            const desk = new THREE.Mesh(
                new THREE.CylinderGeometry(0.75, 0.95, 2, 6),
                new THREE.MeshStandardMaterial({ color: 0x17223c, roughness: 0.5, metalness: 0.3 })
            );
            desk.position.y = 1;
            g.add(desk);
            g.position.set(x, 0, 1.5);
            scene.add(g);
            return g;
        };
        const podiumL = makePodium(-3.2);
        const podiumR = makePodium(3.2);

        // ── Moderator desk (center, further back) ──
        const modDesk = new THREE.Mesh(
            new THREE.BoxGeometry(3, 1.1, 1.2),
            new THREE.MeshStandardMaterial({ color: 0x101a30, roughness: 0.6 })
        );
        modDesk.position.set(0, 0.55, -2.5);
        scene.add(modDesk);

        // ── Candidate figure factory ──
        const makeFigure = (cand, accent) => {
            const g = new THREE.Group();
            const suit = new THREE.MeshStandardMaterial({ color: 0x1a2236, roughness: 0.7 });
            const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.7, 1.7, 12), suit);
            torso.position.y = 1.85;
            g.add(torso);
            // Accent tie
            const tie = new THREE.Mesh(
                new THREE.BoxGeometry(0.16, 0.8, 0.08),
                new THREE.MeshStandardMaterial({ color: accent.getHex(), roughness: 0.4, emissive: accent.getHex(), emissiveIntensity: 0.25 })
            );
            tie.position.set(0, 1.95, 0.56);
            g.add(tie);
            // Head
            const head = new THREE.Mesh(
                new THREE.SphereGeometry(0.42, 24, 24),
                new THREE.MeshStandardMaterial({ color: 0xd9b89a, roughness: 0.8 })
            );
            head.position.y = 3.0;
            g.add(head);
            // Emoji face billboard
            const fc = document.createElement('canvas');
            fc.width = 128; fc.height = 128;
            const fx = fc.getContext('2d');
            fx.font = '96px serif'; fx.textAlign = 'center'; fx.textBaseline = 'middle';
            fx.fillText(cand.portraitEmoji || '🇺🇸', 64, 72);
            const faceSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(fc), transparent: true }));
            faceSprite.scale.set(0.9, 0.9, 1);
            faceSprite.position.set(0, 3.0, 0.42);
            g.add(faceSprite);
            // Arms
            const armMat = suit;
            const armL = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.4, 8), armMat);
            armL.position.set(-0.72, 1.9, 0); armL.rotation.z = 0.25;
            const armR = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 1.4, 8), armMat);
            armR.position.set(0.72, 1.9, 0); armR.rotation.z = -0.25;
            g.add(armL, armR);
            // Name plate sprite
            const nc = document.createElement('canvas');
            nc.width = 256; nc.height = 64;
            const nx = nc.getContext('2d');
            nx.fillStyle = 'rgba(8,14,26,0.85)'; nx.fillRect(0, 0, 256, 64);
            nx.strokeStyle = '#' + accent.getHexString(); nx.lineWidth = 4; nx.strokeRect(2, 2, 252, 60);
            nx.fillStyle = '#fff'; nx.font = 'bold 30px sans-serif'; nx.textAlign = 'center'; nx.textBaseline = 'middle';
            nx.fillText((cand.name || '').split(' ').pop().toUpperCase(), 128, 34);
            const nameSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(nc), transparent: true }));
            nameSprite.scale.set(2.4, 0.6, 1);
            nameSprite.position.set(0, 4.0, 0);
            g.add(nameSprite);

            g.userData = { armL, armR, torso };
            scene.add(g);
            return g;
        };
        const figL = makeFigure(playerCand, pColor);
        const figR = makeFigure(oppCand, oColor);

        // Start off-stage in the wings
        const homeLX = -3.2, homeRX = 3.2;
        figL.position.set(-13, 0, 1.5);
        figR.position.set(13, 0, 1.5);

        // ── Animation loop ──
        const clock = new THREE.Clock();
        const DURATION = 5.4;
        const lerp = (a, b, t) => a + (b - a) * t;
        const easeOut = (t) => 1 - Math.pow(1 - t, 3);

        this._state = { renderer, scene, running: true, raf: 0, container, skip, bug, fade };

        const animate = () => {
            if (!this._state || !this._state.running) return;
            this._state.raf = requestAnimationFrame(animate);
            const t = clock.getElapsedTime();

            // Spotlights sweep on (0–1.2s)
            const lit = Math.min(1, t / 1.2);
            spotL.intensity = lit * 2.2;
            spotR.intensity = lit * 2.2;

            // Walk in (1–4s)
            const walk = Math.max(0, Math.min(1, (t - 1) / 3));
            const we = easeOut(walk);
            figL.position.x = lerp(-13, homeLX, we);
            figR.position.x = lerp(13, homeRX, we);
            // Walking bob + sway while moving
            const moving = walk > 0 && walk < 1 ? 1 : 0;
            figL.position.y = Math.abs(Math.sin(t * 9)) * 0.12 * moving;
            figR.position.y = Math.abs(Math.sin(t * 9 + 1)) * 0.12 * moving;
            figL.rotation.y = lerp(0.5, 0, we);
            figR.rotation.y = lerp(-0.5, 0, we);

            // Wave once arrived (4–5s): right arm raises
            if (t > 4) {
                const wave = Math.sin((t - 4) * 6) * 0.5;
                figL.userData.armR.rotation.z = -0.25 - Math.max(0, wave) * 1.6;
                figR.userData.armL.rotation.z = 0.25 + Math.max(0, wave) * 1.6;
            }

            // Camera dolly in over the whole intro
            const cam = easeOut(Math.min(1, t / DURATION));
            camera.position.z = lerp(15, 10.5, cam);
            camera.position.y = lerp(4.2, 3.0, cam);
            camera.lookAt(0, 2.3, 0);

            // Fade to black at the end
            if (t > DURATION - 0.7) {
                fade.style.opacity = String(Math.min(1, (t - (DURATION - 0.7)) / 0.7));
            }

            renderer.render(scene, camera);

            if (t >= DURATION) finish();
        };
        animate();

        // Safety net: never hang the debate if something stalls
        this._state.safety = setTimeout(finish, 8000);

        // Handle resize during the short intro
        this._state.onResize = () => {
            if (!this._state) return;
            const w = container.clientWidth || W, h = container.clientHeight || H;
            camera.aspect = w / h; camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        };
        window.addEventListener('resize', this._state.onResize);
    },

    _cleanup() {
        const s = this._state;
        if (!s) return;
        s.running = false;
        if (s.raf) cancelAnimationFrame(s.raf);
        if (s.safety) clearTimeout(s.safety);
        if (s.onResize) window.removeEventListener('resize', s.onResize);
        // Dispose scene resources
        try {
            s.scene.traverse((obj) => {
                if (obj.geometry) obj.geometry.dispose();
                if (obj.material) {
                    const mats = Array.isArray(obj.material) ? obj.material : [obj.material];
                    mats.forEach(m => { if (m.map) m.map.dispose(); m.dispose(); });
                }
            });
            s.renderer.dispose();
            const gl = s.renderer.getContext();
            const lose = gl && gl.getExtension && gl.getExtension('WEBGL_lose_context');
            if (lose) lose.loseContext();
        } catch (e) { /* ignore */ }
        // Remove DOM the walkout added
        [s.skip, s.bug, s.fade].forEach(el => { if (el && el.parentNode) el.parentNode.removeChild(el); });
        if (s.renderer.domElement && s.renderer.domElement.parentNode) {
            s.renderer.domElement.parentNode.removeChild(s.renderer.domElement);
        }
        this._state = null;
    },
};
