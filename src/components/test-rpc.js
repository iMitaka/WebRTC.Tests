import React, { Component } from 'react';
import { hasUserMedia } from '../helpers/web-rtc-helpers'

export default class TestRpc extends Component {
  constructor(props) {
    super(props)

    this.state = {
      stream: '',
      videoSrc: ''
    }
  }

  componentDidMount() {
    if (hasUserMedia()) {
      this.enableVideoAndAudioChannels()
    } else {
      alert("WebRTC is not supported");
    }
  }

  enableVideoAndAudioChannels() {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia
      || navigator.mozGetUserMedia;

    //enabling video and audio channels 
    navigator.getUserMedia({
      video: true,
      audio: true
    },
      function (stream) {
        this.setState({
          stream: stream,
          videoSrc: window.URL.createObjectURL(stream)
        })
      }.bind(this),
      function (err) {
        console.error(err)
      });
  }

  btnGetAudioTracks = () => {
    console.log("getAudioTracks");
    console.log(this.state.stream.getAudioTracks());
  }

  btnGetTrackById = () => {
    console.log("getTrackById");
    console.log(this.state.stream.getTrackById(this.state.stream.getAudioTracks()[0].id));
  };

  btnGetTracks = () => {
    console.log("getTracks()");
    console.log(this.state.stream.getTracks());
  };

  btnGetVideoTracks = () => {
    console.log("getVideoTracks()");
    console.log(this.state.stream.getVideoTracks());
  };

  btnRemoveAudioTrack = () => {
    console.log("removeAudioTrack()");
    this.state.stream.removeTrack(this.state.stream.getAudioTracks()[0]);
  };

  btnRemoveVideoTrack = () => {
    console.log("removeVideoTrack()");
    this.state.stream.removeTrack(this.state.stream.getVideoTracks()[0]);
  };

  render() {

    return (
      <div>
        <video src={this.state.videoSrc} autoPlay></video>
        <div><button onClick={this.btnGetAudioTracks}>getAudioTracks()
         </button></div>
        <div><button onClick={this.btnGetTrackById}>getTrackById()
         </button></div>
        <div><button onClick={this.btnGetTracks}>getTracks()</button></div>
        <div><button onClick={this.btnGetVideoTracks}>getVideoTracks()
         </button></div>
        <div><button onClick={this.btnRemoveAudioTrack}>removeTrack() - audio
         </button></div>
        <div><button onClick={this.btnRemoveVideoTrack}>removeTrack() - video
         </button></div>
      </div>
    );
  }
}
