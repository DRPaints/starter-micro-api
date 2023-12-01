const play = require('play-dl')
// const fs = require('fs');
// const ytdl = require('ytdl-core');
// const ytsr = require('ytsr');

async function searchQuery(query) {
    let tries = 0
    let info = null
    let url = null

    do {
        try {
            tries++

            //PLAY-DL **************************************************************************************************************************************************************************************************************************************
            play.setToken({
                youtube: {
                    cookie: "VISITOR_INFO1_LIVE=yQPAUYXihMk; VISITOR_PRIVACY_METADATA=CgJCUhICGgA%3D; _gcl_au=1.1.949825401.1695830424; __Secure-3PSID=cQjVa0gTA6xCBsSImBvFQ4s6j9rg8xfkl8yEpDI4TG6SCP_XChNe4ko5eIJfXeljOFziSg.; __Secure-3PAPISID=h_WGcNSVqRYghQic/Aqj9teJKY0J7Z4mTJ; YSC=GS5ZI_X-o4A; PREF=f6=40000000&tz=America.Sao_Paulo&f7=100&f5=30000&autoplay=true&volume=23&hl=en&gl=CA; __Secure-1PSIDTS=sidts-CjIBNiGH7hqTSKUyilCyLdZTqHMlzLkQG4kVSQ93jOyytzAuFAF5N5FDu9X-uU2Xw5LpeBAA; __Secure-3PSIDTS=sidts-CjIBNiGH7hqTSKUyilCyLdZTqHMlzLkQG4kVSQ93jOyytzAuFAF5N5FDu9X-uU2Xw5LpeBAA; LOGIN_INFO=AFmmF2swRgIhANk8s_EuKfcxJ65VyVzaUbJEpsIJGcLAV7iXbzF8098QAiEA6696eYwvQIaLFDiN72nLoMMV73N0hACNOa3lF2X0dUI:QUQ3MjNmd1VSZXpUclVoRk45MDVPVDQzTF9XcVZPbExWOU1RQUI3WHF4dkkzQzVIQXRMTkJheVQ3NHVTM1FhRGt6UUtxVU8tOHgtYUFTYWpHOEl3dXVGYkhFd2tCOUhSdXNRaTRjVEFBR2ItT0pUS0xTWGVlczhETGhYY2lYRWtaWUhaUTl6R2JVTm1PNG9PRFZWRGFCUnd0elVYd3J0ZDJZRng3bWQzUGlvejZSX2Z5Y2VJajV1YURfTWd1aGwtQmdhNXlGNjhuYnNEZURhbmtPT3NNaGh6NjdDSEczM3Fzdw==; __Secure-3PSIDCC=ACA-OxP3BYpDkjAnM97BHo5Gpbkq5RzgR-T5mM42SfeE8WHx8XcaiJjl-MC_WnBV_n1nIsUTjw"
                }
            })

            if (query.includes('youtube.com') || query.includes('youtu.be')) {
                url = query
            } else {
                let ytInfo = await play.search(query, {
                    limit: 1
                })

                if (ytInfo.length > 0) {
                    url = ytInfo[0].url
                }
            }

            if (url) {
                info = await play.video_basic_info(url)
            }

            return { url: url, info: info }

            //YTDL-CORE *************************************************************************************************************************************************************************************************************************************
            // let ytsrInfo = await ytsr(query, { limit: 1 })

            // if (ytsrInfo.items) {
            //     ytsrInfo = ytsrInfo.items[0]
            //     let ytdlInfo = await ytdl.getInfo(ytsrInfo.url)

            //     var durationInSec = ytsrInfo.duration.split(':').reduce((acc, time) => (60 * acc) + +time);

            //     if (ytsrInfo) {
            //         info = {
            //             video_details: {
            //                 id: ytsrInfo.id,
            //                 title: ytsrInfo.title,
            //                 durationInSec: durationInSec,
            //                 durationRaw: ytsrInfo.duration,
            //             },
            //             related_videos: ytdlInfo.related_videos,
            //             formats: ytdlInfo.formats
            //         }
            //     }

            //     return { url: ytsrInfo.url, info: info }
            // }
        } catch (error) {
            console.log(error)
        }
    } while (!info && tries <= 3);
}

module.exports = { searchQuery }