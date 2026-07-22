/**
 * Election 2028 - Candidate Data
 * All stats on 0-100 scale. Vulnerabilities reference publicly documented
 * controversies, framed as opposition research / reported criticisms.
 */

window.CandidateData = {
  democrats: [
    // ── DEMOCRATS ──────────────────────────────────────────────────────
    {
      id: "newsom",
      name: "Gavin Newsom",
      party: "Democrat",
      title: "Governor of California",
      age: 60,
      homeState: "California",
      bio: "Gavin Newsom has served as Governor of California since 2019, previously serving as Mayor of San Francisco and Lieutenant Governor. He built a national profile through aggressive climate and social policy but faces persistent criticism over California's cost-of-living crisis and homelessness challenges. As of early 2026, he is surging in Democratic presidential polls at 19-25%, positioning himself as a top-tier contender. He is widely regarded as one of the most polished communicators in the Democratic Party.",
      isWildcard: false,
      portraitEmoji: "\uD83D\uDC54",
      slogan: "California Dreaming, American Delivering",
      color: "#1a73e8",

      // Visible stats
      charisma: 78,
      debate: 74,
      fundraising: 88,
      discipline: 70,
      mediaHandling: 82,
      baseEnthusiasm: 62,
      crossoverAppeal: 48,
      scandalResistance: 55,

      // Hidden stats
      staffCompetence: 80,
      meltdownRisk: 25,
      ideologicalElasticity: 65,
      donorTrust: 92,
      authenticity: 42,
      eliteSupport: 88,
      viralPotential: 55,
      fatigueFactor: 45,

      vulnerabilities: [
        "Opposition attack line: presided over a California exodus of residents and businesses fleeing high taxes and cost of living",
        "Reported criticism: attended a multi-course dinner at the French Laundry during COVID-19 lockdowns he himself imposed",
        "Opposition research: California's unsheltered homeless population grew significantly during his governorship",
        "Reported criticism: critics characterize his communication style as slick and rehearsed, questioning his authenticity",
        "Opposition attack line: California state budget swung from surplus to a deficit exceeding $40 billion under his watch"
      ],
      strengths: [
        "Prolific fundraiser with deep Silicon Valley and Hollywood donor networks",
        "Telegenic and media-savvy with strong on-camera presence",
        "Executive experience governing the world's fifth-largest economy",
        "Early mover on climate, gun control, and reproductive rights policy",
        "Demonstrated willingness to take on national Republican figures in debate"
      ]
    },

    {
      id: "buttigieg",
      name: "Pete Buttigieg",
      party: "Democrat",
      title: "Former Secretary of Transportation",
      age: 46,
      homeState: "Indiana",
      bio: "Pete Buttigieg served as U.S. Secretary of Transportation under President Biden and previously as Mayor of South Bend, Indiana. A Rhodes Scholar and Afghan War veteran, he broke barriers as the first openly gay major presidential candidate in 2020. He is regarded as one of the sharpest debaters in the party but has faced questions about his depth of executive experience.",
      isWildcard: false,
      portraitEmoji: "\uD83C\uDF93",
      slogan: "A New Generation's Turn",
      color: "#1565c0",

      // Visible stats
      charisma: 75,
      debate: 92,
      fundraising: 72,
      discipline: 85,
      mediaHandling: 88,
      baseEnthusiasm: 65,
      crossoverAppeal: 62,
      scandalResistance: 72,

      // Hidden stats
      staffCompetence: 78,
      meltdownRisk: 10,
      ideologicalElasticity: 70,
      donorTrust: 74,
      authenticity: 60,
      eliteSupport: 75,
      viralPotential: 70,
      fatigueFactor: 30,

      vulnerabilities: [
        "Opposition attack line: struggled with Black voter support during 2020 primary, polling near zero among Black voters in key states",
        "Reported criticism: faced backlash for being slow to respond publicly to the East Palestine, Ohio train derailment",
        "Opposition research: as mayor, faced tensions with South Bend's Black community over police department controversies",
        "Reported criticism: detractors describe him as overly calculating and a 'McKinsey consultant' personality",
        "Opposition attack line: limited executive experience — governed a city of roughly 100,000 people before joining the Cabinet"
      ],
      strengths: [
        "Exceptional debater capable of articulating complex policy in plain language",
        "Military veteran with deployment to Afghanistan",
        "Youngest major candidate, represents generational change",
        "Fluent in multiple languages, projects intellectual credibility",
        "Strong ability to appear on Fox News and engage hostile interviewers"
      ]
    },

    {
      id: "aoc",
      name: "Alexandria Ocasio-Cortez",
      party: "Democrat",
      title: "U.S. Representative, NY-14",
      age: 38,
      homeState: "New York",
      bio: "Alexandria Ocasio-Cortez became the youngest woman ever elected to Congress in 2018, unseating a longtime incumbent in a stunning primary upset. She is the most prominent voice of the progressive wing, championing the Green New Deal and Medicare for All. Her massive social media following and grassroots fundraising operation make her a uniquely powerful figure in Democratic politics.",
      isWildcard: false,
      portraitEmoji: "\u2728",
      slogan: "Courage to Change",
      color: "#6a1b9a",

      // Visible stats
      charisma: 88,
      debate: 76,
      fundraising: 80,
      discipline: 58,
      mediaHandling: 72,
      baseEnthusiasm: 92,
      crossoverAppeal: 30,
      scandalResistance: 60,

      // Hidden stats
      staffCompetence: 70,
      meltdownRisk: 35,
      ideologicalElasticity: 25,
      donorTrust: 45,
      authenticity: 90,
      eliteSupport: 35,
      viralPotential: 95,
      fatigueFactor: 40,

      vulnerabilities: [
        "Opposition attack line: self-described democratic socialist label is a liability in general election polling",
        "Reported criticism: the Green New Deal resolution was characterized by opponents as economically unrealistic",
        "Opposition research: has no executive or statewide governing experience; legislative record is thin on passed bills",
        "Reported criticism: attended the 2021 Met Gala in a 'Tax the Rich' dress, which critics called performative",
        "Opposition attack line: among the most polarizing figures in American politics with high unfavorable ratings nationally"
      ],
      strengths: [
        "Massive organic social media following across all platforms",
        "Grassroots small-dollar fundraising powerhouse — raises millions without corporate PAC money",
        "Authentic personal story as a former bartender resonates with working-class voters",
        "Galvanizes youth turnout and progressive base like few other Democrats",
        "Skilled at using viral moments and committee hearings to drive news cycles"
      ]
    },

    {
      id: "harris",
      name: "Kamala Harris",
      party: "Democrat",
      title: "Former Vice President",
      age: 63,
      homeState: "California",
      bio: "Kamala Harris served as the 49th Vice President of the United States, the first woman and first person of Black and South Asian descent to hold the office. She previously served as U.S. Senator from California and as California Attorney General. Despite losing the 2024 presidential election, she leads 2028 Democratic primary polls at 26-39%, reflecting her enduring institutional support and name recognition. She faces questions about whether a rematch candidate can overcome the fatigue and baggage of a prior defeat.",
      isWildcard: false,
      portraitEmoji: "\uD83C\uDDFA\uD83C\uDDF8",
      slogan: "We're Not Going Back — Again",
      color: "#0d47a1",

      // Visible stats
      charisma: 62,
      debate: 65,
      fundraising: 82,
      discipline: 60,
      mediaHandling: 52,
      baseEnthusiasm: 58,
      crossoverAppeal: 50,
      scandalResistance: 58,

      // Hidden stats
      staffCompetence: 55,
      meltdownRisk: 30,
      ideologicalElasticity: 55,
      donorTrust: 70,
      authenticity: 45,
      eliteSupport: 72,
      viralPotential: 40,
      fatigueFactor: 70,

      vulnerabilities: [
        "Opposition attack line: lost the 2024 presidential election after a campaign that struggled to articulate a clear economic message",
        "Reported criticism: high staff turnover during her vice presidency was widely covered as a sign of management issues",
        "Opposition research: her record as California Attorney General drew criticism from criminal justice reform advocates",
        "Reported criticism: unscripted media appearances frequently produced awkward viral moments and word-salad critiques",
        "Opposition attack line: was assigned the border portfolio as VP and faced bipartisan criticism over immigration outcomes",
        "Opposition attack line: 2024 election loss will be used to frame her as a proven loser who already had her chance and failed to close"
      ],
      strengths: [
        "Historic figure who energizes key demographic coalitions",
        "Extensive executive and legal experience at state and federal level",
        "Proven ability to raise massive sums quickly when the party unifies behind her",
        "Strong prosecutorial instincts in confrontational settings",
        "Deep institutional relationships across the Democratic Party"
      ]
    },

    {
      id: "shapiro",
      name: "Josh Shapiro",
      party: "Democrat",
      title: "Governor of Pennsylvania",
      age: 55,
      homeState: "Pennsylvania",
      bio: "Josh Shapiro won the Pennsylvania governorship in 2022 by a decisive margin, establishing himself as a pragmatic Democrat who can win in the nation's most critical swing state. He previously served as Pennsylvania Attorney General, where he led the investigation into clergy abuse. His moderate positioning and swing-state credibility make him a compelling but relatively low-profile national figure.",
      isWildcard: false,
      portraitEmoji: "\uD83D\uDD11",
      slogan: "Real Results for Real Americans",
      color: "#2196f3",

      // Visible stats
      charisma: 65,
      debate: 70,
      fundraising: 68,
      discipline: 82,
      mediaHandling: 70,
      baseEnthusiasm: 50,
      crossoverAppeal: 78,
      scandalResistance: 75,

      // Hidden stats
      staffCompetence: 82,
      meltdownRisk: 12,
      ideologicalElasticity: 72,
      donorTrust: 76,
      authenticity: 70,
      eliteSupport: 74,
      viralPotential: 35,
      fatigueFactor: 20,

      vulnerabilities: [
        "Opposition attack line: relatively unknown on the national stage, with low name recognition outside Pennsylvania",
        "Reported criticism: was passed over for the 2024 VP slot, fueling speculation about vetting concerns",
        "Opposition research: his handling of Pennsylvania school voucher debates drew criticism from both sides",
        "Reported criticism: some progressives view him as too centrist and insufficiently bold on key party priorities",
        "Opposition attack line: limited foreign policy or federal-level experience"
      ],
      strengths: [
        "Won decisively in the most important swing state in American politics",
        "Moderate, pragmatic brand appeals to suburban and independent voters",
        "Led landmark clergy abuse investigation, demonstrating prosecutorial credibility",
        "Low-drama governing style viewed as steady and competent",
        "Relative freshness — not yet weighed down by years of national opposition research"
      ]
    },

    // ── DEMOCRAT WILDCARD ────────────────────────────────────────────
    {
      id: "stephensmith",
      name: "Stephen A. Smith",
      party: "Democrat",
      title: "Media Personality & Commentator",
      age: 60,
      homeState: "New York",
      bio: "Stephen A. Smith is one of the most recognizable sports media personalities in America, known for his bombastic style on ESPN's First Take. He officially ruled out running for president in March 2026 after signing a $100M deal with ESPN, but his flirtation with politics and increasingly pointed political commentary had generated real buzz. What if he changed his mind? His potential candidacy represents the ultimate outsider chaos factor in the Democratic field.",
      isWildcard: true,
      portraitEmoji: "\uD83C\uDFA4",
      slogan: "Quite Frankly, I'm Running",
      color: "#ff6f00",

      // Visible stats
      charisma: 85,
      debate: 72,
      fundraising: 55,
      discipline: 30,
      mediaHandling: 78,
      baseEnthusiasm: 68,
      crossoverAppeal: 55,
      scandalResistance: 40,

      // Hidden stats
      staffCompetence: 35,
      meltdownRisk: 80,
      ideologicalElasticity: 60,
      donorTrust: 25,
      authenticity: 70,
      eliteSupport: 15,
      viralPotential: 95,
      fatigueFactor: 35,

      vulnerabilities: [
        "Opposition attack line: zero political, governing, or policy experience of any kind",
        "Reported criticism: has a long archive of controversial on-air comments about athletes and public figures",
        "Opposition research: past remarks about domestic violence drew significant backlash and a suspension from ESPN",
        "Reported criticism: political positions are largely undefined and untested beyond media commentary",
        "Opposition attack line: candidacy would be framed as an ego-driven media stunt rather than a serious campaign"
      ],
      strengths: [
        "Massive name recognition and built-in audience of millions of daily viewers",
        "Natural entertainer who commands attention in any room or on any stage",
        "Unmatched ability to generate viral moments and dominate news cycles",
        "Appeals to male voters, particularly Black men, a key Democratic demographic",
        "Outsider status could be an asset in an anti-establishment political environment"
      ]
    },

    {
      id: "whitmer",
      name: "Gretchen Whitmer",
      party: "Democrat",
      title: "Governor of Michigan",
      age: 57,
      homeState: "Michigan",
      bio: "Gretchen Whitmer has served as Governor of Michigan since 2019, winning re-election by double digits in a quintessential battleground. She built a national brand on infrastructure ('fix the damn roads'), abortion rights, and a steady, plainspoken style that travels well in the industrial Midwest. Supporters see the clearest Blue Wall electability case in the field; critics point to pandemic-era lockdown fights and an at-times cautious national profile.",
      isWildcard: false,
      portraitEmoji: "🛣️",
      slogan: "Get It Done",
      color: "#2166d4",
      charisma: 74, debate: 76, fundraising: 78, discipline: 80, mediaHandling: 79, baseEnthusiasm: 66, crossoverAppeal: 70, scandalResistance: 68,
      staffCompetence: 82, meltdownRisk: 20, ideologicalElasticity: 55, donorTrust: 80, authenticity: 72, eliteSupport: 78, viralPotential: 48, fatigueFactor: 35,
      vulnerabilities: [
        "Opposition attack line: prolonged pandemic lockdowns drew lawsuits and national backlash",
        "Reported criticism: a checkered record on delivering the infrastructure promises she campaigned on",
        "Opposition research: critics say her national ambitions distract from Michigan"
      ],
      strengths: [
        "Proven battleground winner in the must-hold industrial Midwest",
        "Disciplined, kitchen-table communicator with crossover appeal",
        "Strong operation and fundraising base built over two terms"
      ]
    },

    {
      id: "booker",
      name: "Cory Booker",
      party: "Democrat",
      title: "U.S. Senator from New Jersey",
      age: 59,
      homeState: "New Jersey",
      bio: "Cory Booker has represented New Jersey in the Senate since 2013, following a high-profile tenure as Mayor of Newark. A gifted orator known for a relentlessly optimistic, unity-focused message and a record-setting marathon Senate floor speech, he blends preacher's cadence with Silicon Valley donor ties. Admirers see moral clarity and stagecraft; skeptics recall a 2020 primary run that never caught fire and question whether optimism sells in an angry era.",
      isWildcard: false,
      portraitEmoji: "✊",
      slogan: "A Cause to Believe In",
      color: "#2b7de1",
      charisma: 88, debate: 82, fundraising: 80, discipline: 68, mediaHandling: 84, baseEnthusiasm: 70, crossoverAppeal: 58, scandalResistance: 66,
      staffCompetence: 76, meltdownRisk: 22, ideologicalElasticity: 58, donorTrust: 82, authenticity: 66, eliteSupport: 74, viralPotential: 72, fatigueFactor: 40,
      vulnerabilities: [
        "Opposition attack line: deep ties to Wall Street and pharmaceutical donors",
        "Reported criticism: a 2020 presidential bid that failed to gain traction",
        "Opposition research: critics call his relentless optimism inauthentic and rehearsed"
      ],
      strengths: [
        "One of the most electric live speakers in American politics",
        "Big-city executive experience plus a decade in the Senate",
        "Deep national donor and small-dollar fundraising network"
      ]
    },

    {
      id: "beshear",
      name: "Andy Beshear",
      party: "Democrat",
      title: "Governor of Kentucky",
      age: 47,
      homeState: "Kentucky",
      bio: "Andy Beshear has twice won the governorship of deep-red Kentucky, an electability argument that writes itself. The son of a former governor, he built approval across party lines through disaster response, economic development wins, and a low-key, faith-and-family style. Supporters see the ultimate crossover candidate; critics question whether a red-state Democrat's caution scales to a national primary electorate.",
      isWildcard: false,
      portraitEmoji: "🔵",
      slogan: "A Team for Every American",
      color: "#3a86d4",
      charisma: 72, debate: 74, fundraising: 68, discipline: 82, mediaHandling: 78, baseEnthusiasm: 60, crossoverAppeal: 84, scandalResistance: 74,
      staffCompetence: 80, meltdownRisk: 16, ideologicalElasticity: 62, donorTrust: 70, authenticity: 78, eliteSupport: 66, viralPotential: 42, fatigueFactor: 30,
      vulnerabilities: [
        "Opposition attack line: a low national profile untested on the big stage",
        "Reported criticism: benefits from a family political dynasty in Kentucky",
        "Opposition research: red-state caution frustrates the progressive base"
      ],
      strengths: [
        "Won twice in one of the reddest states — unmatched electability proof",
        "Broad crossover appeal and high personal approval",
        "Calm, competent disaster-and-economy governing record"
      ]
    },

    {
      id: "moore",
      name: "Wes Moore",
      party: "Democrat",
      title: "Governor of Maryland",
      age: 47,
      homeState: "Maryland",
      bio: "Wes Moore, elected Governor of Maryland in 2022, is an Army combat veteran, bestselling author, and former nonprofit CEO who became the state's first Black governor. A charismatic newcomer with a soaring personal story, he is frequently named on national future-of-the-party lists. Admirers see once-in-a-generation talent; skeptics note a thin governing record and question whether a first-term governor is ready for the national gauntlet.",
      isWildcard: false,
      portraitEmoji: "🎖️",
      slogan: "Leave No One Behind",
      color: "#1f6fd0",
      charisma: 86, debate: 78, fundraising: 82, discipline: 74, mediaHandling: 82, baseEnthusiasm: 74, crossoverAppeal: 66, scandalResistance: 64,
      staffCompetence: 78, meltdownRisk: 24, ideologicalElasticity: 56, donorTrust: 80, authenticity: 76, eliteSupport: 76, viralPotential: 70, fatigueFactor: 38,
      vulnerabilities: [
        "Opposition attack line: a single-term governor with a thin record for the national stage",
        "Reported criticism: past resume discrepancies drew fact-check scrutiny",
        "Opposition research: untested under sustained national fire"
      ],
      strengths: [
        "Compelling combat-veteran and self-made personal story",
        "Magnetic communicator who energizes a broad coalition",
        "Strong fundraising and elite-network momentum as a rising star"
      ]
    }
  ],

  republicans: [
    // ── REPUBLICANS ─────────────────────────────────────────────────────
    {
      id: "vance",
      name: "J.D. Vance",
      party: "Republican",
      title: "Vice President of the United States",
      age: 43,
      homeState: "Ohio",
      bio: "J.D. Vance is the sitting Vice President of the United States and the massive 2028 Republican frontrunner, polling at 46% in GOP primary surveys as of early 2026. He rose to fame with his memoir 'Hillbilly Elegy,' was elected to the U.S. Senate from Ohio in 2022, and was selected as Donald Trump's running mate in 2024. As VP, he has positioned himself as the heir apparent to the populist-nationalist movement. Once a vocal Trump critic, his transformation into a loyal MAGA champion is both his greatest asset and his most scrutinized liability.",
      isWildcard: false,
      portraitEmoji: "\uD83C\uDFD4\uFE0F",
      slogan: "Fight for the Forgotten",
      color: "#c62828",

      // Visible stats
      charisma: 55,
      debate: 78,
      fundraising: 82,
      discipline: 62,
      mediaHandling: 60,
      baseEnthusiasm: 70,
      crossoverAppeal: 42,
      scandalResistance: 48,

      // Hidden stats
      staffCompetence: 68,
      meltdownRisk: 40,
      ideologicalElasticity: 55,
      donorTrust: 65,
      authenticity: 38,
      eliteSupport: 85,
      viralPotential: 60,
      fatigueFactor: 35,

      vulnerabilities: [
        "Opposition attack line: extensive archive of past anti-Trump statements, including reportedly calling Trump 'America's Hitler' in private messages",
        "Reported criticism: 'childless cat ladies' remark about Democratic leaders became a widely circulated liability",
        "Opposition research: his ideological conversion from Trump critic to Trump loyalist is framed as pure opportunism",
        "Reported criticism: polling as VP showed persistently low favorability ratings, including among independents",
        "Opposition attack line: venture capital career and Yale Law degree undercut his blue-collar populist branding",
        "Opposition attack line: tied to Trump administration's controversial policies including tariffs that 55% of Americans say hurt the economy"
      ],
      strengths: [
        "Compelling personal narrative from Appalachian poverty to national office",
        "Young enough to represent a generational shift for the Republican Party",
        "Intellectual framework for populist-nationalism appeals to policy-minded conservatives",
        "Strong debater with a prosecutorial, composed style",
        "Direct line to the Trump base as the anointed successor"
      ]
    },

    {
      id: "rubio",
      name: "Marco Rubio",
      party: "Republican",
      title: "Secretary of State",
      age: 57,
      homeState: "Florida",
      bio: "Marco Rubio serves as Secretary of State in the Trump administration, having left his Florida Senate seat to join the Cabinet. Previously representing Florida in the U.S. Senate since 2011 and once hailed as the future of the Republican Party, his 2016 presidential bid collapsed after a damaging debate performance against Chris Christie. His Cabinet role has given him significant foreign policy credentials, but he is now closely tied to the administration's record.",
      isWildcard: false,
      portraitEmoji: "\uD83C\uDF0E",
      slogan: "A New American Century",
      color: "#d32f2f",

      // Visible stats
      charisma: 62,
      debate: 60,
      fundraising: 70,
      discipline: 68,
      mediaHandling: 65,
      baseEnthusiasm: 45,
      crossoverAppeal: 58,
      scandalResistance: 65,

      // Hidden stats
      staffCompetence: 72,
      meltdownRisk: 45,
      ideologicalElasticity: 60,
      donorTrust: 72,
      authenticity: 45,
      eliteSupport: 78,
      viralPotential: 30,
      fatigueFactor: 60,

      vulnerabilities: [
        "Opposition attack line: the 2016 'robotic repetition' debate moment against Chris Christie remains a defining viral clip",
        "Reported criticism: voted against bipartisan immigration reform he himself helped author, raising flip-flop accusations",
        "Opposition research: repeatedly missed a high percentage of Senate votes, drawing 'absentee senator' criticism",
        "Reported criticism: personal financial struggles and use of a Republican Party credit card were widely reported",
        "Opposition attack line: failed to gain traction in 2016, losing his home state of Florida to Trump in the primary",
        "Opposition attack line: left the Senate to join an administration critics describe as chaotic"
      ],
      strengths: [
        "Deep foreign policy expertise, especially on Latin America and China",
        "Significant appeal to Latino and Cuban-American voters",
        "Polished public speaker when prepared and on-message",
        "Establishment credibility with major party donors and institutions",
        "Experience on the national stage as both candidate and Cabinet official"
      ]
    },

    {
      id: "desantis",
      name: "Ron DeSantis",
      party: "Republican",
      title: "Governor of Florida",
      age: 49,
      homeState: "Florida",
      bio: "Ron DeSantis won reelection as Florida Governor by nearly 20 points in 2022, establishing himself as one of the most dominant Republican state executives in a generation. His aggressive stance on cultural issues made him a hero to the party's base. However, his 2024 presidential bid collapsed amid criticism of his interpersonal skills and campaign management.",
      isWildcard: false,
      portraitEmoji: "\uD83C\uDF34",
      slogan: "Make America Florida",
      color: "#b71c1c",

      // Visible stats
      charisma: 40,
      debate: 62,
      fundraising: 75,
      discipline: 72,
      mediaHandling: 50,
      baseEnthusiasm: 60,
      crossoverAppeal: 40,
      scandalResistance: 62,

      // Hidden stats
      staffCompetence: 60,
      meltdownRisk: 35,
      ideologicalElasticity: 30,
      donorTrust: 55,
      authenticity: 50,
      eliteSupport: 55,
      viralPotential: 45,
      fatigueFactor: 65,

      vulnerabilities: [
        "Opposition attack line: 2024 presidential campaign burned through $150 million and collapsed before most primaries",
        "Reported criticism: widely described as awkward in retail politics and interpersonal interactions with voters",
        "Opposition research: his feud with Disney over the Reedy Creek district was characterized as government retaliation against free speech",
        "Reported criticism: campaign staff turnover and dysfunction were extensively documented during the 2024 race",
        "Opposition attack line: eating pudding with his fingers on a plane became an enduring and damaging viral moment"
      ],
      strengths: [
        "Won reelection by historic margin in a major swing-turned-red state",
        "Strong executive record on issues the Republican base prioritizes",
        "Harvard and Yale educated, projects policy competence",
        "Military veteran — served as a JAG officer deployed to Iraq and Guantanamo Bay",
        "Demonstrated ability to govern aggressively and move state policy rightward"
      ]
    },

    {
      id: "trumpjr",
      name: "Donald Trump Jr.",
      party: "Republican",
      title: "Political Commentator & Business Executive",
      age: 50,
      homeState: "Florida",
      bio: "Donald Trump Jr. is the eldest son of former President Donald Trump and has served as a prominent surrogate and fundraiser for the MAGA movement. He is a bestselling author and a fixture on conservative media and the political rally circuit. His candidacy would test whether the Trump political dynasty can transfer its support to the next generation.",
      isWildcard: false,
      portraitEmoji: "\uD83E\uDD85",
      slogan: "Keep the Fight Going",
      color: "#e53935",

      // Visible stats
      charisma: 62,
      debate: 48,
      fundraising: 78,
      discipline: 35,
      mediaHandling: 55,
      baseEnthusiasm: 72,
      crossoverAppeal: 22,
      scandalResistance: 35,

      // Hidden stats
      staffCompetence: 45,
      meltdownRisk: 70,
      ideologicalElasticity: 20,
      donorTrust: 60,
      authenticity: 52,
      eliteSupport: 35,
      viralPotential: 75,
      fatigueFactor: 55,

      vulnerabilities: [
        "Opposition attack line: attended the June 2016 Trump Tower meeting with a Russian lawyer offering 'dirt' on Hillary Clinton",
        "Reported criticism: no governing experience, elected office, or public policy credentials",
        "Opposition research: his involvement in the Trump Organization's business dealings exposes him to ongoing legal scrutiny",
        "Reported criticism: perceived as riding his father's name and movement rather than earning political standing independently",
        "Opposition attack line: social media posts and public remarks frequently generate controversy and opposition attack ads"
      ],
      strengths: [
        "Instant name recognition and automatic loyalty from the MAGA base",
        "Proven fundraising ability through the Trump small-dollar donor network",
        "Comfortable and effective as a rally speaker and red-meat campaigner",
        "Strong relationships with conservative media and influencer ecosystem",
        "Outdoor/hunting persona appeals to rural male voters"
      ]
    },

    {
      id: "ramaswamy",
      name: "Vivek Ramaswamy",
      party: "Republican",
      title: "Entrepreneur & Former Presidential Candidate",
      age: 42,
      homeState: "Ohio",
      bio: "Vivek Ramaswamy is a biotech entrepreneur who founded Roivant Sciences and burst onto the political scene with his 2024 presidential campaign. He ran as an outsider promising to dismantle the 'administrative state' and generated attention with his rapid-fire debate style. Despite dropping out and endorsing Trump, he built a national profile and donor base remarkably quickly.",
      isWildcard: false,
      portraitEmoji: "\uD83D\uDE80",
      slogan: "Truth — Hard Truths for a Soft Nation",
      color: "#ef5350",

      // Visible stats
      charisma: 70,
      debate: 75,
      fundraising: 65,
      discipline: 50,
      mediaHandling: 72,
      baseEnthusiasm: 55,
      crossoverAppeal: 38,
      scandalResistance: 52,

      // Hidden stats
      staffCompetence: 50,
      meltdownRisk: 55,
      ideologicalElasticity: 65,
      donorTrust: 55,
      authenticity: 40,
      eliteSupport: 40,
      viralPotential: 72,
      fatigueFactor: 45,

      vulnerabilities: [
        "Opposition attack line: zero governing or elected office experience of any kind",
        "Reported criticism: debate performances were criticized as rehearsed and gimmicky, including an awkward Eminem rap moment",
        "Opposition research: past statements praising figures across the political spectrum raise flip-flop concerns",
        "Reported criticism: his pharmaceutical company Roivant faced investor lawsuits and questions about its business model",
        "Opposition attack line: his rapid ideological shifts — from moderate to hard-right populist — undercut credibility"
      ],
      strengths: [
        "Self-funded wealth eliminates dependence on donor class",
        "Exceptionally fast and articulate communicator in any media format",
        "Youth and energy stand out in the Republican field",
        "First-generation American story appeals to aspirational voters",
        "Willingness to go on hostile media and engage every question"
      ]
    },

    // ── REPUBLICAN WILDCARD ─────────────────────────────────────────
    {
      id: "carlson",
      name: "Tucker Carlson",
      party: "Republican",
      title: "Media Host & Political Commentator",
      age: 58,
      homeState: "Maine",
      bio: "Tucker Carlson became the most-watched host in cable news history during his tenure at Fox News before his abrupt departure in 2023. He relaunched as an independent media figure, conducting high-profile interviews and building a massive direct audience. In March 2026, President Trump publicly criticized Carlson, saying he 'lost his way,' while Rep. Marjorie Taylor Greene suggested he should run for president — developments that paradoxically make him MORE viable as a wildcard outsider candidate. His populist-nationalist worldview and willingness to court controversy make him one of the most influential — and divisive — voices on the American right.",
      isWildcard: true,
      portraitEmoji: "\uD83D\uDCFA",
      slogan: "Ask the Questions They Don't Want Asked",
      color: "#ff1744",

      // Visible stats
      charisma: 75,
      debate: 80,
      fundraising: 62,
      discipline: 42,
      mediaHandling: 85,
      baseEnthusiasm: 78,
      crossoverAppeal: 25,
      scandalResistance: 32,

      // Hidden stats
      staffCompetence: 50,
      meltdownRisk: 60,
      ideologicalElasticity: 35,
      donorTrust: 40,
      authenticity: 55,
      eliteSupport: 30,
      viralPotential: 90,
      fatigueFactor: 40,

      vulnerabilities: [
        "Opposition attack line: fired from Fox News in 2023 amid the Dominion Voting Systems defamation lawsuit fallout",
        "Reported criticism: private text messages revealed during the Dominion lawsuit showed contempt for Trump and Fox viewers",
        "Opposition research: his 2024 interview with Vladimir Putin was widely criticized as softball and deferential",
        "Reported criticism: former head writer resigned after being exposed for posting racist and sexist content online",
        "Opposition attack line: years of archived Fox News segments provide extensive opposition research material on controversial claims",
        "Reported development: publicly rebuked by President Trump in March 2026, creating potential rift with MAGA base"
      ],
      strengths: [
        "One of the most talented television communicators of his generation",
        "Massive independent media audience not reliant on any network",
        "Populist messaging resonates with working-class voters disillusioned by both parties",
        "Ability to frame narratives and set the political conversation",
        "Outsider status — never held office, can credibly run against the political establishment"
      ]
    },

    {
      id: "haley_r",
      name: "Nikki Haley",
      party: "Republican",
      title: "Former UN Ambassador & Governor",
      age: 56,
      homeState: "South Carolina",
      bio: "Nikki Haley served two terms as Governor of South Carolina and as UN Ambassador before a strong 2024 presidential run that made her the last challenger standing. She pairs a hawkish foreign policy with a fiscally conservative, generational-change pitch and outsized appeal to suburban and independent voters. Supporters see the party's best general-election profile; the MAGA base remembers the primary attacks and questions her loyalty.",
      isWildcard: false,
      portraitEmoji: "🌟",
      slogan: "Strength and Clarity",
      color: "#c62828",
      charisma: 80, debate: 86, fundraising: 82, discipline: 82, mediaHandling: 84, baseEnthusiasm: 54, crossoverAppeal: 74, scandalResistance: 70,
      staffCompetence: 84, meltdownRisk: 18, ideologicalElasticity: 60, donorTrust: 86, authenticity: 64, eliteSupport: 80, viralPotential: 52, fatigueFactor: 36,
      vulnerabilities: [
        "Opposition attack line: the MAGA base distrusts her after a bitter 2024 primary",
        "Reported criticism: shifting positions on Trump seen as opportunistic",
        "Opposition research: hawkish foreign policy clashes with the restraint wing"
      ],
      strengths: [
        "Strongest suburban and independent crossover profile in the field",
        "Polished, formidable debater with executive and diplomatic experience",
        "Deep donor-class and establishment fundraising support"
      ]
    },

    {
      id: "youngkin_r",
      name: "Glenn Youngkin",
      party: "Republican",
      title: "Governor of Virginia",
      age: 61,
      homeState: "Virginia",
      bio: "Glenn Youngkin, a former Carlyle Group co-CEO, won the Virginia governorship in 2021 by threading the needle between Trump's base and the suburbs. His fleece-vest, business-friendly brand and focus on education and the economy made him a purple-state success story. Admirers see a fresh, electable outsider; critics question his thin political record and whether his suburban style survives a national MAGA primary.",
      isWildcard: false,
      portraitEmoji: "🧥",
      slogan: "Common Sense, Common Ground",
      color: "#d32f2f",
      charisma: 76, debate: 74, fundraising: 88, discipline: 78, mediaHandling: 78, baseEnthusiasm: 60, crossoverAppeal: 72, scandalResistance: 72,
      staffCompetence: 82, meltdownRisk: 18, ideologicalElasticity: 62, donorTrust: 90, authenticity: 68, eliteSupport: 78, viralPotential: 46, fatigueFactor: 32,
      vulnerabilities: [
        "Opposition attack line: a private-equity fortune that draws populist fire",
        "Reported criticism: thin political record beyond a single term",
        "Opposition research: tries to please both the base and the suburbs, satisfying neither"
      ],
      strengths: [
        "Proven suburban-plus-base coalition in a purple state",
        "Enormous self-funding and donor-network capacity",
        "Disciplined kitchen-table message on schools and the economy"
      ]
    },

    {
      id: "scott_r",
      name: "Tim Scott",
      party: "Republican",
      title: "U.S. Senator from South Carolina",
      age: 62,
      homeState: "South Carolina",
      bio: "Tim Scott, the Senate's optimistic messenger, built a brand on opportunity, faith, and an aspirational tone that stands out in an angry era. The only Black Republican in the Senate, he pairs solid conservative credentials with a coalition-expanding pitch. Supporters see a uniquely likable general-election weapon; critics say his sunny style lacks the edge the base craves and that his 2024 run never ignited.",
      isWildcard: false,
      portraitEmoji: "☀️",
      slogan: "The Land of Opportunity",
      color: "#e53935",
      charisma: 82, debate: 72, fundraising: 80, discipline: 80, mediaHandling: 80, baseEnthusiasm: 58, crossoverAppeal: 70, scandalResistance: 78,
      staffCompetence: 76, meltdownRisk: 14, ideologicalElasticity: 50, donorTrust: 84, authenticity: 78, eliteSupport: 74, viralPotential: 48, fatigueFactor: 34,
      vulnerabilities: [
        "Opposition attack line: a 2024 primary run that failed to catch fire",
        "Reported criticism: the base wants a fighter, not a sunny optimist",
        "Opposition research: light executive experience for the top job"
      ],
      strengths: [
        "Uniquely likable, coalition-expanding optimistic message",
        "Strong faith-and-opportunity brand with crossover reach",
        "High personal favorability and scandal resistance"
      ]
    },

    {
      id: "stefanik_r",
      name: "Elise Stefanik",
      party: "Republican",
      title: "House Republican Conference Chair",
      age: 44,
      homeState: "New York",
      bio: "Elise Stefanik rose from a moderate upstate New York backbencher to the No. 3 House Republican and one of the party's sharpest partisan brawlers. Her viral university-president hearings and unflinching loyalty made her a MAGA favorite and a fundraising powerhouse. Admirers see a disciplined attack-dog with a bright future; critics highlight her dramatic ideological transformation and question her general-election ceiling.",
      isWildcard: false,
      portraitEmoji: "⚔️",
      slogan: "Fight for America",
      color: "#b71c1c",
      charisma: 74, debate: 80, fundraising: 84, discipline: 78, mediaHandling: 80, baseEnthusiasm: 78, crossoverAppeal: 48, scandalResistance: 66,
      staffCompetence: 78, meltdownRisk: 24, ideologicalElasticity: 66, donorTrust: 82, authenticity: 56, eliteSupport: 72, viralPotential: 70, fatigueFactor: 38,
      vulnerabilities: [
        "Opposition attack line: a dramatic shift from moderate to hardline draws flip-flop charges",
        "Reported criticism: seen as prioritizing loyalty over independence",
        "Opposition research: a narrow, base-first profile with a low crossover ceiling"
      ],
      strengths: [
        "Disciplined, viral communicator who energizes the base",
        "Prolific fundraiser with a national small-dollar following",
        "Leadership experience and sharp debate-stage instincts"
      ]
    }
  ]
};

