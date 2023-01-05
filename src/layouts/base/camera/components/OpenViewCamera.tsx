import MDAvatar from "components/bases/MDAvatar";
import MDBox from "components/bases/MDBox";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
// @ts-ignore
import videoBackground from "assets/images/video_background.jpg";
import React, { useEffect, useRef, useState } from "react";
import {
  CAMERA_STREAM_LIST_LOCAL_STORAGE,
  RTC_CONFIGURATION,
  STRING_LONG_LENGTH_FOR_CAMERA,
  STRING_MAX_LENGTH,
  STRING_SHORT_LENGTH,
} from "../../../../constants/app";
import { getOurId } from "../../../../utils/helpers";
import { WEB_SOCKET_STREAM_URL } from "../../../../constants/api";
import ReconnectingWebSocket from "reconnecting-websocket";
import { w3cwebsocket as W3CWebSocket } from "websocket";
import convertEllipsisCharacter from "../../../../components/customizes/ConvertEllipsisCharacter";
import Canvas from "react-draw-polygons";

type Props = {
  handlePlay: (e: any) => void;
  handlePause: Function;
  children?: React.ReactElement;
  pause?: Boolean;
  cameraName?: string;
  camId: number;
  areaRestriction?: string;
  canvasRef?: any;
  defaultPolygons: string | undefined;
  canEdit: boolean;
};

