/**
 * Election 2028 — expanded debate book.
 * Fifteen distinct topics cover all three general-election debates without
 * repeating until the complete book has been used. Player choices are spoken
 * answers rather than stage directions; opponent answers rotate by topic.
 */
(function () {
    const D = window.EventSystem && window.EventSystem.DebateSystem;
    if (!D) return;
    const R = (text, effects, riskLevel) => ({ text, effects, riskLevel });
    const safe = { press:7, policy:8, suburban:6, donors:5, base:3, viral:2, authenticity:5 };
    const human = { press:4, policy:4, suburban:6, donors:2, base:6, viral:7, authenticity:8 };
    const contrast = { press:5, policy:4, suburban:3, donors:3, base:8, viral:7, authenticity:5 };
    const bold = { press:4, policy:6, suburban:2, donors:-1, base:9, viral:9, authenticity:7 };
    D.questions = [
        { topic:'Economy', question:'Prices remain high even as headline economic numbers improve. What would you do in your first hundred days?', responses:[
            R('I will cut housing and prescription costs, expand the child tax credit, and reward companies that build and hire here at home.', safe, 'safe'),
            R('I met a warehouse worker holding two jobs who still cannot cover rent. My test is simple: does this policy give that family breathing room?', human, 'moderate'),
            R('My opponent helped write the policies that raised your bills, then called the result a success. I will end that complacency.', contrast, 'moderate'),
            R('I will put an emergency cost-of-living package on Congress’s desk on day one and veto any bill that does not lower household costs.', bold, 'risky') ] },
        { topic:'Immigration', question:'What combination of enforcement and legal reform could actually pass Congress and work at the border?', responses:[
            R('Add agents and judges, use modern screening at ports, and pair firm enforcement with an earned legal pathway for long-settled families.', safe, 'safe'),
            R('Border communities deserve order, and immigrant families deserve dignity. A serious president can defend both without using people as props.', human, 'moderate'),
            R('Both parties have preferred the border as a campaign weapon. I will force an up-or-down vote on a complete reform bill.', contrast, 'moderate'),
            R('I will declare the broken asylum backlog a national priority and demand measurable control of the border within my first year.', bold, 'risky') ] },
        { topic:'Healthcare', question:'Families say premiums, deductibles, and drug prices still make care unaffordable. What changes?', responses:[
            R('Cap out-of-pocket drug costs, negotiate more prices, and create a competitive public plan people may choose without losing current coverage.', safe, 'safe'),
            R('No parent should calculate whether an emergency-room visit is worth the debt. Healthcare policy begins with that moral reality.', human, 'moderate'),
            R('My opponent’s plan protects the companies sending denial letters. Mine protects the patient opening one.', contrast, 'moderate'),
            R('Healthcare is a right, and I will use every tool of the presidency to make universal, affordable coverage the law.', bold, 'risky') ] },
        { topic:'Democracy & Institutions', question:'What specific reforms would restore trust in elections, Congress, and the presidency?', responses:[
            R('Ban congressional stock trading, disclose dark money, protect election workers, and impose enforceable ethics rules on every branch.', safe, 'safe'),
            R('Citizens do not owe government their trust. Leaders must earn it again by telling the truth, admitting mistakes, and delivering results.', human, 'moderate'),
            R('My opponent treats rules as obstacles whenever accountability arrives. No president should be above the law, including me.', contrast, 'moderate'),
            R('I will seek a constitutional reform commission on ethics, emergency powers, term limits, and the machinery of fair elections.', bold, 'risky') ] },
        { topic:'Foreign Policy', question:'Where should America draw the line between defending allies and avoiding another open-ended war?', responses:[
            R('Use strong alliances, clear objectives, congressional authorization, and diplomacy backed by credible force—not blank checks or empty threats.', safe, 'safe'),
            R('Before troops deploy, a president owes every military family an honest answer about the mission, the cost, and the way home.', human, 'moderate'),
            R('My opponent confuses volume with strength. Real strength is assembling allies and leaving adversaries isolated.', contrast, 'moderate'),
            R('I will end open-ended commitments that lack a defined American interest and redirect our strategy toward the threats of this decade.', bold, 'risky') ] },
        { topic:'Climate & Energy', question:'How will you cut emissions while keeping power reliable and affordable?', responses:[
            R('Build nuclear, renewables, storage, and a modern grid faster while helping workers and communities lead the new energy economy.', safe, 'safe'),
            R('The farmer losing a crop and the family facing a huge utility bill are living the same energy challenge. We must solve both.', human, 'moderate'),
            R('My opponent offers slogans while foreign competitors build the industries and jobs of the future. America should lead them.', contrast, 'moderate'),
            R('I will launch the largest domestic energy build-out in generations and judge every project by reliability, cost, jobs, and emissions.', bold, 'risky') ] },
        { topic:'Culture & Values', question:'How would you lower the temperature on disputes involving faith, identity, schools, and family life?', responses:[
            R('Protect equal rights, respect parental involvement, and stop using federal power to turn every local disagreement into a national war.', safe, 'safe'),
            R('Most Americans love someone who votes, worships, or lives differently. A president should speak to that generosity, not exploit the difference.', human, 'moderate'),
            R('My opponent needs neighbors to fear one another because division is easier than governing. I reject that politics.', contrast, 'moderate'),
            R('I will use the presidency as a national bully pulpit against discrimination and political intimidation from either extreme.', bold, 'risky') ] },
        { topic:'Housing', question:'Homeownership and rent are increasingly out of reach. What can Washington realistically do?', responses:[
            R('Reward cities that build more homes, expand starter-home credit, convert vacant offices, and prosecute price fixing in rental markets.', safe, 'safe'),
            R('A teacher should be able to live near the school and a young family should be able to buy in the community they serve.', human, 'moderate'),
            R('My opponent protects every rule and tax break that keeps supply scarce and investors ahead of first-time buyers.', contrast, 'moderate'),
            R('I will make three million new homes a national goal and tie federal infrastructure money to communities that permit building.', bold, 'risky') ] },
        { topic:'Education', question:'What should the federal government do about learning loss, college costs, and workforce preparation?', responses:[
            R('Fund evidence-based tutoring, strengthen career education, demand college price transparency, and expand apprenticeships with employers.', safe, 'safe'),
            R('Every child deserves a great teacher and a clear path after graduation, whether that path is college, a trade, service, or a business.', human, 'moderate'),
            R('My opponent offers another education culture war. I am offering smaller gaps, stronger skills, and lower bills.', contrast, 'moderate'),
            R('I will condition federal education dollars on transparent outcomes so families can see whether institutions actually deliver.', bold, 'risky') ] },
        { topic:'Reproductive Rights', question:'What national policy should govern abortion and reproductive healthcare?', responses:[
            R('Protect access to contraception and fertility care, set clear medical protections, and seek a durable national compromise voters understand.', safe, 'safe'),
            R('These decisions involve health, faith, family, and sometimes tragedy. Politicians should approach them with humility and compassion.', human, 'moderate'),
            R('My opponent speaks in abstractions while real patients and doctors face criminal uncertainty. Leadership requires a clear answer.', contrast, 'moderate'),
            R('I will make restoring my party’s national standard a first-year priority and force Congress to put every member on record.', bold, 'risky') ] },
        { topic:'Crime & Justice', question:'How would you reduce violent crime while improving trust in the justice system?', responses:[
            R('Target repeat violent offenders, solve more crimes, fund accountable community policing, and expand treatment and reentry that reduce recidivism.', safe, 'safe'),
            R('Safe neighborhoods and fair policing are not competing values. Families in the hardest-hit communities demand both.', human, 'moderate'),
            R('My opponent offers either denial or fear. I offer the prosecutors, prevention, standards, and local partnerships that work.', contrast, 'moderate'),
            R('I will establish national performance grants tied to clearance rates, constitutional policing, and measurable reductions in violence.', bold, 'risky') ] },
        { topic:'Technology & AI', question:'How should America capture AI’s benefits without sacrificing jobs, privacy, or national security?', responses:[
            R('Set enforceable safety and privacy rules, invest in American chips and energy, and give workers portable training accounts as jobs change.', safe, 'safe'),
            R('Technology should make a nurse, mechanic, or small-business owner more capable—not make them disposable.', human, 'moderate'),
            R('My opponent’s donors want rules written in private. I want transparent standards the public can inspect and Congress can enforce.', contrast, 'moderate'),
            R('I will create a national AI compact covering frontier-model testing, child safety, election deception, and worker transition.', bold, 'risky') ] },
        { topic:'Debt & Taxes', question:'The national debt is rising. Which taxes or programs would you change to put it on a sustainable path?', responses:[
            R('Protect earned benefits, end wasteful subsidies, enforce the tax code, and require every new permanent program or tax cut to be paid for.', safe, 'safe'),
            R('Fiscal choices are moral choices: keep promises to seniors, invest in children, and stop sending the bill to people who cannot vote yet.', human, 'moderate'),
            R('My opponent’s arithmetic depends on growth fairy tales and unnamed cuts. I will publish mine line by line.', contrast, 'moderate'),
            R('I will submit a balanced ten-year framework and veto any reconciliation bill that increases the long-term structural deficit.', bold, 'risky') ] },
        { topic:'Presidential Power', question:'What limits would you place on your own use of executive orders, emergency powers, and military force?', responses:[
            R('Publish legal rationales, set expiration dates for emergencies, consult Congress early, and accept independent oversight even when inconvenient.', safe, 'safe'),
            R('Character is what a president refuses to do when power makes it easy. I will never treat constitutional limits as technicalities.', human, 'moderate'),
            R('My opponent promises restraint now but celebrates executive power whenever their side controls it. The rules must apply consistently.', contrast, 'moderate'),
            R('I will ask Congress to replace vague emergency statutes with narrow authorities, automatic sunsets, and expedited judicial review.', bold, 'risky') ] },
        { topic:'Closing Statement', question:'What is the clearest reason voters should trust you with the presidency?', responses:[
            R('I have shown you a practical agenda, a serious team, and respect for the limits of this office. I am ready to deliver from day one.', safe, 'safe'),
            R('This campaign is about the people who keep the country running and rarely get the microphone. I will carry their stories into every decision.', human, 'moderate'),
            R('The choice is between another four years of grievance and a government focused relentlessly on your future.', contrast, 'moderate'),
            R('Give me this mandate and I will use every day of it to rebuild American confidence, capacity, and common purpose.', bold, 'risky') ] },
    ];

    // Keep the fifteen foundations once. DebateScenarios adds 45 genuinely
    // different dilemmas, rather than manufacturing four cosmetic framings.
    D.questions = D.questions.map((base, baseIndex) => ({
        ...base,
        id:`general_${baseIndex}_plan`,
        question:`Give voters a concrete governing plan: ${base.question} Be specific about your first year.`,
        responses:base.responses.map((response, responseIndex) => ({
            ...response,
            id:`general_${baseIndex}_plan_r${responseIndex}`,
            text:response.text + ' I will publish the timetable and let voters measure the result.',
            effects:{ ...response.effects },
        })),
    }));

    D.generateDebateQuestions = function (count) {
        const gs = window.GameEngine && window.GameEngine.state;
        const career = gs && window.CareerSystem ? window.CareerSystem.ensure(gs) : null;
        const usedIds = new Set(career ? career.usedQuestionIds : []);
        const usedTopics = new Set((gs && gs.debateTopicHistory) || []);
        if (gs?.concurrentCampaign && gs.presidency) {
            const p=gs.presidency;
            gs.accountability.docket=window.CareerSystem.buildDocket({...gs.incumbentSeed,debt:p.fiscal.debt,deficit:p.fiscal.deficit,approval:p.approval,gdp:p.economy.gdp,inflation:p.economy.inflation,scandals:p.scandals.length,signatureDone:!!p.signature?.done,signatureName:p.signature?.name},career);
        }
        const bank=gs?.phase==='primary' && this.primaryQuestions?this.primaryQuestions:this.questions;
        const recordQuestions = gs && gs.isIncumbentRun && window.CareerSystem
            ? window.CareerSystem.recordQuestions(gs.accountability && gs.accountability.docket)
                .filter(q => !usedIds.has(q.id))
            : [];
        const needed = Math.min(5,count || 5);
        const recordSlots = Math.min(2, recordQuestions.length, needed);
        const onePerTopic = pool => {
            const grouped = new Map();
            for (const question of pool) {
                if (!grouped.has(question.topic)) grouped.set(question.topic, []);
                grouped.get(question.topic).push(question);
            }
            return [...grouped.values()].map(group => group[Math.floor(window.GameEngine.random() * group.length)]);
        };
        let available = onePerTopic(bank.filter(q => !usedIds.has(q.id) && !usedTopics.has(q.topic)));
        if (available.length < needed - recordSlots) {
            available = onePerTopic(bank.filter(q => !usedIds.has(q.id)));
        }
        for (let i = available.length - 1; i > 0; i--) {
            const j = Math.floor(window.GameEngine.random() * (i + 1));
            [available[i], available[j]] = [available[j], available[i]];
        }
        const families=new Map();
        for (const q of recordQuestions) if (!families.has(q.family)) families.set(q.family,q);
        const byFamily=[...families.values()].sort((a,b)=>
            [...usedIds].filter(id=>id.startsWith(`incumbent_${a.family}_`)).length-
            [...usedIds].filter(id=>id.startsWith(`incumbent_${b.family}_`)).length);
        const records=byFamily.slice(0,recordSlots);
        if (records.length<recordSlots) records.push(...recordQuestions.filter(q=>!records.includes(q)).slice(0,recordSlots-records.length));
        const selected = [...records, ...available.slice(0, needed - recordSlots)];
        if (gs) {
            gs.debateTopicHistory = [...(gs.debateTopicHistory || []), ...selected.map(q => q.topic)];
            if (career) career.usedQuestionIds.push(...selected.map(q => q.id));
        }
        return selected.map(q => {
            const contextual=window.DebateScenarios?.forParty(q,gs?.playerParty)||q;
            return {...contextual,responses:contextual.responses.map(r=>({...r,effects:{...r.effects}}))};
        });
    };

    const opponentBook = {
        Housing:['Build more homes near jobs and transit, cut permitting delays, and stop federal policy from rewarding scarcity.','Use tax credits and public-private construction to lower rent without turning housing into another permanent bureaucracy.','Put first-time buyers ahead of institutional investors and make communities receiving federal money permit more homes.','Expand supply, protect local control, and target help to working families instead of inflating demand with blank checks.'],
        Education:['Invest in teachers, tutoring, and affordable pathways from high school to college or a trade.','Demand measurable results, expand career programs, and help families choose the school that fits their child.','Return authority to parents, reward excellent teachers, and make schools teach skills rather than ideology.','Pair high standards with local control, stronger career education, and honest information for parents.'],
        'Reproductive Rights':['Restore national protections while expanding contraception, maternal care, and support for families.','Protect reproductive healthcare while seeking clear safeguards that can survive changes in political power.','Defend life, support mothers, protect conscience, and let elected lawmakers—not unelected judges—set policy.','Seek a durable standard with medical exceptions, support for mothers, and respect for voters in the states.'],
        'Crime & Justice':['Fund accountable policing, violence interruption, and reforms that make both safety and justice real.','Put more effective officers on the street, improve clearance rates, and expand treatment that reduces repeat crime.','Back law enforcement, punish violent offenders, and stop prosecutors from treating public safety as optional.','Target violent crime, support constitutional policing, and measure policies by whether neighborhoods become safer.'],
        'Technology & AI':['Set strong privacy and safety rules while investing in workers and American innovation.','Create enforceable standards for powerful systems without freezing the startups that will build the future.','Beat China in chips, energy, and AI while protecting children and stopping government censorship through algorithms.','Lead global AI standards, protect data, and help workers adapt without smothering innovation.'],
        'Debt & Taxes':['Ask the wealthy to pay what they owe, cut waste, and protect Social Security and Medicare.','Use honest pay-fors, targeted growth investments, and bipartisan entitlement reform that protects beneficiaries.','Cut wasteful spending, unleash growth, and stop Washington from taxing the country into decline.','Pair pro-growth tax reform with enforceable spending limits and protection for earned benefits.'],
        'Presidential Power':['Restore congressional oversight, protect inspectors general, and treat constitutional limits as obligations.','Use executive power narrowly, publish the legal case, and invite review instead of evading it.','Use lawful authority decisively while returning power captured by permanent bureaucracies to elected government.','Set sunsets on emergencies, consult Congress, and preserve the tools needed to respond quickly to genuine threats.'],
        'Closing Statement':['This election is a choice between concentrated power and an economy and democracy that work for everyone.','I will bring competence, decency, and measurable progress back to the center of American government.','I will restore strength, secure the country, and put working Americans ahead of Washington’s ruling class.','I offer steady leadership, economic freedom, secure communities, and a country confident in itself again.'],
    };
    const strategies = ['democrat_progressive','democrat_moderate','republican_conservative','republican_moderate'];
    window.DebateContent.getOpponentResponse = function (topic, strategy) {
        const basePool = this.opponentResponses[topic] || null;
        const base = basePool && basePool[strategy];
        const authored = opponentBook[topic];
        if (authored) {
            const idx = Math.max(0, strategies.indexOf(strategy));
            const scoring = (base || this.genericResponses[strategy]).scores;
            return { text:authored[idx], scores:{ ...scoring } };
        }
        return base || this.genericResponses[strategy];
    };
})();
