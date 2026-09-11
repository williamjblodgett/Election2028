/**
 * Election 2028 — persistent Situation Room simulation.
 * Countries and institutions are real; future flashpoints are fictional,
 * emergent scenarios and are not predictions.
 */
window.WorldSystem = {
    NATIONS: [
        { id:'canada', name:'Canada', flag:'🇨🇦', x:18, y:23, strength:26, economy:82, nuclear:false, treaty:'NATO', lean:90 },
        { id:'mexico', name:'Mexico', flag:'🇲🇽', x:17, y:39, strength:19, economy:55, nuclear:false, treaty:null, lean:55 },
        { id:'brazil', name:'Brazil', flag:'🇧🇷', x:31, y:65, strength:28, economy:61, nuclear:false, treaty:null, lean:8 },
        { id:'argentina', name:'Argentina', flag:'🇦🇷', x:29, y:82, strength:17, economy:42, nuclear:false, treaty:null, lean:18 },
        { id:'uk', name:'United Kingdom', flag:'🇬🇧', x:45, y:27, strength:46, economy:77, nuclear:true, treaty:'NATO', lean:92 },
        { id:'france', name:'France', flag:'🇫🇷', x:47, y:34, strength:44, economy:75, nuclear:true, treaty:'NATO', lean:78 },
        { id:'germany', name:'Germany', flag:'🇩🇪', x:50, y:30, strength:40, economy:84, nuclear:false, treaty:'NATO', lean:73 },
        { id:'poland', name:'Poland', flag:'🇵🇱', x:54, y:29, strength:31, economy:52, nuclear:false, treaty:'NATO', lean:84 },
        { id:'ukraine', name:'Ukraine', flag:'🇺🇦', x:58, y:32, strength:39, economy:24, nuclear:false, treaty:null, lean:76 },
        { id:'russia', name:'Russia', flag:'🇷🇺', x:69, y:23, strength:70, economy:57, nuclear:true, treaty:null, lean:-72 },
        { id:'turkey', name:'Türkiye', flag:'🇹🇷', x:56, y:42, strength:36, economy:51, nuclear:false, treaty:'NATO', lean:18 },
        { id:'israel', name:'Israel', flag:'🇮🇱', x:57, y:48, strength:34, economy:61, nuclear:true, treaty:null, lean:74 },
        { id:'egypt', name:'Egypt', flag:'🇪🇬', x:54, y:53, strength:29, economy:39, nuclear:false, treaty:null, lean:32 },
        { id:'nigeria', name:'Nigeria', flag:'🇳🇬', x:48, y:64, strength:21, economy:38, nuclear:false, treaty:null, lean:15 },
        { id:'southafrica', name:'South Africa', flag:'🇿🇦', x:55, y:82, strength:20, economy:45, nuclear:false, treaty:null, lean:12 },
        { id:'saudi', name:'Saudi Arabia', flag:'🇸🇦', x:60, y:52, strength:30, economy:66, nuclear:false, treaty:null, lean:28 },
        { id:'iran', name:'Iran', flag:'🇮🇷', x:64, y:46, strength:36, economy:48, nuclear:false, treaty:null, lean:-61 },
        { id:'india', name:'India', flag:'🇮🇳', x:70, y:54, strength:58, economy:78, nuclear:true, treaty:null, lean:18 },
        { id:'pakistan', name:'Pakistan', flag:'🇵🇰', x:68, y:48, strength:34, economy:38, nuclear:true, treaty:null, lean:-18 },
        { id:'bangladesh', name:'Bangladesh', flag:'🇧🇩', x:74, y:54, strength:17, economy:43, nuclear:false, treaty:null, lean:12 },
        { id:'china', name:'China', flag:'🇨🇳', x:79, y:42, strength:90, economy:94, nuclear:true, treaty:null, lean:-57 },
        { id:'nkorea', name:'North Korea', flag:'🇰🇵', x:86, y:37, strength:30, economy:13, nuclear:true, treaty:null, lean:-88 },
        { id:'skorea', name:'South Korea', flag:'🇰🇷', x:87, y:42, strength:38, economy:73, nuclear:false, treaty:null, lean:81 },
        { id:'japan', name:'Japan', flag:'🇯🇵', x:91, y:42, strength:42, economy:86, nuclear:false, treaty:null, lean:86 },
        { id:'taiwan', name:'Taiwan', flag:'🇹🇼', x:85, y:51, strength:29, economy:72, nuclear:false, treaty:null, lean:79 },
        { id:'vietnam', name:'Vietnam', flag:'🇻🇳', x:80, y:57, strength:28, economy:50, nuclear:false, treaty:null, lean:22 },
        { id:'thailand', name:'Thailand', flag:'🇹🇭', x:77, y:59, strength:24, economy:54, nuclear:false, treaty:null, lean:43 },
        { id:'indonesia', name:'Indonesia', flag:'🇮🇩', x:79, y:68, strength:27, economy:57, nuclear:false, treaty:null, lean:14 },
        { id:'philippines', name:'Philippines', flag:'🇵🇭', x:85, y:59, strength:18, economy:45, nuclear:false, treaty:null, lean:68 },
        { id:'australia', name:'Australia', flag:'🇦🇺', x:86, y:80, strength:28, economy:68, nuclear:false, treaty:'AUKUS', lean:91 },
        { id:'newzealand', name:'New Zealand', flag:'🇳🇿', x:94, y:88, strength:10, economy:39, nuclear:false, treaty:null, lean:84 },
        { id:'ethiopia', name:'Ethiopia', flag:'🇪🇹', x:59, y:65, strength:18, economy:29, nuclear:false, treaty:null, lean:20 },
        { id:'congo', name:'DR Congo', flag:'🇨🇩', x:53, y:69, strength:15, economy:24, nuclear:false, treaty:null, lean:12 },
    ],

    // Recognizable equirectangular land silhouettes. Country nodes sit at
    // real-world approximate longitudes/latitudes over this offline vector map.
    LAND_PATHS: [
        'M2 20L5 12 13 7 25 9 34 16 32 24 27 28 23 36 17 40 13 36 10 29 5 27Z',
        'M13 39L19 43 24 52 28 62 27 74 23 87 19 78 18 65 15 54Z',
        'M28 6L36 4 40 9 37 17 30 18 26 13Z',
        'M43 18L48 13 56 14 60 20 57 27 50 29 45 25Z',
        'M47 31L58 29 63 39 60 53 56 71 51 82 47 69 43 54 44 41Z',
        'M57 15L69 10 84 13 97 22 94 34 87 39 83 50 76 55 70 49 67 39 61 34 56 26Z',
        'M76 57L83 59 87 66 82 70 77 67 72 64Z',
        'M80 72L92 70 97 78 94 88 85 90 79 83Z',
        'M94 87L98 85 99 91 96 94Z',
        'M41 18L44 18 44 25 42 27 40 23Z',
        'M89 39L92 36 93 44 90 48Z',
    ],

    FLASHPOINTS: [
        { id:'strait', nations:['china','taiwan'], title:'Strait military exercises intensify', tension:8 },
        { id:'baltic', nations:['russia','poland'], title:'Baltic airspace interception alarms NATO', tension:7 },
        { id:'gulf', nations:['iran','saudi'], title:'Gulf tanker incident disrupts energy markets', tension:6 },
        { id:'peninsula', nations:['nkorea','skorea'], title:'Missile warning on the Korean Peninsula', tension:8 },
        { id:'cyber', nations:['russia','china'], title:'Allies attribute a major cyber intrusion', tension:5 },
        { id:'trade', nations:['china','mexico'], title:'Supply-chain dispute threatens U.S. prices', tension:4 },
    ],

    createState() {
        const nations = {};
        this.NATIONS.forEach(n => {
            nations[n.id] = {
                relation: Math.max(-100, Math.min(100, n.lean)),
                tension: n.lean < -50 ? 45 : n.lean < 0 ? 25 : 12,
                sanctions: 0, deployed: false, aid: 0, allied: !!n.treaty,
                intelligence: n.lean > 50 ? 90 : 62,
            };
        });
        return { nations, globalTension:35, defcon:4, actionLog:[], flashpoints:[], conflicts:[], nuclearExchanges:0 };
    },

    ensureState() {
        const p = window.GameEngine.state && window.GameEngine.state.presidency;
        if (!p) return null;
        if (!p.world) p.world = this.createState();
        // Backfill countries added after a save was created.
        this.NATIONS.forEach(n => {
            if (!p.world.nations[n.id]) {
                p.world.nations[n.id] = { relation:n.lean, tension:n.lean < -50 ? 45 : n.lean < 0 ? 25 : 12, sanctions:0, deployed:false, aid:0, allied:!!n.treaty, intelligence:n.lean > 50 ? 90 : 62 };
            }
        });
        if (p.war) {
            const index=p.world.conflicts.findIndex(c=>c.adversaryId===p.war.adversaryId && !c.resolved);
            if (index>=0) p.world.conflicts[index]=p.war;
            else if (!p.war.resolved) p.world.conflicts.push(p.war);
        }
        return p.world;
    },

    getNation(id) { return this.NATIONS.find(n => n.id === id); },
    clamp(value, min, max) { return Math.max(min, Math.min(max, value)); },

    recomputeDefcon(world) {
        const hostileDeployment = this.NATIONS.some(n => n.nuclear && world.nations[n.id].deployed && world.nations[n.id].relation < 0);
        const activeNuclearWar = world.conflicts.some(c => !c.resolved && this.getNation(c.adversaryId)?.nuclear);
        world.defcon = activeNuclearWar && world.globalTension >= 82 ? 1
            : activeNuclearWar || world.globalTension >= 68 || hostileDeployment ? 2
            : world.globalTension >= 50 ? 3
            : world.globalTension >= 25 ? 4 : 5;
        return world.defcon;
    },

    act(type, nationId) {
        const p = window.GameEngine.state.presidency;
        const world = this.ensureState();
        const nation = this.getNation(nationId);
        const state = world && world.nations[nationId];
        if (!p || !nation || !state || p.acted || p.pendingEvent || p.over) return null;
        let summary = '';
        if (type === 'summit') {
            state.relation = this.clamp(state.relation + 14, -100, 100);
            state.tension = this.clamp(state.tension - 8, 0, 100);
            p.diplomaticStanding = this.clamp((p.diplomaticStanding || 55) + 3, 0, 100);
            summary = `Summit with ${nation.name} lowers tensions and opens a diplomatic channel.`;
        } else if (type === 'aid') {
            state.aid += 1; state.relation = this.clamp(state.relation + 9, -100, 100);
            p.fiscal.debt = Math.round((p.fiscal.debt + 0.4) * 10) / 10;
            window.CareerSystem?.fiscalEntry(`Aid to ${nation.name}`,.4,'Security and development assistance');
            summary = `A security and development package is approved for ${nation.name}.`;
        } else if (type === 'sanction') {
            state.sanctions += 1; state.relation = this.clamp(state.relation - 12, -100, 100);
            state.tension = this.clamp(state.tension + 10, 0, 100);
            world.globalTension = this.clamp(world.globalTension + 4, 0, 100);
            p.economy.inflation = Math.round((p.economy.inflation + 0.1) * 10) / 10;
            summary = `New sanctions target ${nation.name}; markets price in retaliation.`;
        } else if (type === 'deploy') {
            state.deployed = !state.deployed;
            state.tension = this.clamp(state.tension + (state.deployed ? 12 : -10), 0, 100);
            world.globalTension = this.clamp(world.globalTension + (state.deployed ? 6 : -4), 0, 100);
            summary = state.deployed ? `U.S. forces deploy near ${nation.name}.` : `U.S. forces stand down near ${nation.name}.`;
        } else if (type === 'ally') {
            if (state.relation < 45) return { ok:false, reason:'Relations must reach 45 before a formal security partnership is possible.' };
            state.allied = true; state.relation = this.clamp(state.relation + 6, -100, 100);
            p.capital = Math.max(0, p.capital - 1);
            summary = `A new security partnership is signed with ${nation.name}.`;
        } else {
            return null;
        }
        p.acted = true;
        world.actionLog.push({ season:p.quarter, type, nationId, summary });
        p.timeline = p.timeline || [];
        p.timeline.push({ season:p.quarter, kind:'world', text:summary });
        this.recomputeDefcon(world);
        return { ok:true, type, nation, summary, state };
    },

    monthlyPulse(monthName) {
        const p = window.GameEngine.state.presidency;
        const world = this.ensureState();
        if (!world || p.over) return null;
        const rng = window.GameEngine.random.bind(window.GameEngine);
        world.globalTension = this.clamp(world.globalTension + (rng() - 0.52) * 5, 0, 100);
        Object.values(world.nations).forEach(n => {
            n.tension = this.clamp(n.tension + (rng() - 0.54) * 4, 0, 100);
        });
        let headline = `${monthName}: routine diplomatic traffic; no major escalation.`;
        if (rng() < 0.18) {
            const available = this.FLASHPOINTS.filter(f => !world.flashpoints.some(x => x.id === f.id && !x.resolved));
            const event = available.length ? available[Math.floor(rng() * available.length)] : null;
            if (event) {
                world.flashpoints.push({ ...event, started:p.quarter, resolved:false });
                event.nations.forEach(id => world.nations[id].tension = this.clamp(world.nations[id].tension + event.tension, 0, 100));
                world.globalTension = this.clamp(world.globalTension + event.tension, 0, 100);
                headline = `${monthName}: ${event.title}.`;
            }
        }
        this.recomputeDefcon(world);
        return { headline, defcon:world.defcon, tension:Math.round(world.globalTension) };
    },

    launchNuclear(nationId) {
        const p = window.GameEngine.state.presidency;
        const world = this.ensureState();
        const nation = this.getNation(nationId);
        if (!p || p.over || !world || !nation || !nation.nuclear || world.defcon > 2 || p.acted) return null;
        return this.resolveNuclear(nationId,false);
    },

    resolveNuclear(nationId,initiatedByEnemy=false) {
        const p=window.GameEngine.state.presidency,world=this.ensureState(),nation=this.getNation(nationId);
        if(!p || p.over || !world || !nation?.nuclear) return null;
        const targetState = world.nations[nationId];
        const retaliationChance = this.clamp(0.45 + nation.strength / 200 + targetState.tension / 300, 0.55, 0.98);
        const retaliated = initiatedByEnemy || window.GameEngine.random() < retaliationChance;
        const killed = retaliated ? Math.round(38 + window.GameEngine.random() * 92) : Math.round(8 + window.GameEngine.random() * 18);
        p.population = Math.max(0, Math.round((p.population - killed) * 10) / 10);
        p.stability.score = this.clamp(p.stability.score - (retaliated ? 52 : 28), 0, 100);
        p.institutions.infrastructure = this.clamp(p.institutions.infrastructure - (retaliated ? 48 : 18), 0, 100);
        p.institutions.health = this.clamp(p.institutions.health - (retaliated ? 42 : 15), 0, 100);
        world.globalTension = 100; world.defcon = 1; world.nuclearExchanges += 1;
        world.lastExchange={nationId,retaliated,initiatedByEnemy,killed,term:p.term,month:p.month};
        const active=p.war&&!p.war.resolved&&p.war.adversaryId===nationId?p.war:null;
        if(active) {active.resolved=true;active.outcome='nuclear';active.resultLabel='NUCLEAR EXCHANGE';active.log.push('Nuclear release ends the conventional mission.');}
        const record={id:active?.id||`nuclear_${p.term}_${p.month}_${world.nuclearExchanges}`,adversaryId:nationId,
            adversary:nation.name,term:p.term,started:active?.started||p.month,outcome:'nuclear',label:'NUCLEAR EXCHANGE',
            casualties:active?.casualties||0,civilianDeaths:killed,cost:active?.cost||0,initiatedByEnemy,
            objective:active?.objective||'Nuclear escalation',authorization:active?.authorization||(initiatedByEnemy?'EMERGENCY RESPONSE':'PRESIDENTIAL NUCLEAR ORDER')};
        p.warLog.push({...record});
        const career=window.CareerSystem.ensure(window.GameEngine.state);career.wars.push({...record});
        window.CareerSystem.record('nuclear_exchange',record);
        p.collapse = p.collapse || { active:false, seasons:0, recovery:0, events:[] };
        p.collapse.active = p.population > 0;
        p.collapse.events.push({ season:p.quarter, nationId, retaliated, killed });
        p.acted = true;
        if (window.PresidencySystem) window.PresidencySystem._updateStabilityTier(p);
        p.legacyPoints -= 80;
        p.log.push(`Nuclear exchange with ${nation.name}; ${killed} million Americans killed.`);
        if (p.population <= 0) { p.over = true; p.legacy = window.PresidencySystem.computeLegacy(); }
        return { nation, retaliated, killed, population:p.population,war:active,nuclear:true,continues:!p.over };
    },
};
