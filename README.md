# Fuglesang 🐦‍⬛

This is an experimental project to discover and track the birds in our garden. It uses a Raspberry Pi to listen and AI-powered bird sound recognition from [BirdNet Sound ID](https://birdnet.cornell.edu/).

## Demo

https://fuglesang.vercel.app

Add ?station=xxxx to use your own Bordweather statiom. 

## Current setup

A Raspberry Pi 5 and an outdoors microphone to listen to the enviroment, and AI-powered bird sound recognition from [BirdNet Sound ID](https://birdnet.cornell.edu/). The data is handled by [BirdNET-PI](https://github.com/Nachtzuster/BirdNET-Pi) and uploaded to [Birdweather](https://app.birdweather.com/) for additional verification.

This repo / website pulls together all the data and presents it in a nice and orderly fashion.

## Development

Made with Next. Install dependencies with `npm install` and run `npm run dev`.

Update `constants/birdweather.ts` if you want to change the default station.

## Planned updates

- ✅ Support other stations (?station=xxxx)
- Support multiple languages (?lang=en)
- Full screen bird-view, with additional data
- Show and play recorded bird samples
- Filter: Search
- Filter: Today / Last 24 hours
- Filter: Sort by newest detected species (firstDetectedAt)
- Replace current [V1 REST API](https://app.birdweather.com/api/v1]:) with new [GraphQL API](https://app.birdweather.com/api/index.html)?

Feel free to add suggestions, pull requests or fork this repo and customize it to your own needs.
