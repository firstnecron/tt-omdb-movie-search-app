var app = (function ($) {
    "use strict";
    var exports = {};

    // Store last submitted timestamp to prevent API spam
    var lastSubmitted = new Date();
    // Misc UI Helpers
    var $moviesList = $('#movies');
    var $desc = $('.desc');
    var $noMovies = $('.no-movies').detach();
    var $movieDescription = $('<div id="movie-description" class=""></div>');

    //UI changes
    $noMovies.detach();
    $('.main-content').append($movieDescription.hide());

    var createMovieListItem = function (movie) {
        var html = '<li>' +
            '<a href="#"><div class="poster-wrap">';

        if (movie.Poster && movie.Poster !== 'N/A' && movie.Poster !== '') {
            html += '<img class="movie-poster" src="' + movie.Poster + '">';
        } else {
            html += '<i class="material-icons poster-placeholder">crop_original</i>';
        }

        html += '</div>'
        html += '<span class="movie-title">' + movie.Title + '</span>';
        html += '<span class="movie-year">' + movie.Year + '</span></a></li>';

        return html;
    };

    var showMovieDescription = function (movie) {

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
                    $(li).find('a').on('click', function (event) {
                        event.preventDefault();
                        showMovieDescription(movie);
                    })
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
    }

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

    return exports;
}($));
