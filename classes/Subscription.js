module.exports = class Subscription {
    constructor(tier) {
        this.rawPlan = tier.plan;
    }

    get plan() {
        switch(this.rawPlan) {
            case 'Prime': return 'Prime';
            case '1000': return 'Tier 1';
            case '2000': return 'Tier 2';
            case '3000': return 'Tier 3';
        }
    }
}