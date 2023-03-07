<template>
  <div class="bg-white rounded border border-gray-200 relative flex flex-col">
    <div class="px-6 pt-6 pb-5 font-bold border-b border-gray-200">
      <span class="card-title">{{ $t("manage.my_songs") }}</span>
      <i class="fa fa-compact-disc float-right text-green-400 text-2xl"></i>
    </div>
    <div class="p-6">
      <composition-item
        v-for="(song, i) in songs"
        :key="song.docID"
        :song="song"
        :updateSong="updateSong"
        :index="i"
        :removeSong="removeSong"
        :update-unsaved-flag="updateUnsavedFlag"
      />
    </div>
  </div>
</template>
<script>
import CompositionItem from "@/components/CompositionItem.vue";

export default {
  name: "file-list",
  props: {
    songs: {
      type: Array,
      required: true,
    },
    updateUnsavedFlag: {
      type: Function,
    },
  },
  components: { CompositionItem },
  data() {
    return {
      onEdit: false,
      unsavedFlag: false,
    };
  },
  methods: {
    onClickEdit() {
      this.onEdit = true;
    },
    updateSong(i, values) {
      this.songs[i].modified_name = values.modified_name;
      this.songs[i].genre = values.genre;
    },
    removeSong(i) {
      this.songs.splice(i, 1);
    },
  },
};
</script>
