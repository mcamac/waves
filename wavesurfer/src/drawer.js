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
        this.cursorStep = this.width / this.frames;

        this.cc.clearRect(0, 0, this.width, this.height);

        var len = this.width,
            h = ~~(this.height / 2),
            k = ~~(buffer.length / this.width),
            lW = 1,
            i, value, chan;

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
        chan = buffer.getChannelData(0);

        console.log(chan[1000]);
        console.log(Math.max.apply(Math, slice.call(chan,0,100)));
        console.log(Math.min.apply(Math, slice.call(chan,0,100)));
        if (chan) {


            for (i = 0; i < len; i++) {
                maxVal = h * Math.max.apply(
                    Math, slice.call(chan, i * k, (i + 1) * k)
                );
                minVal= h * Math.min.apply(
                    Math, slice.call(chan, i * k, (i + 1) * k)
                );


                    this.cc.fillRect(
                        i, h-maxVal, lW, 0.5*maxVal-0.5*minVal
                    );
                    this.cc.fillRect(
                        i, h+0.5*(maxVal+minVal),lW,-0.5*maxVal-1.5*minVal
                    );

            }
        }

        // //version4 interpolation
        // /* Left channel. */
        // chan = buffer.getChannelData(0);

        // console.log(Math.max.apply(Math, slice.call(chan,5000,5200)));
        // console.log(Math.min.apply(Math, slice.call(chan,5000,5200)));
        // if (chan) {


        //             this.cc.beginPath();
        //             this.cc.moveTo(0,h);


        //     for (i = 0; i < len; i++) {
        //         var temp=[]; templength=2*h;
        //         while (templength--){
        //             temp[templength]=0;
        //         }

        //         for(j = i * k; j < (i+1) * k; j++){
        //             chan[j]
        //         }


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


        },

    bindClick: function () {
        var self = this;
        this.canvas.addEventListener('click', function (e) {
            if (!self.webAudio.currentBuffer) {
                return;
            }
            var canvasPosition = this.getBoundingClientRect();
            var relX = e.pageX - canvasPosition.left;

            var secondsPlayed = self.setCursor(relX);

            self.webAudio.play(secondsPlayed);
        }, false);
    },

    loop: function (dataFn) {
        var self = this;

        function loop() {
            if (!self.webAudio.paused) {
                if (dataFn) {
                    var data = dataFn.call(self.webAudio);
                }
                self.drawFn(data);
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

        if (this.cursor) {
            this.cursor.style.left = pos + 'px';
            this.cursor.title = minutes + ':' + seconds;
        }

        return msPlayed / 1000; // seconds played
    },

    drawContinuous: function (data) {
        if (this.pos < this.width) {
            this.setCursor(this.pos + this.cursorStep);
        }
    }
};