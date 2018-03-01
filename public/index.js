/* eslint-disable */

Vue.prototype.$http = axios;
const index = new Vue({
  el: '#index',
  data: {
      movies: [],
      genres: '',
      year: '',
      title: '',
      movie: '',
      isEditing: false,
      allGenres: [],
      isSpecific: false,
  },
  methods: {
    getMovies() {
      this.$http.get('/movies')
        .then(movies => {
          this.movies = movies.data;
          this.isSpecific = false;
          this.movies.sort((a,b) => {
            return a.year-b.year;
          })
        })
        .catch(error => {
          console.error(error);
        })
    },
    deleteMovie(movieID){
      this.$http.delete('/deleteMovie', {data: {movieID: movieID}})
        .then(response => {
          this.getMovies();
        })
        .catch(error => {
          console.error(error);
        })
    },
    addMovie(genres, year, title){
      genres = genres.split(', ');
      year = parseInt(year);
      this.$http.post('/addMovie', {
        genres: genres,
        year: year,
        title: title,
        movieID: this.movies[this.movies.length-1].movieID+1,
      })
      .then(response => {
        $(':input').val('').end();
        this.genres = '';
        this.year = '';
        this.title = '';
        this.getMovies();
      })
      .catch(error => {
        console.error(error);
      })
    },
    editMovies(){
      this.isEditing = !this.isEditing;
    },
    updateMovie(title, year, genres, movieID){
      let id;
      for(let i=0; i<this.movies.length; i++){
        if(this.movies[i].movieID === movieID){
          id = this.movies[i]._id;
        }
      }
      year = parseInt(year);
      if(genres.includes(', ')){
        genres = genres.split(', ');
      }
      this.$http.put('/updateMovie', {
        genres: genres,
        year: year,
        title: title,
        movieID: movieID,
        id: id,
      })
      .then(response => {
        this.getMovies();
        this.isEditing = false;
      })
      .catch(error => {
        console.error(error);
      })
    },
    getAllGenres(){
      this.$http.get('/allGenres')
        .then(response => {
          this.allGenres = response.data;
        })
        .catch(error => {
          console.error(error);
        })
    },
    showGenre(genre){
      this.$http.post('/showGenre', {genre: genre})
        .then(response => {
          this.movies = response.data;
          this.isSpecific = true;
        })
        .catch(error => {
          console.error(error);
        })
    },
  },
  beforeMount(){
    let app = this;
    this.getMovies();
    this.getAllGenres();
  },
});
