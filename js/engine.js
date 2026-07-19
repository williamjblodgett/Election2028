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
            publicAnger: 20,
            securityDetail: false,
            hospitalized: 0,
            assassinationAttempts: [],
            platform: null,
            opponentPlatform: null,
            flipFlops: 0,
            platformShiftedWeek: 0,
            primary: null,
            opponentPlaybook: null,
            activeScandals: [],
            transition: null,
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
        this.state.platform = this.seedPlatform(playerCandidate);
        this.state.opponentPlatform = this.seedPlatform(opponentCandidate);
        this.initPrimary();

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
        // 7b. Scandal-class events become evolving multi-week stories with
        // standardized deny / apologize / counterattack responses
        for (const evt of events) {
            if ((evt.category === 'SCANDAL' || evt.category === 'MEDIA_FIRESTORM') && !evt.isScandalStory) {
                const sc = this.spawnScandal(evt.title, 2 + (Math.random() < 0.3 ? 1 : 0), 'player');
                if (sc) {
                    evt.isScandalStory = true;
                    evt.scandalId = sc.id;
                    evt.choices = this.buildScandalResponseEvent(sc).choices;
                }
            }
        }

        // 7c. Ongoing stories evolve (escalations add follow-up cards)
        this.processScandals(events, summary);

        summary.events = events;

        // 8. Process event choices (if provided)
        if (actions.eventChoices) {
            for (const [eventId, choiceIdx] of Object.entries(actions.eventChoices)) {
                this.applyEventChoice(eventId, choiceIdx, events);
            }
        }

        // 9. Process opponent turn
        const oppActions = this.processOpponentTurn(actions);
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

        // 9d. Primary season: support dynamics, contests, dropouts
        const primaryResult = this.processPrimaryWeek(summary);

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

        // 12a. Platform alignment slowly moves states toward the better fit
        this.applyPlatformDrift();

        // 12b. Early voting banks votes in the final stretch
        this.processEarlyVoting();

        // 12c. Record battleground polling history for averages/sparklines
        this.recordPollHistory();

        // 12d. Update the national mood from this week's events
        this.updatePublicAnger(events);

        // 12e. Recovery: hospitalized candidate heals over time
        if (this.state.hospitalized > 0) this.state.hospitalized--;

        // 12f. Security threat roll (general election only)
        const assassinationEvent = this.checkAssassinationRisk();
        if (assassinationEvent) {
            summary.newsHeadlines.push(...assassinationEvent.headlines);
        }

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
        let gameOver = this.state.week > this.state.totalWeeks;
        if (assassinationEvent && !assassinationEvent.survived) gameOver = 'assassinated';
        if (this.state.primary && this.state.primary.lostNomination) gameOver = 'lostNomination';

        // 19. Clamp all values
        this.clampStats();

        return {
            summary,
            events,
            isDebateWeek,
            gameOver,
            phase: this.state.phase,
            assassinationEvent,
            primaryResult,
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
        // While the candidate recovers, surrogates carry a diminished campaign
        const recoveryMult = this.state.hospitalized > 0 ? 0.5 : 1;
        const boost = (0.5 + (charisma / 100) * 1.5) * recoveryMult;
        const enthusiasm_boost = (0.3 + (charisma / 100) * 0.7) * recoveryMult;

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
            this.bumpAnger(1.5); // attack ads heat the national mood
        } else if (tone === 'contrast') {
            poll.player += impact * 0.7;
            poll.opponent -= impact * 0.5;
            this.bumpAnger(0.5);
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
                this.bumpAnger(0.5); // fired-up crowds run hot
                effects.enthusiasm = 3; effects.baseTurnout = 2;
                break;
            case 'townhall':
                c.approval += 2; c.persuadableSupport += 2; c.authenticity = (c.authenticity || 50) + 3;
                this.state.finances.cashOnHand -= 30000;
                this.bumpAnger(-1); // listening tours cool the temperature
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
                this.bumpAnger(1); // digging dirt inflames the discourse
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
                this.bumpAnger(-1.5);
                break;
            case 'contrast':
                c.approval += 0.5; this.state.opponent.approval -= 1;
                c.mediaScore += 1;
                this.bumpAnger(1);
                break;
            case 'negative':
                this.state.opponent.approval -= 2; this.state.opponent.enthusiasm -= 1;
                c.scandalVulnerability += 2; c.approval -= 0.5;
                c.mediaScore += 2;
                this.bumpAnger(2.5);
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

        // Scandal stories: record the response strategy for weekly evolution
        if (event.isScandalStory) {
            this.setScandalResponse(event.scandalId, choiceIdx);
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
    // AI OPPONENT — adaptive strategy brain
    // ═══════════════════════════════════════════════
    processOpponentTurn(playerActions) {
        const opp = this.state.opponent;
        const actions = [];
        const mods = this.getDifficultyModifiers();
        const aiCfg = window.GameConstants.AI;

        // Arcade keeps the old forgiving randomness
        if (this.state.difficulty === 'arcade') return this.processOpponentTurnLegacy();

        // ── Assess the map and pick a posture ──
        const map = this.calculateElectoralMap();
        const evGap = map.opponentEV - map.playerEV; // negative = AI trailing
        const posture = evGap < -aiCfg.OFFENSE_EV_DEFICIT ? 'offense'
                      : evGap > aiCfg.DEFENSE_EV_LEAD ? 'defense' : 'balanced';

        // ── Pick targets ──
        const battlegrounds = window.StateData
            .filter(s => s.isBattleground && this.state.statePolling[s.id])
            .map(s => {
                const poll = this.state.statePolling[s.id];
                return { s, poll, margin: poll.player - poll.opponent }; // + = player leads
            });
        let pool;
        if (posture === 'offense') {
            // Attack the player's narrowest holds
            pool = battlegrounds.filter(x => x.margin > 0).sort((a, b) => a.margin - b.margin);
            if (!pool.length) pool = battlegrounds.sort((a, b) => Math.abs(a.margin) - Math.abs(b.margin));
        } else if (posture === 'defense') {
            // Shore up their own narrowest holds
            pool = battlegrounds.filter(x => x.margin < 0).sort((a, b) => b.margin - a.margin);
            if (!pool.length) pool = battlegrounds.sort((a, b) => Math.abs(a.margin) - Math.abs(b.margin));
        } else {
            pool = battlegrounds.sort((a, b) => Math.abs(a.margin) - Math.abs(b.margin));
        }
        const targetCount = aiCfg.TARGET_COUNT + (this.state.difficulty === 'iron' ? 1 : 0);
        const targets = pool.slice(0, targetCount);
        const tone = posture === 'offense' ? 'negative' : posture === 'defense' ? 'positive' : 'contrast';

        // ── Execute: visits ──
        const budgetMult = this.state.difficulty === 'iron' ? 1.2 : 1;
        for (const t of targets.slice(0, 3)) {
            const boost = (0.5 + Math.random() * 0.8) * mods.aiStrengthMod * this.getLiveVoteShare(t.s.id);
            t.poll.opponent += boost;
            t.poll.player -= boost * 0.25;
            actions.push(`Campaigned in ${t.s.name}`);
        }

        // ── Execute: ads in targets, tone by posture ──
        if (opp.cash > 800000) {
            const adTargets = targets.slice(0, posture === 'offense' ? 3 : 2);
            for (const t of adTargets) {
                const spend = 150000 * budgetMult;
                if (opp.cash < spend) break;
                opp.cash -= spend;
                const impact = (0.35 + Math.random() * 0.5) * mods.aiStrengthMod * this.getLiveVoteShare(t.s.id);
                if (tone === 'negative') {
                    t.poll.player -= impact * 1.2;
                    t.poll.opponent += impact * 0.3;
                    opp.scandalVulnerability += 0.7; // their mud has a cost too
                } else {
                    t.poll.opponent += impact;
                }
                actions.push(`${tone === 'negative' ? 'Attack ads' : 'Ads'} in ${t.s.name}`);
            }
            if (tone === 'negative') this.bumpAnger(1); // their attacks heat the mood
        }

        // ── Counterpunch when the player goes negative ──
        const playerWentNegative = playerActions && playerActions.strategy === 'negative';
        if (playerWentNegative && Math.random() < 0.6) {
            this.state.campaign.approval -= 0.5;
            actions.push('Counterattacked your negative campaign');
        }

        // ── Late-race ground game: bank early votes in targets ──
        const evCfg = window.GameConstants.EARLY_VOTE;
        if (this.state.phase === 'general' && this.state.week >= evCfg.START_WEEK) {
            for (const t of targets) {
                if (!this.state.earlyVote[t.s.id]) {
                    this.state.earlyVote[t.s.id] = { playerBanked: 0, opponentBanked: 0, pctBanked: 0 };
                }
                const ev = this.state.earlyVote[t.s.id];
                const add = Math.min(0.7 * mods.aiStrengthMod, evCfg.MAX_BANKED_PCT - ev.pctBanked);
                if (add > 0) { ev.opponentBanked += add; ev.pctBanked += add; }
            }
            actions.push('Ran turnout operations in battlegrounds');
        }

        // ── Debate prep the week before a debate ──
        if (window.GameConstants.DEBATE_WEEKS.includes(this.state.week + 1)) {
            opp.debateSkill += 2;
            actions.push('Hunkered down for debate prep');
        }

        // ── Fundraising scaled by momentum and confidence ──
        const aiRaise = (450000 + Math.random() * 550000) * mods.aiStrengthMod * budgetMult *
            (1 + Math.max(-0.3, opp.momentum / 200));
        opp.cash += aiRaise;

        // ── Mood drift ──
        opp.momentum += (Math.random() - 0.45) * 4 + (posture === 'offense' ? 1 : 0);
        opp.enthusiasm += (Math.random() - 0.5) * 2;
        opp.approval += (Math.random() - 0.5) * 1;
        opp.nationalPolling = 100 - this.state.campaign.nationalPolling - 8;

        // ── Publish the playbook for the intel panel ──
        this.state.opponentPlaybook = {
            posture,
            tone,
            targets: targets.map(t => t.s.id),
            week: this.state.week,
        };

        return actions;
    },

    // The original forgiving AI, kept for arcade difficulty
    processOpponentTurnLegacy() {
        const opp = this.state.opponent;
        const actions = [];
        const mods = this.getDifficultyModifiers();

        const battlegrounds = window.StateData
            .filter(s => s.isBattleground)
            .sort((a, b) => {
                const pa = this.state.statePolling[a.id];
                const pb = this.state.statePolling[b.id];
                const marginA = pa ? Math.abs(pa.player - pa.opponent) : 99;
                const marginB = pb ? Math.abs(pb.player - pb.opponent) : 99;
                return marginA - marginB;
            });

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

        if (opp.cash > 1000000) {
            const adTarget = battlegrounds[Math.floor(Math.random() * Math.min(3, battlegrounds.length))];
            if (adTarget) {
                const poll = this.state.statePolling[adTarget.id];
                if (poll) {
                    poll.opponent += 0.3 + Math.random() * 0.7 * mods.aiStrengthMod;
                    actions.push(`Ran ads in ${adTarget.name}`);
                }
            }
        }

        const aiRaise = 400000 + Math.random() * 600000 * mods.aiStrengthMod;
        opp.cash += aiRaise;
        opp.momentum += (Math.random() - 0.45) * 5;
        opp.enthusiasm += (Math.random() - 0.5) * 2;
        opp.approval += (Math.random() - 0.5) * 1;
        opp.nationalPolling = 100 - this.state.campaign.nationalPolling - 8;

        this.state.opponentPlaybook = { posture: 'improvising', tone: 'positive', targets: battlegrounds.slice(0, 2).map(s => s.id), week: this.state.week };
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
    // SCANDAL LIFECYCLE
    // ═══════════════════════════════════════════════
    spawnScandal(title, severity, target) {
        const cfg = window.GameConstants.SCANDAL_LIFECYCLE;
        const list = this.state.activeScandals;
        if (list.filter(s => s.target === target).length >= cfg.MAX_ACTIVE) return null;
        const sc = {
            id: 'sc_' + this.state.week + '_' + Math.floor(Math.random() * 100000),
            title,
            severity,
            stage: 'breaking',
            startWeek: this.state.week,
            lastResponse: 'none',
            target,
        };
        list.push(sc);
        return sc;
    },

    buildScandalResponseEvent(sc, flavor) {
        return {
            id: 'scandal_resp_' + sc.id + '_w' + this.state.week,
            isScandalStory: true,
            scandalId: sc.id,
            title: sc.title,
            description: flavor || 'The story is gathering steam. How does the campaign respond?',
            category: 'SCANDAL_RESPONSE',
            isBreakingNews: true,
            choices: [
                { text: 'Deny everything — give them nothing', effects: {}, riskLevel: 'risky', outcomeText: 'The campaign stonewalls. If more comes out, the denials become the story.' },
                { text: 'Apologize and own it', effects: { approval: -2 }, riskLevel: 'safe', outcomeText: 'A rough news cycle — but contrition tends to shorten the story.' },
                { text: 'Counterattack — turn it back on your opponent', effects: {}, riskLevel: 'moderate', outcomeText: 'You change the subject with fire. The base cheers; the temperature rises.' },
            ],
        };
    },

    setScandalResponse(scandalId, choiceIdx) {
        const sc = this.state.activeScandals.find(s => s.id === scandalId);
        if (!sc) return;
        sc.lastResponse = ['deny', 'apologize', 'counterattack'][choiceIdx] || 'none';
        if (sc.lastResponse === 'counterattack') {
            this.state.opponent.approval -= 1.5;
            this.bumpAnger(2);
        }
    },

    processScandals(events, summary) {
        const cfg = window.GameConstants.SCANDAL_LIFECYCLE;
        const resolved = [];

        for (const sc of this.state.activeScandals) {
            if (sc.startWeek === this.state.week) continue; // give the initial response a week to land

            const w = cfg.WEIGHTS[sc.lastResponse] || cfg.WEIGHTS.none;
            const media = sc.target === 'player' ? this.state.campaign.mediaScore : this.state.opponent.mediaScore;
            const escalate = w.escalate * (1 - (media - 50) / 200); // a good press shop calms stories
            const roll = Math.random();

            if (roll < escalate) {
                sc.severity = Math.min(5, sc.severity + 1);
                sc.stage = 'developing';
                if (sc.target === 'player') {
                    const coverUp = sc.lastResponse === 'deny';
                    this.state.campaign.approval -= coverUp ? 3 : 1.5;
                    this.bumpAnger(coverUp ? 2 : 1.5);
                    summary.newsHeadlines.push(`NEW REVELATIONS: ${sc.title.toUpperCase()}${coverUp ? ' — DENIALS UNRAVEL' : ''}`);
                    events.push(this.buildScandalResponseEvent(sc, 'New reporting escalates the story. The last response didn\'t hold.'));
                } else {
                    this.state.opponent.approval -= 2;
                    summary.newsHeadlines.push(`OPPONENT SCANDAL DEEPENS: ${sc.title.toUpperCase()}`);
                }
            } else if (roll < escalate + w.fade) {
                sc.severity -= 1;
                sc.stage = 'fading';
                if (sc.severity <= 0) {
                    resolved.push(sc.id);
                    if (sc.target === 'player') this.state.campaign.approval += 1;
                    summary.newsHeadlines.push(`${sc.title.toUpperCase()} FADES FROM THE HEADLINES`);
                }
            }

            // A live opponent scandal keeps bleeding them
            if (sc.target === 'opponent' && sc.severity > 0) {
                this.state.opponent.approval -= 0.5;
            }
        }
        this.state.activeScandals = this.state.activeScandals.filter(s => !resolved.includes(s.id));

        // Opponent scandals surface based on their vulnerability — which your
        // Oppo Research raises. This is the payoff.
        if (Math.random() < this.state.opponent.scandalVulnerability * cfg.OPPONENT_SPAWN_BASE) {
            const titles = ['Campaign Finance Irregularities', 'Leaked Internal Memo', 'Staff Exodus Story', 'Undisclosed Conflict of Interest', 'Resurfaced Recording'];
            const sc = this.spawnScandal(titles[Math.floor(Math.random() * titles.length)], 2, 'opponent');
            if (sc) {
                summary.newsHeadlines.push(`BREAKING: ${this.state.opponentCandidate.name.split(' ').pop().toUpperCase()} CAMPAIGN ROCKED — ${sc.title.toUpperCase()}`);
            }
        }
    },

    // ═══════════════════════════════════════════════
    // PRIMARY SEASON
    // ═══════════════════════════════════════════════
    // The roster a candidate belongs to: legends rival legends, moderns
    // rival moderns; custom candidates face the modern field
    getPartyPool(candidate) {
        const key = candidate.party === 'Democrat' ? 'democrats' : 'republicans';
        if (candidate.isLegend && window.LegendData) return window.LegendData[key];
        return window.CandidateData[key] || [];
    },

    initPrimary() {
        const cfg = window.GameConstants.PRIMARY;
        let pool = this.getPartyPool(this.state.playerCandidate).filter(c =>
            c.id !== this.state.playerCandidate.id && c.id !== this.state.opponentCandidate.id &&
            c.name !== this.state.playerCandidate.name);
        // Legends bench too thin? borrow from the modern field
        if (pool.length < 2) {
            const key = this.state.playerParty === 'democrat' ? 'democrats' : 'republicans';
            pool = pool.concat((window.CandidateData[key] || []).filter(c =>
                c.id !== this.state.playerCandidate.id && c.id !== this.state.opponentCandidate.id));
        }
        // Two same-party rivals, random draw
        const shuffled = [...pool].sort(() => Math.random() - 0.5);
        const rivals = shuffled.slice(0, 2).map((c, i) => ({
            id: c.id,
            name: c.name,
            party: c.party,
            color: c.color,
            portraitEmoji: c.portraitEmoji,
            ideologicalElasticity: c.ideologicalElasticity || 50,
            debate: c.debate || 55,
            homeState: c.homeState,
            support: cfg.RIVAL_START_SUPPORT[i] || 20,
            delegates: 0,
            droppedOut: false,
        }));
        // Harder difficulties narrow the head start
        const mods = this.getDifficultyModifiers();
        const startSupport = mods.aiStrengthMod > 1
            ? cfg.PLAYER_START_SUPPORT - 4
            : cfg.PLAYER_START_SUPPORT;

        this.state.primary = {
            rivals,
            playerSupport: startSupport,
            playerDelegates: 0,
            undecided: Math.max(5, 100 - startSupport - rivals.reduce((a, r) => a + r.support, 0)),
            decided: false,
            lostNomination: false,
            contestHistory: [],
        };
    },

    // Weekly primary dynamics: support drift, rival AI, contests, dropouts
    processPrimaryWeek(summary) {
        const p = this.state.primary;
        if (!p || p.decided || this.state.phase !== 'primary') return null;
        const cfg = window.GameConstants.PRIMARY;
        const c = this.state.campaign;

        // Player support drift: campaign strength + base alignment + noise
        const baseAlign = this.getBaseAlignment(); // running to the base pays in the primary
        let drift = 0;
        drift += (c.enthusiasm - 50) / 60;
        drift += c.momentum / 60;
        drift += (c.mediaScore - 50) / 90;
        drift += baseAlign * 0.8;
        drift += (Math.random() - 0.5) * 1.6;
        p.playerSupport += drift;

        // Rival AI: they campaign, and the leader takes incoming fire
        const alive = p.rivals.filter(r => !r.droppedOut);
        const leaderIsPlayer = p.playerSupport >= Math.max(...alive.map(r => r.support), 0);
        for (const r of alive) {
            let rDrift = (Math.random() - 0.45) * 1.6;
            rDrift += ((r.ideologicalElasticity > 60 ? 1 : 0.5)) * 0.3; // firebrands generate energy
            if (leaderIsPlayer && Math.random() < 0.5) {
                // Attack the frontrunner
                p.playerSupport -= 0.7;
                rDrift += 0.5;
                summary.newsHeadlines.push(`${r.name.split(' ').pop().toUpperCase()} SHARPENS ATTACKS ON THE FRONTRUNNER`);
            }
            r.support = Math.max(2, r.support + rDrift);
        }
        p.playerSupport = Math.max(5, Math.min(80, p.playerSupport));

        // Normalize against undecided pool
        const total = p.playerSupport + p.rivals.reduce((a, r) => a + (r.droppedOut ? 0 : r.support), 0);
        p.undecided = Math.max(3, 100 - total);

        // Contest night?
        let contestResult = null;
        const contest = window.GameConstants.PRIMARY_CALENDAR.find(ct => ct.week === this.state.week);
        if (contest) contestResult = this.runPrimaryContest(contest, summary);

        // Dropouts: mathematically eliminated, or floundering after Super Tuesday
        const remaining = window.GameConstants.PRIMARY_CALENDAR
            .filter(ct => ct.week > this.state.week)
            .reduce((a, ct) => a + ct.delegates, 0);
        for (const r of p.rivals) {
            if (r.droppedOut) continue;
            const eliminated = r.delegates + remaining < cfg.DELEGATES_TO_CLINCH;
            const floundering = this.state.week > 8 && r.support < cfg.DROPOUT_SUPPORT;
            if (eliminated || floundering) {
                r.droppedOut = true;
                // Support redistributes toward the ideologically nearest survivor
                const share = r.support;
                r.support = 0;
                const survivors = p.rivals.filter(x => !x.droppedOut);
                const playerElastic = (this.state.playerCandidate.ideologicalElasticity || 50);
                const nearestIsPlayer = !survivors.length ||
                    Math.abs(playerElastic - r.ideologicalElasticity) <=
                    Math.min(...survivors.map(s => Math.abs(s.ideologicalElasticity - r.ideologicalElasticity)));
                if (nearestIsPlayer) {
                    p.playerSupport += share * 0.6;
                    summary.newsHeadlines.push(`${r.name.toUpperCase()} DROPS OUT, ENDORSES ${this.state.playerCandidate.name.split(' ').pop().toUpperCase()}`);
                } else {
                    survivors[0].support += share * 0.6;
                    summary.newsHeadlines.push(`${r.name.toUpperCase()} SUSPENDS CAMPAIGN`);
                }
            }
        }

        // Endgame checks
        if (p.playerDelegates >= cfg.DELEGATES_TO_CLINCH && !p.decided) {
            p.decided = true;
            c.enthusiasm += 8;
            c.donorConfidence += 10;
            c.momentum += 15;
            summary.newsHeadlines.push(`${this.state.playerCandidate.name.split(' ').pop().toUpperCase()} CLINCHES THE NOMINATION`);
        }
        const rivalClinched = p.rivals.find(r => r.delegates >= cfg.DELEGATES_TO_CLINCH);
        if (rivalClinched && !p.decided) {
            p.lostNomination = true;
            p.decided = true;
        }
        // Calendar exhausted with no outright majority → the delegate leader
        // takes the nomination on the convention floor
        const lastContestWeek = window.GameConstants.PRIMARY_CALENDAR[window.GameConstants.PRIMARY_CALENDAR.length - 1].week;
        if (!p.decided && this.state.week >= lastContestWeek) {
            const topRivalDelegates = Math.max(0, ...p.rivals.map(r => r.delegates));
            if (p.playerDelegates >= topRivalDelegates) {
                p.decided = true;
                c.enthusiasm += 6;
                c.momentum += 10;
                summary.newsHeadlines.push(`${this.state.playerCandidate.name.split(' ').pop().toUpperCase()} SECURES THE NOMINATION ON THE CONVENTION FLOOR`);
            } else {
                p.lostNomination = true;
                p.decided = true;
            }
        }

        return contestResult;
    },

    runPrimaryContest(contest, summary) {
        const p = this.state.primary;
        const cfg = window.GameConstants.PRIMARY;
        const c = this.state.campaign;

        // Shares: national support + ground game edge + home-state bumps + noise
        const entrants = [
            { who: 'player', name: this.state.playerCandidate.name, base: p.playerSupport + (c.groundGame - 30) / 10, home: this.state.playerCandidate.homeState },
            ...p.rivals.filter(r => !r.droppedOut).map(r => ({ who: r.id, name: r.name, base: r.support, home: r.homeState, rival: r })),
        ];
        for (const e of entrants) {
            e.share = e.base + (Math.random() - 0.5) * 6;
            if (e.home && contest.states.some(id => {
                const st = window.StateData.find(s => s.id === id);
                return st && st.name === e.home;
            })) e.share += 6;
            e.share = Math.max(1, e.share);
        }
        const totalShare = entrants.reduce((a, e) => a + e.share, 0);
        for (const e of entrants) e.pct = (e.share / totalShare) * 100;

        // Proportional delegates among viable candidates
        const viable = entrants.filter(e => e.pct >= cfg.VIABILITY_THRESHOLD);
        const viableTotal = viable.reduce((a, e) => a + e.pct, 0) || 1;
        for (const e of entrants) {
            e.delegates = viable.includes(e) ? Math.round(contest.delegates * (e.pct / viableTotal)) : 0;
            if (e.who === 'player') p.playerDelegates += e.delegates;
            else if (e.rival) e.rival.delegates += e.delegates;
        }

        entrants.sort((a, b) => b.pct - a.pct);
        const winner = entrants[0];
        if (winner.who === 'player') { c.momentum += 5; c.enthusiasm += 2; }
        else c.momentum -= 3;

        const result = {
            name: contest.name,
            week: this.state.week,
            delegates: contest.delegates,
            results: entrants.map(e => ({ name: e.name, pct: Math.round(e.pct * 10) / 10, delegates: e.delegates, isPlayer: e.who === 'player' })),
            winnerName: winner.name,
            playerWon: winner.who === 'player',
        };
        p.contestHistory.push(result);
        summary.newsHeadlines.push(`${winner.name.split(' ').pop().toUpperCase()} WINS ${contest.name.toUpperCase()} — ${winner.delegates} DELEGATES`);
        return result;
    },

    // ═══════════════════════════════════════════════
    // POLICY PLATFORM
    // ═══════════════════════════════════════════════
    seedPlatform(candidate) {
        // Elastic candidates start further from center; D left, R right
        const isDem = candidate.party === 'Democrat';
        const magnitude = (candidate.ideologicalElasticity || 50) > 60 ? 2 : 1;
        const stance = isDem ? -magnitude : magnitude;
        const platform = {};
        for (const issue of window.GameConstants.ISSUES) {
            platform[issue.key] = stance;
        }
        return platform;
    },

    // Where a state's electorate sits on the -2..+2 axis
    getStateStance(st) {
        return Math.max(-2, Math.min(2, st.partisanLean / 15));
    },

    // 0..1: how well a platform matches a state's priorities
    computePlatformFit(platform, st) {
        if (!platform || !st.issueSalience) return 0.5;
        const stance = this.getStateStance(st);
        let weighted = 0, totalSalience = 0;
        for (const [key, salience] of Object.entries(st.issueSalience)) {
            const pos = platform[key];
            if (typeof pos !== 'number') continue;
            weighted += salience * (1 - Math.abs(pos - stance) / 4);
            totalSalience += salience;
        }
        return totalSalience > 0 ? weighted / totalSalience : 0.5;
    },

    // Weekly polling drift toward the better-aligned platform
    applyPlatformDrift() {
        if (!this.state.platform || !this.state.opponentPlatform) return;
        const max = window.GameConstants.PLATFORM.DRIFT_MAX;
        for (const st of window.StateData) {
            const poll = this.state.statePolling[st.id];
            if (!poll) continue;
            const fitGap = this.computePlatformFit(this.state.platform, st) -
                           this.computePlatformFit(this.state.opponentPlatform, st);
            const drift = fitGap * max * 2 * this.getLiveVoteShare(st.id);
            poll.player += drift;
            poll.opponent -= drift * 0.5;
        }
    },

    // -1..1: how well the platform matches the player's party base
    getBaseAlignment() {
        if (!this.state.platform) return 0;
        const center = (this.state.playerParty === 'democrat' ? -1 : 1) * window.GameConstants.PLATFORM.BASE_CENTER;
        const keys = Object.keys(this.state.platform);
        let dist = 0;
        for (const k of keys) dist += Math.abs(this.state.platform[k] - center);
        const avg = dist / (keys.length || 1); // 0 (perfect) .. 3.5 (opposite)
        return 1 - avg / 1.75; // ≈ 1 at the base's center, negative when centrist/crossed
    },

    shiftPlatform(issueKey, dir) {
        const cfg = window.GameConstants.PLATFORM;
        if (!this.state.platform || this.state.platform[issueKey] === undefined) {
            return { ok: false, message: 'Unknown issue.' };
        }
        if (this.state.platformShiftedWeek === this.state.week) {
            return { ok: false, message: 'You can only reposition on one issue per week.' };
        }
        const next = Math.max(-2, Math.min(2, this.state.platform[issueKey] + (dir > 0 ? 1 : -1)));
        if (next === this.state.platform[issueKey]) {
            return { ok: false, message: 'Already at the end of that spectrum.' };
        }
        this.state.platform[issueKey] = next;
        this.state.platformShiftedWeek = this.state.week;
        this.state.flipFlops++;
        this.state.campaign.enthusiasm -= cfg.SHIFT_ENTHUSIASM_COST;
        this.state.campaign.scandalVulnerability += cfg.SHIFT_SCANDAL_COST;
        const issue = window.GameConstants.ISSUES.find(i => i.key === issueKey);
        const headline = `${this.state.playerCandidate.name.split(' ').pop().toUpperCase()} SHIFTS POSITION ON ${(issue ? issue.label : issueKey).toUpperCase()}`;
        this.state.newsHistory.push(headline);
        return { ok: true, message: `Position shifted. The press notices — flip-flop #${this.state.flipFlops}.`, headline };
    },

    // ═══════════════════════════════════════════════
    // PUBLIC ANGER & CANDIDATE SECURITY
    // ═══════════════════════════════════════════════
    // Nudge the national mood. Campaign-tone effects live in the action
    // handlers themselves (applyStrategy/applyAdBuy/applyActivityEffects)
    // because the UI applies those directly, outside processWeek's actions.
    bumpAnger(delta) {
        if (!this.state || typeof this.state.publicAnger !== 'number') return;
        this.state.publicAnger = Math.max(0, Math.min(100, Math.round((this.state.publicAnger + delta) * 10) / 10));
    },

    updatePublicAnger(events) {
        const cfg = window.GameConstants.ANGER;
        let anger = this.state.publicAnger;

        // Firestorms and scandals raise the heat
        for (const evt of (events || [])) {
            if (evt.category === 'MEDIA_FIRESTORM' || evt.category === 'SCANDAL' || evt.category === 'NATIONAL_CRISIS') {
                anger += 2;
            }
        }

        // A very high scandal profile keeps the pot simmering
        if (this.state.campaign.scandalVulnerability > 70) anger += 1;

        // Natural cooling, then clamp
        anger *= cfg.WEEKLY_DECAY;
        this.state.publicAnger = Math.max(0, Math.min(100, Math.round(anger * 10) / 10));
    },

    // Called from processDebateResults: incendiary debates raise anger
    addDebateAnger(playerScores) {
        const viral = playerScores.viral || 0;
        const suburban = playerScores.suburban || 0;
        // High viral + alienating suburbans = a divisive, rage-baiting night
        let delta = 0;
        if (viral > 25) delta += 2;
        if (suburban < 5) delta += 2;
        if (delta > 0) {
            this.state.publicAnger = Math.min(100, this.state.publicAnger + delta);
        }
    },

    activateSecurityDetail() {
        if (this.state.securityDetail) return { ok: false, message: 'Security detail already active.' };
        const cost = window.GameConstants.ANGER.SECURITY_COST;
        if (this.state.finances.cashOnHand < cost) return { ok: false, message: 'Not enough cash for a security detail.' };
        this.state.securityDetail = true;
        this.state.finances.cashOnHand -= cost;
        this.state.finances.totalSpent += cost;
        this.state.campaign.cash = this.state.finances.cashOnHand;
        return { ok: true, message: 'Enhanced security detail deployed. Threats are less likely and more survivable.' };
    },

    getAngerLevel() {
        const t = window.GameConstants.ANGER.THRESHOLDS;
        const a = this.state.publicAnger;
        if (a >= t.SEVERE) return 'SEVERE';
        if (a >= t.HIGH) return 'HIGH';
        if (a >= t.ELEVATED) return 'ELEVATED';
        return 'LOW';
    },

    checkAssassinationRisk() {
        const cfg = window.GameConstants.ANGER;
        // Only a general-election concern, never mid-recovery
        if (this.state.phase !== 'general') return null;
        if (this.state.hospitalized > 0) return null;
        if (this.state.publicAnger < cfg.ATTEMPT_MIN_ANGER) return null;

        let chance = (this.state.publicAnger - cfg.ATTEMPT_MIN_ANGER) * cfg.ATTEMPT_CHANCE_PER_POINT;
        if (this.state.securityDetail) chance *= cfg.SECURITY_ATTEMPT_MULT;
        if (Math.random() >= chance) return null;

        // An attempt occurs — roll for survival
        const survival = cfg.BASE_SURVIVAL + (this.state.securityDetail ? cfg.SECURITY_SURVIVAL_BONUS : 0);
        const survived = Math.random() < survival;
        const name = this.state.playerCandidate.name;
        const last = name.split(' ').pop().toUpperCase();

        const record = { week: this.state.week, survived, hadSecurity: this.state.securityDetail };
        this.state.assassinationAttempts.push(record);

        if (survived) {
            const c = this.state.campaign;
            // A nation rallies: sympathy surge across the board
            c.approval += 6;
            c.enthusiasm += 8;
            c.momentum += 15;
            c.mediaScore += 5;
            for (const [stId, poll] of Object.entries(this.state.statePolling)) {
                poll.player += 1.5 * this.getLiveVoteShare(stId);
                poll.trend += 0.5;
            }
            this.state.publicAnger = Math.max(20, this.state.publicAnger - 35);
            this.state.hospitalized = cfg.HOSPITAL_WEEKS;
            return {
                survived: true,
                hadSecurity: record.hadSecurity,
                candidateName: name,
                headlines: [
                    `BREAKING: SHOTS FIRED AT ${last} CAMPAIGN EVENT`,
                    `${last} WOUNDED BUT STABLE — NATION HOLDS ITS BREATH`,
                    `A SHAKEN COUNTRY RALLIES AROUND ${last}`,
                ],
            };
        }

        // Tragedy — the campaign ends
        return {
            survived: false,
            hadSecurity: record.hadSecurity,
            candidateName: name,
            headlines: [
                `BREAKING: SHOTS FIRED AT ${last} CAMPAIGN EVENT`,
                `A NATION IN MOURNING`,
            ],
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
    processDebateResults(debateScores, opponentScores, winner, opts) {
        const c = this.state.campaign;
        const o = this.state.opponent;
        opponentScores = opponentScores || {};
        opts = opts || {};

        // Primary debates move primary support, not the general-election map
        if (opts.primaryMode && this.state.primary && !this.state.primary.decided) {
            const p = this.state.primary;
            const totalScoreP = Object.values(debateScores).reduce((a, b) => a + b, 0);
            c.mediaScore += (debateScores.press || 0) * 0.4;
            c.enthusiasm += (debateScores.base || 0) * 0.4;
            c.onlineInfluence += (debateScores.viral || 0) * 0.4;
            if (winner === 'player') { p.playerSupport += 3; c.momentum += 8; }
            else if (winner === 'opponent') {
                p.playerSupport -= 2;
                const leader = p.rivals.filter(r => !r.droppedOut).sort((a, b) => b.support - a.support)[0];
                if (leader) leader.support += 3;
                c.momentum -= 5;
            }
            this.addDebateAnger(debateScores);
            this.state.debateHistory.push({
                week: this.state.week, winner: winner || null, primary: true,
                playerTotal: Math.round(totalScoreP),
                opponentTotal: Math.round(Object.values(opponentScores).reduce((a, b) => a + b, 0)),
            });
            this.state.debatesCompleted++;
            const gapP = totalScoreP - Object.values(opponentScores).reduce((a, b) => a + b, 0);
            return {
                totalScore: totalScoreP,
                normalizedScore: totalScoreP / 30,
                winner: winner || null,
                assessment: winner === 'player' ? (gapP > 40 ? "Commanding performance" : "Solid showing") :
                            winner === 'tie' ? "Fought to a draw" : "Outmaneuvered tonight",
            };
        }

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

        // A rage-baiting debate performance heats the national mood
        this.addDebateAnger(debateScores);

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

    // ═══════════════════════════════════════════════
    // TRANSITION & CABINET (post-victory)
    // ═══════════════════════════════════════════════
    beginTransition(results) {
        if (this.state.transition) return this.state.transition;
        // Coattails: popular-vote margin drives your Senate majority;
        // electoral-vote margin drives political capital for deal-cutting
        const margin = results.nationalPopularVote.player - results.nationalPopularVote.opponent;
        const jitter = Math.floor(Math.random() * 5) - 2;
        const senateSeats = Math.max(44, Math.min(58, 50 + Math.round(margin * 1.2) + jitter));
        const capital = Math.max(3, Math.min(12, 5 + Math.round((results.playerEV - 270) / 25)));
        this.state.transition = {
            senateSeats,
            capital,
            posts: {},      // postId -> installed option (+ votesFor/votesAgainst)
            failed: [],     // burned nominee ids — can't renominate
            log: [],
            complete: false,
        };
        return this.state.transition;
    },

    getCabinetOptions(postId) {
        const gs = this.state;
        const party = gs.playerCandidate.party;
        const pool = ((window.CabinetData.OPTIONS[party] || {})[postId]) || [];
        const options = pool.map(o => Object.assign({}, o));
        // Team of Rivals: your defeated general-election opponent, for State
        if (postId === 'state' && gs.opponentCandidate) {
            const oc = gs.opponentCandidate;
            options.unshift({
                id: oc.id, name: oc.name, title: oc.title || 'Defeated nominee',
                competence: Math.round(((oc.debate || 60) + (oc.mediaHandling || 60)) / 2),
                loyalty: 25, controversy: 60, rival: true,
                blurb: 'The boldest play in politics: hand your defeated opponent the world stage. History remembers a Team of Rivals — if it doesn\'t blow up.',
            });
        }
        // Party unity: defeated primary rivals for Chief of Staff / Treasury
        if ((postId === 'chief' || postId === 'treasury') && gs.primary && gs.primary.rivals) {
            for (const r of gs.primary.rivals) {
                options.push({
                    id: r.id, name: r.name, title: r.title || 'Former primary rival',
                    competence: Math.round(((r.charisma || 60) + (r.debate || 60)) / 2),
                    loyalty: 55, controversy: postId === 'chief' ? 0 : 35, rival: true,
                    blurb: 'Party unity made flesh — a primary rival brought inside the tent.',
                });
            }
        }
        // Exclude anyone already serving, burned by the Senate, on your ticket
        const t = gs.transition || { posts: {}, failed: [] };
        const taken = new Set(Object.values(t.posts).map(p => p.id));
        t.failed.forEach(id => taken.add(id));
        if (gs.vpChoice && gs.vpChoice.id) taken.add(gs.vpChoice.id);
        taken.add(gs.playerCandidate.id);
        return options.filter(o => o.id && !taken.has(o.id));
    },

    nominate(postId, option, cutDeals) {
        const t = this.state.transition;
        const post = window.CabinetData.POSTS.find(p => p.id === postId);
        if (!t || !post || t.posts[postId]) return null;
        if (!post.confirmable) {
            t.posts[postId] = Object.assign({ votesFor: null, votesAgainst: null }, option);
            t.log.push(`${option.name} named ${post.title}.`);
            this.checkTransitionComplete();
            return { confirmed: true, appointed: true, votesFor: null, votesAgainst: null };
        }
        // Confirmation: your Senate seats minus defections plus crossovers.
        // Deal-cutting spends 2 political capital to whip wavering votes.
        let defections = Math.max(0, Math.round((option.controversy - 40) / 12)) + Math.floor(Math.random() * 3);
        let crossovers = Math.max(0, Math.round((60 - option.controversy) / 15));
        if (cutDeals && t.capital >= 2) {
            t.capital -= 2;
            defections = Math.max(0, defections - 2);
            crossovers += 1;
        }
        const votesFor = Math.max(0, Math.min(100, t.senateSeats - defections + crossovers));
        const votesAgainst = 100 - votesFor;
        const confirmed = votesFor >= 50; // the VP breaks a 50-50 tie
        if (confirmed) {
            t.posts[postId] = Object.assign({ votesFor, votesAgainst }, option);
            t.log.push(`${option.name} confirmed as ${post.title}, ${votesFor}–${votesAgainst}.`);
        } else {
            t.failed.push(option.id);
            t.capital = Math.max(0, t.capital - 1);
            t.log.push(`${option.name} rejected by the Senate, ${votesFor}–${votesAgainst}. The nomination collapses.`);
        }
        this.checkTransitionComplete();
        return { confirmed, votesFor, votesAgainst };
    },

    checkTransitionComplete() {
        const t = this.state.transition;
        if (t && window.CabinetData.POSTS.every(p => t.posts[p.id])) t.complete = true;
    },

    getCabinetGrade() {
        const t = this.state.transition;
        if (!t) return null;
        const picks = Object.values(t.posts);
        if (!picks.length) return null;
        const score = Math.round(picks.reduce((s, p) => s + p.competence * 0.7 + p.loyalty * 0.3, 0) / picks.length);
        const letter = score >= 86 ? 'A+' : score >= 80 ? 'A' : score >= 73 ? 'B' : score >= 65 ? 'C' : score >= 55 ? 'D' : 'F';
        return { score, letter };
    },

    serialize() {
        return JSON.stringify(this.state);
    },

    deserialize(data) {
        this.state = JSON.parse(data);
        // Backfill fields added after older saves were created
        const fresh = this.createFreshState();
        for (const key of ['endorsements', 'opponentEndorsements', 'pollHistory', 'earlyVote', 'debateHistory', 'opponentVP',
                           'playerTicket', 'opponentTicket', 'vpAnnouncementBias', 'opponentVPAnnouncementBias',
                           'publicAnger', 'securityDetail', 'hospitalized', 'assassinationAttempts',
                           'platform', 'opponentPlatform', 'flipFlops', 'platformShiftedWeek',
                           'primary', 'opponentPlaybook', 'activeScandals', 'transition']) {
            if (this.state[key] === undefined) this.state[key] = fresh[key];
        }
        // Old saves: seed platforms from the candidates so drift math works
        if (!this.state.platform && this.state.playerCandidate) {
            this.state.platform = this.seedPlatform(this.state.playerCandidate);
        }
        if (!this.state.opponentPlatform && this.state.opponentCandidate) {
            this.state.opponentPlatform = this.seedPlatform(this.state.opponentCandidate);
        }
        return this.state;
    }
};
