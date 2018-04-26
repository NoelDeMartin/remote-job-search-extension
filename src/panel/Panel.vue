<template>

    <div class="p-4 bg-grey-lighter w-screen h-screen flex flex-col items-center justify-start overflow-auto">

        <h1
            v-if="!info"
            class="text-sm"
        >
            Analyzing {{ source }}...
        </h1>

        <div
            v-else
            class="flex flex-col items-start w-full pb-4"
        >

            <h1 class="text-3xl text-center w-full truncate">{{ info.name }}</h1>
            <h2 class="text-base text-center w-full">{{ info.url.hostname }}</h2>

            <div class="my-2 flex justify-around w-full">
                <a
                    v-for="(url, name) in info.sections"
                    :key="name"
                    :href="url"
                    target="_blank"
                    class="text-sm text-blue-dark"
                >
                    {{ name }}
                </a>
            </div>

            <h3 class="mt-2 text-xl">Keywords:</h3>

            <table class="mx-4 my-2">
                <tr
                    v-for="(count, name) in info.keywords"
                    :key="name"
                >
                    <td class="p-1 pr-2">{{ name }}</td>
                    <td class="p-1">{{ count }}</td>
                </tr>
            </table>

            <GlassdoorSummary :data="info.glassdoor" />

        </div>

    </div>

</template>

<script>
import CompanyAnalyzer from '../lib/CompanyAnalyzer';

import GlassdoorSummary from '../components/GlassdoorSummary.vue';

export default {
    components: {
        GlassdoorSummary,
    },
    data() {
        return {
            source: '',
            info: null,
        };
    },
    created() {
        this.launchAnalysis().then(info => {
            this.info = info;
        });
    },
    methods: {
        launchAnalysis() {
            const analyzer = new CompanyAnalyzer();
            const url = new URL(location);

            if (url.searchParams.get('link')) {
                this.source = url.searchParams.get('link');
                return analyzer.analyzeLink(this.source);
            } else if (url.searchParams.get('text')) {
                this.source = url.searchParams.get('text');
                return analyzer.analyzeText(this.source);
            }
        },
    },
};
</script>
