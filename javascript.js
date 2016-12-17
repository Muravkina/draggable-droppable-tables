// wait for DOM to load to execute JS
$(document).ready(function() {

	// we're using an IIFE pattern to protect a module’s scope from the environment in which it is placed.
	var playLists = (function(){

		var rootAPI = "https://jsonplaceholder.typicode.com";
		//store user ids in an array for easy access and future ability to add and/or remove users
		var userIds = [1,2];

		//creating a get request to the API to retrieve information about the user
		function getUser(userId) {
			$.ajax({
				method: "GET",
        url: rootAPI + '/users/' + userId,
        success: function(data) {
        	createUserTable(data);
        },
        error: function(error) {
        	handleError(error)
        }
      });
		};

		//generate a table for each user
		function createUserTable(user){
			//creating a div with the class of user id to differentiate between to different users' playlists
			var $table= $("<div></div>");
			$table.addClass('table ' + user.id);
			//storing user id in data attribute to access it later if needed
			$table.data({id: user.id})
			//appending generated table to the container
			$('.container').append($table);

			//enable table to be a target for dragged items
			$(".table." + user.id ).droppable({
					//adding class with styling when the table is hovered 
					classes: {
						'ui-droppable-hover' : 'highlight'
					},
					//table does not accept dragged items from itself
					accept: ".table:not(." + user.id + ") > .row.album",
					drop: handleDropEvent
				})

			//adding user name to the table
			addUserName(user);
			//getting user albums from the API
			getUserAlbum(user.id)
		}

		function addUserName(user){
			//creating a div that conains user name
			var $userDiv = $("<div></div>");
			$userDiv.text(user.name);
			$userDiv.addClass('row name');
			//appending it to generated table
			$(".table." + user.id).append($userDiv);
		};

		function getUserAlbum(userId) {
			//creating a get request to the API to retrieve information about the user's albums
			$.ajax({
					method: "GET",
        	url: rootAPI + '/users/' + userId + '/albums',
        	success: function (data) {
        		addAlbum(data);
        	},
        	error: function(error) {
        		handleError(error)
        }
      })
		};

		//adding albums to the user's table
	  function addAlbum(albums) {
	  	//iterating over each album received from the API
			$.each(albums, function (index, album) {
				//creating a div for each album with the class of its id to be able to access it later if needed
				var $album = $("<div></div>");
				$album.addClass('row album ' + album.id);
				//appending album to the user's table
				$(".table." + album.userId ).append($album);

				//enabling draggable functionality on album element
				$album.draggable({
					//setting the cursor style while dragging
					cursor: 'crosshair',
					//if album has not been dropped on a droppable table, it will revert to its original position
					revert: 'invalid',
					//setting container to auto-scroll while dragging
					scroll: 'true',
					//when the dragging starts:
					start: function(event, ui) {
						//add css rule to display dragging album in front of every other element
						$(ui.helper).css('z-index', 999999)
					},
					//when the dragging stops:
					stop: function(event, ui) {
						// add css rule to force needed positioning on the element
						$(ui.helper).css({left: 0, top: 0})
					}
				});

				//generate each album cell (content of the album div)
				generateAlbumCell(album, $album);

			})
		};

		//genrate the content for each album 
		function generateAlbumCell(album, albumDiv) {
			//creating a div that contains album id
			var $albumId = $('<div></div>')
			$albumId.addClass('id');
			$albumId.text(album.id);

			//creating a div that contains album title
			var $albumTitle = $('<div></div>');
			$albumTitle.addClass('name');
			$albumTitle.text(album.title);
		
			//appending id and title to the album container
			$(albumDiv).append($albumId);
			$(albumDiv).append($albumTitle);
		}

		//handing dropping events
		function handleDropEvent(event, ui) {
			//hiding element that was just dropped 
			ui.draggable.hide();
			//saving info that will be need after ajax call in variables
			var albumId = $(ui.draggable.children('.id')).text();
			var userId = $(this).data('id');
			var $table = $(this);

			//making a put request to the API server to update user's album list
			$.ajax({
				method: 'PUT',
      	url: rootAPI + '/albums/' + albumId,
      	data: {userId: userId},
        success: function(data) {
        	updateTable(data)
        },
        error: function(error) {
        	handleError(error)
        }
    	});
		}

		//after updated data aboy user albums from the server, we're updating user's playlist
		function updateTable(data) {
			//finding updated table and album
			var $table = $('.table.' + data.userId)
			var $album = $('.row.album.' + data.id)
			//appending the album to the new table
			$table.append($album);
			//make this album appear since we hide it to perform ajax operation
			$album.fadeIn();
		}

		//should be a proper error handler
		function handleError(error) {
			console.log(error)
		}

		//returning public properties from the IIFE function
		return {
			userIds: userIds,
			getUser: getUser
		}

	})();

	//iterate over each user id 
	playLists.userIds.forEach(function(userId){
		//generate a table with albums for each user
		playLists.getUser(userId);
	})

})

