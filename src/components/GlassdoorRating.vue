<template>
    <div class="flex items-center">
        <h3
            class="text-2xl font-normal mr-1"
            style="color:#0CAA41"
        >
            {{ rating }}
        </h3>
        <svg
            v-for="i in 5"
            :key="i"
            class="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
        >
            <defs>
                <linearGradient :id="'star-gradient-' + i">
                    <stop
                        :offset="Math.max(0, Math.min(100, (rating - i + 1) * 100)) + '%'"
                        stop-color="#0CAA41"
                    />
                    <stop
                        :offset="Math.max(0, Math.min(100, (rating - i + 1) * 100)) + '%'"
                        stop-color="black"
                        stop-opacity="1"
                    />
                </linearGradient>
            </defs>
            <path
                :fill="'url(#star-gradient-' + i + ')'"
                d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z"
            />
        </svg>
    </div>
</template>

<script>
export default {
    props: {
        rating: {
            type: Number,
            required: true,
        },
    },
};
</script>
