import React, { Component } from 'react';

const serverUrl = 'ws://localhost:9090'

export default class TestConnection extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loggedUser: '',
            isLogged: false,
            name: '',
            connectedUser: '',
            conn: {},
            yourConn: {},
            callToUsernameInput: '',
            localVideoSrc: '',
            remoteVideoSrc: ''
        }

        this.handleInputChange = this.handleInputChange.bind(this);
        this.loginBtn = this.loginBtn.bind(this)
        this.handleLogin = this.handleLogin.bind(this)
        this.send = this.send.bind(this)
        this.callBtn = this.callBtn.bind(this)
        this.handleOffer = this.handleOffer.bind(this)
        this.handleAnswer = this.handleAnswer.bind(this)
        this.hangUpBtn = this.hangUpBtn.bind(this)
        this.handleCandidate = this.handleCandidate.bind(this)
        this.hangUpBtn = this.hangUpBtn.bind(this)
        this.handleLeave = this.handleLeave.bind(this)
    }

    componentDidMount() {
        var conn = new WebSocket(serverUrl);
        conn.onopen = function () {
            console.log("Connected to the signaling server");
            this.setState({
                conn: conn
            })
        }.bind(this);

        //when we got a message from a signaling server 
        conn.onmessage = function (msg) {
            console.log("Got message", msg.data);
            if (msg.data === 'Hello world') {
                return
            }

            var data = JSON.parse(msg.data);

            switch (data.type) {
                case "login":
                    this.handleLogin(data.success);
                    break;
                //when somebody wants to call us 
                case "offer":
                    this.handleOffer(data.offer, data.name);
                    break;
                case "answer":
                    this.handleAnswer(data.answer);
                    break;
                //when a remote peer sends an ice candidate to us 
                case "candidate":
                    this.handleCandidate(data.candidate);
                    break;
                case "leave":
                    this.handleLeave();
                    break;
                default:
                    break;
            }
        }.bind(this);

        conn.onerror = function (err) {
            console.log("Got error", err);
        };
    }

    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ? target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }

    loginBtn() {
        if (this.state.name.length > 0) {
            this.send({
                type: "login",
                name: this.state.name
            });
        }
    }

    callBtn() {
        if (this.state.callToUsernameInput.length > 0) {

            this.setState({
                connectedUser: this.state.callToUsernameInput
            })

            // create an offer
            this.state.yourConn.createOffer(function (offer) {
                this.send({
                    type: "offer",
                    offer: offer
                });

                this.state.yourConn.setLocalDescription(offer);

            }.bind(this), function (error) {
                alert("Error when creating an offer");
            });
        }
    }

    hangUpBtn() {
        this.send({
            type: "leave"
        });

        this.handleLeave();
        this.forceUpdate()
    }

    handleLeave() {
        this.setState({
            connectedUser: null,
            remoteVideoSrc: null,

        })

        this.state.yourConn.close();
        this.state.yourConn.onicecandidate = null;
        this.state.yourConn.onaddstream = null;
    };

    handleOffer(offer, name) {
        this.setState({
            connectedUser: name
        })

        this.state.yourConn.setRemoteDescription(new RTCSessionDescription(offer));

        //create an answer to an offer 
        this.state.yourConn.createAnswer(function (answer) {
            this.state.yourConn.setLocalDescription(answer);

            this.send({
                type: "answer",
                answer: answer
            });

        }.bind(this), function (error) {
            alert("Error when creating an answer");
        });
    };

    handleAnswer(answer) {
        this.state.yourConn.setRemoteDescription(new RTCSessionDescription(answer));
    };

    handleCandidate(candidate) {
        this.state.yourConn.addIceCandidate(new RTCIceCandidate(candidate));
    };

    handleLogin(success) {
        if (success === false) {
            alert("Ooops...try a different username");
        } else {
            this.setState({
                isLogged: true,
            })

            //********************** 
            //Starting a peer connection 
            //********************** 

            //getting local video stream 
            if (navigator.userAgent.toLowerCase().indexOf('firefox') > -1) {
                navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                    .then((myStream) => {
                        let stream = myStream;
                        //displaying local video stream on the page 
                        this.setState({
                            localVideoSrc: window.URL.createObjectURL(stream)
                        })

                        //using Google public stun server 
                        var configuration = {
                            "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
                        };

                        let yourConn = new RTCPeerConnection(configuration);

                        // setup stream listening 
                        yourConn.addStream(stream);

                        //when a remote user adds stream to the peer connection, we display it 

                        yourConn.onaddstream = function (e) {
                            this.setState({
                                remoteVideoSrc: window.URL.createObjectURL(e.stream)
                            })

                        }.bind(this);

                        // Setup ice handling 
                        yourConn.onicecandidate = function (event) {
                            if (event.candidate) {
                                this.send({
                                    type: "candidate",
                                    candidate: event.candidate
                                });
                            }
                        }.bind(this);

                        this.setState({
                            yourConn: yourConn
                        })

                    })
                    .catch((err) => {
                        console.log(err);
                    });
            } else {
                navigator.webkitGetUserMedia({ video: true, audio: true }, function (myStream) {
                    let stream = myStream;

                    //displaying local video stream on the page 
                    this.setState({
                        localVideoSrc: window.URL.createObjectURL(stream)
                    })

                    //using Google public stun server 
                    var configuration = {
                        "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
                    };

                    let yourConn = new RTCPeerConnection(configuration);

                    // setup stream listening 
                    yourConn.addStream(stream);

                    //when a remote user adds stream to the peer connection, we display it 

                    yourConn.onaddstream = function (e) {
                        this.setState({
                            remoteVideoSrc: window.URL.createObjectURL(e.stream)
                        })
                    }.bind(this);

                    // Setup ice handling 
                    yourConn.onicecandidate = function (event) {
                        if (event.candidate) {
                            this.send({
                                type: "candidate",
                                candidate: event.candidate
                            });
                        }
                    }.bind(this);

                    this.setState({
                        yourConn: yourConn
                    })

                }.bind(this), function (error) {
                    console.log(error);
                });
            }
        }
    };

    //alias for sending JSON encoded messages 
    send(message) {
        //attach the other peer username to our messages 
        if (this.state.connectedUser) {
            message.name = this.state.connectedUser;
        }
        this.state.conn.send(JSON.stringify(message));
    };

    render() {
        let content;
        if (this.state.isLogged) {
            content = (
                <div id="callPage" className="call-page">
                    <video id="localVideo" src={this.state.localVideoSrc} autoPlay></video>
                    <video id="remoteVideo" src={this.state.remoteVideoSrc} autoPlay></video>

                    <div className="row text-center">
                        <div className="col-md-12">
                            <input type="text" id="usernameInput" name="callToUsernameInput" value={this.state.callToUsernameInput}
                                className="form-control formgroup" placeholder="Login"
                                required={true} autoFocus={true} onChange={this.handleInputChange} />
                            <button id="callBtn" className="btn-success btn" onClick={this.callBtn}>Call</button>
                            <button id="hangUpBtn" className="btn-danger btn" onClick={this.hangUpBtn}>Hang Up</button>
                        </div>
                    </div>
                </div>
            )
        } else {
            content = (
                <div id="loginPage" className="container text-center">
                    <div className="row">
                        <div className="col-md-4 col-md-offset-4">
                            <h2>WebRTC Video Demo. Please sign in</h2>
                            <label htmlFor="usernameInput" className="sr-only">Login</label>
                            <input type="text" id="name" name="name" value={this.state.name}
                                className="form-control formgroup" placeholder="Login"
                                required={true} autoFocus={true} onChange={this.handleInputChange} />
                            <button id="loginBtn" onClick={this.loginBtn} className="btn btn-lg btn-primary btnblock">
                                Sign in</button>
                        </div>
                    </div>
                </div>
            )
        }

        return (
            <div>
                {content}
            </div>
        );
    }
}
