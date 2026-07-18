/**
 * Election 2028 — 3D Debate Walkout
 * A short Three.js intro: both candidates walk onto a lit debate stage before
 * the 2D broadcast debate UI takes over. Purely cosmetic — always degrades to
 * calling onDone() immediately if WebGL/Three isn't available.
 */
window.DebateWalkout = {

    // Stylized appearance per candidate id: skin tone, hair color/style,
    // facial hair, build. Unknown candidates fall back to a party default.
    APPEARANCES: {
        newsom:       { skin: 0xddab7e, hair: 0x2d2620, style: 'slick', beard: null,     female: false, height: 1.06, face: { h: 1.06, chin: 1.0 } },
        buttigieg:    { skin: 0xe4bb92, hair: 0x3a2e22, style: 'side',  beard: null,     female: false, height: 0.98, face: { w: 0.96, h: 1.04 } },
        aoc:          { skin: 0xc98e63, hair: 0x241a12, style: 'long',  beard: null,     female: true,  height: 0.97, lipstick: 0xb03a48, face: { w: 0.95, brow: 1.15 } },
        harris:       { skin: 0xa4713f, hair: 0x1d150e, style: 'bob',   beard: null,     female: true,  height: 0.96, necklace: true, face: { w: 0.97 } },
        shapiro:      { skin: 0xe6b48c, hair: 0x241f1a, style: 'short', beard: null,     female: false, height: 1.00, face: { w: 1.02 } },
        stephensmith: { skin: 0x7c4a26, hair: 0x1a120c, style: 'bald',  beard: 'goatee', female: false, height: 1.05, face: { w: 1.05, brow: 1.3, chin: 0.9 } },
        vance:        { skin: 0xe9bd97, hair: 0x33261a, style: 'side',  beard: 'full',   female: false, height: 1.02, face: { w: 1.08, h: 0.98 } },
        rubio:        { skin: 0xdfa87e, hair: 0x201812, style: 'short', beard: null,     female: false, height: 0.99, face: { w: 1.0, ear: 1.15 } },
        desantis:     { skin: 0xe3b28a, hair: 0x2b2118, style: 'side',  beard: null,     female: false, height: 1.02, face: { w: 1.06, h: 0.97, jowls: true } },
        trumpjr:      { skin: 0xe5b58d, hair: 0x2e2318, style: 'slick', beard: 'short',  female: false, height: 1.05, face: { w: 1.04, chin: 1.1 } },
        ramaswamy:    { skin: 0x9c6b40, hair: 0x120d09, style: 'coif',  beard: null,     female: false, height: 1.02, face: { w: 0.97, h: 1.05, brow: 1.2 } },
        carlson:      { skin: 0xecc2a0, hair: 0x6b4a2c, style: 'side',  beard: null,     female: false, height: 1.03, bowTie: true, face: { w: 1.1, h: 0.96, brow: 1.25 } },
    },

    getAppearance(cand) {
        // Custom candidates carry their appearance inline; legends register
        // theirs into APPEARANCES; everyone else gets a sensible default
        if (cand && cand.appearance) return cand.appearance;
        return this.APPEARANCES[cand && cand.id] ||
            { skin: 0xe0b088, hair: 0x2a2018, style: 'short', beard: null, female: false, height: 1.0 };
    },

    /**
     * @param {HTMLElement} container  where the canvas mounts
     * @param {object} playerCand      { id, name, color }
     * @param {object} oppCand         { id, name, color }
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
        camera.lookAt(0, 2.3, 0);

        // ── Lighting ──
        const ambient = new THREE.AmbientLight(0x445577, 0.75);
        scene.add(ambient);
        const key = new THREE.DirectionalLight(0xfff4e0, 0.85);
        key.position.set(0, 12, 10);
        scene.add(key);
        const fill = new THREE.DirectionalLight(0x99aadd, 0.3);
        fill.position.set(0, 6, -6);
        scene.add(fill);

        const pColor = new THREE.Color(playerCand.color || '#2166d4');
        const oColor = new THREE.Color(oppCand.color || '#d42121');
        const spotL = new THREE.SpotLight(pColor.getHex(), 0, 40, Math.PI / 7, 0.5);
        spotL.position.set(-6, 12, 6);
        const spotR = new THREE.SpotLight(oColor.getHex(), 0, 40, Math.PI / 7, 0.5);
        spotR.position.set(6, 12, 6);
        scene.add(spotL, spotR, spotL.target, spotR.target);
        spotL.target.position.set(-3.2, 2, 0.8);
        spotR.target.position.set(3.2, 2, 0.8);

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

        // ── Podiums ──
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
        makePodium(-3.2);
        makePodium(3.2);

        // ── Moderator desk (center, further back) ──
        const modDesk = new THREE.Mesh(
            new THREE.BoxGeometry(3, 1.1, 1.2),
            new THREE.MeshStandardMaterial({ color: 0x101a30, roughness: 0.6 })
        );
        modDesk.position.set(0, 0.55, -2.5);
        scene.add(modDesk);

        const figL = this._buildCharacter(THREE, scene, playerCand, pColor, true);
        const figR = this._buildCharacter(THREE, scene, oppCand, oColor, false);

        // Start off-stage in the wings, behind the podiums
        const homeLX = -3.2, homeRX = 3.2, figZ = 0.8;
        figL.position.set(-13, 0, figZ);
        figR.position.set(13, 0, figZ);

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
            spotL.intensity = lit * 2.0;
            spotR.intensity = lit * 2.0;

            // Walk in (1–4s)
            const walk = Math.max(0, Math.min(1, (t - 1) / 3));
            const we = easeOut(walk);
            figL.position.x = lerp(-13, homeLX, we);
            figR.position.x = lerp(13, homeRX, we);

            const moving = walk > 0 && walk < 1 ? 1 : 0;
            const stride = Math.sin(t * 8);
            for (const fig of [figL, figR]) {
                const u = fig.userData;
                // Leg + opposite-arm swing while walking, settle when arrived
                u.legL.rotation.x = stride * 0.55 * moving;
                u.legR.rotation.x = -stride * 0.55 * moving;
                // Knees bend on the back-swing for a real gait
                u.legL.userData.knee.rotation.x = Math.max(0, -stride) * 0.85 * moving;
                u.legR.userData.knee.rotation.x = Math.max(0, stride) * 0.85 * moving;
                u.armL.rotation.x = -stride * 0.4 * moving;
                u.armR.rotation.x = stride * 0.4 * moving;
                // Slight bounce
                fig.position.y = Math.abs(Math.sin(t * 8)) * 0.06 * moving;
                // Blink (no talking during the walkout — they wave instead)
                this.animateFace(fig, t, false);
            }
            // Turn from profile to face the audience as they arrive
            figL.rotation.y = lerp(1.2, 0, we);
            figR.rotation.y = lerp(-1.2, 0, we);

            // Wave once arrived (4s+): outer arm raises and waves
            if (t > 4) {
                const wave = Math.max(0, Math.sin((t - 4) * 6));
                figL.userData.armL.rotation.z = wave * 2.4;
                figL.userData.armL.rotation.x = 0;
                figR.userData.armR.rotation.z = -wave * 2.4;
                figR.userData.armR.rotation.x = 0;
            }

            // Camera dolly in over the whole intro
            const cam = easeOut(Math.min(1, t / DURATION));
            camera.position.z = lerp(15, 9.6, cam);
            camera.position.y = lerp(4.2, 3.0, cam);
            camera.lookAt(0, 2.4, 0);

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

    /**
     * Procedural low-poly human: legs/arms with joints for the walk cycle,
     * suit + shirt + party-color tie, and per-candidate head (skin tone,
     * hair style, facial hair, accessories).
     */
    _buildCharacter(THREE, scene, cand, accent, isLeft) {
        const A = this.getAppearance(cand);
        const g = new THREE.Group();

        const suitMat = new THREE.MeshStandardMaterial({ color: 0x1c2438, roughness: 0.75 });
        const darkMat = new THREE.MeshStandardMaterial({ color: 0x11182a, roughness: 0.8 });
        const skinMat = new THREE.MeshStandardMaterial({ color: A.skin, roughness: 0.65 });
        const hairMat = new THREE.MeshStandardMaterial({ color: A.hair, roughness: 0.9 });
        const shirtMat = new THREE.MeshStandardMaterial({ color: 0xf2f2f2, roughness: 0.6 });
        const tieMat = new THREE.MeshStandardMaterial({ color: accent.getHex(), roughness: 0.5, emissive: accent.getHex(), emissiveIntensity: 0.15 });

        const slim = A.female ? 0.86 : 1;

        // ── Legs: thigh group at the hip, shin group at the knee ──
        const makeLeg = (x) => {
            const hip = new THREE.Group();
            const thigh = new THREE.Mesh(new THREE.CylinderGeometry(0.085 * slim, 0.075 * slim, 0.45, 10), darkMat);
            thigh.position.y = -0.225;
            hip.add(thigh);
            const knee = new THREE.Group();
            const shin = new THREE.Mesh(new THREE.CylinderGeometry(0.072 * slim, 0.065 * slim, 0.42, 10), darkMat);
            shin.position.y = -0.21;
            knee.add(shin);
            const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.07, 0.26), new THREE.MeshStandardMaterial({ color: 0x0a0d14, roughness: 0.4 }));
            shoe.position.set(0, -0.42, 0.06);
            knee.add(shoe);
            knee.position.y = -0.45;
            hip.add(knee);
            hip.position.set(x, 0.9, 0);
            g.add(hip);
            hip.userData.knee = knee;
            return hip;
        };
        const legL = makeLeg(-0.13);
        const legR = makeLeg(0.13);

        // ── Torso: suit jacket ──
        const torso = new THREE.Mesh(new THREE.CylinderGeometry(0.32 * slim, 0.26 * slim, 0.8, 12), suitMat);
        torso.position.y = 1.32;
        g.add(torso);
        // Shoulders
        for (const sx of [-0.29 * slim, 0.29 * slim]) {
            const sh = new THREE.Mesh(new THREE.SphereGeometry(0.115, 10, 8), suitMat);
            sh.position.set(sx, 1.68, 0);
            g.add(sh);
        }
        // Shirt front
        const shirt = new THREE.Mesh(new THREE.BoxGeometry(0.17, 0.42, 0.03), shirtMat);
        shirt.position.set(0, 1.5, 0.28);
        g.add(shirt);
        // Lapels
        for (const side of [-1, 1]) {
            const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.4, 0.03), suitMat);
            lapel.position.set(side * 0.12, 1.5, 0.29);
            lapel.rotation.z = -side * 0.22;
            g.add(lapel);
        }
        // Tie (or bow tie)
        if (A.bowTie) {
            for (const side of [-1, 1]) {
                const wing = new THREE.Mesh(new THREE.BoxGeometry(0.09, 0.06, 0.03), tieMat);
                wing.position.set(side * 0.06, 1.68, 0.3);
                wing.rotation.z = side * 0.25;
                g.add(wing);
            }
            const knot = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.045, 0.035), tieMat);
            knot.position.set(0, 1.68, 0.31);
            g.add(knot);
        } else {
            const tie = new THREE.Mesh(new THREE.BoxGeometry(0.085, 0.36, 0.025), tieMat);
            tie.position.set(0, 1.48, 0.3);
            g.add(tie);
            const knot = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.06, 0.03), tieMat);
            knot.position.set(0, 1.69, 0.3);
            g.add(knot);
        }
        // Necklace (pearls)
        if (A.necklace) {
            const pearls = new THREE.Mesh(
                new THREE.TorusGeometry(0.13, 0.018, 8, 20),
                new THREE.MeshStandardMaterial({ color: 0xf5f0e6, roughness: 0.3 })
            );
            pearls.position.set(0, 1.72, 0.16);
            pearls.rotation.x = Math.PI / 2.4;
            g.add(pearls);
        }

        // ── Arms (pivot at shoulder) ──
        const makeArm = (x) => {
            const arm = new THREE.Group();
            const sleeve = new THREE.Mesh(new THREE.CylinderGeometry(0.062, 0.055, 0.62, 8), suitMat);
            sleeve.position.y = -0.31;
            arm.add(sleeve);
            const hand = new THREE.Mesh(new THREE.SphereGeometry(0.07, 8, 8), skinMat);
            hand.position.y = -0.66;
            arm.add(hand);
            arm.position.set(x, 1.68, 0);
            g.add(arm);
            return arm;
        };
        const armL = makeArm(-0.36 * slim);
        const armR = makeArm(0.36 * slim);

        // ── Neck + head ──
        const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.095, 0.14, 8), skinMat);
        neck.position.y = 1.83;
        g.add(neck);

        const headG = new THREE.Group();
        headG.position.y = 2.12;
        g.add(headG);

        // Caricature parameters: per-person head proportions. w/h/d scale the
        // skull (gaunt = w<1 h>1, round = w>1 h<1); nose/noseLen/brow/ear
        // scale features; chin/jowls add geometry. All optional.
        const F = A.face || {};
        const fw = F.w || 1, fh = F.h || 1, fd = F.d || 1;

        const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 20, 18), skinMat);
        head.scale.set(0.95 * fw, 1.1 * fh, 0.92 * fd);
        headG.add(head);
        // Ears
        for (const side of [-1, 1]) {
            const ear = new THREE.Mesh(new THREE.SphereGeometry(0.05 * (F.ear || 1), 8, 8), skinMat);
            ear.position.set(side * 0.285 * fw, 0, 0.02);
            headG.add(ear);
        }
        // Eyes (whites + pupils + blink lids)
        const eyelids = [];
        for (const side of [-1, 1]) {
            const white = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), new THREE.MeshBasicMaterial({ color: 0xf6f6f6 }));
            white.position.set(side * 0.105 * fw, 0.045, 0.245 * fd);
            white.scale.set(1, 0.8, 0.5);
            headG.add(white);
            const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.02, 8, 8), new THREE.MeshBasicMaterial({ color: 0x1a120c }));
            pupil.position.set(side * 0.105 * fw, 0.045, 0.27 * fd);
            headG.add(pupil);
            const lid = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.09, 0.012), skinMat);
            lid.position.set(side * 0.105 * fw, 0.05, 0.285 * fd);
            lid.scale.y = 0.01; // open
            headG.add(lid);
            eyelids.push(lid);
            // Eyebrow
            const brow = new THREE.Mesh(new THREE.BoxGeometry(0.095, 0.02 * (F.brow || 1), 0.02), hairMat);
            brow.position.set(side * 0.105 * fw, 0.125, 0.26 * fd);
            brow.rotation.z = side * -0.12;
            headG.add(brow);
        }
        // Glasses: wire-rim rings + bridge
        if (A.glasses) {
            const rimMat = new THREE.MeshStandardMaterial({ color: 0x3a3f4a, roughness: 0.4, metalness: 0.6 });
            for (const side of [-1, 1]) {
                const rim = new THREE.Mesh(new THREE.TorusGeometry(0.065, 0.008, 8, 20), rimMat);
                rim.position.set(side * 0.105 * fw, 0.045, 0.27 * fd);
                headG.add(rim);
            }
            const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.075 * fw, 0.01, 0.01), rimMat);
            bridge.position.set(0, 0.055, 0.275 * fd);
            headG.add(bridge);
        }
        // Nose
        const nose = new THREE.Mesh(new THREE.SphereGeometry(0.045, 8, 8), skinMat);
        nose.position.set(0, -0.03, 0.28 * fd);
        nose.scale.set(0.8 * (F.nose || 1), 1.1 * (F.nose || 1) * (F.noseLen || 1), F.nose || 1);
        headG.add(nose);
        // Mouth
        const mouth = new THREE.Mesh(
            new THREE.BoxGeometry(0.11, A.lipstick ? 0.03 : 0.018, 0.012),
            new THREE.MeshStandardMaterial({ color: A.lipstick || 0x8a5044, roughness: 0.6 })
        );
        mouth.position.set(0, -0.135, 0.26 * fd);
        headG.add(mouth);
        // Strong chin / jowls (caricature extras)
        if (F.chin) {
            const chin = new THREE.Mesh(new THREE.SphereGeometry(0.07 * F.chin, 8, 8), skinMat);
            chin.position.set(0, -0.26, 0.16 * fd);
            headG.add(chin);
        }
        if (F.jowls) {
            for (const side of [-1, 1]) {
                const jowl = new THREE.Mesh(new THREE.SphereGeometry(0.075, 8, 8), skinMat);
                jowl.position.set(side * 0.17 * fw, -0.18, 0.14 * fd);
                jowl.scale.set(1, 1.15, 0.9);
                headG.add(jowl);
            }
        }

        // ── Hair ──
        const addHairDome = (scaleY, zOff, thetaLength) => {
            // Radius slightly over the (vertically stretched) skull so the
            // scalp never pokes through the hair
            const dome = new THREE.Mesh(new THREE.SphereGeometry(0.33, 18, 12, 0, Math.PI * 2, 0, thetaLength || Math.PI * 0.45), hairMat);
            dome.scale.set(0.98 * fw, scaleY * Math.max(fh, 1), 0.94 * fd);
            dome.position.set(0, 0.035, zOff);
            headG.add(dome);
            return dome;
        };
        switch (A.style) {
            case 'slick': addHairDome(1.0, -0.03, Math.PI * 0.44); break;
            case 'coif': addHairDome(1.3, -0.01, Math.PI * 0.44); break;
            case 'side': addHairDome(1.05, -0.015, Math.PI * 0.48); break;
            case 'short': addHairDome(1.0, -0.02, Math.PI * 0.42); break;
            case 'long': {
                addHairDome(1.0, -0.01, Math.PI * 0.5);
                for (const side of [-1, 1]) {
                    const curtain = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.06, 0.55, 8), hairMat);
                    curtain.position.set(side * 0.24, -0.2, -0.06);
                    headG.add(curtain);
                }
                const back = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.5, 0.12), hairMat);
                back.position.set(0, -0.12, -0.22);
                headG.add(back);
                break;
            }
            case 'bob': {
                addHairDome(1.0, -0.01, Math.PI * 0.5);
                for (const side of [-1, 1]) {
                    const curtain = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.065, 0.34, 8), hairMat);
                    curtain.position.set(side * 0.24, -0.1, -0.05);
                    headG.add(curtain);
                }
                const back = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.34, 0.1), hairMat);
                back.position.set(0, -0.04, -0.21);
                headG.add(back);
                break;
            }
            case 'bald': default: break;
        }
        // ── Facial hair ──
        if (A.beard === 'mustache') {
            const stache = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.035, 0.03), hairMat);
            stache.position.set(0, -0.095, 0.27);
            headG.add(stache);
        } else if (A.beard === 'full' || A.beard === 'short') {
            const beard = new THREE.Mesh(
                new THREE.SphereGeometry(A.beard === 'full' ? 0.305 : 0.298, 16, 10, 0, Math.PI * 2, Math.PI * 0.58, Math.PI * 0.42),
                hairMat
            );
            beard.scale.set(0.96 * fw, 1.05 * fh, 0.95 * fd);
            beard.position.set(0, -0.03, 0.03);
            headG.add(beard);
        } else if (A.beard === 'goatee') {
            const goatee = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.1, 0.05), hairMat);
            goatee.position.set(0, -0.22, 0.2);
            headG.add(goatee);
        }

        // ── Name plate sprite ──
        const nc = document.createElement('canvas');
        nc.width = 256; nc.height = 64;
        const nx = nc.getContext('2d');
        nx.fillStyle = 'rgba(8,14,26,0.85)'; nx.fillRect(0, 0, 256, 64);
        nx.strokeStyle = '#' + accent.getHexString(); nx.lineWidth = 4; nx.strokeRect(2, 2, 252, 60);
        nx.fillStyle = '#fff'; nx.font = 'bold 30px sans-serif'; nx.textAlign = 'center'; nx.textBaseline = 'middle';
        nx.fillText((cand.name || '').split(' ').pop().toUpperCase(), 128, 34);
        const nameSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(nc), transparent: true }));
        nameSprite.scale.set(2.2, 0.55, 1);
        nameSprite.position.set(0, 3.0, 0);
        g.add(nameSprite);

        // Human-ish proportions → stage scale (podium desk tops out at y≈2,
        // which should hit around chest height)
        g.scale.setScalar(1.32 * (A.height || 1));

        g.userData = { legL, legR, armL, armR, mouth, eyelids, blinkSeed: Math.random() * 10 };
        scene.add(g);
        return g;
    },

    // Shared per-frame face animation: blink cycle (+ optional talking mouth)
    animateFace(fig, t, talking) {
        const u = fig.userData;
        if (u.eyelids) {
            const phase = (t + u.blinkSeed) % 3.4;
            const blink = phase < 0.14 ? Math.sin((phase / 0.14) * Math.PI) : 0;
            for (const lid of u.eyelids) lid.scale.y = 0.01 + blink * 0.95;
        }
        if (u.mouth) {
            u.mouth.scale.y = talking ? 1 + Math.abs(Math.sin(t * 11)) * 2.4 : 1;
        }
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
