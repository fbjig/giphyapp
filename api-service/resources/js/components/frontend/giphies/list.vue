<template>
    <div class="row">
        <add-giphy-btn v-show="!loading"></add-giphy-btn>
        <template v-if="statusMsg">
            <div class="alert status-msg alert-danger" v-if="statusMsg.error">
                {{ this.statusMsg.msg }}
            </div>
            <div class="alert status-msg alert-success" v-else>
                {{ this.statusMsg.msg }}
            </div>
        </template>
        <table class="table table-striped table-dark giphies-table">
            <thead>
                <tr>
                    <th scope="col">#</th>
                    <th scope="col">URL</th>
                    <th scope="col">Title</th>
                    <th scope="col">Description</th>
                    <th scope="col">Actions</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="giphy in giphies.data" v-bind:key="giphy.id">
                    <template v-if="! giphy.editing">
                        <th scope="row">
                            {{ giphy.id }}
                        </th>
                        <td>
                            <img :src="giphy.url" height="40" width="auto">
                        </td>
                        <td>
                            {{ giphy.title }}
                        </td>
                        <td>
                            {{ giphy.description }}
                        </td>
                        <td class="actions">
                            <a href="#" @click="edit(giphy)">
                                <i class="fas fa-edit"></i>
                            </a>
                            <button class="btn-clipboard text-primary" v-bind:data-clipboard-text="giphy.url" v-bind:data-title="giphy.title" v-bind:data-id="giphy.id">
                                <i class="far fa-copy"></i>
                            </button>
                        </td>
                    </template>
                    <template v-else>
                        <th scope="row">
                            <img v-bind:src="giphy.url" height="70px" width="auto">
                        </th>
                        <td>
                            <input type="text" class="form-control" v-model="giphy.url">
                        </td>
                        <td>
                            <input type="text" class="form-control" v-model="giphy.title">
                        </td>
                        <td>
                            <textarea rows="3" class="form-control" v-model="giphy.description"></textarea>
                        </td>
                        <td class="actions">
                            <simple-spinner v-show="giphy.sending"></simple-spinner>
                            <a href="#" @click="update(giphy)">
                                <i class="fas fa-check"></i>
                            </a>
                            <a href="#" @click="cancel(giphy)">
                                <i class="fas fa-times"></i>
                            </a>
                        </td>
                    </template>
                    
                </tr>
            </tbody>
        </table>

        <spinner v-show="loading"></spinner>
        <create-giphy></create-giphy>
        
        <pagination :data="giphies" :limit="5" @pagination-change-page="getResults" v-show="!loading"></pagination>
    </div>
</template>

<style>
    .status-msg {
        width: 100%;
        text-align: center;
    }

    .giphies-table {
        margin-bottom: 20px;
    }
    
    .actions a {
        margin-left: 6px;
    }
    .btn-clipboard {
        background: none;
        border: none;
        cursor: pointer;
    }
</style>


<script>
import EventBus from '../../../event-bus.js'

export default {
    data() {
        return {
            giphies: {},
            loading: true,
            statusMsg: null
        }
    },
    created() {
        EventBus.$on('giphyAdded', data => {
            this.giphies.data.unshift(data)
        })
    },
    mounted() {
        this.getResults()
    },
    methods: {
        getResults(page = 1) {
            this.loading = true
			axios.get('giphies-list?page=' + page)
				.then(response => {
                    this.loading = false
                    if (response.data.success) {
                        this.giphies = response.data.giphies
                        this.initClipboard()
                    }else{
                        this.statusMsg = {
                            error: true,
                            msg: 'There was an error getting the giphies'
                        }
                    }
				});
		},
        cancel: function(giphy) {
            giphy.editing = false;
            this.statusMsg = null;
        },
        edit: function(giphy) {
            Vue.set(giphy, 'editing', true);
            this.statusMsg = null;
        },
        update: function(giphy) {
            Vue.set(giphy, 'sending', true);
            axios.post('/update-giphy', {
                id: giphy.id,
                title: giphy.title,
                url: giphy.url,
                description: giphy.description,
            }).then((response) => {
                giphy.editing = false;
                giphy.sending = false;
                if (response.data.success) {
                    this.statusMsg = {
                        error: false,
                        msg: 'Giphy was updated successfully!!!'
                    }
                }else{
                    this.statusMsg = {
                        error: true,
                        msg: 'There was an error updating giphy'
                    }
                }
            }, (error) => {
                giphy.editing = false;
                giphy.sending = false;
                this.statusMsg = {
                    error: true,
                    msg: 'Error '+ error.response.status +': '+ error.response.data.message
                }
            });
        },
        initClipboard: function() {
            // Init Clipboard
            var ClipboardJS = require('clipboard');
            var clipboard = new ClipboardJS('.btn-clipboard');
            clipboard.on('success', function(e) {
                // console.info('Action:', e.action);
                // console.info('Text:', e.text);
                // console.info('Trigger:', e.trigger);
                var title = $(e.trigger).data('title');
                window.functions.showTooltip(e.trigger, title +' copied!');
                window.functions.hideTooltip(e.trigger);

                var giphyId = $(e.trigger).data('id');
                window.functions.sumCopy(giphyId);
                e.clearSelection();
            });
            clipboard.on('error', function(e) {
                // console.error('Action:', e.action);
                // console.error('Trigger:', e.trigger);
                window.functions.showTooltip(e.trigger, fallbackMessage(e.action));
                window.functions.hideTooltip(e.trigger);
            });
        }
    }
}
</script>
