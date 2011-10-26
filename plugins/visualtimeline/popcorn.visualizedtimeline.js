// PLUGIN: Timeline
(function ( Popcorn ) {


//Variables needed throughout
var ctx, vidDuration, vidCurrent, myVideo, arrayTrack;

//Prototype needed to get positioning of dom objects
Element.prototype.leftTopScreen = function () 
{
	var x = this.offsetLeft;
	var y = this.offsetTop;

	var element = this.offsetParent;

	while (element !== null) {
		x = parseInt (x) + parseInt (element.offsetLeft);
		y = parseInt (y) + parseInt (element.offsetTop);
		element = element.offsetParent;
	}

	return new Array (x, y);
}


//Start plugin with options
  Popcorn.plugin( "visualizedtimeline" , function( options ) {
	
	//Get canvas context
	qctx = document.getElementById(options.target);
        ctx = qctx.getContext('2d');

	//Set canvas parameters
	ctx.width=options.canvasWidth;
	ctx.height=options.canvasHeight;
	
	//Get media element and save popcorn instance
	myVideo = document.getElementsByTagName(options.vidTarget)[0];
	var popcornInstance = this;

	//When media element finishes loading meta data, call function
	myVideo.addEventListener('loadedmetadata', function() {

		//load needed media data
		vidDuration = myVideo.duration;
		vidCurrent = myVideo.currentTime;

		//set up drawing function
		setInterval(function ()
				{	
					//grab track events (needed to draw)
					arrayTrack = Popcorn.getTrackEvents(popcornInstance);

					//Draw everything
					ctx.clearRect(0, 0, ctx.width+50, ctx.height);
					ctx.fillStyle   = '#00f';
					ctx.fillRect(0, 0, ctx.width, ctx.height);
					ctx.fillStyle   = '#f00';
					var curX = Math.round((myVideo.currentTime/vidDuration)*ctx.width);
					ctx.fillRect(curX, 0, 3, ctx.height);

					for (var i = 0; i < arrayTrack.length; i++)
					{
						var itemX = Math.round((arrayTrack[i].start/vidDuration)*ctx.width);
						ctx.fillStyle   = '#0f0';
						ctx.fillRect(itemX, 0, 3, ctx.height);
					}


				}, 300);
	});


	//Mouseover event used for pop up div's
	qctx.onmousemove = function (e)
	{
			//calculate relative mouse position to canvas
			var xy = qctx.leftTopScreen();
			var mouseX = e.pageX;
			var mouseY = e.pageY;
			var mX = mouseX - xy[0];
			var mY = mouseY - xy[1];

			//get pixel under mouse
			imageD = ctx.getImageData(mX, mY, 1, 1).data

			//check pixel under mouse
			if(imageD[1]==255)
			{
				var finished = 0;
				for (var i = 0; i < arrayTrack.length&&finished==0; i++)
				{
					var itemX = Math.round((arrayTrack[i].start/vidDuration)*ctx.width);
					//pop div if match to an event
					if(itemX+2>=mX&&itemX-2<=mX)
					{
						
						var newdiv = document.createElement('div');
						newdiv.id = 'popUp';
						newdiv.style.display = 'block';
						newdiv.style.position = 'absolute';
						newdiv.style.background = 'yellow';
						newdiv.style.top = mouseY;
						newdiv.style.left = mouseX;
						newdiv.style.fontSize = "10px";
						newdiv.innerHTML = "Event Info </br> Start Time: " + arrayTrack[i].start + " seconds";	
						document.body.appendChild(newdiv);
						finished=1;
					}
				}
			}
			else  //remove popUp div if existing otherwise
			{
				var node = document.getElementById('popUp');
				if(node)
				{
					node.parentNode.removeChild(node);
				}
			}

	}
	qctx.addEventListener("mouseup", function (e)
						{
							var xy = qctx.leftTopScreen();
							var mouseX = e.pageX;
							var mX = mouseX - xy[0];
							myVideo.currentTime = ((mX/ctx.width)*vidDuration)
						}, false);		


	//nothing needed to return at the moment
	
    return {

      start: function( event, options ) {
      },

      end: function( event, options ) {
      },

      _teardown: function( options ) {
      }
    };
  },
  {

    about: {
      name: "Popcorn Visualized Timeline Plugin",
      version: "0.1",
      author: "Chris Gosselin @crgosselin",
      website: "crgosselin.blogspot.com"
    },

    options: {
      vidTarget: {
        elem: "input",
        type: "text",
        label: "vidTarget"
      },
      start: {
        elem: "input",
        type: "text",
        label: "In"
      },
      end: {
        elem: "input",
        type: "text",
        label: "Out"
      },
      target: {
        elem: "input",
        type: "text",
        label: "target"
      },
      canvasHeight: {
        elem: "input",
        type: "text",
        label: "cheight"
      },
      canvasWidth: {
        elem: "input",
        type: "text",
        label: "cwidth"
      }
    }
  });



})( Popcorn );
