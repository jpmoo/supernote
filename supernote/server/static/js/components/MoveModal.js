import { fetchFolderList } from '../api/client.js';

export default {
    name: 'MoveModal',
    props: ['itemIds'],
    template: `
        <div class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" @click.self="$emit('close')">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh] animate-in zoom-in-95">
                <div class="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h3 class="text-lg font-bold text-slate-900">Move {{ itemIds.length }} items to...</h3>
                    <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                </div>

                <div class="px-4 py-2 border-b border-slate-50 flex flex-wrap items-center gap-1 text-sm">
                    <template v-for="(crumb, index) in breadcrumbs" :key="crumb.id">
                        <button
                            v-if="index < breadcrumbs.length - 1"
                            @click="navigateTo(index)"
                            class="text-indigo-600 hover:text-indigo-800 font-medium"
                        >{{ crumb.name }}</button>
                        <span v-else class="text-slate-700 font-semibold">{{ crumb.name }}</span>
                        <span v-if="index < breadcrumbs.length - 1" class="text-slate-300">/</span>
                    </template>
                </div>

                <div class="flex-1 overflow-y-auto p-2">
                    <p v-if="isLoading" class="p-4 text-center text-slate-400 text-sm">Loading folders...</p>
                    <p v-else-if="folders.length === 0" class="p-4 text-center text-slate-400 text-sm">No subfolders here</p>

                    <div
                        v-for="folder in folders"
                        :key="folder.id"
                        @click="openFolder(folder)"
                        class="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer transition-colors"
                    >
                        <div class="w-10 h-10 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center shrink-0">
                            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"></path></svg>
                        </div>
                        <span class="font-medium text-slate-700 flex-1">{{ folder.name }}</span>
                        <svg v-if="folder.hasSubfolders" class="w-5 h-5 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </div>
                </div>

                <div class="p-6 border-t border-slate-100 flex justify-end gap-3">
                    <button @click="$emit('close')" class="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium">Cancel</button>
                    <button @click="confirmMove"
                        class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all">
                        Move Here
                    </button>
                </div>
            </div>
        </div>
    `,
    data() {
        return {
            folders: [],
            browseDirectoryId: '0',
            breadcrumbs: [{ id: '0', name: 'Cloud' }],
            isLoading: false
        };
    },
    async mounted() {
        await this.loadFolders();
    },
    methods: {
        async loadFolders() {
            this.isLoading = true;
            try {
                this.folders = await fetchFolderList(
                    this.browseDirectoryId,
                    this.itemIds || []
                );
            } catch (e) {
                console.error(e);
            } finally {
                this.isLoading = false;
            }
        },
        async openFolder(folder) {
            this.browseDirectoryId = folder.id;
            this.breadcrumbs.push({ id: folder.id, name: folder.name });
            await this.loadFolders();
        },
        async navigateTo(index) {
            const crumbs = this.breadcrumbs.slice(0, index + 1);
            this.breadcrumbs = crumbs;
            this.browseDirectoryId = crumbs[crumbs.length - 1].id;
            await this.loadFolders();
        },
        confirmMove() {
            this.$emit('confirm', this.browseDirectoryId);
        }
    }
};
