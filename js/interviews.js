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
        const gs = window.GameEngine.state;
        const venue = this.getVenues(gs.playerParty).find(v => v.id === venueId);
        const questions = [];
        const career = window.CareerSystem && window.CareerSystem.ensure(gs);
        const docketItems = gs.isIncumbentRun && gs.accountability && gs.accountability.docket
            ? gs.accountability.docket.liabilities : [];
        const unusedRecord = docketItems.find(item => !career || !career.usedQuestionIds.includes(`interview_${item.id}`));

        // Q1 — your platform, under pressure
        const issues = (gs.platform && gs.platform.issues) ? Object.keys(gs.platform.issues) : ['the economy'];
        const issue = issues[Math.floor(window.GameEngine.random() * issues.length)].replace(/_/g, ' ');
        questions.push(unusedRecord ? {
            id:`interview_${unusedRecord.id}`,
            q:unusedRecord.question,
            recordItem:unusedRecord,
            options: [
                { text:'Defend the original decision and its tradeoff', tone:'steady' },
                { text:'Accept responsibility and announce a correction', tone:'own' },
                { text:'Contrast the record with the opponent’s alternative', tone:'attack' },
            ],
        } : {
            id:`interview_platform_${issue}_${gs.week}`,
            q: `Let's talk about ${issue}. Your critics say your plan doesn't add up. Walk me through it.`,
            options: [
                { text: 'Hold your ground — defend the plan in detail', tone: 'steady' },
                { text: 'Pivot toward the center — "there\'s room for compromise"', tone: 'pivot' },
                { text: 'Turn it around — hammer your opponent\'s record instead', tone: 'attack' },
            ],
        });
        if (career && questions[0].id) career.usedQuestionIds.push(questions[0].id);

        // Q2 — the gotcha: scandal > flip-flop > generic readiness
        if (gs.activeScandals && gs.activeScandals.length) {
            const s = gs.activeScandals[0];
            questions.push({
                q: `I have to ask about ${s.title ? '"' + s.title + '"' : 'the story everyone is talking about'}. The reporting is damning. What's your answer?`,
                options: [
                    { text: 'Deny it flatly — "that story is false"', tone: 'deny' },
                    { text: 'Own it — apologize and pivot to the work', tone: 'own' },
                    { text: 'Attack the source — "consider who\'s pushing this"', tone: 'attack' },
                ],
                gotcha: true,
            });
        } else if (gs.flipFlops > 0) {
            questions.push({
                q: `You've changed positions this campaign — voters call it flip-flopping. Which version of you shows up in office?`,
                options: [
                    { text: '"I listened, I learned, I adjusted — that\'s leadership"', tone: 'own' },
                    { text: 'Deny any shift — "my position has been consistent"', tone: 'deny' },
                    { text: 'Reframe — "unlike my opponent, I respond to reality"', tone: 'attack' },
                ],
                gotcha: true,
            });
        } else {
            questions.push({
                q: `Polls show voters still asking if you're ready for the hardest job on Earth. Why you, and why now?`,
                options: [
                    { text: 'The record — walk through what you\'ve already done', tone: 'steady' },
                    { text: 'The moment — "this election is bigger than me"', tone: 'vision' },
                    { text: 'The contrast — "look at the alternative"', tone: 'attack' },
                ],
                gotcha: true,
            });
        }

        // Q3 — the human one
        questions.push({
            q: `Last question. Twenty years from now, what's the one thing you want people to say your presidency changed?`,
            options: [
                { text: 'Paint the big vision — swing for inspiring', tone: 'vision' },
                { text: 'Keep it personal — a story from the trail', tone: 'human' },
                { text: 'Land a joke first, then bring it home', tone: 'humor' },
            ],
        });

        gs.interviews.active = { venueId, questions, answers: [], scores: [], crits: [] };
        return { venue, questions };
    },

    /** Score one answer. Returns { score, crit, reaction }. */
    answer(qIndex, optIndex) {
        const gs = window.GameEngine.state;
        const ctx = gs.interviews.active;
        if (!ctx || ctx.answers.length !== qIndex) return null;
        const venue = this.getVenues(gs.playerParty).find(v => v.id === ctx.venueId);
        const q = ctx.questions[qIndex];
        const opt = q.options[optIndex];
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
        if (Array.isArray(gs.newsHistory)) gs.newsHistory.unshift({ week: gs.week, headline });

        gs.interviews.lastWeek = gs.week;
        gs.interviews.history.push({ week: gs.week, venueId: ctx.venueId, avg, tier, hadViral, hadDisaster });
        gs.interviews.active = null;
        return { venue, avg, tier, effects, hadViral, hadDisaster, headline };
    },

    isAvailable() {
        const gs = window.GameEngine.state;
        if (!gs || !gs.interviews) return false;
        return gs.week - gs.interviews.lastWeek >= this.COOLDOWN_WEEKS;
    },

    weeksUntilAvailable() {
        const gs = window.GameEngine.state;
        return Math.max(0, this.COOLDOWN_WEEKS - (gs.week - gs.interviews.lastWeek));
    },
};
