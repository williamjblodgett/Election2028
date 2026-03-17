/**
 * Election 2028 — UI Controller
 * Manages all screens, user interactions, map, and game flow
 */

window.GameUI = {
    currentScreen: 'title',
    selectedDemocrat: null,
    selectedRepublican: null,
    playerParty: null,
    selectedDifficulty: 'realistic',
    selectedMode: 'campaign',
    setupStep: 1,
    pendingActions: {},
    pendingEventChoices: {},
    weeklyEvents: [],
    selectedStates: [],
    currentStrategy: 'positive',
    activeTab: 'map',
    mobileActiveTab: 'map',
    isMobile: false,
    mapViewMode: 'map', // 'map' or 'list'

    // ═══════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════
    init() {
        this.checkMobile();
        this.checkSavedGame();
        this.renderTitleScreen();
        this.showScreen('title');
        this.initTicker();

        // Responsive listeners
        window.addEventListener('resize', () => {
            this.checkMobile();
            if (this.currentScreen === 'game') this.updateMobileNav();
        });
        window.addEventListener('orientationchange', () => {
            setTimeout(() => {
                this.checkMobile();
                if (this.currentScreen === 'game') this.renderGameScreen();
            }, 150);
        });
    },

    checkMobile() {
        this.isMobile = window.innerWidth <= 768;
        const nav = document.getElementById('mobile-nav');
        if (nav) {
            if (this.isMobile && this.currentScreen === 'game') {
                nav.classList.remove('hidden');
            } else {
                nav.classList.add('hidden');
            }
        }
    },

    // ═══════════════════════════════════════════════
    // SAVE / LOAD
    // ═══════════════════════════════════════════════
    checkSavedGame() {
        const btn = document.getElementById('continue-btn');
        if (!btn) return;
        const save = localStorage.getItem('election2028_save');
        if (save) {
            try {
                const data = JSON.parse(save);
                btn.classList.remove('hidden');
                btn.textContent = `CONTINUE (Week ${data.week})`;
            } catch(e) {
                btn.classList.add('hidden');
            }
        }
    },

    saveGame() {
        if (!window.GameEngine.state) return;
        const data = window.GameEngine.serialize();
        localStorage.setItem('election2028_save', data);
        localStorage.setItem('election2028_save_time', new Date().toISOString());
        this.showToast('Game saved!', 'success');
    },

    loadGame() {
        const save = localStorage.getItem('election2028_save');
        if (!save) { this.showToast('No saved game found', 'error'); return; }
        try {
            window.GameEngine.deserialize(save);
            // Restore UI state from engine state
            const gs = window.GameEngine.state;
            this.playerParty = gs.playerParty;
            this.selectedDemocrat = gs.playerParty === 'democrat' ? gs.playerCandidate : gs.opponentCandidate;
            this.selectedRepublican = gs.playerParty === 'republican' ? gs.playerCandidate : gs.opponentCandidate;
            this.showScreen('game');
            this.renderGameScreen();
            this.showToast(`Campaign resumed — ${window.GameEngine.getWeekLabel()}`, 'success');
        } catch(e) {
            this.showToast('Failed to load save', 'error');
        }
    },

    autoSave() {
        if (window.GameEngine.state && window.GameEngine.state.difficulty !== 'iron') {
            localStorage.setItem('election2028_save', window.GameEngine.serialize());
        }
    },

    initTicker() {
        const ticker = document.getElementById('ticker-content');
        if (ticker) {
            ticker.innerHTML = window.EventSystem.BreakingNewsTicker.getTickerHTML();
        }
    },

    // ═══════════════════════════════════════════════
    // SCREEN MANAGEMENT
    // ═══════════════════════════════════════════════
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
        const target = document.getElementById(`screen-${screenId}`);
        if (target) {
            target.classList.remove('hidden');
            this.currentScreen = screenId;
        }
        // Show/hide mobile nav
        const nav = document.getElementById('mobile-nav');
        if (nav) {
            if (this.isMobile && screenId === 'game') {
                nav.classList.remove('hidden');
            } else {
                nav.classList.add('hidden');
            }
        }
    },

    // ═══════════════════════════════════════════════
    // MOBILE NAVIGATION
    // ═══════════════════════════════════════════════
    switchMobileTab(tab) {
        this.mobileActiveTab = tab;
        this.updateMobileNav();

        const left = document.getElementById('game-left-panel');
        const center = document.getElementById('game-center');
        const right = document.getElementById('game-right-panel');

        // Reset visibility
        if (left) { left.classList.remove('mobile-visible'); }
        if (center) { center.classList.remove('mobile-hidden'); center.classList.add('mobile-hidden'); }
        if (right) { right.classList.remove('mobile-visible'); }

        switch (tab) {
            case 'map':
                if (center) center.classList.remove('mobile-hidden');
                this.activeTab = 'map';
                this.renderTabContent();
                break;
            case 'actions':
                if (left) left.classList.add('mobile-visible');
                break;
            case 'intel':
                if (right) right.classList.add('mobile-visible');
                break;
            case 'events':
                if (center) center.classList.remove('mobile-hidden');
                this.activeTab = 'events';
                this.renderTabContent();
                break;
        }
    },

    updateMobileNav() {
        document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === this.mobileActiveTab);
        });
        // Show event count badge
        const evtBtn = document.querySelector('.mobile-nav-btn[data-tab="events"]');
        if (evtBtn && this.weeklyEvents.length > 0) {
            evtBtn.querySelector('.mobile-nav-label').textContent = `Events (${this.weeklyEvents.length})`;
        } else if (evtBtn) {
            evtBtn.querySelector('.mobile-nav-label').textContent = 'Events';
        }
    },

    // ═══════════════════════════════════════════════
    // TITLE SCREEN
    // ═══════════════════════════════════════════════
    renderTitleScreen() {
        // Title screen is static HTML, nothing to render dynamically
    },

    startNewGame() {
        this.setupStep = 1;
        this.selectedDemocrat = null;
        this.selectedRepublican = null;
        this.playerParty = null;
        this.selectedDifficulty = 'realistic';
        this.selectedMode = 'campaign';
        this.showScreen('select');
        this.renderSetupStep();
    },

    // ═══════════════════════════════════════════════
    // SETUP FLOW
    // ═══════════════════════════════════════════════
    renderSetupStep() {
        const content = document.getElementById('setup-content');
        const title = document.getElementById('setup-title');
        const subtitle = document.getElementById('setup-subtitle');
        const backBtn = document.getElementById('setup-back-btn');
        const nextBtn = document.getElementById('setup-next-btn');

        backBtn.style.visibility = this.setupStep > 1 ? 'visible' : 'hidden';

        switch (this.setupStep) {
            case 1: // Game Mode
                title.textContent = 'Choose Your Mode';
                subtitle.textContent = 'Step 1 of 5';
                nextBtn.textContent = 'NEXT';
                content.innerHTML = `
                    <div class="mode-cards">
                        <div class="mode-card ${this.selectedMode === 'campaign' ? 'selected' : ''}" onclick="GameUI.selectMode('campaign')">
                            <div class="mode-icon">🎯</div>
                            <h4>Campaign Mode</h4>
                            <p>Play as one candidate against an AI opponent. Full strategic control.</p>
                        </div>
                        <div class="mode-card ${this.selectedMode === 'versus' ? 'selected' : ''}" onclick="GameUI.selectMode('versus')">
                            <div class="mode-icon">⚔️</div>
                            <h4>Versus Mode</h4>
                            <p>Control one candidate while the AI controls the other. Head-to-head.</p>
                        </div>
                        <div class="mode-card ${this.selectedMode === 'simulation' ? 'selected' : ''}" onclick="GameUI.selectMode('simulation')">
                            <div class="mode-icon">📊</div>
                            <h4>Simulation Mode</h4>
                            <p>Choose both candidates and watch the AI run the race. Pure chaos.</p>
                        </div>
                    </div>`;
                break;

            case 2: // Party Selection
                title.textContent = 'Choose Your Party';
                subtitle.textContent = 'Step 2 of 5';
                content.innerHTML = `
                    <div class="mode-cards" style="max-width:500px;margin:0 auto;">
                        <div class="mode-card ${this.playerParty === 'democrat' ? 'selected' : ''}" onclick="GameUI.selectParty('democrat')" style="border-color:${this.playerParty === 'democrat' ? 'var(--dem-blue)' : 'var(--border-color)'}">
                            <div class="mode-icon">🔵</div>
                            <h4 class="text-dem">Democrat</h4>
                            <p>Build a coalition of the diverse, the young, and the suburban to take back the White House.</p>
                        </div>
                        <div class="mode-card ${this.playerParty === 'republican' ? 'selected' : ''}" onclick="GameUI.selectParty('republican')" style="border-color:${this.playerParty === 'republican' ? 'var(--rep-red)' : 'var(--border-color)'}">
                            <div class="mode-icon">🔴</div>
                            <h4 class="text-rep">Republican</h4>
                            <p>Rally the base, win the heartland, and fight through the media to claim victory.</p>
                        </div>
                    </div>`;
                break;

            case 3: // Candidate Selection
                title.textContent = `Choose Your ${this.playerParty === 'democrat' ? 'Democratic' : 'Republican'} Candidate`;
                subtitle.textContent = 'Step 3 of 5';
                const candidates = this.playerParty === 'democrat' ? window.CandidateData.democrats : window.CandidateData.republicans;
                const selected = this.playerParty === 'democrat' ? this.selectedDemocrat : this.selectedRepublican;
                content.innerHTML = `<div class="candidate-grid">${candidates.map(c => this.renderCandidateCard(c, selected)).join('')}</div>`;
                break;

            case 4: // Opponent Selection
                title.textContent = `Choose Your ${this.playerParty === 'democrat' ? 'Republican' : 'Democratic'} Opponent`;
                subtitle.textContent = 'Step 4 of 5';
                const oppCandidates = this.playerParty === 'democrat' ? window.CandidateData.republicans : window.CandidateData.democrats;
                const oppSelected = this.playerParty === 'democrat' ? this.selectedRepublican : this.selectedDemocrat;
                content.innerHTML = `<div class="candidate-grid">${oppCandidates.map(c => this.renderCandidateCard(c, oppSelected, true)).join('')}</div>`;
                break;

            case 5: // Difficulty
                title.textContent = 'Choose Difficulty';
                subtitle.textContent = 'Step 5 of 5';
                nextBtn.textContent = 'START CAMPAIGN';
                content.innerHTML = `
                    <div class="difficulty-options">
                        <div class="difficulty-card ${this.selectedDifficulty === 'arcade' ? 'selected' : ''}" onclick="GameUI.selectDifficulty('arcade')">
                            <h4>🎮 Arcade</h4>
                            <p>More money, fewer scandals, forgiving AI. Learn the ropes.</p>
                        </div>
                        <div class="difficulty-card ${this.selectedDifficulty === 'realistic' ? 'selected' : ''}" onclick="GameUI.selectDifficulty('realistic')">
                            <h4>📰 Realistic</h4>
                            <p>Historically accurate dynamics. The real campaign experience.</p>
                        </div>
                        <div class="difficulty-card ${this.selectedDifficulty === 'chaos' ? 'selected' : ''}" onclick="GameUI.selectDifficulty('chaos')">
                            <h4>🌪️ Chaos</h4>
                            <p>Double events, higher scandal impact, maximum volatility. Buckle up.</p>
                        </div>
                        <div class="difficulty-card ${this.selectedDifficulty === 'iron' ? 'selected' : ''}" onclick="GameUI.selectDifficulty('iron')">
                            <h4>⛓️ Iron Campaign</h4>
                            <p>No saves. Permanent consequences. Brutal media. One shot at history.</p>
                        </div>
                    </div>`;
                break;
        }
    },

    selectMode(mode) {
        this.selectedMode = mode;
        this.renderSetupStep();
    },
    selectParty(party) {
        this.playerParty = party;
        this.renderSetupStep();
    },
    selectDifficulty(diff) {
        this.selectedDifficulty = diff;
        this.renderSetupStep();
    },

    renderCandidateCard(candidate, selected, isOpponent) {
        const isSelected = selected && selected.id === candidate.id;
        const partyClass = candidate.party === 'Democrat' ? 'selected-dem' : 'selected-rep';
        const barClass = candidate.party === 'Democrat' ? 'dem' : 'rep';
        return `
            <div class="candidate-card ${isSelected ? 'selected ' + partyClass : ''}" onclick="GameUI.selectCandidate('${candidate.id}', ${!!isOpponent})">
                ${candidate.isWildcard ? '<div class="wildcard-badge">WILDCARD</div>' : ''}
                <div class="candidate-portrait">${candidate.portraitEmoji}</div>
                <div class="candidate-name">${candidate.name}</div>
                <div class="candidate-title">${candidate.title} | Age ${candidate.age}</div>
                <div style="margin:8px 0;">
                    ${this.createStatBar('Charisma', candidate.charisma, barClass)}
                    ${this.createStatBar('Debate', candidate.debate, barClass)}
                    ${this.createStatBar('Fundraising', candidate.fundraising, barClass)}
                    ${this.createStatBar('Discipline', candidate.discipline, barClass)}
                    ${this.createStatBar('Media', candidate.mediaHandling, barClass)}
                    ${this.createStatBar('Base Energy', candidate.baseEnthusiasm, barClass)}
                    ${this.createStatBar('Crossover', candidate.crossoverAppeal, barClass)}
                    ${this.createStatBar('Scandal Armor', candidate.scandalResistance, barClass)}
                </div>
                <div class="candidate-slogan">"${candidate.slogan}"</div>
            </div>`;
    },

    createStatBar(label, value, colorClass) {
        return `<div class="stat-bar-container">
            <span class="stat-bar-label">${label}</span>
            <div class="stat-bar"><div class="stat-bar-fill ${colorClass || ''}" style="width:${value}%"></div></div>
            <span class="stat-bar-value">${value}</span>
        </div>`;
    },

    selectCandidate(candidateId, isOpponent) {
        const allCandidates = [...window.CandidateData.democrats, ...window.CandidateData.republicans];
        const candidate = allCandidates.find(c => c.id === candidateId);
        if (!candidate) return;

        if (isOpponent) {
            if (candidate.party === 'Democrat') this.selectedDemocrat = candidate;
            else this.selectedRepublican = candidate;
        } else {
            if (candidate.party === 'Democrat') this.selectedDemocrat = candidate;
            else this.selectedRepublican = candidate;
        }
        this.renderSetupStep();
    },

    nextSetupStep() {
        // Validation
        if (this.setupStep === 2 && !this.playerParty) {
            this.showToast('Please choose a party', 'warning');
            return;
        }
        if (this.setupStep === 3) {
            const sel = this.playerParty === 'democrat' ? this.selectedDemocrat : this.selectedRepublican;
            if (!sel) { this.showToast('Please choose your candidate', 'warning'); return; }
        }
        if (this.setupStep === 4) {
            const sel = this.playerParty === 'democrat' ? this.selectedRepublican : this.selectedDemocrat;
            if (!sel) { this.showToast('Please choose an opponent', 'warning'); return; }
        }

        if (this.setupStep >= 5) {
            this.launchGame();
            return;
        }
        this.setupStep++;
        this.renderSetupStep();
    },

    prevSetupStep() {
        if (this.setupStep > 1) {
            this.setupStep--;
            this.renderSetupStep();
        }
    },

    launchGame() {
        const playerCand = this.playerParty === 'democrat' ? this.selectedDemocrat : this.selectedRepublican;
        const oppCand = this.playerParty === 'democrat' ? this.selectedRepublican : this.selectedDemocrat;

        window.GameEngine.initGame(playerCand, oppCand, this.selectedMode, this.selectedDifficulty);
        this.showScreen('game');
        this.renderGameScreen();
        this.showToast(`Campaign launched! You are ${playerCand.name}.`, 'success');
    },

    // ═══════════════════════════════════════════════
    // MAIN GAME SCREEN
    // ═══════════════════════════════════════════════
    renderGameScreen() {
        this.updateTopBar();
        this.renderActionPanel();
        this.renderCenterContent();
        this.renderIntelPanel();
    },

    updateTopBar() {
        const gs = window.GameEngine.state;
        if (!gs) return;
        const topBar = document.getElementById('game-top-bar');
        const map = window.GameEngine.calculateElectoralMap();
        const weekLabel = window.GameEngine.getWeekLabel();

        const momClass = gs.campaign.momentum > 5 ? 'momentum-up' : gs.campaign.momentum < -5 ? 'momentum-down' : 'momentum-flat';
        const momIcon = gs.campaign.momentum > 5 ? '▲' : gs.campaign.momentum < -5 ? '▼' : '—';

        topBar.innerHTML = `
            <div class="top-bar-left">
                <span class="week-display">${weekLabel}</span>
                <span class="phase-badge ${gs.phase === 'primary' ? 'phase-primary' : 'phase-general'}">${gs.phase}</span>
            </div>
            <div class="top-bar-center">
                <div class="polling-pill">
                    <span class="text-dem">YOU</span>
                    <span class="poll-num" style="color:var(--dem-blue-light)">${Math.round(gs.campaign.nationalPolling)}%</span>
                    <span class="text-muted">vs</span>
                    <span class="poll-num" style="color:var(--rep-red-light)">${Math.round(gs.opponent.nationalPolling)}%</span>
                    <span class="text-rep">OPP</span>
                </div>
                <div class="polling-pill">
                    <span style="color:var(--dem-blue-light)">${map.playerEV}</span>
                    <span class="text-muted">EV</span>
                    <span style="color:var(--rep-red-light)">${map.opponentEV}</span>
                </div>
            </div>
            <div class="top-bar-right">
                <div class="cash-display">$${this.formatMoney(gs.finances.cashOnHand)}</div>
                <div class="momentum-display ${momClass}">
                    ${momIcon} <span>${Math.round(Math.abs(gs.campaign.momentum))}</span>
                </div>
                <button class="btn btn-sm" onclick="GameUI.saveGame()">💾</button>
                <button class="btn btn-primary btn-sm" onclick="GameUI.handleEndWeek()">ADVANCE →</button>
            </div>`;
    },

    renderActionPanel() {
        const panel = document.getElementById('game-left-panel');
        panel.innerHTML = `
            <div class="panel-section">
                <div class="panel-section-title">Campaign</div>
                <button class="btn action-btn" onclick="GameUI.showVisitModal()">
                    <span class="action-icon">✈️</span>
                    <span class="action-label">Visit State</span>
                    <span class="action-cost">$80K</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('rally')">
                    <span class="action-icon">📢</span>
                    <span class="action-label">Hold Rally</span>
                    <span class="action-cost">$60K</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('townhall')">
                    <span class="action-icon">🏛️</span>
                    <span class="action-label">Town Hall</span>
                    <span class="action-cost">$30K</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('podcast')">
                    <span class="action-icon">🎙️</span>
                    <span class="action-label">Podcast Tour</span>
                    <span class="action-cost">$5K</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('interview')">
                    <span class="action-icon">📺</span>
                    <span class="action-label">TV Interview</span>
                </button>
            </div>
            <div class="panel-section">
                <div class="panel-section-title">Strategy</div>
                <button class="btn action-btn" onclick="GameUI.showAdBuyModal()">
                    <span class="action-icon">📡</span>
                    <span class="action-label">Run Ads</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('oppoResearch')">
                    <span class="action-icon">🔍</span>
                    <span class="action-label">Oppo Research</span>
                    <span class="action-cost">$150K</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.showCoalitionModal()">
                    <span class="action-icon">🤝</span>
                    <span class="action-label">Build Coalition</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('debatePrep')">
                    <span class="action-icon">📋</span>
                    <span class="action-label">Debate Prep</span>
                </button>
            </div>
            <div class="panel-section">
                <div class="panel-section-title">Money</div>
                <button class="btn action-btn" onclick="GameUI.doActivity('fundraiser')">
                    <span class="action-icon">💰</span>
                    <span class="action-label">Fundraiser</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('donorEvent')">
                    <span class="action-icon">🎩</span>
                    <span class="action-label">Donor Event</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('fieldOffice')">
                    <span class="action-icon">🏢</span>
                    <span class="action-label">Open Field Office</span>
                    <span class="action-cost">$200K</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('surrogateDeployment')">
                    <span class="action-icon">🗣️</span>
                    <span class="action-label">Deploy Surrogates</span>
                    <span class="action-cost">$40K</span>
                </button>
            </div>
            <div class="panel-section">
                <div class="panel-section-title">Posture</div>
                <div class="strategy-option ${this.currentStrategy === 'positive' ? 'selected' : ''}" onclick="GameUI.setStrategy('positive')">
                    <span class="strategy-icon">☀️</span>
                    <div class="strategy-info"><h4>Go Positive</h4><p>Build approval, win persuadables</p></div>
                </div>
                <div class="strategy-option ${this.currentStrategy === 'contrast' ? 'selected' : ''}" onclick="GameUI.setStrategy('contrast')">
                    <span class="strategy-icon">⚖️</span>
                    <div class="strategy-info"><h4>Contrast</h4><p>Balanced offense and defense</p></div>
                </div>
                <div class="strategy-option ${this.currentStrategy === 'negative' ? 'selected' : ''}" onclick="GameUI.setStrategy('negative')">
                    <span class="strategy-icon">🔥</span>
                    <div class="strategy-info"><h4>Scorched Earth</h4><p>Destroy opponent at any cost</p></div>
                </div>
            </div>`;
    },

    setStrategy(strategy) {
        this.currentStrategy = strategy;
        this.renderActionPanel();
    },

    // ═══════════════════════════════════════════════
    // CENTER CONTENT (Map + Details)
    // ═══════════════════════════════════════════════
    renderCenterContent() {
        const center = document.getElementById('game-center');
        const gs = window.GameEngine.state;

        // Summary cards
        const c = gs.campaign;
        center.innerHTML = `
            <div class="summary-cards">
                <div class="summary-card">
                    <div class="sc-value ${c.approval > 50 ? 'text-green' : c.approval < 40 ? 'text-red' : ''}">${Math.round(c.approval)}%</div>
                    <div class="sc-label">Approval</div>
                </div>
                <div class="summary-card">
                    <div class="sc-value">${Math.round(c.enthusiasm)}</div>
                    <div class="sc-label">Enthusiasm</div>
                </div>
                <div class="summary-card">
                    <div class="sc-value">${Math.round(c.mediaScore)}</div>
                    <div class="sc-label">Media Score</div>
                </div>
                <div class="summary-card">
                    <div class="sc-value">${Math.round(c.groundGame)}</div>
                    <div class="sc-label">Ground Game</div>
                </div>
                <div class="summary-card">
                    <div class="sc-value">${Math.round(c.onlineInfluence)}</div>
                    <div class="sc-label">Online</div>
                </div>
                <div class="summary-card">
                    <div class="sc-value">${Math.round(c.donorConfidence)}</div>
                    <div class="sc-label">Donors</div>
                </div>
            </div>

            <div class="tab-bar">
                <button class="tab-btn ${this.activeTab === 'map' ? 'active' : ''}" onclick="GameUI.switchTab('map')">Electoral Map</button>
                <button class="tab-btn ${this.activeTab === 'events' ? 'active' : ''}" onclick="GameUI.switchTab('events')">Events ${this.weeklyEvents.length > 0 ? '(' + this.weeklyEvents.length + ')' : ''}</button>
                <button class="tab-btn ${this.activeTab === 'stats' ? 'active' : ''}" onclick="GameUI.switchTab('stats')">Campaign Stats</button>
                <button class="tab-btn ${this.activeTab === 'history' ? 'active' : ''}" onclick="GameUI.switchTab('history')">History</button>
            </div>

            <div id="center-tab-content"></div>`;

        this.renderTabContent();
    },

    switchTab(tab) {
        this.activeTab = tab;
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-btn').forEach(b => {
            if (b.textContent.toLowerCase().startsWith(tab)) b.classList.add('active');
        });
        this.renderTabContent();
    },

    renderTabContent() {
        const container = document.getElementById('center-tab-content');
        if (!container) return;

        switch (this.activeTab) {
            case 'map':
                if (this.isMobile && this.mapViewMode === 'list') {
                    this.renderMapListView(container);
                } else {
                    this.renderMap(container);
                }
                break;
            case 'events': this.renderEventsTab(container); break;
            case 'stats': this.renderStatsTab(container); break;
            case 'history': this.renderHistoryTab(container); break;
        }
    },

    // ═══════════════════════════════════════════════
    // MAP
    // ═══════════════════════════════════════════════
    renderMap(container) {
        const gs = window.GameEngine.state;
        const map = window.GameEngine.calculateElectoralMap();

        let statesHTML = '';
        for (const st of window.StateData) {
            const poll = gs.statePolling[st.id];
            if (!poll) continue;
            const margin = poll.player - poll.opponent;
            const colorClass = this.getStateColorClass(margin, st.isBattleground);
            const size = Math.max(18, Math.min(42, 12 + st.electoralVotes * 0.9));

            statesHTML += `<div class="map-state ${colorClass} ${st.isBattleground ? 'battleground' : ''}"
                style="left:${st.cx}%;top:${st.cy}%;width:${size}px;height:${size}px;margin-left:${-size/2}px;margin-top:${-size/2}px;"
                onclick="GameUI.handleStateClick('${st.id}')"
                title="${st.name}: ${Math.round(poll.player)}% - ${Math.round(poll.opponent)}%">
                ${st.id}
            </div>`;
        }

        container.innerHTML = `
            <div class="us-map-container">
                ${statesHTML}
                <div class="map-legend">
                    <div class="legend-item"><div class="legend-color" style="background:#1a47a0"></div>Safe D</div>
                    <div class="legend-item"><div class="legend-color" style="background:#2d6fd4"></div>Lean D</div>
                    <div class="legend-item"><div class="legend-color" style="background:#5a9ae8"></div>Tilt D</div>
                    <div class="legend-item"><div class="legend-color" style="background:#8855aa"></div>Toss-Up</div>
                    <div class="legend-item"><div class="legend-color" style="background:#e85a5a"></div>Tilt R</div>
                    <div class="legend-item"><div class="legend-color" style="background:#d42d2d"></div>Lean R</div>
                    <div class="legend-item"><div class="legend-color" style="background:#a01a1a"></div>Safe R</div>
                </div>
                <div class="ec-counter">
                    <div class="ec-count dem">
                        <div class="ec-num">${map.playerEV}</div>
                        <div class="ec-label">${gs.playerCandidate.name.split(' ').pop()}</div>
                    </div>
                    <div class="ec-count" style="color:var(--text-muted);">
                        <div class="ec-num" style="font-size:1rem;">270 to win</div>
                    </div>
                    <div class="ec-count rep">
                        <div class="ec-num">${map.opponentEV}</div>
                        <div class="ec-label">${gs.opponentCandidate.name.split(' ').pop()}</div>
                    </div>
                </div>
            </div>
            ${this.isMobile ? '<div style="text-align:center;margin-top:8px;"><button class="btn btn-sm btn-ghost" onclick="GameUI.toggleMapView()">📋 List View</button></div>' : ''}
            <div id="state-detail-area"></div>`;
    },

    getStateColorClass(margin, isBattleground) {
        const isPlayerDem = window.GameEngine.state.playerParty === 'democrat';
        // margin > 0 means player leads
        let demMargin = isPlayerDem ? margin : -margin;

        if (demMargin > 15) return 'dem-safe';
        if (demMargin > 8) return 'dem-lean';
        if (demMargin > 2) return 'dem-tilt';
        if (demMargin < -15) return 'rep-safe';
        if (demMargin < -8) return 'rep-lean';
        if (demMargin < -2) return 'rep-tilt';
        return 'tossup';
    },

    handleStateClick(stateId) {
        const st = window.StateData.find(s => s.id === stateId);
        const gs = window.GameEngine.state;
        const poll = gs.statePolling[stateId];
        if (!st || !poll) return;

        const area = document.getElementById('state-detail-area');
        const playerPct = Math.round(poll.player * 10) / 10;
        const oppPct = Math.round(poll.opponent * 10) / 10;
        const pName = gs.playerCandidate.name.split(' ').pop();
        const oName = gs.opponentCandidate.name.split(' ').pop();
        const trendIcon = poll.trend > 0.5 ? '<span class="poll-trend up">▲</span>' : poll.trend < -0.5 ? '<span class="poll-trend down">▼</span>' : '';

        // Top issues for this state
        const issues = st.issueSalience;
        const topIssues = Object.entries(issues).sort((a, b) => b[1] - a[1]).slice(0, 5);

        area.innerHTML = `
            <div class="state-detail">
                <div class="state-detail-header">
                    <h3>${st.name} ${trendIcon}</h3>
                    <span class="state-ev-badge">${st.electoralVotes} EV</span>
                </div>
                <div class="state-poll-bar">
                    <div class="state-poll-dem" style="width:${playerPct}%">${pName} ${playerPct}%</div>
                    <div class="state-poll-rep" style="width:${oppPct}%">${oName} ${oppPct}%</div>
                </div>
                <div class="state-info-grid">
                    <div class="state-info-item">
                        <div class="info-label">Partisan Lean</div>
                        <div>${st.partisanLean > 0 ? 'R+' + st.partisanLean : st.partisanLean < 0 ? 'D+' + Math.abs(st.partisanLean) : 'Even'}</div>
                    </div>
                    <div class="state-info-item">
                        <div class="info-label">Swing Volatility</div>
                        <div>${st.swingVolatility}/100</div>
                    </div>
                    <div class="state-info-item">
                        <div class="info-label">Ad Cost</div>
                        <div>${st.adCostMultiplier}x market rate</div>
                    </div>
                    <div class="state-info-item">
                        <div class="info-label">Key Metro</div>
                        <div>${st.keyCity}</div>
                    </div>
                    <div class="state-info-item">
                        <div class="info-label">Composition</div>
                        <div>Urban ${st.composition.urban}% / Sub ${st.composition.suburban}% / Rural ${st.composition.rural}%</div>
                    </div>
                    <div class="state-info-item">
                        <div class="info-label">Education</div>
                        <div>College ${st.educationSplit.college}% / Non-College ${st.educationSplit.nonCollege}%</div>
                    </div>
                    <div class="state-info-item">
                        <div class="info-label">Top Issues</div>
                        <div>${topIssues.map(([k, v]) => `${this.formatIssue(k)} (${v})`).join(', ')}</div>
                    </div>
                    <div class="state-info-item">
                        <div class="info-label">Your Visits</div>
                        <div>${gs.visitedStates[stateId] || 0} visits</div>
                    </div>
                </div>
                <div class="mt-1 btn-group">
                    <button class="btn btn-sm btn-primary" onclick="GameUI.quickVisit('${stateId}')">Visit Now ($80K)</button>
                    <button class="btn btn-sm" onclick="GameUI.quickAd('${stateId}')">Run Ad ($100K)</button>
                </div>
            </div>`;
    },

    formatIssue(key) {
        const map = { economy: 'Economy', immigration: 'Immigration', abortion: 'Abortion', crime: 'Crime', cultureWar: 'Culture', labor: 'Labor', energy: 'Energy', healthcare: 'Health', education: 'Education', gunPolicy: 'Guns' };
        return map[key] || key;
    },

    quickVisit(stateId) {
        const gs = window.GameEngine.state;
        if (gs.finances.cashOnHand < 80000) {
            this.showToast('Not enough cash for travel!', 'error');
            return;
        }
        window.GameEngine.applyCampaignVisit(stateId);
        const st = window.StateData.find(s => s.id === stateId);
        this.showToast(`Campaigned in ${st ? st.name : stateId}!`, 'success');
        this.updateTopBar();
        this.renderCenterContent();
    },

    quickAd(stateId) {
        const gs = window.GameEngine.state;
        if (gs.finances.cashOnHand < 100000) {
            this.showToast('Not enough cash for ads!', 'error');
            return;
        }
        window.GameEngine.applyAdBuy(stateId, 'digital', 100000, this.currentStrategy === 'negative' ? 'negative' : this.currentStrategy === 'contrast' ? 'contrast' : 'positive');
        const st = window.StateData.find(s => s.id === stateId);
        this.showToast(`Ad running in ${st ? st.name : stateId}!`, 'success');
        this.updateTopBar();
        this.renderCenterContent();
    },

    // ═══════════════════════════════════════════════
    // EVENTS TAB
    // ═══════════════════════════════════════════════
    renderEventsTab(container) {
        if (this.weeklyEvents.length === 0) {
            container.innerHTML = `<div class="text-center text-muted" style="padding:3rem;">
                <h3>No active events</h3>
                <p>Events will appear here as the campaign progresses. Advance the week to see what unfolds.</p>
            </div>`;
            return;
        }

        container.innerHTML = this.weeklyEvents.map(evt => `
            <div class="event-card ${evt.isBreakingNews ? 'breaking' : ''}">
                <div class="event-category">${evt.category.replace('_', ' ')}</div>
                <div class="event-title">${evt.title}</div>
                <div class="event-description">${evt.description}</div>
                <div class="event-choices">
                    ${evt.choices.map((ch, i) => `
                        <button class="event-choice" onclick="GameUI.handleEventChoice('${evt.id}', ${i})">
                            ${ch.text}
                            <span class="choice-risk risk-${ch.riskLevel}">${ch.riskLevel}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `).join('');
    },

    handleEventChoice(eventId, choiceIdx) {
        const evt = this.weeklyEvents.find(e => e.id === eventId);
        if (!evt) return;

        window.GameEngine.applyEventChoice(eventId, choiceIdx, this.weeklyEvents);
        const choice = evt.choices[choiceIdx];

        // Show outcome
        this.showToast(choice.outcomeText, choice.riskLevel === 'safe' ? 'success' : choice.riskLevel === 'risky' || choice.riskLevel === 'desperate' ? 'warning' : 'info');

        // Remove handled event
        this.weeklyEvents = this.weeklyEvents.filter(e => e.id !== eventId);
        this.renderCenterContent();
        this.updateTopBar();
    },

    // ═══════════════════════════════════════════════
    // STATS TAB
    // ═══════════════════════════════════════════════
    renderStatsTab(container) {
        const gs = window.GameEngine.state;
        const c = gs.campaign;
        const f = gs.finances;
        const barClass = gs.playerParty === 'democrat' ? 'dem' : 'rep';

        container.innerHTML = `
            <div class="week-summary">
                <h3>📊 Campaign Dashboard — ${gs.playerCandidate.name}</h3>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;">
                    <div>
                        <h4 style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:8px;">Performance</h4>
                        ${this.createStatBar('Approval', Math.round(c.approval), barClass)}
                        ${this.createStatBar('Enthusiasm', Math.round(c.enthusiasm), barClass)}
                        ${this.createStatBar('Media Score', Math.round(c.mediaScore), barClass)}
                        ${this.createStatBar('Online', Math.round(c.onlineInfluence), barClass)}
                        ${this.createStatBar('Persuadables', Math.round(c.persuadableSupport), barClass)}
                        ${this.createStatBar('Base Turnout', Math.round(c.baseTurnout), barClass)}
                    </div>
                    <div>
                        <h4 style="font-size:0.85rem;color:var(--text-secondary);margin-bottom:8px;">Operations</h4>
                        ${this.createStatBar('Ground Game', Math.round(c.groundGame), 'green')}
                        ${this.createStatBar('Debate Skill', Math.round(c.debateSkill), 'green')}
                        ${this.createStatBar('Donor Conf.', Math.round(c.donorConfidence), 'yellow')}
                        ${this.createStatBar('Surrogates', Math.round(c.surrogateStrength), 'green')}
                        ${this.createStatBar('Scandal Risk', Math.round(c.scandalVulnerability), 'red')}
                        ${this.createStatBar('Momentum', Math.round(Math.max(0, c.momentum + 50)), barClass)}
                    </div>
                </div>
            </div>
            <div class="week-summary">
                <h3>💰 Financial Report</h3>
                <div class="week-summary-stats">
                    <div class="ws-stat"><span>Cash on Hand</span><span class="ws-change positive">$${this.formatMoney(f.cashOnHand)}</span></div>
                    <div class="ws-stat"><span>Total Raised</span><span class="ws-change">$${this.formatMoney(f.totalRaised)}</span></div>
                    <div class="ws-stat"><span>Total Spent</span><span class="ws-change negative">$${this.formatMoney(f.totalSpent)}</span></div>
                    <div class="ws-stat"><span>Weekly Small Dollar</span><span class="ws-change">$${this.formatMoney(f.weeklySmallDollar)}/wk</span></div>
                    <div class="ws-stat"><span>Weekly High Dollar</span><span class="ws-change">$${this.formatMoney(f.weeklyHighDollar)}/wk</span></div>
                    <div class="ws-stat"><span>Burn Rate</span><span class="ws-change negative">$${this.formatMoney(f.burnRate)}/wk</span></div>
                    <div class="ws-stat"><span>Super PAC</span><span class="ws-change">${f.superPACSupport > 0 ? '$' + this.formatMoney(f.superPACSupport) : 'None'}</span></div>
                </div>
            </div>`;
    },

    // ═══════════════════════════════════════════════
    // HISTORY TAB
    // ═══════════════════════════════════════════════
    renderHistoryTab(container) {
        const gs = window.GameEngine.state;
        if (gs.weekHistory.length === 0) {
            container.innerHTML = '<div class="text-center text-muted" style="padding:3rem;"><p>No history yet. Advance the campaign!</p></div>';
            return;
        }
        const recent = gs.weekHistory.slice(-10).reverse();
        container.innerHTML = recent.map(wh => `
            <div class="week-summary" style="margin-bottom:8px;">
                <h3>Week ${wh.week} — ${wh.phase}</h3>
                ${wh.events.length > 0 ? `<div style="font-size:0.85rem;margin-bottom:4px;">Events: ${wh.events.map(e => e.title).join(', ')}</div>` : ''}
                ${wh.opponentActions.length > 0 ? `<div style="font-size:0.8rem;color:var(--text-secondary);">Opponent: ${wh.opponentActions.join(' | ')}</div>` : ''}
                ${wh.newsHeadlines.length > 0 ? `<div style="font-size:0.8rem;color:var(--accent-red);margin-top:4px;">${wh.newsHeadlines.join(' | ')}</div>` : ''}
            </div>
        `).join('');
    },

    // ═══════════════════════════════════════════════
    // INTEL PANEL (Right)
    // ═══════════════════════════════════════════════
    renderIntelPanel() {
        const panel = document.getElementById('game-right-panel');
        const gs = window.GameEngine.state;

        // Battleground polling cards
        const battlegrounds = window.StateData.filter(s => s.isBattleground)
            .sort((a, b) => {
                const pa = gs.statePolling[a.id], pb = gs.statePolling[b.id];
                return Math.abs((pa ? pa.player - pa.opponent : 0)) - Math.abs((pb ? pb.player - pb.opponent : 0));
            });

        let pollCardsHTML = battlegrounds.map(st => {
            const poll = gs.statePolling[st.id];
            if (!poll) return '';
            const total = poll.player + poll.opponent;
            const pPct = (poll.player / total * 100).toFixed(0);
            const oPct = (poll.opponent / total * 100).toFixed(0);
            const trendIcon = poll.trend > 0.5 ? '<span class="poll-trend up">▲</span>' : poll.trend < -0.5 ? '<span class="poll-trend down">▼</span>' : '';
            return `
                <div class="poll-card" onclick="GameUI.handleStateClick('${st.id}');GameUI.switchTab('map');">
                    <div class="poll-card-header">
                        <span class="poll-card-state">${st.name} ${trendIcon}</span>
                        <span class="poll-card-ev">${st.electoralVotes} EV</span>
                    </div>
                    <div class="poll-mini-bar">
                        <div class="poll-mini-dem" style="width:${pPct}%"></div>
                        <div class="poll-mini-rep" style="width:${oPct}%"></div>
                    </div>
                    <div class="poll-card-numbers">
                        <span class="text-dem">${Math.round(poll.player * 10) / 10}%</span>
                        <span class="text-rep">${Math.round(poll.opponent * 10) / 10}%</span>
                    </div>
                </div>`;
        }).join('');

        // Recent news
        const recentNews = gs.newsHistory.slice(-5).reverse();
        const newsHTML = recentNews.length > 0
            ? recentNews.map(h => `<div class="scandal-item">${h}</div>`).join('')
            : '<div class="text-muted" style="font-size:0.8rem;">No news yet</div>';

        // Scandal tracker
        const scandalLevel = gs.campaign.scandalVulnerability;
        const scandalClass = scandalLevel > 70 ? 'severity-critical' : scandalLevel > 50 ? 'severity-high' : scandalLevel > 30 ? 'severity-medium' : 'severity-low';

        panel.innerHTML = `
            <div class="panel-section">
                <div class="panel-section-title">Battleground Polling</div>
                ${pollCardsHTML}
            </div>
            <div class="panel-section">
                <div class="panel-section-title">News Feed</div>
                ${newsHTML}
            </div>
            <div class="panel-section">
                <div class="panel-section-title">Scandal Tracker</div>
                <div class="scandal-item">
                    <span class="scandal-severity ${scandalClass}"></span>
                    Vulnerability: ${Math.round(scandalLevel)}/100
                    <div class="scandal-week">${scandalLevel > 60 ? 'WARNING: High exposure to media attacks' : 'Manageable — stay disciplined'}</div>
                </div>
            </div>
            <div class="panel-section">
                <div class="panel-section-title">Opponent Intel</div>
                <div style="font-size:0.8rem;color:var(--text-secondary);">
                    <div style="margin-bottom:4px;">${gs.opponentCandidate.name}</div>
                    ${this.createStatBar('Approval', Math.round(gs.opponent.approval), 'red')}
                    ${this.createStatBar('Enthusiasm', Math.round(gs.opponent.enthusiasm), 'red')}
                    ${this.createStatBar('Cash', Math.min(100, Math.round(gs.opponent.cash / 100000)), 'yellow')}
                </div>
            </div>`;
    },

    // ═══════════════════════════════════════════════
    // WEEKLY TURN FLOW
    // ═══════════════════════════════════════════════
    handleEndWeek() {
        const gs = window.GameEngine.state;

        // Check for VP pick (week 24-26, general phase)
        if (gs.phase === 'general' && !gs.vpPicked && gs.week >= 24 && gs.week <= 26) {
            this.showVPPickModal();
            return; // VP pick must happen before advancing
        }

        // Check for convention (week 20-22)
        if (gs.phase === 'general' && !gs.conventionDone && gs.week >= 20 && gs.week <= 22) {
            const result = window.GameEngine.processConvention();
            this.showToast(result.message || 'Convention bounce!', 'success');
        }

        // Process the week
        const result = window.GameEngine.processWeek({
            strategy: this.currentStrategy,
            eventChoices: this.pendingEventChoices,
        });

        // Store events for display
        this.weeklyEvents = result.events;
        this.pendingEventChoices = {};

        // Auto-save after each week
        this.autoSave();

        // Update ticker with new headlines
        if (result.summary.newsHeadlines.length > 0) {
            this.updateTicker(result.summary.newsHeadlines);
        }

        // Check for debate
        if (result.isDebateWeek) {
            this.showToast('DEBATE NIGHT! Prepare yourself.', 'info');
            setTimeout(() => this.startDebate(), 1000);
            return;
        }

        // Check for game over
        if (result.gameOver) {
            this.startElectionNight();
            return;
        }

        // Show events if any
        if (this.weeklyEvents.length > 0) {
            this.activeTab = 'events';
            if (this.isMobile) this.switchMobileTab('events');
            this.showToast(`Week ${gs.week - 1} complete. ${this.weeklyEvents.length} event(s) need your response!`, 'info');
        } else {
            this.showToast(`Week ${gs.week - 1} complete.`, 'info');
        }

        // Refresh everything
        this.renderGameScreen();
    },

    doActivity(activity) {
        const gs = window.GameEngine.state;
        const costMap = { rally: 60000, townhall: 30000, podcast: 5000, oppoResearch: 150000, fieldOffice: 200000, surrogateDeployment: 40000 };
        const cost = costMap[activity] || 0;
        if (cost > 0 && gs.finances.cashOnHand < cost) {
            this.showToast(`Not enough cash! Need $${this.formatMoney(cost)}`, 'error');
            return;
        }
        const result = window.GameEngine.applyActivityEffects(activity);
        const labels = { rally: 'Rally', townhall: 'Town Hall', podcast: 'Podcast', interview: 'Interview', fundraiser: 'Fundraiser', donorEvent: 'Donor Event', debatePrep: 'Debate Prep', surrogateDeployment: 'Surrogate Deployment', oppoResearch: 'Oppo Research', fieldOffice: 'Field Office' };
        const msg = result.cashRaised ? `${labels[activity]}! Raised $${this.formatMoney(result.cashRaised)}` : `${labels[activity]} complete!`;
        this.showToast(msg, 'success');
        this.updateTopBar();
        this.renderCenterContent();
        this.renderIntelPanel();
    },

    // ═══════════════════════════════════════════════
    // MODALS
    // ═══════════════════════════════════════════════
    showModal(title, contentHtml) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-body').innerHTML = contentHtml;
        document.getElementById('modal-overlay').classList.remove('hidden');
    },

    closeModal(event) {
        if (event && event.target !== document.getElementById('modal-overlay')) return;
        document.getElementById('modal-overlay').classList.add('hidden');
    },

    showVisitModal() {
        const states = window.StateData.filter(s => s.isBattleground)
            .sort((a, b) => {
                const pa = window.GameEngine.state.statePolling[a.id];
                const pb = window.GameEngine.state.statePolling[b.id];
                return Math.abs(pa.player - pa.opponent) - Math.abs(pb.player - pb.opponent);
            });

        const html = `
            <p class="text-muted mb-1">Choose a state to visit. Closest races listed first. Cost: $80K per visit.</p>
            <div style="display:grid;gap:8px;max-height:400px;overflow-y:auto;">
                ${states.map(st => {
                    const poll = window.GameEngine.state.statePolling[st.id];
                    const margin = (poll.player - poll.opponent).toFixed(1);
                    const sign = margin > 0 ? '+' : '';
                    return `<button class="btn action-btn" onclick="GameUI.quickVisit('${st.id}');GameUI.closeModal();">
                        <span>${st.name}</span>
                        <span class="text-muted">${st.electoralVotes} EV</span>
                        <span style="color:${margin > 0 ? 'var(--accent-green)' : 'var(--accent-red)'}">${sign}${margin}</span>
                    </button>`;
                }).join('')}
            </div>`;
        this.showModal('Visit State', html);
    },

    showAdBuyModal() {
        const gs = window.GameEngine.state;
        const states = window.StateData.filter(s => s.isBattleground);

        const html = `
            <p class="text-muted mb-1">Choose a state, ad type, and budget.</p>
            <div class="mb-2">
                <label style="font-size:0.85rem;color:var(--text-secondary);">Target State</label>
                <select id="ad-state" style="width:100%;padding:8px;background:var(--bg-card);color:var(--text-primary);border:1px solid var(--border-color);border-radius:var(--radius-sm);margin-top:4px;">
                    ${states.map(st => `<option value="${st.id}">${st.name} (${st.electoralVotes} EV, ${st.adCostMultiplier}x cost)</option>`).join('')}
                </select>
            </div>
            <div class="mb-2">
                <label style="font-size:0.85rem;color:var(--text-secondary);">Ad Type</label>
                <div class="btn-group mt-1">
                    <button class="btn btn-sm" id="ad-tv" onclick="document.getElementById('ad-tv').classList.add('selected');document.getElementById('ad-digital').classList.remove('selected');">📺 TV ($$$)</button>
                    <button class="btn btn-sm selected" id="ad-digital" onclick="document.getElementById('ad-digital').classList.add('selected');document.getElementById('ad-tv').classList.remove('selected');">💻 Digital ($$)</button>
                </div>
            </div>
            <div class="mb-2">
                <label style="font-size:0.85rem;color:var(--text-secondary);">Budget: <span id="ad-budget-display">$100K</span></label>
                <input type="range" class="spending-slider" id="ad-budget" min="50000" max="1000000" step="50000" value="100000"
                    oninput="document.getElementById('ad-budget-display').textContent='$'+GameUI.formatMoney(this.value)">
            </div>
            <div class="mb-2">
                <label style="font-size:0.85rem;color:var(--text-secondary);">Tone</label>
                <div class="btn-group mt-1">
                    <button class="btn btn-sm selected" id="tone-positive" onclick="GameUI._selectToneBtn('positive')">☀️ Positive</button>
                    <button class="btn btn-sm" id="tone-contrast" onclick="GameUI._selectToneBtn('contrast')">⚖️ Contrast</button>
                    <button class="btn btn-sm" id="tone-negative" onclick="GameUI._selectToneBtn('negative')">🔥 Negative</button>
                </div>
            </div>
            <div class="text-muted" style="font-size:0.8rem;margin-bottom:12px;">Cash available: $${this.formatMoney(gs.finances.cashOnHand)}</div>
            <button class="btn btn-primary w-full" onclick="GameUI.executeAdBuy()">LAUNCH AD CAMPAIGN</button>`;

        this.showModal('Run Ads', html);
        this._adTone = 'positive';
    },

    _selectToneBtn(tone) {
        this._adTone = tone;
        ['positive', 'contrast', 'negative'].forEach(t => {
            const el = document.getElementById('tone-' + t);
            if (el) el.classList.toggle('selected', t === tone);
        });
    },

    executeAdBuy() {
        const stateId = document.getElementById('ad-state').value;
        const budget = parseInt(document.getElementById('ad-budget').value);
        const isTV = document.getElementById('ad-tv').classList.contains('selected');
        const type = isTV ? 'tv' : 'digital';
        const tone = this._adTone || 'positive';

        if (budget > window.GameEngine.state.finances.cashOnHand) {
            this.showToast('Not enough cash!', 'error');
            return;
        }

        window.GameEngine.applyAdBuy(stateId, type, budget, tone);
        const st = window.StateData.find(s => s.id === stateId);
        this.showToast(`$${this.formatMoney(budget)} ${type.toUpperCase()} ad launched in ${st ? st.name : stateId}!`, 'success');
        this.closeModal();
        this.updateTopBar();
        this.renderCenterContent();
        this.renderIntelPanel();
    },

    showCoalitionModal() {
        const coalitions = [
            { id: 'labor', icon: '⚒️', name: 'Labor & Unions', desc: 'Boost turnout and ground game in industrial states' },
            { id: 'youth', icon: '🎓', name: 'Young Voters', desc: 'Online influence and enthusiasm surge' },
            { id: 'suburban', icon: '🏡', name: 'Suburban Voters', desc: 'Win persuadable voters in swing counties' },
            { id: 'rural', icon: '🌾', name: 'Rural Outreach', desc: 'Compete in rural areas and small towns' },
            { id: 'minority', icon: '✊', name: 'Communities of Color', desc: 'Drive turnout in diverse urban centers' },
            { id: 'women', icon: '♀️', name: 'Women Voters', desc: 'Approval and persuadable voter boost' },
            { id: 'veterans', icon: '🎖️', name: 'Veterans & Military', desc: 'Credibility and surrogate strength' },
            { id: 'evangelical', icon: '⛪', name: 'Faith Communities', desc: 'Base turnout and enthusiasm' },
        ];

        const html = `
            <p class="text-muted mb-1">Choose a coalition to focus your outreach this week.</p>
            <div style="display:grid;gap:8px;">
                ${coalitions.map(c => `
                    <button class="btn action-btn" onclick="GameUI.doCoalition('${c.id}')">
                        <span class="action-icon">${c.icon}</span>
                        <div style="flex:1;text-align:left;">
                            <div style="font-weight:600;">${c.name}</div>
                            <div style="font-size:0.75rem;color:var(--text-secondary);">${c.desc}</div>
                        </div>
                    </button>
                `).join('')}
            </div>`;
        this.showModal('Build Coalition', html);
    },

    doCoalition(coalition) {
        window.GameEngine.applyCoalitionBuilding(coalition);
        const names = { labor: 'Labor', youth: 'Youth', suburban: 'Suburban', rural: 'Rural', minority: 'Communities of Color', women: 'Women', veterans: 'Veterans', evangelical: 'Faith' };
        this.showToast(`${names[coalition]} coalition outreach complete!`, 'success');
        this.closeModal();
        this.updateTopBar();
        this.renderCenterContent();
    },

    // ═══════════════════════════════════════════════
    // VP PICK
    // ═══════════════════════════════════════════════
    showVPPickModal() {
        const gs = window.GameEngine.state;
        const isDem = gs.playerParty === 'democrat';

        // Generate VP options based on party
        const vpOptions = isDem ? [
            { name: 'Gov. Wes Moore (MD)', home: 'Maryland', desc: 'Young, charismatic governor. Boosts minority turnout and enthusiasm.', effects: { enthusiasm: 8, baseTurnout: 5, onlineInfluence: 4 } },
            { name: 'Sen. Mark Kelly (AZ)', home: 'Arizona', desc: 'Astronaut, veteran, swing-state senator. Maximizes crossover appeal.', effects: { crossoverAppeal: 8, approval: 4, persuadableSupport: 5 } },
            { name: 'Gov. Gretchen Whitmer (MI)', home: 'Michigan', desc: 'Proven swing-state winner. Strengthens Midwest firewall.', effects: { groundGame: 6, baseTurnout: 4, surrogateStrength: 5 } },
            { name: 'Sen. Raphael Warnock (GA)', home: 'Georgia', desc: 'Powerful orator from Georgia. Energizes the base and Southern strategy.', effects: { baseEnthusiasm: 7, enthusiasm: 5, surrogateStrength: 4 } },
            { name: 'Gov. Andy Beshear (KY)', home: 'Kentucky', desc: 'Won in deep-red Kentucky. Ultimate electability argument.', effects: { crossoverAppeal: 10, persuadableSupport: 6, donorConfidence: 4 } },
        ] : [
            { name: 'Gov. Glenn Youngkin (VA)', home: 'Virginia', desc: 'Business-friendly governor. Locks down suburban and donor support.', effects: { donorConfidence: 7, crossoverAppeal: 5, persuadableSupport: 5 } },
            { name: 'Sen. Tim Scott (SC)', home: 'South Carolina', desc: 'Optimistic messenger with broad appeal. Expands the coalition.', effects: { crossoverAppeal: 6, approval: 5, enthusiasm: 4 } },
            { name: 'Rep. Elise Stefanik (NY)', home: 'New York', desc: 'Fighter who energizes the MAGA base. Strong media presence.', effects: { baseEnthusiasm: 8, mediaScore: 5, onlineInfluence: 4 } },
            { name: 'Gov. Brian Kemp (GA)', home: 'Georgia', desc: 'Proven Georgia winner. Ground game and swing-state credibility.', effects: { groundGame: 6, baseTurnout: 5, crossoverAppeal: 4 } },
            { name: 'Sen. Katie Britt (AL)', home: 'Alabama', desc: 'Youngest woman in the Senate. Fresh face with fundraising strength.', effects: { fundraising: 5, enthusiasm: 5, onlineInfluence: 5 } },
        ];

        const html = `
            <p class="text-muted mb-2">This is one of the most important decisions of your campaign. Your VP pick will affect your coalition, messaging, and electoral map for the rest of the race.</p>
            <div style="display:grid;gap:10px;">
                ${vpOptions.map((vp, i) => `
                    <button class="btn action-btn" onclick="GameUI.pickVP(${i})" style="flex-direction:column;align-items:flex-start;padding:16px;">
                        <div style="font-weight:700;font-size:1rem;">${vp.name}</div>
                        <div style="font-size:0.8rem;color:var(--text-secondary);margin:4px 0;">${vp.desc}</div>
                        <div style="font-size:0.75rem;color:var(--accent-green);">
                            ${Object.entries(vp.effects).map(([k, v]) => `+${v} ${k.replace(/([A-Z])/g, ' $1').trim()}`).join(' | ')}
                        </div>
                    </button>
                `).join('')}
            </div>`;

        this._vpOptions = vpOptions;
        this.showModal('Choose Your Running Mate', html);
    },

    pickVP(index) {
        const vp = this._vpOptions[index];
        if (!vp) return;

        const result = window.GameEngine.processVPPick(vp.name);

        // Apply VP-specific stat bonuses
        const c = window.GameEngine.state.campaign;
        for (const [key, val] of Object.entries(vp.effects)) {
            if (c.hasOwnProperty(key)) c[key] += val;
        }

        this.showToast(result.message || `VP Pick: ${vp.name}!`, 'success');
        this.closeModal();
        this.updateTopBar();
        this.renderCenterContent();

        // Now advance the week that was pending
        setTimeout(() => this.handleEndWeek(), 500);
    },

    // ═══════════════════════════════════════════════
    // MAP LIST VIEW (Mobile Alternative)
    // ═══════════════════════════════════════════════
    toggleMapView() {
        this.mapViewMode = this.mapViewMode === 'map' ? 'list' : 'map';
        this.renderTabContent();
    },

    renderMapListView(container) {
        const gs = window.GameEngine.state;
        const states = window.StateData
            .filter(s => s.isBattleground)
            .sort((a, b) => {
                const pa = gs.statePolling[a.id], pb = gs.statePolling[b.id];
                return Math.abs(pa.player - pa.opponent) - Math.abs(pb.player - pb.opponent);
            });

        container.innerHTML = `
            <div class="flex justify-between items-center mb-1">
                <h3 style="font-size:1rem;">Battleground States</h3>
                <button class="btn btn-sm btn-ghost" onclick="GameUI.toggleMapView()">🗺️ Map View</button>
            </div>
            ${states.map(st => {
                const poll = gs.statePolling[st.id];
                if (!poll) return '';
                const margin = (poll.player - poll.opponent).toFixed(1);
                const pct = Math.round(poll.player);
                const opct = Math.round(poll.opponent);
                const trendIcon = poll.trend > 0.5 ? '▲' : poll.trend < -0.5 ? '▼' : '';
                const trendClass = poll.trend > 0.5 ? 'text-green' : poll.trend < -0.5 ? 'text-red' : '';
                return `
                    <div class="poll-card" onclick="GameUI.handleStateClick('${st.id}')" style="cursor:pointer;">
                        <div class="poll-card-header">
                            <span class="poll-card-state">${st.name} <span class="${trendClass}">${trendIcon}</span></span>
                            <span class="poll-card-ev">${st.electoralVotes} EV</span>
                        </div>
                        <div class="poll-mini-bar">
                            <div class="poll-mini-dem" style="width:${pct / (pct + opct) * 100}%"></div>
                            <div class="poll-mini-rep" style="width:${opct / (pct + opct) * 100}%"></div>
                        </div>
                        <div class="poll-card-numbers">
                            <span class="text-dem">${pct}%</span>
                            <span style="color:${margin > 0 ? 'var(--accent-green)' : 'var(--accent-red)'};font-weight:700;">${margin > 0 ? '+' : ''}${margin}</span>
                            <span class="text-rep">${opct}%</span>
                        </div>
                    </div>`;
            }).join('')}
            <div id="state-detail-area"></div>`;
    },

    // ═══════════════════════════════════════════════
    // DEBATE SCREEN
    // ═══════════════════════════════════════════════
    startDebate() {
        this.debateQuestions = window.EventSystem.DebateSystem.generateDebateQuestions(5);
        this.currentDebateQuestion = 0;
        this.debateResponses = [];
        this.debateScores = { viral: 0, donors: 0, press: 0, authenticity: 0, policy: 0, base: 0, suburban: 0 };
        this.showScreen('debate');
        this.renderDebateQuestion();
    },

    renderDebateQuestion() {
        const stage = document.getElementById('debate-stage');
        const q = this.debateQuestions[this.currentDebateQuestion];
        const gs = window.GameEngine.state;
        const qNum = this.currentDebateQuestion + 1;
        const totalQ = this.debateQuestions.length;

        stage.innerHTML = `
            <h2>PRESIDENTIAL DEBATE</h2>
            <p class="text-muted">${gs.playerCandidate.name} vs ${gs.opponentCandidate.name}</p>
            <div class="debate-question-box">
                <div class="debate-question-label">QUESTION ${qNum} OF ${totalQ} — ${q.topic.toUpperCase()}</div>
                <div class="debate-question-text">"${q.question}"</div>
            </div>
            <div class="debate-responses">
                ${q.responses.map((r, i) => `
                    <button class="debate-response" onclick="GameUI.handleDebateResponse(${i})">
                        ${r.text}
                        <span class="choice-risk risk-${r.riskLevel}" style="display:inline-block;margin-top:4px;">${r.riskLevel}</span>
                    </button>
                `).join('')}
            </div>
            <div class="debate-scoreboard">
                <div class="debate-score-item"><div class="score-val">${this.debateScores.viral}</div><div class="score-label">Viral</div></div>
                <div class="debate-score-item"><div class="score-val">${this.debateScores.press}</div><div class="score-label">Press</div></div>
                <div class="debate-score-item"><div class="score-val">${this.debateScores.base}</div><div class="score-label">Base</div></div>
                <div class="debate-score-item"><div class="score-val">${this.debateScores.suburban}</div><div class="score-label">Suburban</div></div>
                <div class="debate-score-item"><div class="score-val">${this.debateScores.donors}</div><div class="score-label">Donors</div></div>
            </div>`;
    },

    handleDebateResponse(responseIdx) {
        const q = this.debateQuestions[this.currentDebateQuestion];
        const response = q.responses[responseIdx];
        this.debateResponses.push(response);

        // Accumulate scores
        for (const [key, val] of Object.entries(response.effects)) {
            if (this.debateScores.hasOwnProperty(key)) {
                this.debateScores[key] += val;
            }
        }

        this.currentDebateQuestion++;
        if (this.currentDebateQuestion >= this.debateQuestions.length) {
            this.showDebateResults();
        } else {
            this.renderDebateQuestion();
        }
    },

    showDebateResults() {
        const result = window.GameEngine.processDebateResults(this.debateScores);
        const stage = document.getElementById('debate-stage');
        const gs = window.GameEngine.state;

        stage.innerHTML = `
            <h2>DEBATE RESULTS</h2>
            <p class="text-muted" style="margin-bottom:2rem;">${result.assessment}</p>
            <div class="debate-scoreboard" style="margin-bottom:2rem;">
                <div class="debate-score-item"><div class="score-val" style="color:var(--accent-blue)">${this.debateScores.viral}</div><div class="score-label">Viral Moments</div></div>
                <div class="debate-score-item"><div class="score-val" style="color:var(--accent-green)">${this.debateScores.press}</div><div class="score-label">Press Score</div></div>
                <div class="debate-score-item"><div class="score-val" style="color:var(--accent-purple)">${this.debateScores.base}</div><div class="score-label">Base Energy</div></div>
                <div class="debate-score-item"><div class="score-val" style="color:var(--accent-orange)">${this.debateScores.suburban}</div><div class="score-label">Suburban Appeal</div></div>
                <div class="debate-score-item"><div class="score-val" style="color:var(--accent-yellow)">${this.debateScores.donors}</div><div class="score-label">Donor Reaction</div></div>
            </div>
            <div class="week-summary" style="max-width:500px;margin:0 auto;text-align:left;">
                <h3>Post-Debate Analysis</h3>
                <div class="week-summary-stats">
                    <div class="ws-stat"><span>Total Score</span><span class="ws-change ${result.totalScore > 15 ? 'positive' : 'negative'}">${result.totalScore}</span></div>
                    <div class="ws-stat"><span>Assessment</span><span>${result.assessment}</span></div>
                    <div class="ws-stat"><span>Debates Done</span><span>${gs.debatesCompleted}</span></div>
                </div>
            </div>
            <button class="btn btn-primary btn-lg mt-2" onclick="GameUI.returnFromDebate()">RETURN TO CAMPAIGN</button>`;
    },

    returnFromDebate() {
        this.showScreen('game');
        this.renderGameScreen();
    },

    // ═══════════════════════════════════════════════
    // ELECTION NIGHT
    // ═══════════════════════════════════════════════
    startElectionNight() {
        this.showScreen('election-night');
        const nightData = window.GameEngine.generateElectionNight();
        this.animateElectionNight(nightData);
    },

    animateElectionNight(nightData) {
        const container = document.getElementById('election-night-content');
        const results = nightData.results;
        const callOrder = nightData.callOrder;

        container.innerHTML = `
            <h1>ELECTION NIGHT 2028</h1>
            <p class="en-subtitle">${results.playerName} vs ${results.opponentName}</p>
            <div class="ec-counter" style="position:relative;justify-content:center;margin:2rem auto;background:rgba(0,0,0,0.4);display:inline-flex;padding:16px 40px;border-radius:var(--radius-lg);">
                <div class="ec-count dem">
                    <div class="ec-num" id="en-player-ev">0</div>
                    <div class="ec-label">${results.playerName}</div>
                </div>
                <div class="ec-count" style="padding:0 30px;">
                    <div class="ec-num" style="font-size:1rem;color:var(--text-muted);">270 to win</div>
                </div>
                <div class="ec-count rep">
                    <div class="ec-num" id="en-opp-ev">0</div>
                    <div class="ec-label">${results.opponentName}</div>
                </div>
            </div>
            <div id="en-state-calls" style="margin:2rem auto;max-width:800px;"></div>
            <div id="en-winner-banner"></div>`;

        // Animate state calls
        let playerEVSoFar = 0;
        let oppEVSoFar = 0;
        const callsContainer = document.getElementById('en-state-calls');

        callOrder.forEach((call, i) => {
            setTimeout(() => {
                const isPlayer = call.winner === 'player';
                if (isPlayer) playerEVSoFar += call.ev;
                else oppEVSoFar += call.ev;

                const callEl = document.createElement('span');
                callEl.className = `state-call ${isPlayer ? 'dem-call' : 'rep-call'}`;
                callEl.innerHTML = `${call.stateName} <strong>${call.ev}</strong>`;
                callsContainer.appendChild(callEl);

                document.getElementById('en-player-ev').textContent = playerEVSoFar;
                document.getElementById('en-opp-ev').textContent = oppEVSoFar;

                // Check if we have a winner
                if (i === callOrder.length - 1) {
                    setTimeout(() => {
                        this.showWinner(results);
                    }, 1500);
                }
            }, i * 200 + 500);
        });
    },

    showWinner(results) {
        const banner = document.getElementById('en-winner-banner');
        const isPlayerWin = results.winner === 'player';
        const winnerName = isPlayerWin ? results.playerName : results.opponentName;
        const winnerEV = isPlayerWin ? results.playerEV : results.opponentEV;
        const winClass = isPlayerWin ? 'dem-winner' : 'rep-winner';

        banner.innerHTML = `
            <div class="winner-banner ${winClass}">
                <h2>${isPlayerWin ? '🎉 VICTORY!' : '😞 DEFEAT'}</h2>
                <p style="font-size:1.3rem;margin-bottom:0.5rem;">${winnerName} wins the presidency with ${winnerEV} electoral votes!</p>
                <p class="text-muted">Popular vote: ${results.playerName} ${Math.round(results.nationalPopularVote.player)}% — ${results.opponentName} ${Math.round(results.nationalPopularVote.opponent)}%</p>
                <div class="mt-2 btn-group" style="justify-content:center;">
                    <button class="btn btn-primary btn-lg" onclick="GameUI.startNewGame()">PLAY AGAIN</button>
                    <button class="btn btn-lg" onclick="GameUI.showScreen('title')">MAIN MENU</button>
                </div>
            </div>`;

        // Update ticker
        this.updateTicker([
            `BREAKING: ${winnerName.toUpperCase()} ELECTED 46TH PRESIDENT OF THE UNITED STATES`,
            `${winnerEV} ELECTORAL VOTES — ${winnerName.toUpperCase()} CLAIMS VICTORY`,
            `THE 2028 PRESIDENTIAL RACE IS OVER — ${winnerName.toUpperCase()} WINS`
        ]);
    },

    // ═══════════════════════════════════════════════
    // BREAKING NEWS TICKER
    // ═══════════════════════════════════════════════
    updateTicker(headlines) {
        const ticker = document.getElementById('ticker-content');
        if (!ticker) return;
        const allHeadlines = [...headlines, ...window.EventSystem.BreakingNewsTicker.headlines.slice(0, 2)];
        ticker.innerHTML = window.EventSystem.BreakingNewsTicker.getTickerHTML(allHeadlines);
    },

    // ═══════════════════════════════════════════════
    // TOASTS
    // ═══════════════════════════════════════════════
    showToast(message, type) {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast toast-${type || 'info'}`;
        toast.textContent = message;
        container.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(20px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    },

    // ═══════════════════════════════════════════════
    // HOW TO PLAY / CREDITS
    // ═══════════════════════════════════════════════
    showHowToPlay() {
        this.showModal('How To Play', `
            <div style="font-size:0.9rem;line-height:1.7;color:var(--text-secondary);">
                <h4 style="color:var(--text-primary);margin-bottom:8px;">Welcome to Election 2028</h4>
                <p>You are running for President of the United States. Every week, you'll make strategic decisions that shape the race.</p>
                <h4 style="color:var(--text-primary);margin:16px 0 8px;">Core Loop</h4>
                <ul style="padding-left:20px;">
                    <li><strong>Visit states</strong> to boost your polling in key battlegrounds</li>
                    <li><strong>Run ads</strong> — choose TV or digital, positive or negative</li>
                    <li><strong>Hold events</strong> — rallies fire up the base, town halls win persuadables</li>
                    <li><strong>Raise money</strong> — you need cash for everything</li>
                    <li><strong>Build coalitions</strong> — labor, youth, suburban, and more</li>
                    <li><strong>Respond to events</strong> — scandals, crises, and media firestorms</li>
                    <li><strong>Win debates</strong> — viral moments can shift the entire race</li>
                </ul>
                <h4 style="color:var(--text-primary);margin:16px 0 8px;">Winning</h4>
                <p>Win <strong>270 electoral votes</strong> on Election Night. Focus on battleground states: PA, MI, WI, GA, AZ, NV, NC.</p>
                <h4 style="color:var(--text-primary);margin:16px 0 8px;">Tips</h4>
                <ul style="padding-left:20px;">
                    <li>Money matters — don't go broke</li>
                    <li>Scandal vulnerability can spiral — stay disciplined</li>
                    <li>The opponent is AI-controlled and will fight back</li>
                    <li>Momentum is king in the final weeks</li>
                    <li>Going negative hurts your opponent but makes you vulnerable</li>
                </ul>
            </div>`);
    },

    showCredits() {
        this.showModal('Credits', `
            <div style="text-align:center;color:var(--text-secondary);">
                <h3 style="color:var(--text-primary);">Election 2028</h3>
                <p>A Political Strategy Game</p>
                <p style="margin-top:16px;font-size:0.85rem;">All candidate information based on publicly documented reporting as of March 2026.</p>
                <p style="font-size:0.85rem;">Scandals and controversies are labeled as opposition attack lines, reported criticisms, or campaign liabilities.</p>
                <p style="margin-top:16px;font-size:0.8rem;color:var(--text-muted);">This is a work of political fiction and strategy gaming.<br>No endorsement of any candidate or party is intended.</p>
            </div>`);
    },

    showCandidateDossier(candidateId) {
        const allCandidates = [...window.CandidateData.democrats, ...window.CandidateData.republicans];
        const c = allCandidates.find(x => x.id === candidateId);
        if (!c) return;
        const barClass = c.party === 'Democrat' ? 'dem' : 'rep';
        this.showModal(`${c.name} — Dossier`, `
            <div style="font-size:0.9rem;">
                <div style="text-align:center;margin-bottom:16px;">
                    <div style="font-size:3rem;">${c.portraitEmoji}</div>
                    <div style="font-weight:700;font-size:1.2rem;">${c.name}</div>
                    <div class="text-muted">${c.title} | Age ${c.age} | ${c.homeState}</div>
                    <div style="font-style:italic;margin-top:4px;">"${c.slogan}"</div>
                </div>
                <p style="margin-bottom:12px;color:var(--text-secondary);">${c.bio}</p>
                <h4 style="margin-bottom:8px;">Stats</h4>
                ${this.createStatBar('Charisma', c.charisma, barClass)}
                ${this.createStatBar('Debate', c.debate, barClass)}
                ${this.createStatBar('Fundraising', c.fundraising, barClass)}
                ${this.createStatBar('Discipline', c.discipline, barClass)}
                ${this.createStatBar('Media', c.mediaHandling, barClass)}
                ${this.createStatBar('Base Energy', c.baseEnthusiasm, barClass)}
                ${this.createStatBar('Crossover', c.crossoverAppeal, barClass)}
                ${this.createStatBar('Scandal Armor', c.scandalResistance, barClass)}
                <h4 style="margin:12px 0 8px;">Strengths</h4>
                <ul style="padding-left:20px;color:var(--accent-green);font-size:0.85rem;">${(c.strengths || []).map(s => `<li>${s}</li>`).join('')}</ul>
                <h4 style="margin:12px 0 8px;">Vulnerabilities</h4>
                <ul style="padding-left:20px;color:var(--accent-red);font-size:0.85rem;">${(c.vulnerabilities || []).map(v => `<li>${v}</li>`).join('')}</ul>
            </div>`);
    },

    // ═══════════════════════════════════════════════
    // UTILITY
    // ═══════════════════════════════════════════════
    formatMoney(amount) {
        const n = Number(amount);
        if (n >= 1000000000) return (n / 1000000000).toFixed(1) + 'B';
        if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n / 1000).toFixed(0) + 'K';
        return n.toString();
    },

    formatPercent(value) {
        return Math.round(value * 10) / 10 + '%';
    },
};
