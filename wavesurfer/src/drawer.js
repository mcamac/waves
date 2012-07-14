WaveSurfer.Drawer = {
    FRAME_TIME: 1000 / 60,

    init: function (canvas, webAudio, params) {
        params = params || {};

        this.canvas = canvas;
        this.webAudio = webAudio;
        this.initCanvas(params);

        if (params.continuous) {
            this.cursor = params.cursor;
            this.drawFn = this.drawContinuous;
        } else if (params.freq){
            this.drawFn = this.drawCurrent;
        }
        else{
            this.drawFn=this.drawCurrent;
        }

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
        
        var k = 180,
            h = ~~(this.height / 2),
            len = ~~(buffer.length / k),
            lW = 1,
            i, value, chan;
  
        
        this.width=this.canvas.width=len;

        console.log(len);
        console.log(this.width);
        this.cursorStep = this.width / this.frames;
        console.log('csstep'+this.cursorStep);
        this.cc.clearRect(0, 0, this.width, this.height);


        var slice = Array.prototype.slice;

        //version 1: max / maxmin avg
        // /* Left channel. */
        // chan = buffer.getChannelData(0);

        // console.log(Math.max.apply(Math, slice.call(chan,0,100)));
        // console.log(Math.min.apply(Math, slice.call(chan,0,100)));
        // if (chan) {
        //     for (i = 0; i < len; i++) {
        //         value = h * Math.max.apply(
        //             Math, slice.call(chan, i * k, (i + 1) * k)
        //         );
        //         value2 = 0.5 * h * [Math.min.apply(Math, slice.call(chan, i * k, (i + 1) * k))+Math.max.apply(Math, slice.call(chan, i * k, (i + 1) * k))];
        //         this.cc.fillRect(
        //             i, h - value, lW, value-value2
        //         );
        //     }
        // }

        // /* Right channel. */
        // chan = buffer.getChannelData(1);

        // if (chan) {
        //     for (i = 0; i < len; i++) {
        //         value = h * Math.max.apply(
        //             Math, slice.call(chan, i * k, (i + 1) * k)
        //         );
        //         value2 = 0.5 * h * [Math.min.apply(
        //             Math, slice.call(chan, i * k, (i + 1) * k)
        //         )+Math.max.apply(
        //             Math, slice.call(chan, i * k, (i + 1) * k)
        //         )];
        //         this.cc.fillRect(
        //             i, h+value2, lW, value-value2
        //         );
        //     }
        // }

        // //version2 abs(max/min) / maxmin avg
        // /* Left channel. */
        // chan = buffer.getChannelData(0);

        // console.log(chan[1000]);
        // console.log(Math.max.apply(Math, slice.call(chan,0,100)));
        // console.log(Math.min.apply(Math, slice.call(chan,0,100)));
        // if (chan) {


        //             this.cc.beginPath();
        //             this.cc.moveTo(0,h);


        //     for (i = 0; i < len; i++) {
        //         maxVal = h * Math.max.apply(
        //             Math, slice.call(chan, i * k, (i + 1) * k)
        //         );
        //         minVal= h * Math.min.apply(
        //             Math, slice.call(chan, i * k, (i + 1) * k)
        //         );

        //         if(Math.abs(maxVal)>=Math.abs(minVal)){

        //             this.cc.lineTo(i*lW, h-maxVal);
        //             // this.cc.fillRect(
        //             //     i, h-maxVal, lW, 0.5*maxVal-0.5*minVal
        //             // );
        //             // this.cc.fillRect(
        //             //     i, h+0.5*(maxVal+minVal),lW,0.5*(maxVal-minVal)
        //             // );
        //         }

        //         else{

        //             this.cc.lineTo(i*lW, h-minVal);
        //             // this.cc.fillRect(
        //             //     i, h-0.5*(maxVal+minVal), lW, 0.5*(maxVal-minVal)
        //             // );
        //             // this.cc.fillRect(
        //             //     i, h+minVal, lW, 0.5*(maxVal-minVal)
        //             // );

        //         }
        //     }
        //     this.cc.stroke();
        // }


        //version3 MAX-MIN
        /* Left channel. */
        // chan = buffer.getChannelData(0);

        // console.log(chan[1000]);
        // console.log(Math.max.apply(Math, slice.call(chan,0,100)));
        // console.log(Math.min.apply(Math, slice.call(chan,0,100)));
        // if (chan) {


        //     for (i = 0; i < len; i++) {
        //         maxVal = h * Math.max.apply(
        //             Math, slice.call(chan, i * k, (i + 1) * k)
        //         );
        //         minVal= h * Math.min.apply(
        //             Math, slice.call(chan, i * k, (i + 1) * k)
        //         );


        //             this.cc.fillRect(
        //                 i, h-maxVal, lW, 0.5*maxVal-0.5*minVal
        //             );
        //             this.cc.fillRect(
        //                 i, h+0.5*(maxVal+minVal),lW,-0.5*maxVal-1.5*minVal
        //             );

        //     }
        // }

        //version4 interpolation
        /* Left channel. */


        chan = buffer.getChannelData(0);

        var waveImage=this.cc.createImageData(this.width, this.height);

        if (chan) {

            for (i = 0; i < len; i++) {
                
                var temp=[]; templength=2*h;
                while (templength--){
                    temp[templength]=0;
                }

                for(j = i * k; j < (i+1) * k; j++){
                    if (chan[j]>=0){
                        temp[h-(~~(chan[j]*h))]++;
                    }
                    else{
                        temp[h+(~~(-(chan[j]*h)))]++;
                    }
                }
                
                if(i<100){
                console.log(temp);
                }

                for(y=0; y<waveImage.height; y++){
                    var index=(y*waveImage.width+i)*4;
                    //a way to color the data
                    waveImage.data[index]=0;
                    waveImage.data[index+1]=0;
                    waveImage.data[index+2]=200;
                    if (temp[y]){
                        if(i==85){
                        console.log('i'+i+',y'+y+',temp[y]'+temp[y]);
                        }
                        var alpha=100+~~(155*(temp[y]/k));
                        waveImage.data[index+3]=Math.min(255,alpha);
                        //better way to assign alpha values

                    }
                    else{
                        waveImage.data[index+3]=0;
                    }
                }

            }

            console.log('gets here');
            this.cc.putImageData(waveImage,0,0);
            console.log('and here');

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
            self.webAudio.paused ? self.webAudio.play() : self.webAudio.pause(); 
        }, false);
    },

    loop: function (dataFn, cachedCanvas) {
        var self = this;

        function loop() {
            if (!self.webAudio.paused) {
                if (dataFn) {
                    var data = dataFn.call(self.webAudio);
                    self.drawFn(data);
                }
                if(cachedCanvas){
                    self.drawFn(cachedCanvas);
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

    drawContinuous: function (cachedCanvas) {
        this.cachedCanvas=cachedCanvas;

        //update the current region from the cached / this could potentially do zooming too
        this.cc.clearRect(0,0,this.width, this.height);
        
        var zoomfactor=1 || this.zoomfactor;

        this.xx=this.xx+(this.cursorStep);


        //fix lag

        if(~~(this.xx)<~~(zoomfactor*this.width/2)){
            this.cc.drawImage(this.cachedCanvas,0,0,(~~(zoomfactor*this.width/2+this.xx)-1),this.height,~~(this.width/2-this.xx/zoomfactor),0,~~(this.width/2+this.xx/zoomfactor)-1,this.height);

        }
        else{
            this.cc.drawImage(this.cachedCanvas,~~(this.xx-zoomfactor*this.width/2),0,zoomfactor*this.width,this.height,0,0,this.width,this.height);
        }

        //deal with the ending


    }
};