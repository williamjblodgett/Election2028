/** One identity across presidential, VP, cabinet and historical roles. */
window.People = {
    key(person) {return person.personId || String(person.name||person.id).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]/g,'');},
    registry:{},
    add(profile,role) {
        const id=this.key(profile);profile.personId=id;
        const person=this.registry[id]||(this.registry[id]={id,name:profile.name,roles:[],profileIds:[]});
        if(!person.roles.includes(role)) person.roles.push(role);
        if(!person.profileIds.includes(profile.id)) person.profileIds.push(profile.id);
    },
    install() {
        for(const c of [...window.CandidateData.democrats,...window.CandidateData.republicans,...window.LegendData.democrats,...window.LegendData.republicans]) this.add(c,'president');
        for(const party of Object.values(window.VPData.curatedProfiles)) for(const c of Object.values(party)) this.add(c,'vice president');
        for(const party of Object.values(window.CabinetData.OPTIONS)) for(const [post,pool] of Object.entries(party)) for(const c of pool) this.add(c,post);
    },
};
window.People.install();

/** Fictional game abilities, not claims about real-world conduct. Once per campaign. */
window.CandidateHooks = {
    data:{
        newsom:['National contrast tour','mediaScore',9,'persuadableSupport',4,'NV'],
        buttigieg:['Explain the hard part','debateSkill',9,'enthusiasm',4,'MI'],
        aoc:['Small-dollar insurgency','onlineInfluence',10,'donorConfidence',6,'NY'],
        harris:['Prosecutor’s closing case','debateSkill',8,'baseTurnout',3,'GA'],
        shapiro:['Keystone coalition','groundGame',8,'surrogateStrength',3,'PA'],
        stephensmith:['Prime-time crossover','mediaScore',11,'debateSkill',5,'NC'],
        moore:['Service and opportunity','enthusiasm',8,'donorConfidence',3,'VA'],
        whitmer:['Build things caucus','groundGame',9,'onlineInfluence',4,'MI'],
        warnock:['Sunday-to-Tuesday organizing','baseTurnout',9,'mediaScore',4,'GA'],
        beshear:['Cross-party trust tour','persuadableSupport',9,'baseTurnout',4,'KY'],
        pritzker:['Executive-scale organization','surrogateStrength',10,'authenticity',5,'WI'],
        booker:['Optimism on the ground','enthusiasm',10,'debateSkill',4,'NJ'],
        polis:['Western independence','persuadableSupport',8,'surrogateStrength',4,'CO'],
        khanna:['Industrial innovation forum','donorConfidence',8,'enthusiasm',4,'PA'],
        gallego:['Veterans and border towns','groundGame',10,'mediaScore',4,'AZ'],
        slotkin:['Security briefing tour','debateSkill',8,'onlineInfluence',4,'MI'],
        vance:['Industrial heartland tour','baseTurnout',8,'donorConfidence',4,'OH'],
        rubio:['Opportunity and security','persuadableSupport',8,'enthusiasm',4,'NV'],
        desantis:['Executive discipline week','groundGame',9,'mediaScore',4,'FL'],
        trumpjr:['Movement roadshow','enthusiasm',11,'persuadableSupport',6,'PA'],
        ramaswamy:['Disruption livestream','onlineInfluence',11,'surrogateStrength',5,'OH'],
        carlson:['Long-form counterprogramming','mediaScore',10,'donorConfidence',5,'WI'],
        youngkin:['Suburban business coalition','donorConfidence',9,'baseTurnout',4,'VA'],
        scott:['Opportunity testimony','persuadableSupport',9,'onlineInfluence',4,'SC'],
        kemp:['Local organization first','groundGame',10,'surrogateStrength',4,'GA'],
        britt:['Next-generation town halls','mediaScore',8,'debateSkill',3,'NC'],
        hawley:['Antitrust populist tour','baseTurnout',9,'donorConfidence',5,'MO'],
        cotton:['National-security roundtable','debateSkill',9,'persuadableSupport',4,'VA'],
        cruz:['Constitutional cross-examination','debateSkill',11,'persuadableSupport',6,'TX'],
        noem:['Rural freedom circuit','enthusiasm',9,'mediaScore',4,'IA'],
        donalds:['New-generation media blitz','onlineInfluence',9,'debateSkill',4,'GA'],
        sununu:['Independent-voter road trip','persuadableSupport',11,'baseTurnout',6,'NH'],
        legend_fdr:['Fireside coalition','mediaScore',10,'donorConfidence',4,'NY'],
        legend_jfk:['New-frontier volunteers','enthusiasm',11,'groundGame',4,'MA'],
        legend_lbj:['County-chair persuasion','surrogateStrength',11,'mediaScore',5,'TX'],
        legend_truman:['Whistle-stop comeback','groundGame',11,'donorConfidence',4,'MO'],
        legend_obama:['Organizing for change','onlineInfluence',10,'surrogateStrength',4,'NC'],
        legend_washington_d:['Union above faction','persuadableSupport',10,'baseTurnout',5,'VA'],
        legend_lincoln:['A house united','surrogateStrength',9,'donorConfidence',4,'IL'],
        legend_teddy:['Bully-pulpit reform','mediaScore',10,'donorConfidence',5,'NY'],
        legend_ike:['Steady command','persuadableSupport',10,'onlineInfluence',4,'KS'],
        legend_reagan:['Morning message','mediaScore',11,'debateSkill',4,'CA'],
        legend_nixon:['County-by-county organization','groundGame',11,'enthusiasm',5,'CA'],
        legend_washington_r:['National unity appeal','persuadableSupport',10,'surrogateStrength',5,'VA'],
    },
    get(c) {
        const d=this.data[c.id] || ['A new voice','enthusiasm',7,'donorConfidence',3,window.StateData.find(s=>s.name===c.homeState)?.id||'PA'];
        return {name:d[0],gain:d[1],amount:d[2],costStat:d[3],costAmount:d[4],state:d[5]};
    },
    describe(c) {
        const h=this.get(c),label=s=>s.replace(/([A-Z])/g,' $1').toLowerCase();
        return `${h.name}: +${h.amount} ${label(h.gain)}, −${h.costAmount} ${label(h.costStat)}, +1 point in ${h.state}. $150K + one action; once per campaign.`;
    },
    apply(gs) {
        const h=this.get(gs.playerCandidate);
        gs.campaign[h.gain]=(gs.campaign[h.gain]||50)+h.amount;
        gs.campaign[h.costStat]=Math.max(0,(gs.campaign[h.costStat]||50)-h.costAmount);
        if(gs.statePolling[h.state]) gs.statePolling[h.state].player+=1;
        gs.finances.cashOnHand-=150000;gs.hookUsed=true;
        return {hook:h.name};
    },
};