function OpenViewCamera({
  handlePlay,
  handlePause,
  children,
  pause,
  cameraName,
  camId,
  areaRestriction,
  canvasRef,
  defaultPolygons,
  canEdit,
}: Props) {
  let id: any = null;
  let wsConn: any = null;
  let peerConnection: any = null;
  const ourId = getOurId();

  const [peerId, setPeerId] = useState("");
  const [videoElement, setVideoElement] = useState<any>(null);

  const resetState = () => {
    if (peerConnection) {
      peerConnection.close();
      peerConnection = null;
    }
    if (videoElement) {
      videoElement.pause();
      videoElement.src = "";
    }

    if (wsConn) {
      wsConn.close();
      wsConn = null;
    }
  };

  const handleIncomingError = (error: any) => {
    resetState();
  };

  const setStatus = (text: string) => {
    console.log(text);
  };

  const setError = (text: string) => {
    console.error(text);
    resetState();
  };

  // Local description was set, send it to peer
  const onLocalDescription = (desc: any) => {
    console.log(`Got local description: ${JSON.stringify(desc)}`);
    peerConnection
      .setLocalDescription(desc)
      .then(() => {
        setStatus("Sending SDP answer");
        const sdp = {
          type: "peer",
          sessionId: id,
          sdp: peerConnection.localDescription.toJSON(),
        };
        wsConn.send(JSON.stringify(sdp));
      })
      .catch((e: any) => {
        setError(e);
      });
  };

  const onRemoteDescriptionSet = (e: any) => {
    setStatus("Remote SDP set");
    setStatus("Got SDP offer");
    peerConnection
      .createAnswer()
      .then((event: any) => {
        onLocalDescription(event);
      })
      .catch(setError);
  };

  // SDP offer received from peer, set remote description and create an answer
  const onIncomingSDP = (sdp: any) => {
    peerConnection
      .setRemoteDescription(sdp)
      .then((event: any) => {
        onRemoteDescriptionSet(event);
      })
      .catch((e: any) => {
        setError(e);
      });
  };

  // ICE candidate received from peer, add it to the peer connection
  const onIncomingICE = (ice: any) => {
    const candidate = new RTCIceCandidate(ice);
    peerConnection.addIceCandidate(candidate).catch((e: any) => {
      setError(e);
    });
  };

  const onServerMessage = (event: any) => {
    console.log(`Received ${event.data}`);
    let msg = null;
    try {
      msg = JSON.parse(event.data);
    } catch (e) {
      handleIncomingError(`Error parsing incoming JSON: ${event.data}`);
      return;
    }

    if (msg.type === "registered") {
      setStatus("Registered with server");
      connectPeer();
    } else if (msg.type === "sessionStarted") {
      setStatus("Registered with server");
      id = msg.sessionId;
    } else if (msg.type === "error") {
      handleIncomingError(msg.details);
    } else if (msg.type === "endSession") {
      resetState();
    } else if (msg.type === "peer") {
      // Incoming peer message signals the beginning of a call
      if (!peerConnection) createCall(msg);

      if (msg.sdp != null) {
        onIncomingSDP(msg.sdp);
      } else if (msg.ice != null) {
        onIncomingICE(msg.ice);
      } else {
        handleIncomingError(`Unknown incoming JSON: ${msg}`);
      }
    }
  };

  const websocketServerConnect = () => {
    setStatus(`Connecting to Stream server`);
    wsConn = WEB_SOCKET_STREAM_URL
      ? new ReconnectingWebSocket(WEB_SOCKET_STREAM_URL, [], {
          WebSocket: W3CWebSocket,
          connectionTimeout: 1000,
          maxRetries: 100,
        })
      : null;
    if (wsConn) {
      /* When connected, immediately register with the server */
      wsConn.addEventListener("open", (event: any) => {
        setStatus("Connecting to the peer");
        connectPeer();
      });
      wsConn.addEventListener("message", (event: any) => {
        onServerMessage(event);
      });
    }
  };

  const websocketServerDisconnect = () => {
    setStatus(`Removing connect to Stream server`);
    if (wsConn) {
      wsConn.close();
    }
  };

  const connectPeer = () => {
    setStatus(`Connecting ${peerId}`);

    wsConn.send(
      JSON.stringify({
        type: "startSession",
        peerId,
      })
    );
  };

  const onRemoteStreamAdded = (event: any) => {
    const videoTracks = event.stream.getVideoTracks();
    const audioTracks = event.stream.getAudioTracks();

    if (videoTracks.length > 0) {
      console.log(
        `Incoming stream: ${videoTracks.length} video tracks and ${audioTracks.length} audio tracks`
      );
      // @ts-ignore
      videoElement.srcObject = event.stream;
      // @ts-ignore
      videoElement.play();
    } else {
      handleIncomingError("Stream with unknown tracks added, resetting");
    }
  };

  const createCall = (msg: any) => {
    console.log("Creating RTCPeerConnection");

    peerConnection = new RTCPeerConnection(RTC_CONFIGURATION);
    peerConnection.onaddstream = (event: any) => {
      onRemoteStreamAdded(event);
    };

    peerConnection.ondatachannel = (event: any) => {};

    peerConnection.onicecandidate = (event: any) => {
      if (event.candidate == null) {
        console.log("ICE Candidate was null, done");
        return;
      }
      wsConn.send(
        JSON.stringify({
          type: "peer",
          sessionId: id,
          ice: event.candidate.toJSON(),
        })
      );
    };

    setStatus("Created peer connection for call, waiting for SDP");
  };

  useEffect(() => {
    if (videoElement !== null && peerId && peerId.trim() !== "") {
      websocketServerConnect();
    }

    return () => {
      websocketServerDisconnect();
    };
  }, [peerId, videoElement]);

  useEffect(() => {
    if (!pause) {
      setVideoElement(document.getElementById(`stream-${ourId}`));
    } else {
      setVideoElement(null);
    }
  }, [pause]);

  useEffect(() => {
    // Start camera
    const streamList = localStorage.getItem(
      CAMERA_STREAM_LIST_LOCAL_STORAGE + localStorage.getItem("module")
    );
    if (streamList) {
      const json: Array<any> = JSON.parse(streamList);
      const index = json.findIndex((el) => el.camId === camId);
      if (json.length > 0 && index !== -1) {
        setPeerId(json[index].peerId);
      }
    }
  }, []);

  const ref = useRef(null);

  const [widthCameraCard, setWidthCameraCard] = useState(0);
  const [heightCameraCard, setHeightCameraCard] = useState(0);
  const [defaultPolygonsState, setDefaultPolygonsState] = useState<Array<any> | undefined>(
    undefined
  );

  const [toogle, setToogle] = useState(false);

  useEffect(() => {
    // @ts-ignore
    if (ref.current && ref.current.offsetWidth) {
      // @ts-ignore
      const width = Math.round(ref.current.offsetWidth - 12);
      // @ts-ignore
      setWidthCameraCard(width);
      // @ts-ignore
      setHeightCameraCard(Math.round((width * 9) / 16));
      setToogle(!toogle);
    }
  }, [ref]);

  useEffect(() => {
    if (defaultPolygons) {
      const polygonsJson = JSON.parse(defaultPolygons);
      const polygons = [];
      for (let i = 0; i < polygonsJson.length; i++) {
        const tmp = polygonsJson[i];
        const polygon = [];
        for (let j = 0; j < tmp.length; j++) {
          polygon.push({
            x: Math.round((tmp[j][0] * widthCameraCard) / 1280),
            y: Math.round((tmp[j][1] * heightCameraCard) / 720),
          });
        }
        polygons.push({
          polygon,
        });
      }
      if (polygons !== defaultPolygonsState) {
        setDefaultPolygonsState(polygons);
      }
    }
  }, [toogle]);

  return (
    <MDBox ref={ref}>
      {children}
      <MDBox
        style={{
          width: "100%",
          aspectRatio: "16/9",
          cursor: "pointer",
          position: "relative",
          borderRadius: "10px",
          boxShadow:
            "0rem 0.25rem 0.375rem -0.0625rem rgb(0 0 0 / 10%), 0rem 0.125rem 0.25rem -0.0625rem rgb(0 0 0 / 6%)",
          // border: "1px solid rgb(0 0 0 / 25%)",
          background: "rgb(0 0 0 / 25%)",
          marginBottom: "5px",
        }}
        onClick={handlePause}
      >
        <MDBox>
          <MDBox style={{ position: "relative", width: "100%", aspectRatio: "16/9" }}>
            {pause ? (
              <>
                <MDAvatar
                  src={videoBackground}
                  alt=""
                  style={{ borderRadius: "10px", width: "100%", height: "100%" }}
                />
                <PlayCircleOutlineIcon
                  style={{
                    position: "absolute",
                    top: "40%",
                    left: "40%",
                    width: "20%",
                    height: "20%",
                    color: "white",
                  }}
                  onClick={handlePlay}
                />
              </>
            ) : (
              <>
                <video
                  preload="none"
                  className="stream"
                  id={`stream-${ourId}`}
                  muted
                  width="100%"
                  style={{ aspectRatio: "16/9" }}
                />

                {defaultPolygonsState !== undefined && (
                  <MDBox
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      bottom: 0,
                      right: 0,
                    }}
                  >
                    <Canvas
                      ref={canvasRef}
                      canvasHeight={heightCameraCard}
                      canvasWidth={widthCameraCard}
                      // @ts-ignore
                      defaultPolygons={defaultPolygonsState}
                      canEdit={canEdit}
                    />
                  </MDBox>
                )}
              </>
            )}
            <MDBox
              style={{
                position: "absolute",
                bottom: "13px",
                left: "15px",
                fontWeight: "500",
                color: "#000000de",
                fontSize: "20px",
                zIndex: 1000,
                lineHeight: "80%",
              }}
            >
              {/* @ts-ignore */}
              {convertEllipsisCharacter(
                // @ts-ignore
                cameraName,
                canEdit ? STRING_MAX_LENGTH : STRING_LONG_LENGTH_FOR_CAMERA
              )}
            </MDBox>
            <MDBox
              style={{
                position: "absolute",
                bottom: "13px",
                right: "15px",
                fontWeight: "500",
                color: "#000000de",
                fontSize: "20px",
                zIndex: 1000,
                lineHeight: "80%",
              }}
            >
              {/* @ts-ignore */}
              {convertEllipsisCharacter(
                // @ts-ignore
                areaRestriction,
                canEdit ? STRING_MAX_LENGTH : STRING_SHORT_LENGTH
              )}
            </MDBox>
          </MDBox>
        </MDBox>
      </MDBox>
    </MDBox>
  );
}

OpenViewCamera.defaultProps = {
  children: <div />,
  // eslint-disable-next-line react/default-props-match-prop-types
  handleClose: () => {},
};

export default OpenViewCamera;
