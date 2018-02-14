export function hasUserMedia() { 
    //check if the browser supports the WebRTC 
    return !!(navigator.getUserMedia || navigator.webkitGetUserMedia || 
       navigator.mozGetUserMedia); 
 } 