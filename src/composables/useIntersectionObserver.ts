import { onMounted, onUnmounted, ref } from 'vue';

export function useIntersectionObserver(options = { threshold: 0.1 }) {
    const observer = ref<IntersectionObserver | null>(null);

    const observeElements = (selector: string) => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((el) => {
            observer.value?.observe(el);
        });
    };

    onMounted(() => {
        observer.value = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.value?.unobserve(entry.target); // Trigger once
                }
            });
        }, options);
    });

    onUnmounted(() => {
        observer.value?.disconnect();
    });

    return {
        observeElements
    };
}
