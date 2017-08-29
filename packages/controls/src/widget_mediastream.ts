import {
    DOMWidgetView
} from '@jupyter-widgets/base';

import {
    CoreDOMWidgetModel
} from './widget_core';

import adapter;

import * as _ from 'underscore';

export
abstract class MediaStreamModel extends CoreDOMWidgetModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'MediaStreamModel',
            _view_name: 'MediaStreamView',
        });
    }
    abstract captureStream() : Promise<MediaStream>;
}

export
class MediaStreamView extends DOMWidgetView {
    render() {
        /**
         * Called when view is rendered.
         */
        super.render();
        (<any>window).last_media_stream_view = this;
        this.video = document.createElement('video')
        this.pWidget.addClass('jupyter-widgets');
        this.pWidget.addClass('widget-image');
        // depending on if we get a stream or an error we add the video element
        // or a div with the error msg
        this.model.captureStream().then((stream) => {
            this.video.srcObject = stream;
            this.el.appendChild(this.video)
            this.video.play()
        }, (error) => {
            var text = document.createElement('div')
            text.innerHTML = "Error creating view for mediastream: " + error.message
            this.el.appendChild(text)
        })
    }
    remove() {
        this.model.captureStream().then((stream) => {
            this.video.srcObject = null;
        })
        return super.remove()
    }
    video: HTMLVideoElement;
    model: MediaStreamModel;
}

export
class CameraStreamModel extends MediaStreamModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'CameraStreamModel',
            // see https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
            constraints: {audio: true, video: true}
        });
    }

    initialize() {
        super.initialize.apply(this, arguments);
    }
    captureStream() : Promise<MediaStream> {
        if(!this.cameraStream)
            this.cameraStream = navigator.mediaDevices.getUserMedia(this.get('constraints'));
        return this.cameraStream;
    }

    close() {
        // do we want to know when the stream is closed? 
        if(this.cameraStream) {
            this.cameraStream.then((stream) => {
                stream.getTracks().forEach((track) => {
                    track.stop()
                })
            })
        }
        return super.close()
    }
    cameraStream: Promise<MediaStream>;
}

export
class VideoStreamModel extends MediaStreamModel {
    defaults() {
        return _.extend(super.defaults(), {
            _model_name: 'VideoStreamModel',
            url: 'https://webrtc.github.io/samples/src/video/chrome.mp4',
            value: null,
            play: true,
            loop: true,
        })
    }

    initialize() {
        (<any>window).last_video_stream = this;
        super.initialize.apply(this, arguments);
        this.video = document.createElement('video')
        this.source = document.createElement('source')
        var format = this.get('format');
        var value = this.get('value');
        if(format != 'url') {
            //var ar = new Uint8Array(this.get('value').buffer)
            //this.video.src = window.URL.createObjectURL(new Blob([ar]));
            var mimeType = 'video/${format}';
            this.video.src = window.URL.createObjectURL(new Blob([value], {type: mimeType}));
        } else {
            var url = String.fromCharCode.apply(null, new Uint8Array(value.buffer));
            this.source.setAttribute('src', url)
            this.video.appendChild(this.source)
        }
        this.on('change:play', this.update_play, this)
        this.on('change:loop', this.update_loop, this)
    }
    captureStream() : Promise<MediaStream> {
        return new Promise((resolve, reject) => {
            if(this.video.captureStream || this.video.mozCaptureStream) {
                // following https://github.com/webrtc/samples/blob/gh-pages/src/content/capture/video-pc/js/main.js
                var make_stream = _.once(_.bind(function() {
                    if(this.video.captureStream) {
                        resolve(this.video.captureStream())
                    } else if(this.video.mozCaptureStream) {
                        resolve(this.video.mozCaptureStream())
                    }
                }, this))
                // see https://github.com/webrtc/samples/pull/853
                this.video.oncanplay = make_stream
                if(this.video.readyState >= 3) {
                    make_stream()
                }
                this.update_play()
                this.update_loop()
            } else {
                reject(new Error('captureStream not supported for this browser'))
            }
        });
    }

    update_play() {
        if(this.get('play'))
            this.video.play()
        else
            this.video.pause()
    }

    update_loop() {
        this.video.loop = this.get('loop')
    }
    
    close() {
        var returnValue = super.close()
        this.video.pause()
        if (this.video.src && this.video.src.startsWith('blob:')) {
            URL.revokeObjectURL(this.video.src);
        }
        this.video.src = '';
        return returnValue;
    }
    video: any // typescript doesn't seem to know about (mozC|c)aptureStream
    source: HTMLSourceElement
}
