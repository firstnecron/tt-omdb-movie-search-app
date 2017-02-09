var app = (function ($) {
    "use strict";
    var exports = {};

    // Store last submitted timestamp to prevent API spam
    var lastSubmitted = new Date();
    // Misc UI Helpers
    var $moviesList = $('#movies');
    var $desc = $('.desc');
    var $noMovies = $('.no-movies').detach();
    var $movieModal = $('<div class="modal fade" tabindex="-1" role="document" id="movie-description">' +
        '<div class="modal-dialog modal-lg" role="document">' +
            '<div class="modal-content">' +
                '<div class="modal-header">' +
                    '<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                    '<h4 class="modal-title"></h4>' +
                '</div>' +
                '<div class="modal-body"></div>' +
            '</div>' +
        '</div>' +
        '</div>');

    //UI changes
    $noMovies.detach();
    $('.main-content').append($movieModal.hide());

    var createMovieListItem = function (movie) {
        var html = '<li>' +
            '<a href="#" data-imdb="' + movie.imdbID + '"><div class="poster-wrap">';

        if (movie.Poster && movie.Poster !== 'N/A' && movie.Poster !== '') {
            html += '<img class="movie-poster" src="' + movie.Poster + '">';
        } else {
            html += '<i class="material-icons poster-placeholder">crop_original</i>';
        }

        html += '</div>';
        html += '<span class="movie-title">' + movie.Title + '</span>';
        html += '<span class="movie-year">' + movie.Year + '</span></a></li>';

        return html;
    };

    var displayMovieDescription = function (movie) {

        // Title
        $movieModal.find('.modal-title').text(movie.Title);
        // Body
        var bodyHtml = '';
        // Poster
        if (movie.Poster && movie.Poster !== '') {
            bodyHtml += '<img class="description-poster" src="' + movie.Poster + '">';
        } else {
            bodyHtml += '<i class="description-poster material-icons poster-placeholder">crop_original</i>';
        }
        bodyHtml += '<div class="description-wrapper">';
        // Title
        bodyHtml += '<h3 class="description-movie-title">' + movie.Title + ' (' + movie.Year + ')</h3>';
        // Rating
        bodyHtml += '<p class="rating">IMDb Rating: ' + movie.imdbRating + '</p>';
        // Plot
        bodyHtml += '<h5 class="plot-header">Plot Synopsis:</h5>';
        bodyHtml += '<p class="plot">' + movie.Plot + '</p>';
        // IMDb Link
        bodyHtml += '<a id="imdb-button" href="http://www.imdb.com/title/' + movie.imdbID + '/" class="btn btn-primary btn-lg">View on IMDb</a>';
        bodyHtml += '</div>';

        $movieModal.find('.modal-body').html(bodyHtml);

        $movieModal.modal();
    };

    var searchMovie = function (title, year) {
        var url = 'http://www.omdbapi.com/';
        //var url = './examples/sample_search.json';
        //var url = './examples/sample_error_search.json';
        var data = {
            s: title,
            y: year
        };

        var processSearchResponse = function (response) {
            var movies = response.Search;

            // Clear any movies currently displayed
            $desc.detach();
            $noMovies.detach();
            $moviesList.empty();
            if (response.Response === 'True' && movies.length > 0) {
                for (var i = 0; i < movies.length; i++) {
                    var movie = movies[i];
                    var li = createMovieListItem(movie);
                    $moviesList.append(li);
                }
            } else {
                // no results
                var html = '<i class="material-icons icon-help">help_outline</i>No movies found that match: ';
                html += title;
                if (year) {
                    html += ' in the year ' + year;
                }
                html += '.';

                $noMovies.html(html);
                $moviesList.append($noMovies);
            }
        };

        $.getJSON(url, data, processSearchResponse);
    };

    var searchIMDb = function (imdbID) {
        if (!imdbID || imdbID === '') {
            return;
        }

        var url = 'http://www.omdbapi.com/';
        //var url = './examples/sample_imdb_result.json';
        var data = {
            i: imdbID,
            plot: 'full'
        };

        var processImdbResponse = function (response) {
            if (response.Response === 'True') {
                displayMovieDescription(response);
            } else {
                return;
            }
        };

        $.getJSON(url, data, processImdbResponse);
    };

    $('.search-form').on('submit', function (event) {
        event.preventDefault();

        var title = $('#search').val();
        var timestamp = new Date();
        // Prevent API spam by putting a 1 second cooldown
        // Check for cooldown & if title exists
        if (timestamp - lastSubmitted <= 1000 || title === '') {
            return;
        }
        lastSubmitted = timestamp;

        var year = $('#year').val();

       if (title === '' && year === '') {
           $moviesList.append($desc);
       } else {
           searchMovie(title, year);
       }
    });

    $moviesList.on('click', 'li a', function (event) {
        event.preventDefault();

        searchIMDb($(this).data('imdb'));
    });

    return exports;
}($));
