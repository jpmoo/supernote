import { fetchFiles } from '../api/client.js?v=8';

export default {
    name: 'MoveModal',
    props: {
        itemIds: {
            type: Array,
            default: () => []
        },
        initialDirectoryId: {
            type: String,
            default: '0'
        },
        initialBreadcrumbs: {
            type: Array,
            default: () => [{ id: '0', name: 'Cloud' }]
        }
    },
    template: `
        <div class="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm" @click.self="$emit('close')">
            <div class="bg-white rounded-2xl shadow-2xl w-full max-w-md flex flex-col max-h-[80vh] animate-in zoom-in-95">
                <div class="p-6 border-b border-slate-100">
                    <div class="flex items-center justify-between gap-4">
                        <h3 class="text-lg font-bold text-slate-900">Move {{ itemIds.length }} items to...</h3>
                        <button @click="$emit('close')" class="text-slate-400 hover:text-slate-600 shrink-0">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                    </div>
                    <p class="mt-2 text-sm text-slate-500">Open a folder to see its subfolders, then choose Move Here.</p>
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
                    <p v-else-if="loadError" class="p-4 text-center text-red-500 text-sm">{{ loadError }}</p>
                    <p v-else-if="folders.length === 0" class="p-4 text-center text-slate-400 text-sm">No subfolders in this location</p>

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
                        <svg class="w-5 h-5 text-slate-300 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            isLoading: false,
            loadError: null
        };
    },
    mounted() {
        this.browseDirectoryId = String(this.initialDirectoryId ?? '0');
        this.breadcrumbs = this.cloneBreadcrumbs(this.initialBreadcrumbs);
        this.loadFolders();
    },
    methods: {
        cloneBreadcrumbs(crumbs) {
            const list = Array.isArray(crumbs) && crumbs.length > 0
                ? crumbs
                : [{ id: '0', name: 'Cloud' }];
            return list.map(c => ({ id: String(c.id), name: c.name }));
        },
        isExcluded(folderId) {
            const moving = new Set((this.itemIds || []).map(id => String(id)));
            return moving.has(String(folderId));
        },
        async loadFolders() {
            this.isLoading = true;
            this.loadError = null;
            try {
                const entries = await fetchFiles(this.browseDirectoryId, 1, 500);
                this.folders = entries
                    .filter(f => f.isDirectory && !this.isExcluded(f.id))
                    .map(f => ({
                        id: String(f.id),
                        name: f.name
                    }));
            } catch (e) {
                console.error(e);
                this.loadError = 'Failed to load folders';
                this.folders = [];
            } finally {
                this.isLoading = false;
            }
        },
        async openFolder(folder) {
            this.browseDirectoryId = String(folder.id);
            this.breadcrumbs.push({ id: String(folder.id), name: folder.name });
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
