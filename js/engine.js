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
            playerTicket: null,
            opponentTicket: null,
            vpAnnouncementBias: 0,
            opponentVPAnnouncementBias: 0,
            weekActions: [],
            visitedStates: {},
            endorsements: [],
            opponentEndorsements: [],
            pollHistory: {},
            earlyVote: {},
            debateHistory: [],
            opponentVP: null,
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
        this.state.playerTicket = { nominee: playerCandidate, vp: null };
        this.state.opponentTicket = { nominee: opponentCandidate, vp: null };

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

    applyTicketStatEffects(side, effects) {
        if (!effects) return;

        const target = side === 'player' ? this.state.campaign : this.state.opponent;
        for (const [key, value] of Object.entries(effects)) {
            if (target.hasOwnProperty(key)) {
                target[key] += value;
            }
        }

        if (side === 'player') {
            if (effects.cashOnHand) {
                this.state.finances.cashOnHand += effects.cashOnHand;
                this.state.finances.totalRaised += effects.cashOnHand;
                this.state.campaign.cash = this.state.finances.cashOnHand;
            }
            if (effects.weeklySmallDollar) this.state.finances.weeklySmallDollar += effects.weeklySmallDollar;
            if (effects.weeklyHighDollar) this.state.finances.weeklyHighDollar += effects.weeklyHighDollar;
        } else if (effects.cashOnHand) {
            this.state.opponent.cash += effects.cashOnHand;
        }
    },

    applyTicketMapEffects(side, option) {
        if (!option) return;
        const pollKey = side === 'player' ? 'player' : 'opponent';
        const homeStateId = window.VPData ? window.VPData.getStateIdForName(option.homeState) : null;

        if (homeStateId && this.state.statePolling[homeStateId]) {
            this.state.statePolling[homeStateId][pollKey] += option.homeStateBonus || 0;
            this.state.statePolling[homeStateId].trend += side === 'player' ? 0.8 : -0.8;
        }

        for (const stateId of option.regionalTargets || []) {
            if (!this.state.statePolling[stateId]) continue;
            this.state.statePolling[stateId][pollKey] += option.regionalBonus || 0;
            this.state.statePolling[stateId].trend += side === 'player' ? 0.4 : -0.4;
        }
    },

    normalizeTicketPolling() {
        for (const poll of Object.values(this.state.statePolling)) {
            poll.player = Math.max(20, Math.min(75, poll.player));
            poll.opponent = Math.max(20, Math.min(75, poll.opponent));
            poll.undecided = Math.max(2, 100 - poll.player - poll.opponent);
        }
        this.state.campaign.nationalPolling = this.calculateNationalPolling();
        this.state.opponent.nationalPolling = Math.max(20, Math.round((100 - this.state.campaign.nationalPolling - 8) * 10) / 10);
    },

    assignRunningMates(playerVP, opponentVP) {
        if (playerVP) {
            this.state.playerTicket = { nominee: this.state.playerCandidate, vp: playerVP };
            this.state.vpPicked = true;
            this.state.vpChoice = {
                name: playerVP.name,
                homeStateId: playerVP.homeId ||
                    (window.VPData ? window.VPData.getStateIdForName(playerVP.homeState) : null),
            };
            this.state.vpAnnouncementBias = playerVP.announcementBias || 0;
            this.applyTicketStatEffects('player', playerVP.effects);
            this.applyTicketMapEffects('player', playerVP);
        }

        if (opponentVP) {
            this.state.opponentTicket = { nominee: this.state.opponentCandidate, vp: opponentVP };
            this.state.opponentVP = {
                name: opponentVP.name,
                homeStateId: opponentVP.homeId ||
                    (window.VPData ? window.VPData.getStateIdForName(opponentVP.homeState) : null),
            };
            this.state.opponentVPAnnouncementBias = opponentVP.announcementBias || 0;
            this.applyTicketStatEffects('opponent', opponentVP.effects);
            this.applyTicketMapEffects('opponent', opponentVP);
        }

        this.normalizeTicketPolling();
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

        // 9b. Endorsement race (general election)
        const endorsementResult = this.processEndorsements();
        if (endorsementResult.event) {
            events.push(endorsementResult.event);
            summary.events = events;
        }
        summary.newsHeadlines.push(...endorsementResult.headlines);

        // 9c. AI opponent picks a running mate
        const oppVPNews = this.processOpponentVP();
        if (oppVPNews) summary.newsHeadlines.push(oppVPNews);

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

        // 12b. Early voting banks votes in the final stretch
        this.processEarlyVoting();

        // 12c. Record battleground polling history for averages/sparklines
        this.recordPollHistory();

        // 13. Generate news headlines
        for (const evt of events) {
            if (evt.isBreakingNews) {
                summary.newsHeadlines.push(window.EventSystem.BreakingNewsTicker.generateHeadline(evt));
            }
        }

        // 13b. Weekly polling headline from the closest battleground
        const closest = window.StateData
            .filter(s => s.isBattleground && this.state.statePolling[s.id])
            .sort((a, b) => {
                const pa = this.state.statePolling[a.id], pb = this.state.statePolling[b.id];
                return Math.abs(pa.player - pa.opponent) - Math.abs(pb.player - pb.opponent);
            })[0];
        if (closest) {
            const poll = this.state.statePolling[closest.id];
            summary.newsHeadlines.push(window.EventSystem.BreakingNewsTicker.generatePollingHeadline(
                this.state.playerCandidate.name.split(' ').pop(),
                this.state.opponentCandidate.name.split(' ').pop(),
                closest.name,
                Math.round((poll.player - poll.opponent) * 10) / 10
            ));
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
        const debateWeeks = window.GameConstants.DEBATE_WEEKS;
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
            case 'fundraisingBlitz':
                // Full-week fundraising blitz — $1.5M-$3.5M based on donor confidence
                const blitzBase = 1500000 + Math.random() * 1000000;
                const confidenceMultiplier = 0.5 + (c.donorConfidence / 100);
                const blitzRaised = Math.floor(blitzBase * confidenceMultiplier);
                this.state.finances.cashOnHand += blitzRaised;
                this.state.finances.totalRaised += blitzRaised;
                c.donorConfidence += 5;
                c.enthusiasm -= 2; // Spending the week fundraising costs momentum
                c.momentum -= 3;
                effects.cashRaised = blitzRaised;
                effects.note = "Full week dedicated to fundraising";
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
            case 'gotv': {
                // Get-out-the-vote push: bank votes in the closest battlegrounds
                const cfg = window.GameConstants.EARLY_VOTE;
                const targets = window.StateData
                    .filter(s => s.isBattleground)
                    .map(s => ({ s, poll: this.state.statePolling[s.id] }))
                    .filter(x => x.poll)
                    .sort((a, b) => Math.abs(a.poll.player - a.poll.opponent) - Math.abs(b.poll.player - b.poll.opponent))
                    .slice(0, cfg.GOTV_TARGET_STATES);

                const gain = 0.8 + (c.groundGame / 100) * 1.2; // banked points per state
                for (const { s } of targets) {
                    if (!this.state.earlyVote[s.id]) {
                        this.state.earlyVote[s.id] = { playerBanked: 0, opponentBanked: 0, pctBanked: 0 };
                    }
                    const ev = this.state.earlyVote[s.id];
                    const add = Math.min(gain, cfg.MAX_BANKED_PCT - ev.pctBanked);
                    if (add > 0) { ev.playerBanked += add; ev.pctBanked += add; }
                }
                c.baseTurnout += 2;
                this.state.finances.cashOnHand -= cfg.GOTV_COST;
                effects.gotvStates = targets.map(x => x.s.name).join(', ');
                break;
            }
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

        // Endorsement events: courting it claims the endorser
        if (event.isEndorsement && choiceIdx === 0) {
            const headline = this.claimEndorsement(event.endorsementId, 'player');
            if (headline) this.state.newsHistory.push(headline);
        }

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
            // Banked early votes are locked in — late swings only move live voters
            const liveShare = this.getLiveVoteShare(stId);
            const noise = (Math.random() - 0.5) * 2 * volatility * liveShare;

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
                    poll.player += (baseline - poll.player) * 0.05 * liveShare;
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
    // ENDORSEMENTS
    // ═══════════════════════════════════════════════
    processEndorsements() {
        const result = { event: null, headlines: [] };
        if (this.state.phase !== 'general') return result;

        const all = window.EventSystem.ENDORSEMENTS || [];
        const taken = new Set([...this.state.endorsements, ...this.state.opponentEndorsements]);
        let available = all.filter(e => !taken.has(e.id));
        if (!available.length) return result;

        // AI opponent locks up an uncontested endorser every ~3 weeks
        if (this.state.week % 3 === 0 && Math.random() < 0.6) {
            const pick = available[Math.floor(Math.random() * available.length)];
            const headline = this.claimEndorsement(pick.id, 'opponent');
            if (headline) result.headlines.push(headline);
            available = available.filter(e => e.id !== pick.id);
        }

        // ~25% of weeks, an endorser the player qualifies for comes into play
        if (!available.length || Math.random() > 0.25) return result;
        const c = this.state.campaign;
        const qualified = available.filter(e => {
            const req = e.requires || {};
            return Object.entries(req).every(([stat, min]) => (c[stat] || 0) >= min);
        });
        if (!qualified.length) return result;

        const target = qualified[Math.floor(Math.random() * qualified.length)];
        const stateNames = Object.keys(target.stateEffects || {})
            .map(id => (window.StateData.find(s => s.id === id) || {}).name)
            .filter(Boolean);
        result.event = {
            id: 'endorsement_' + target.id,
            isEndorsement: true,
            endorsementId: target.id,
            title: `${target.icon} Endorsement in Play: ${target.name}`,
            description: `${target.name} is weighing an endorsement this cycle. ${target.blurb || ''} Their backing would move numbers${stateNames.length ? ' in ' + stateNames.join(', ') : ' nationally'}.`,
            category: 'ENDORSEMENT',
            isBreakingNews: true,
            choices: [
                { text: `Court the endorsement — make the calls and the promises`, effects: {}, riskLevel: 'safe', outcomeText: `${target.name} endorses your campaign!` },
                { text: `Keep your distance — no strings attached`, effects: { enthusiasm: 1 }, riskLevel: 'safe', outcomeText: `You pass. ${target.name} stays on the sidelines — for now.` },
            ],
        };
        return result;
    },

    claimEndorsement(endorsementId, side) {
        const def = (window.EventSystem.ENDORSEMENTS || []).find(e => e.id === endorsementId);
        if (!def) return null;

        if (side === 'player') {
            if (this.state.endorsements.includes(endorsementId)) return null;
            this.state.endorsements.push(endorsementId);
            const c = this.state.campaign;
            for (const [k, v] of Object.entries(def.effects || {})) {
                if (c.hasOwnProperty(k)) c[k] += v;
            }
            for (const [stId, boost] of Object.entries(def.stateEffects || {})) {
                const poll = this.state.statePolling[stId];
                if (poll) { poll.player += boost; poll.trend += 0.3; }
            }
            return `ENDORSEMENT: ${def.name.toUpperCase()} BACKS ${this.state.playerCandidate.name.split(' ').pop().toUpperCase()}`;
        }

        if (this.state.opponentEndorsements.includes(endorsementId)) return null;
        this.state.opponentEndorsements.push(endorsementId);
        const o = this.state.opponent;
        for (const [k, v] of Object.entries(def.effects || {})) {
            if (o.hasOwnProperty(k)) o[k] += v * 0.8;
        }
        for (const [stId, boost] of Object.entries(def.stateEffects || {})) {
            const poll = this.state.statePolling[stId];
            if (poll) poll.opponent += boost;
        }
        return `ENDORSEMENT: ${def.name.toUpperCase()} BACKS ${this.state.opponentCandidate.name.split(' ').pop().toUpperCase()}`;
    },

    // ═══════════════════════════════════════════════
    // OPPONENT RUNNING MATE
    // ═══════════════════════════════════════════════
    processOpponentVP() {
        if (this.state.phase !== 'general' || this.state.opponentVP || this.state.week < 25) return null;
        // Ticket already built pregame (VPData ticket builder)
        if (this.state.opponentTicket && this.state.opponentTicket.vp) return null;

        // Prefer the VPData bench (scored pick), fall back to the simple option list
        if (window.VPData && typeof window.VPData.chooseRunningMate === 'function') {
            const vp = window.VPData.chooseRunningMate(this.state.opponentCandidate);
            if (vp) {
                const homeStateId = window.VPData.getStateIdForName(vp.homeState);
                this.state.opponentVP = { name: vp.name, homeStateId: homeStateId || null };
                this.state.opponentTicket = { nominee: this.state.opponentCandidate, vp };
                this.state.opponentVPAnnouncementBias = vp.announcementBias || 0;
                this.applyTicketStatEffects('opponent', vp.effects);
                this.applyTicketMapEffects('opponent', vp);
                this.state.opponent.momentum += 8;
                return `${this.state.opponentCandidate.name.split(' ').pop().toUpperCase()} NAMES ${vp.name.toUpperCase()} AS RUNNING MATE`;
            }
        }

        const oppParty = this.state.playerParty === 'democrat' ? 'republican' : 'democrat';
        const options = (window.CandidateData.vpOptions || {})[oppParty] || [];
        if (!options.length) return null;

        const pick = options[Math.floor(Math.random() * options.length)];
        this.state.opponentVP = { name: pick.name, homeStateId: pick.homeId || null };

        const poll = this.state.statePolling[pick.homeId];
        if (poll) { poll.opponent += 4; poll.trend -= 1; }
        this.state.opponent.enthusiasm += 5;
        this.state.opponent.surrogateStrength += 10;
        this.state.opponent.momentum += 8;

        return `${this.state.opponentCandidate.name.split(' ').pop().toUpperCase()} NAMES ${pick.name.toUpperCase()} AS RUNNING MATE`;
    },

    // ═══════════════════════════════════════════════
    // EARLY VOTING
    // ═══════════════════════════════════════════════
    processEarlyVoting() {
        const cfg = window.GameConstants.EARLY_VOTE;
        if (this.state.phase !== 'general' || this.state.week < cfg.START_WEEK) return;

        const diff = (this.state.campaign.groundGame - this.state.opponent.groundGame) / 100;
        for (const [stId, poll] of Object.entries(this.state.statePolling)) {
            if (!this.state.earlyVote[stId]) {
                this.state.earlyVote[stId] = { playerBanked: 0, opponentBanked: 0, pctBanked: 0 };
            }
            const ev = this.state.earlyVote[stId];
            if (ev.pctBanked >= cfg.MAX_BANKED_PCT) continue;

            const banked = Math.min(cfg.WEEKLY_BANK_PCT, cfg.MAX_BANKED_PCT - ev.pctBanked);
            const total = poll.player + poll.opponent;
            const playerShare = total > 0 ? poll.player / total : 0.5;
            // Ground game determines whose supporters actually vote early
            ev.playerBanked += banked * Math.min(0.9, Math.max(0.1, playerShare + diff * 0.05));
            ev.opponentBanked += banked * Math.min(0.9, Math.max(0.1, (1 - playerShare) - diff * 0.05));
            ev.pctBanked += banked;
        }
    },

    // Fraction of a state's vote still in play (1 = nothing banked yet)
    getLiveVoteShare(stateId) {
        const ev = this.state.earlyVote && this.state.earlyVote[stateId];
        return ev ? Math.max(0, 1 - ev.pctBanked / 100) : 1;
    },

    // ═══════════════════════════════════════════════
    // POLL HISTORY (for averages & sparklines)
    // ═══════════════════════════════════════════════
    recordPollHistory() {
        const cap = window.GameConstants.POLL_HISTORY_WEEKS;
        for (const st of window.StateData) {
            if (!st.isBattleground) continue;
            const poll = this.state.statePolling[st.id];
            if (!poll) continue;
            if (!this.state.pollHistory[st.id]) this.state.pollHistory[st.id] = [];
            const h = this.state.pollHistory[st.id];
            h.push({
                week: this.state.week,
                player: Math.round(poll.player * 10) / 10,
                opponent: Math.round(poll.opponent * 10) / 10,
            });
            if (h.length > cap) h.shift();
        }
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

    processVPPick(vpPick, vpHomeStateId) {
        if (this.state.vpPicked) return {};

        // Accepts a VPData ticket option (pregame builder), a plain
        // {name, homeId, effects} option, or a legacy (name, homeStateId) pair
        const option = typeof vpPick === 'string' ? { name: vpPick, effects: {} } : vpPick;
        const homeStateId = vpHomeStateId || option.homeId ||
            (window.VPData && option.homeState ? window.VPData.getStateIdForName(option.homeState) : null);

        this.assignRunningMates(option, this.state.opponentTicket ? this.state.opponentTicket.vp : null);
        this.state.vpChoice = { name: option.name, homeStateId: homeStateId || null };

        this.state.campaign.enthusiasm += 5;
        this.state.campaign.mediaScore += 8;
        this.state.campaign.surrogateStrength += 8;
        this.state.campaign.momentum += 10;

        // Home-state bump and regional coattails for options that don't carry
        // their own map effects (VPData options apply theirs in assignRunningMates)
        let homeNote = '';
        if (homeStateId && !option.homeStateBonus) {
            const poll = this.state.statePolling[homeStateId];
            const home = window.StateData.find(s => s.id === homeStateId);
            if (poll) { poll.player += 4; poll.trend += 1; }
            if (home) {
                homeNote = ` ${home.name} moves ${this.state.playerParty === 'democrat' ? 'blue' : 'red'}ward.`;
                for (const st of window.StateData) {
                    if (st.region === home.region && st.isBattleground && st.id !== homeStateId) {
                        const p = this.state.statePolling[st.id];
                        if (p) p.player += 1;
                    }
                }
            }
        }

        return { message: `VP pick announced: ${option.name}! Media buzz surges.${homeNote}` };
    },

    // ═══════════════════════════════════════════════
    // DEBATE PROCESSING
    // ═══════════════════════════════════════════════
    processDebateResults(debateScores, opponentScores, winner) {
        const c = this.state.campaign;
        const o = this.state.opponent;
        opponentScores = opponentScores || {};

        // Apply debate effects to campaign stats
        c.mediaScore += (debateScores.press || 0) * 0.5;
        c.donorConfidence += (debateScores.donors || 0) * 0.3;
        c.enthusiasm += (debateScores.base || 0) * 0.4;
        c.persuadableSupport += (debateScores.suburban || 0) * 0.3;
        c.onlineInfluence += (debateScores.viral || 0) * 0.5;

        // Opponent's performance moves their numbers too
        o.mediaScore += (opponentScores.press || 0) * 0.5;
        o.donorConfidence += (opponentScores.donors || 0) * 0.3;
        o.enthusiasm += (opponentScores.base || 0) * 0.4;
        o.persuadableSupport += (opponentScores.suburban || 0) * 0.3;
        o.onlineInfluence += (opponentScores.viral || 0) * 0.5;

        // Overall debate performance affects all state polling
        const totalScore = Object.values(debateScores).reduce((a, b) => a + b, 0);
        const oppTotal = Object.values(opponentScores).reduce((a, b) => a + b, 0);
        const normalizedScore = totalScore / 30; // rough normalization
        const oppNormalized = oppTotal / 30;

        for (const [stId, poll] of Object.entries(this.state.statePolling)) {
            const liveShare = this.getLiveVoteShare(stId);
            poll.player += normalizedScore * 0.5 * liveShare;
            poll.opponent += oppNormalized * 0.5 * liveShare;
            poll.trend += (normalizedScore - oppNormalized) * 0.3;
        }

        // Fundraising bump
        if (totalScore > 20) {
            const bump = 200000 + totalScore * 20000;
            this.state.finances.cashOnHand += bump;
            this.state.finances.totalRaised += bump;
        }

        c.momentum += normalizedScore * 5;

        // Winning the night carries momentum beyond the raw scores
        if (winner === 'player') { c.momentum += 8; o.momentum -= 5; }
        else if (winner === 'opponent') { o.momentum += 8; c.momentum -= 5; }

        this.state.debateHistory.push({
            week: this.state.week,
            winner: winner || null,
            playerTotal: Math.round(totalScore),
            opponentTotal: Math.round(oppTotal),
        });
        this.state.debatesCompleted++;

        // Assessment: head-to-head when we know the opponent's numbers,
        // otherwise fall back to raw-score thresholds
        const gap = totalScore - oppTotal;
        const assessment = winner
            ? (winner === 'player' ? (gap > 40 ? "Commanding performance" : "Solid showing") :
               winner === 'tie' ? "Fought to a draw" :
               gap > -40 ? "Outmaneuvered tonight" : "Rough night")
            : (totalScore > 30 ? "Commanding performance" :
               totalScore > 15 ? "Solid showing" :
               totalScore > 0 ? "Uneven performance" : "Rough night");

        return {
            totalScore,
            normalizedScore,
            winner: winner || null,
            assessment,
        };
    },

    // ═══════════════════════════════════════════════
    // ELECTION NIGHT
    // ═══════════════════════════════════════════════
    calculateElectionResult() {
        // Final adjustments
        this.applyFinalTurnout();

        const map = this.calculateElectoralMap();

        // Popular vote from the actual final state numbers (EV-weighted)
        let pVotes = 0, oVotes = 0, weight = 0;
        for (const [stId, poll] of Object.entries(this.state.statePolling)) {
            const st = window.StateData.find(s => s.id === stId);
            if (!st) continue;
            pVotes += poll.player * st.electoralVotes;
            oVotes += poll.opponent * st.electoralVotes;
            weight += st.electoralVotes;
        }
        // Normalize to a two-party-plus-other share (final turnout math can
        // push the raw sums past 100)
        const rawP = weight ? pVotes / weight : 50;
        const rawO = weight ? oVotes / weight : 50;
        const scale = rawP + rawO > 98 ? 98 / (rawP + rawO) : 1;
        const pPct = rawP * scale;
        const oPct = rawO * scale;

        const results = {
            playerEV: map.playerEV,
            opponentEV: map.opponentEV,
            stateResults: map.stateResults,
            winner: map.playerEV >= 270 ? 'player' : 'opponent',
            playerName: this.state.playerCandidate.name,
            opponentName: this.state.opponentCandidate.name,
            playerParty: this.state.playerParty,
            nationalPopularVote: {
                player: Math.round(pPct * 10) / 10,
                opponent: Math.round(oPct * 10) / 10,
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

            // Blend in banked early votes: they lock in whoever led when cast
            const ev = this.state.earlyVote[stId];
            if (ev && ev.pctBanked > 0) {
                const liveShare = Math.max(0, 1 - ev.pctBanked / 100);
                poll.player = ev.playerBanked + poll.player * liveShare;
                poll.opponent = ev.opponentBanked + poll.opponent * liveShare;
            }
        }
    },

    generateElectionNight() {
        const results = this.calculateElectionResult();

        // Poll close waves: minutes after 7:00 PM ET
        const waveMinutes = {
            '7:00 PM': 0, '7:30 PM': 30, '8:00 PM': 60, '9:00 PM': 120,
            '10:00 PM': 180, '11:00 PM': 240, '1:00 AM': 360,
        };
        const closeInfo = {};
        for (const [label, ids] of Object.entries(window.GameConstants.POLL_CLOSE_TIMES)) {
            for (const id of ids) closeInfo[id] = { label, minutes: waveMinutes[label] || 0 };
        }

        const calls = Object.entries(results.stateResults).map(([stId, result]) => {
            const close = closeInfo[stId] || { label: '8:00 PM', minutes: 60 };
            // How long after polls close before the race is projected
            let delay, tooClose = false;
            if (result.margin > 15) delay = 2 + Math.random() * 8;
            else if (result.margin > 8) delay = 30 + Math.random() * 60;
            else if (result.margin > 2) delay = 120 + Math.random() * 120;
            else { delay = 300 + Math.random() * 120; tooClose = true; }

            return {
                stateId: stId,
                stateName: (window.StateData.find(s => s.id === stId) || {}).name || stId,
                winner: result.winner,
                margin: Math.round(result.margin * 10) / 10,
                ev: result.ev,
                closeLabel: close.label,
                closeMinutes: close.minutes,
                callMinutes: Math.round(close.minutes + delay),
                tooCloseToCall: tooClose,
            };
        }).sort((a, b) => a.callMinutes - b.callMinutes);

        return { results, calls };
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
        // Backfill fields added after older saves were created
        const fresh = this.createFreshState();
        for (const key of ['endorsements', 'opponentEndorsements', 'pollHistory', 'earlyVote', 'debateHistory', 'opponentVP',
                           'playerTicket', 'opponentTicket', 'vpAnnouncementBias', 'opponentVPAnnouncementBias']) {
            if (this.state[key] === undefined) this.state[key] = fresh[key];
        }
        return this.state;
    }
};
