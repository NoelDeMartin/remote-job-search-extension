import Vue from 'vue';

import Popup from './Popup.vue';

const popup = new Vue({
    render: h => h(Popup),
});

popup.$mount('#popup');
