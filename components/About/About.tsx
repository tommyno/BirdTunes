import React from "react";

import { Flow } from "components/Flow/Flow";

export const About: React.FC = () => {
  return (
    <Flow>
      <h2>About</h2>
      <p>
        BirdTunes lets you explore birds detected at locations around the world.
        See which species have been spotted, listen to their recordings, and
        discover the diversity of birdlife around you.
      </p>

      <p>
        Detections are made with outdoor microphones that continuously listen to
        the environment and use an AI model from{" "}
        <a
          href="https://birdnet.cornell.edu/"
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          BirdNET
        </a>{" "}
        to identify the birds.
      </p>

      <p>
        If you want to get started yourself, you can either get a pre-built
        device like the{" "}
        <a
          href="https://www.birdweather.com"
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          PUC
        </a>{" "}
        or set up a Raspberry Pi with a microphone, and install{" "}
        <a
          href="https://github.com/tphakala/birdnet-go"
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          BirdNET-Go
        </a>
        .
      </p>

      <p>
        BirdTunes is open source and available on{" "}
        <a
          href="https://github.com/tommyno/birdtunes"
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          Github
        </a>{" "}
        and uses data from the{" "}
        <a
          href="https://app.birdweather.com"
          target="_blank"
          rel="noopener noreferrer"
          className="link"
        >
          BirdWeather API
        </a>
        .
      </p>
    </Flow>
  );
};
