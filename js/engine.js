/**
 * Election 2028 — Core Game Engine
 * Polling, finances, AI opponent, campaign mechanics, win conditions
 */

window.GameEngine = {

    SAVE_VERSION: 5,

    // ═══════════════════════════════════════════════
    // GAME STATE
    // ═══════════════════════════════════════════════
    state: null,

    createFreshState() {
        return {
            saveVersion: this.SAVE_VERSION,
            rng: { seed: window.GameRandom.createSeed(), cursor: 0 },
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
                fundraisingFatigue: 0,
                lastRaised: 0,
                lastOperatingCost: 300000,
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
            stateMovementReasons: {},
            endorsements: [],
            opponentEndorsements: [],
            pollHistory: {},
            earlyVote: {},
            debateHistory: [],
            debateTopicHistory: [],
            recentEventTitles: [],
            activityHistory: [],
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
            interviews: { lastWeek: -99, history: [], active: null },
            presidency: null,
            incumbentSeed: null,
            isIncumbentRun: false,
            career: null,
            accountability: { docket:null, answered:[], factChecks:[], attackHistory:[] },
            campaignDepth: null,
        };
    },

    /** All authored game systems should use this instead of window.GameEngine.random(). */
    random() {
        if (!this.state) return Math.random();
        if (!this.state.rng) this.state.rng = { seed: window.GameRandom.createSeed(), cursor: 0 };
        return window.GameRandom.next(this.state.rng);
    },

    setSeed(seed) {
        if (!this.state) this.state = this.createFreshState();
        this.state.rng = { seed: (Number(seed) >>> 0) || 1, cursor: 0 };
    },

    // ═══════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════
    initGame(playerCandidate, opponentCandidate, mode, difficulty, seed) {
        this.state = this.createFreshState();
        if (seed !== undefined && seed !== '') this.setSeed(seed);
        this.state.initialSeed=this.state.rng.seed;
        this.state.playerCandidate = playerCandidate;
        this.state.opponentCandidate = opponentCandidate;
        this.state.playerParty = playerCandidate.party === 'Democrat' ? 'democrat' : 'republican';
        this.state.gameMode = mode;
        this.state.difficulty = difficulty;
        this.state.playerTicket = { nominee: playerCandidate, vp: null };
        this.state.opponentTicket = { nominee: opponentCandidate, vp: null };
        this.state.platform = this.seedPlatform(playerCandidate);
        this.state.opponentPlatform = this.seedPlatform(opponentCandidate);
        this.state.campaignEnvironment=(this.random()-.5)*8;
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
        this.state.opponent.onlineInfluence=oc.viralPotential||40;
        this.state.opponent.surrogateStrength=oc.eliteSupport||40;
        if(difficulty!=='arcade') {
            // Competitive modes give the rival the same eight-point balanced setup.
            const o=this.state.opponent;
            o.cash+=3000000;o.enthusiasm+=10;o.baseTurnout+=6;o.mediaScore+=8;
            o.groundGame+=10;o.surrogateStrength+=10;o.onlineInfluence+=8;
        }

        // Difficulty adjustments
        const mods = this.getDifficultyModifiers();
        this.state.finances.cashOnHand *= mods.cashMod;
        this.state.finances.totalRaised = this.state.finances.cashOnHand;
        this.state.finances.ledger = [{week:1,type:'opening_funds',amount:this.state.finances.cashOnHand,balance:this.state.finances.cashOnHand}];
        this.state.campaign.cash = this.state.finances.cashOnHand;
        this.state.finances.weeklySmallDollar *= mods.fundraisingMod;
        this.state.finances.weeklyHighDollar *= mods.fundraisingMod;

        this.initStatePolling();
        if (window.CampaignDepth) window.CampaignDepth.initialize(this.state);
        window.EventSystem.ScenarioEngine.reset();
        return this.state;
    },

    /**
     * Launch a re-election campaign as the sitting president. Skips the primary
     * (incumbents are renominated), keeps the VP ticket, and applies the record
     * from the last term as a head start or a handicap.
     */
    startReelection(incumbent, opponent, difficulty, seed, vp) {
        const serving=this.state?.presidency && !this.state.presidency.over ? this.state.presidency : null;
        const servingTransition=serving?this.state.transition:null;
        const carriedCareer = seed && seed.career ? seed.career : (this.state && this.state.career);
        const carriedCountry = seed && seed.countrySnapshot ? seed.countrySnapshot
            : (carriedCareer && carriedCareer.countrySnapshot);
        const continuationSeed=Math.floor(this.random()*4294967295);
        this.initGame(incumbent, opponent, 'campaign', difficulty, continuationSeed);
        const gs = this.state;
        gs.incumbentSeed = seed;
        gs.isIncumbentRun = true;
        if (serving) {
            gs.presidency=serving; gs.transition=servingTransition;
            gs.concurrentCampaign=true; gs.countryMonthDue=false;
            serving.pendingEvent=null;
        }
        if (window.CareerSystem) {
            gs.career = carriedCareer || window.CareerSystem.create();
            const career = window.CareerSystem.ensure(gs);
            if (carriedCountry) career.countrySnapshot = carriedCountry;
            gs.accountability.docket = window.CareerSystem.buildDocket(seed, career);
        }

        // Renominated without a fight — jump straight to the general election
        if (gs.primary) { gs.primary.decided = true; gs.primary.lostNomination = false; }
        gs.week = gs.primaryWeeks + 1;
        this.transitionToGeneral();
        gs.conventionDone = true;

        // Keep the ticket you governed with
        if (vp) {
            gs.vpChoice = vp; gs.vpPicked = true;
            gs.playerTicket = { nominee: incumbent, vp };
        }

        // The record becomes the campaign's starting conditions
        const c = gs.campaign;
        c.approval = seed.approval;
        c.nationalPolling = Math.max(38, Math.min(60, seed.approval));
        if (seed.gdp >= 2.6) { c.nationalPolling += 2; c.donorConfidence += 10; c.momentum += 8; }
        else if (seed.gdp < 1.5) { c.nationalPolling -= 3; c.momentum -= 8; }
        if (seed.inflation > 4) c.nationalPolling -= 2;
        c.scandalVulnerability = Math.min(100, c.scandalVulnerability + (seed.scandals || 0) * 6);
        c.nationalPolling -= (seed.warsLost || 0) * 3;
        c.momentum += (seed.warsWon || 0) * 4 - (seed.warsLost || 0) * 5;
        if (seed.signatureDone) { c.nationalPolling += 3; c.donorConfidence += 8; }
        if ((seed.debt || 100) > 140) c.donorConfidence -= 8;
        c.nationalPolling = Math.max(34, Math.min(64, c.nationalPolling));

        // Shift the map toward the incumbent's standing
        const shift = (c.nationalPolling - 50) * 0.3;
        for (const poll of Object.values(gs.statePolling)) {
            poll.player += shift; poll.opponent -= shift;
        }
        const liabilities = gs.accountability.docket ? gs.accountability.docket.liabilities : [];
        if (liabilities.length) {
            gs.newsHistory.push(`THE INCUMBENT RECORD: ${liabilities[0].title.toUpperCase()} DEFINES THE OPENING WEEK`);
        }
        return gs;
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
            playerPoll+=(this.state.campaignEnvironment||0)/2;
            opponentPoll-=(this.state.campaignEnvironment||0)/2;

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
            playerPoll += (window.GameEngine.random() - 0.5) * 4;
            opponentPoll += (window.GameEngine.random() - 0.5) * 4;

            this.state.statePolling[st.id] = {
                player: Math.round(playerPoll * 10) / 10,
                opponent: Math.round(opponentPoll * 10) / 10,
                undecided: Math.round(Math.max(3, 100 - playerPoll - opponentPoll) * 10) / 10,
                trend: 0,
                lastVisitWeek: 0,
                adSpend: 0,
                groundGameLevel: 0,
                baselinePlayer:playerPoll,baselineOpponent:opponentPoll,
            };
        }

        this.state.campaign.nationalPolling = this.calculateNationalPolling();
        this.state.opponent.nationalPolling = this.calculateNationalPolling(false,'opponent');
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
                window.CampaignFinance.post(effects.cashOnHand,'ticket_fundraising');
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
        this.state.opponent.nationalPolling = this.calculateNationalPolling(false,'opponent');
    },

    assignRunningMates(playerVP, opponentVP) {
        if (playerVP) {
            this.state.playerTicket = { nominee: this.state.playerCandidate, vp: playerVP };
            this.state.vpPicked = true;
            this.state.vpChoice = {
                id: playerVP.id,
                candidateId: playerVP.candidateId,
                name: playerVP.name,
                homeStateId: playerVP.homeId ||
                    (window.VPData ? window.VPData.getStateIdForName(playerVP.homeState) : null),
            };
            this.state.vpAnnouncementBias = playerVP.announcementBias || 0;
            this.applyTicketStatEffects('player', playerVP.effects);
            this.applyTicketMapEffects('player', playerVP);
            this.reconcilePrimaryTicket();
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
            const coalitionResult = this.applyCoalitionBuilding(actions.coalitionFocus);
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
        let events = this.filterFreshEvents(window.EventSystem.ScenarioEngine.generateWeeklyEvents(this.state));
        if (this.state.isIncumbentRun && window.CareerSystem) {
            const setPiece = window.CareerSystem.reelectionSetPiece(this.state.week, this.state.accountability && this.state.accountability.docket);
            if (setPiece) events.unshift(setPiece);
            if(this.state.week>=39) {
                let remaining;
                while((remaining=window.CareerSystem.reelectionSetPiece(this.state.week,this.state.accountability.docket))) events.push(remaining);
            }
        }
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
                const sc = this.spawnScandal(evt.title, 2 + (window.GameEngine.random() < 0.3 ? 1 : 0), 'player');
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
        summary.financialSummary = {
            raised: this.state.finances.lastRaised,
            spent: this.state.finances.lastOperatingCost,
            cashOnHand: this.state.finances.cashOnHand,
        };
        if (this.state.isIncumbentRun && this.state.accountability && this.state.accountability.docket) {
            const liabilities = this.state.accountability.docket.liabilities || [];
            const liability = liabilities[(this.state.week - this.state.primaryWeeks - 1) % Math.max(1, liabilities.length)];
            if (liability && (this.state.week === this.state.primaryWeeks + 1 || this.state.week % 5 === 0)) {
                summary.newsHeadlines.push(`FACT CHECK: ${liability.fact} — ${this.state.playerCandidate.name.split(' ').pop()} PRESSED TO EXPLAIN`);
                this.state.accountability.factChecks.push({ week:this.state.week, id:liability.id, fact:liability.fact });
                this.state.accountability.attackHistory.push({ week:this.state.week, text:liability.attack });
            }
        }
        if (window.CampaignDepth) window.CampaignDepth.processWeek(summary);

        // 11. Update momentum and media
        this.calculateMomentum();
        this.updateMediaNarrative();
        this.applyStatMaintenance();

        // 12. Apply polling noise and recalculate
        this.applyPollingNoise();
        this.state.campaign.nationalPolling = this.calculateNationalPolling();
        this.state.opponent.nationalPolling = this.calculateNationalPolling(false,'opponent');

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
        const publishedPolling = this.getObservedPolling();
        const closest = window.StateData
            .filter(s => s.isBattleground && this.state.statePolling[s.id])
            .sort((a, b) => {
                const pa = publishedPolling[a.id], pb = publishedPolling[b.id];
                return Math.abs(pa.player - pa.opponent) - Math.abs(pb.player - pb.opponent);
            })[0];
        if (closest) {
            const poll = publishedPolling[closest.id];
            summary.newsHeadlines.push(window.EventSystem.BreakingNewsTicker.generatePollingHeadline(
                this.state.playerCandidate.name.split(' ').pop(),
                this.state.opponentCandidate.name.split(' ').pop(),
                closest.name,
                Math.round((poll.player - poll.opponent) * 10) / 10
            ));
        }

        // 14. Store history
        summary.newsHeadlines = this.filterFreshHeadlines(summary.newsHeadlines);
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

    applyStatMaintenance() {
        const rules = { approval:[72,.08], enthusiasm:[84,.07], baseTurnout:[82,.05], persuadableSupport:[70,.07], mediaScore:[84,.07], debateSkill:[88,.04], groundGame:[88,.05], donorConfidence:[84,.07], onlineInfluence:[86,.05], surrogateStrength:[88,.04] };
        for (const side of [this.state.campaign, this.state.opponent]) {
            for (const [key, [softCap, decay]] of Object.entries(rules)) {
                if (typeof side[key] === 'number' && side[key] > softCap) side[key] -= (side[key] - softCap) * decay;
            }
        }
    },

    filterFreshEvents(events) {
        const career=window.CareerSystem?.ensure(this.state);
        const used=new Set(career?.usedEventIds||[]);
        const fresh=events.filter(e=>!used.has(e.id));
        if(career) career.usedEventIds.push(...fresh.map(e=>e.id));
        return fresh;
    },
    filterFreshHeadlines(headlines) {
        const normalize = h => String(h || '').toLowerCase().replace(/\d+(?:\.\d+)?/g, '#').replace(/\s+/g, ' ').trim();
        const career = window.CareerSystem ? window.CareerSystem.ensure(this.state) : null;
        const used = career ? career.usedHeadlineKeys : [];
        const seen = new Set([...(this.state.newsHistory || []).slice(-35).map(normalize), ...used]);
        return headlines.filter(h => {
            const key = normalize(h);
            if (!key || seen.has(key)) return false;
            seen.add(key);
            if (career) {
                used.push(key);
                if (used.length > 240) used.splice(0, used.length - 240);
            }
            return true;
        });
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
        const contact=(this.state.visitedStates[stateId]||0);
        const boost = (0.15 + (charisma / 100) * .2) * recoveryMult / Math.sqrt(1+contact*.7);
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
        this.recordStateMovement(stateId, `Candidate visit: +${boost.toFixed(1)} polling; charisma and repeat contact drove the change.`);

        return { pollingBoost: boost, state: stateId };
    },

    applyAdBuy(stateId, type, amount, tone) {
        const poll = this.state.statePolling[stateId];
        if (!poll) return null;
        const st = window.StateData.find(s => s.id === stateId);
        if (!st) return null;

        amount = Math.max(0, Math.min(Number(amount) || 0, this.state.finances.cashOnHand));
        if (amount < 50000) return null;

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
        // Large buys also shape the broader media environment. Diminishing
        // returns prevent money from becoming an automatic win while still
        // making a $2M–$5M saturation buy materially stronger than $100K.
        const scale = Math.log10(1 + amount / 100000);
        if (type === 'tv') this.state.campaign.mediaScore += Math.min(2.5, scale * 0.9);
        else this.state.campaign.onlineInfluence += Math.min(3, scale * 1.1);
        this.recordStateMovement(stateId, `${type.toUpperCase()} ${tone} buy: $${Math.round(amount / 1000)}K produced ${impact.toFixed(1)} estimated impact after market cost and saturation.`);
        return { stateId, type, tone, amount, impact:Math.round(impact * 100) / 100 };
    },

    recordStateMovement(stateId, reason) {
        const store = this.state.stateMovementReasons || (this.state.stateMovementReasons = {});
        store[stateId] = store[stateId] || [];
        store[stateId].push({ week:this.state.week, reason });
        if (store[stateId].length > 8) store[stateId] = store[stateId].slice(-8);
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
                if (window.GameEngine.random() > mediaSkill / 100) {
                    c.scandalVulnerability += 3;
                    effects.risk = "Tough interview - vulnerability up";
                }
                effects.mediaScore = 3;
                break;
            case 'fundraisingBlitz':
                // Full-week fundraising blitz — $1.5M-$3.5M based on donor confidence
                const blitzBase = 1500000 + window.GameEngine.random() * 1000000;
                const confidenceMultiplier = 0.5 + (c.donorConfidence / 100);
                const fatigueMultiplier = Math.max(0.35, 1 - (this.state.finances.fundraisingFatigue || 0) / 100);
                const blitzRaised = Math.floor(blitzBase * confidenceMultiplier * fatigueMultiplier);
                this.state.finances.cashOnHand += blitzRaised;
                this.state.finances.totalRaised += blitzRaised;
                c.donorConfidence += 5;
                c.enthusiasm -= 2; // Spending the week fundraising costs momentum
                c.momentum -= 3;
                this.state.finances.fundraisingFatigue = Math.min(80, (this.state.finances.fundraisingFatigue || 0) + 16);
                effects.cashRaised = blitzRaised;
                effects.note = fatigueMultiplier < .7 ? "Donor fatigue reduced the haul" : "Full week dedicated to fundraising";
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
                const observed=this.getObservedPolling();
                const targets = window.StateData
                    .filter(s => s.isBattleground)
                    .map(s => ({ s, poll: observed[s.id] }))
                    .filter(x => x.poll)
                    .sort((a, b) => Math.abs(a.poll.player - a.poll.opponent) - Math.abs(b.poll.player - b.poll.opponent))
                    .slice(0, cfg.GOTV_TARGET_STATES);

                const gain = .02 + (c.groundGame / 100) * .03; // marginal turnout, not a new electorate
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
        const history = this.state.activityHistory || (this.state.activityHistory = []);
        const recentRepeats = history.slice(-4).filter(x => x.activity === activity).length;
        if (recentRepeats >= 2) {
            c.momentum -= 1 + recentRepeats * .5;
            effects.repetitionPenalty = recentRepeats;
            effects.note = `${effects.note ? effects.note + '; ' : ''}audiences are tiring of this routine`;
        }
        history.push({ activity, week:this.state.week });
        if (history.length > 24) history.splice(0, history.length - 24);
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
        if(this.state.eventHistory.some(e=>e.eventId===eventId && e.week===this.state.week)) return;

        const choice = event.choices[choiceIdx];
        const c = this.state.campaign;
        if(event.isAccountability) this.state.accountability.answered.push({week:this.state.week,questionId:event.id,liability:event.liabilityId,choice:choiceIdx});

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
                window.CampaignFinance.post(val,'event_choice',{eventId,choiceIdx},{mandatory:true});
            } else if (c.hasOwnProperty(key)) {
                c[key] += val;
            }
        }

        // Apply base event effects too
        if (event.effects) {
            for (const [key, val] of Object.entries(event.effects)) {
                if (key === 'cash') {
                    window.CampaignFinance.post(val,'event_effect',{eventId},{mandatory:true});
                } else if (c.hasOwnProperty(key)) {
                    c[key] += val;
                }
            }
        }

        // Risky choices can backfire
        if (choice.riskLevel === 'desperate' && window.GameEngine.random() < 0.4) {
            c.approval -= 3;
            c.mediaScore -= 3;
        } else if (choice.riskLevel === 'risky' && window.GameEngine.random() < 0.25) {
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
        f.lastRaised = fundsRaised;
        window.CampaignFinance.post(fundsRaised,'weekly_fundraising');
        window.CampaignFinance.settleArrears();

        // A national operation grows more expensive as the race scales up.
        const phaseOverhead = this.state.phase === 'general' ? 450000 : 150000;
        const scaleOverhead = Math.min(350000, this.state.week * 9000);
        const operatingCost = f.burnRate + phaseOverhead + scaleOverhead;
        f.lastOperatingCost = operatingCost;
        window.CampaignFinance.post(-operatingCost,'operating_cost',{}, {mandatory:true});
        f.fundraisingFatigue = Math.max(0, (f.fundraisingFatigue || 0) - 3);

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
        if (f.arrears > 0) {
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
        const reserveDrag = f.cashOnHand > 18000000 ? Math.max(.38, 1 - (f.cashOnHand - 18000000) / 65000000) : 1;
        const fatigueDrag = Math.max(.45, 1 - (f.fundraisingFatigue || 0) / 100);

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

        const phaseCap = this.state.phase === 'general' ? 3200000 : 2100000;
        return Math.floor(Math.min(phaseCap, (smallDollar + highDollar) * reserveDrag * fatigueDrag));
    },

    getAdTargetRecommendations(type = 'digital') {
        return window.StateData.filter(s => s.isBattleground && this.state.statePolling[s.id]).map(state => {
            const poll = window.CampaignDepth?.getPoll(state.id) || this.state.statePolling[state.id];
            const margin = poll.player - poll.opponent;
            const saturation = this.state.adMarkets?.[state.id]?.exposure || 0;
            const reachFit = type === 'digital' && state.educationSplit && state.educationSplit.college > 35 ? 1.12 : 1;
            const score = state.electoralVotes*Math.exp(-Math.abs(margin)/3.5)*reachFit/Math.sqrt(Math.max(.7,state.adCostMultiplier)*(1+saturation/100000));
            const reason = Math.abs(margin) <= 3 ? 'toss-up with decisive EVs' : margin < 0 ? 'reachable pickup opportunity' : 'narrow lead worth protecting';
            return { state, poll, margin, saturation, score, reason };
        }).sort((a,b) => b.score - a.score);
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
    getObservedPolling() {
        const gs=this.state,latest=gs.campaignDepth?.polling?.latest||{};
        return Object.fromEntries(Object.entries(gs.statePolling).map(([id,p])=>[id,
            {...p,...(latest[id] || window.ElectionSystem?.normalize(p) || p)}]));
    },

    calculateNationalPolling(observed=false,side='player') {
        let totalPlayerVotes = 0;
        let totalWeight = 0;

        for (const [stId, poll] of Object.entries(observed?this.getObservedPolling():this.state.statePolling)) {
            const st = window.StateData.find(s => s.id === stId);
            if (!st) continue;
            const weight = window.ElectionSystem?.votingAge[stId] || st.electoralVotes;
            const share=window.ElectionSystem?.normalize(poll)[side] ?? poll[side];
            totalPlayerVotes += share * weight;
            totalWeight += weight;
        }

        return totalWeight > 0 ? Math.round((totalPlayerVotes / totalWeight) * 10) / 10 : 45;
    },

    applyPollingNoise() {
        const c=this.state.campaign,o=this.state.opponent;
        const quality=((c.approval-o.approval)*.04+(c.persuadableSupport-o.persuadableSupport)*.06+
            (c.mediaScore-o.mediaScore)*.035+(c.onlineInfluence-o.onlineInfluence)*.025+(c.momentum-o.momentum)*.015)*.25;
        for (const [stId, poll] of Object.entries(this.state.statePolling)) {
            const st = window.StateData.find(s => s.id === stId);
            const volatility = st ? st.swingVolatility / 100 : 0.3;
            // Banked early votes are locked in — late swings only move live voters
            const liveShare = this.getLiveVoteShare(stId);
            const noise = (window.GameEngine.random() - 0.5) * 2 * volatility * liveShare;

            poll.player += noise;
            poll.opponent -= noise * 0.5;

            // Trend decay
            poll.trend *= 0.8;

            // Both sides' local persuasion fades; national work shifts the target.
            // Previously only the player's gains decayed, granting permanent AI gains.
            const lean=(this.state.playerParty==='democrat'?-1:1)*(st?.partisanLean||0)*.3;
            poll.baselinePlayer ??= 50+lean;poll.baselineOpponent ??=50-lean;
            const bloc=st?window.CampaignDepth?.electorateEdge(st)||0:0;
            poll.player+=(poll.baselinePlayer+quality+bloc-poll.player)*.12*liveShare;
            poll.opponent+=(poll.baselineOpponent-quality-bloc-poll.opponent)*.12*liveShare;

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

        for (const [stId, poll] of Object.entries(this.getObservedPolling())) {
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
            const boost = (0.5 + window.GameEngine.random() * 0.8) * mods.aiStrengthMod * this.getLiveVoteShare(t.s.id);
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
                const impact = (0.35 + window.GameEngine.random() * 0.5) * mods.aiStrengthMod * this.getLiveVoteShare(t.s.id);
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
        if (playerWentNegative && window.GameEngine.random() < 0.6) {
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
        const aiRaise = (450000 + window.GameEngine.random() * 550000) * mods.aiStrengthMod * budgetMult *
            (1 + Math.max(-0.3, opp.momentum / 200));
        opp.cash += aiRaise;

        // ── Mood drift ──
        opp.momentum += (window.GameEngine.random() - 0.45) * 4 + (posture === 'offense' ? 1 : 0);
        opp.enthusiasm += (window.GameEngine.random() - 0.5) * 2;
        opp.approval += (window.GameEngine.random() - 0.5) * 1;
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

        const visitCount = window.GameEngine.random() > 0.5 ? 2 : 1;
        for (let i = 0; i < Math.min(visitCount, battlegrounds.length); i++) {
            const st = battlegrounds[i];
            const poll = this.state.statePolling[st.id];
            if (poll) {
                const boost = 0.5 + window.GameEngine.random() * 1.0 * mods.aiStrengthMod;
                poll.opponent += boost;
                poll.player -= boost * 0.2;
                actions.push(`Campaigned in ${st.name}`);
            }
        }

        if (opp.cash > 1000000) {
            const adTarget = battlegrounds[Math.floor(window.GameEngine.random() * Math.min(3, battlegrounds.length))];
            if (adTarget) {
                const poll = this.state.statePolling[adTarget.id];
                if (poll) {
                    poll.opponent += 0.3 + window.GameEngine.random() * 0.7 * mods.aiStrengthMod;
                    actions.push(`Ran ads in ${adTarget.name}`);
                }
            }
        }

        const aiRaise = 400000 + window.GameEngine.random() * 600000 * mods.aiStrengthMod;
        opp.cash += aiRaise;
        opp.momentum += (window.GameEngine.random() - 0.45) * 5;
        opp.enthusiasm += (window.GameEngine.random() - 0.5) * 2;
        opp.approval += (window.GameEngine.random() - 0.5) * 1;
        opp.nationalPolling = 100 - this.state.campaign.nationalPolling - 8;

        this.state.opponentPlaybook = { posture: 'improvising', tone: 'positive', targets: battlegrounds.slice(0, 2).map(s => s.id), week: this.state.week };
        return actions;
    },

    generateOpponentAttack() {
        const vulns = this.state.playerCandidate.vulnerabilities || [];
        if (vulns.length === 0) return null;
        const attack = vulns[Math.floor(window.GameEngine.random() * vulns.length)];
        return {
            text: attack,
            impact: -2 + Math.floor(window.GameEngine.random() * -3),
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
        if (this.state.week % 3 === 0 && window.GameEngine.random() < 0.6) {
            const pick = available[Math.floor(window.GameEngine.random() * available.length)];
            const headline = this.claimEndorsement(pick.id, 'opponent');
            if (headline) result.headlines.push(headline);
            available = available.filter(e => e.id !== pick.id);
        }

        // ~25% of weeks, an endorser the player qualifies for comes into play
        if (!available.length || window.GameEngine.random() > 0.25) return result;
        const c = this.state.campaign;
        const qualified = available.filter(e => {
            const req = e.requires || {};
            return Object.entries(req).every(([stat, min]) => (c[stat] || 0) >= min);
        });
        if (!qualified.length) return result;

        const target = qualified[Math.floor(window.GameEngine.random() * qualified.length)];
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

        const pick = options[Math.floor(window.GameEngine.random() * options.length)];
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
            const poll = this.getObservedPolling()[st.id];
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
            id: 'sc_' + this.state.week + '_' + Math.floor(window.GameEngine.random() * 100000),
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
            const roll = window.GameEngine.random();

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
        if (window.GameEngine.random() < this.state.opponent.scandalVulnerability * cfg.OPPONENT_SPAWN_BASE) {
            const titles = ['Campaign Finance Irregularities', 'Leaked Internal Memo', 'Staff Exodus Story', 'Undisclosed Conflict of Interest', 'Resurfaced Recording'];
            const sc = this.spawnScandal(titles[Math.floor(window.GameEngine.random() * titles.length)], 2, 'opponent');
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

    reconcilePrimaryTicket() {
        const gs=this.state,primary=gs.primary,vp=gs.playerTicket?.vp||gs.vpChoice;
        if(!primary || !vp) return;
        const key=p=>window.People?window.People.key(p):p.name;
        for(const rival of primary.rivals) if(!rival.droppedOut && key(rival)===key(vp)) {
            primary.undecided+=rival.support;rival.support=0;rival.droppedOut=true;rival.joinedTicket=true;
            window.CareerSystem?.record('ticket_unity',{name:rival.name,detail:'Withdrew from the nomination contest to join the ticket.'});
        }
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
        const shuffled = [...pool].sort(() => window.GameEngine.random() - 0.5);
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
        drift += (window.GameEngine.random() - 0.5) * 1.6;
        p.playerSupport += drift;

        // Rival AI: they campaign, and the leader takes incoming fire
        const alive = p.rivals.filter(r => !r.droppedOut);
        const leaderIsPlayer = p.playerSupport >= Math.max(...alive.map(r => r.support), 0);
        for (const r of alive) {
            let rDrift = (window.GameEngine.random() - 0.45) * 1.6;
            rDrift += ((r.ideologicalElasticity > 60 ? 1 : 0.5)) * 0.3; // firebrands generate energy
            if (leaderIsPlayer && window.GameEngine.random() < 0.5) {
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
            e.share = e.base + (window.GameEngine.random() - 0.5) * 6;
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
        window.CampaignFinance.post(-cost,'security_detail');
        window.SaveStore?.save();
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
        if (window.GameEngine.random() >= chance) return null;

        // An attempt occurs — roll for survival
        const survival = cfg.BASE_SURVIVAL + (this.state.securityDetail ? cfg.SECURITY_SURVIVAL_BONUS : 0);
        const survived = window.GameEngine.random() < survival;
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
        for(const c of [this.state.campaign,this.state.opponent]) {
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
        }
    },

    updateMediaNarrative() {
        for(const c of [this.state.campaign,this.state.opponent]) {
        // Media score slowly normalizes
        c.mediaScore += (50 - c.mediaScore) * 0.1;
        // Scandal vulnerability slowly decreases
        c.scandalVulnerability *= 0.95;
        }
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

        const bounce = 3 + Math.floor(window.GameEngine.random() * 5);
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
        this.state.vpChoice = { id:option.id, candidateId:option.candidateId, name: option.name, homeStateId: homeStateId || null };

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
            window.CampaignFinance.post(bump,'debate_fundraising');
        }
        if(oppTotal>20 && window.OpponentCampaign) {
            window.CampaignFinance.post(200000+oppTotal*20000,'debate_fundraising',{}, {gs:window.OpponentCampaign.context()});
        }

        c.momentum += normalizedScore * 5;
        o.momentum += oppNormalized * 5;

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
        if (this.state.electionResult) return this.state.electionResult;
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
        if (window.CareerSystem) {
            const career = window.CareerSystem.ensure(this.state);
            career.elections.push({
                year:this.state.isIncumbentRun ? 2032 : 2028,
                incumbent:!!this.state.isIncumbentRun,
                winner:results.winner,
                playerEV:results.playerEV,
                opponentEV:results.opponentEV,
                popularVote:{ ...results.nationalPopularVote },
            });
        }

        this.state.electionResult = results;
        return results;
    },

    buildCampaignAutopsy(results) {
        const states = Object.entries(results.stateResults || {}).map(([id, result]) => ({
            id, result, state: window.StateData.find(s => s.id === id)
        })).filter(x => x.state);
        const closestLosses = states.filter(x => x.result.winner === 'opponent').sort((a,b) => a.result.margin - b.result.margin).slice(0, 3);
        const closestWins = states.filter(x => x.result.winner === 'player').sort((a,b) => a.result.margin - b.result.margin).slice(0, 3);
        const c = this.state.campaign;
        const metrics = [
            ['Ground game', c.groundGame], ['Enthusiasm', c.enthusiasm], ['Media', c.mediaScore],
            ['Persuasion', c.persuadableSupport], ['Fundraising', c.donorConfidence], ['Turnout', c.baseTurnout]
        ].sort((a,b) => b[1] - a[1]);
        const spent = this.state.finances.totalSpent || 0;
        const efficiency = results.playerEV ? Math.round(spent / results.playerEV) : spent;
        const tipping = results.winner === 'player' ? closestWins[0] : closestLosses[0];
        return {
            tippingPoint: window.ElectionSystem ? window.ElectionSystem.tippingPoint(results) : tipping ? { name:tipping.state.name, margin:tipping.result.margin, ev:tipping.result.ev } : null,
            closestLosses: closestLosses.map(x => ({ name:x.state.name, margin:x.result.margin, ev:x.result.ev })),
            strengths: metrics.slice(0, 2).map(x => `${x[0]} ${Math.round(x[1])}`),
            weaknesses: metrics.slice(-2).reverse().map(x => `${x[0]} ${Math.round(x[1])}`),
            totalSpent: spent,
            cashLeft: this.state.finances.cashOnHand,
            costPerEV: efficiency,
            verdict: results.winner === 'player'
                ? 'Your coalition survived the states that decided the Electoral College.'
                : closestLosses[0] ? `The race turned on ${closestLosses[0].state.name}; a ${closestLosses[0].result.margin.toFixed(1)}-point shift there was your clearest missed path.` : 'Your national coalition never found a viable Electoral College path.'
        };
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
            const noise = (window.GameEngine.random() - 0.5) * 3;
            poll.player += noise;
            poll.opponent -= noise * 0.3;

            // Persuadable voter break
            const undecidedBreak = poll.undecided * (window.GameEngine.random() * 0.3 + 0.35);
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
        if (this.state.electionNight) return this.state.electionNight;
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
            if (result.margin > 15) delay = 2 + window.GameEngine.random() * 8;
            else if (result.margin > 8) delay = 30 + window.GameEngine.random() * 60;
            else if (result.margin > 2) delay = 120 + window.GameEngine.random() * 120;
            else { delay = 300 + window.GameEngine.random() * 120; tooClose = true; }

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

        this.state.electionNight = { results, calls };
        return this.state.electionNight;
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
        const jitter = Math.floor(window.GameEngine.random() * 5) - 2;
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
                age: oc.age, home: oc.homeState,
                competence: Math.round(((oc.debate || 60) + (oc.mediaHandling || 60)) / 2),
                loyalty: 25, controversy: 60, rival: true,
                bio: 'The boldest play in politics: hand your defeated opponent the world stage. History remembers a Team of Rivals — if it doesn\'t blow up.',
                concerns: ['Just spent a year campaigning against everything you stand for', 'Loyalty is a bet, not a fact'],
            });
        }
        // Party unity: defeated primary rivals for Chief of Staff / Treasury
        if ((postId === 'chief' || postId === 'treasury') && gs.primary && gs.primary.rivals) {
            for (const r of gs.primary.rivals) {
                options.push({
                    id: r.id, name: r.name, title: r.title || 'Former primary rival',
                    age: r.age, home: r.homeState,
                    competence: Math.round(((r.charisma || 60) + (r.debate || 60)) / 2),
                    loyalty: 55, controversy: postId === 'chief' ? 0 : 35, rival: true,
                    bio: 'Party unity made flesh — a primary rival brought inside the tent.',
                    concerns: postId === 'chief' ? [] : ['Primary-season attack lines get quoted back at the hearing'],
                });
            }
        }
        // Exclude anyone already serving, burned by the Senate, on your ticket
        const t = gs.transition || { posts: {}, failed: [] };
        const taken = new Set(Object.values(t.posts).map(p => p.id));
        t.failed.forEach(id => taken.add(id));
        const runningMate = (gs.playerTicket && gs.playerTicket.vp) || gs.vpChoice;
        if (runningMate) {
            if (runningMate.id) taken.add(runningMate.id);
            if (runningMate.candidateId) taken.add(runningMate.candidateId);
        }
        taken.add(gs.playerCandidate.id);
        const identity=window.People?.key || (o=>o.id);
        const peopleTaken=new Set([...Object.values(t.posts),gs.playerCandidate,runningMate].filter(Boolean).map(identity));
        const seen=new Set();
        const available = options.filter(o=>{
            const person=identity(o);if(!o.id || taken.has(o.id) || peopleTaken.has(person) || seen.has(person)) return false;
            seen.add(person);return true;
        });
        // A transition must never become unwinnable. If every Senate-facing
        // nominee for this post has been rejected or hired elsewhere, permit
        // a career official to serve in an acting capacity.
        const post = window.CabinetData.POSTS.find(p => p.id === postId);
        if (!available.length && post) {
            available.push({
                id: `acting_${postId}`,
                name: `Career ${post.title.replace(/^Secretary of (the )?/, '')} Administrator`,
                title: `Acting ${post.title}`,
                competence: 68,
                loyalty: 58,
                controversy: 0,
                acting: true,
                bio: 'A senior career official keeps the department functioning after the Senate exhausts the regular nominee bench.',
                concerns: ['An acting appointment carries less political authority than a confirmed secretary'],
            });
        }
        return available;
    },

    nominate(postId, option, strategy) {
        const t = this.state.transition;
        const post = window.CabinetData.POSTS.find(p => p.id === postId);
        if (!t || !post || t.posts[postId] || !option || !this.getCabinetOptions(postId).some(o=>o.id===option.id)) return null;
        if (!post.confirmable || option.acting) {
            t.posts[postId] = Object.assign({ votesFor: null, votesAgainst: null }, option);
            t.log.push(option.acting
                ? `${option.name} installed in an acting capacity after the Senate exhausted the nominee bench.`
                : `${option.name} named ${post.title}.`);
            this.checkTransitionComplete();
            return { confirmed: true, appointed: true, acting: !!option.acting, votesFor: null, votesAgainst: null };
        }
        // Hearing strategy shapes the math before the roll call:
        //   'floor'  — straight to the vote, spend nothing
        //   'murder' — murder boards, 1 capital: prep drops effective controversy
        //   'deals'  — cut deals, 2 capital: whip defectors and buy a crossover
        if (strategy === true) strategy = 'deals'; // legacy boolean form
        let controversy = option.controversy;
        let whipped = 0, bought = 0;
        if (strategy === 'murder' && t.capital >= 1) {
            t.capital -= 1;
            controversy = Math.max(0, controversy - 14);
        } else if (strategy === 'deals' && t.capital >= 2) {
            t.capital -= 2;
            whipped = 2; bought = 1;
        }
        // Consensus nominees can build a real bipartisan coalition even under
        // an opposition Senate. Random defections begin only once a pick has
        // meaningful controversy.
        const baseDefections = Math.max(0, Math.round((controversy - 45) / 10));
        const randomDefections = controversy >= 35 ? Math.floor(window.GameEngine.random() * 3) : 0;
        const defections = Math.max(0, baseDefections + randomDefections - whipped);
        const crossovers = Math.max(0, Math.round((70 - controversy) / 7)) + bought;
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
        return { confirmed, votesFor, votesAgainst, defections, crossovers, strategy: strategy || 'floor' };
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
        this.state.saveVersion = this.SAVE_VERSION;
        return JSON.stringify(this.state);
    },

    deserialize(data) {
        this.state = JSON.parse(data);
        const loadedVersion = Number(this.state.saveVersion || 1);
        if (loadedVersion < 2) this._migrateV1ToV2(this.state);
        if (loadedVersion < 3) this._migrateV2ToV3(this.state);
        // Backfill fields added after older saves were created
        const fresh = this.createFreshState();
        for (const key of ['endorsements', 'opponentEndorsements', 'pollHistory', 'earlyVote', 'debateHistory', 'opponentVP',
                           'playerTicket', 'opponentTicket', 'vpAnnouncementBias', 'opponentVPAnnouncementBias',
                           'publicAnger', 'securityDetail', 'hospitalized', 'assassinationAttempts',
                           'platform', 'opponentPlatform', 'flipFlops', 'platformShiftedWeek',
                           'primary', 'opponentPlaybook', 'activeScandals', 'transition', 'interviews', 'presidency', 'incumbentSeed', 'debateTopicHistory', 'recentEventTitles', 'activityHistory', 'stateMovementReasons', 'isIncumbentRun', 'career', 'accountability']) {
            if (this.state[key] === undefined) this.state[key] = fresh[key];
        }
        this.state.finances = Object.assign({}, fresh.finances, this.state.finances || {});
        if (window.CareerSystem) window.CareerSystem.ensure(this.state);
        // Old saves: seed platforms from the candidates so drift math works
        if (!this.state.platform && this.state.playerCandidate) {
            this.state.platform = this.seedPlatform(this.state.playerCandidate);
        }
        if (!this.state.opponentPlatform && this.state.opponentCandidate) {
            this.state.opponentPlatform = this.seedPlatform(this.state.opponentCandidate);
        }
        if (window.CampaignDepth && this.state.statePolling && !this.state.campaignDepth) {
            window.CampaignDepth.initialize(this.state);
        }
        return this.state;
    },

    _migrateV1ToV2(state) {
        state.saveVersion = 2;
        state.rng = state.rng || { seed: window.GameRandom.createSeed(), cursor: 0 };
        const p = state.presidency;
        if (p) {
            p.population = typeof p.population === 'number' ? p.population : 335;
            p.stability = p.stability || { score: 76, tier: 'STABLE' };
            p.institutions = p.institutions || { trust:52, infrastructure:88, health:82, justice:70, continuity:92 };
            p.coalitions = p.coalitions || { base:72, independents:48, opposition:18, labor:52, business:51, youth:55 };
            p.calendar = p.calendar || { monthsElapsed:Math.max(0, (p.quarter - 1) * 3), monthlyBriefings:[] };
            p.policies = p.policies || [];
            p.timeline = p.timeline || [];
            p.collapse = p.collapse || { active:false, seasons:0, recovery:0, events:[] };
            p.administration = p.administration || { members:{}, unity:70, resignations:[] };
            p.congress = p.congress || { senateSeats:50, houseMajority:false };
            p.congress.houseSeats = p.congress.houseSeats || (p.congress.houseMajority ? 224 : 211);
            p.congress.factions = p.congress.factions || { progressives:42, moderates:46, conservatives:45, populists:38, institutionalists:54 };
            if (!p.world && window.WorldSystem) p.world = window.WorldSystem.createState();
        }
    },

    _migrateV2ToV3(state) {
        state.saveVersion = 3;
        if (state.campaignDepth === undefined) state.campaignDepth = null;
    }
};
