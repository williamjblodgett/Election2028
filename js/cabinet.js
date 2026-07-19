/**
 * Election 2028 — Cabinet & Transition data
 * Real public figures as cabinet options. Stats are game balance, not
 * scholarship; controversy reflects likely confirmation friction as
 * publicly reported, framed as a game mechanic.
 */
window.CabinetData = {

    POSTS: [
        { id: 'state',    title: 'Secretary of State',        icon: '🌍', confirmable: true,  desc: 'The face of American diplomacy. High-competence picks steady foreign crises.' },
        { id: 'treasury', title: 'Secretary of the Treasury', icon: '💵', confirmable: true,  desc: 'Steers the economy. Markets read this pick before you finish the sentence.' },
        { id: 'defense',  title: 'Secretary of Defense',      icon: '🎖️', confirmable: true,  desc: 'Runs the Pentagon. The Senate scrutinizes this one hardest.' },
        { id: 'justice',  title: 'Attorney General',          icon: '⚖️', confirmable: true,  desc: 'The nation\'s top law officer — and the most politically radioactive chair.' },
        { id: 'chief',    title: 'White House Chief of Staff', icon: '🗂️', confirmable: false, desc: 'Gatekeeper of the Oval Office. No confirmation needed — loyalty is everything.' },
        { id: 'press',    title: 'Press Secretary',           icon: '🎤', confirmable: false, desc: 'Your voice at the podium every single day. No confirmation needed.' },
    ],

    // Per-party option pools. competence/loyalty 0-100; controversy drives
    // confirmation difficulty for confirmable posts.
    OPTIONS: {
        Democrat: {
            state: [
                { id: 'william_burns', name: 'William Burns',   title: 'Former CIA Director',              competence: 92, loyalty: 60, controversy: 25, blurb: 'Career diplomat, back-channel legend. The Senate confirms him in its sleep.' },
                { id: 'susan_rice',    name: 'Susan Rice',      title: 'Former National Security Advisor', competence: 88, loyalty: 75, controversy: 55, blurb: 'Formidable and battle-tested — but old fights will resurface at the hearing.' },
                { id: 'samantha_power', name: 'Samantha Power', title: 'Former UN Ambassador',             competence: 85, loyalty: 70, controversy: 45, blurb: 'Human-rights hawk with a Pulitzer. Interventionist record cuts both ways.' },
                { id: 'chris_coons',   name: 'Chris Coons',     title: 'Senator from Delaware',            competence: 80, loyalty: 80, controversy: 18, blurb: 'The Senate\'s favorite senator. Costs you a Senate seat to a special election.' },
            ],
            treasury: [
                { id: 'janet_yellen',  name: 'Janet Yellen',    title: 'Former Treasury Secretary',        competence: 94, loyalty: 65, controversy: 28, blurb: 'The steadiest hand available. Markets exhale the moment you announce her.' },
                { id: 'gina_raimondo', name: 'Gina Raimondo',   title: 'Former Commerce Secretary',        competence: 86, loyalty: 72, controversy: 32, blurb: 'Business-friendly technocrat. The left grumbles; the Senate doesn\'t.' },
                { id: 'elizabeth_warren', name: 'Elizabeth Warren', title: 'Senator from Massachusetts',   competence: 85, loyalty: 55, controversy: 72, blurb: 'Wall Street\'s nightmare. The base erupts in joy — and the hearing is war.' },
                { id: 'jamie_dimon',   name: 'Jamie Dimon',     title: 'JPMorgan Chase CEO',               competence: 90, loyalty: 40, controversy: 58, blurb: 'A team-of-business statement pick. Your own party supplies the defections.' },
            ],
            defense: [
                { id: 'michele_flournoy', name: 'Michèle Flournoy', title: 'Former Under Secretary of Defense', competence: 90, loyalty: 70, controversy: 24, blurb: 'The most-prepared SecDef never yet appointed. Defense-industry ties get a look.' },
                { id: 'tammy_duckworth', name: 'Tammy Duckworth', title: 'Senator & Iraq War veteran',     competence: 82, loyalty: 80, controversy: 20, blurb: 'Purple Heart, Blackhawk pilot, unimpeachable story. Costs a Senate vote.' },
                { id: 'mark_kelly',    name: 'Mark Kelly',       title: 'Senator & Navy combat pilot',     competence: 80, loyalty: 78, controversy: 22, blurb: 'Astronaut-senator with crossover glow. (Unavailable if he\'s your VP.)' },
                { id: 'lloyd_austin',  name: 'Lloyd Austin',     title: 'Former Defense Secretary',        competence: 84, loyalty: 75, controversy: 38, blurb: 'Knows the building cold. Questions about his last tour will return.' },
            ],
            justice: [
                { id: 'sally_yates',   name: 'Sally Yates',      title: 'Former Acting Attorney General',  competence: 88, loyalty: 70, controversy: 48, blurb: 'Fired for defying a president once. Half the country calls that a résumé.' },
                { id: 'doug_jones',    name: 'Doug Jones',       title: 'Former Senator from Alabama',     competence: 82, loyalty: 75, controversy: 18, blurb: 'Prosecuted the Klan, confirmed friends on both sides of the aisle.' },
                { id: 'dana_nessel',   name: 'Dana Nessel',      title: 'Michigan Attorney General',       competence: 78, loyalty: 72, controversy: 52, blurb: 'A brawler who wins. Expect fireworks at the hearing.' },
                { id: 'merrick_garland', name: 'Merrick Garland', title: 'Former Attorney General',        competence: 80, loyalty: 60, controversy: 42, blurb: 'Institutionalist\'s institutionalist. Both flanks find him frustrating.' },
            ],
            chief: [
                { id: 'ron_klain',     name: 'Ron Klain',        title: 'Former White House Chief of Staff', competence: 90, loyalty: 85, controversy: 0, blurb: 'Has literally done the job. Knows where every lever in the building is.' },
                { id: 'jen_omalley',   name: 'Jen O\'Malley Dillon', title: 'Campaign strategist',         competence: 84, loyalty: 90, controversy: 0, blurb: 'Ran your war room. Total loyalty, campaign-honed instincts.' },
                { id: 'mitch_landrieu', name: 'Mitch Landrieu',  title: 'Former New Orleans Mayor',        competence: 80, loyalty: 82, controversy: 0, blurb: 'Operator with executive experience and a southern touch.' },
            ],
            press: [
                { id: 'jen_psaki',     name: 'Jen Psaki',        title: 'Former Press Secretary',          competence: 88, loyalty: 80, controversy: 0, blurb: 'Circle-backs and all — the most effective podium presence of her era.' },
                { id: 'karine_jean_pierre', name: 'Karine Jean-Pierre', title: 'Former Press Secretary',   competence: 78, loyalty: 85, controversy: 0, blurb: 'Historic, disciplined, stays on message under fire.' },
                { id: 'symone_sanders', name: 'Symone Sanders',  title: 'Political strategist & commentator', competence: 80, loyalty: 78, controversy: 0, blurb: 'Fast, fearless, made for the cable-news knife fight.' },
            ],
        },
        Republican: {
            state: [
                { id: 'robert_obrien', name: 'Robert O\'Brien',  title: 'Former National Security Advisor', competence: 82, loyalty: 75, controversy: 28, blurb: 'Steady, presentable, confirmable. The establishment breathes easier.' },
                { id: 'nikki_haley',   name: 'Nikki Haley',      title: 'Former UN Ambassador',             competence: 86, loyalty: 55, controversy: 42, blurb: 'A rival\'s résumé and a future rival\'s ambition. Watch your back.' },
                { id: 'mike_pompeo',   name: 'Mike Pompeo',      title: 'Former Secretary of State',        competence: 85, loyalty: 70, controversy: 52, blurb: 'Done it before, enemies to prove it. Hearings will be combative.' },
                { id: 'bill_hagerty',  name: 'Bill Hagerty',     title: 'Senator from Tennessee',           competence: 78, loyalty: 80, controversy: 18, blurb: 'Ambassador turned senator. Easy confirmation, costs a Senate vote.' },
            ],
            treasury: [
                { id: 'scott_bessent', name: 'Scott Bessent',    title: 'Former Treasury Secretary',        competence: 85, loyalty: 72, controversy: 32, blurb: 'Markets know him; the building knows him. Low-drama pick.' },
                { id: 'glenn_youngkin', name: 'Glenn Youngkin',  title: 'Former Virginia Governor',         competence: 84, loyalty: 70, controversy: 26, blurb: 'Private-equity polish with a governor\'s record. (Unavailable if he\'s your VP.)' },
                { id: 'larry_kudlow',  name: 'Larry Kudlow',     title: 'Former NEC Director',              competence: 74, loyalty: 82, controversy: 45, blurb: 'Television-fluent supply-sider. Economists wince, the base cheers.' },
                { id: 'jamie_dimon',   name: 'Jamie Dimon',      title: 'JPMorgan Chase CEO',               competence: 90, loyalty: 40, controversy: 58, blurb: 'A team-of-business statement pick. Populists supply the defections.' },
            ],
            defense: [
                { id: 'mike_waltz',    name: 'Mike Waltz',       title: 'Former National Security Advisor', competence: 80, loyalty: 75, controversy: 38, blurb: 'Green Beret with Hill experience. Some baggage, mostly manageable.' },
                { id: 'joni_ernst',    name: 'Joni Ernst',       title: 'Senator & combat veteran',         competence: 78, loyalty: 72, controversy: 26, blurb: 'First female combat veteran in the Senate. Smooth confirmation likely.' },
                { id: 'tom_cotton',    name: 'Tom Cotton',       title: 'Senator from Arkansas',            competence: 82, loyalty: 78, controversy: 55, blurb: 'Hawk\'s hawk. Democrats will make the hearing a spectacle.' },
                { id: 'pete_hegseth',  name: 'Pete Hegseth',     title: 'Former Defense Secretary',         competence: 68, loyalty: 85, controversy: 78, blurb: 'The base loves him; the Senate math does not. A dare, not a pick.' },
            ],
            justice: [
                { id: 'john_ratcliffe', name: 'John Ratcliffe',  title: 'Former CIA Director',              competence: 76, loyalty: 80, controversy: 48, blurb: 'Intelligence credentials, partisan edges. Survivable hearing.' },
                { id: 'pam_bondi',     name: 'Pam Bondi',        title: 'Former Attorney General',          competence: 75, loyalty: 82, controversy: 52, blurb: 'Done the job, took the hits. Loyal to a fault — which is the attack line.' },
                { id: 'andrew_bailey', name: 'Andrew Bailey',    title: 'Missouri Attorney General',        competence: 72, loyalty: 78, controversy: 44, blurb: 'Young litigator with a culture-war docket. The hearing gets loud.' },
                { id: 'ken_paxton',    name: 'Ken Paxton',       title: 'Texas Attorney General',           competence: 70, loyalty: 75, controversy: 85, blurb: 'The most-investigated AG in America. Confirmation is a coin you probably lose.' },
            ],
            chief: [
                { id: 'susie_wiles',   name: 'Susie Wiles',      title: 'Campaign strategist',              competence: 88, loyalty: 85, controversy: 0, blurb: 'The Ice Maiden. Runs a tight building and never leaks.' },
                { id: 'chris_lacivita', name: 'Chris LaCivita',  title: 'Campaign strategist',              competence: 80, loyalty: 82, controversy: 0, blurb: 'Knife-fighter who ran your ground war. The staff will fear him. Good.' },
                { id: 'reince_priebus', name: 'Reince Priebus',  title: 'Former RNC Chairman',              competence: 76, loyalty: 68, controversy: 0, blurb: 'Party-establishment glue. Keeps the committees happy, if not the base.' },
            ],
            press: [
                { id: 'karoline_leavitt', name: 'Karoline Leavitt', title: 'Former Press Secretary',        competence: 80, loyalty: 88, controversy: 0, blurb: 'Youngest ever at the podium and never rattled.' },
                { id: 'kayleigh_mcenany', name: 'Kayleigh McEnany', title: 'Former Press Secretary',        competence: 78, loyalty: 82, controversy: 0, blurb: 'Binder always loaded. Cable-ready every hour of the day.' },
                { id: 'sean_spicer',   name: 'Sean Spicer',      title: 'Former Press Secretary',           competence: 68, loyalty: 75, controversy: 0, blurb: 'A known quantity at the podium. The briefing room braces itself.' },
            ],
        },
    },
};
