/**
 * Election 2028 — TV Interview set-piece
 * The weekly sit-down: pick your venue, survive three questions, hope the
 * clip that goes viral is the good one. Venue choice is the strategy —
 * friendly rooms are safe and small, hostile rooms are dangerous and big.
 */
window.InterviewSystem = {

    COOLDOWN_WEEKS: 2,

    getVenues(playerParty) {
        const dem = playerParty === 'democrat';
        const friendly = dem
            ? { network: 'The Progress Hour', anchor: 'Maya Reyes' }
            : { network: 'Patriot Prime', anchor: 'Buck Harlan' };
        const hostile = dem
            ? { network: 'Patriot Prime', anchor: 'Buck Harlan' }
            : { network: 'The Progress Hour', anchor: 'Maya Reyes' };
        return [
            { id: 'friendly', ...friendly, vibe: 'FRIENDLY', icon: '🛋️',
              desc: 'Softballs in a warm room. Fires up your base — persuades nobody.',
              scoreMod: 12, critRisk: 0.05, reward: 'base' },
            { id: 'mainstream', network: 'GNN', anchor: 'Dana Whitfield', vibe: 'MAINSTREAM', icon: '🎥',
              desc: 'The big desk. Fair but probing — the broadest audience in news.',
              scoreMod: 0, critRisk: 0.12, reward: 'broad' },
            { id: 'hostile', ...hostile, vibe: 'HOSTILE', icon: '🔥',
              desc: 'Enemy territory. Survive it and swing voters notice. Stumble and the clip lives forever.',
              scoreMod: -12, critRisk: 0.22, reward: 'crossover' },
        ];
    },

    /** Build a 3-question interview from the current game state. */
    start(venueId) {
        const gs=window.GameEngine.state;
        const venue=this.getVenues(gs.playerParty).find(v=>v.id===venueId);
        if(!venue || !this.isAvailable()) return {};
        const career=window.CareerSystem.ensure(gs), used=new Set(career.usedQuestionIds);
        const record=gs.isIncumbentRun?window.CareerSystem.recordQuestions(gs.accountability.docket).filter(q=>!used.has(q.id)):[];
        const bank=[...window.EventSystem.DebateSystem.primaryQuestions,...window.EventSystem.DebateSystem.questions].filter(q=>!used.has(q.id));
        for(let i=bank.length-1;i>0;i--) {const j=Math.floor(window.GameEngine.random()*(i+1));[bank[i],bank[j]]=[bank[j],bank[i]];}
        const chosen=[...record.slice(0,1),...bank].slice(0,3);
        if(chosen.length<3) return {};
        const command=window.GameCommands.execute('activity',{activity:'interview'});
        if(!command.ok) return {};
        const questions=chosen.map(q=>({id:q.id,q:q.question,isRecordQuestion:q.isRecordQuestion,factCheck:q.factCheck,family:q.family,
            options:q.responses.map((r,i)=>({text:r.text,claim:r.claim,tone:r.posture==='deny'?'deny':r.posture==='concede'?'own':i===0?'steady':i===1?'human':i===2?'attack':'vision'}))}));
        career.usedQuestionIds.push(...chosen.map(q=>q.id));
        gs.interviews.active={venueId,questions,answers:[],scores:[],crits:[]};
        window.SaveStore?.save();
        return {venue,questions};
    },

    /** Score one answer. Returns { score, crit, reaction }. */
    answer(qIndex, optIndex) {
        const gs = window.GameEngine.state;
        const ctx = gs.interviews.active;
        if (!ctx || ctx.answers.length !== qIndex) return null;
        const venue = this.getVenues(gs.playerParty).find(v => v.id === ctx.venueId);
        const q = ctx.questions[qIndex];
        const opt = q?.options[optIndex];
        if(!opt) return null;
        const cand = gs.playerCandidate;

        let score = (cand.mediaHandling || 50) * 0.5 + (cand.charisma || 50) * 0.3 + window.GameEngine.random() * 25 + venue.scoreMod;
        // Tone vs venue: aggression plays great in friendly rooms, terribly in hostile ones;
        // owning a mistake plays best in hostile rooms; pivots read weak to the base
        if (opt.tone === 'attack') score += venue.id === 'friendly' ? 10 : venue.id === 'hostile' ? -12 : -3;
        if (opt.tone === 'own') score += venue.id === 'hostile' ? 12 : 3;
        if (opt.tone === 'deny') score += (gs.activeScandals && gs.activeScandals.length ? -8 : 0) + (venue.id === 'friendly' ? 6 : -4);
        if (opt.tone === 'pivot') score += venue.id === 'mainstream' ? 6 : -4;
        if (opt.tone === 'vision' || opt.tone === 'human' || opt.tone === 'humor') score += (cand.charisma || 50) > 75 ? 8 : 0;
        if (opt.tone === 'steady') score += (cand.discipline || 50) > 70 ? 8 : 2;

        // Critical moments: the clip machine
        let crit = null;
        const roll = window.GameEngine.random();
        if (roll < venue.critRisk && score < 55) crit = 'disaster';
        else if (score > 82 && roll > 0.5) crit = 'viral';
        score = Math.max(5, Math.min(98, Math.round(score)));

        ctx.answers.push(optIndex);
        ctx.scores.push(score);
        ctx.crits.push(crit);
        if(q.isRecordQuestion) {
            const verdict=window.CareerSystem.factCheck(q,opt);
            gs.accountability.answered.push({week:gs.week,questionId:q.id,liability:q.family,claim:opt.claim});
            gs.accountability.factChecks.push({week:gs.week,questionId:q.id,verdict,fact:q.factCheck});
        }
        window.SaveStore?.save();

        const reaction = crit === 'disaster'
            ? `${venue.anchor} pounces on the stumble — that exchange is already clipped.`
            : crit === 'viral'
                ? `Even ${venue.anchor} pauses. That answer is going to travel.`
                : score >= 70 ? `${venue.anchor} nods and moves on. Clean exchange.`
                : score >= 45 ? `A wobble, but you get through it.`
                : `${venue.anchor} presses the follow-up. You never quite recover the thread.`;
        return { score, crit, reaction };
    },

    /** Apply effects, log news, set cooldown. Returns the summary card data. */
    finish() {
        const gs = window.GameEngine.state;
        const ctx = gs.interviews.active;
        if (!ctx || ctx.scores.length < ctx.questions.length) return null;
        const venue = this.getVenues(gs.playerParty).find(v => v.id === ctx.venueId);
        const avg = Math.round(ctx.scores.reduce((a, b) => a + b, 0) / ctx.scores.length);
        const tier = avg >= 75 ? 'MASTERCLASS' : avg >= 58 ? 'SOLID' : avg >= 42 ? 'ROUGH' : 'DISASTER';
        const c = gs.campaign;
        const effects = [];
        const gain = tier === 'MASTERCLASS' ? 3 : tier === 'SOLID' ? 2 : tier === 'ROUGH' ? 0 : -2;

        c.mediaScore = Math.min(100, c.mediaScore + gain + 1);
        effects.push(`Media score ${gain + 1 >= 0 ? '+' : ''}${gain + 1}`);
        if (venue.reward === 'base') {
            c.enthusiasm = Math.min(100, c.enthusiasm + Math.max(0, gain + 1));
            effects.push(`Base enthusiasm +${Math.max(0, gain + 1)}`);
        } else if (venue.reward === 'crossover') {
            c.persuadableSupport = Math.min(100, c.persuadableSupport + Math.max(-2, gain * 2));
            effects.push(`Persuadables ${gain * 2 >= 0 ? '+' : ''}${Math.max(-2, gain * 2)}`);
        } else {
            c.approval = Math.min(100, c.approval + gain);
            c.persuadableSupport = Math.min(100, c.persuadableSupport + Math.max(0, gain));
            effects.push(`Approval ${gain >= 0 ? '+' : ''}${gain}`);
        }

        const hadDisaster = ctx.crits.includes('disaster');
        const hadViral = ctx.crits.includes('viral');
        if (hadViral) {
            c.momentum = (c.momentum || 0) + 3;
            c.onlineInfluence = Math.min(100, c.onlineInfluence + 4);
            effects.push('Viral clip: momentum +3, online +4');
        }
        if (hadDisaster) {
            c.momentum = (c.momentum || 0) - 3;
            c.scandalVulnerability = Math.min(100, c.scandalVulnerability + 4);
            effects.push('Disaster clip: momentum −3, vulnerability +4');
        }

        const last = gs.playerCandidate.name.split(' ').pop().toUpperCase();
        const headline = hadDisaster
            ? `${last} INTERVIEW MELTDOWN CLIPPED WITHIN MINUTES`
            : tier === 'MASTERCLASS'
                ? `${last} COMMANDS THE ${venue.network.toUpperCase()} SIT-DOWN`
                : tier === 'DISASTER'
                    ? `${last} STUMBLES THROUGH ${venue.network.toUpperCase()} GRILLING`
                    : `${last} SITS DOWN WITH ${venue.network.toUpperCase()}`;
        if (Array.isArray(gs.newsHistory)) gs.newsHistory.unshift(headline);

        gs.interviews.lastWeek = gs.week;
        gs.interviews.history.push({ week: gs.week, venueId: ctx.venueId, avg, tier, hadViral, hadDisaster });
        gs.interviews.active = null;
        window.SaveStore?.save();
        return { venue, avg, tier, effects, hadViral, hadDisaster, headline };
    },

    isAvailable() {
        const gs = window.GameEngine.state;
        if (!gs || !gs.interviews) return false;
        const used=new Set(window.CareerSystem.ensure(gs).usedQuestionIds);
        const fresh=[...window.EventSystem.DebateSystem.primaryQuestions,...window.EventSystem.DebateSystem.questions].filter(q=>!used.has(q.id));
        // Interviews never consume the fresh questions reserved for future debates.
        const remaining=window.GameConstants.DEBATE_WEEKS.filter(w=>w>=gs.week).length+(gs.isIncumbentRun?0:3);
        return !gs.interviews.active && fresh.length>=3+remaining*5 && gs.week - gs.interviews.lastWeek >= this.COOLDOWN_WEEKS && window.GameCommands.preview('activity',{activity:'interview'}).ok;
    },

    weeksUntilAvailable() {
        const gs = window.GameEngine.state;
        return Math.max(0, this.COOLDOWN_WEEKS - (gs.week - gs.interviews.lastWeek));
    },
};
