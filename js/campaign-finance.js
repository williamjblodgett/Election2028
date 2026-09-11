/** Cash accounting for campaign transactions, including unavoidable bills. */
window.CampaignFinance = {
    post(amount, type, detail={}, options={}) {
        const gs=options.gs || window.GameEngine.state, f=gs.finances;
        if (!Number.isFinite(amount)) return {ok:false,reason:'Invalid transaction.'};
        amount=Math.round(amount);
        if (amount<0 && -amount>f.cashOnHand && !options.mandatory) return {ok:false,reason:'Not enough campaign cash.'};
        const unpaid=amount<0?Math.max(0,-amount-f.cashOnHand):0;
        const actual=amount<0?Math.max(amount,-f.cashOnHand):amount;
        f.cashOnHand+=actual;
        f.totalRaised=(f.totalRaised||0)+Math.max(0,actual);
        f.totalSpent=(f.totalSpent||0)+Math.max(0,-actual);
        f.arrears=(f.arrears||0)+unpaid;
        gs.campaign.cash=f.cashOnHand;
        (f.ledger||(f.ledger=[])).push({week:gs.week,type,detail,amount:actual,unpaid,balance:f.cashOnHand});
        return {ok:true,amount:actual,unpaid,balance:f.cashOnHand};
    },
    settleArrears(gs=window.GameEngine.state) {
        const amount=Math.min(gs.finances.arrears||0,gs.finances.cashOnHand);
        if (!amount) return;
        this.post(-amount,'arrears_payment',{}, {gs});
        gs.finances.arrears-=amount;
    },
};
