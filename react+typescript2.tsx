import { useContext, useEffect, useRef, useState } from "react";

import videojs, { VideoJsPlayer, VideoJsPlayerOptions } from "video.js";
import "videojs-flash";
import "video.js/dist/video-js.css";
import '@videojs/themes/dist/fantasy/index.css';
import "videojs-seek-buttons"

import RedactEditorContext from "../../context/RedactEditorContext";
import { RedactEditorState } from "../../context/RedactEditorContext/types";
import "./videoPlayer.scss"

interface IProps {
  download: () => void
}

const VideoPlayer = ({ download }: IProps) => {

  const { videoUrl, thumbnailUrl, originalFileExtension, setVideoPlayer } = useContext<RedactEditorState>(RedactEditorContext)

  const videoOptions: VideoJsPlayerOptions = {
    muted: true,
    autoplay: true,
    controls: true,
    preload: "auto",
    controlBar: {
      fullscreenToggle: false,
      pictureInPictureToggle: false,
    },
    responsive: true,
    fluid: false,
    height: 500,
    playbackRates: [0.1, 0.5, 1, 2, 5],
    sources: [
      {
        src: videoUrl,
        type: `video/${originalFileExtension}`,
      }
    ],
    techOrder: ['html5', 'flash'],
    plugins: {
      seekButtons: {
        forward: 1,
        back: 1
      }
    }
  }

  /*Video JS */
  const playerRef = useRef<VideoJsPlayer>();
  const videoRef = useRef<HTMLVideoElement>();

  const [firstPlay, setFirstPlay] = useState<boolean>(false);
  const firstPlayRef = useRef<boolean>(false);
  useEffect(() => {
    firstPlayRef.current = firstPlay;
  }, [firstPlay])

  useEffect(() => {
    let player;
    // make sure Video.js player is only initialized once
    if (videoUrl && videoUrl.length > 0) {
      if (!playerRef.current) {
        const videoElement = videoRef.current;

        if (!videoElement) {
          return;
        }

        player = playerRef.current = videojs(videoElement, videoOptions, () => {
          handlePlayerReady(player);
        });
      } else {
        // you can update player here [update player through props]
        setFirstPlay(false);
        player = playerRef.current;
        player.src(videoOptions.sources);
      }
    }
  }, [videoUrl]);

  // Dispose the Video.js player when the functional component unmounts
  useEffect(() => {
    
    return () => {
      if (playerRef.current) {
        playerRef.current.dispose();
        playerRef.current = null;
      }
    };
  }, []);

  const handlePlayerReady = (player: VideoJsPlayer) => {
    playerRef.current = player;
    if (thumbnailUrl) {
      player.poster(thumbnailUrl);
    }

    player.on('play', () => {
      //this is to start the player without the need for user interaction. it requires autoplay and mute to be true to work properly
      if (!firstPlayRef.current) {
        setFirstPlay(true);
        firstPlayRef.current = true;
        playerRef.current.muted(false);
        playerRef.current.pause();
        playerRef.current.currentTime(0);
      }
    });

    setVideoPlayer(player, videoRef.current);
    player.on("dispose", () => {
      setVideoPlayer(undefined, undefined);
    });

    //add download button
    const downloadButton = playerRef.current.controlBar.addChild("button", {}, playerRef.current.controlBar.children().length);
    const downloadElement = downloadButton.el();
    downloadElement.innerHTML = "<span class='video-download' title='Download'>&#10515;</span><span class='vjs-control-text' aria-live='polite'>Download</span>";
    (downloadElement as HTMLElement).onclick = download;
  };

  return (
    <div data-vjs-player>
      <video
        ref={videoRef}
        className="video-js vjs-big-play-centered vjs-theme-fantasy"
        crossOrigin="anonymous"
      />
    </div>
  );
};

export default VideoPlayer;
