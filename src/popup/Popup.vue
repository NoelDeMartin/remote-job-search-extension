<template>
    <div class="p-4 bg-grey-lighter flex flex-col">
        <h1 class="text-2xl">Remote Jobs Search</h1>
        <h2 class="text-xl mt-1">Configure keywords:</h2>

        <div class="flex my-2">

            <input
                v-model="newKeywordName"
                class="appearance-none border rounded-l w-full py-2 px-3 text-grey-darker"
                placeholder="Keyword"
                type="text"
            >

            <input
                v-model="newKeywordRegEx"
                class="appearance-none border w-full py-2 px-3 text-grey-darker"
                placeholder="RegEx"
                type="text"
            >

            <button
                class="bg-blue hover:bg-blue-dark text-white font-bold py-2 px-4 rounded-r"
                @click="addKeyword"
            >
                Add
            </button>

        </div>

        <p
            v-for="(regex, name) in keywords"
            :key="name"
            class="flex items-center justify-center p-2"
        >
            <svg
                class="w-6 h-6 fill-current cursor-pointer hover:text-red"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                @click="removeKeyword(name)"
            >
                <path
                    d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11.4 10l2.83-2.83-1.41-1.41L10 8.59 7.17
                    5.76 5.76 7.17 8.59 10l-2.83 2.83 1.41 1.41L10 11.41l2.83 2.83 1.41-1.41L11.41 10z"
                />
            </svg>
            <span class="ml-1 flex-grow">{{ name }}</span>
            <code class="p-1 bg-grey rounded text-red-darker">/{{ regex }}/gi</code>
        </p>

    </div>
</template>

<script>
import Vue from 'vue';

import Extension from '../lib/Extension';

export default {
    data() {
        return {
            newKeywordName: '',
            newKeywordRegEx: '',
            keywords: {},
        };
    },
    created() {
        Extension.sendMessage('get-keywords').then(keywords => {
            this.keywords = keywords;
        });
    },
    methods: {
        addKeyword() {
            if (this.newKeywordName && this.newKeywordRegEx) {
                Vue.set(this.keywords, this.newKeywordName, this.newKeywordRegEx);
                this.newKeywordName = '';
                this.newKeywordRegEx = '';
                this.updateKeywords();
            }
        },
        removeKeyword(name) {
            Vue.delete(this.keywords, name);
            this.updateKeywords();
        },
        updateKeywords() {
            Extension.sendMessage('update-keywords', { keywords: {...this.keywords} });
        },
    },
};
</script>
