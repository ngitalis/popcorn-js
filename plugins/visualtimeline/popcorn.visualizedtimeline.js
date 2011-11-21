// PLUGIN: Timeline
(function ( Popcorn ) {


//Variables needed throughout
var ctx, vidDuration, vidCurrent, myVideo, arrayTrack, barX, paused;

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
	barX = ctx.width*0.05;
	
	//Get media element and save popcorn instance
	myVideo = document.getElementsByTagName(options.vidTarget)[0];
	var popcornInstance = this;

	//When media element finishes loading meta data, call function
	myVideo.addEventListener('loadedmetadata', function() {

		//load needed media data
		vidDuration = myVideo.duration;
		vidCurrent = myVideo.currentTime;
		paused = myVideo.paused;

		//set up drawing function
		setInterval(function ()
				{	
					//grab track events (needed to draw)
					arrayTrack = Popcorn.getTrackEvents(popcornInstance);
					YHeight = ctx.height/2;
					YOffset = ctx.height/2;
					//Draw everything

					//Clear timeline
					ctx.clearRect(0, 0, ctx.width+50, ctx.height);

					//Color timeline
					ctx.fillStyle   = '#000'; //change to hex for black
					ctx.fillRect(0, YOffset, ctx.width, YHeight);

					

					//Create timeline bar
					barY = ctx.height*0.10;
					ctx.fillStyle   = '#fff'; //change to hex for white
					ctx.fillRect(barX, barY+YOffset, ctx.width-(2*barX), YHeight-(2*barY));

					//Create current time marker on timelinebar
					ctx.fillStyle   = '#000'; //chang to hex for black
					var curX = Math.round((myVideo.currentTime/vidDuration)*(ctx.width-(2*barX)));
					ctx.fillRect(curX+barX, barY+YOffset, 2, YHeight-(2*barY));
					
					boxWidth = 25;
					boxHeight = 15;

					ctx.fillStyle   = '#000';
					
					//using this function so that the current time doesn't change part way through
					(function(curX, vidCurrent){

					ctx.beginPath();
					ctx.moveTo(curX+barX, barY+YOffset);
					ctx.lineTo(((curX+barX)-(boxWidth/2)), ((barY+YOffset)-(boxHeight*0.20)));
					ctx.lineTo(((curX+barX)-(boxWidth/2)), 0+(boxHeight*0.05));
					ctx.lineTo(((curX+barX)+(boxWidth/2)), 0+(boxHeight*0.05));
					ctx.lineTo(((curX+barX)+(boxWidth/2)), ((barY+YOffset)-(boxHeight*0.20)));
					ctx.lineTo(curX+barX, barY+YOffset);
					ctx.fill();
					ctx.font ="8pt Arial";
					
					minuteNum = Math.floor(myVideo.currentTime/60);
					secondNum = Math.floor(myVideo.currentTime) - minuteNum*60;

					extraZero="";
					if(Math.floor(secondNum/10)==0)
					{
						extraZero="0";
					}	
					ctx.fillStyle   = '#fff';
					ctx.fillText(minuteNum+":"+extraZero+secondNum, ((curX+barX)-(boxWidth/2)), ((barY+YOffset)-(boxHeight*0.20)));
					})(curX);
					
					ctx.fillStyle   = '#fff';

					//draw play button
					if(myVideo.paused||myVideo.currentTime==myVideo.duration)
					{
						triangleFarX = (ctx.width*0.05) - ((ctx.width*0.05)*0.20);
						triangleX = (ctx.width*0.05)*0.20;
						triangleY = (YHeight*0.20);
						triangleFarY = YHeight - (YHeight*0.20);
						triangleMidY = (YHeight - YHeight*0.20)/2;
						ctx.beginPath();
						ctx.moveTo(triangleX, triangleY+YOffset);
						ctx.lineTo(triangleFarX, triangleMidY+YOffset);
						ctx.lineTo(triangleX, triangleFarY+YOffset);
						ctx.fill();
					}
					else //draw pause button
					{
						seperationVal = ((ctx.width*0.05) - ((ctx.width*0.05)*0.20))/4;
						firstRectXClose = (ctx.width*0.05)*0.20;
						secondRectXClose = firstRectXClose + seperationVal + (seperationVal/2);
						rectYTop = (YHeight*0.20);
						rectYBottom = YHeight - ((YHeight*0.20)*2);

						ctx.fillRect(firstRectXClose, rectYTop+YOffset, seperationVal, rectYBottom);
						ctx.fillRect(secondRectXClose, rectYTop+YOffset, seperationVal, rectYBottom);

						
					}

					for (var i = 0; i < arrayTrack.length; i++)
					{
						var itemX = Math.round((arrayTrack[i].start/vidDuration)*(ctx.width-(2*barX)))+barX;
						ctx.fillStyle   = '#00f';
						ctx.fillRect(itemX+2, 0+YOffset, 1, ctx.height);
					}


				}, 300);
	});


	//Mouseover event used for pop up div's
	qctx.onmousemove = function (e)
	{
			var nodeCheck = document.getElementById('popUp');
			//calculate relative mouse position to canvas
			var xy = qctx.leftTopScreen();
			var mouseX = e.pageX;
			var mouseY = e.pageY;
			var mX = mouseX - xy[0];
			var mY = mouseY - xy[1];
			YOffset = ctx.height/2;
			//get pixel under mouse
			imageD = ctx.getImageData(mX-1, mY, 1, 1).data

			//check pixel under mouse
			//if(imageD[1]==255&&!nodeCheck)
			//{
				var finished = 0;
				for (var i = 0; i < arrayTrack.length; i++)
				{
					var itemX = Math.round((arrayTrack[i].start/vidDuration)*ctx.width)+barX;
					//pop div if match to an event
					if(itemX+1>=mX&&itemX-1<=mX&&mY>=YOffset)
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
			//}
			if(finished==0)  //remove popUp div if existing otherwise
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
							YOffset = ctx.height/2;
							var xy = qctx.leftTopScreen();
							var mouseX = e.pageX;
							var mX = mouseX - xy[0];
							var mouseY = e.pageY;
							var mY = mouseY - xy[1];
							if(mX>=barX&&mX<=(ctx.width-barX)&&mY>=YOffset)
							{
								myVideo.currentTime = ((mX-barX)/(ctx.width-(2*barX)))*vidDuration;
							}
							else if(mX<barX&&mY>=YOffset)
							{

								if(myVideo.paused)
								{
									myVideo.play();
								}
								else
								{
									myVideo.pause();
								}
							}
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
