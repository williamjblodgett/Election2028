/**
 * Election 2028 — UI Controller
 * Manages all screens, user interactions, map, and game flow
 */

window.GameUI = {
    currentScreen: 'title',
    selectedDemocrat: null,
    selectedRepublican: null,
    selectedVP: null,
    playerParty: null,
    selectedDifficulty: 'realistic',
    selectedMode: 'campaign',
    setupStep: 1,
    pendingActions: {},
    pendingEventChoices: {},
    // Point allocation system
    campaignPerks: { warChest: 0, groundSwell: 0, mediaDarling: 0, partyMachine: 0, digitalArmy: 0, teflonCandidate: 0 },
    totalPerkPoints: 8,
    weeklyEvents: [],
    selectedStates: [],
    currentStrategy: 'positive',
    activeTab: 'map',
    mobileActiveTab: 'map',
    isMobile: false,
    mapViewMode: 'map', // 'map' or 'list'
    // Event listener tracking (prevents memory leaks)
    _eventListeners: {},
    _initialized: false,

    // ═══════════════════════════════════════════════
    // INITIALIZATION
    // ═══════════════════════════════════════════════
    init() {
        // Only initialize once - prevents duplicate event listeners
        if (this._initialized) return;
        this._initialized = true;

        this.checkMobile();
        this.checkSavedGame();
        this.renderTitleScreen();
        this.showScreen('title');
        this.initTicker();

        // Create stored handlers to allow proper cleanup
        this._eventListeners.handleResize = () => {
            this.checkMobile();
            if (this.currentScreen === 'game') this.updateMobileNav();
        };
        this._eventListeners.handleOrientation = () => {
            setTimeout(() => {
                this.checkMobile();
                if (this.currentScreen === 'game') this.renderGameScreen();
            }, 150);
        };

        // Add listeners with proper handler references
        window.addEventListener('resize', this._eventListeners.handleResize);
        window.addEventListener('orientationchange', this._eventListeners.handleOrientation);
    },

    // Clean event listeners on app teardown
    cleanup() {
        if (this._eventListeners.handleResize) {
            window.removeEventListener('resize', this._eventListeners.handleResize);
        }
        if (this._eventListeners.handleOrientation) {
            window.removeEventListener('orientationchange', this._eventListeners.handleOrientation);
        }
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
        this.selectedVP = null;
        this.playerParty = null;
        this.selectedDifficulty = 'realistic';
        this.selectedMode = 'campaign';
        this.campaignPerks = { warChest: 0, groundSwell: 0, mediaDarling: 0, partyMachine: 0, digitalArmy: 0, teflonCandidate: 0 };
        this.setupPlatform = null;
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
        const progress = document.getElementById('setup-progress');
        const backBtn = document.getElementById('setup-back-btn');
        const nextBtn = document.getElementById('setup-next-btn');
        const totalSteps = this.getSetupFlowSteps().length;
        let stageContent = '';

        backBtn.style.visibility = this.setupStep > 1 ? 'visible' : 'hidden';
        nextBtn.textContent = 'NEXT';

        if (progress) {
            progress.innerHTML = this.renderSetupProgress();
        }

        switch (this.setupStep) {
            case 1: // Game Mode
                title.textContent = 'Choose Your Mode';
                subtitle.textContent = 'Define the shape of the race before the first ad goes up.';
                stageContent = `
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
                subtitle.textContent = 'Lock in the coalition you want to build.';
                stageContent = `
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
                subtitle.textContent = 'Compare strengths, liabilities, and coalition fit.';
                const candidates = this.playerParty === 'democrat' ? window.CandidateData.democrats : window.CandidateData.republicans;
                const selected = this.playerParty === 'democrat' ? this.selectedDemocrat : this.selectedRepublican;
                stageContent = `<div class="candidate-grid">${candidates.map(c => this.renderCandidateCard(c, selected)).join('')}</div>`;
                break;

            case 4: // Opponent Selection
                title.textContent = `Choose Your ${this.playerParty === 'democrat' ? 'Republican' : 'Democratic'} Opponent`;
                subtitle.textContent = 'Set the matchup and shape the general-election battlefield.';
                const oppCandidates = this.playerParty === 'democrat' ? window.CandidateData.republicans : window.CandidateData.democrats;
                const oppSelected = this.playerParty === 'democrat' ? this.selectedRepublican : this.selectedDemocrat;
                stageContent = `<div class="candidate-grid">${oppCandidates.map(c => this.renderCandidateCard(c, oppSelected, true)).join('')}</div>`;
                break;

            case 5: // VP Selection
                title.textContent = 'Build Your Ticket';
                subtitle.textContent = 'Choose the running mate who bends the map in your favor.';
                const nominee = this.getPlayerCandidateSelection();
                const vpOptions = window.VPData.getOptionsForCandidate(nominee);
                stageContent = `
                    <div class="ticket-builder">
                        ${this.renderTicketPreview(nominee, this.selectedVP)}
                        <div class="vp-section-header">
                            <div>
                                <h3>Curated Shortlist</h3>
                                <p class="text-muted">Five vetted choices built for ${nominee.name.split(' ')[0]}'s campaign.</p>
                            </div>
                            <div class="ticket-builder-note">Your VP changes polling, fundraising pressure, and event risk from day one.</div>
                        </div>
                        <div class="candidate-grid vp-grid">
                            ${vpOptions.curated.map((option) => this.renderVPCard(option, this.selectedVP)).join('')}
                        </div>
                        <div class="vp-section-header vp-section-header-secondary">
                            <div>
                                <h3>Wildcard Bench</h3>
                                <p class="text-muted">The people you did not pick at the top of the ticket are still available here.</p>
                            </div>
                        </div>
                        <div class="candidate-grid vp-grid">
                            ${vpOptions.wildcard.map((option) => this.renderVPCard(option, this.selectedVP)).join('')}
                        </div>
                    </div>`;
                break;

            case 6: // Difficulty
                title.textContent = 'Choose Difficulty';
                subtitle.textContent = 'Decide how punishing the campaign environment will be.';
                stageContent = `
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

            case 7: // Campaign Perks (point allocation)
                title.textContent = 'Campaign Advantages';
                subtitle.textContent = 'Allocate early advantages before the first week begins.';
                nextBtn.textContent = 'NEXT';
                const perks = this.campaignPerks;
                const usedPoints = Object.values(perks).reduce((a, b) => a + b, 0);
                const remaining = this.totalPerkPoints - usedPoints;

                const perkData = [
                    { key: 'warChest', icon: '💵', name: 'War Chest', flavor: 'Big donors lined up early', desc: '+$1.5M starting cash per point', val: perks.warChest },
                    { key: 'groundSwell', icon: '📈', name: 'Ground Swell', flavor: 'A viral moment sparked a movement', desc: '+5 enthusiasm & +3 turnout per point', val: perks.groundSwell },
                    { key: 'mediaDarling', icon: '📺', name: 'Media Darling', flavor: "The press can't stop covering you", desc: '+8 media score per point', val: perks.mediaDarling },
                    { key: 'partyMachine', icon: '🏛️', name: 'Party Machine', flavor: 'The establishment is behind you', desc: '+5 ground game & +5 surrogates per point', val: perks.partyMachine },
                    { key: 'digitalArmy', icon: '📱', name: 'Digital Army', flavor: 'Your memes are winning the internet', desc: '+8 online influence per point', val: perks.digitalArmy },
                    { key: 'teflonCandidate', icon: '🛡️', name: 'Teflon Candidate', flavor: 'Opposition research came up empty', desc: '-10 scandal vulnerability per point', val: perks.teflonCandidate },
                ];

                stageContent = `
                    <div class="perk-allocation">
                        <div class="perk-points-header">
                            <div class="perk-points-remaining">
                                <span class="perk-points-num">${remaining}</span>
                                <span class="perk-points-label">Points Remaining</span>
                            </div>
                            <div class="perk-points-dots">
                                ${Array(this.totalPerkPoints).fill(0).map((_, i) => `<div class="perk-dot ${i < usedPoints ? 'used' : 'available'}"></div>`).join('')}
                            </div>
                        </div>
                        <div class="perk-grid">
                            ${perkData.map(p => `
                                <div class="perk-card ${p.val > 0 ? 'perk-active' : ''}">
                                    <div class="perk-card-top">
                                        <div class="perk-icon">${p.icon}</div>
                                        <div class="perk-info">
                                            <div class="perk-name">${p.name}</div>
                                            <div class="perk-flavor">"${p.flavor}"</div>
                                        </div>
                                    </div>
                                    <div class="perk-desc">${p.desc}</div>
                                    <div class="perk-controls">
                                        <button class="perk-btn" onclick="GameUI.adjustPerk('${p.key}', -1)" ${p.val <= 0 ? 'disabled' : ''}>−</button>
                                        <div class="perk-pips">
                                            ${[1,2,3].map(i => `<div class="perk-pip ${i <= p.val ? 'filled' : ''}"></div>`).join('')}
                                        </div>
                                        <button class="perk-btn" onclick="GameUI.adjustPerk('${p.key}', 1)" ${p.val >= 3 || remaining <= 0 ? 'disabled' : ''}>+</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>`;
                break;

            case 8: { // Policy Platform
                title.textContent = 'Set Your Platform';
                subtitle.textContent = 'Where do you stand? States that share your priorities will drift your way.';
                nextBtn.textContent = 'START CAMPAIGN';
                const platNominee = this.getPlayerCandidateSelection();
                if (!this.setupPlatform) this.setupPlatform = window.GameEngine.seedPlatform(platNominee);
                stageContent = `
                    <div class="platform-grid">
                        ${window.GameConstants.ISSUES.map(issue => this.renderPlatformRow(issue, this.setupPlatform[issue.key], 'GameUI.setSetupStance')).join('')}
                    </div>`;
                break;
            }
        }

        content.innerHTML = `
            <div class="setup-stage-card">
                <div class="setup-stage-header">
                    <div class="setup-step-badge">Step ${this.setupStep} of ${totalSteps}</div>
                    <div class="setup-step-copy">${this.getSetupStepSupportCopy()}</div>
                </div>
                ${stageContent}
            </div>`;
    },

    renderPlatformRow(issue, stance, handler) {
        const stops = [-2, -1, 0, 1, 2];
        return `
            <div class="platform-row">
                <div class="platform-row-head">
                    <span class="platform-issue-label">${issue.label}</span>
                </div>
                <div class="platform-poles">
                    <span>${issue.left}</span>
                    <span>${issue.right}</span>
                </div>
                <div class="platform-stops">
                    ${stops.map(v => `
                        <button class="platform-stop ${stance === v ? 'selected' : ''}" onclick="${handler}('${issue.key}', ${v})">
                            ${v === 0 ? '◈' : ''}
                        </button>`).join('')}
                </div>
            </div>`;
    },

    setSetupStance(issueKey, value) {
        if (!this.setupPlatform) return;
        this.setupPlatform[issueKey] = value;
        this.renderSetupStep();
    },

    getSetupFlowSteps() {
        return [
            { id: 1, label: 'Mode', icon: '🎯' },
            { id: 2, label: 'Party', icon: '🏳️' },
            { id: 3, label: 'Nominee', icon: '🧑' },
            { id: 4, label: 'Opponent', icon: '🛡️' },
            { id: 5, label: 'VP', icon: '⭐' },
            { id: 6, label: 'Difficulty', icon: '⚙️' },
            { id: 7, label: 'Perks', icon: '🚀' },
            { id: 8, label: 'Platform', icon: '🧭' },
        ];
    },

    renderSetupProgress() {
        const steps = this.getSetupFlowSteps();
        const completion = ((this.setupStep - 1) / (steps.length - 1)) * 100;

        return `
            <div class="setup-progress-shell">
                <div class="setup-progress-line">
                    <div class="setup-progress-line-fill" style="width:${completion}%"></div>
                </div>
                <div class="setup-progress-steps">
                    ${steps.map((step, index) => {
                        const isComplete = step.id < this.setupStep;
                        const isCurrent = step.id === this.setupStep;
                        return `
                            <div class="setup-progress-step ${isCurrent ? 'current' : ''} ${isComplete ? 'complete' : ''}">
                                <div class="setup-progress-node">${step.icon}</div>
                                <div class="setup-progress-label">${step.label}</div>
                            </div>`;
                    }).join('')}
                </div>
            </div>`;
    },

    getSetupStepSupportCopy() {
        const copy = {
            1: 'Campaign mode changes who you control and how chaotic the race becomes.',
            2: 'Party choice determines your bench, coalition targets, and map baseline.',
            3: 'Candidate stats feed directly into enthusiasm, debates, media handling, and fundraising.',
            4: 'Opponent choice sets the strategic challenge for the entire general-election run.',
            5: 'Running mates affect both campaign attributes and state-level advantages.',
            6: 'Difficulty adjusts fundraising pressure, volatility, and forgiveness.',
            7: 'Early advantages trade flexibility for a sharper opening position.',
            8: 'Your platform decides which states reward you — and the base is watching. You can shift later, but flip-flops cost credibility.',
        };

        return copy[this.setupStep] || '';
    },

    selectMode(mode) {
        this.selectedMode = mode;
        this.renderSetupStep();
    },
    getPlayerCandidateSelection() {
        return this.playerParty === 'democrat' ? this.selectedDemocrat : this.selectedRepublican;
    },
    getOpponentCandidateSelection() {
        return this.playerParty === 'democrat' ? this.selectedRepublican : this.selectedDemocrat;
    },
    selectParty(party) {
        this.playerParty = party;
        this.selectedVP = null;
        this.renderSetupStep();
    },
    selectDifficulty(diff) {
        this.selectedDifficulty = diff;
        this.renderSetupStep();
    },

    renderTicketPreview(nominee, vp) {
        return `
            <div class="ticket-preview ${nominee.party === 'Democrat' ? 'ticket-preview-dem' : 'ticket-preview-rep'}">
                <div>
                    <div class="ticket-preview-label">Top Of Ticket</div>
                    <div class="ticket-preview-name">${nominee.name}</div>
                    <div class="ticket-preview-meta">${nominee.title} • ${nominee.homeState}</div>
                </div>
                <div class="ticket-preview-divider">+</div>
                <div>
                    <div class="ticket-preview-label">Running Mate</div>
                    <div class="ticket-preview-name">${vp ? vp.name : 'Select a VP'}</div>
                    <div class="ticket-preview-meta">${vp ? `${vp.title} • ${vp.homeState}` : 'Five curated options and a wildcard bench below.'}</div>
                </div>
            </div>`;
    },

    formatVPEffects(effects) {
        const labels = {
            approval: 'Approval',
            enthusiasm: 'Enthusiasm',
            baseTurnout: 'Turnout',
            persuadableSupport: 'Persuadables',
            mediaScore: 'Media',
            scandalVulnerability: 'Scandal Risk',
            debateSkill: 'Debate',
            groundGame: 'Ground Game',
            donorConfidence: 'Donors',
            onlineInfluence: 'Digital',
            surrogateStrength: 'Surrogates',
        };
        return Object.entries(effects || {}).map(([key, value]) => {
            const sign = value > 0 ? '+' : '';
            return `${sign}${value} ${labels[key] || key}`;
        }).join(' • ');
    },

    renderVPCard(option, selectedVP) {
        const isSelected = selectedVP && selectedVP.id === option.id;
        const partyClass = this.playerParty === 'democrat' ? 'selected-dem' : 'selected-rep';
        const tag = option.source === 'wildcard' ? (option.wildcardLabel || 'WILDCARD') : 'SHORTLIST';
        const swingTargets = (option.regionalTargets || []).length ? option.regionalTargets.join(', ') : 'National validator';
        return `
            <div class="candidate-card vp-card ${isSelected ? `selected ${partyClass}` : ''}" onclick="GameUI.selectVPOption('${option.id}')">
                <div class="wildcard-badge">${tag}</div>
                <div class="candidate-portrait">${option.portraitEmoji || '🗳️'}</div>
                <div class="candidate-name">${option.name}</div>
                <div class="candidate-title">${option.title} | ${option.homeState}</div>
                <div class="vp-card-copy">${option.description}</div>
                <div class="vp-card-effects">${this.formatVPEffects(option.effects)}</div>
                <div class="vp-card-targets">Map focus: ${swingTargets}</div>
            </div>`;
    },

    selectVPOption(optionId) {
        const nominee = this.getPlayerCandidateSelection();
        if (!nominee) return;
        const options = window.VPData.getOptionsForCandidate(nominee);
        const selected = [...options.curated, ...options.wildcard].find((option) => option.id === optionId);
        if (!selected) return;
        this.selectedVP = selected;
        this.renderSetupStep();
    },

    adjustPerk(key, delta) {
        const current = this.campaignPerks[key] || 0;
        const newVal = current + delta;
        if (newVal < 0 || newVal > 3) return;
        const usedPoints = Object.values(this.campaignPerks).reduce((a, b) => a + b, 0);
        if (delta > 0 && usedPoints >= this.totalPerkPoints) return;
        this.campaignPerks[key] = newVal;
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
            this.selectedVP = null;
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

        if (this.setupStep === 5 && !this.selectedVP) {
            this.showToast('Please choose a running mate', 'warning');
            return;
        }

        if (this.setupStep >= 8) {
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
        const playerCand = this.getPlayerCandidateSelection();
        const oppCand = this.getOpponentCandidateSelection();
        const playerVP = this.selectedVP;
        const opponentVP = window.VPData.chooseRunningMate(oppCand);

        window.GameEngine.initGame(playerCand, oppCand, this.selectedMode, this.selectedDifficulty);
        window.GameEngine.assignRunningMates(playerVP, opponentVP);
        if (this.setupPlatform) window.GameEngine.state.platform = { ...this.setupPlatform };

        // Apply campaign perk bonuses
        const perks = this.campaignPerks;
        const c = window.GameEngine.state.campaign;
        const f = window.GameEngine.state.finances;

        if (perks.warChest > 0) {
            const bonus = perks.warChest * 1500000;
            f.cashOnHand += bonus;
            f.totalRaised += bonus;
            c.cash = f.cashOnHand;
        }
        if (perks.groundSwell > 0) {
            c.enthusiasm += perks.groundSwell * 5;
            c.baseTurnout += perks.groundSwell * 3;
        }
        if (perks.mediaDarling > 0) {
            c.mediaScore += perks.mediaDarling * 8;
        }
        if (perks.partyMachine > 0) {
            c.groundGame += perks.partyMachine * 5;
            c.surrogateStrength += perks.partyMachine * 5;
        }
        if (perks.digitalArmy > 0) {
            c.onlineInfluence += perks.digitalArmy * 8;
        }
        if (perks.teflonCandidate > 0) {
            c.scandalVulnerability = Math.max(0, c.scandalVulnerability - perks.teflonCandidate * 10);
        }

        this.showScreen('game');
        this.renderGameScreen();
        this.showToast(`Campaign launched! ${playerCand.name} / ${playerVP ? playerVP.name : 'TBD'} is on the ballot.`, 'success');
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

        const pColor = this.getPlayerColorVar();
        const oColor = this.getOpponentColorVar();
        const playerTicketLabel = gs.playerTicket && gs.playerTicket.vp ? `${gs.playerCandidate.name} / ${gs.playerTicket.vp.name}` : gs.playerCandidate.name;
        const opponentTicketLabel = gs.opponentTicket && gs.opponentTicket.vp ? `${gs.opponentCandidate.name} / ${gs.opponentTicket.vp.name}` : gs.opponentCandidate.name;
        topBar.innerHTML = `
            <div class="top-bar-left">
                <div class="topbar-brand-block">
                    <div class="topbar-brand">E<span>28</span></div>
                    <div class="topbar-week">${weekLabel}</div>
                </div>
                <span class="phase-badge ${gs.phase === 'primary' ? 'phase-primary' : 'phase-general'}">${gs.phase}</span>
                <div class="ticket-strip ticket-strip-stack">
                    <span class="ticket-chip ${this.getPlayerColorClass()}">${playerTicketLabel}</span>
                    <span class="ticket-chip ${this.getOpponentColorClass()}">${opponentTicketLabel}</span>
                </div>
            </div>
            <div class="top-bar-center">
                <div class="polling-pill polling-pill-large">
                    <span class="topbar-kicker">National</span>
                    <span style="color:${pColor}">You ${Math.round(gs.campaign.nationalPolling)}%</span>
                    <span class="text-muted">vs</span>
                    <span style="color:${oColor}">Opp ${Math.round(gs.opponent.nationalPolling)}%</span>
                </div>
                ${gs.phase === 'primary' && gs.primary ? `
                <div class="polling-pill">
                    <span class="topbar-kicker">Delegates</span>
                    <span style="color:${pColor}">${gs.primary.playerDelegates}</span>
                    <span class="text-muted">/ ${window.GameConstants.PRIMARY.DELEGATES_TO_CLINCH}</span>
                </div>` : `
                <div class="polling-pill">
                    <span class="topbar-kicker">EV</span>
                    <span style="color:${pColor}">${map.playerEV}</span>
                    <span class="text-muted">to</span>
                    <span style="color:${oColor}">${map.opponentEV}</span>
                </div>`}
                <div class="polling-pill">
                    <span class="topbar-kicker">Risk</span>
                    <span>${Math.round(gs.campaign.scandalVulnerability)}/100</span>
                </div>
                ${window.GameEngine.getAngerLevel() === 'SEVERE' || window.GameEngine.getAngerLevel() === 'HIGH' ? `
                <div class="polling-pill threat-pill ${window.GameEngine.getAngerLevel() === 'SEVERE' ? 'threat-severe' : ''}">
                    <span class="topbar-kicker">Threat</span>
                    <span>🔥 ${window.GameEngine.getAngerLevel()}</span>
                </div>` : ''}
                ${gs.hospitalized > 0 ? `
                <div class="polling-pill hospital-pill">
                    <span class="topbar-kicker">Recovery</span>
                    <span>✚ ${gs.hospitalized}w</span>
                </div>` : ''}
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
                    <span class="action-copy"><span class="action-label">Visit State</span><span class="action-desc">Move the race in the closest battlegrounds.</span></span>
                    <span class="action-cost">$80K</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('rally')">
                    <span class="action-icon">📢</span>
                    <span class="action-copy"><span class="action-label">Hold Rally</span><span class="action-desc">Raise enthusiasm and dominate the local news cycle.</span></span>
                    <span class="action-cost">$60K</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('townhall')">
                    <span class="action-icon">🏛️</span>
                    <span class="action-copy"><span class="action-label">Town Hall</span><span class="action-desc">Win persuadable voters with a lower-cost stop.</span></span>
                    <span class="action-cost">$30K</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('podcast')">
                    <span class="action-icon">🎙️</span>
                    <span class="action-copy"><span class="action-label">Podcast Tour</span><span class="action-desc">Cheap reach for online influence and authenticity.</span></span>
                    <span class="action-cost">$5K</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('interview')">
                    <span class="action-icon">📺</span>
                    <span class="action-copy"><span class="action-label">TV Interview</span><span class="action-desc">Manage the narrative without leaving the trail.</span></span>
                </button>
            </div>
            <div class="panel-section">
                <div class="panel-section-title">Strategy</div>
                <button class="btn action-btn" onclick="GameUI.showAdBuyModal()">
                    <span class="action-icon">📡</span>
                    <span class="action-copy"><span class="action-label">Run Ads</span><span class="action-desc">Choose the state, channel, budget, and message tone.</span></span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('oppoResearch')">
                    <span class="action-icon">🔍</span>
                    <span class="action-copy"><span class="action-label">Oppo Research</span><span class="action-desc">Hunt for vulnerabilities before the other side lands a hit.</span></span>
                    <span class="action-cost">$150K</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.showCoalitionModal()">
                    <span class="action-icon">🤝</span>
                    <span class="action-copy"><span class="action-label">Build Coalition</span><span class="action-desc">Target a voter bloc and deepen your turnout machine.</span></span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('debatePrep')">
                    <span class="action-icon">📋</span>
                    <span class="action-copy"><span class="action-label">Debate Prep</span><span class="action-desc">Trade a week of work for cleaner answers under pressure.</span></span>
                </button>
                <button class="btn action-btn" onclick="GameUI.showPlatformModal()">
                    <span class="action-icon">🧭</span>
                    <span class="action-copy"><span class="action-label">Platform</span><span class="action-desc">Review your positions — or reposition, and eat the flip-flop.</span></span>
                </button>
                <button class="btn action-btn ${window.GameEngine.state.securityDetail ? 'security-active' : ''}" onclick="GameUI.buySecurityDetail()">
                    <span class="action-icon">🛡️</span>
                    <span class="action-copy"><span class="action-label">Security Detail ${window.GameEngine.state.securityDetail ? '<span style="font-size:0.65rem;color:var(--accent-green);">ACTIVE</span>' : ''}</span><span class="action-desc">Enhanced protection: fewer threats, better odds if one comes.</span></span>
                    ${window.GameEngine.state.securityDetail ? '' : '<span class="action-cost">$500K</span>'}
                </button>
            </div>
            <div class="panel-section">
                <div class="panel-section-title">Money</div>
                <button class="btn action-btn fundraising-blitz-btn" onclick="GameUI.startFundraisingBlitz()">
                    <span class="action-icon">💰</span>
                    <span class="action-copy"><span class="action-label">Fundraising Blitz</span><span class="action-desc">Spend the week dialing for dollars and refill the war chest.</span></span>
                    <span class="action-cost" style="color:var(--accent-green);">$1.5-3M</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('fieldOffice')">
                    <span class="action-icon">🏢</span>
                    <span class="action-copy"><span class="action-label">Open Field Office</span><span class="action-desc">Build durable organizing strength in a target market.</span></span>
                    <span class="action-cost">$200K</span>
                </button>
                <button class="btn action-btn" onclick="GameUI.doActivity('surrogateDeployment')">
                    <span class="action-icon">🗣️</span>
                    <span class="action-copy"><span class="action-label">Deploy Surrogates</span><span class="action-desc">Put validators on local television and at local stops.</span></span>
                    <span class="action-cost">$40K</span>
                </button>
                ${window.GameEngine.state.week >= window.GameConstants.EARLY_VOTE.START_WEEK ? `
                <button class="btn action-btn" onclick="GameUI.doActivity('gotv')" style="border-color:var(--accent-yellow);">
                    <span class="action-icon">🗳️</span>
                    <span class="action-label">GOTV Push <span style="font-size:0.65rem;color:var(--accent-yellow);">EARLY VOTE</span></span>
                    <span class="action-cost">$250K</span>
                </button>` : ''}
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
                    <div class="summary-card-header"><span class="summary-card-kicker">Approval</span><span class="summary-card-icon">👥</span></div>
                    <div class="sc-value ${c.approval > 50 ? 'text-green' : c.approval < 40 ? 'text-red' : ''}">${Math.round(c.approval)}%</div>
                    <div class="sc-label">National mood toward your campaign</div>
                </div>
                <div class="summary-card">
                    <div class="summary-card-header"><span class="summary-card-kicker">Base Energy</span><span class="summary-card-icon">🔥</span></div>
                    <div class="sc-value">${Math.round(c.enthusiasm)}</div>
                    <div class="sc-label">How ready your voters are to show up</div>
                </div>
                <div class="summary-card">
                    <div class="summary-card-header"><span class="summary-card-kicker">Media</span><span class="summary-card-icon">📰</span></div>
                    <div class="sc-value">${Math.round(c.mediaScore)}</div>
                    <div class="sc-label">Press treatment and message control</div>
                </div>
                <div class="summary-card">
                    <div class="summary-card-header"><span class="summary-card-kicker">Field</span><span class="summary-card-icon">🗺️</span></div>
                    <div class="sc-value">${Math.round(c.groundGame)}</div>
                    <div class="sc-label">On-the-ground organization and turnout</div>
                </div>
                <div class="summary-card">
                    <div class="summary-card-header"><span class="summary-card-kicker">Digital</span><span class="summary-card-icon">📱</span></div>
                    <div class="sc-value">${Math.round(c.onlineInfluence)}</div>
                    <div class="sc-label">Reach and viral potential across platforms</div>
                </div>
                <div class="summary-card">
                    <div class="summary-card-header"><span class="summary-card-kicker">Finance</span><span class="summary-card-icon">💵</span></div>
                    <div class="sc-value">${Math.round(c.donorConfidence)}</div>
                    <div class="sc-label">How comfortable donors feel backing you</div>
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
        const battlegroundCount = window.StateData.filter((state) => state.isBattleground).length;
        const leaningCount = Object.values(gs.statePolling).filter((poll) => Math.abs(poll.player - poll.opponent) <= 6).length;

        // Build SVG map using real state shapes
        const svgMap = window.USMapPaths ? this.buildSVGMap(gs) : this.buildFallbackMap(gs);

        container.innerHTML = `
            <div class="map-stage-shell">
                <div class="map-stage-header">
                    <div>
                        <div class="map-stage-kicker">Electoral Map</div>
                        <h3 class="map-stage-title">Race board</h3>
                        <div class="map-stage-copy">Live polling by state with battleground pressure, VP footprints, and real EV math.</div>
                    </div>
                    <div class="map-stage-meta">
                        <div class="map-stage-meta-card">
                            <span>Battlegrounds</span>
                            <strong>${battlegroundCount}</strong>
                        </div>
                        <div class="map-stage-meta-card">
                            <span>Close States</span>
                            <strong>${leaningCount}</strong>
                        </div>
                    </div>
                </div>
                <div class="map-scoreboard-shell">
                    <div class="map-score-card ${this.getPlayerColorClass()}">
                        <div class="map-score-label">${gs.playerCandidate.name.split(' ').pop()}</div>
                        <div class="map-score-value">${map.playerEV}</div>
                    </div>
                    <div class="map-score-track-shell">
                        <div class="map-score-track">
                            <div class="map-score-fill ${this.getPlayerColorClass()}" style="width:${(map.playerEV / 538) * 100}%"></div>
                            <div class="map-score-marker"></div>
                            <div class="map-score-fill ${this.getOpponentColorClass()} map-score-fill-opponent" style="width:${(map.opponentEV / 538) * 100}%"></div>
                        </div>
                        <div class="map-score-target">270 to win</div>
                    </div>
                    <div class="map-score-card ${this.getOpponentColorClass()}">
                        <div class="map-score-label">${gs.opponentCandidate.name.split(' ').pop()}</div>
                        <div class="map-score-value">${map.opponentEV}</div>
                    </div>
                </div>
                <div class="us-map-container svg-map-container map-stage-frame">
                    <div class="map-stage-grid"></div>
                    ${svgMap}
                </div>
                <div class="map-legend map-legend-inline">
                    <div class="legend-item"><div class="legend-color" style="background:#1a47a0"></div>Safe D</div>
                    <div class="legend-item"><div class="legend-color" style="background:#2d6fd4"></div>Lean D</div>
                    <div class="legend-item"><div class="legend-color" style="background:#5a9ae8"></div>Tilt D</div>
                    <div class="legend-item"><div class="legend-color" style="background:#8855aa"></div>Toss-Up</div>
                    <div class="legend-item"><div class="legend-color" style="background:#e85a5a"></div>Tilt R</div>
                    <div class="legend-item"><div class="legend-color" style="background:#d42d2d"></div>Lean R</div>
                    <div class="legend-item"><div class="legend-color" style="background:#a01a1a"></div>Safe R</div>
                </div>
            </div>
            ${this.isMobile ? '<div style="text-align:center;margin-top:8px;"><button class="btn btn-sm btn-ghost" onclick="GameUI.toggleMapView()">📋 List View</button></div>' : ''}
            <div id="state-detail-area"></div>`;
    },

    buildSVGMap(gs, opts) {
        opts = opts || {};
        const mapData = window.USMapPaths;
        const viewBox = mapData.viewBox || '0 0 960 600';
        const paths = [];
        const labels = [];

        for (const [abbr, data] of Object.entries(mapData.states)) {
            const poll = gs.statePolling[abbr];
            const st = window.StateData.find(s => s.id === abbr);
            if (!poll || !st) continue;

            const margin = poll.player - poll.opponent;
            const colorClass = this.getStateColorClass(margin, st.isBattleground);
            const override = opts.fillOverride ? opts.fillOverride(abbr) : null;
            const fillColor = override || this.getMapFillColor(colorClass);
            const playerVP = gs.playerTicket ? gs.playerTicket.vp : null;
            const opponentVP = gs.opponentTicket ? gs.opponentTicket.vp : null;
            const playerTouched = !opts.fillOverride && window.VPData && window.VPData.optionTouchesState(playerVP, abbr);
            const opponentTouched = !opts.fillOverride && window.VPData && window.VPData.optionTouchesState(opponentVP, abbr);
            const strokeColor = opts.fillOverride ? 'rgba(255,255,255,0.25)'
                : st.isBattleground ? '#f1c40f'
                : playerTouched ? '#3ddad7'
                : opponentTouched ? '#ffb366'
                : 'rgba(255,255,255,0.25)';
            const strokeWidth = opts.fillOverride ? '0.5'
                : st.isBattleground ? '1.5'
                : (playerTouched || opponentTouched) ? '1.5' : '0.5';
            const title = `${st.name}: ${Math.round(poll.player)}% - ${Math.round(poll.opponent)}%` +
                `${playerTouched ? ' | Your VP footprint' : ''}${opponentTouched ? ' | Opponent VP footprint' : ''}`;

            paths.push(
                `<path data-state="${abbr}" class="state-path state-${abbr}" d="${data.d}" ` +
                `fill="${fillColor}" stroke="${strokeColor}" stroke-width="${strokeWidth}" ` +
                `onclick="GameUI.handleStateClick('${abbr}')" style="cursor:pointer;transition:fill 0.2s ease;" >` +
                `<title>${title}</title></path>`
            );

            // Small NE states get side-stack chips instead of inline labels
            if (data.external) continue;

            const smallStates = ['VT', 'NH', 'WV', 'WY'];
            const fontSize = smallStates.includes(abbr) ? 10 : (st.electoralVotes > 15 ? 15 : st.electoralVotes > 8 ? 13 : 11);
            labels.push(
                `<text x="${data.cx}" y="${data.cy}" text-anchor="middle" dominant-baseline="middle" ` +
                `font-size="${fontSize}" font-weight="700" fill="#fff" ` +
                `pointer-events="none" style="text-shadow:0 1px 2px rgba(0,0,0,0.7);">${abbr}</text>`
            );
        }

        // Side stack: small northeastern states as clickable chips (TV election map style)
        const stack = [];
        (mapData.sideStack || []).forEach((abbr, i) => {
            const data = mapData.states[abbr];
            const poll = gs.statePolling[abbr];
            const st = window.StateData.find(s => s.id === abbr);
            if (!data || !poll || !st) return;

            const margin = poll.player - poll.opponent;
            const colorClass = this.getStateColorClass(margin, st.isBattleground);
            const override = opts.fillOverride ? opts.fillOverride(abbr) : null;
            const fillColor = override || this.getMapFillColor(colorClass);
            const strokeColor = st.isBattleground && !opts.fillOverride ? '#f1c40f' : 'rgba(255,255,255,0.25)';
            const title = `${st.name}: ${Math.round(poll.player)}% - ${Math.round(poll.opponent)}%`;
            const x = 960, y = 118 + i * 40;

            stack.push(
                `<g class="map-side-chip" data-state="${abbr}" onclick="GameUI.handleStateClick('${abbr}')" style="cursor:pointer;">` +
                `<line x1="${data.cx}" y1="${data.cy}" x2="${x}" y2="${y + 14}" stroke="rgba(255,255,255,0.15)" stroke-width="0.75" pointer-events="none"/>` +
                `<rect x="${x}" y="${y}" width="30" height="28" rx="4" fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5" style="transition:fill 0.2s ease;"><title>${title}</title></rect>` +
                `<text x="${x + 15}" y="${y + 15}" text-anchor="middle" dominant-baseline="middle" font-size="12" font-weight="700" fill="#fff" pointer-events="none">${abbr}</text>` +
                `<text x="${x + 36}" y="${y + 15}" text-anchor="start" dominant-baseline="middle" font-size="10" fill="rgba(255,255,255,0.6)" pointer-events="none">${st.electoralVotes}</text>` +
                `</g>`
            );
        });

        // AI target markers: where the opponent is spending this week
        const markers = [];
        if (!opts.fillOverride && gs.opponentPlaybook && gs.opponentPlaybook.targets) {
            const oColor = gs.opponentCandidate && gs.opponentCandidate.color ? gs.opponentCandidate.color : '#d42121';
            for (const id of gs.opponentPlaybook.targets) {
                const data = mapData.states[id];
                if (!data || data.external) continue;
                markers.push(
                    `<text x="${data.cx + 14}" y="${data.cy - 12}" text-anchor="middle" font-size="13" font-weight="900" ` +
                    `fill="${oColor}" stroke="#0a0e17" stroke-width="0.6" pointer-events="none">⊕</text>`
                );
            }
        }

        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" class="us-map-svg">` +
            `<style>` +
            `.state-path:hover { filter: brightness(1.3); }` +
            `.map-side-chip:hover rect { filter: brightness(1.3); }` +
            `</style>` +
            `<g>${paths.join('')}</g>` +
            `<g>${labels.join('')}</g>` +
            `<g class="map-side-stack">${stack.join('')}</g>` +
            `<g>${markers.join('')}</g>` +
            `</svg>`;
    },

    getMapFillColor(colorClass) {
        const colors = {
            'dem-safe': '#1a47a0',
            'dem-lean': '#2d6fd4',
            'dem-tilt': '#5a9ae8',
            'tossup': '#8855aa',
            'rep-tilt': '#e85a5a',
            'rep-lean': '#d42d2d',
            'rep-safe': '#a01a1a',
        };
        return colors[colorClass] || '#8855aa';
    },

    buildFallbackMap(gs) {
        // Fallback to circle-based map if SVG paths aren't loaded
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
        return statesHTML;
    },

    getStateColorClass(margin, isBattleground) {
        const isPlayerDem = window.GameEngine.state.playerParty === 'democrat';
        // margin > 0 means player leads; convert to dem margin
        let demMargin = isPlayerDem ? margin : -margin;

        if (demMargin > 15) return 'dem-safe';
        if (demMargin > 8) return 'dem-lean';
        if (demMargin > 2) return 'dem-tilt';
        if (demMargin < -15) return 'rep-safe';
        if (demMargin < -8) return 'rep-lean';
        if (demMargin < -2) return 'rep-tilt';
        return 'tossup';
    },

    // Helper: returns the correct party color class for player/opponent
    getPlayerColorClass() {
        const gs = window.GameEngine.state;
        return gs && gs.playerParty === 'republican' ? 'rep' : 'dem';
    },
    getOpponentColorClass() {
        const gs = window.GameEngine.state;
        return gs && gs.playerParty === 'republican' ? 'dem' : 'rep';
    },
    getPlayerColorVar() {
        const gs = window.GameEngine.state;
        return gs && gs.playerParty === 'republican' ? 'var(--rep-red-light)' : 'var(--dem-blue-light)';
    },
    getOpponentColorVar() {
        const gs = window.GameEngine.state;
        return gs && gs.playerParty === 'republican' ? 'var(--dem-blue-light)' : 'var(--rep-red-light)';
    },

    handleStateClick(stateId) {
        const st = window.StateData.find(s => s.id === stateId);
        const gs = window.GameEngine.state;
        const poll = gs.statePolling[stateId];
        if (!st || !poll) return;

        const area = document.getElementById('state-detail-area');
        if (!area) return; // map rendered outside the war room (e.g. election night)
        const playerPct = Math.round(poll.player * 10) / 10;
        const oppPct = Math.round(poll.opponent * 10) / 10;
        const pName = gs.playerCandidate.name.split(' ').pop();
        const oName = gs.opponentCandidate.name.split(' ').pop();
        const trendIcon = poll.trend > 0.5 ? '<span class="poll-trend up">▲</span>' : poll.trend < -0.5 ? '<span class="poll-trend down">▼</span>' : '';
        const playerVP = gs.playerTicket ? gs.playerTicket.vp : null;
        const opponentVP = gs.opponentTicket ? gs.opponentTicket.vp : null;
        const ticketFactors = [];

        if (playerVP && window.VPData.optionTouchesState(playerVP, stateId)) {
            const homeStateBoost = window.VPData.getStateIdForName(playerVP.homeState) === stateId ? 'home-state' : 'regional';
            ticketFactors.push(`Your VP ${playerVP.name} adds a ${homeStateBoost} edge here.`);
        }
        if (opponentVP && window.VPData.optionTouchesState(opponentVP, stateId)) {
            const homeStateBoost = window.VPData.getStateIdForName(opponentVP.homeState) === stateId ? 'home-state' : 'regional';
            ticketFactors.push(`${opponentVP.name} gives the opposition a ${homeStateBoost} edge here.`);
        }

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
                    <div class="state-poll-${this.getPlayerColorClass()}" style="width:${playerPct}%">${pName} ${playerPct}%</div>
                    <div class="state-poll-${this.getOpponentColorClass()}" style="width:${oppPct}%">${oName} ${oppPct}%</div>
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
                    ${gs.earlyVote && gs.earlyVote[stateId] && gs.earlyVote[stateId].pctBanked > 0 ? `
                    <div class="state-info-item">
                        <div class="info-label">Early Vote</div>
                        <div>🗳️ ${Math.round(gs.earlyVote[stateId].pctBanked)}% banked (locked in)</div>
                    </div>` : ''}
                    ${ticketFactors.length ? `
                    <div class="state-info-item state-ticket-factor">
                        <div class="info-label">Ticket Factors</div>
                        <div>${ticketFactors.join(' ')}</div>
                    </div>` : ''}
                    ${gs.platform ? (() => {
                        const fitGap = window.GameEngine.computePlatformFit(gs.platform, st) -
                                       window.GameEngine.computePlatformFit(gs.opponentPlatform, st);
                        const drift = fitGap * window.GameConstants.PLATFORM.DRIFT_MAX * 2;
                        const verdict = drift > 0.03 ? 'Good' : drift < -0.03 ? 'Poor' : 'Even';
                        return `
                    <div class="state-info-item">
                        <div class="info-label">Platform Fit</div>
                        <div>${verdict} (${drift >= 0 ? '+' : ''}${drift.toFixed(2)}/wk)</div>
                    </div>`;
                    })() : ''}
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
        this.renderIntelPanel();
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
        const barClass = this.getPlayerColorClass();

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

        const pollsters = window.GameConstants.POLLSTERS;
        const isPlayerRep = gs.playerParty === 'republican';

        let pollCardsHTML = battlegrounds.slice(0, 8).map((st, stIdx) => {
            const poll = gs.statePolling[st.id];
            if (!poll) return '';
            const total = poll.player + poll.opponent;
            const pPct = (poll.player / total * 100).toFixed(0);
            const oPct = (poll.opponent / total * 100).toFixed(0);
            const trendIcon = poll.trend > 0.5 ? '<span class="poll-trend up">▲</span>' : poll.trend < -0.5 ? '<span class="poll-trend down">▼</span>' : '';

            // 3-week rolling polling average with margin of error
            const history = (gs.pollHistory && gs.pollHistory[st.id]) || [];
            const recent = history.slice(-3);
            const avgMargin = recent.length
                ? recent.reduce((a, h) => a + (h.player - h.opponent), 0) / recent.length
                : poll.player - poll.opponent;
            const moe = 2.5 + (st.swingVolatility || 30) / 60;
            const tooClose = Math.abs(avgMargin) < moe;

            // Sparkline of the polling margin over recorded weeks
            let sparkHTML = '';
            if (history.length >= 2) {
                const margins = history.map(h => h.player - h.opponent);
                const maxAbs = Math.max(3, ...margins.map(Math.abs));
                const pts = margins.map((m, i) => {
                    const x = (i / (margins.length - 1)) * 100;
                    const y = 10 - (m / maxAbs) * 8;
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                }).join(' ');
                sparkHTML = `
                    <svg class="poll-sparkline" viewBox="0 0 100 20" preserveAspectRatio="none">
                        <line x1="0" y1="10" x2="100" y2="10" stroke="rgba(255,255,255,0.15)" stroke-width="0.5" stroke-dasharray="2,2"/>
                        <polyline points="${pts}" fill="none" stroke="${avgMargin >= 0 ? this.getPlayerColorVar() : this.getOpponentColorVar()}" stroke-width="1.5" vector-effect="non-scaling-stroke"/>
                    </svg>`;
            }

            // Rotating "latest poll" from a fictional pollster with a house effect
            const pollster = pollsters[(gs.week + stIdx) % pollsters.length];
            const houseShift = isPlayerRep ? pollster.house : -pollster.house;
            const jitter = ((gs.week * 7 + stIdx * 13) % 5 - 2) * 0.4;
            const shown = Math.round((poll.player - poll.opponent + houseShift + jitter) * 10) / 10;
            const pLast = gs.playerCandidate.name.split(' ').pop();
            const oLast = gs.opponentCandidate.name.split(' ').pop();
            const pollsterLine = `${pollster.name.toUpperCase()}: ${shown >= 0 ? pLast : oLast} +${Math.abs(shown).toFixed(1)} (±${pollster.moe.toFixed(1)})`;

            // Early vote banked share
            const ev = gs.earlyVote && gs.earlyVote[st.id];
            const evChip = ev && ev.pctBanked > 0
                ? `<span class="early-vote-chip">🗳️ ${Math.round(ev.pctBanked)}% BANKED</span>` : '';

            return `
                <div class="poll-card ${tooClose ? 'too-close' : ''}" onclick="GameUI.handleStateClick('${st.id}');GameUI.switchTab('map');">
                    <div class="poll-card-header">
                        <span class="poll-card-state">${st.id} <span class="poll-card-state-name">${st.name}</span> ${trendIcon}</span>
                        <span class="poll-card-ev">${st.electoralVotes} EV</span>
                    </div>
                    <div class="poll-mini-bar">
                        <div class="poll-mini-${this.getPlayerColorClass()}" style="width:${pPct}%"></div>
                        <div class="poll-mini-${this.getOpponentColorClass()}" style="width:${oPct}%"></div>
                    </div>
                    <div class="poll-card-numbers">
                        <span class="text-${this.getPlayerColorClass()}">${Math.round(poll.player * 10) / 10}%</span>
                        <span class="poll-avg-label">${tooClose ? 'TOO CLOSE TO CALL' : `AVG ${avgMargin >= 0 ? '+' : ''}${avgMargin.toFixed(1)} ±${moe.toFixed(1)}`}</span>
                        <span class="text-${this.getOpponentColorClass()}">${Math.round(poll.opponent * 10) / 10}%</span>
                    </div>
                    ${sparkHTML}
                    <div class="poll-pollster-line">${pollsterLine} ${evChip}</div>
                </div>`;
        }).join('');

        // Recent news
        const recentNews = gs.newsHistory.slice(-5).reverse();
        const newsHTML = recentNews.length > 0
            ? recentNews.map(h => `<div class="intel-feed-item">${h}</div>`).join('')
            : '<div class="text-muted" style="font-size:0.8rem;">No news yet</div>';

        // Scandal tracker
        const scandalLevel = gs.campaign.scandalVulnerability;
        const scandalClass = scandalLevel > 70 ? 'severity-critical' : scandalLevel > 50 ? 'severity-high' : scandalLevel > 30 ? 'severity-medium' : 'severity-low';

        panel.innerHTML = `
            ${this.buildPrimaryScoreboard(gs)}
            <div class="panel-section intel-section">
                <div class="panel-section-title">Battleground Watch</div>
                <div class="intel-section-copy">Closest states first. Tap any card to focus the map.</div>
                ${pollCardsHTML}
            </div>
            <div class="panel-section intel-section">
                <div class="panel-section-title">Latest Intel</div>
                ${newsHTML}
            </div>
            <div class="panel-section intel-section">
                <div class="panel-section-title">Risk Monitor</div>
                <div class="intel-risk-card">
                    <span class="scandal-severity ${scandalClass}"></span>
                    <div>
                        <div class="intel-risk-value">Vulnerability ${Math.round(scandalLevel)}/100</div>
                        <div class="intel-risk-copy">${scandalLevel > 60 ? 'High exposure to opposition and media attacks.' : 'Exposure is manageable if messaging stays disciplined.'}</div>
                    </div>
                </div>
                ${(gs.activeScandals || []).map(sc => `
                    <div class="scandal-story ${sc.target === 'opponent' ? 'opponent-story' : ''}">
                        <div class="scandal-story-head">
                            <span>${sc.target === 'opponent' ? '🎯 ' : ''}${sc.title}</span>
                            <span class="scandal-flames">${'🔥'.repeat(Math.max(1, sc.severity))}</span>
                        </div>
                        <div class="scandal-story-meta">${sc.target === 'opponent' ? 'THEIR PROBLEM · ' : ''}${sc.stage}${sc.lastResponse !== 'none' ? ' · response: ' + sc.lastResponse : ''}</div>
                    </div>`).join('')}
            </div>
            ${this.buildTemperatureSection(gs)}
            ${this.buildEndorsementSection(gs)}
            ${this.buildPlaybookSection(gs)}
            <div class="panel-section intel-section">
                <div class="panel-section-title">Opponent Intel</div>
                <div class="intel-opponent-name">${gs.opponentCandidate.name}</div>
                <div class="intel-opponent-vp">VP: ${gs.opponentTicket && gs.opponentTicket.vp ? gs.opponentTicket.vp.name : (gs.opponentVP ? gs.opponentVP.name : 'TBD')}</div>
                ${this.createStatBar('Approval', Math.round(gs.opponent.approval), this.getOpponentColorClass())}
                ${this.createStatBar('Enthusiasm', Math.round(gs.opponent.enthusiasm), this.getOpponentColorClass())}
                ${this.createStatBar('Cash', Math.min(100, Math.round(gs.opponent.cash / 100000)), 'yellow')}
            </div>`;
    },

    buildEndorsementSection(gs) {
        const all = window.EventSystem.ENDORSEMENTS || [];
        const byId = id => all.find(e => e.id === id);
        const mine = (gs.endorsements || []).map(byId).filter(Boolean);
        const theirs = (gs.opponentEndorsements || []).map(byId).filter(Boolean);
        const vpName = gs.vpChoice ? (gs.vpChoice.name || gs.vpChoice) : null;

        if (!mine.length && !theirs.length && !vpName && gs.phase !== 'general') return '';

        const pLast = gs.playerCandidate.name.split(' ').pop();
        const oLast = gs.opponentCandidate.name.split(' ').pop();
        const list = (items) => items.length
            ? items.map(e => `<div class="endorsement-item">${e.icon} ${e.name}</div>`).join('')
            : '<div class="text-muted" style="font-size:0.75rem;">None yet</div>';

        return `
            <div class="panel-section">
                <div class="panel-section-title">Endorsements${vpName ? ` & Ticket` : ''}</div>
                ${vpName ? `<div class="endorsement-item" style="margin-bottom:6px;">🤝 Running mate: <strong>${vpName}</strong></div>` : ''}
                <div style="font-size:0.72rem;letter-spacing:1px;color:var(--text-muted);margin-bottom:2px;">${pLast.toUpperCase()} (${mine.length})</div>
                ${list(mine)}
                <div style="font-size:0.72rem;letter-spacing:1px;color:var(--text-muted);margin:6px 0 2px;">${oLast.toUpperCase()} (${theirs.length})</div>
                ${list(theirs)}
            </div>`;
    },

    buildPrimaryScoreboard(gs) {
        const p = gs.primary;
        if (!p || gs.phase !== 'primary') return '';
        const cfg = window.GameConstants.PRIMARY;
        const pLast = gs.playerCandidate.name.split(' ').pop();
        const nextContest = window.GameConstants.PRIMARY_CALENDAR.find(ct => ct.week >= gs.week);
        const allocated = p.playerDelegates + p.rivals.reduce((a, r) => a + r.delegates, 0);
        const clinchPct = (cfg.DELEGATES_TO_CLINCH / cfg.TOTAL_DELEGATES) * 100;

        const bar = [
            `<div class="delegate-fill" style="width:${(p.playerDelegates / cfg.TOTAL_DELEGATES) * 100}%;background:${gs.playerCandidate.color || 'var(--dem-blue)'};"></div>`,
            ...p.rivals.map(r => `<div class="delegate-fill" style="width:${(r.delegates / cfg.TOTAL_DELEGATES) * 100}%;background:${r.color || '#666'};opacity:0.7;"></div>`),
        ].join('');

        return `
            <div class="panel-section intel-section primary-scoreboard">
                <div class="panel-section-title">Primary Scoreboard ${p.decided ? '— NOMINEE ✓' : ''}</div>
                <div class="delegate-bar">
                    ${bar}
                    <div class="delegate-clinch-marker" style="left:${clinchPct}%;"></div>
                </div>
                <div class="delegate-readout">
                    <span><strong>${p.playerDelegates}</strong> ${pLast.toUpperCase()}</span>
                    <span class="text-muted">${cfg.DELEGATES_TO_CLINCH} to clinch · ${cfg.TOTAL_DELEGATES - allocated} left</span>
                </div>
                <div class="rival-chips">
                    <div class="rival-chip you"><span class="rival-name">${pLast} (you)</span><span class="rival-support">${Math.round(p.playerSupport)}%</span></div>
                    ${p.rivals.map(r => `
                        <div class="rival-chip ${r.droppedOut ? 'dropped' : ''}">
                            <span class="rival-name">${r.portraitEmoji} ${r.name.split(' ').pop()}</span>
                            <span class="rival-support">${r.droppedOut ? 'OUT' : Math.round(r.support) + '% · ' + r.delegates + ' del'}</span>
                        </div>`).join('')}
                </div>
                ${nextContest && !p.decided ? `
                <div class="next-contest">NEXT: <strong>${nextContest.name.toUpperCase()}</strong> — Week ${nextContest.week} · ${nextContest.delegates} delegates</div>` : ''}
            </div>`;
    },

    buildPlaybookSection(gs) {
        const pb = gs.opponentPlaybook;
        if (!pb || !pb.targets || !pb.targets.length) return '';
        const oLast = gs.opponentCandidate.name.split(' ').pop().toUpperCase();
        const postureCopy = {
            offense: { label: `${oLast} ON OFFENSE`, cls: 'playbook-offense', note: 'Attacking your narrowest holds with negative ads.' },
            defense: { label: `${oLast} PLAYING DEFENSE`, cls: 'playbook-defense', note: 'Shoring up their own vulnerable states.' },
            balanced: { label: `${oLast} PROBING THE MAP`, cls: 'playbook-balanced', note: 'Working the closest battlegrounds with contrast messaging.' },
            improvising: { label: `${oLast} IMPROVISING`, cls: 'playbook-balanced', note: 'No clear pattern detected.' },
        };
        const p = postureCopy[pb.posture] || postureCopy.balanced;
        return `
            <div class="panel-section intel-section">
                <div class="panel-section-title">Opponent Playbook</div>
                <div class="playbook-posture ${p.cls}">${p.label}</div>
                <div class="playbook-note">${p.note}</div>
                <div class="playbook-targets">
                    ${pb.targets.map(id => {
                        const st = window.StateData.find(s => s.id === id);
                        return st ? `<span class="playbook-target" onclick="GameUI.handleStateClick('${id}');GameUI.switchTab('map');">⊕ ${st.name}</span>` : '';
                    }).join('')}
                </div>
            </div>`;
    },

    buildTemperatureSection(gs) {
        const anger = Math.round(gs.publicAnger || 0);
        const level = window.GameEngine.getAngerLevel();
        const t = window.GameConstants.ANGER.THRESHOLDS;
        const levelClass = level === 'SEVERE' ? 'temp-severe' : level === 'HIGH' ? 'temp-high' : level === 'ELEVATED' ? 'temp-elevated' : 'temp-low';
        const advisory = anger >= t.HIGH
            ? `<div class="temp-advisory">⚠ Secret Service advises increased protection.${gs.securityDetail ? ' <strong>Detail active.</strong>' : ''}</div>`
            : (gs.securityDetail ? '<div class="temp-advisory">🛡 Security detail active.</div>' : '');
        const hospital = gs.hospitalized > 0
            ? `<div class="temp-advisory temp-hospital">✚ Candidate recovering — ${gs.hospitalized} week${gs.hospitalized > 1 ? 's' : ''} of limited campaigning.</div>`
            : '';
        return `
            <div class="panel-section intel-section">
                <div class="panel-section-title">National Temperature</div>
                <div class="temp-meter">
                    <div class="temp-needle" style="left:${Math.max(0, Math.min(100, anger))}%;"></div>
                </div>
                <div class="temp-readout">
                    <span class="temp-badge ${levelClass}">${level}</span>
                    <span class="temp-value">${anger}/100 public anger</span>
                </div>
                ${advisory}
                ${hospital}
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

        // The rest of the week's flow, run either directly or after an
        // assassination-attempt interstitial resolves
        const continueWeek = () => {
            // Losing the nomination ends the run before any general election
            if (result.gameOver === 'lostNomination') {
                this.showPrimaryDefeat();
                return;
            }

            // Primary contest results night
            if (result.primaryResult) {
                this.showContestResults(result.primaryResult);
            }

            // Check for debate
            if (result.isDebateWeek) {
                this.showToast('DEBATE NIGHT! Prepare yourself.', 'info');
                setTimeout(() => this.startDebate(), 1000);
                return;
            }

            // Check for game over (normal end of race)
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
        };

        // Security incident takes over the screen before anything else
        if (result.assassinationEvent) {
            this.showAssassinationAttempt(result.assassinationEvent, continueWeek);
            return;
        }

        continueWeek();
    },

    showContestResults(cr) {
        const html = `
            <div style="text-align:center;">
                <div style="font-size:0.7rem;letter-spacing:2px;color:var(--text-muted);margin-bottom:4px;">PRIMARY NIGHT — WEEK ${cr.week}</div>
                <h3 style="margin-bottom:2px;">${cr.name}</h3>
                <div class="text-muted" style="font-size:0.8rem;margin-bottom:12px;">${cr.delegates} delegates at stake</div>
                <div style="display:flex;flex-direction:column;gap:6px;max-width:420px;margin:0 auto 12px;">
                    ${cr.results.map((r, i) => `
                        <div class="contest-result-row ${i === 0 ? 'winner' : ''} ${r.isPlayer ? 'you' : ''}">
                            <span>${i === 0 ? '🏆 ' : ''}${r.name}${r.isPlayer ? ' (you)' : ''}</span>
                            <span style="font-family:var(--font-mono);">${r.pct}% · <strong>${r.delegates}</strong> del</span>
                        </div>`).join('')}
                </div>
                <button class="btn btn-primary" onclick="GameUI.closeModal()">${cr.playerWon ? 'VICTORY SPEECH →' : 'BACK TO WORK →'}</button>
            </div>`;
        this.showModal(cr.playerWon ? '🎉 You won the night' : 'A tough night', html);
    },

    showPrimaryDefeat() {
        const gs = window.GameEngine.state;
        this.showScreen('election-night');
        const container = document.getElementById('election-night-content');
        const p = gs.primary;
        const winner = p.rivals.slice().sort((a, b) => b.delegates - a.delegates)[0];

        container.innerHTML = `
            <div class="tragedy-screen">
                <div class="tragedy-candle">🥀</div>
                <h1 class="tragedy-title">The Nomination Slips Away</h1>
                <p class="tragedy-name">${gs.playerCandidate.name}</p>
                <p class="tragedy-copy">The delegate math is unforgiving. ${winner ? winner.name + ' will carry the party banner into November.' : 'Another candidate will carry the party banner into November.'} There's always the next cycle.</p>
                <div class="en-retro">
                    <div class="en-retro-title">THE PRIMARY THAT WAS</div>
                    <div class="en-retro-grid">
                        <div class="en-retro-item"><div class="retro-val">${p.playerDelegates}</div><div class="retro-label">Your Delegates</div></div>
                        <div class="en-retro-item"><div class="retro-val">${winner ? winner.delegates : '—'}</div><div class="retro-label">${winner ? winner.name.split(' ').pop() : 'Rival'}</div></div>
                        <div class="en-retro-item"><div class="retro-val">${p.contestHistory.filter(c => c.playerWon).length}/${p.contestHistory.length}</div><div class="retro-label">Contests Won</div></div>
                        <div class="en-retro-item"><div class="retro-val">$${this.formatMoney(gs.finances.totalRaised)}</div><div class="retro-label">Total Raised</div></div>
                    </div>
                </div>
                <div class="mt-2 btn-group" style="justify-content:center;">
                    <button class="btn btn-primary btn-lg" onclick="GameUI.startNewGame()">RUN AGAIN</button>
                    <button class="btn btn-lg" onclick="GameUI.showScreen('title')">MAIN MENU</button>
                </div>
            </div>`;
        this.updateTicker([
            `${gs.playerCandidate.name.split(' ').pop().toUpperCase()} CAMPAIGN SUSPENDS AFTER DELEGATE MATH TURNS FATAL`,
            winner ? `${winner.name.toUpperCase()} MARCHES TOWARD THE NOMINATION` : 'THE PRIMARY RACE MOVES ON',
        ]);
    },

    showAssassinationAttempt(evt, onContinue) {
        this.showScreen('debate'); // reuse the full-screen broadcast stage container
        const stage = document.getElementById('debate-stage');
        const last = evt.candidateName.split(' ').pop();

        // Phase 1: breaking-news alert
        stage.innerHTML = `
            <div class="incident-broadcast">
                <div class="broadcast-header">
                    <div class="network-bug">GNN <span class="bug-divider">|</span> BREAKING NEWS</div>
                    <div class="broadcast-title">SPECIAL REPORT</div>
                    <div class="live-indicator"><span class="live-dot"></span>LIVE</div>
                </div>
                <div class="incident-alert">
                    <div class="incident-alert-flash">SHOTS FIRED AT CAMPAIGN EVENT</div>
                    <div class="incident-alert-sub">Reports of gunfire at a ${last} rally. Details are still coming in…</div>
                </div>
            </div>`;

        setTimeout(() => {
            if (evt.survived) {
                stage.innerHTML = `
                    <div class="incident-broadcast">
                        <div class="broadcast-header">
                            <div class="network-bug">GNN <span class="bug-divider">|</span> BREAKING NEWS</div>
                            <div class="broadcast-title">SPECIAL REPORT</div>
                            <div class="live-indicator"><span class="live-dot"></span>LIVE</div>
                        </div>
                        <div class="incident-outcome survived">
                            <div class="incident-icon">🇺🇸</div>
                            <h2>${last.toUpperCase()} STABLE — A NATION RALLIES</h2>
                            <p class="incident-copy">${evt.candidateName} was rushed to the hospital and is in stable condition. ${evt.hadSecurity ? 'The security detail is credited with the fast response.' : 'Aides say no enhanced security detail was on site.'} Across the country, a shaken electorate is rallying to the campaign.</p>
                            <div class="incident-effects">
                                <div class="incident-effect">Approval <strong>+6</strong></div>
                                <div class="incident-effect">Enthusiasm <strong>+8</strong></div>
                                <div class="incident-effect">Momentum <strong>+15</strong></div>
                                <div class="incident-effect">Polling <strong>+1.5 nationwide</strong></div>
                            </div>
                            <p class="incident-note">The candidate will campaign at reduced capacity while recovering.</p>
                            <button class="btn btn-primary btn-lg mt-2" id="incident-continue">CONTINUE THE CAMPAIGN →</button>
                        </div>
                    </div>`;
                document.getElementById('incident-continue').onclick = () => {
                    this.showScreen('game');
                    onContinue();
                };
            } else {
                this.showAssassinationTragedy(evt);
            }
        }, 2600);
    },

    showAssassinationTragedy(evt) {
        const gs = window.GameEngine.state;
        this.showScreen('election-night');
        const container = document.getElementById('election-night-content');
        const debatesWon = (gs.debateHistory || []).filter(d => d.winner === 'player').length;
        const debatesTotal = (gs.debateHistory || []).length;

        container.innerHTML = `
            <div class="tragedy-screen">
                <div class="tragedy-candle">🕯️</div>
                <h1 class="tragedy-title">In Memoriam</h1>
                <p class="tragedy-name">${evt.candidateName}</p>
                <p class="tragedy-copy">The campaign of ${evt.candidateName} ended today. A nation mourns a life cut short on the trail. The race goes on without them.</p>
                <div class="en-retro">
                    <div class="en-retro-title">THE CAMPAIGN THAT WAS</div>
                    <div class="en-retro-grid">
                        <div class="en-retro-item"><div class="retro-val">Week ${gs.week - 1}</div><div class="retro-label">Reached</div></div>
                        <div class="en-retro-item"><div class="retro-val">${debatesWon}/${debatesTotal}</div><div class="retro-label">Debates Won</div></div>
                        <div class="en-retro-item"><div class="retro-val">${(gs.endorsements || []).length}</div><div class="retro-label">Endorsements</div></div>
                        <div class="en-retro-item"><div class="retro-val">$${this.formatMoney(gs.finances.totalRaised)}</div><div class="retro-label">Total Raised</div></div>
                    </div>
                </div>
                <div class="mt-2 btn-group" style="justify-content:center;">
                    <button class="btn btn-primary btn-lg" onclick="GameUI.startNewGame()">PLAY AGAIN</button>
                    <button class="btn btn-lg" onclick="GameUI.showScreen('title')">MAIN MENU</button>
                </div>
            </div>`;
        this.updateTicker([
            `THE NATION MOURNS ${evt.candidateName.toUpperCase()}`,
            `A CAMPAIGN, AND A LIFE, CUT SHORT`,
        ]);
    },

    startFundraisingBlitz() {
        this.showModal('Fundraising Blitz', `
            <div style="text-align:center;padding:1rem;">
                <div style="font-size:3rem;margin-bottom:1rem;">💰</div>
                <h3 style="margin-bottom:0.5rem;">Dedicate Your Entire Week to Fundraising</h3>
                <p class="text-muted" style="margin-bottom:1.5rem;">Cancel all campaign events and go all-in on the phones, dinners, and donor meetings. You'll raise <strong>$1.5M - $3.5M</strong> depending on donor confidence, but your momentum and enthusiasm will take a hit.</p>
                <div style="background:var(--bg-card);border:1px solid var(--border-color);border-radius:var(--radius-sm);padding:12px;margin-bottom:1.5rem;text-align:left;">
                    <div style="font-size:0.8rem;color:var(--text-secondary);margin-bottom:4px;">Trade-offs:</div>
                    <div style="font-size:0.85rem;color:var(--accent-green);">+ $1.5M - $3.5M raised</div>
                    <div style="font-size:0.85rem;color:var(--accent-green);">+ Donor Confidence +5</div>
                    <div style="font-size:0.85rem;color:var(--accent-red);">- Enthusiasm -2 (neglecting the base)</div>
                    <div style="font-size:0.85rem;color:var(--accent-red);">- Momentum -3 (off the trail)</div>
                    <div style="font-size:0.85rem;color:var(--accent-yellow);">⚠ Uses your entire week — advances to next turn</div>
                </div>
                <div class="btn-group" style="justify-content:center;">
                    <button class="btn btn-primary btn-lg" onclick="GameUI.executeFundraisingBlitz()">MAKE THE CALLS</button>
                    <button class="btn btn-lg" onclick="GameUI.closeModal()">NEVERMIND</button>
                </div>
            </div>`);
    },

    executeFundraisingBlitz() {
        const result = window.GameEngine.applyActivityEffects('fundraisingBlitz');
        window.GameEngine.state.campaign.cash = window.GameEngine.state.finances.cashOnHand;

        this.closeModal();
        this.showToast(`Fundraising Blitz! Raised $${this.formatMoney(result.cashRaised)}! Now advancing the week...`, 'success');

        // Fundraising blitz uses the whole week — auto-advance
        setTimeout(() => this.handleEndWeek(), 800);
    },

    showPlatformModal() {
        const gs = window.GameEngine.state;
        if (!gs.platform) return;
        const shiftedThisWeek = gs.platformShiftedWeek === gs.week;
        const html = `
            <p class="text-muted mb-1" style="font-size:0.85rem;">
                States drift toward the candidate whose platform fits their priorities.
                You may shift <strong>one issue per week</strong>; every shift costs enthusiasm and credibility
                (flip-flops so far: <strong>${gs.flipFlops}</strong>).
                ${shiftedThisWeek ? '<br><span style="color:var(--accent-yellow);">You already repositioned this week.</span>' : ''}
            </p>
            <div class="platform-grid platform-modal-grid">
                ${window.GameConstants.ISSUES.map(issue => {
                    const stance = gs.platform[issue.key];
                    const oppStance = gs.opponentPlatform ? gs.opponentPlatform[issue.key] : null;
                    return `
                    <div class="platform-row">
                        <div class="platform-row-head">
                            <span class="platform-issue-label">${issue.label}</span>
                            <span class="platform-shift-btns">
                                <button class="btn btn-sm" onclick="GameUI.doShiftPlatform('${issue.key}', -1)" ${shiftedThisWeek || stance <= -2 ? 'disabled' : ''}>◀</button>
                                <button class="btn btn-sm" onclick="GameUI.doShiftPlatform('${issue.key}', 1)" ${shiftedThisWeek || stance >= 2 ? 'disabled' : ''}>▶</button>
                            </span>
                        </div>
                        <div class="platform-poles"><span>${issue.left}</span><span>${issue.right}</span></div>
                        <div class="platform-stops readonly">
                            ${[-2, -1, 0, 1, 2].map(v => `
                                <div class="platform-stop ${stance === v ? 'selected' : ''} ${oppStance === v ? 'opp-marker' : ''}">
                                    ${oppStance === v && stance !== v ? '·' : ''}
                                </div>`).join('')}
                        </div>
                    </div>`;
                }).join('')}
            </div>
            <p class="text-muted" style="font-size:0.7rem;margin-top:8px;">Your position ■ · Opponent's position ·</p>`;
        this.showModal('Policy Platform', html);
    },

    doShiftPlatform(issueKey, dir) {
        const result = window.GameEngine.shiftPlatform(issueKey, dir);
        this.showToast(result.message, result.ok ? 'warning' : 'error');
        if (result.ok) {
            if (result.headline) this.updateTicker([result.headline]);
            this.showPlatformModal(); // re-render with new state
            this.renderIntelPanel();
        }
    },

    buySecurityDetail() {
        const result = window.GameEngine.activateSecurityDetail();
        this.showToast(result.message, result.ok ? 'success' : 'warning');
        if (result.ok) {
            this.updateTopBar();
            this.renderActionPanel();
            this.renderIntelPanel();
        }
    },

    doActivity(activity) {
        const gs = window.GameEngine.state;
        const costMap = { rally: 60000, townhall: 30000, podcast: 5000, oppoResearch: 150000, fieldOffice: 200000, surrogateDeployment: 40000, gotv: window.GameConstants.EARLY_VOTE.GOTV_COST };
        const cost = costMap[activity] || 0;
        if (cost > 0 && gs.finances.cashOnHand < cost) {
            this.showToast(`Not enough cash! Need $${this.formatMoney(cost)}`, 'error');
            return;
        }
        const result = window.GameEngine.applyActivityEffects(activity);
        const labels = { rally: 'Rally', townhall: 'Town Hall', podcast: 'Podcast', interview: 'Interview', fundraisingBlitz: 'Fundraising Blitz', debatePrep: 'Debate Prep', surrogateDeployment: 'Surrogate Deployment', oppoResearch: 'Oppo Research', fieldOffice: 'Field Office', gotv: 'GOTV Push' };
        const msg = result.cashRaised ? `${labels[activity]}! Raised $${this.formatMoney(result.cashRaised)}` :
            result.gotvStates ? `GOTV Push! Banking early votes in ${result.gotvStates}` : `${labels[activity]} complete!`;
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
        const nominee = gs.playerCandidate;
        const vpOptions = window.VPData.getOptionsForCandidate(nominee);
        const combined = [...vpOptions.curated, ...vpOptions.wildcard];

        const html = `
            <p class="text-muted mb-2">This is one of the most important decisions of your campaign. Your VP pick will affect your coalition, messaging, and electoral map for the rest of the race — and delivers a polling boost in their home state.</p>
            <div style="display:grid;gap:10px;">
                ${combined.map((vp, i) => `
                    <button class="btn action-btn" onclick="GameUI.pickVP(${i})" style="flex-direction:column;align-items:flex-start;padding:16px;">
                        <div style="font-weight:700;font-size:1rem;">${vp.name}</div>
                        <div style="font-size:0.8rem;color:var(--text-secondary);margin:4px 0;">${vp.description}</div>
                        <div style="font-size:0.75rem;color:var(--accent-green);">
                            ${this.formatVPEffects(vp.effects)}
                        </div>
                    </button>
                `).join('')}
            </div>`;

        this._vpOptions = combined;
        this.showModal('Choose Your Running Mate', html);
    },

    pickVP(index) {
        const vp = this._vpOptions[index];
        if (!vp) return;

        const result = window.GameEngine.processVPPick(vp);

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
                            <div class="poll-mini-${GameUI.getPlayerColorClass()}" style="width:${pct / (pct + opct) * 100}%"></div>
                            <div class="poll-mini-${GameUI.getOpponentColorClass()}" style="width:${opct / (pct + opct) * 100}%"></div>
                        </div>
                        <div class="poll-card-numbers">
                            <span class="text-${GameUI.getPlayerColorClass()}">${pct}%</span>
                            <span style="color:${margin > 0 ? 'var(--accent-green)' : 'var(--accent-red)'};font-weight:700;">${margin > 0 ? '+' : ''}${margin}</span>
                            <span class="text-${GameUI.getOpponentColorClass()}">${opct}%</span>
                        </div>
                    </div>`;
            }).join('')}
            <div id="state-detail-area"></div>`;
    },

    // ═══════════════════════════════════════════════
    // DEBATE SCREEN — news broadcast presentation
    // ═══════════════════════════════════════════════
    startDebate() {
        const gs = window.GameEngine.state;
        const DC = window.DebateContent;

        // Primary-phase debates are against your leading party rival
        const aliveRivals = gs.phase === 'primary' && gs.primary && !gs.primary.decided
            ? gs.primary.rivals.filter(r => !r.droppedOut) : [];
        const primaryMode = aliveRivals.length > 0;
        const oc = primaryMode
            ? aliveRivals.sort((a, b) => b.support - a.support)[0]
            : gs.opponentCandidate;

        // Opponent answer strategy: party + ideological lean (mirrors DebateSystem.generateResponses)
        const oppParty = oc.party === 'Democrat' ? 'democrat' : 'republican';
        const oppProgressive = (oc.ideologicalElasticity || 50) > 60;
        const opponentStrategy = oppParty === 'democrat'
            ? (oppProgressive ? 'democrat_progressive' : 'democrat_moderate')
            : (oppProgressive ? 'republican_conservative' : 'republican_moderate');

        const zeroScores = () => ({ viral: 0, donors: 0, press: 0, authenticity: 0, policy: 0, base: 0, suburban: 0 });
        this.debateCtx = {
            questions: window.EventSystem.DebateSystem.generateDebateQuestions(window.GameConstants.DEBATE_QUESTIONS_PER_ROUND),
            idx: 0,
            answered: false,
            playerScores: zeroScores(),
            opponentScores: zeroScores(),
            questionWins: { player: 0, opponent: 0, tie: 0 },
            moderator: DC.moderators[Math.floor(Math.random() * DC.moderators.length)],
            opponentStrategy,
            debateNumber: gs.debatesCompleted + 1,
            advanceTimer: null,
            primaryMode,
            debateOpponent: oc,
        };
        // Keep legacy field in sync for anything reading it
        this.debateScores = this.debateCtx.playerScores;

        this.showScreen('debate');

        // Continuation shared by the 3D walkout and the no-WebGL fallback
        const beginDebate = () => {
            this.renderDebateStage();
            this.appendTranscript('moderator', DC.moderatorIntros[Math.floor(Math.random() * DC.moderatorIntros.length)]);
            setTimeout(() => this.renderDebateExchange(), 700);
        };

        // Optional Three.js walkout intro; falls back instantly if unavailable
        const stage = document.getElementById('debate-stage');
        if (window.DebateWalkout && stage) {
            stage.innerHTML = '<div class="walkout-container" id="walkout-container"></div>';
            const container = document.getElementById('walkout-container');
            window.DebateWalkout.play(container, gs.playerCandidate, this.debateCtx.debateOpponent || gs.opponentCandidate, beginDebate);
        } else {
            beginDebate();
        }
    },

    renderDebateStage() {
        const stage = document.getElementById('debate-stage');
        const gs = window.GameEngine.state;
        const ctx = this.debateCtx;
        const pc = gs.playerCandidate;
        const oc = ctx.debateOpponent || gs.opponentCandidate;
        const pLast = pc.name.split(' ').pop();
        const oLast = oc.name.split(' ').pop();

        stage.innerHTML = `
            <div class="debate-broadcast">
                <div class="broadcast-header">
                    <div class="network-bug">${ctx.moderator.network} <span class="bug-divider">|</span> DECISION 2028</div>
                    <div class="broadcast-title">PRESIDENTIAL DEBATE ${ctx.debateNumber} OF ${window.GameConstants.DEBATE_WEEKS.length}</div>
                    <div class="live-indicator"><span class="live-dot"></span>LIVE</div>
                </div>
                <div class="debate-stage-set">
                    <div class="stage-backdrop-stripes"></div>
                    <div class="debate-podium player" id="podium-player">
                        <div class="podium-avatar" style="border-color:${pc.color};box-shadow:0 0 18px ${pc.color}55;">${pc.portraitEmoji}</div>
                        <div class="podium-desk"></div>
                        <div class="podium-name-plate">${pLast.toUpperCase()} <span class="plate-you">(YOU)</span></div>
                    </div>
                    <div class="debate-moderator">
                        <div class="moderator-avatar">🎙️</div>
                        <div class="moderator-desk"></div>
                        <div class="moderator-name">${ctx.moderator.name}<br><span class="moderator-role">MODERATOR</span></div>
                    </div>
                    <div class="debate-podium opponent" id="podium-opponent">
                        <div class="podium-avatar" style="border-color:${oc.color};box-shadow:0 0 18px ${oc.color}55;">${oc.portraitEmoji}</div>
                        <div class="podium-desk"></div>
                        <div class="podium-name-plate">${oLast.toUpperCase()}</div>
                    </div>
                </div>
                <div class="debate-chyron" id="debate-chyron"></div>
                <div class="debate-meter-row" id="debate-meter-row">
                    <span class="meter-tally" id="debate-tally">DEBATE SCORE — ${pLast.toUpperCase()} 0 · 0 ${oLast.toUpperCase()}</span>
                </div>
                <div class="debate-transcript" id="debate-transcript"></div>
                <div class="debate-choice-area" id="debate-choice-area"></div>
            </div>`;
    },

    appendTranscript(speaker, text, reaction) {
        const log = document.getElementById('debate-transcript');
        if (!log) return;
        const gs = window.GameEngine.state;
        const ctx = this.debateCtx;

        let chipHTML, lineClass;
        if (speaker === 'moderator') {
            lineClass = 'moderator';
            chipHTML = `<span class="speaker-chip moderator-chip">🎙️ ${ctx.moderator.name.toUpperCase()}</span>`;
        } else if (speaker === 'player') {
            const c = gs.playerCandidate;
            lineClass = 'player';
            chipHTML = `<span class="speaker-chip" style="color:${c.color};">${c.portraitEmoji} ${c.name.split(' ').pop().toUpperCase()} (YOU)</span>`;
        } else {
            const c = ctx.debateOpponent || gs.opponentCandidate;
            lineClass = 'opponent';
            chipHTML = `<span class="speaker-chip" style="color:${c.color};">${c.portraitEmoji} ${c.name.split(' ').pop().toUpperCase()}</span>`;
        }

        const line = document.createElement('div');
        line.className = `transcript-line ${lineClass}`;
        line.innerHTML = `${chipHTML}<div class="transcript-text">${text}</div>` +
            (reaction ? `<div class="transcript-reaction">${reaction}</div>` : '');
        log.appendChild(line);
        log.scrollTop = log.scrollHeight;

        // Speaking pulse on the active podium
        document.querySelectorAll('.podium-avatar.speaking').forEach(el => el.classList.remove('speaking'));
        const podium = speaker === 'player' ? 'podium-player' : speaker === 'opponent' ? 'podium-opponent' : null;
        if (podium) {
            const avatar = document.querySelector(`#${podium} .podium-avatar`);
            if (avatar) avatar.classList.add('speaking');
        }
    },

    renderDebateExchange() {
        const ctx = this.debateCtx;
        const q = ctx.questions[ctx.idx];
        ctx.answered = false;

        // Chyron lower-third slides in with the topic
        const chyron = document.getElementById('debate-chyron');
        chyron.innerHTML = `
            <div class="chyron-inner">
                <span class="chyron-tab">QUESTION ${ctx.idx + 1} OF ${ctx.questions.length}</span>
                <span class="chyron-topic">${q.topic.toUpperCase()}</span>
            </div>`;

        this.appendTranscript('moderator', `"${q.question}"`);

        const choiceArea = document.getElementById('debate-choice-area');
        choiceArea.innerHTML = `
            <div class="choice-prompt">YOUR RESPONSE:</div>
            <div class="debate-responses">
                ${q.responses.map((r, i) => `
                    <button class="debate-response debate-response-card" onclick="GameUI.handleDebateResponse(${i})">
                        <div class="debate-response-copy">${r.text}</div>
                        <span class="choice-risk risk-${r.riskLevel}" style="display:inline-block;margin-top:8px;">${r.riskLevel}</span>
                    </button>
                `).join('')}
            </div>`;
    },

    handleDebateResponse(responseIdx) {
        const ctx = this.debateCtx;
        if (!ctx || ctx.answered) return;
        ctx.answered = true;

        const gs = window.GameEngine.state;
        const q = ctx.questions[ctx.idx];
        const response = q.responses[responseIdx];

        // Player's answer enters the transcript and the scorebook
        let playerQScore = 0;
        for (const [key, val] of Object.entries(response.effects)) {
            if (ctx.playerScores.hasOwnProperty(key)) {
                ctx.playerScores[key] += val;
                playerQScore += val;
            }
        }

        // Platform consistency: an answer's intensity should match how strongly
        // you've positioned on that issue (0 = measured, 1 = combative, 2 = bold)
        const TOPIC_ISSUE = { 'Economy': 'economy', 'Immigration': 'immigration', 'Healthcare': 'healthcare', 'Climate & Energy': 'energy', 'Culture & Values': 'cultureWar' };
        const TOPIC_INTENSITY = {
            'Economy': [0, 0, 1, 2], 'Immigration': [0, 0, 1, 2], 'Healthcare': [0, 0, 2, 1],
            'Democracy & Institutions': [0, 1, 1, 2], 'Climate & Energy': [0, 2, 0, 1], 'Culture & Values': [0, 2, 0, 1],
        };
        let consistencyNote = '';
        const issueKey = TOPIC_ISSUE[q.topic];
        if (issueKey && gs.platform && TOPIC_INTENSITY[q.topic]) {
            const stanceMag = Math.abs(gs.platform[issueKey] || 0);
            const intensity = TOPIC_INTENSITY[q.topic][responseIdx];
            if ((intensity === 2 && stanceMag >= 1.5) || (intensity === 0 && stanceMag <= 1)) {
                ctx.playerScores.authenticity += 2; playerQScore += 2;
                consistencyNote = 'The answer rings true — it matches the candidate\'s platform.';
            } else if ((intensity === 2 && stanceMag <= 0.5) || (intensity === 0 && stanceMag >= 2)) {
                ctx.playerScores.authenticity -= 2; playerQScore -= 2;
                consistencyNote = 'Pundits note the answer clashes with the candidate\'s stated platform.';
            }
        }
        this.appendTranscript('player', response.text, consistencyNote);

        const choiceArea = document.getElementById('debate-choice-area');
        choiceArea.querySelectorAll('.debate-response').forEach(b => { b.disabled = true; b.classList.add('dimmed'); });

        // Opponent responds after a beat
        setTimeout(() => {
            const DC = window.DebateContent;
            const pool = DC.opponentResponses[q.topic] || DC.genericResponses;
            const line = pool[ctx.opponentStrategy] || DC.genericResponses[ctx.opponentStrategy];

            // Normalize to the player's scale (content lines score all 7 dimensions,
            // player answers only ~6) and let debate skill scale the whole answer
            const oppSkill = ctx.primaryMode && ctx.debateOpponent ? (ctx.debateOpponent.debate || 55) : gs.opponent.debateSkill;
            const skillFactor = 0.7 * (1 + (oppSkill - 50) / 150);
            let oppQScore = 0;
            for (const [key, val] of Object.entries(line.scores)) {
                if (ctx.opponentScores.hasOwnProperty(key)) {
                    const adjusted = Math.round(val * skillFactor * 10) / 10;
                    ctx.opponentScores[key] += adjusted;
                    oppQScore += adjusted;
                }
            }
            this.appendTranscript('opponent', line.text);

            setTimeout(() => this.showQuestionVerdict(playerQScore, oppQScore), 900);
        }, 1200);
    },

    showQuestionVerdict(playerQScore, oppQScore) {
        const ctx = this.debateCtx;
        const gs = window.GameEngine.state;
        const DC = window.DebateContent;
        const pc = gs.playerCandidate;
        const oc = ctx.debateOpponent || gs.opponentCandidate;
        const pLast = pc.name.split(' ').pop();
        const oLast = oc.name.split(' ').pop();

        let verdict, reactionPool;
        if (playerQScore > oppQScore + 3) { verdict = 'player'; reactionPool = DC.audienceReactions.strong; }
        else if (oppQScore > playerQScore + 3) { verdict = 'opponent'; reactionPool = DC.audienceReactions.weak; }
        else { verdict = 'tie'; reactionPool = DC.audienceReactions.neutral; }
        ctx.questionWins[verdict]++;

        const reaction = reactionPool[Math.floor(Math.random() * reactionPool.length)];
        const total = Math.max(1, Math.max(0, playerQScore) + Math.max(0, oppQScore));
        const pPct = Math.round((Math.max(0, playerQScore) / total) * 100);

        const meterRow = document.getElementById('debate-meter-row');
        meterRow.innerHTML = `
            <div class="audience-meter">
                <span class="meter-name" style="color:${pc.color};">${pLast.toUpperCase()}</span>
                <div class="meter-track">
                    <div class="meter-fill player" style="width:${pPct}%;background:${pc.color};"></div>
                    <div class="meter-fill opponent" style="width:${100 - pPct}%;background:${oc.color};"></div>
                </div>
                <span class="meter-name" style="color:${oc.color};">${oLast.toUpperCase()}</span>
            </div>
            <div class="meter-reaction">${reaction}</div>
            <span class="meter-tally" id="debate-tally">DEBATE SCORE — ${pLast.toUpperCase()} ${ctx.questionWins.player} · ${ctx.questionWins.opponent} ${oLast.toUpperCase()}${ctx.questionWins.tie ? ` (${ctx.questionWins.tie} EVEN)` : ''}</span>`;

        // Continue button + auto-advance
        const choiceArea = document.getElementById('debate-choice-area');
        choiceArea.innerHTML = `<button class="btn btn-primary" id="debate-continue-btn" onclick="GameUI.nextDebateQuestion()">${ctx.idx + 1 >= ctx.questions.length ? 'CLOSING — GO TO COVERAGE' : 'NEXT QUESTION'} →</button>`;
        ctx.advanceTimer = setTimeout(() => this.nextDebateQuestion(), 3500);
    },

    nextDebateQuestion() {
        const ctx = this.debateCtx;
        if (!ctx) return;
        if (ctx.advanceTimer) { clearTimeout(ctx.advanceTimer); ctx.advanceTimer = null; }

        ctx.idx++;
        if (ctx.idx >= ctx.questions.length) {
            this.showDebateResults();
        } else {
            this.renderDebateExchange();
        }
    },

    showDebateResults() {
        const ctx = this.debateCtx;
        const gs = window.GameEngine.state;
        const DC = window.DebateContent;
        const pc = gs.playerCandidate;
        const oc = ctx.debateOpponent || gs.opponentCandidate;
        const pLast = pc.name.split(' ').pop();
        const oLast = oc.name.split(' ').pop();

        // Head-to-head verdict from the (frozen) DebateSystem
        const winner = window.DebateSystem.calculateWinner(ctx.playerScores, ctx.opponentScores);
        const result = window.GameEngine.processDebateResults(ctx.playerScores, ctx.opponentScores, winner, { primaryMode: ctx.primaryMode });

        const winnerName = winner === 'player' ? pLast : winner === 'opponent' ? oLast : null;
        const loserName = winner === 'player' ? oLast : winner === 'opponent' ? pLast : null;

        // Snap poll: score gap plus polling noise
        const pTotal = Object.values(ctx.playerScores).reduce((a, b) => a + b, 0);
        const oTotal = Object.values(ctx.opponentScores).reduce((a, b) => a + b, 0);
        const gap = pTotal - oTotal;
        const snapPlayer = Math.max(32, Math.min(68, Math.round(50 + gap * 0.35 + (Math.random() - 0.5) * 4)));
        const snapOutlet = DC.snapPollOutlets[Math.floor(Math.random() * DC.snapPollOutlets.length)];

        const quotePool = winner === 'player' ? DC.punditQuotes.playerWin :
                          winner === 'opponent' ? DC.punditQuotes.opponentWin : DC.punditQuotes.tie;
        const quotes = [...quotePool].sort(() => Math.random() - 0.5).slice(0, 2)
            .map(qt => qt.replace(/{WINNER}/g, winnerName || pLast).replace(/{LOSER}/g, loserName || oLast));

        const dims = ['policy', 'authenticity', 'viral', 'press', 'base', 'suburban', 'donors'];
        const dimLabels = { policy: 'Policy', authenticity: 'Authenticity', viral: 'Viral', press: 'Press', base: 'Base', suburban: 'Suburban', donors: 'Donors' };
        const scoreboardHTML = dims.map(d => {
            const p = Math.round(ctx.playerScores[d]);
            const o = Math.round(ctx.opponentScores[d]);
            const leader = p > o ? 'player' : o > p ? 'opponent' : 'tie';
            return `<div class="debate-score-item">
                <div class="score-val"><span style="color:${leader === 'player' ? pc.color : 'var(--text-secondary)'}">${p}</span> <span class="score-vs">/</span> <span style="color:${leader === 'opponent' ? oc.color : 'var(--text-secondary)'}">${o}</span></div>
                <div class="score-label">${dimLabels[d]}</div>
            </div>`;
        }).join('');

        const bannerClass = winner === 'player' ? this.getPlayerColorClass() : winner === 'opponent' ? this.getOpponentColorClass() : 'tie';
        const bannerText = winner === 'tie' ? 'NO CLEAR WINNER — PUNDITS SPLIT' :
            `${(winnerName || '').toUpperCase()} WINS THE DEBATE`;

        const stage = document.getElementById('debate-stage');
        stage.innerHTML = `
            <div class="debate-broadcast debate-coverage">
                <div class="broadcast-header">
                    <div class="network-bug">${ctx.moderator.network} <span class="bug-divider">|</span> POST-DEBATE COVERAGE</div>
                    <div class="broadcast-title">DEBATE ${ctx.debateNumber} ANALYSIS</div>
                    <div class="live-indicator"><span class="live-dot"></span>LIVE</div>
                </div>
                <div class="coverage-verdict-banner ${bannerClass}-call">${bannerText}</div>
                <div class="snap-poll">
                    <div class="snap-poll-title">${snapOutlet.toUpperCase()} — "WHO WON TONIGHT'S DEBATE?"</div>
                    <div class="snap-poll-bar">
                        <div class="snap-poll-side" style="width:${snapPlayer}%;background:${pc.color};">${pLast} ${snapPlayer}%</div>
                        <div class="snap-poll-side" style="width:${100 - snapPlayer}%;background:${oc.color};">${oLast} ${100 - snapPlayer}%</div>
                    </div>
                </div>
                <div class="pundit-quotes">
                    ${quotes.map(qt => `<div class="pundit-quote">${qt}</div>`).join('')}
                </div>
                <div class="debate-scoreboard coverage-scoreboard">${scoreboardHTML}</div>
                <div class="coverage-tally">
                    QUESTIONS — ${pLast.toUpperCase()}: ${ctx.questionWins.player} &nbsp;·&nbsp; ${oLast.toUpperCase()}: ${ctx.questionWins.opponent} &nbsp;·&nbsp; EVEN: ${ctx.questionWins.tie}
                    <div class="coverage-assessment">Campaign verdict: <strong>${result.assessment}</strong></div>
                </div>
                <button class="btn btn-primary btn-lg mt-2" onclick="GameUI.returnFromDebate()">RETURN TO CAMPAIGN</button>
            </div>`;

        this.updateTicker([
            winner === 'tie' ? `DEBATE ${ctx.debateNumber}: PUNDITS SPLIT ON WINNER` :
                `DEBATE ${ctx.debateNumber}: ${(winnerName || '').toUpperCase()} DECLARED WINNER IN SNAP POLLS`,
        ]);
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
        const gs = window.GameEngine.state;
        const results = nightData.results;
        const calls = nightData.calls;
        const pLast = results.playerName.split(' ').pop();
        const oLast = results.opponentName.split(' ').pop();

        // Build the night's feed schedule: poll-close waves, too-close notices, projections
        const schedule = [];
        const waveMinutes = { '7:00 PM': 0, '7:30 PM': 30, '8:00 PM': 60, '9:00 PM': 120, '10:00 PM': 180, '11:00 PM': 240, '1:00 AM': 360 };
        for (const [label, ids] of Object.entries(window.GameConstants.POLL_CLOSE_TIMES)) {
            schedule.push({ t: waveMinutes[label], type: 'wave', label, count: ids.length });
        }
        for (const call of calls) {
            if (call.tooCloseToCall) schedule.push({ t: call.closeMinutes + 5, type: 'tooclose', call });
            schedule.push({ t: call.callMinutes, type: 'call', call });
        }
        schedule.sort((a, b) => a.t - b.t);

        this.enCtx = {
            schedule, idx: 0, sim: 0,
            playerEV: 0, oppEV: 0,
            results, projected: false, timer: null,
            totalVotes: 152000000 + Math.floor(Math.random() * 8000000),
            calledCount: 0, totalCalls: calls.length,
        };

        const uncalledFill = () => '#3a4560';
        container.innerHTML = `
            <div class="en-broadcast">
                <div class="broadcast-header en-broadcast-header">
                    <div class="network-bug">GNN <span class="bug-divider">|</span> ELECTION NIGHT IN AMERICA</div>
                    <div class="en-clock" id="en-clock">7:00 PM ET</div>
                    <div class="live-indicator"><span class="live-dot"></span>LIVE</div>
                </div>
                <div class="en-ev-bar-wrap">
                    <div class="en-ev-names">
                        <span class="text-${this.getPlayerColorClass()}"><strong id="en-player-ev">0</strong> ${pLast.toUpperCase()}</span>
                        <span class="en-ev-needed">270 TO WIN</span>
                        <span class="text-${this.getOpponentColorClass()}">${oLast.toUpperCase()} <strong id="en-opp-ev">0</strong></span>
                    </div>
                    <div class="en-ev-bar">
                        <div class="en-ev-fill player" id="en-ev-fill-player" style="background:${this.getPlayerColorVar()};"></div>
                        <div class="en-ev-fill opponent" id="en-ev-fill-opponent" style="background:${this.getOpponentColorVar()};"></div>
                        <div class="en-ev-marker"></div>
                    </div>
                </div>
                <div class="key-race-alert" id="key-race-alert"></div>
                <div class="en-main">
                    <div class="en-map-wrap">${this.buildSVGMap(gs, { fillOverride: uncalledFill })}</div>
                    <div class="en-feed-col">
                        <div class="en-feed-title">RACE CALLS</div>
                        <div class="en-feed" id="en-feed"></div>
                    </div>
                </div>
                <div class="en-popvote" id="en-popvote">POPULAR VOTE — COUNTING FIRST RESULTS…</div>
                <div style="text-align:center;margin-top:10px;">
                    <button class="btn btn-sm" id="en-skip-btn" onclick="GameUI.skipElectionNight()">SKIP AHEAD ⏩</button>
                </div>
                <div id="en-winner-banner"></div>
            </div>`;

        // 1 sim-hour ≈ 6 seconds
        this.enCtx.timer = setInterval(() => this.tickElectionNight(2), 200);
    },

    tickElectionNight(minutes) {
        const ctx = this.enCtx;
        if (!ctx) return;
        const lastT = ctx.schedule.length ? ctx.schedule[ctx.schedule.length - 1].t : 0;
        ctx.sim = Math.min(ctx.sim + minutes, lastT + 5);

        // Clock
        const clockEl = document.getElementById('en-clock');
        if (clockEl) {
            const total = 19 * 60 + ctx.sim; // 7:00 PM start
            const h24 = Math.floor(total / 60) % 24;
            const m = total % 60;
            const h12 = ((h24 + 11) % 12) + 1;
            clockEl.textContent = `${h12}:${String(m).padStart(2, '0')} ${h24 >= 12 ? 'PM' : 'AM'} ET`;
        }

        // Process due feed items
        while (ctx.idx < ctx.schedule.length && ctx.schedule[ctx.idx].t <= ctx.sim) {
            this.processElectionNightItem(ctx.schedule[ctx.idx]);
            ctx.idx++;
        }

        // Popular vote counter interpolates with counted share
        const counted = Math.min(1, 0.05 + (ctx.calledCount / ctx.totalCalls) * 0.95);
        const pv = ctx.results.nationalPopularVote;
        const totalCast = Math.floor(ctx.totalVotes * counted);
        const pShare = pv.player / (pv.player + pv.opponent);
        const popEl = document.getElementById('en-popvote');
        if (popEl) {
            popEl.textContent = `POPULAR VOTE (${Math.round(counted * 100)}% REPORTING) — ` +
                `${ctx.results.playerName.split(' ').pop().toUpperCase()}: ${Math.floor(totalCast * pShare).toLocaleString()} · ` +
                `${ctx.results.opponentName.split(' ').pop().toUpperCase()}: ${Math.floor(totalCast * (1 - pShare)).toLocaleString()}`;
        }

        if (ctx.idx >= ctx.schedule.length) {
            clearInterval(ctx.timer);
            ctx.timer = null;
            const skipBtn = document.getElementById('en-skip-btn');
            if (skipBtn) skipBtn.style.display = 'none';
            setTimeout(() => this.showWinner(ctx.results), 800);
        }
    },

    processElectionNightItem(item) {
        const ctx = this.enCtx;
        const feed = document.getElementById('en-feed');
        if (!feed) return;
        const pLast = ctx.results.playerName.split(' ').pop();
        const oLast = ctx.results.opponentName.split(' ').pop();

        if (item.type === 'wave') {
            const el = document.createElement('div');
            el.className = 'en-feed-wave';
            el.textContent = `${item.label} — POLLS CLOSE IN ${item.count} ${item.count === 1 ? 'STATE' : 'STATES'}`;
            feed.prepend(el);
            return;
        }

        if (item.type === 'tooclose') {
            const el = document.createElement('div');
            el.className = 'state-call tooclose-call';
            el.innerHTML = `⚖️ ${item.call.stateName.toUpperCase()} — TOO CLOSE TO CALL`;
            feed.prepend(el);
            return;
        }

        // Projection
        const call = item.call;
        const isPlayer = call.winner === 'player';
        if (isPlayer) ctx.playerEV += call.ev; else ctx.oppEV += call.ev;
        ctx.calledCount++;

        const winnerLast = isPlayer ? pLast : oLast;
        const callClass = isPlayer ? this.getPlayerColorClass() : this.getOpponentColorClass();
        const el = document.createElement('div');
        el.className = `state-call ${callClass}-call`;
        el.innerHTML = `GNN PROJECTS: <strong>${call.stateName.toUpperCase()}</strong> — ${winnerLast.toUpperCase()} <span class="call-ev">${call.ev} EV</span>`;
        feed.prepend(el);

        // Color the state on the map (path + side chip)
        const fill = isPlayer ? this.getPartyMapColor(this.getPlayerColorClass()) : this.getPartyMapColor(this.getOpponentColorClass());
        const path = document.querySelector(`.en-map-wrap .state-path[data-state="${call.stateId}"]`);
        if (path) path.setAttribute('fill', fill);
        const chip = document.querySelector(`.en-map-wrap .map-side-chip[data-state="${call.stateId}"] rect`);
        if (chip) chip.setAttribute('fill', fill);

        // EV counters + race bar
        const pEl = document.getElementById('en-player-ev');
        const oEl = document.getElementById('en-opp-ev');
        if (pEl) pEl.textContent = ctx.playerEV;
        if (oEl) oEl.textContent = ctx.oppEV;
        const pFill = document.getElementById('en-ev-fill-player');
        const oFill = document.getElementById('en-ev-fill-opponent');
        if (pFill) pFill.style.width = `${(ctx.playerEV / 538) * 100}%`;
        if (oFill) oFill.style.width = `${(ctx.oppEV / 538) * 100}%`;

        // Key race alert for battlegrounds
        const st = window.StateData.find(s => s.id === call.stateId);
        if (st && st.isBattleground) {
            const alertEl = document.getElementById('key-race-alert');
            if (alertEl) {
                alertEl.innerHTML = `
                    <div class="chyron-inner">
                        <span class="chyron-tab">KEY RACE ALERT</span>
                        <span class="chyron-topic">GNN PROJECTS ${call.stateName.toUpperCase()}: ${winnerLast.toUpperCase()} +${call.margin}</span>
                    </div>`;
                clearTimeout(this._keyRaceTimer);
                this._keyRaceTimer = setTimeout(() => { if (alertEl) alertEl.innerHTML = ''; }, 3500);
            }
        }

        // Winner projection the moment someone crosses 270
        if (!ctx.projected && (ctx.playerEV >= 270 || ctx.oppEV >= 270)) {
            ctx.projected = true;
            const banner = document.getElementById('en-winner-banner');
            if (banner) {
                const winName = ctx.playerEV >= 270 ? pLast : oLast;
                const total = 19 * 60 + ctx.sim;
                const h24 = Math.floor(total / 60) % 24;
                const h12 = ((h24 + 11) % 12) + 1;
                const callTime = `${h12}:${String(total % 60).padStart(2, '0')} ${h24 >= 12 ? 'PM' : 'AM'} ET`;
                banner.innerHTML = `<div class="en-projection-flash">🚨 GNN PROJECTION (${callTime}): <strong>${winName.toUpperCase()} ELECTED PRESIDENT</strong> — COUNTING CONTINUES…</div>`;
            }
        }
    },

    skipElectionNight() {
        const ctx = this.enCtx;
        if (!ctx) return;
        // Fast-forward the whole night
        this.tickElectionNight(24 * 60);
    },

    getPartyMapColor(partyClass) {
        return partyClass === 'dem' ? '#2166d4' : '#d42121';
    },

    showWinner(results) {
        const banner = document.getElementById('en-winner-banner');
        const gs = window.GameEngine.state;
        const isPlayerWin = results.winner === 'player';
        const winnerName = isPlayerWin ? results.playerName : results.opponentName;
        const winnerEV = isPlayerWin ? results.playerEV : results.opponentEV;
        const winnerParty = isPlayerWin ? this.getPlayerColorClass() : this.getOpponentColorClass();
        const winClass = winnerParty + '-winner';

        // Campaign retrospective
        const debatesWon = (gs.debateHistory || []).filter(d => d.winner === 'player').length;
        const debatesTotal = (gs.debateHistory || []).length;
        const endorsementCount = (gs.endorsements || []).length;
        const oppEndorsementCount = (gs.opponentEndorsements || []).length;
        const vpName = gs.vpChoice ? (gs.vpChoice.name || gs.vpChoice) : '—';

        banner.innerHTML = `
            <div class="winner-banner ${winClass}">
                <h2>${isPlayerWin ? '🎉 VICTORY!' : '😞 DEFEAT'}</h2>
                <p style="font-size:1.3rem;margin-bottom:0.5rem;">${winnerName} wins the presidency with ${winnerEV} electoral votes!</p>
                <p class="text-muted">Popular vote: ${results.playerName} ${Math.round(results.nationalPopularVote.player)}% — ${results.opponentName} ${Math.round(results.nationalPopularVote.opponent)}%</p>
                <div class="en-retro">
                    <div class="en-retro-title">CAMPAIGN RETROSPECTIVE</div>
                    <div class="en-retro-grid">
                        <div class="en-retro-item"><div class="retro-val">${results.playerEV}</div><div class="retro-label">Electoral Votes</div></div>
                        <div class="en-retro-item"><div class="retro-val">${debatesWon}/${debatesTotal}</div><div class="retro-label">Debates Won</div></div>
                        <div class="en-retro-item"><div class="retro-val">${endorsementCount} vs ${oppEndorsementCount}</div><div class="retro-label">Endorsements</div></div>
                        <div class="en-retro-item"><div class="retro-val">$${this.formatMoney(gs.finances.totalRaised)}</div><div class="retro-label">Total Raised</div></div>
                        <div class="en-retro-item"><div class="retro-val">${vpName}</div><div class="retro-label">Running Mate</div></div>
                    </div>
                </div>
                <div class="mt-2 btn-group" style="justify-content:center;">
                    <button class="btn btn-primary btn-lg" onclick="GameUI.startNewGame()">PLAY AGAIN</button>
                    <button class="btn btn-lg" onclick="GameUI.showScreen('title')">MAIN MENU</button>
                </div>
            </div>`;
        banner.scrollIntoView({ behavior: 'smooth', block: 'center' });

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
