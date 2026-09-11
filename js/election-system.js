/** Final vote counting is separate from polling and presentation. */
window.ElectionSystem = {
    // Census July 2023 voting-age population. Not citizenship/eligibility estimates.
    // https://public-inspection.federalregister.gov/2024-06666.pdf
    votingAge:{AL:3977628,AK:557899,AZ:5848310,AR:2362124,CA:30519524,CO:4662926,CT:2894190,DE:819952,DC:552380,FL:18229883,GA:8490546,HI:1141525,ID:1497384,IL:9844167,IN:5274945,IA:2476882,KS:2246209,KY:3509259,LA:3506600,ME:1146670,MD:4818337,MA:5659598,MI:7925350,MN:4436981,MS:2259864,MO:4821686,MT:897161,NE:1497381,NV:2508220,NH:1150004,NJ:7280551,NM:1663024,NY:15611308,NC:8498868,ND:599192,OH:9207681,OK:3087217,OR:3401528,PA:10332678,RI:892124,SC:4229354,SD:697420,TN:5555761,TX:22942176,UT:2484582,VT:532828,VA:6834154,WA:6164810,WV:1417859,WI:4661826,WY:454508},
    normalize(poll) {
        const p=Math.max(0,Number(poll.player)||0),o=Math.max(0,Number(poll.opponent)||0);
        const other=Math.max(0,Number(poll.undecided)||0), sum=p+o+other || 1;
        return {player:p/sum*100,opponent:o/sum*100,other:other/sum*100};
    },
    contingent(gs) {
        // Delegations are simulated political institutions, not a popular-vote tiebreaker.
        const delegations=gs.houseDelegations || Object.fromEntries(window.StateData.filter(s=>s.id!=='DC').map(s=>[s.id,s.partisanLean>0?'republican':'democrat']));
        const player=Object.values(delegations).filter(p=>p===gs.playerParty).length;
        const opponent=Object.values(delegations).filter(p=>p && p!==gs.playerParty).length;
        const senate=gs.presidency?.congress.senateSeats || gs.transition?.senateSeats || 50;
        return {player,opponent,threshold:26,winner:player>=26?'player':opponent>=26?'opponent':'pending',vicePresident:senate>=51?'player':senate<=49?'opponent':'pending',model:'Simulated incoming House: one vote per state; Senate selects VP separately.'};
    },
    finalize(gs=window.GameEngine.state) {
        if (gs.electionResult) return gs.electionResult;
        window.GameEngine.applyFinalTurnout();
        let playerEV=0,opponentEV=0,playerVotes=0,opponentVotes=0,totalVotes=0;
        const stateResults={};
        for (const st of window.StateData) {
            const poll=gs.statePolling[st.id]; if (!poll) continue;
            const shares=this.normalize(poll);
            const voters=Math.round(this.votingAge[st.id]*(st.turnoutPotential||65)/100);
            const player=Math.round(voters*shares.player/100),opponent=Math.round(voters*shares.opponent/100);
            const winner=player>=opponent?'player':'opponent';
            if(winner==='player') playerEV+=st.electoralVotes; else opponentEV+=st.electoralVotes;
            playerVotes+=player;opponentVotes+=opponent;totalVotes+=voters;
            stateResults[st.id]={winner,margin:Math.abs(shares.player-shares.opponent),ev:st.electoralVotes,player:shares.player,opponent:shares.opponent,playerVotes:player,opponentVotes:opponent,totalVotes:voters};
        }
        const contingent=playerEV<270 && opponentEV<270?this.contingent(gs):null;
        const result={playerEV,opponentEV,stateResults,winner:contingent?contingent.winner:playerEV>=270?'player':'opponent',contingent,
            playerName:gs.playerCandidate.name,opponentName:gs.opponentCandidate.name,playerParty:gs.playerParty,
            nationalPopularVote:{player:Math.round(playerVotes/totalVotes*1000)/10,opponent:Math.round(opponentVotes/totalVotes*1000)/10},
            voteTotals:{player:playerVotes,opponent:opponentVotes,total:totalVotes},
            electorateModel:'2023 Census voting-age population × simulated state turnout; fictional election results'};
        gs.electionResult=result;
        window.CareerSystem?.ensure(gs).elections.push({year:gs.isIncumbentRun?2032:2028,incumbent:!!gs.isIncumbentRun,winner:result.winner,playerEV,opponentEV,popularVote:{...result.nationalPopularVote},contingent});
        return result;
    },
    tippingPoint(results) {
        if (results.contingent || results.winner==='pending') return null;
        const ordered=Object.entries(results.stateResults).filter(([,r])=>r.winner===results.winner).sort(([,a],[,b])=>b.margin-a.margin);
        let total=0;
        for(const [id,r] of ordered) {total+=r.ev;if(total>=270)return{name:window.StateData.find(s=>s.id===id)?.name || id,margin:r.margin,ev:r.ev};}
        return null;
    },
    replay() { return window.GameEngine.generateElectionNight(); },
};
window.GameEngine.calculateElectionResult=()=>window.ElectionSystem.finalize();
