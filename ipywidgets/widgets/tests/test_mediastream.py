# Copyright (c) Jupyter Development Team.
# Distributed under the terms of the Modified BSD License.

"""Test Image widget"""

import os

from ipywidgets import VideoStream, CameraStream

LOGO_MP4 = os.path.join(os.path.split(__file__)[0], 'data/jupyter.mp4')

def test_video_stream_from_url():
    v = VideoStream.from_url('https://webrtc.github.io/samples/src/video/chrome.mp4')
    assert v.format == 'url'

def test_video_stream_from_download():
    v = VideoStream.from_download('https://webrtc.github.io/samples/src/video/chrome.mp4')
    assert v.format == 'mp4'

def test_video_stream_from_file():
    v = VideoStream.from_file(LOGO_MP4)
    assert v.format == 'mp4'


def test_camera__stream_facing():
    c = CameraStream.facing_user(constraints={'video': {'width':100, 'height': 200}})
    assert c.constraints['video']['facingMode'] == 'user'
    assert c.constraints['video']['width'] == 100
    assert c.constraints['video']['height'] == 200

    c = CameraStream.facing_environment(constraints={'video': {'width':100, 'height': 200}})
    assert c.constraints['video']['facingMode'] == 'environment'
    assert c.constraints['video']['width'] == 100
    assert c.constraints['video']['height'] == 200
