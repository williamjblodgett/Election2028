/**
 * Election 2028 — expanded modern political bench.
 * Adds presidential contenders, curated running mates, and one additional
 * option for every transition post. Ratings are game-balance abstractions.
 */
(function expandPoliticalBench() {
    const statKeys = [
        'charisma','debate','fundraising','discipline','mediaHandling','baseEnthusiasm',
        'crossoverAppeal','scandalResistance','staffCompetence','meltdownRisk',
        'ideologicalElasticity','donorTrust','authenticity','eliteSupport',
        'viralPotential','fatigueFactor',
    ];
    const candidate = (party, data, stats) => {
        const profile = { ...data, party, isWildcard:false };
        statKeys.forEach((key, index) => { profile[key] = stats[index]; });
        return profile;
    };

    const presidential = {
        democrats: [
            candidate('Democrat', { id:'pritzker', name:'J.B. Pritzker', title:'Governor of Illinois', age:63, homeState:'Illinois', slogan:'Think Big. Get Things Done.', color:'#3158a5', portraitEmoji:'🏙️', bio:'A large-state executive with a national donor network and a combative case for Democratic governance.', strengths:['Executive record on budgets and infrastructure','Can self-fund and build a national organization quickly','Comfortable taking the fight directly to Republicans'], vulnerabilities:['Immense personal wealth complicates an economic-populist message','Midwestern executive record draws heavy national scrutiny'] }, [76,74,96,86,78,74,68,78,90,18,72,92,70,86,68,30]),
            candidate('Democrat', { id:'booker', name:'Cory Booker', title:'U.S. Senator from New Jersey', age:59, homeState:'New Jersey', slogan:'Rise Together', color:'#4b58b5', portraitEmoji:'🌇', bio:'A veteran senator and former mayor running on optimism, coalition politics, and energetic retail campaigning.', strengths:['Exceptional retail campaigner and optimistic speaker','Deep relationships across the party','Strong criminal-justice and urban-policy résumé'], vulnerabilities:['Previous presidential campaign failed to break through','Optimistic style can feel mismatched to an angry electorate'] }, [90,82,80,82,88,86,72,82,80,15,72,80,88,88,82,24]),
            candidate('Democrat', { id:'polis', name:'Jared Polis', title:'Governor of Colorado', age:53, homeState:'Colorado', slogan:'Freedom That Works', color:'#2871a8', portraitEmoji:'🏔️', bio:'A technology-minded western governor offering fiscal pragmatism, social liberalism, and an executive record.', strengths:['Distinct western-libertarian political profile','Executive experience and policy fluency','Can compete for younger and independent voters'], vulnerabilities:['Low national name recognition at launch','Wealth and technocratic instincts can create distance from voters'] }, [74,78,88,88,72,70,84,84,88,10,86,84,70,76,64,22]),
            candidate('Democrat', { id:'khanna', name:'Ro Khanna', title:'U.S. Representative from California', age:52, homeState:'California', slogan:'Renew American Prosperity', color:'#386cb0', portraitEmoji:'💻', bio:'A Silicon Valley progressive pitching industrial policy, technology leadership, and economic patriotism.', strengths:['Detailed economic and technology agenda','Strong digital and donor networks','Can bridge some progressive and business constituencies'], vulnerabilities:['Limited executive experience','California and technology-industry ties invite populist attacks'] }, [76,84,86,76,80,72,68,76,74,22,82,78,74,70,86,28]),
            candidate('Democrat', { id:'gallego', name:'Ruben Gallego', title:'U.S. Senator from Arizona', age:49, homeState:'Arizona', slogan:'Fight for Every Family', color:'#2d65a8', portraitEmoji:'🪖', bio:'A Marine veteran and Sun Belt senator emphasizing working-class roots, border-state credibility, and toughness.', strengths:['Veteran biography and working-class message','Immediate credibility in a decisive battleground','Strong appeal to Latino and younger voters'], vulnerabilities:['Short national résumé','Blunt style can generate avoidable news cycles'] }, [82,76,72,78,74,84,80,74,76,22,70,68,88,68,78,28]),
            candidate('Democrat', { id:'slotkin', name:'Elissa Slotkin', title:'U.S. Senator from Michigan', age:52, homeState:'Michigan', slogan:'Mission Before Politics', color:'#4762a5', portraitEmoji:'🛰️', bio:'A national-security veteran and Midwestern senator arguing for competence, service, and battleground-tested moderation.', strengths:['National-security and intelligence experience','Proven campaign strength in competitive Michigan','Disciplined moderate profile'], vulnerabilities:['Foreign-policy establishment ties can frustrate the left','Reserved style produces fewer viral moments'] }, [70,78,76,92,74,66,86,88,92,8,78,76,76,74,54,18]),
        ],
        republicans: [
            candidate('Republican', { id:'hawley', name:'Josh Hawley', title:'U.S. Senator from Missouri', age:49, homeState:'Missouri', slogan:'Strength for the Working Class', color:'#ae3a3a', portraitEmoji:'🥊', bio:'A populist senator blending culture-war combat, antitrust themes, and a working-class economic pitch.', strengths:['Aggressive and disciplined conservative communicator','Clear populist economic identity','Strong appeal to activist media'], vulnerabilities:['Polarizing national profile','Past election-certification conduct dominates opposition research'] }, [82,86,80,82,84,90,42,52,78,38,50,82,74,78,88,34]),
            candidate('Republican', { id:'cotton', name:'Tom Cotton', title:'U.S. Senator from Arkansas', age:51, homeState:'Arkansas', slogan:'Secure America', color:'#9e3434', portraitEmoji:'🦅', bio:'An Army veteran and senator running as the field’s most disciplined national-security conservative.', strengths:['Deep command of defense and foreign policy','Highly disciplined campaign style','Strong institutional and donor support'], vulnerabilities:['Hawkish image carries escalation risk','Severe presentation can struggle with softer swing voters'] }, [68,82,82,94,72,76,58,82,92,8,54,86,66,88,52,18]),
            candidate('Republican', { id:'cruz', name:'Ted Cruz', title:'U.S. Senator from Texas', age:58, homeState:'Texas', slogan:'Conservative Without Apology', color:'#b53d35', portraitEmoji:'⭐', bio:'A nationally known senator offering ideological combat, debate skill, and a ready-made conservative organization.', strengths:['Elite debate and message discipline','National fundraising and activist networks','Extensive presidential campaign experience'], vulnerabilities:['High unfavorable ratings outside the base','Long record of feuds supplies endless attack material'] }, [78,94,90,84,86,92,36,52,82,40,38,88,70,86,90,36]),
            candidate('Republican', { id:'noem', name:'Kristi Noem', title:'Governor of South Dakota', age:57, homeState:'South Dakota', slogan:'Freedom. Strength. Results.', color:'#b74444', portraitEmoji:'🐎', bio:'A plains-state governor and national conservative surrogate selling executive action, border politics, and rural identity.', strengths:['Executive experience and strong base recognition','Effective conservative-media presence','Distinct rural and western profile'], vulnerabilities:['Personal controversies create persistent opposition material','Limited crossover appeal in metropolitan battlegrounds'] }, [80,72,82,80,84,88,40,42,78,48,48,84,72,78,86,38]),
            candidate('Republican', { id:'donalds', name:'Byron Donalds', title:'U.S. Representative from Florida', age:50, homeState:'Florida', slogan:'A New Conservative Generation', color:'#a43f32', portraitEmoji:'🌴', bio:'A high-energy House conservative pitching generational change, economic mobility, and media-ready populism.', strengths:['Strong television and surrogate skills','Generational contrast with broad base enthusiasm','Compelling personal and economic story'], vulnerabilities:['Thin executive and national-security record','House voting record is easily nationalized'] }, [86,78,76,72,90,90,56,64,70,32,54,78,84,72,92,34]),
            candidate('Republican', { id:'sununu', name:'Chris Sununu', title:'Former Governor of New Hampshire', age:54, homeState:'New Hampshire', slogan:'Win Again', color:'#aa5140', portraitEmoji:'🍁', bio:'A pragmatic former governor arguing that Republican durability requires humor, independence, and suburban appeal.', strengths:['Repeated crossover victories','Executive experience and relaxed media style','Strong New Hampshire and independent-voter credibility'], vulnerabilities:['Moderate positions anger ideological activists','National fundraising network trails the frontrunners'] }, [84,76,70,88,88,58,94,86,84,12,92,64,82,60,72,20]),
        ],
    };

    for (const [party, additions] of Object.entries(presidential)) {
        const existing = new Set(window.CandidateData[party].map(item => item.id));
        window.CandidateData[party].push(...additions.filter(item => !existing.has(item.id)));
    }

    const vpProfiles = {
        democrat: {
            jb_pritzker: { id:'jb_pritzker', candidateId:'pritzker', party:'Democrat', name:'J.B. Pritzker', title:'Governor of Illinois', homeState:'Illinois', portraitEmoji:'🏙️', description:'A big-state executive with money, infrastructure credentials, and a national attack-dog profile.', effects:{ donorConfidence:5, groundGame:2, surrogateStrength:3 }, regionalTargets:['WI','MI','PA'], regionalBonus:.8, homeStateBonus:1.4, riskScore:2, announcementBias:1 },
            cory_booker: { id:'cory_booker', candidateId:'booker', party:'Democrat', name:'Cory Booker', title:'U.S. Senator from New Jersey', homeState:'New Jersey', portraitEmoji:'🌇', description:'An optimistic, high-energy surrogate with deep coalition relationships.', effects:{ enthusiasm:4, surrogateStrength:5, mediaScore:2 }, regionalTargets:['PA','GA','NC'], regionalBonus:.7, homeStateBonus:1.2, riskScore:1, announcementBias:1 },
            jared_polis: { id:'jared_polis', candidateId:'polis', party:'Democrat', name:'Jared Polis', title:'Governor of Colorado', homeState:'Colorado', portraitEmoji:'🏔️', description:'A western executive who adds independent appeal and technology fluency.', effects:{ persuadableSupport:4, onlineInfluence:3, donorConfidence:2 }, regionalTargets:['AZ','NV'], regionalBonus:1, homeStateBonus:1.8, riskScore:1, announcementBias:1 },
            ro_khanna: { id:'ro_khanna', candidateId:'khanna', party:'Democrat', name:'Ro Khanna', title:'U.S. Representative from California', homeState:'California', portraitEmoji:'💻', description:'A policy-heavy economic messenger with a powerful digital and technology network.', effects:{ onlineInfluence:5, donorConfidence:3, debateSkill:2 }, regionalTargets:['AZ','NV'], regionalBonus:.6, homeStateBonus:1, riskScore:2, announcementBias:0 },
            ruben_gallego: { id:'ruben_gallego', candidateId:'gallego', party:'Democrat', name:'Ruben Gallego', title:'U.S. Senator from Arizona', homeState:'Arizona', portraitEmoji:'🪖', description:'A Marine and border-state senator who can fight for the Sun Belt.', effects:{ groundGame:3, crossoverAppeal:3, baseTurnout:3 }, regionalTargets:['AZ','NV'], regionalBonus:1.2, homeStateBonus:3.6, riskScore:2, announcementBias:1 },
            elissa_slotkin: { id:'elissa_slotkin', candidateId:'slotkin', party:'Democrat', name:'Elissa Slotkin', title:'U.S. Senator from Michigan', homeState:'Michigan', portraitEmoji:'🛰️', description:'A disciplined national-security validator built for close Midwestern states.', effects:{ persuadableSupport:4, scandalVulnerability:-3, debateSkill:2 }, regionalTargets:['MI','WI','PA'], regionalBonus:1.1, homeStateBonus:3.3, riskScore:1, announcementBias:1 },
        },
        republican: {
            josh_hawley: { id:'josh_hawley', candidateId:'hawley', party:'Republican', name:'Josh Hawley', title:'U.S. Senator from Missouri', homeState:'Missouri', portraitEmoji:'🥊', description:'A combative populist who drives base attention and working-class messaging.', effects:{ enthusiasm:5, mediaScore:3, baseTurnout:3 }, regionalTargets:['WI','MI','PA'], regionalBonus:.7, homeStateBonus:1.3, riskScore:3, announcementBias:0 },
            tom_cotton: { id:'tom_cotton', candidateId:'cotton', party:'Republican', name:'Tom Cotton', title:'U.S. Senator from Arkansas', homeState:'Arkansas', portraitEmoji:'🦅', description:'A disciplined Army veteran who gives the ticket national-security weight.', effects:{ debateSkill:4, scandalVulnerability:-3, donorConfidence:2 }, regionalTargets:['GA','NC','VA'], regionalBonus:.7, homeStateBonus:1.2, riskScore:1, announcementBias:1 },
            ted_cruz: { id:'ted_cruz', candidateId:'cruz', party:'Republican', name:'Ted Cruz', title:'U.S. Senator from Texas', homeState:'Texas', portraitEmoji:'⭐', description:'A relentless debater with a national donor and activist network.', effects:{ debateSkill:5, donorConfidence:3, enthusiasm:3 }, regionalTargets:['AZ','GA'], regionalBonus:.6, homeStateBonus:1.4, riskScore:3, announcementBias:0 },
            kristi_noem: { id:'kristi_noem', candidateId:'noem', party:'Republican', name:'Kristi Noem', title:'Governor of South Dakota', homeState:'South Dakota', portraitEmoji:'🐎', description:'A rural executive and conservative-media regular who energizes the base.', effects:{ baseTurnout:4, mediaScore:3, surrogateStrength:2 }, regionalTargets:['IA','WI'], regionalBonus:.6, homeStateBonus:1, riskScore:3, announcementBias:-1 },
            byron_donalds: { id:'byron_donalds', candidateId:'donalds', party:'Republican', name:'Byron Donalds', title:'U.S. Representative from Florida', homeState:'Florida', portraitEmoji:'🌴', description:'A younger, cable-ready populist who broadens the ticket’s biography.', effects:{ mediaScore:5, enthusiasm:4, onlineInfluence:3 }, regionalTargets:['GA','NC'], regionalBonus:.8, homeStateBonus:1.4, riskScore:2, announcementBias:0 },
            chris_sununu: { id:'chris_sununu', candidateId:'sununu', party:'Republican', name:'Chris Sununu', title:'Former Governor of New Hampshire', homeState:'New Hampshire', portraitEmoji:'🍁', description:'A pragmatic former governor who maximizes independent and suburban appeal.', effects:{ persuadableSupport:5, approval:3, scandalVulnerability:-2 }, regionalTargets:['NH','ME','PA'], regionalBonus:1, homeStateBonus:3.4, riskScore:1, announcementBias:1 },
        },
    };
    Object.assign(window.VPData.curatedProfiles.democrat, vpProfiles.democrat);
    Object.assign(window.VPData.curatedProfiles.republican, vpProfiles.republican);
    // Canonical person ids prevent a running mate from also taking a cabinet job.
    const modernByName = new Map(
        [...window.CandidateData.democrats, ...window.CandidateData.republicans]
            .map(profile => [profile.name, profile.id])
    );
    for (const partyProfiles of Object.values(window.VPData.curatedProfiles)) {
        for (const profile of Object.values(partyProfiles)) {
            profile.candidateId = profile.candidateId || modernByName.get(profile.name) || profile.id;
        }
    }

    const d = ['mark_kelly','gretchen_whitmer','wes_moore','raphael_warnock','andy_beshear','cory_booker','elissa_slotkin'];
    const r = ['glenn_youngkin','tim_scott','brian_kemp','nikki_haley','tom_cotton','chris_sununu','byron_donalds'];
    const slates = {
        newsom:d, buttigieg:['gretchen_whitmer','roy_cooper','amy_klobuchar','mark_kelly','tammy_duckworth','jared_polis','elissa_slotkin'],
        aoc:['wes_moore','raphael_warnock','tammy_duckworth','gretchen_whitmer','mark_kelly','ruben_gallego','ro_khanna'],
        harris:['roy_cooper','andy_beshear','gretchen_whitmer','mark_kelly','wes_moore','cory_booker','jared_polis'],
        shapiro:['mark_kelly','wes_moore','tammy_duckworth','amy_klobuchar','roy_cooper','elissa_slotkin','cory_booker'],
        stephensmith:['wes_moore','raphael_warnock','mark_kelly','andy_beshear','tammy_duckworth','cory_booker','ruben_gallego'],
        moore:['mark_kelly','gretchen_whitmer','andy_beshear','amy_klobuchar','elissa_slotkin','jared_polis','ro_khanna'],
        whitmer:['wes_moore','mark_kelly','raphael_warnock','andy_beshear','cory_booker','ruben_gallego','ro_khanna'],
        warnock:['wes_moore','mark_kelly','gretchen_whitmer','andy_beshear','cory_booker','elissa_slotkin','jared_polis'],
        beshear:['wes_moore','mark_kelly','gretchen_whitmer','raphael_warnock','amy_klobuchar','cory_booker','elissa_slotkin'],
        pritzker:['mark_kelly','wes_moore','raphael_warnock','andy_beshear','elissa_slotkin','ruben_gallego','ro_khanna'],
        booker:['mark_kelly','gretchen_whitmer','wes_moore','andy_beshear','tammy_duckworth','jared_polis','elissa_slotkin'],
        polis:['mark_kelly','wes_moore','gretchen_whitmer','raphael_warnock','andy_beshear','cory_booker','ruben_gallego'],
        khanna:['wes_moore','mark_kelly','gretchen_whitmer','raphael_warnock','andy_beshear','cory_booker','elissa_slotkin'],
        gallego:['wes_moore','gretchen_whitmer','raphael_warnock','andy_beshear','cory_booker','jared_polis','elissa_slotkin'],
        slotkin:['wes_moore','mark_kelly','raphael_warnock','andy_beshear','cory_booker','jared_polis','ruben_gallego'],
        vance:r, rubio:['nikki_haley','glenn_youngkin','tim_scott','brian_kemp','katie_britt','tom_cotton','chris_sununu'],
        desantis:['brian_kemp','tim_scott','doug_burgum','glenn_youngkin','katie_britt','tom_cotton','byron_donalds'],
        trumpjr:['elise_stefanik','tim_scott','brian_kemp','glenn_youngkin','katie_britt','josh_hawley','byron_donalds'],
        ramaswamy:['nikki_haley','glenn_youngkin','katie_britt','tim_scott','doug_burgum','tom_cotton','chris_sununu'],
        carlson:['elise_stefanik','tim_scott','glenn_youngkin','brian_kemp','doug_burgum','josh_hawley','byron_donalds'],
        youngkin:['tim_scott','brian_kemp','nikki_haley','katie_britt','tom_cotton','byron_donalds','josh_hawley'],
        scott:['glenn_youngkin','brian_kemp','nikki_haley','katie_britt','tom_cotton','chris_sununu','byron_donalds'],
        kemp:['glenn_youngkin','tim_scott','nikki_haley','katie_britt','tom_cotton','chris_sununu','byron_donalds'],
        britt:['glenn_youngkin','tim_scott','brian_kemp','nikki_haley','tom_cotton','chris_sununu','byron_donalds'],
        hawley:['glenn_youngkin','tim_scott','brian_kemp','katie_britt','tom_cotton','chris_sununu','byron_donalds'],
        cotton:['glenn_youngkin','tim_scott','brian_kemp','nikki_haley','katie_britt','chris_sununu','byron_donalds'],
        cruz:['glenn_youngkin','tim_scott','brian_kemp','nikki_haley','katie_britt','tom_cotton','byron_donalds'],
        noem:['glenn_youngkin','tim_scott','brian_kemp','nikki_haley','tom_cotton','chris_sununu','byron_donalds'],
        donalds:['glenn_youngkin','tim_scott','brian_kemp','nikki_haley','katie_britt','tom_cotton','chris_sununu'],
        sununu:['glenn_youngkin','tim_scott','brian_kemp','nikki_haley','katie_britt','tom_cotton','byron_donalds'],
    };
    Object.assign(window.VPData.slates, slates);

    const cabinetAdditions = {
        Democrat: {
            state:{ id:'booker', name:'Cory Booker', age:59, home:'New Jersey', title:'U.S. Senator', bio:'A coalition diplomat with global relationships and unusual public-facing energy.', concerns:['Critics question whether optimism is a foreign-policy doctrine'], competence:82, loyalty:74, controversy:24 },
            treasury:{ id:'pritzker', name:'J.B. Pritzker', age:63, home:'Illinois', title:'Governor & business executive', bio:'A big-state executive comfortable with markets, budgets, labor, and enormous institutions.', concerns:['Billionaire wealth dominates the confirmation narrative'], competence:86, loyalty:74, controversy:42 },
            defense:{ id:'slotkin', name:'Elissa Slotkin', age:52, home:'Michigan', title:'U.S. Senator & former CIA analyst', bio:'A national-security professional with combat-zone tours and battleground political instincts.', concerns:['Limited experience managing an organization the size of the Pentagon'], competence:88, loyalty:70, controversy:20 },
            justice:{ id:'shapiro', name:'Josh Shapiro', age:55, home:'Pennsylvania', title:'Governor & former Attorney General', bio:'A former state attorney general with executive experience and a prosecutor’s command of the cameras.', concerns:['Ambitious national profile raises independence questions'], competence:88, loyalty:68, controversy:30 },
            homeland:{ id:'gallego', name:'Ruben Gallego', age:49, home:'Arizona', title:'U.S. Senator & Marine veteran', bio:'A border-state senator with military experience and direct political credibility on migration.', concerns:['Partisan border fights would consume the hearing'], competence:82, loyalty:78, controversy:38 },
            cia:{ id:'abigail_spanberger', name:'Abigail Spanberger', age:49, home:'Virginia', title:'Governor & former CIA officer', bio:'A former operations officer with executive authority and bipartisan instincts.', concerns:['Political career invites questions about intelligence independence'], competence:90, loyalty:72, controversy:18 },
            un:{ id:'khanna', name:'Ro Khanna', age:52, home:'California', title:'U.S. Representative', bio:'A technology and industrial-policy voice who can argue the American model on the world stage.', concerns:['Limited diplomatic résumé'], competence:78, loyalty:76, controversy:28 },
            hhs:{ id:'tammy_baldwin', name:'Tammy Baldwin', age:66, home:'Wisconsin', title:'U.S. Senator', bio:'A veteran health-policy legislator with deep knowledge of drug prices and insurance markets.', concerns:['Senate seat politics complicate the nomination'], competence:86, loyalty:78, controversy:24 },
            energy:{ id:'polis', name:'Jared Polis', age:53, home:'Colorado', title:'Governor & technology entrepreneur', bio:'A western executive fluent in renewables, grids, technology, and growth politics.', concerns:['Fossil-fuel senators attack his Colorado energy record'], competence:86, loyalty:70, controversy:32 },
            chief:{ id:'moore', name:'Wes Moore', age:49, home:'Maryland', title:'Governor & Army veteran', bio:'An energetic executive and coalition builder who can command the building and sell the mission.', concerns:[], competence:84, loyalty:82, controversy:0 },
            nsa:{ id:'mark_warner', name:'Mark Warner', age:74, home:'Virginia', title:'U.S. Senator & intelligence committee leader', bio:'A longtime intelligence overseer with technology and alliance expertise.', concerns:[], competence:90, loyalty:68, controversy:0 },
            press:{ id:'ayanna_pressley', name:'Ayanna Pressley', age:54, home:'Massachusetts', title:'U.S. Representative', bio:'A forceful movement communicator who can turn a briefing into the day’s defining political argument.', concerns:[], competence:78, loyalty:84, controversy:0 },
        },
        Republican: {
            state:{ id:'rubio', name:'Marco Rubio', age:57, home:'Florida', title:'National-security leader & former senator', bio:'A fluent foreign-policy messenger with deep regional expertise and presidential-campaign experience.', concerns:['Rivals question whether he serves the president or his own future'], competence:90, loyalty:68, controversy:28 },
            treasury:{ id:'david_mccormick', name:'David McCormick', age:63, home:'Pennsylvania', title:'U.S. Senator & business executive', bio:'A combat veteran and former global executive with markets and national-security credentials.', concerns:['Hedge-fund record becomes the center of the hearing'], competence:86, loyalty:72, controversy:36 },
            defense:{ id:'dan_crenshaw', name:'Dan Crenshaw', age:44, home:'Texas', title:'U.S. Representative & Navy SEAL veteran', bio:'A decorated veteran and defense-policy communicator with operational credibility.', concerns:['Combative media feuds complicate Pentagon discipline'], competence:82, loyalty:74, controversy:34 },
            justice:{ id:'hawley', name:'Josh Hawley', age:49, home:'Missouri', title:'U.S. Senator & former Attorney General', bio:'A former state attorney general with an aggressive antitrust and culture-war agenda.', concerns:['Election-certification record guarantees a bruising hearing'], competence:80, loyalty:82, controversy:72 },
            homeland:{ id:'donalds', name:'Byron Donalds', age:50, home:'Florida', title:'U.S. Representative', bio:'A forceful public advocate for border enforcement and institutional overhaul.', concerns:['Little operational experience with a sprawling security department'], competence:72, loyalty:84, controversy:48 },
            cia:{ id:'mike_rogers', name:'Mike Rogers', age:65, home:'Michigan', title:'Former U.S. Representative & intelligence chairman', bio:'A former FBI agent and intelligence committee chair who knows the building and its overseers.', concerns:['Private-sector intelligence work receives close scrutiny'], competence:88, loyalty:70, controversy:24 },
            un:{ id:'nancy_mace', name:'Nancy Mace', age:50, home:'South Carolina', title:'U.S. Representative', bio:'A sharp television communicator with a military-college background and independent streak.', concerns:['Frequent party feuds raise message-discipline doubts'], competence:72, loyalty:58, controversy:46 },
            hhs:{ id:'bill_cassidy', name:'Bill Cassidy', age:71, home:'Louisiana', title:'U.S. Senator & physician', bio:'A physician-senator who speaks the language of public health, budgets, and conservative reform.', concerns:['Past breaks with party leadership threaten activist support'], competence:88, loyalty:56, controversy:30 },
            energy:{ id:'kevin_cramer', name:'Kevin Cramer', age:67, home:'North Dakota', title:'U.S. Senator & former utility regulator', bio:'An energy-state senator with direct utility-regulation experience and industry relationships.', concerns:['Climate groups make the nomination a national organizing target'], competence:82, loyalty:82, controversy:38 },
            chief:{ id:'sununu', name:'Chris Sununu', age:54, home:'New Hampshire', title:'Former Governor', bio:'A pragmatic executive who knows how to tell the president no and Congress yes.', concerns:[], competence:88, loyalty:58, controversy:0 },
            nsa:{ id:'cotton', name:'Tom Cotton', age:51, home:'Arkansas', title:'U.S. Senator & Army veteran', bio:'A disciplined defense hawk with military service and command of the national-security bureaucracy.', concerns:[], competence:90, loyalty:78, controversy:0 },
            press:{ id:'ramaswamy', name:'Vivek Ramaswamy', age:43, home:'Ohio', title:'Entrepreneur & former presidential candidate', bio:'A relentless communicator who can flood every platform with the administration’s argument.', concerns:[], competence:76, loyalty:80, controversy:0 },
        },
    };
    for (const [party, posts] of Object.entries(cabinetAdditions)) {
        for (const [postId, profile] of Object.entries(posts)) {
            const pool = window.CabinetData.OPTIONS[party][postId];
            if (!pool.some(item => item.id === profile.id)) pool.push(profile);
        }
    }
})();
