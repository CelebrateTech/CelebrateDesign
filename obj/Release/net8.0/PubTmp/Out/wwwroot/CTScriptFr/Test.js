const Toaster = {
    positions: {
        top: 0,
        left: 50,
        right: 0,
        bottom: 0,
        display: 'none'
    },

    timer: null,
    element: document.querySelector('#TrSw'),

    init: function () {
        this.element.style.top = this.positions.top + 'px';
        this.element.style.left = this.positions.left + 'px';
        this.element.style.right = this.positions.right + 'px';
        this.element.style.bottom = this.positions.bottom + 'px';
        this.element.style.display = this.positions.display;
    },

    show: function () {
        this.element.style.display = 'block';
        this.timer = setTimeout(() => {
            this.hide();
        }, 5000); // 5 seconds
    },

    hide: function () {
        this.element.style.display = 'none';
        clearTimeout(this.timer);
    },

    updatePosition: function (top, left, right, bottom) {
        this.positions.top = top;
        this.positions.left = left;
        this.positions.right = right;
        this.positions.bottom = bottom;
        this.init();
    }
};

Toaster.init();
Toaster.show();

document.querySelector('.TrAnBn .Bn.CrBdTe.CrWe.Br0_Cr.HrCrBrTe.BxSwCrTe').addEventListener('click', () => {
    Toaster.hide();
    // Add retry logic here
});

document.querySelector('.TrAnBn .Bn.CrBrTe.BdNe.CrTe.Br3_Cr.HrCrBdTe.BxSwCrTe').addEventListener('click', () => {
    Toaster.hide();
    // Add helpdesk logic here
});