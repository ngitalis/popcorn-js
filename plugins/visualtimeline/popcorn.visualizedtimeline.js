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

	//Get media element and save popcorn instance
	myVideo = document.getElementsByTagName(options.vidTarget)[0];
	var popcornInstance = this;

	//Set canvas parameters
	ctx.width= myVideo.width;
	ctx.height= 20;
	barX = ctx.width*0.05;
	


	//Overall Measurements
	var YHeight = ctx.height/2; // Height of the current time portion of canvas
	var YOffset = ctx.height/2;// Height of the timeline portion of canvas
	var barY = ctx.height*0.10; // The small amount of border for height

	//Timeline measurements
	var timeLineStartX = barX; // 5% of the canvas width (leaves room for pause/play)
	var timeLineStartY = barY+YOffset; // start half way down plus a bit.  Gives room for current time.
	var timeLineWidth =  ctx.width-(6*barX); // 1 bar the beginning, and 4 at the end for controls
	var timeLineHeight = YHeight-(2*barY); // how far down it should go.
	var timeLineMarkerWidth = 2;

	//Volume Control Measurements
	var volumeXStart = timeLineWidth+timeLineStartX+(barX*2);
	var volumeYStart = (YHeight*0.20)+YOffset;
	var volumeBarXStart = volumeXStart+(barX/2)+(barX/4);
	var maxVolumeWidth = barX*2;

	//current time box measurements
	var boxWidth = 25; 
	var boxHeight = 15;


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
					//Clear timeline
					ctx.clearRect(0, 0, ctx.width+50, ctx.height);
					//Color timeline background
					ctx.fillStyle   = '#000'; //change to hex for black
					ctx.fillRect(0, YOffset, ctx.width, YHeight);
					//Create timeline bar
					ctx.fillStyle = '#C2DFFF'
					ctx.fillRect(timeLineStartX, timeLineStartY, timeLineWidth, timeLineHeight);
					ctx.fillStyle   = '#fff';
					ctx.fillRect(timeLineStartX, timeLineStartY, timeLineWidth*(myVideo.currentTime/vidDuration), timeLineHeight);

					//Change video duration from seconds to proper time format to print
					minuteNum = Math.floor(vidDuration/60);
					secondNum = Math.floor(vidDuration) - minuteNum*60;
					extraZero="";
					if(Math.floor(secondNum/10)==0)
					{
						extraZero="0";
					}
					ctx.font ="8pt Arial";
					ctx.fillStyle   = '#fff';
					ctx.fillText(minuteNum+":"+extraZero+secondNum, (timeLineWidth+timeLineStartX), (timeLineStartY+(barY*3)));				


					//Draw volume control
					ctx.fillStyle   = '#fff';
					ctx.beginPath();
					//start Position
					ctx.moveTo(volumeXStart, (timeLineStartY+barY));
					//beside start position over by the up slant
					ctx.lineTo(volumeXStart+(barX/4), (timeLineStartY+barY));
					//top of the up slant
					ctx.lineTo(volumeXStart+(barX/2), timeLineStartY);
					//bottom of the down slant
					ctx.lineTo(volumeXStart+(barX/2), (timeLineStartY+timeLineHeight));
					//after the down slant
					ctx.lineTo(volumeXStart+(barX/4), (timeLineStartY+timeLineHeight-barY));
					//under start position
					ctx.lineTo(volumeXStart, (timeLineStartY+timeLineHeight-barY));
					//back to start position
					ctx.lineTo(volumeXStart, (timeLineStartY+barY));
					ctx.fill();


					
					ctx.fillStyle = '#C8BBBE'
					//volume Potential
					ctx.fillRect(volumeBarXStart, timeLineStartY, maxVolumeWidth, timeLineHeight);

					
					
					//Draw a red cross across volume image if muted
					if(myVideo.muted)
					{
						ctx.strokeStyle   = '#f00';
						ctx.lineWidth = 2;
						ctx.beginPath();
						ctx.moveTo(volumeXStart, timeLineStartY);
						ctx.lineTo(volumeXStart+(barX/2), (timeLineStartY+timeLineHeight));
						ctx.moveTo(volumeXStart+(barX/2), timeLineStartY);
						ctx.lineTo(volumeXStart, (timeLineStartY+timeLineHeight	));
						ctx.stroke(); 
					}
					else
					{
						//volume current
						currentSound = myVideo.volume;
						ctx.fillStyle   = '#fff';
						ctx.fillRect(volumeBarXStart, timeLineStartY, maxVolumeWidth*currentSound, timeLineHeight);
					}


					//Create current time marker on timelinebar
					ctx.fillStyle   = '#000'; //chang to hex for black

					//Position extra to be added from timeline
					var curX = Math.round((myVideo.currentTime/vidDuration)*(timeLineWidth));	
					markerXPosition = curX+timeLineStartX;
					ctx.fillRect(markerXPosition, timeLineStartY, timeLineMarkerWidth, YHeight-(2*barY));
					ctx.fillStyle   = '#000';
					
					//using this function so that the current time doesn't change part way through
					(function(curX, vidCurrent){

					ctx.beginPath();
					ctx.moveTo(curX+barX, barY+YOffset);
					ctx.lineTo(((markerXPosition)-(boxWidth/2)), ((timeLineStartY)-(boxHeight*0.20)));
					ctx.lineTo(((markerXPosition)-(boxWidth/2)), 0+(boxHeight*0.05));
					ctx.lineTo(((markerXPosition)+(boxWidth/2)), 0+(boxHeight*0.05));
					ctx.lineTo(((markerXPosition)+(boxWidth/2)), ((timeLineStartY)-(boxHeight*0.20)));
					ctx.lineTo(markerXPosition, timeLineStartY);
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

					//draw play button - all calculations based on the beginning gap (barX)
					if(myVideo.paused||myVideo.currentTime==myVideo.duration)
					{
						triangleFarX = (barX) - (barX*0.20);
						triangleX = (barX)*0.20;
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
						seperationVal = ((barX) - (barX*0.20))/4;
						firstRectXClose = (barX)*0.20;
						secondRectXClose = firstRectXClose + seperationVal + (seperationVal/2);
						rectYTop = (YHeight*0.20);
						rectYBottom = YHeight - ((YHeight*0.20)*2);

						ctx.fillRect(firstRectXClose, rectYTop+YOffset, seperationVal, rectYBottom);
						ctx.fillRect(secondRectXClose, rectYTop+YOffset, seperationVal, rectYBottom);

						
					}

					//display the track events as lines
					for (var i = 0; i < arrayTrack.length; i++)
					{
						var itemX = Math.round((arrayTrack[i].start/vidDuration)*(timeLineWidth))+barX;
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
					var itemX = Math.round((arrayTrack[i].start/vidDuration)*timeLineWidth)+barX;
					//pop div if match to an event
					if(itemX+3>=mX&&itemX+1<=mX&&mY>=YOffset)
					{
						
						var newdiv = document.createElement('div');
						newdiv.id = 'popUp';
						newdiv.style.display = 'block';
						newdiv.style.position = 'absolute';
						newdiv.style.background = 'yellow';
						newdiv.style.top = mouseY - 20;
						newdiv.style.left = mouseX;
						newdiv.style.fontSize = "10px";
						newdiv.innerHTML = "Event Info </br> Start Time: " + arrayTrack[i].start + " seconds";	
                        var vidDiv = document.getElementById('controls');
						vidDiv.appendChild(newdiv);
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
	//Mouseup event used for interaction with visualized timeline
	qctx.addEventListener("mouseup", function (e)
						{
							var xy = qctx.leftTopScreen();
							var mouseX = e.pageX;
							var mX = mouseX - xy[0];
							var mouseY = e.pageY;
							var mY = mouseY - xy[1];
							//if user clicks on timeline bar, set the video's current time
							if(mX>=barX&&mX<=(timeLineStartX+timeLineWidth)&&mY>=YOffset)
							{
								myVideo.currentTime = ((mX-barX)/(timeLineWidth))*vidDuration;
							}
							else if(mX<barX&&mY>=YOffset) //if user clicks on pause/play, toggle
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
							else if(mX>=volumeBarXStart&&(volumeBarXStart+maxVolumeWidth)>=mX)
							{
								//if user clicks on volume bar, change volume
								myVideo.volume = ((mX-volumeBarXStart)/(maxVolumeWidth));
							}
							else if(mX>=volumeXStart&&mX<=(volumeXStart+(barX/2)))
							{
								//if user clicks on volume image, toggle muted
								if(myVideo.muted)
								{
									myVideo.muted=false;
								}
								else
								{
									myVideo.muted=true;
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
