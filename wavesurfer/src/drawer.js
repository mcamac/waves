WaveSurfer.Drawer = {
    FRAME_TIME: 1000 / 60,

    init: function (canvas, webAudio, params) {
        params = params || {};

        this.canvas = canvas;
        this.webAudio = webAudio;

        if (params.cached){

        }

        else if (params.continuous) {
            this.cursor = params.cursor;
            this.drawFn = this.drawContinuous;
            this.initCanvas(params);

        } else if (params.freq){
            this.drawFn = this.drawCurrent;
            this.initCanvas(params);
        }
        else{
            this.drawFn=this.drawCurrent;
            this.initCanvas(params);

        }

        this.k=180;//k has to be int
        this.cachsize=30000;

        this.pos = this.maxPos = 0;
        this.cursorStep=0;
        this.xx=0;
    },

    initCanvas: function (params) {
        this.cc = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;

        if (params.color) {
            this.cc.fillStyle = params.color;
            this.cc.strokeStyle = params.color;
        }
    },

    drawBuffer: function (buffer) {
        this.frames = (buffer.duration * 1000) / this.FRAME_TIME;
        
        //get height of to be displayed
        this.height= document.getElementById('wave').height;

        var k = this.k, //k has to be int
            h = ~~(this.height / 2),
            len = ~~(buffer.length / k),
            lW = 1,
            i, value, chan;
        
        
        //need to be cached in blocks of this.cachsize
        this.canvasArray=[];
        for (cachno=0; cachno<=~~(len/this.cachsize); cachno++){
            //create canvasses, attach to cached, get context
            this.canvasArray[cachno]=document.createElement('canvas');
            this.canvasArray[cachno].setAttribute('id',cachno);
            this.canvasArray[cachno].width=Math.min(this.cachsize,len-this.cachsize*cachno);
            this.canvasArray[cachno].height=this.height;
            document.getElementById('cachedbox').appendChild(this.canvasArray[cachno]);

        }

        

        console.log(len);
        console.log(this.canvasArray.length);

        this.cursorStep = len / this.frames;
        console.log('csstep'+this.cursorStep);
        


        var slice = Array.prototype.slice;


        //version4 interpolation
        /* Left channel. */


        var chan = buffer.getChannelData(0);


        if (chan) {


            for(var cachno=0; cachno<this.canvasArray.length; cachno++){
                var cc=this.canvasArray[cachno].getContext('2d');
                var cheight=this.canvasArray[cachno].height;
                var cwidth= this.canvasArray[cachno].width;

                cc.clearRect(0, 0, cwidth, cheight);
                var waveImage=cc.createImageData(cwidth, cheight);


                for (var i = 0; i < cwidth; i++) {
                    
                    var temp=[]; 
                    var templength=2*h;
                    while (templength--){
                        temp[templength]=0;
                    }

                    for(var j = (i * k) +this.k*this.cachsize*cachno; j < ((i+1)*k)+this.k*this.cachsize*cachno; j++){
                        if (chan[j]>=0){
                            temp[h-(~~(chan[j]*h))]++;
                        }
                        else{
                            temp[h+(~~(-(chan[j]*h)))]++;
                        }
                    }
                    //dbg
                    // if(i<100){
                    // console.log(temp);
                    // }

                    for(var y=0; y<waveImage.height; y++){
                        var index=(y*waveImage.width+i)*4;
                        //a way to color the data ? fft/dft ? zero crossings?
                        waveImage.data[index]=0;
                        waveImage.data[index+1]=0;
                        waveImage.data[index+2]=200;
                        if (temp[y]){
                            //dbg
                            // if(i==85){
                            // console.log('i'+i+',y'+y+',temp[y]'+temp[y]);
                            // }
                            var alpha=100+~~(155*(temp[y]/k));
                            waveImage.data[index+3]=Math.min(255,alpha);
                            //better way to assign alpha values

                        }
                        else{
                            waveImage.data[index+3]=0;
                        }
                    }

                }
                
                cc.putImageData(waveImage,0,0);

            }
        }


        },

    bindClick: function () {
        var self = this;
        this.canvas.addEventListener('click', function (e) {
            if (!self.webAudio.currentBuffer) {
                return;
            }
            // var canvasPosition = this.getBoundingClientRect();
            // var relX = e.pageX - canvasPosition.left;

            // var secondsPlayed = self.setCursor(relX);

            // self.webAudio.play(secondsPlayed);
            console.log('clicked');
            self.webAudio.paused ? self.webAudio.play() : self.webAudio.pause(); 
        }, false);

        //do dragging too

    },

    loop: function (dataFn, cachedCanvasArray) {
        var self = this;
        
        function loop() {
            if (!self.webAudio.paused) {
                if (dataFn) {
                    var data = dataFn.call(self.webAudio);
                    self.drawFn(data);
                }
                
                if(cachedCanvasArray){
                    self.drawFn(cachedCanvasArray);
                }
            }
            requestAnimationFrame(loop, self.canvas)
        };

        loop();
    },

    drawWF: function (data){

    },

    drawCurrent: function (data) {
        var w = this.width,
            h = this.height,
            len = data.length,
            i, value;

        this.lineWidth = ~~(w / len);

        this.cc.clearRect(0, 0, w, h);

        this.cc.beginPath();
        for (i = 0; i < len; i += 1) {
            value = ~~(h - (data[i] / 256 * h));
            this.cc.lineTo(
                this.lineWidth * i, h - value
            );
        }
        this.cc.stroke();
    },

    setCursor: function (pos) {
        this.pos = pos;

        var steps = this.pos / this.cursorStep;
        var msPlayed = steps * this.FRAME_TIME;
        var d = new Date(msPlayed);

        var minutes = d.getMinutes();
        var seconds = d.getSeconds();

        //move the cursor
        if (this.cursor) {
            this.cursor.style.left = pos + 'px';
            this.cursor.title = minutes + ':' + seconds;
        }

        return msPlayed / 1000; // seconds played
    },

    drawContinuous: function (cachedCanvasArray) {
        this.cachedCanvasArray=cachedCanvasArray;

        //update the current region from the cached / this could potentially do zooming too

        this.cc.clearRect(0,0,this.width, this.height);
        
        var zoomfactor=1 || this.zoomfactor;

        this.xx=this.xx+(this.cursorStep);

        var canvasid=~~(this.xx/this.cachsize); 

        //fix lag and cleaning up this fucking mess i.e. put this.cachsize into some var also deal w heights and ~~ issue

        //beginning
        if(~~(this.xx)<~~(zoomfactor*this.width/2)){
            console.log('beginning'+canvasid);
            //no stitches
            if(true){

                this.cachedCanvas=this.cachedCanvasArray[canvasid];
                this.cc.drawImage(this.cachedCanvas,0,0,(~~(zoomfactor*this.width/2+this.xx)-1),this.height,~~(this.width/2-this.xx/zoomfactor),0,~~(this.width/2+this.xx/zoomfactor)-1,this.height);
            }
            //both
            //left
            //right stitches
            else{
                while(true){
                    this.cc.drawImage();
                }
            }
        }

        //end
        else if(~~(this.xx+zoomfactor*this.width/2)>this.cachsize*(this.cachedCanvasArray.length-1)+this.cachedCanvasArray[this.cachedCanvasArray.length-1].width){
            console.log('end'+canvasid);
            //no stitches
            if(true){
                this.cachedCanvas=this.cachedCanvasArray[canvasid];
                this.cc.drawImage(this.cachedCanvas, ~~(this.xx - this.cachsize * (canvasid) - zoomfactor*this.width/2),0, this.cachedCanvasArray[canvasid].width-~~(this.xx - this.cachsize * (canvasid)-zoomfactor* this.width/2) , this.height,0,0, ~~(this.cachedCanvasArray[canvasid].width-~~(this.xx - this.cachsize * (canvasid)-zoomfactor* this.width/2)/zoomfactor),this.height);
            }
            //both stitches
            //right stitches
            //left stitches
            else{
                while(true){
                    this.cc.drawImage();
                }
            }

        }

        //normal
        else{
            
            this.cachedCanvas=this.cachedCanvasArray[canvasid];



            //DO SOME CLEANUP!
            var xxcurrent=this.xx-this.cachsize*canvasid;
            var xxleft= ~~(this.xx-this.cachsize*canvasid - zoomfactor*this.width/2);
            var xxright= ~~(this.xx-this.cachsize*canvasid + zoomfactor*this.width/2);
            
            //no stitches
            if(xxleft>=0 && xxright<=this.cachedCanvasArray[canvasid].width){
                
                console.log('nostitch'+canvasid);
                
                this.cc.drawImage(this.cachedCanvasArray[canvasid],xxleft,0,zoomfactor*this.width,this.height,0,0,this.width,this.height);
            }
            //both stitch
            else if (xxleft<0 && xxright>this.cachedCanvas.width){
                
                console.log('bothstitch'+canvasid);
                
                this.cc.drawImage(this.cachedCanvas,0,0,this.cachedCanvas.width,this.height,~~(this.width/2 - (xxcurrent)/zoomfactor),0,~~this.cachedCanvas.width/zoomfactor, this.height);
                var tempVal1=xxleft;
                var tempVal2=xxright;
                var canvasid2=canvasid;
                var endlast=~~(this.width/2 -(this.xx - this.cachsize *canvasid)/zoomfactor); 
                while(tempVal1<0){
                    canvasid2--;
                    this.cc.drawImage(this.cachedCanvasArray[canvasid2],Math.max(this.cachsize+tempVal1,0),0,Math.min(this.cachsize,-tempVal1),this.height, endlast - ~~(Math.min(this.cachsize,-tempVal1)/zoomfactor),0, ~~(Math.min(this.cachsize,-tempVal1)/zoomfactor),this.height);
                    endlast=endlast-~~(Math.min(this.cachsize,-tempVal1)/zoomfactor);
                    tempVal1=tempVal1+this.cachsize;
                    console.log(0);
                }

                canvasid2=canvasid;
                endlast=~~(this.width/2 + (this.cachedCanvas.width - (this.xx-this.cachsize*canvasid))/zoomfactor);

                while(tempVal2>this.cachedCanvas.width){
                    canvasid2++;
                    this.cc.drawImage(this.cachedCanvasArray[canvasid2], 0,0, Math.min(this.cachsize,tempVal2 - this.cachedCanvas.width) ,this.height,endlast,0, ~~Math.min(this.cachsize,tempVal2 - this.cachedCanvas.width)/zoomfactor,this.height);
                    endlast=endlast+~~Math.min(this.cachsize,tempVal2 - this.cachedCanvas.width)/zoomfactor;
                    tempVal2=tempVal2-this.cachsize;
                    console.log(1);
                }
            }
            //left stitch
            else if (xxleft<0){
                
                console.log('left stitch'+canvasid);
                
                var tempVal=xxleft;
                this.cc.drawImage(this.cachedCanvas,0,0, ~~(zoomfactor*this.width/2 +(this.xx - this.cachsize *canvasid)),this.height, ~~(this.width/2 -(this.xx - this.cachsize *canvasid)/zoomfactor), 0, ~~(this.width/2 +(this.xx - this.cachsize *canvasid)/zoomfactor),this.height);
                var canvasid2=canvasid;
                var endlast=~~(this.width/2 -(this.xx - this.cachsize *canvasid)/zoomfactor);
                while(tempVal<0){
                    canvasid2--;
                    this.cc.drawImage(this.cachedCanvasArray[canvasid2],Math.max(this.cachsize+tempVal,0),0,Math.min(this.cachsize,-tempVal),this.height, endlast - ~~(Math.min(this.cachsize,-tempVal)/zoomfactor),0, ~~(Math.min(this.cachsize,-tempVal)/zoomfactor),this.height);
                    endlast=endlast-~~(Math.min(this.cachsize,-tempVal)/zoomfactor);
                    tempVal=tempVal+this.cachsize;
                }
            }
            //right stitch
            else{
                
                console.log('right stitch'+canvasid);
                
                var tempVal=xxright;
                this.cc.drawImage(this.cachedCanvas, ~~(this.xx-this.cachsize*canvasid-zoomfactor*this.width/2),0,this.cachedCanvas.width-~~(this.xx-this.cachsize*canvasid-zoomfactor*this.width/2), this.height, 0,0, ~~(this.cachedCanvas.width-(this.xx-this.cachsize*canvasid-zoomfactor*this.width/2))/zoomfactor,this.height);
                var canvasid2=canvasid;
                var endlast= ~~(this.width/2 + (this.cachedCanvas.width - (this.xx-this.cachsize*canvasid))/zoomfactor);
                while(tempVal>this.cachedCanvas.width){
                    canvasid2++;
                    this.cc.drawImage(this.cachedCanvasArray[canvasid2], 0,0, Math.min(this.cachsize,tempVal - this.cachedCanvas.width) ,this.height, endlast,0, ~~Math.min(this.cachsize,tempVal - this.cachedCanvas.width)/zoomfactor,this.height);
                    endlast=endlast+~~Math.min(this.cachsize,tempVal - this.cachedCanvas.width)/zoomfactor;
                    tempVal=tempVal-this.cachsize;
                }
            }
        }

        


    }
};