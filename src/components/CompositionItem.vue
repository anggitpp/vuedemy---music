<template>
  <div class="border border-gray-200 p-3 mb-4 rounded">
    <div v-show="!onEdit">
      <h4 class="inline-block text-2xl font-bold">{{ song.modified_name }}</h4>
      <button
        class="ml-1 py-1 px-2 text-sm rounded text-white bg-red-600 float-right"
        @click.prevent="onClickDelete"
      >
        <i class="fa fa-times"></i>
      </button>
      <button
        class="ml-1 py-1 px-2 text-sm rounded text-white bg-blue-600 float-right"
        @click.prevent="onClickEdit"
      >
        <i class="fa fa-pencil-alt"></i>
      </button>
    </div>
    <div
      class="text-white text-center font-bold p-4 rounded mb-4"
      v-if="edit_show_alert"
      :class="edit_alert_variant"
    >
      {{ edit_alert_msg }}
    </div>
    <div v-show="onEdit">
      <vee-form
        :validation-schema="schemaEdit"
        @submit="edit"
        :initial-values="songData"
      >
        <div class="mb-3">
          <label class="inline-block mb-2">Song Title</label>
          <vee-field
            name="modified_name"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            placeholder="Enter Song Title"
            @input="updateUnsavedFlag(true)"
          />
          <ErrorMessage name="modified_name" class="text-red-600" />
        </div>
        <div class="mb-3">
          <label class="inline-block mb-2">Genre</label>
          <vee-field
            name="genre"
            type="text"
            class="block w-full py-1.5 px-3 text-gray-800 border border-gray-300 transition duration-500 focus:outline-none focus:border-black rounded"
            placeholder="Enter Genre"
            @input="updateUnsavedFlag(true)"
          />
          <ErrorMessage name="genre" class="text-red-600" />
        </div>
        <button
          type="submit"
          class="py-1.5 px-3 rounded text-white bg-green-600"
          :disabled="edit_submission"
        >
          Submit
        </button>
        <button
          type="button"
          class="py-1.5 px-3 rounded text-white bg-gray-600"
          @click.prevent="onClickEdit"
        >
          Go Back
        </button>
      </vee-form>
    </div>
  </div>
</template>
<script>
import { songsCollection, storage } from "@/includes/firebase";

export default {
  name: "composition-item",
  props: {
    song: {
      type: Object,
      required: true,
    },
    updateSong: {
      type: Function,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    removeSong: {
      type: Function,
      required: true,
    },
    updateUnsavedFlag: {
      type: Function,
    },
  },
  data() {
    return {
      schemaEdit: {
        modified_name: "required",
        genre: "alpha_spaces",
      },
      songData: {
        modified_name: this.song.modified_name,
        genre: this.song.genre,
      },
      onEdit: false,
      edit_submission: false,
      edit_show_alert: false,
      edit_alert_variant: "bg-blue-500",
      edit_alert_msg: "Please wait! Your Edit is in progress...",
    };
  },
  methods: {
    onClickEdit() {
      this.onEdit = !this.onEdit;
      this.edit_show_alert = false;
      this.edit_submission = false;
    },
    async onClickDelete() {
      const storageRef = storage.ref();
      const songRef = storageRef.child(`songs/${this.song.original_name}`);
      try {
        await songRef.delete();
        await songsCollection.doc(this.song.docID).delete();

        this.removeSong(this.index);
      } catch (e) {
        console.log(e);
      }
    },
    async edit(values) {
      this.edit_show_alert = true;
      this.edit_submission = true;
      this.edit_alert_variant = "bg-blue-500";
      this.edit_alert_msg = "Please wait! Your Edit is in progress...";

      try {
        await songsCollection.doc(this.song.docID).update(values);

        this.songData = {
          modified_name: values.modified_name,
          genre: values.genre,
        };
      } catch (e) {
        this.edit_alert_variant = "bg-red-500";
        this.edit_alert_msg = "Edit failed! Please try again.";
        this.edit_submission = false;
        return;
      }

      this.updateSong(this.index, this.songData);
      this.updateUnsavedFlag(false);

      this.edit_submission = false;
      this.edit_alert_variant = "bg-green-500";
      this.edit_alert_msg = "Edit successful!";
    },
  },
};
</script>
