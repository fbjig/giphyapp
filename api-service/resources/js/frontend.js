
/**
 * First we will load all of this project's JavaScript dependencies which
 * includes Vue and other libraries. It is a great starting point when
 * building robust, powerful web applications using Vue and Laravel.
 */

require('./bootstrap-frontend');

window.Vue = require('vue');

/**
 * The following block of code may be used to automatically register your
 * Vue components. It will recursively scan this directory for the Vue
 * components and automatically register them with their "basename".
 *
 * Eg. ./components/ExampleComponent.vue -> <example-component></example-component>
 */

// const files = require.context('./', true, /\.vue$/i)
// files.keys().map(key => Vue.component(key.split('/').pop().split('.')[0], files(key)))

Vue.component('spinner', require('./components/widgets/spinner.vue').default);
Vue.component('simple-spinner', require('./components/widgets/simple-spinner.vue').default);
Vue.component('search-autocomplete', require('./components/widgets/searcher.vue').default);
Vue.component('pagination', require('laravel-vue-pagination'));
Vue.component('best-tags', require('./components/widgets/best-tags.vue').default);
Vue.component('list-of-giphies', require('./components/frontend/giphies/list.vue').default);
Vue.component('add-giphy-btn', require('./components/frontend/giphies/add-btn.vue').default);
Vue.component('create-giphy', require('./components/frontend/giphies/create.vue').default);
Vue.component('giphie-card', require('./components/frontend/giphies/card.vue').default);

/**
 * Next, we will create a fresh Vue application instance and attach it to
 * the page. Then, you may begin adding components to this application
 * or customize the JavaScript scaffolding to fit your unique needs.
 */

const app = new Vue({
    el: '#content'
});