// ═══════════════════════════════════════════════
// Additional 2028 bench depth. These figures already appear in the ticket
// pool; presidential entries give both parties ten distinct campaign styles.
// Main briefly carried a second copy of four contenders per party while this
// branch was building the larger 16-person field below. Reconcile those
// overlapping additions here so candidate cards, VP eligibility, and portrait
// ids remain one-to-one.
const OVERLAPPING_ROSTER_IDS = {
  democrats: new Set(['whitmer', 'booker', 'beshear', 'moore']),
  republicans: new Set(['haley_r', 'youngkin_r', 'scott_r', 'stefanik_r']),
};
for (const party of ['democrats', 'republicans']) {
  window.CandidateData[party] = window.CandidateData[party].filter(candidate => !OVERLAPPING_ROSTER_IDS[party].has(candidate.id));
}

const EXPANDED_CANDIDATES = {
  democrats: [
    { id:'moore', name:'Wes Moore', title:'Governor of Maryland', age:49, homeState:'Maryland', slogan:'Leave No One Behind', color:'#2457a6', portraitEmoji:'🎖️', bio:'A veteran, author, and governor offering generational change with an executive record.', stats:[82,76,70,78,80,76,66,74,82,16,64,72,78,70,72,28], strengths:['Compelling personal story and disciplined national message','Executive experience with strong coalition appeal','Veteran credentials broaden the campaign profile'], vulnerabilities:['Opponents question whether one gubernatorial term is enough preparation','A rapid national rise invites intense scrutiny'] },
    { id:'whitmer', name:'Gretchen Whitmer', title:'Governor of Michigan', age:56, homeState:'Michigan', slogan:'Fix the Damn Things', color:'#3859a8', portraitEmoji:'🏭', bio:'A two-term Midwestern governor running on infrastructure, labor, and repeated swing-state victories.', stats:[80,78,76,84,82,72,74,76,86,14,68,80,76,68,62,30], strengths:['Proven winner in a decisive battleground state','Strong labor and suburban coalition','Executive record centered on tangible delivery'], vulnerabilities:['Opponents nationalize controversial pandemic-era decisions','Regional strength must translate beyond the Midwest'] },
    { id:'warnock', name:'Raphael Warnock', title:'U.S. Senator from Georgia', age:58, homeState:'Georgia', slogan:'A Voice for All of Us', color:'#4b55b4', portraitEmoji:'🎙️', bio:'A senator and pastor whose campaign rests on moral clarity, organizing, and victories in a closely divided state.', stats:[91,84,75,82,85,84,70,78,78,12,58,76,84,88,78,25], strengths:['Exceptional orator with a powerful organizing network','Repeated success in a competitive Southern state','Can energize the base while presenting an optimistic tone'], vulnerabilities:['Limited executive experience','Opposition attacks focus on a reliably liberal Senate voting record'] },
    { id:'beshear', name:'Andy Beshear', title:'Governor of Kentucky', age:50, homeState:'Kentucky', slogan:'Common Ground, Common Good', color:'#3574a8', portraitEmoji:'🤝', bio:'A red-state Democratic governor arguing that competence and local trust can break national polarization.', stats:[74,72,66,88,76,58,88,82,84,10,78,70,68,72,48,24], strengths:['Unusually strong crossover appeal','Calm executive style and disaster-response experience','Electability case is easy to explain'], vulnerabilities:['Moderate profile may struggle to excite ideological activists','Limited national fundraising network at launch'] },
  ],
  republicans: [
    { id:'youngkin', name:'Glenn Youngkin', title:'Former Governor of Virginia', age:61, homeState:'Virginia', slogan:'A New Day for America', color:'#b83a3a', portraitEmoji:'💼', bio:'A business-oriented conservative offering suburban appeal, education politics, and executive experience.', stats:[75,72,88,82,80,64,78,76,84,14,72,88,64,62,56,30], strengths:['Deep fundraising network and business résumé','Demonstrated suburban campaign strategy','Polished executive presentation'], vulnerabilities:['Must reconcile establishment donors with populist voters','Wealth and private-equity background invite attack ads'] },
    { id:'scott', name:'Tim Scott', title:'U.S. Senator from South Carolina', age:62, homeState:'South Carolina', slogan:'Faith in America', color:'#b34632', portraitEmoji:'🌅', bio:'An optimistic conservative senator building a coalition around faith, opportunity, and personal biography.', stats:[84,76,82,84,86,72,76,84,80,10,62,86,78,84,70,24], strengths:['Optimistic communicator with broad personal appeal','Strong donor relationships','Compelling biography and disciplined campaign style'], vulnerabilities:['Optimistic tone can be crowded out in a combative primary','Previous national campaign struggled to convert goodwill into votes'] },
    { id:'kemp', name:'Brian Kemp', title:'Governor of Georgia', age:64, homeState:'Georgia', slogan:'Results, Not Noise', color:'#a93333', portraitEmoji:'🍑', bio:'A two-term governor emphasizing conservative results, electoral independence, and swing-state durability.', stats:[70,70,76,90,74,68,82,86,88,8,54,80,58,72,46,22], strengths:['Strong executive record in a battleground state','Credibility across the conservative coalition','Highly disciplined political operation'], vulnerabilities:['Past clashes with national party leaders divide loyalists','Low-key style may struggle in spectacle-driven debates'] },
    { id:'britt', name:'Katie Britt', title:'U.S. Senator from Alabama', age:46, homeState:'Alabama', slogan:'Strong Families, Strong America', color:'#c14747', portraitEmoji:'⭐', bio:'A younger conservative senator presenting generational change, family policy, and business relationships.', stats:[76,68,84,80,72,78,60,72,76,18,60,86,66,70,74,28], strengths:['Generational contrast and strong fundraising potential','Connections to business and party networks','Can energize voters seeking a new national figure'], vulnerabilities:['Limited national campaign experience','High-profile media moments receive disproportionate scrutiny'] },
  ],
};

