/** One atomic answer transaction; presentation and reloads never rescore it. */
window.DebateRound = {
    // [challenge, limited fallback, political tradeoff, testable first step].
    // These are authored constraints, not the same funding question with a new topic.
    challenges: {
        general_2_plan: ['A cheaper insurance card is not an appointment. If providers refuse the new reimbursement rates, how will patients actually get care?', 'protect emergency access before expanding enrollment into a network that cannot serve it', 'ask Congress to choose explicitly between higher provider payments and a narrower initial benefit', 'audit appointment waiting times in underserved counties before expanding the insurance benefit'],
        general_5_plan: ['Your energy plan needs both new capacity and grid connections. Which commitment changes if the lines are not ready when old plants retire?', 'delay a retirement until replacement capacity passes a reliability test', 'seek a temporary reliability appropriation while accepting a slower emissions timetable', 'publish a regional reserve-margin test before approving each retirement'],
        general_7_plan: ['Federal housing aid can raise bids before builders add homes. What prevents your plan from making the first year even more expensive?', 'phase buyer assistance behind verified additions to housing supply', 'ask cities to accept faster permitting even when existing homeowners object', 'compare rents and completed homes in participating and nonparticipating neighborhoods'],
        general_12_plan: ['Protecting benefits, adding investments, and cutting debt leaves a hard arithmetic problem. Which commitment gives way if your savings estimate is wrong?', 'pause unfunded new commitments while protecting existing legal obligations', 'return to Congress for an explicit tax-and-spending vote instead of counting unverified savings', 'publish a downside budget with automatic reviews when revenue misses the forecast'],
        general_scenario_6: ['The rural hospital can keep its emergency room or its maternity ward with the available grant, but not both. Who makes that choice?', 'keep emergency stabilization open and fund a safe regional maternity referral service', 'seek a larger appropriation and accept that another health project may be delayed', 'require an independent travel-time and patient-safety review before consolidating services'],
        general_scenario_7: ['The treatment fails for one patient in three, and its manufacturer refuses refunds. Would you still authorize the same public payment?', 'cap the initial treatment contract while negotiating an outcomes-based refund', 'ask Congress to fund access transparently even when the expected benefit is uncertain', 'start an independently monitored patient registry with a published stopping rule'],
        general_scenario_8: ['A small nursing home says the staffing standard will force it to close. Would you grant an exception, and who protects its residents?', 'allow a short, monitored transition only where residents have no safe alternative', 'seek targeted staffing funds while requiring owners to disclose profits and related-party payments', 'publish resident safety and staff-retention results before renewing a temporary exception'],
        general_scenario_12: ['Emergency generators would exceed normal pollution limits in neighborhoods already facing the worst air quality. What is your limit on that waiver?', 'limit generator waivers to hours needed to prevent medically dangerous outages', 'seek clean backup-power funds even if other emergency projects must wait', 'post real-time air-quality and outage data with an automatic waiver expiration'],
        general_scenario_13: ['The fastest transmission route crosses homes and tribal land. Would your deadline override consent, or would you accept a slower route?', 'compare alternate routes publicly and preserve required consultation before issuing permits', 'seek compensation and a negotiated route even if the election comes before construction', 'test whether a narrower existing corridor can carry the required power before taking new land'],
        general_scenario_14: ['A coastal backstop would also subsidize expensive vacation homes. Who is excluded, and what happens to residents who cannot afford to move?', 'limit disaster reinsurance to primary homes while offering means-tested relocation help', 'ask Congress to fund relocation now instead of promising repeated rebuilding indefinitely', 'evaluate voluntary buyouts against retrofit costs using future flood exposure'],
        general_scenario_21: ['The transit city accepts more apartments only if the federal government also pays for a school. Would you add the cost or withhold the grant?', 'stage the transit grant around a funded school-and-housing agreement', 'seek a larger local contribution rather than hiding the school cost in the housing estimate', 'release the first grant tranche only after both building permits and school capacity are verified'],
        general_scenario_22: ['Investors can divide purchases among shell companies. How would you enforce your housing policy without delaying ordinary buyers?', 'require beneficial-ownership disclosure before imposing a purchase restriction', 'seek enforcement staff and accept that a poorly funded restriction would be mostly symbolic', 'audit ownership transfers in the tightest markets before widening the rule'],
        general_scenario_23: ['Shelter opens tonight, but permanent housing takes two years. What will you tell people who cannot safely wait?', 'fund immediate safe shelter and treatment while publishing the permanent-housing schedule', 'ask Congress to fund operating costs as well as buildings rather than promise beds without staff', 'track stable housing placements and returns to homelessness, not just encampment removals'],
        general_scenario_36: ['Your recurring savings would arrive slowly while interest bills are due now. Would you borrow during the transition or cut current services?', 'borrow for a disclosed transition while keeping recurring savings on a binding review schedule', 'seek a near-term revenue vote rather than call delayed savings money already available', 'stress-test debt service against higher rates before setting the transition budget'],
        general_scenario_37: ['A cap on that popular tax credit means eligible households could lose it midway through the year. How would you allocate a limited benefit fairly?', 'announce a predictable income-based phaseout before the tax year begins', 'ask Congress to choose a smaller universal credit or a larger targeted one in a recorded vote', 'publish household distribution and take-up results before renewing the credit'],
        general_scenario_38: ['A temporary recession exception can become permanent borrowing. What observable condition would restart your debt-reduction schedule?', 'tie the restart to a published recovery threshold rather than an election date', 'seek a time-limited exception and return for a vote if the recession lasts longer', 'have an independent fiscal office report employment and revenue recovery every month'],
        primary_scenario_4: ['The first public-plan counties may have the weakest provider networks. How will you avoid declaring a coverage expansion that patients cannot use?', 'start enrollment only where participating providers meet access standards', 'ask the party to fund provider capacity before advertising nationwide availability', 'measure appointment access and patient costs in the first participating counties'],
        primary_scenario_5: ['Training a nurse takes longer than writing a staffing rule. What happens to your pledge during that gap?', 'phase staffing ratios alongside verified training and retention capacity', 'seek workforce funding before imposing penalties on hospitals with documented shortages', 'publish vacancy rates and patient outcomes during a time-limited staffing transition'],
        primary_scenario_8: ['Replacement jobs pay less than the coal jobs being lost. Does your guarantee cover the wage gap, and for how long?', 'offer time-limited wage insurance with a clearly funded expiration', 'ask the party to identify a recurring funding source before promising permanent income replacement', 'track former workers earnings and pension security rather than count ribbon-cutting announcements'],
        primary_scenario_9: ['Local ownership does not settle a renewable project that would damage a sensitive habitat. What would make you abandon the site?', 'reject the site if independent review finds damage that cannot be mitigated', 'defend a lawful rejection even if supporters accuse me of slowing the energy transition', 'compare habitat impacts and full grid costs at alternative sites before selecting one'],
        primary_scenario_14: ['Emergency rent aid expires before new apartments are finished. How will you prevent an eviction cliff between the two parts of your plan?', 'taper temporary aid against verified construction milestones and household need', 'seek bridge funding while disclosing that slower construction raises the total bill', 'track eviction filings and completed affordable units together before reducing support'],
        primary_scenario_15: ['Gradual zoning reform may not add homes for years. What would you offer the young families your homeowner supporters want to exclude today?', 'pair gradual zoning changes with near-term conversions of already vacant buildings', 'tell homeowners that federal infrastructure support requires a credible path to more homes', 'publish permits and completed starter homes so a zoning vote cannot substitute for actual supply'],
        primary_scenario_24: ['Your platform committee refuses to drop either the tax cuts or the spending promises. Would you accept a nomination on numbers you reject?', 'publish my own funded sequence and identify which platform commitments must wait', 'seek a convention vote on the unfunded promises even at the cost of party unity', 'require independent scoring of the first budget before authorizing permanent commitments'],
        primary_scenario_25: ['The low-growth case in your budget still misses its target. What specific safeguard activates without another optimistic forecast?', 'freeze new unpaid commitments when the published revenue trigger is missed', 'ask Congress to vote on a preannounced revenue-and-spending correction', 'run the budget through a sustained low-growth stress case before setting any permanent tax cut'],
    },
    answer(ctx,index) {
        const gs=window.GameEngine.state, q=ctx?.questions[ctx.idx], response=q?.responses[index];
        if(!response || ctx.answered) return null;
        let playerScore=0,opponentScore=0;
        for(const [key,value] of Object.entries(response.effects)) if(Object.hasOwn(ctx.playerScores,key)) {
            ctx.playerScores[key]+=value;playerScore+=value;
        }
        let consistency='';
        if(q.issueKey && response.stance!==undefined) {
            const distance=Math.abs((gs.platform?.[q.issueKey]||0)-response.stance);
            const adjustment=distance<=1?3:distance>=3?-4:0;
            ctx.playerScores.authenticity+=adjustment;playerScore+=adjustment;
            consistency=adjustment>0?'This answer matches your platform.':adjustment<0?'This answer conflicts with your platform.':'';
        }
        const verdict=q.isRecordQuestion?window.CareerSystem.factCheck(q,response):null;
        if(verdict) {
            gs.accountability.answered.push({week:gs.week,questionId:q.id,liability:q.family,claim:response.claim});
            gs.accountability.factChecks.push({week:gs.week,questionId:q.id,verdict,fact:q.factCheck});
        }
        const oc=ctx.debateOpponent||gs.opponentCandidate, DC=window.DebateContent;
        const preferred=q.responses.filter(r=>r.stance!==undefined).sort((a,b)=>Math.abs(a.stance-(oc.party==='Democrat'?-1:1))-Math.abs(b.stance-(oc.party==='Democrat'?-1:1)))[0];
        const line=q.isRecordQuestion
            ?{text:`The public record is clear: ${q.factCheck} My question is how the president will fund the next step and accept independent oversight.`,scores:{press:7,policy:7,suburban:5,donors:4,base:5,viral:4,authenticity:6}}
            :preferred?{text:preferred.text,scores:preferred.effects}
            :DC.getOpponentResponse(q.topic,ctx.opponentStrategy);
        const skill=ctx.primaryMode?(oc.debate||55):gs.opponent.debateSkill;
        for(const [key,value] of Object.entries(line.scores)) if(Object.hasOwn(ctx.opponentScores,key)) {
            const adjusted=Math.round(value*.7*(1+(skill-50)/150)*10)/10;
            ctx.opponentScores[key]+=adjusted;opponentScore+=adjusted;
        }
        const winner=playerScore>opponentScore+3?'player':opponentScore>playerScore+3?'opponent':'tie';
        ctx.questionWins[winner]++;
        const pool=DC.audienceReactions[winner==='player'?'strong':winner==='opponent'?'weak':'neutral'];
        ctx.answered=true;
        ctx.lastAnswer={questionId:q.id,index,playerScore,opponentScore,verdict,consistency,opponentText:line.text,
            winner,reaction:pool[Math.floor(window.GameEngine.random()*pool.length)]};
        if(response.pledge) {
            const career=window.CareerSystem.ensure(gs), pledge=response.pledge;
            if(!career.promises.some(p=>p.id===pledge.id)) career.promises.push({...pledge,term:gs.isIncumbentRun?2:1,status:'ACTIVE',madeWeek:gs.week,source:q.id});
        }
        const follow=this.followUp(q,response,ctx);
        if(follow) {
            ctx.questions.splice(ctx.idx+1,0,follow);ctx.followUps=(ctx.followUps||0)+1;
            window.CareerSystem.ensure(gs).usedQuestionIds.push(follow.id);
        }
        window.CareerSystem.record('debate_answer',{questionId:q.id,responseId:response.id||index,text:response.text,verdict});
        return ctx.lastAnswer;
    },
    followUp(q,response,ctx) {
        const gs=window.GameEngine.state,career=window.CareerSystem.ensure(gs),id=`${q.id}_followup`;
        if(q.isFollowUp || (ctx.followUps||0)>=2 || career.usedQuestionIds.includes(id)) return null;
        const fact=q.isRecordQuestion && window.CareerSystem.factCheck(q,response);
        let challenge=this.challenges[q.id];
        const costly=!!challenge;
        if(!costly && !['CONTRADICTED','MISLEADING','UNVERIFIABLE'].includes(fact)) return null;
        if(fact) {
            const round=Number(q.id.match(/_(\d+)$/)?.[1]||0);
            const follow=['Which part of that baseline will you formally correct before asking voters for another mandate?', 'What funding will you stop or redirect if the proposed correction misses its first public review?', 'Will you allow independent reviewers to recommend ending the policy, even if that undermines your legacy?'][round%3];
            challenge=[`The claim is ${fact.toLowerCase()}; a future promise is not a verified result. The documented baseline is: ${q.factCheck} ${follow}`,
                `publish a correction tied to this baseline: ${q.factCheck}`,
                `submit the disputed ${q.topic.toLowerCase()} commitment to a recorded congressional vote`,
                `commission an independent ${round===0?'baseline audit':round===1?'funding review':'continuation assessment'} of this record: ${q.factCheck}`];
        }
        const metric=q.family?.includes('war')?'peace':q.family?.includes('debt')||q.topic==='Debt & Taxes'?'balance':'delivery';
        const commitment=metric==='peace'?'end active combat by month 12 of the next term':metric==='balance'?'deliver twelve consecutive balanced months by the end of the next term':'fully implement at least one new law by month 24 of the next term';
        return {id,family:q.family,topic:`Follow-up: ${q.topic}`,isFollowUp:true,
            question:challenge[0],
            responses:[
                {text:`I will ${challenge[1]}. I also commit to ${commitment}; record that separate obligation and judge me against its deadline.`,pledge:{id:`pledge_${q.id}`,name:`${q.topic}: ${commitment}`,metric,dueMonth:metric==='peace'?12:metric==='balance'?48:24},effects:{policy:7,authenticity:7,press:5,donors:1,base:3,viral:2,suburban:5},riskLevel:'moderate'},
                {text:`I will ${challenge[1]}. That is the limit I can defend with the resources available; I will not guarantee the larger outcome before it is funded.`,effects:{policy:6,authenticity:6,press:6,donors:4,base:-2,viral:1,suburban:5},riskLevel:'safe'},
                {text:`I will ${challenge[2]}. I will campaign publicly for that choice, but persuasion is not a funding source and Congress may still refuse.`,effects:{policy:1,authenticity:4,press:1,donors:-2,base:8,viral:7,suburban:-1},riskLevel:'risky'},
                {text:`First I will ${challenge[3]}. I will return to Congress with the evidence before requesting a larger commitment.`,effects:{policy:7,authenticity:5,press:5,donors:5,base:1,viral:0,suburban:6},riskLevel:'safe'},
            ]};
    },
    complete(ctx) {
        if(ctx.completed) return ctx.completed;
        const winner=window.DebateSystem.calculateWinner(ctx.playerScores,ctx.opponentScores);
        const result=window.GameEngine.processDebateResults(ctx.playerScores,ctx.opponentScores,winner,{primaryMode:ctx.primaryMode});
        return ctx.completed={winner,result};
    },
};
