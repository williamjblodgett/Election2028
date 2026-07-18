/**
 * Election 2028 — Presidential Legends
 * Past presidents as fully playable candidates: era-flavored stats, historical
 * strengths and liabilities, and 3D appearances for the walkout/cutscene.
 * A work of political-history fiction; stats are game balance, not scholarship.
 */
(function () {
    const L = (o) => Object.assign({
        fatigueFactor: 30,
        crossoverAppeal: 55,
        ideologicalElasticity: 50,
        scandalResistance: 70,
        baseEnthusiasm: 70,
        debate: 70,
        mediaHandling: 70,
        charisma: 75,
        viralPotential: 55,
        donorTrust: 65,
        eliteSupport: 70,
        isLegend: true,
    }, o);

    const DEM_LEGENDS = [
        L({
            id: 'legend_fdr', name: 'Franklin D. Roosevelt', party: 'Democrat',
            title: '32nd President of the United States', age: 60, homeState: 'New York',
            portraitEmoji: '📻', color: '#1c4fa0',
            charisma: 92, mediaHandling: 96, debate: 85, baseEnthusiasm: 90, eliteSupport: 88, donorTrust: 80, scandalResistance: 80, ideologicalElasticity: 72,
            strengths: ['The fireside-chat master — no one has ever used a broadcast medium better', 'A coalition builder who realigned American politics for a generation', 'Projects unshakeable optimism in a crisis'],
            vulnerabilities: ['Opposition attack line: promises a bigger government than any in history', 'Reported criticism: accused of concentrating executive power', 'Court-expansion talk alarms institutionalists'],
        }),
        L({
            id: 'legend_jfk', name: 'John F. Kennedy', party: 'Democrat',
            title: '35th President of the United States', age: 45, homeState: 'Massachusetts',
            portraitEmoji: '🚀', color: '#2166d4',
            charisma: 96, mediaHandling: 93, debate: 88, viralPotential: 90, baseEnthusiasm: 85, donorTrust: 75, scandalResistance: 55, ideologicalElasticity: 45,
            strengths: ['Television was invented for him — wins every split-screen', 'Generational-change message with genuine star power', 'Ask-not idealism that recruits volunteers by the thousands'],
            vulnerabilities: ['Opposition attack line: a glamorous senator with a thin record', 'Reported criticism: family machine and money open every door', 'Personal life is a standing opposition-research target'],
        }),
        L({
            id: 'legend_lbj', name: 'Lyndon B. Johnson', party: 'Democrat',
            title: '36th President of the United States', age: 55, homeState: 'Texas',
            portraitEmoji: '🤠', color: '#1a4a8f',
            charisma: 70, mediaHandling: 55, debate: 75, baseEnthusiasm: 72, eliteSupport: 96, donorTrust: 82, scandalResistance: 60, ideologicalElasticity: 60,
            strengths: ['The Master of the Senate — twists arms until the votes appear', 'A legislative machine: turns promises into signed bills', 'Southern reach no modern Democrat can match'],
            vulnerabilities: ['Opposition attack line: the ultimate backroom dealer', 'Reported criticism: bullies allies and enemies alike', 'War-escalation instincts worry the base'],
        }),
        L({
            id: 'legend_truman', name: 'Harry S. Truman', party: 'Democrat',
            title: '33rd President of the United States', age: 64, homeState: 'Missouri',
            portraitEmoji: '🛤️', color: '#27568f',
            charisma: 68, mediaHandling: 62, debate: 72, baseEnthusiasm: 75, scandalResistance: 92, crossoverAppeal: 70, donorTrust: 60, ideologicalElasticity: 48,
            strengths: ['Plain-spoken and unbought — the buck stops with him', 'Whistle-stop campaigner who thrives as the underdog', 'Immune to personal scandal: there is nothing to find'],
            vulnerabilities: ['Opposition attack line: a machine politician from Kansas City', 'Reported criticism: fires off intemperate letters when angry', 'Starts every race behind in the polls'],
        }),
        L({
            id: 'legend_obama', name: 'Barack Obama', party: 'Democrat',
            title: '44th President of the United States', age: 47, homeState: 'Illinois',
            portraitEmoji: '🌊', color: '#2b7de1',
            charisma: 95, mediaHandling: 92, debate: 90, viralPotential: 96, baseEnthusiasm: 92, donorTrust: 85, scandalResistance: 85, ideologicalElasticity: 55,
            strengths: ['A once-in-a-generation orator with a movement behind him', 'Digital organizing pioneer — small-dollar fundraising machine', 'Scandal-free administrations are his calling card'],
            vulnerabilities: ['Opposition attack line: professorial and aloof under pressure', 'Reported criticism: promises transcendence, delivers gridlock', 'The base wants fights he prefers to negotiate'],
        }),
    ];

    const REP_LEGENDS = [
        L({
            id: 'legend_lincoln', name: 'Abraham Lincoln', party: 'Republican',
            title: '16th President of the United States', age: 51, homeState: 'Illinois',
            portraitEmoji: '🎩', color: '#8f1f1f',
            charisma: 85, debate: 96, mediaHandling: 75, baseEnthusiasm: 85, scandalResistance: 90, crossoverAppeal: 75, eliteSupport: 60, ideologicalElasticity: 58,
            strengths: ['The greatest debater in American history — period', 'Moral clarity that reframes any argument', 'A storyteller who disarms hostile rooms with one anecdote'],
            vulnerabilities: ['Opposition attack line: a one-term congressman from the frontier', 'Reported criticism: melancholy spells worry his handlers', 'The establishment calls him unelectable — again'],
        }),
        L({
            id: 'legend_teddy', name: 'Theodore Roosevelt', party: 'Republican',
            title: '26th President of the United States', age: 42, homeState: 'New York',
            portraitEmoji: '🐻', color: '#a5341f',
            charisma: 93, baseEnthusiasm: 97, debate: 80, mediaHandling: 85, viralPotential: 85, scandalResistance: 85, donorTrust: 45, ideologicalElasticity: 75,
            strengths: ['A human stampede — no one out-campaigns the Bull Moose', 'Trust-busting populism that steals working-class votes', 'Once gave a speech with a fresh bullet wound; try rattling him'],
            vulnerabilities: ['Opposition attack line: an unguided missile with a grin', 'Reported criticism: the party bosses fear he answers to no one', 'Wall Street funds whoever runs against him'],
        }),
        L({
            id: 'legend_ike', name: 'Dwight D. Eisenhower', party: 'Republican',
            title: '34th President of the United States', age: 62, homeState: 'Kansas',
            portraitEmoji: '⭐', color: '#b03a2e',
            charisma: 80, mediaHandling: 72, debate: 70, baseEnthusiasm: 70, crossoverAppeal: 92, scandalResistance: 95, eliteSupport: 90, donorTrust: 85, ideologicalElasticity: 35,
            strengths: ['The general everyone likes — both parties tried to draft him', 'Supreme-command steadiness: the grown-up in every room', 'A middle-of-the-road coalition wider than any in the field'],
            vulnerabilities: ['Opposition attack line: a caretaker who golfs through crises', 'Reported criticism: avoids the fights the base wants fought', 'No appetite for partisan combat'],
        }),
        L({
            id: 'legend_reagan', name: 'Ronald Reagan', party: 'Republican',
            title: '40th President of the United States', age: 69, homeState: 'California',
            portraitEmoji: '🎬', color: '#c62b2b',
            charisma: 94, mediaHandling: 98, debate: 86, baseEnthusiasm: 90, crossoverAppeal: 80, donorTrust: 88, scandalResistance: 75, ideologicalElasticity: 55,
            strengths: ['The Great Communicator — turns a debate stage into a movie set', "Morning-in-America optimism that flips blue-collar Democrats", 'One-liners that end arguments: "There you go again"'],
            vulnerabilities: ['Opposition attack line: an actor reading someone else\'s script', 'Reported criticism: details of policy escape him under questioning', 'Age is the whispered issue in every green room'],
        }),
        L({
            id: 'legend_nixon', name: 'Richard Nixon', party: 'Republican',
            title: '37th President of the United States', age: 55, homeState: 'California',
            portraitEmoji: '🕵️', color: '#7d2020',
            charisma: 60, mediaHandling: 45, debate: 82, baseEnthusiasm: 65, eliteSupport: 80, donorTrust: 70, scandalResistance: 15, crossoverAppeal: 60, ideologicalElasticity: 65,
            strengths: ['A grandmaster strategist — sees five moves ahead of any rival', 'The silent majority answers when he calls', 'Comeback artist: never count him out'],
            vulnerabilities: ['Opposition attack line: would you buy a used car from this man?', 'Reported criticism: keeps an enemies list and checks it twice', 'Sweats under studio lights; television is unkind', 'Aides keep suggesting hotel break-ins are a bad idea'],
        }),
    ];

    // George Washington transcends party — available on both benches
    const washington = (party, id) => L({
        id, name: 'George Washington', party,
        title: '1st President of the United States', age: 57, homeState: 'Virginia',
        portraitEmoji: '🌳', color: party === 'Democrat' ? '#274a7d' : '#7d3527',
        charisma: 88, debate: 65, mediaHandling: 60, baseEnthusiasm: 80, crossoverAppeal: 99, scandalResistance: 97, eliteSupport: 95, donorTrust: 90, ideologicalElasticity: 30,
        strengths: ['The indispensable man — unanimous twice, and everyone knows it', 'Above faction: partisan attacks bounce off the marble', 'Cannot tell a lie, which polls surprisingly well'],
        vulnerabilities: ['Opposition attack line: warned against the very parties running him', 'Reported criticism: wants to serve two terms and go home', 'Refuses to campaign negatively, even when trailing'],
    });

    window.LegendData = {
        democrats: [...DEM_LEGENDS, washington('Democrat', 'legend_washington_d')],
        republicans: [...REP_LEGENDS, washington('Republican', 'legend_washington_r')],
    };

    // ── 3D appearances (registered into the walkout's table) ──
    const LEGEND_APPEARANCES = {
        legend_fdr:          { skin: 0xe3b28a, hair: 0x8a8f96, style: 'side',  beard: null,       glasses: true,  female: false, height: 1.04, face: { h: 1.1, chin: 1.1, nose: 1.05 } },
        legend_jfk:          { skin: 0xe6bd97, hair: 0x4a3626, style: 'side',  beard: null,       glasses: false, female: false, height: 1.02, face: { w: 1.08, h: 0.98 } },
        legend_lbj:          { skin: 0xe0b088, hair: 0x9a9da3, style: 'slick', beard: null,       glasses: false, female: false, height: 1.1,  face: { h: 1.08, ear: 1.5, nose: 1.2, noseLen: 1.15, jowls: true } },
        legend_truman:       { skin: 0xe4b892, hair: 0xb5b8bd, style: 'short', beard: null,       glasses: true,  female: false, height: 0.99, face: { w: 0.98 } },
        legend_obama:        { skin: 0x9c6b45, hair: 0x2a2a2e, style: 'short', beard: null,       glasses: false, female: false, height: 1.05, face: { w: 0.96, h: 1.05, ear: 1.4 } },
        legend_lincoln:      { skin: 0xdcae87, hair: 0x1c1712, style: 'coif',  beard: 'full',     glasses: false, female: false, height: 1.14, face: { w: 0.86, h: 1.16, nose: 1.15, noseLen: 1.2, brow: 1.35, ear: 1.25 } },
        legend_teddy:        { skin: 0xe2b28c, hair: 0x4a3223, style: 'side',  beard: 'mustache', glasses: true,  female: false, height: 1.0,  face: { w: 1.14, h: 0.96, nose: 1.05, jowls: true } },
        legend_ike:          { skin: 0xe6bd97, hair: 0xc6c9cd, style: 'bald',  beard: null,       glasses: false, female: false, height: 1.02, face: { w: 1.1, h: 0.97 } },
        legend_reagan:       { skin: 0xe0ab80, hair: 0x3a2a20, style: 'slick', beard: null,       glasses: false, female: false, height: 1.04, face: { h: 1.04, chin: 1.05, nose: 1.05 } },
        legend_nixon:        { skin: 0xe3b28a, hair: 0x2e2620, style: 'side',  beard: null,       glasses: false, female: false, height: 1.02, face: { nose: 1.35, noseLen: 1.25, brow: 1.4, jowls: true, w: 1.02 } },
        legend_washington_d: { skin: 0xe6c09c, hair: 0xd9dade, style: 'side',  beard: null,       glasses: false, female: false, height: 1.06, face: { h: 1.06, nose: 1.12, chin: 0.9 } },
        legend_washington_r: { skin: 0xe6c09c, hair: 0xd9dade, style: 'side',  beard: null,       glasses: false, female: false, height: 1.06, face: { h: 1.06, nose: 1.12, chin: 0.9 } },
    };
    if (window.DebateWalkout && window.DebateWalkout.APPEARANCES) {
        Object.assign(window.DebateWalkout.APPEARANCES, LEGEND_APPEARANCES);
    }
})();