for (const [party, candidates] of Object.entries(EXPANDED_CANDIDATES)) {
  candidates.forEach(c => {
    const [charisma,debate,fundraising,discipline,mediaHandling,baseEnthusiasm,crossoverAppeal,scandalResistance,staffCompetence,meltdownRisk,ideologicalElasticity,donorTrust,authenticity,eliteSupport,viralPotential,fatigueFactor] = c.stats;
    delete c.stats;
    Object.assign(c, { party:party === 'democrats' ? 'Democrat' : 'Republican', isWildcard:false, charisma,debate,fundraising,discipline,mediaHandling,baseEnthusiasm,crossoverAppeal,scandalResistance,staffCompetence,meltdownRisk,ideologicalElasticity,donorTrust,authenticity,eliteSupport,viralPotential,fatigueFactor });
  });
  window.CandidateData[party].push(...candidates);
}

// RUNNING MATE OPTIONS
// Shared by the VP pick modal (player) and the AI opponent's week-25 pick.
// homeId drives the home-state polling boost in GameEngine.processVPPick.
// ═══════════════════════════════════════════════
window.CandidateData.vpOptions = {
  democrat: [
    { name: 'Gov. Wes Moore (MD)', homeId: 'MD', home: 'Maryland', desc: 'Young, charismatic governor. Boosts minority turnout and enthusiasm.', effects: { enthusiasm: 8, baseTurnout: 5, onlineInfluence: 4 } },
    { name: 'Sen. Mark Kelly (AZ)', homeId: 'AZ', home: 'Arizona', desc: 'Astronaut, veteran, swing-state senator. Maximizes crossover appeal.', effects: { crossoverAppeal: 8, approval: 4, persuadableSupport: 5 } },
    { name: 'Gov. Gretchen Whitmer (MI)', homeId: 'MI', home: 'Michigan', desc: 'Proven swing-state winner. Strengthens Midwest firewall.', effects: { groundGame: 6, baseTurnout: 4, surrogateStrength: 5 } },
    { name: 'Sen. Raphael Warnock (GA)', homeId: 'GA', home: 'Georgia', desc: 'Powerful orator from Georgia. Energizes the base and Southern strategy.', effects: { baseEnthusiasm: 7, enthusiasm: 5, surrogateStrength: 4 } },
    { name: 'Gov. Andy Beshear (KY)', homeId: 'KY', home: 'Kentucky', desc: 'Won in deep-red Kentucky. Ultimate electability argument.', effects: { crossoverAppeal: 10, persuadableSupport: 6, donorConfidence: 4 } },
  ],
  republican: [
    { name: 'Gov. Glenn Youngkin (VA)', homeId: 'VA', home: 'Virginia', desc: 'Business-friendly governor. Locks down suburban and donor support.', effects: { donorConfidence: 7, crossoverAppeal: 5, persuadableSupport: 5 } },
    { name: 'Sen. Tim Scott (SC)', homeId: 'SC', home: 'South Carolina', desc: 'Optimistic messenger with broad appeal. Expands the coalition.', effects: { crossoverAppeal: 6, approval: 5, enthusiasm: 4 } },
    { name: 'Rep. Elise Stefanik (NY)', homeId: 'NY', home: 'New York', desc: 'Fighter who energizes the MAGA base. Strong media presence.', effects: { baseEnthusiasm: 8, mediaScore: 5, onlineInfluence: 4 } },
    { name: 'Gov. Brian Kemp (GA)', homeId: 'GA', home: 'Georgia', desc: 'Proven Georgia winner. Ground game and swing-state credibility.', effects: { groundGame: 6, baseTurnout: 5, crossoverAppeal: 4 } },
    { name: 'Sen. Katie Britt (AL)', homeId: 'AL', home: 'Alabama', desc: 'Youngest woman in the Senate. Fresh face with fundraising strength.', effects: { fundraising: 5, enthusiasm: 5, onlineInfluence: 5 } },
  ],
};
