/**
 * Election 2028 — The War Powers system (presidency mode)
 * Declare war, watch a coalition form for and against you, and grind it out
 * over quarters. You can absolutely lose — a small aggressor is winnable, a
 * nuclear superpower can end your presidency (or the world). A strategic
 * simulation; scenarios are game fiction, not endorsements or predictions.
 */
window.WarSystem = {

    // The United States starts as the strongest single military on Earth.
    US_BASE: 100,

    // Potential adversaries, ordered small → superpower. Each carries a
    // defensive casus belli (you respond to a provocation) so the choice is
    // whether to escalate, not whether to invade unprovoked.
    ADVERSARIES: [
        { id: 'caldoria', name: 'Caldora', flag: '🏴', strength: 16, size: 'SMALL', population: '9M', nuclear: false,
          scenario: 'The Caldoran junta seizes three American oil tankers and executes the crews on state television.',
          bloc: [], desc: 'A small, isolated aggressor. Militarily overmatched — but every war has a body count.' },
        { id: 'iran', name: 'Iran', flag: '🇮🇷', strength: 36, size: 'REGIONAL POWER', population: '89M', nuclear: false,
          scenario: 'Iran closes the Strait of Hormuz and its proxies overrun a U.S. base, killing 40 servicemembers.',
          bloc: ['proxies'], blocStrength: 14, desc: 'A regional power with a web of proxies. Winnable, but the region catches fire.' },
        { id: 'nkorea', name: 'North Korea', flag: '🇰🇵', strength: 30, size: 'SMALL · NUCLEAR', population: '26M', nuclear: true,
          scenario: 'North Korea shells a South Korean island and puts its missile forces on launch alert.',
          bloc: ['china', 'russia'], blocLean: 0.35, desc: 'Small conventionally — but nuclear. Escalation here risks the unthinkable over a tiny country.' },
        { id: 'russia', name: 'Russia', flag: '🇷🇺', strength: 70, size: 'MAJOR POWER · NUCLEAR', population: '144M', nuclear: true,
          scenario: 'Russian columns cross into a NATO member state, invoking Article 5 and dragging you in.',
          bloc: ['nkorea', 'iran'], blocLean: 0.5, desc: 'A near-peer nuclear power with a bloc of its own. A long, brutal war you can lose.' },
        { id: 'china', name: 'China', flag: '🇨🇳', strength: 90, size: 'SUPERPOWER · NUCLEAR', population: '1.41B', nuclear: true,
          scenario: 'China launches a full amphibious assault on Taiwan and sinks a U.S. carrier that moved to intervene.',
          bloc: ['russia', 'nkorea', 'pakistan'], blocLean: 0.55, desc: 'A peer superpower. The hardest war on Earth — most presidents who start it do not finish it well.' },
    ],

    // Swing nations that pick a side when war breaks out. usLean: −100 (hostile)
    // to +100 (ironclad ally). Treaty allies come running; the nonaligned watch
    // the balance of power and your diplomacy before committing.
    WORLD: [
        { id: 'uk',       name: 'United Kingdom', flag: '🇬🇧', strength: 46, usLean: 92 },
        { id: 'france',   name: 'France',         flag: '🇫🇷', strength: 44, usLean: 74 },
        { id: 'germany',  name: 'Germany',        flag: '🇩🇪', strength: 40, usLean: 68 },
        { id: 'japan',    name: 'Japan',          flag: '🇯🇵', strength: 42, usLean: 82 },
        { id: 'skorea',   name: 'South Korea',    flag: '🇰🇷', strength: 38, usLean: 76 },
        { id: 'australia',name: 'Australia',      flag: '🇦🇺', strength: 28, usLean: 88 },
        { id: 'canada',   name: 'Canada',         flag: '🇨🇦', strength: 26, usLean: 90 },
        { id: 'israel',   name: 'Israel',         flag: '🇮🇱', strength: 34, usLean: 72 },
        { id: 'india',    name: 'India',          flag: '🇮🇳', strength: 58, usLean: 8 },
        { id: 'saudi',    name: 'Saudi Arabia',   flag: '🇸🇦', strength: 30, usLean: 24 },
        { id: 'turkey',   name: 'Turkey',         flag: '🇹🇷', strength: 36, usLean: 12 },
        { id: 'brazil',   name: 'Brazil',         flag: '🇧🇷', strength: 28, usLean: 2 },
        { id: 'pakistan', name: 'Pakistan',       flag: '🇵🇰', strength: 34, usLean: -22 },
        { id: 'russia',   name: 'Russia',         flag: '🇷🇺', strength: 70, usLean: -70 },
        { id: 'china',    name: 'China',          flag: '🇨🇳', strength: 90, usLean: -55 },
        { id: 'nkorea',   name: 'North Korea',    flag: '🇰🇵', strength: 30, usLean: -80 },
    ],

    getAdversary(id) { return this.ADVERSARIES.find(a => a.id === id); },

    /**
     * Resolve who joins each side. Treaty allies come to you; the target's
     * bloc lines up against you; fence-sitters weigh your diplomatic standing
     * against the intimidation of taking on a giant.
     */
    formCoalition(adversary, diplomaticStanding, cabinetDiplo) {
        const standing = diplomaticStanding + (cabinetDiplo || 0); // 0..~115
        const withUs = [], against = [];
        const targetBloc = new Set(adversary.bloc || []);
        const intimidation = adversary.strength; // big targets scare the undecided

        for (const nation of this.WORLD) {
            if (nation.id === adversary.id) continue;         // can't join itself
            if (targetBloc.has(nation.id)) {                  // hardcore bloc → against you
                against.push(nation);
                continue;
            }
            // Score: base lean + your diplomacy, minus fear of taking on a giant.
            // The bigger the target, the more even treaty allies hedge — nobody
            // rushes into a superpower war. Neutrals hesitate hardest of all.
            let score = nation.usLean + (standing - 55) * 0.8;
            score -= Math.max(0, intimidation - 25) * 0.7;    // everyone fears a large target
            if (Math.abs(nation.usLean) < 45) score -= intimidation * 0.25; // neutrals extra shy
            if (nation.usLean <= -40) score -= 40;            // rivals tilt against you regardless
            // Add a little noise so no two wars are identical
            score += (window.GameEngine.random() - 0.5) * 24;
            if (score > 25) withUs.push(nation);
            else if (score < -25) against.push(nation);
            // otherwise stays neutral
        }
        return { withUs, against };
    },

    _sum(nations) { return nations.reduce((s, n) => s + n.strength, 0); },

    /** Build the war object once the player commits. */
    declare(adversaryId, initiatedByEnemy, authorization) {
        const gs = window.GameEngine.state;
        const p = gs.presidency;
        const adversary = this.getAdversary(adversaryId);
        if (!p || !adversary) return null;

        const cabinetDiplo = this._cabinetDiplomacy();
        const coalition = this.formCoalition(adversary, p.diplomaticStanding || 55, cabinetDiplo);
        const milMult = this._cabinetMilitary();

        const ourStrength = Math.round(this.US_BASE * milMult + this._sum(coalition.withUs));
        const enemyStrength = Math.round(adversary.strength + (adversary.blocStrength || 0) + this._sum(coalition.against));
        const ratio = ourStrength / (ourStrength + enemyStrength);

        p.war = {
            adversaryId, adversary: { name: adversary.name, flag: adversary.flag, nuclear: adversary.nuclear, size: adversary.size },
            withUs: coalition.withUs.map(n => ({ id: n.id, name: n.name, flag: n.flag })),
            against: coalition.against.map(n => ({ id: n.id, name: n.name, flag: n.flag })),
            ourStrength, enemyStrength,
            momentum: Math.round(30 + ratio * 40),  // seed 30–70 from the balance of power
            round: 0, casualties: 0, escalations: 0,
            posture: null, initiatedByEnemy: !!initiatedByEnemy,
            authorization: initiatedByEnemy ? 'ARTICLE II SELF-DEFENSE' : (authorization || 'CONGRESSIONAL AUTHORIZATION'),
            objective: initiatedByEnemy ? 'DEFEND THE UNITED STATES AND ALLIES' : 'COMPEL WITHDRAWAL AND RESTORE DETERRENCE',
            projectedDuration:'1–4 quarters',
            projectedCost:Math.max(3, Math.round(adversary.strength / 12)),
            cost:0,
            resolved: false, outcome: null,
            log: [],
        };
        p.war.log.push(initiatedByEnemy
            ? `${adversary.name} declares war on the United States.`
            : `The United States declares war on ${adversary.name}.`);
        if (window.CareerSystem) window.CareerSystem.record('war_authorization', {
            adversaryId, adversary:adversary.name, initiatedByEnemy:!!initiatedByEnemy,
            authorization:p.war.authorization, objective:p.war.objective,
            projectedDuration:p.war.projectedDuration, projectedCost:p.war.projectedCost,
        });
        if (window.WorldSystem) {
            const world = window.WorldSystem.ensureState();
            if (world && world.nations[adversaryId]) {
                world.nations[adversaryId].tension = 100;
                world.globalTension = Math.max(72, world.globalTension);
                world.conflicts.push({ adversaryId, objective:initiatedByEnemy ? 'DEFEND THE UNITED STATES AND ALLIES' : 'COMPEL WITHDRAWAL', started:p.quarter, resolved:false });
                window.WorldSystem.recomputeDefcon(world);
            }
        }
        return p.war;
    },

    /** Run one quarter of fighting under the chosen posture. */
    fightRound(posture) {
        const gs = window.GameEngine.state;
        const p = gs.presidency;
        const war = p.war;
        if (!war || war.resolved) return null;
        const adversary = this.getAdversary(war.adversaryId);
        war.round += 1;
        war.posture = posture;

        // Nuclear brink: escalating against a nuclear power ratchets the danger
        if (posture === 'escalate' && adversary.nuclear) {
            war.escalations += 1;
            const brink = 0.06 * war.escalations + (war.momentum < 25 ? 0.12 : 0); // a cornered nuclear foe is worse
            if (window.GameEngine.random() < brink) {
                war.resolved = true;
                war.outcome = 'nuclear';
                war.log.push('Nuclear release. The exchange cannot be recalled.');
                const world = window.WorldSystem && window.WorldSystem.ensureState();
                if (world) { world.defcon = 1; world.globalTension = 100; }
                p.population = typeof p.population === 'number' ? p.population : 335;
                const killed = Math.round(45 + window.GameEngine.random() * 85);
                p.population = Math.max(0, p.population - killed);
                p.stability = p.stability || { score:76, tier:'STABLE' };
                p.stability.score = Math.max(0, p.stability.score - 50);
                p.institutions = p.institutions || { trust:52, infrastructure:88, health:82, justice:70, continuity:92 };
                p.institutions.infrastructure = Math.max(0, p.institutions.infrastructure - 45);
                p.institutions.health = Math.max(0, p.institutions.health - 40);
                p.collapse = p.collapse || { active:false, seasons:0, recovery:0, events:[] };
                p.collapse.active = p.population > 0;
                p.collapse.events.push({ season:p.quarter, nationId:war.adversaryId, retaliated:true, killed });
                if (window.PresidencySystem) window.PresidencySystem._updateStabilityTier(p);
                p.approval = 15;
                p.legacyPoints -= 80;
                p.log.push(`Nuclear exchange with ${adversary.name}; ${killed} million Americans killed. Government continuity is in doubt.`);
                if (p.population <= 0) { p.over = true; p.legacy = window.PresidencySystem.computeLegacy(); }
                return { war, nuclear: true, killed, continues:!p.over };
            }
        }

        // Battle math: power ratio pushes momentum; posture trades risk for swing
        const ratioEdge = (war.ourStrength / (war.ourStrength + war.enemyStrength)) - 0.5; // −0.5..+0.5
        let swing = ratioEdge * 26 + (window.GameEngine.random() - 0.5) * 22;
        if (posture === 'escalate') { swing += 10; war.casualties += 3 + Math.floor(window.GameEngine.random() * 4); }
        else if (posture === 'hold') { swing += ratioEdge * 8; war.casualties += 1 + Math.floor(window.GameEngine.random() * 2); }
        war.momentum = Math.max(0, Math.min(100, Math.round(war.momentum + swing)));

        // Approval tracks the front and the coffins
        const approvalShift = Math.round((swing) * 0.25) - (posture === 'escalate' ? 2 : 1);
        p.approval = Math.max(15, Math.min(80, p.approval + approvalShift));
        this._drain(p, posture);
        const fiscalCost = posture === 'escalate' ? 2.5 : 1.2;
        war.cost = Math.round((war.cost + fiscalCost) * 10) / 10;
        if (p.fiscal) {
            p.fiscal.debt = Math.round((p.fiscal.debt + fiscalCost) * 10) / 10;
            if (window.CareerSystem) window.CareerSystem.fiscalEntry(`War with ${war.adversary.name}`, fiscalCost, `${posture} posture; quarter ${war.round}`);
        }

        // Decisive outcomes
        if (war.momentum >= 90) return this._settle(war, p, 'victory');
        if (war.momentum <= 10) return this._settle(war, p, 'defeat');

        war.log.push(`Quarter ${war.round}: ${posture} — front ${swing >= 0 ? 'advances' : 'slips'} (momentum ${war.momentum}).`);
        return { war, ongoing: true, swing };
    },

    /** Sue for peace — the deal you get depends on who's winning. */
    negotiate() {
        const gs = window.GameEngine.state;
        const p = gs.presidency;
        const war = p.war;
        if (!war || war.resolved) return null;
        war.posture = 'negotiate';
        let outcome;
        if (war.momentum >= 68) outcome = 'victory';
        else if (war.momentum >= 45) outcome = 'peace';
        else if (war.momentum >= 25) outcome = 'quagmire';
        else outcome = 'defeat';
        return this._settle(war, p, outcome, true);
    },

    _settle(war, p, outcome, negotiated) {
        war.resolved = true;
        war.outcome = outcome;
        const adversary = this.getAdversary(war.adversaryId);
        const enemyWeight = adversary.strength / 90; // beating a superpower is worth far more
        const table = {
            victory:  { approval: Math.round(10 + enemyWeight * 8), legacy: Math.round(14 + enemyWeight * 18), label: negotiated ? 'VICTORIOUS PEACE' : 'DECISIVE VICTORY' },
            peace:    { approval: 3,  legacy: Math.round(6 + enemyWeight * 4), label: 'NEGOTIATED PEACE' },
            quagmire: { approval: -8, legacy: Math.round(-6 - enemyWeight * 6), label: 'QUAGMIRE' },
            defeat:   { approval: Math.round(-16 - enemyWeight * 10), legacy: Math.round(-20 - enemyWeight * 20), label: 'DEFEAT' },
        };
        const r = table[outcome];
        p.approval = Math.max(15, Math.min(85, p.approval + r.approval));
        p.legacyPoints += r.legacy;
        war.resultLabel = r.label;
        war.resultApproval = r.approval;
        war.resultLegacy = r.legacy;
        p.warLog = p.warLog || [];
        p.warLog.push({ adversaryId:war.adversaryId, adversary: adversary.name, outcome, label: r.label, round: war.round, casualties: war.casualties, cost:war.cost, authorization:war.authorization, objective:war.objective, initiatedByEnemy:war.initiatedByEnemy });
        if (window.CareerSystem) {
            const career = window.CareerSystem.ensure(window.GameEngine.state);
            career.wars.push({ adversaryId:war.adversaryId, adversary:adversary.name, outcome, casualties:war.casualties, cost:war.cost, authorization:war.authorization, objective:war.objective, initiatedByEnemy:war.initiatedByEnemy, term:p.term });
            window.CareerSystem.record('war_outcome', career.wars[career.wars.length - 1]);
        }
        p.log.push(`The ${adversary.name} war ends: ${r.label} (${war.round} quarters, ${war.casualties}k casualties).`);
        if (window.WorldSystem) {
            const world = window.WorldSystem.ensureState();
            const conflict = world && world.conflicts.find(c => c.adversaryId === war.adversaryId && !c.resolved);
            if (conflict) { conflict.resolved = true; conflict.outcome = outcome; conflict.ended = p.quarter; }
            if (world) { world.globalTension = Math.max(25, world.globalTension - 18); window.WorldSystem.recomputeDefcon(world); }
        }
        return { war, outcome, resultLabel: r.label };
    },

    _drain(p, posture) {
        // Wars are expensive: capital and growth bleed while the fight is on
        p.capital = Math.max(0, p.capital - (posture === 'escalate' ? 2 : 1));
        p.economy.gdp = Math.round((p.economy.gdp - (posture === 'escalate' ? 0.3 : 0.15)) * 10) / 10;
        p.economy.inflation = Math.round((p.economy.inflation + 0.2) * 10) / 10;
    },

    _cabinetMilitary() {
        // Strong SecDef + CIA make American forces punch harder (0.9–1.25×)
        const posts = (window.GameEngine.state.transition && window.GameEngine.state.transition.posts) || {};
        const vals = ['defense', 'cia'].map(id => posts[id] && posts[id].competence).filter(v => typeof v === 'number');
        if (!vals.length) return 1.0;
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        return 0.9 + Math.max(0, Math.min(0.35, (avg - 60) / 100));
    },

    _cabinetDiplomacy() {
        // Strong State/UN/NSA widen your coalition (adds up to ~18 to standing)
        const posts = (window.GameEngine.state.transition && window.GameEngine.state.transition.posts) || {};
        const vals = ['state', 'un', 'nsa'].map(id => posts[id] && posts[id].competence).filter(v => typeof v === 'number');
        if (!vals.length) return 0;
        const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
        return Math.max(0, Math.min(18, (avg - 70) / 2));
    },
};
