/**
 * Election 2028 — Core Game Engine
 * Polling, finances, AI opponent, campaign mechanics, win conditions
 */

window.GameEngine = {

    // ═══════════════════════════════════════════════
    // GAME STATE
    // ═══════════════════════════════════════════════
    state: null,

    createFreshState() {
        return {
            week: 1,
            phase: "primary",
            totalWeeks: 40,
            primaryWeeks: 16,
            playerCandidate: null,
            opponentCandidate: null,
            playerParty: null,
            gameMode: "campaign",
            difficulty: "realistic",

            campaign: {
                cash: 5000000,
                approval: 45,
                enthusiasm: 50,
                baseTurnout: 50,
                persuadableSupport: 30,
                mediaScore: 50,
                scandalVulnerability: 30,
                debateSkill: 50,
                groundGame: 30,
                donorConfidence: 60,
                onlineInfluence: 40,
                surrogateStrength: 30,
                momentum: 0,
                nationalPolling: 45,
            },

            opponent: {
                cash: 5000000,
                approval: 45,
                enthusiasm: 50,
                baseTurnout: 50,
                persuadableSupport: 30,
                mediaScore: 50,
                scandalVulnerability: 30,
                debateSkill: 50,
                groundGame: 30,
                donorConfidence: 60,
                onlineInfluence: 40,
                surrogateStrength: 30,
                momentum: 0,
                nationalPolling: 45,
            },

            finances: {
                cashOnHand: 5000000,
                weeklySmallDollar: 200000,
                weeklyHighDollar: 500000,
                superPACSupport: 0,
                burnRate: 300000,
                totalRaised: 5000000,
                totalSpent: 0,
            },

            statePolling: {},
            weekHistory: [],
            newsHistory: [],
            eventHistory: [],
            activeEvents: [],
            debatesCompleted: 0,
            conventionDone: false,
            vpPicked: false,
            vpChoice: null,
            weekActions: [],
            visitedStates: {},
        };
    },

    // ═══════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════
    initGame(playerCandidate, opponentCandidate, mode, difficulty) {
        this.state = this.createFreshState();
        this.state.playerCandidate = playerCandidate;
        this.state.opponentCandidate = opponentCandidate;
        this.state.playerParty = playerCandidate.party === 'Democrat' ? 'democrat' : 'republican';
        this.state.gameMode = mode;
        this.state.difficulty = difficulty;

        // Apply candidate stats to campaign
        const pc = playerCandidate;
        this.state.campaign.enthusiasm = pc.baseEnthusiasm;
        this.state.campaign.debateSkill = pc.debate;
        this.state.campaign.mediaScore = pc.mediaHandling;
        this.state.campaign.scandalVulnerability = 100 - pc.scandalResistance;
        this.state.campaign.onlineInfluence = pc.viralPotential || 40;
        this.state.campaign.donorConfidence = pc.donorTrust || 60;
        this.state.campaign.surrogateStrength = pc.eliteSupport || 40;

        // Apply to opponent
        const oc = opponentCandidate;
        this.state.opponent.enthusiasm = oc.baseEnthusiasm;
        this.state.opponent.debateSkill = oc.debate;
        this.state.opponent.mediaScore = oc.mediaHandling;
        this.state.opponent.scandalVulnerability = 100 - oc.scandalResistance;
        this.state.opponent.donorConfidence = oc.donorTrust || 60;

        // Difficulty adjustments
        const mods = this.getDifficultyModifiers();
        this.state.finances.cashOnHand *= mods.cashMod;
        this.state.campaign.cash = this.state.finances.cashOnHand;
        this.state.finances.weeklySmallDollar *= mods.fundraisingMod;
        this.state.finances.weeklyHighDollar *= mods.fundraisingMod;

        this.initStatePolling();
        window.EventSystem.ScenarioEngine.reset();
        return this.state;
    },

    initStatePolling() {
        const states = window.StateData;
        const isPlayerDem = this.state.playerParty === 'democrat';

        for (const st of states) {
            // Base polling from partisan lean
            // partisanLean: negative = dem-leaning, positive = rep-leaning
            let demBase, repBase;
            if (st.partisanLean <= 0) {
                // Dem-leaning state
                demBase = 50 + Math.abs(st.partisanLean) * 0.3;
                repBase = 50 - Math.abs(st.partisanLean) * 0.3;
            } else {
                demBase = 50 - st.partisanLean * 0.3;
                repBase = 50 + st.partisanLean * 0.3;
            }

            // Candidate home state bonus
            const playerHome = this.state.playerCandidate.homeState;
            const oppHome = this.state.opponentCandidate.homeState;
            const stateNameMatch = (home, stId) => {
                const stObj = states.find(s => s.id === stId);
                return stObj && stObj.name === home;
            };

            let playerPoll = isPlayerDem ? demBase : repBase;
            let opponentPoll = isPlayerDem ? repBase : demBase;

            if (stateNameMatch(playerHome, st.id)) playerPoll += 5;
            if (stateNameMatch(oppHome, st.id)) opponentPoll += 5;

            // Candidate crossover appeal affects swing states
            const playerCross = this.state.playerCandidate.crossoverAppeal || 50;
            const oppCross = this.state.opponentCandidate.crossoverAppeal || 50;
            if (st.isBattleground) {
                playerPoll += (playerCross - 50) * 0.1;
                opponentPoll += (oppCross - 50) * 0.1;
            }

            // Normalize
            const total = playerPoll + opponentPoll;
            const undecided = Math.max(5, 100 - total);
            playerPoll = Math.min(65, Math.max(25, playerPoll));
            opponentPoll = Math.min(65, Math.max(25, opponentPoll));

            // Add noise
            playerPoll += (Math.random() - 0.5) * 4;
            opponentPoll += (Math.random() - 0.5) * 4;

            this.state.statePolling[st.id] = {
                player: Math.round(playerPoll * 10) / 10,
                opponent: Math.round(opponentPoll * 10) / 10,
                undecided: Math.round(Math.max(3, 100 - playerPoll - opponentPoll) * 10) / 10,
                trend: 0,
                lastVisitWeek: 0,
                adSpend: 0,
                groundGameLevel: 0,
            };
        }

        this.state.campaign.nationalPolling = this.calculateNationalPolling();
        this.state.opponent.nationalPolling = 100 - this.state.campaign.nationalPolling - 8; // undecideds
    },

    // ═══════════════════════════════════════════════
    // WEEKLY TURN PROCESSING
    // ═══════════════════════════════════════════════
    processWeek(actions) {
        const summary = {
            week: this.state.week,
            phase: this.state.phase,
            events: [],
            pollingChanges: {},
            financialSummary: {},
            newsHeadlines: [],
            statChanges: {},
            opponentActions: [],
        };

        // 1. Process player campaign visits
        if (actions.campaignStates) {
            for (const stId of actions.campaignStates) {
                const result = this.applyCampaignVisit(stId);
                summary.statChanges[`visit_${stId}`] = result;
            }
        }

        // 2. Process ad buys
        if (actions.adBuys) {
            for (const [stId, ad] of Object.entries(actions.adBuys)) {
                this.applyAdBuy(stId, ad.type, ad.amount, ad.tone);
            }
        }

        // 3. Process activities
        if (actions.activities) {
            for (const activity of actions.activities) {
                const result = this.applyActivityEffects(activity);
                summary.statChanges[activity] = result;
            }
        }

        // 4. Process coalition building
        if (actions.coalitionFocus) {
            this.applyCoalitionBuilding(actions.coalitionFocus);
        }

        // 5. Process strategy
        if (actions.strategy) {
            this.applyStrategy(actions.strategy);
        }

        // 6. Process spending
        if (actions.spending) {
            this.processFinances(actions.spending);
        } else {
            this.processFinances({});
        }

        // 7. Generate and process events (including primary milestones)
        const events = window.EventSystem.ScenarioEngine.generateWeeklyEvents(this.state);
        if (this.state.phase === 'primary') {
            const milestone = window.EventSystem.ScenarioEngine.getPrimaryMilestone(this.state.week);
            if (milestone) {
                events.unshift(milestone);
            }
        }
        summary.events = events;

        // 8. Process event choices (if provided)
        if (actions.eventChoices) {
            for (const [eventId, choiceIdx] of Object.entries(actions.eventChoices)) {
                this.applyEventChoice(eventId, choiceIdx, events);
            }
        }

        // 9. Process opponent turn
        const oppActions = this.processOpponentTurn();
        summary.opponentActions = oppActions;

        // 10. Calculate fundraising
        const fundsRaised = this.calculateFundraising();
        summary.financialSummary = {
            raised: fundsRaised,
            spent: this.state.finances.burnRate,
            cashOnHand: this.state.finances.cashOnHand,
        };

        // 11. Update momentum and media
        this.calculateMomentum();
        this.updateMediaNarrative();

        // 12. Apply polling noise and recalculate
        this.applyPollingNoise();
        this.state.campaign.nationalPolling = this.calculateNationalPolling();
        this.state.opponent.nationalPolling = 100 - this.state.campaign.nationalPolling - 8;

        // 13. Generate news headlines
        for (const evt of events) {
            if (evt.isBreakingNews) {
                summary.newsHeadlines.push(window.EventSystem.BreakingNewsTicker.generateHeadline(evt));
            }
        }

        // 14. Store history
        this.state.weekHistory.push(summary);
        this.state.newsHistory.push(...summary.newsHeadlines);

        // 15. Advance week
        this.state.week++;

        // 16. Check phase transition
        if (this.state.week > this.state.primaryWeeks && this.state.phase === 'primary') {
            this.transitionToGeneral();
        }

        // 17. Check for debate weeks
        const debateWeeks = [12, 28, 34, 38];
        const isDebateWeek = debateWeeks.includes(this.state.week);

        // 18. Check game end
        const gameOver = this.state.week > this.state.totalWeeks;

        // 19. Clamp all values
        this.clampStats();

        return {
            summary,
            events,
            isDebateWeek,
            gameOver,
            phase: this.state.phase,
        };
    },

    clampStats() {
        const clamp = (obj) => {
            for (const [k, v] of Object.entries(obj)) {
                if (typeof v === 'number' && k !== 'cash' && k !== 'cashOnHand' && k !== 'momentum') {
                    obj[k] = Math.max(0, Math.min(100, v));
                }
                if (k === 'momentum') obj[k] = Math.max(-100, Math.min(100, v));
            }
        };
        clamp(this.state.campaign);
        clamp(this.state.opponent);
    },

    // ═══════════════════════════════════════════════
    // CAMPAIGN EFFECTS
    // ═══════════════════════════════════════════════
    applyCampaignVisit(stateId) {
        const poll = this.state.statePolling[stateId];
        if (!poll) return {};
        const st = window.StateData.find(s => s.id === stateId);
        if (!st) return {};

        const charisma = this.state.playerCandidate.charisma || 50;
        const boost = 0.5 + (charisma / 100) * 1.5;
        const enthusiasm_boost = 0.3 + (charisma / 100) * 0.7;

        poll.player += boost;
        poll.opponent -= boost * 0.3;
        poll.undecided -= boost * 0.5;
        poll.lastVisitWeek = this.state.week;
        poll.trend += 0.3;

        this.state.campaign.enthusiasm += enthusiasm_boost;
        this.state.campaign.groundGame += 0.5;

        // Travel cost
        this.state.finances.cashOnHand -= 80000;
        this.state.campaign.cash = this.state.finances.cashOnHand;

        if (!this.state.visitedStates[stateId]) this.state.visitedStates[stateId] = 0;
        this.state.visitedStates[stateId]++;

        return { pollingBoost: boost, state: stateId };
    },

    applyAdBuy(stateId, type, amount, tone) {
        const poll = this.state.statePolling[stateId];
        if (!poll) return;
        const st = window.StateData.find(s => s.id === stateId);
        if (!st) return;

        const costMultiplier = st.adCostMultiplier || 1;
        const effectiveSpend = amount / costMultiplier;
        const baseImpact = Math.sqrt(effectiveSpend / 100000) * 0.8;

        let impact = baseImpact;
        if (type === 'tv') {
            impact *= 1.2; // TV more impactful overall
        } else {
            impact *= 0.9; // Digital cheaper but less impactful
            // But digital is better with younger demographics
            if (st.educationSplit && st.educationSplit.college > 35) impact *= 1.1;
        }

        if (tone === 'negative') {
            poll.opponent -= impact * 1.3;
            poll.player += impact * 0.3;
            this.state.campaign.scandalVulnerability += 2; // Going negative has costs
        } else if (tone === 'contrast') {
            poll.player += impact * 0.7;
            poll.opponent -= impact * 0.5;
        } else {
            poll.player += impact;
        }

        poll.adSpend += amount;
        this.state.finances.cashOnHand -= amount;
        this.state.finances.totalSpent += amount;
        this.state.campaign.cash = this.state.finances.cashOnHand;
    },

    applyActivityEffects(activity) {
        const c = this.state.campaign;
        const effects = {};
        switch (activity) {
            case 'rally':
                c.enthusiasm += 3; c.baseTurnout += 2; c.mediaScore += 1;
                this.state.finances.cashOnHand -= 60000;
                effects.enthusiasm = 3; effects.baseTurnout = 2;
                break;
            case 'townhall':
                c.approval += 2; c.persuadableSupport += 2; c.authenticity = (c.authenticity || 50) + 3;
                this.state.finances.cashOnHand -= 30000;
                effects.approval = 2; effects.persuadableSupport = 2;
                break;
            case 'podcast':
                c.onlineInfluence += 4; c.enthusiasm += 1; c.mediaScore += 2;
                this.state.finances.cashOnHand -= 5000;
                effects.onlineInfluence = 4;
                break;
            case 'interview':
                c.mediaScore += 3; c.approval += 1;
                const mediaSkill = this.state.playerCandidate.mediaHandling || 50;
                if (Math.random() > mediaSkill / 100) {
                    c.scandalVulnerability += 3;
                    effects.risk = "Tough interview - vulnerability up";
                }
                effects.mediaScore = 3;
                break;
            case 'fundraiser':
                const raised = 200000 + Math.random() * 300000;
                this.state.finances.cashOnHand += raised;
                this.state.finances.totalRaised += raised;
                c.donorConfidence += 2;
                effects.cashRaised = raised;
                break;
            case 'donorEvent':
                const bigRaise = 500000 + Math.random() * 500000;
                this.state.finances.cashOnHand += bigRaise;
                this.state.finances.totalRaised += bigRaise;
                c.donorConfidence += 4;
                c.authenticity = (c.authenticity || 50) - 2;
                effects.cashRaised = bigRaise;
                break;
            case 'debatePrep':
                c.debateSkill += 3; c.discipline = (c.discipline || 50) + 2;
                effects.debateSkill = 3;
                break;
            case 'surrogateDeployment':
                c.surrogateStrength += 3; c.groundGame += 2;
                this.state.finances.cashOnHand -= 40000;
                effects.surrogateStrength = 3;
                break;
            case 'oppoResearch':
                this.state.opponent.scandalVulnerability += 4;
                this.state.finances.cashOnHand -= 150000;
                effects.opponentVulnerability = 4;
                break;
            case 'fieldOffice':
                c.groundGame += 5; c.baseTurnout += 2;
                this.state.finances.cashOnHand -= 200000;
                effects.groundGame = 5;
                break;
        }
        this.state.campaign.cash = this.state.finances.cashOnHand;
        return effects;
    },

    applyCoalitionBuilding(coalition) {
        const c = this.state.campaign;
        switch (coalition) {
            case 'labor':
                c.baseTurnout += 2; c.groundGame += 2; c.enthusiasm += 1;
                break;
            case 'youth':
                c.onlineInfluence += 3; c.enthusiasm += 2; c.baseTurnout += 1;
                break;
            case 'suburban':
                c.persuadableSupport += 3; c.approval += 1;
                break;
            case 'rural':
                c.baseTurnout += 1; c.persuadableSupport += 1;
                // Boost rural states
                for (const [stId, poll] of Object.entries(this.state.statePolling)) {
                    const st = window.StateData.find(s => s.id === stId);
                    if (st && st.composition && st.composition.rural > 30) {
                        poll.player += 0.3;
                    }
                }
                break;
            case 'minority':
                c.baseTurnout += 3; c.enthusiasm += 2;
                // Boost diverse states
                for (const [stId, poll] of Object.entries(this.state.statePolling)) {
                    const st = window.StateData.find(s => s.id === stId);
                    if (st && st.demographics && (st.demographics.black > 15 || st.demographics.hispanic > 20)) {
                        poll.player += 0.4;
                    }
                }
                break;
            case 'women':
                c.persuadableSupport += 2; c.approval += 2; c.enthusiasm += 1;
                break;
            case 'veterans':
                c.approval += 1; c.persuadableSupport += 1; c.surrogateStrength += 2;
                break;
            case 'evangelical':
                c.baseTurnout += 3; c.enthusiasm += 2;
                break;
        }
    },

    applyStrategy(strategy) {
        const c = this.state.campaign;
        switch (strategy) {
            case 'positive':
                c.approval += 1; c.persuadableSupport += 1; c.donorConfidence += 1;
                break;
            case 'contrast':
                c.approval += 0.5; this.state.opponent.approval -= 1;
                c.mediaScore += 1;
                break;
            case 'negative':
                this.state.opponent.approval -= 2; this.state.opponent.enthusiasm -= 1;
                c.scandalVulnerability += 2; c.approval -= 0.5;
                c.mediaScore += 2;
                break;
        }
    },

    applyEventChoice(eventId, choiceIdx, events) {
        const event = events.find(e => e.id === eventId);
        if (!event || !event.choices[choiceIdx]) return;

        const choice = event.choices[choiceIdx];
        const c = this.state.campaign;

        for (const [key, val] of Object.entries(choice.effects)) {
            if (key === 'cash') {
                this.state.finances.cashOnHand += val;
                c.cash = this.state.finances.cashOnHand;
            } else if (c.hasOwnProperty(key)) {
                c[key] += val;
            }
        }

        // Apply base event effects too
        if (event.effects) {
            for (const [key, val] of Object.entries(event.effects)) {
                if (key === 'cash') {
                    this.state.finances.cashOnHand += val;
                    c.cash = this.state.finances.cashOnHand;
                } else if (c.hasOwnProperty(key)) {
                    c[key] += val;
                }
            }
        }

        // Risky choices can backfire
        if (choice.riskLevel === 'desperate' && Math.random() < 0.4) {
            c.approval -= 3;
            c.mediaScore -= 3;
        } else if (choice.riskLevel === 'risky' && Math.random() < 0.25) {
            c.approval -= 1;
            c.scandalVulnerability += 2;
        }

        this.state.eventHistory.push({ eventId, choiceIdx, week: this.state.week });
    },

    // ═══════════════════════════════════════════════
    // FINANCIAL ENGINE
    // ═══════════════════════════════════════════════
    processFinances(spending) {
        const f = this.state.finances;
        const c = this.state.campaign;

        // Calculate weekly income
        const fundsRaised = this.calculateFundraising();
        f.cashOnHand += fundsRaised;
        f.totalRaised += fundsRaised;

        // Apply base burn rate (staff, overhead)
        f.cashOnHand -= f.burnRate;
        f.totalSpent += f.burnRate;

        // Super PAC support
        if (c.donorConfidence > 60) {
            f.superPACSupport = Math.floor((c.donorConfidence - 60) * 10000);
        } else {
            f.superPACSupport = 0;
        }

        // Donor panic check
        this.checkDonorPanic();

        c.cash = f.cashOnHand;

        // Running out of money is devastating
        if (f.cashOnHand < 500000) {
            c.groundGame -= 3;
            c.enthusiasm -= 2;
            c.mediaScore -= 2;
        }
        if (f.cashOnHand < 0) {
            f.cashOnHand = 0;
            c.cash = 0;
            c.groundGame -= 5;
            c.enthusiasm -= 5;
            c.donorConfidence -= 10;
        }
    },

    calculateFundraising() {
        const f = this.state.finances;
        const c = this.state.campaign;
        const mods = this.getDifficultyModifiers();

        let smallDollar = f.weeklySmallDollar;
        let highDollar = f.weeklyHighDollar;

        // Momentum affects fundraising
        smallDollar *= (1 + c.momentum / 200);
        highDollar *= (1 + c.momentum / 300);

        // Enthusiasm drives small dollar
        smallDollar *= (c.enthusiasm / 50);

        // Donor confidence drives high dollar
        highDollar *= (c.donorConfidence / 60);

        // Online influence boosts small dollar
        smallDollar *= (1 + c.onlineInfluence / 200);

        // Post-debate bump
        const lastWeek = this.state.weekHistory[this.state.weekHistory.length - 1];
        if (lastWeek && lastWeek.events.some(e => e.id && e.id.includes('debate'))) {
            smallDollar *= 1.5;
        }

        // Difficulty modifier
        smallDollar *= mods.fundraisingMod;
        highDollar *= mods.fundraisingMod;

        return Math.floor(smallDollar + highDollar);
    },

    checkDonorPanic() {
        const c = this.state.campaign;
        if (c.nationalPolling < 40 && c.donorConfidence > 30) {
            c.donorConfidence -= 3;
        }
        if (c.scandalVulnerability > 70 && c.donorConfidence > 20) {
            c.donorConfidence -= 2;
        }
        if (c.momentum < -30 && c.donorConfidence > 20) {
            c.donorConfidence -= 2;
        }
    },

    // ═══════════════════════════════════════════════
    // POLLING ENGINE
    // ═══════════════════════════════════════════════
    calculateNationalPolling() {
        let totalPlayerVotes = 0;
        let totalWeight = 0;

        for (const [stId, poll] of Object.entries(this.state.statePolling)) {
            const st = window.StateData.find(s => s.id === stId);
            if (!st) continue;
            const weight = st.electoralVotes;
            totalPlayerVotes += poll.player * weight;
            totalWeight += weight;
        }

        return totalWeight > 0 ? Math.round((totalPlayerVotes / totalWeight) * 10) / 10 : 45;
    },

    applyPollingNoise() {
        for (const [stId, poll] of Object.entries(this.state.statePolling)) {
            const st = window.StateData.find(s => s.id === stId);
            const volatility = st ? st.swingVolatility / 100 : 0.3;
            const noise = (Math.random() - 0.5) * 2 * volatility;

            poll.player += noise;
            poll.opponent -= noise * 0.5;

            // Trend decay
            poll.trend *= 0.8;

            // Visit decay - states you ignore drift back to baseline
            if (this.state.week - poll.lastVisitWeek > 4) {
                const st2 = window.StateData.find(s => s.id === stId);
                if (st2) {
                    const isPlayerDem = this.state.playerParty === 'democrat';
                    const baseline = isPlayerDem ? (50 - st2.partisanLean * 0.3) : (50 + st2.partisanLean * 0.3);
                    poll.player += (baseline - poll.player) * 0.05;
                }
            }

            // Keep in bounds
            poll.player = Math.max(20, Math.min(75, poll.player));
            poll.opponent = Math.max(20, Math.min(75, poll.opponent));
            poll.undecided = Math.max(2, 100 - poll.player - poll.opponent);
        }
    },

    calculateElectoralMap() {
        let playerEV = 0;
        let opponentEV = 0;
        const stateResults = {};

        for (const [stId, poll] of Object.entries(this.state.statePolling)) {
            const st = window.StateData.find(s => s.id === stId);
            if (!st) continue;

            if (poll.player > poll.opponent) {
                playerEV += st.electoralVotes;
                stateResults[stId] = { winner: 'player', margin: poll.player - poll.opponent, ev: st.electoralVotes };
            } else {
                opponentEV += st.electoralVotes;
                stateResults[stId] = { winner: 'opponent', margin: poll.opponent - poll.player, ev: st.electoralVotes };
            }
        }

        return { playerEV, opponentEV, stateResults, needed: 270 };
    },

    // ═══════════════════════════════════════════════
    // AI OPPONENT
    // ═══════════════════════════════════════════════
    processOpponentTurn() {
        const opp = this.state.opponent;
        const actions = [];
        const mods = this.getDifficultyModifiers();

        // AI visits competitive states
        const battlegrounds = window.StateData
            .filter(s => s.isBattleground)
            .sort((a, b) => {
                const pa = this.state.statePolling[a.id];
                const pb = this.state.statePolling[b.id];
                const marginA = pa ? Math.abs(pa.player - pa.opponent) : 99;
                const marginB = pb ? Math.abs(pb.player - pb.opponent) : 99;
                return marginA - marginB;
            });

        // Visit 1-2 states
        const visitCount = Math.random() > 0.5 ? 2 : 1;
        for (let i = 0; i < Math.min(visitCount, battlegrounds.length); i++) {
            const st = battlegrounds[i];
            const poll = this.state.statePolling[st.id];
            if (poll) {
                const boost = 0.5 + Math.random() * 1.0 * mods.aiStrengthMod;
                poll.opponent += boost;
                poll.player -= boost * 0.2;
                actions.push(`Campaigned in ${st.name}`);
            }
        }

        // AI runs ads
        if (opp.cash > 1000000) {
            const adTarget = battlegrounds[Math.floor(Math.random() * Math.min(3, battlegrounds.length))];
            if (adTarget) {
                const poll = this.state.statePolling[adTarget.id];
                if (poll) {
                    const adBoost = 0.3 + Math.random() * 0.7 * mods.aiStrengthMod;
                    poll.opponent += adBoost;
                    actions.push(`Ran ads in ${adTarget.name}`);
                }
            }
        }

        // AI fundraises
        const aiRaise = 400000 + Math.random() * 600000 * mods.aiStrengthMod;
        opp.cash += aiRaise;

        // AI momentum
        opp.momentum += (Math.random() - 0.45) * 5;
        opp.enthusiasm += (Math.random() - 0.5) * 2;
        opp.approval += (Math.random() - 0.5) * 1;
        opp.nationalPolling = 100 - this.state.campaign.nationalPolling - 8;

        return actions;
    },

    generateOpponentAttack() {
        const vulns = this.state.playerCandidate.vulnerabilities || [];
        if (vulns.length === 0) return null;
        const attack = vulns[Math.floor(Math.random() * vulns.length)];
        return {
            text: attack,
            impact: -2 + Math.floor(Math.random() * -3),
        };
    },

    // ═══════════════════════════════════════════════
    // MOMENTUM & NARRATIVE
    // ═══════════════════════════════════════════════
    calculateMomentum() {
        const c = this.state.campaign;
        let momentumShift = 0;

        // Polling trend
        if (c.nationalPolling > 50) momentumShift += 2;
        else if (c.nationalPolling < 45) momentumShift -= 2;

        // Media score
        if (c.mediaScore > 60) momentumShift += 1;
        else if (c.mediaScore < 40) momentumShift -= 1;

        // Enthusiasm
        if (c.enthusiasm > 60) momentumShift += 1;
        else if (c.enthusiasm < 40) momentumShift -= 1;

        // Donor confidence
        if (c.donorConfidence < 30) momentumShift -= 2;

        // Decay toward zero
        c.momentum = c.momentum * 0.8 + momentumShift;
    },

    updateMediaNarrative() {
        const c = this.state.campaign;
        // Media score slowly normalizes
        c.mediaScore += (50 - c.mediaScore) * 0.1;
        // Scandal vulnerability slowly decreases
        c.scandalVulnerability *= 0.95;
    },

    // ═══════════════════════════════════════════════
    // PHASE TRANSITIONS
    // ═══════════════════════════════════════════════
    transitionToGeneral() {
        this.state.phase = 'general';
        // Primary victory boost
        this.state.campaign.enthusiasm += 10;
        this.state.campaign.momentum += 15;
        this.state.campaign.donorConfidence += 10;
        this.state.finances.weeklySmallDollar *= 1.5;
        this.state.finances.weeklyHighDollar *= 2;
    },

    processConvention() {
        if (this.state.conventionDone) return {};
        this.state.conventionDone = true;

        const bounce = 3 + Math.floor(Math.random() * 5);
        this.state.campaign.enthusiasm += 8;
        this.state.campaign.momentum += 20;
        this.state.campaign.approval += bounce;
        this.state.campaign.baseTurnout += 5;

        // Boost all state polling slightly
        for (const [stId, poll] of Object.entries(this.state.statePolling)) {
            poll.player += bounce * 0.3;
        }

        return { bounce, message: `Convention bounce: +${bounce} approval!` };
    },

    processVPPick(vpName) {
        if (this.state.vpPicked) return {};
        this.state.vpPicked = true;
        this.state.vpChoice = vpName;

        // VP pick gives a modest boost
        this.state.campaign.enthusiasm += 5;
        this.state.campaign.mediaScore += 10;
        this.state.campaign.surrogateStrength += 10;
        this.state.campaign.momentum += 10;

        return { message: `VP pick announced: ${vpName}! Media buzz surges.` };
    },

    // ═══════════════════════════════════════════════
    // DEBATE PROCESSING
    // ═══════════════════════════════════════════════
    processDebateResults(debateScores) {
        const c = this.state.campaign;

        // Apply debate effects to campaign stats
        c.mediaScore += (debateScores.press || 0) * 0.5;
        c.donorConfidence += (debateScores.donors || 0) * 0.3;
        c.enthusiasm += (debateScores.base || 0) * 0.4;
        c.persuadableSupport += (debateScores.suburban || 0) * 0.3;
        c.onlineInfluence += (debateScores.viral || 0) * 0.5;

        // Overall debate performance affects all state polling
        const totalScore = Object.values(debateScores).reduce((a, b) => a + b, 0);
        const normalizedScore = totalScore / 30; // rough normalization

        for (const [stId, poll] of Object.entries(this.state.statePolling)) {
            poll.player += normalizedScore * 0.5;
            poll.trend += normalizedScore * 0.3;
        }

        // Fundraising bump
        if (totalScore > 20) {
            const bump = 200000 + totalScore * 20000;
            this.state.finances.cashOnHand += bump;
            this.state.finances.totalRaised += bump;
        }

        c.momentum += normalizedScore * 5;
        this.state.debatesCompleted++;

        return {
            totalScore,
            normalizedScore,
            assessment: totalScore > 30 ? "Commanding performance" :
                       totalScore > 15 ? "Solid showing" :
                       totalScore > 0 ? "Uneven performance" : "Rough night"
        };
    },

    // ═══════════════════════════════════════════════
    // ELECTION NIGHT
    // ═══════════════════════════════════════════════
    calculateElectionResult() {
        // Final adjustments
        this.applyFinalTurnout();

        const map = this.calculateElectoralMap();
        const results = {
            playerEV: map.playerEV,
            opponentEV: map.opponentEV,
            stateResults: map.stateResults,
            winner: map.playerEV >= 270 ? 'player' : 'opponent',
            playerName: this.state.playerCandidate.name,
            opponentName: this.state.opponentCandidate.name,
            playerParty: this.state.playerParty,
            nationalPopularVote: {
                player: this.state.campaign.nationalPolling,
                opponent: this.state.opponent.nationalPolling,
            }
        };

        return results;
    },

    applyFinalTurnout() {
        const c = this.state.campaign;
        const o = this.state.opponent;

        // Ground game and turnout matter on election day
        const playerTurnoutMod = (c.groundGame + c.baseTurnout + c.enthusiasm) / 300;
        const oppTurnoutMod = (o.groundGame + o.baseTurnout + o.enthusiasm) / 300;

        for (const [stId, poll] of Object.entries(this.state.statePolling)) {
            // Turnout adjustment
            poll.player *= (0.95 + playerTurnoutMod * 0.1);
            poll.opponent *= (0.95 + oppTurnoutMod * 0.1);

            // Final noise
            const noise = (Math.random() - 0.5) * 3;
            poll.player += noise;
            poll.opponent -= noise * 0.3;

            // Persuadable voter break
            const undecidedBreak = poll.undecided * (Math.random() * 0.3 + 0.35);
            const playerShare = c.persuadableSupport / (c.persuadableSupport + o.persuadableSupport || 1);
            poll.player += undecidedBreak * playerShare;
            poll.opponent += undecidedBreak * (1 - playerShare);
        }
    },

    generateElectionNight() {
        const results = this.calculateElectionResult();
        // Sort states by call order (safe states first, then battlegrounds)
        const callOrder = Object.entries(results.stateResults)
            .sort((a, b) => b[1].margin - a[1].margin);

        return {
            results,
            callOrder: callOrder.map(([stId, result]) => ({
                stateId: stId,
                stateName: (window.StateData.find(s => s.id === stId) || {}).name || stId,
                winner: result.winner,
                margin: Math.round(result.margin * 10) / 10,
                ev: result.ev,
            }))
        };
    },

    // ═══════════════════════════════════════════════
    // UTILITY
    // ═══════════════════════════════════════════════
    getStateModifier(stateId, candidateId) {
        const st = window.StateData.find(s => s.id === stateId);
        if (!st) return 0;
        const cands = [...(window.CandidateData.democrats || []), ...(window.CandidateData.republicans || [])];
        const cand = cands.find(c => c.id === candidateId);
        if (!cand) return 0;

        let mod = 0;
        // Home state bonus
        if (st.name === cand.homeState) mod += 5;
        // Regional affinity
        if (cand.crossoverAppeal > 60 && st.isBattleground) mod += 2;
        return mod;
    },

    getDifficultyModifiers() {
        const d = this.state ? this.state.difficulty : 'realistic';
        switch (d) {
            case 'arcade':
                return { cashMod: 1.5, fundraisingMod: 1.3, scandalMod: 0.5, aiStrengthMod: 0.7, eventMod: 0.7 };
            case 'realistic':
                return { cashMod: 1.0, fundraisingMod: 1.0, scandalMod: 1.0, aiStrengthMod: 1.0, eventMod: 1.0 };
            case 'chaos':
                return { cashMod: 0.8, fundraisingMod: 0.9, scandalMod: 1.5, aiStrengthMod: 1.1, eventMod: 2.0 };
            case 'iron':
                return { cashMod: 0.7, fundraisingMod: 0.8, scandalMod: 1.3, aiStrengthMod: 1.3, eventMod: 1.2 };
            default:
                return { cashMod: 1.0, fundraisingMod: 1.0, scandalMod: 1.0, aiStrengthMod: 1.0, eventMod: 1.0 };
        }
    },

    getWeekLabel() {
        if (!this.state) return '';
        const w = this.state.week;
        // Game starts in January 2028
        const startMonth = 0; // January
        const startYear = 2028;
        const totalDays = (w - 1) * 7;
        const date = new Date(startYear, startMonth, 1 + totalDays);
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        return `Week ${w} — ${months[date.getMonth()]} ${date.getFullYear()}`;
    },

    serialize() {
        return JSON.stringify(this.state);
    },

    deserialize(data) {
        this.state = JSON.parse(data);
        return this.state;
    }
};
