<script lang="ts">
	import { Card, Progressbar } from 'flowbite-svelte'
	export let user : any;

</script>

<Card padding="none" class="!bg-primary !border-none p-10">
	<Progressbar progress="50" labelOutside="Level 1" />
</Card>