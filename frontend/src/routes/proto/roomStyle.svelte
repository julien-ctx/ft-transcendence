<script lang="ts">
    import { Indicator } from 'flowbite-svelte';
    import Trash from '../../modules/htmlComponent/svgComponent/svgTrash.svelte';
    import Edit from '../../modules/htmlComponent/svgComponent/svgParams.svelte';

    export let room : any;
    export let socket : any;
    export let admin : string;
    export let modalAdmin : boolean;

    function leaveRoom() {
        socket.emit('leaveRoom', {
            roomName : room.name,
        });
    }

</script>

<div class="flex flex-row justify-between w-full bg-white rounded text-2xl pl-4 ">
    <h1>{room.name.length > 10 ? room.name.substring(0, 10) + "..." : room.name}</h1>
    <div>
        {#if room.admin === true}
            <button on:click={() => {admin = room.name; modalAdmin = true}}>
                <Edit />
            </button>
        {/if}
        <button class="rounded justify-center" on:click={() => leaveRoom()}>
            <Trash  />
        </button>
    </div>
</div>