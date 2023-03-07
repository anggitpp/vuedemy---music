<template>
  <section class="container mx-auto mt-6">
    <div class="md:grid md:grid-cols-3 md:gap-4">
      <div class="col-span-1">
        <file-upload ref="upload" :add-song="addSong"/>
      </div>
      <div class="col-span-2">
        <file-list :songs="songs" :update-unsaved-flag="updateUnsavedFlag"/>
      </div>
    </div>
  </section>
</template>

<script>
import FileUpload from "@/components/FileUpload.vue";
import FileList from "@/components/FileList.vue";
import {songsCollection, auth} from "@/includes/firebase";

export default {
  name: "manage-view",
  components: {FileList, FileUpload},
  data() {
    return {
      songs: [],
    };
  },
  methods: {
    addSong(document) {
      const song = {
        ...document.data(),
        docID: document.id,
      };
      this.songs.push(song);
    },
    updateUnsavedFlag(value) {
      this.unsavedFlag = value;
    },

  },
  async created() {
    const snapshot = await songsCollection.where("uid", "==", auth.currentUser.uid).get();
    snapshot.forEach(this.addSong);
  },
  beforeRouteLeave(to, from, next) {
    if (this.unsavedFlag) {
      const answer = confirm("You have unsaved changes. Are you sure you want to leave?");
      if (answer) {
        next();
      } else {
        next(false);
      }
    } else {
      next();
    }
  },

  // beforeRouteLeave(to, from, next) {
  // this.$refs.upload.cancelUploads();
  // next();
  // }
  // beforeRouteEnter(to, from, next) {
  //   const store = useUserStore();
  //   if (store.userLoggedIn) {
  //     next();
  //   } else {
  //     next({
  //       name: "home",
  //     });
  //   }
  // },
};
</script>
