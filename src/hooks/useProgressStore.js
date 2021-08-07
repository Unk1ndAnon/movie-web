import React from "react";

// simple migration system
const currentVersion = 1;
const updateMap = {
    "0": {
        update(data) {
            data["--version"] = 1;
            return data;
        }
    }
}

export function useProgressStore() {
    const [ progress, setProgress ] = React.useState(null);

    // save if progress gets updated
    React.useEffect(() => {
        if (progress)
            localStorage.setItem("video-progress", JSON.stringify(progress));
    }, [progress]);

    // load new data on load (update if applicable)
    React.useEffect(() => {
        let data = null;

        try {
            data = JSON.parse(localStorage.getItem("video-progress") || "{}")
            console.log(data);
            if (!data)
                throw new Error("Invalid type of localstorage")
        } catch (err) {
            console.error("Failed to parse store, resetting", err);
            data = {};
        }
        
        while (data["--version"] !== currentVersion) {
            let version = data["--version"] || "0";
            if (version && version.constructor === Number) version = version.toString();
            if (!updateMap[version]) {
                console.error("Invalid version on data, resetting");
                data = {};
                continue;
            }
            data = updateMap[version].update(data);
        }
        setProgress(data);
    }, [])

    // progressData: { currentTime: number, duration: number }
    // streamData: { source: string, type: string, slug: string, type: "show" | string }
    // episodeData: { season: string, episode: string }
    function setEpisodeProgress({ currentTime, duration }, streamData, episodeData = { season: "1", episode: "1" }) {
        setProgress((d) => {
            const data = JSON.parse(JSON.stringify(d)); // deep copy

            // Make sure path exists
            if (!data[streamData.source])
                data[streamData.source] = {}
            if (!data[streamData.source][streamData.type])
                data[streamData.source][streamData.type] = {}
            if (!data[streamData.source][streamData.type][streamData.slug])
                data[streamData.source][streamData.type][streamData.slug] = {}

            // save data
            const key = streamData.type === "show" ? `${episodeData.season}-${episodeData.episode}` : "full"
            data[streamData.source][streamData.type][streamData.slug][key] = {
                currentlyAt: Math.floor(currentTime),
                totalDuration: Math.floor(duration),
                updatedAt: Date.now(),
                meta: streamData,
            }
            if(streamData.type === "show") {
                data[streamData.source][streamData.type][streamData.slug][key].show = {
                    season: episodeData.season,
                    episode: episodeData.episode,
                }
            }

            return data;
        })
    }


    return {
        setEpisodeProgress,
        progress,
    }
}
