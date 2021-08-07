import React from 'react'
import { useHistory, useParams } from 'react-router-dom'
import { Helmet } from 'react-helmet';
import { Title } from '../components/Title'
import { Card } from '../components/Card'
import { useMovie } from '../hooks/useMovie'
import { VideoElement } from '../components/VideoElement'
import { EpisodeSelector } from '../components/EpisodeSelector'
import { getStreamUrl } from '../lib/index'
import { useProgressStore } from '../hooks/useProgressStore'

import './Movie.css'

export function MovieView(props) {
    const history = useHistory();
    const params = useParams();
    const progress = useProgressStore();

    const { streamUrl, streamData, setStreamUrl } = useMovie();
    const [ seasonList, setSeasonList ] = React.useState([]);
    const [ episodeLists, setEpisodeList ] = React.useState([]);
    const [ loading, setLoading ] = React.useState(false);
    const [ selectedSeason, setSelectedSeason ] = React.useState("1");
    const [ startTime, setStartTime ] = React.useState(0);

    const season = params.season || "1";
    const episode = params.episode || "1";

    function setEpisode({ season, episode }) {
        history.push(`/season/${season}/episode/${episode}`);
    }

    // if source has episodes/seasons but none provided in url
    // redirect to first episode
    React.useEffect(() => {
        if (streamData.type === "show" && !params.season) history.push(`/season/1/episode/1`);
    }, [streamData.type]);

    // get stream url for shows
    React.useEffect(() => {
        let cancel = false;

        if (streamData.type !== "show") return () => {
            cancel = true;
        };

        if (!episode) {
            setLoading(false);
            setStreamUrl('');
            return;
        }

        setLoading(true);

        getStreamUrl(streamData.slug, streamData.type, streamData.source, season, episode)
            .then(({url}) => {
                if (cancel) return;
                setStreamUrl(url)
                setLoading(false);
            })
            .catch((e) => {
                if (cancel) return;
                console.error(e)
            })

        return () => {
            cancel = true;
        } 
    }, [episode, streamData, setStreamUrl, season]);

    // when streamData changes, change selected episode
    React.useEffect(() => {
        if (streamData.type === "show") {
            setSeasonList(streamData.seasons);
            setEpisodeList(streamData.episodes[selectedSeason]);
        }
    }, [streamData.seasons, streamData.episodes, streamData.type, selectedSeason])

    // when streamurl get updated, get new startTime
    React.useEffect(() => {
        let ls = JSON.parse(localStorage.getItem("video-progress") || "{}")
        let key = streamData.type === "show" ? `${season}-${episode}` : "full"
        let time = ls?.[streamData.source]?.[streamData.type]?.[streamData.slug]?.[key]?.currentlyAt;
        setStartTime(time);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [streamUrl]);

    const setProgress = (evt) => {
        progress.setEpisodeProgress({ currentTime: evt.currentTarget.currentTime, duration: evt.currentTarget.duration }, streamData, { season, episode })
    }

    return (
        <div className={`cardView showType-${streamData.type}`}>
            <Helmet>
                <title>{streamData.title}{streamData.type === 'show' ? ` | S${season}E${episode}` : ''} | movie-web</title>
            </Helmet>

            <Card fullWidth>
                <Title accent="Return to home" accentLink="search">
                    {streamData.title}
                </Title>
                {streamData.type === "show" ? <Title size="small">
                    Season {season}: Episode {episode}
                </Title> : undefined}

                <VideoElement streamUrl={streamUrl} loading={loading} setProgress={setProgress} startTime={startTime} />

                {streamData.type === "show" ? 
                    <EpisodeSelector
                        setSelectedSeason={setSelectedSeason}
                        selectedSeason={selectedSeason}

                        setEpisode={setEpisode}

                        seasons={seasonList}
                        episodes={episodeLists}

                        currentSeason={season}
                        currentEpisode={episode}

                        streamData={streamData}
                    />
                : ''}
            </Card>
        </div>
    )
}
