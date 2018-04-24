<template>

    <div class="p-4 bg-grey-lighter w-screen h-screen flex flex-col items-center justify-start">

        <h1
            v-if="!analysis"
            class="text-sm"
        >
            Loading {{ url }}...
        </h1>

        <div
            v-else
            class="flex flex-col items-start w-full"
        >

            <h1 class="text-3xl text-center w-full truncate">{{ analysis.name }}</h1>
            <h2 class="text-base text-center w-full">{{ analysis.domain }}</h2>

            <div class="my-2 flex justify-around w-full">
                <a
                    v-for="(url, name) in analysis.sections"
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
                    v-for="(count, name) in analysis.keywords"
                    :key="name"
                >
                    <td class="p-1 pr-2">{{ name }}</td>
                    <td class="p-1">{{ count }}</td>
                </tr>
            </table>

            <GlassdoorSummary :data="analysis.glassdoor" />

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
            url: '',
            analysis: null,
        };
    },
    created() {
        const analyzer = new CompanyAnalyzer();
        this.url = (new URL(location)).searchParams.get('url');
        this.loading = true;
        analyzer.analyze(this.url).then(analysis => {
            this.loading = false;
            this.analysis = analysis;
        });
    },
};
</script>
